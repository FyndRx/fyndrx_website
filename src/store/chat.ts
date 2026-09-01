import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { chatService } from '@/services/chatService';
import { useAuthStore } from '@/store/auth';
import { useSettingsStore } from '@/store/settings';
import type { ChatConversation, ChatConversationListMeta, ChatMessage } from '@/types/chat';

const TITLE_MAX = 60;

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore();
  const settingsStore = useSettingsStore();

  // App.vue's own onMounted fetches this, but a child route/component can
  // mount (and call a chat action) before that resolves, so anything that
  // might create a conversation needs to make sure the flag is real first.
  const ensureSettingsLoaded = async () => {
    if (!settingsStore.isLoaded) {
      await settingsStore.fetchSettings();
    }
  };

  const isOpen = ref(false);
  const hasBeenOpened = ref(false);
  const conversation = ref<ChatConversation | null>(null);
  const messages = ref<ChatMessage[]>([]);
  const sending = ref(false);
  const streamingToolName = ref<string | null>(null);
  const initializing = ref(false);
  const error = ref<string | null>(null);
  const retryAfter = ref<number | null>(null);
  let streamAbortController: AbortController | null = null;

  // History sidebar (authenticated only — guests only ever have one thread).
  const conversations = ref<ChatConversation[]>([]);
  const conversationsMeta = ref<ChatConversationListMeta | null>(null);
  const conversationsLoading = ref(false);

  const hasMoreConversations = computed(
    () => !!conversationsMeta.value && conversationsMeta.value.current_page < conversationsMeta.value.last_page
  );

  // Switching conversations (or logging out) while a reply is mid-stream would
  // otherwise keep appending deltas into a thread the user has since left.
  const abortActiveStream = () => {
    streamAbortController?.abort();
    streamAbortController = null;
  };

  const reset = () => {
    abortActiveStream();
    conversation.value = null;
    messages.value = [];
    error.value = null;
    conversations.value = [];
    conversationsMeta.value = null;
  };

  // A conversation started as a guest can't carry over once the user signs
  // in (it's scoped to the old tier/session), so start fresh on auth change.
  watch(() => authStore.isAuthenticated, () => {
    reset();
  });

  // The backend is the source of truth for which conversation is "current" —
  // guest lookups are keyed by session_id (idempotent firstOrCreate server-side)
  // and authenticated lookups resume the user's most recently active thread.
  // Nothing about the conversation itself is cached client-side.
  const initConversation = async () => {
    if (conversation.value || initializing.value) return;
    await ensureSettingsLoaded();

    initializing.value = true;
    error.value = null;
    try {
      // Reading an existing conversation still works even with AI chat
      // toggled off backend-side — only creating a new one is blocked there.
      let summary: ChatConversation | null = authStore.isAuthenticated
        ? await chatService.getLatestConversation()
        : null;

      if (!summary) {
        if (!settingsStore.aiChatEnabled) return;
        summary = await chatService.createConversation(authStore.isAuthenticated);
      }

      const conv = await chatService.getConversation(summary.id, authStore.isAuthenticated);
      conversation.value = conv;
      messages.value = conv.messages || [];
    } catch (err: any) {
      error.value = err?.message || "Fynda couldn't start a chat right now.";
    } finally {
      initializing.value = false;
    }
  };

  const open = async () => {
    isOpen.value = true;
    hasBeenOpened.value = true;
    await initConversation();
  };

  const close = () => {
    isOpen.value = false;
  };

  const toggle = () => {
    if (isOpen.value) {
      close();
    } else {
      open();
    }
  };

  // Authenticated only — the sidebar/history list on the dedicated chat page.
  const loadConversations = async (page = 1) => {
    if (!authStore.isAuthenticated || conversationsLoading.value) return;
    conversationsLoading.value = true;
    try {
      const res = await chatService.listConversations(page);
      conversations.value = page === 1 ? res.data : [...conversations.value, ...res.data];
      conversationsMeta.value = res.meta;
    } catch {
      // The history list is supplementary — don't block the active thread over it.
    } finally {
      conversationsLoading.value = false;
    }
  };

  const loadMoreConversations = async () => {
    if (!hasMoreConversations.value) return;
    await loadConversations((conversationsMeta.value?.current_page ?? 1) + 1);
  };

  const selectConversation = async (id: string) => {
    if (conversation.value?.id === id || initializing.value) return;
    abortActiveStream();
    initializing.value = true;
    error.value = null;
    try {
      const conv = await chatService.getConversation(id, true);
      conversation.value = conv;
      messages.value = conv.messages || [];
    } catch (err: any) {
      error.value = err?.message || "Fynda couldn't load that conversation.";
    } finally {
      initializing.value = false;
    }
  };

  // Authenticated: always a genuinely new, empty conversation — the old one
  // stays reachable in the history list. Guest: there's no such thing as a
  // second conversation for the same session_id, so this adopts a fresh one —
  // the old guest thread still exists, it's just no longer reachable.
  // Every "New chat" button in the UI is already hidden via aiChatEnabled, so
  // reaching this guard means only the settings-load race caught it — not a
  // real click — hence no error.value here (the empty state already explains it).
  const startNewConversation = async () => {
    if (initializing.value) return;
    await ensureSettingsLoaded();
    if (!settingsStore.aiChatEnabled) return;

    abortActiveStream();
    initializing.value = true;
    error.value = null;
    try {
      if (authStore.isAuthenticated) {
        const conv = await chatService.createConversation(true);
        conversation.value = conv;
        messages.value = [];
        conversations.value = [conv, ...conversations.value];
      } else {
        chatService.resetSessionId();
        const conv = await chatService.createConversation(false);
        conversation.value = conv;
        messages.value = [];
      }
    } catch (err: any) {
      error.value = err?.message || "Fynda couldn't start a new chat right now.";
    } finally {
      initializing.value = false;
    }
  };

  // The send-message response doesn't include the conversation's updated
  // title/last_message_at, so mirror the backend's own title-from-first-message
  // logic locally and re-sort the sidebar entry to the top.
  const bumpConversationInList = (text: string) => {
    if (!conversation.value) return;
    if (!conversation.value.title) {
      conversation.value.title = text.length > TITLE_MAX ? `${text.slice(0, TITLE_MAX - 3)}...` : text;
    }
    conversation.value.last_message_at = new Date().toISOString();

    const activeId = conversation.value.id;
    const snapshot: ChatConversation = { ...conversation.value, messages: undefined };
    conversations.value = [snapshot, ...conversations.value.filter((c) => c.id !== activeId)];
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending.value) return;

    error.value = null;
    retryAfter.value = null;

    if (!conversation.value) {
      await initConversation();
      if (!conversation.value) return;
    }
    const conversationId = conversation.value.id;

    const optimisticMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      content: trimmed,
      suggestions: null,
      created_at: new Date().toISOString(),
    };
    messages.value.push(optimisticMessage);

    // A live placeholder that fills in as text_delta frames arrive, then gets
    // swapped for the real persisted message on message_complete.
    const placeholderId = `streaming-${Date.now()}`;
    messages.value.push({
      id: placeholderId,
      role: 'assistant',
      content: '',
      suggestions: null,
      created_at: new Date().toISOString(),
    });

    sending.value = true;
    streamingToolName.value = null;
    const controller = new AbortController();
    streamAbortController = controller;

    const dropPlaceholderIfEmpty = () => {
      const idx = messages.value.findIndex((m) => m.id === placeholderId);
      if (idx !== -1 && !messages.value[idx].content) {
        messages.value.splice(idx, 1);
      }
    };

    try {
      await chatService.sendMessageStream(
        conversationId,
        trimmed,
        authStore.isAuthenticated,
        {
          onDelta: (delta) => {
            streamingToolName.value = null;
            const msg = messages.value.find((m) => m.id === placeholderId);
            if (msg) msg.content = (msg.content ?? '') + delta;
          },
          onToolCall: (toolName) => {
            streamingToolName.value = toolName;
          },
          onComplete: (finalMessage) => {
            const idx = messages.value.findIndex((m) => m.id === placeholderId);
            if (idx !== -1) messages.value.splice(idx, 1, finalMessage);
            if (authStore.isAuthenticated) {
              bumpConversationInList(trimmed);
            }
          },
        },
        controller.signal
      );
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // User hit "stop" — keep whatever text streamed in as-is; only drop
        // the placeholder if generation was stopped before anything arrived.
        dropPlaceholderIfEmpty();
      } else if (err?.status === 429) {
        error.value = err?.message || 'Too many messages — Fynda needs a short breather.';
        retryAfter.value = Number(err?.data?.retry_after) || null;
        dropPlaceholderIfEmpty();
      } else {
        error.value = err?.message || "Fynda couldn't reply — please try again.";
        dropPlaceholderIfEmpty();
      }
    } finally {
      sending.value = false;
      streamingToolName.value = null;
      streamAbortController = null;
    }
  };

  const stopStreaming = () => {
    abortActiveStream();
  };

  return {
    isOpen,
    hasBeenOpened,
    conversation,
    messages,
    sending,
    streamingToolName,
    initializing,
    error,
    retryAfter,
    conversations,
    conversationsMeta,
    conversationsLoading,
    hasMoreConversations,
    open,
    close,
    toggle,
    sendMessage,
    stopStreaming,
    reset,
    initConversation,
    loadConversations,
    loadMoreConversations,
    selectConversation,
    startNewConversation,
  };
});
