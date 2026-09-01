<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';
import { useChatStore } from '@/store/chat';
import { useSettingsStore } from '@/store/settings';
import ChatSuggestionCard from './ChatSuggestionCard.vue';
import { renderChatMarkdown } from '@/utils/chatMarkdown';
import { sanitizeHtml } from '@/utils/sanitize';

const props = defineProps<{ large?: boolean }>();

const chatStore = useChatStore();
const settingsStore = useSettingsStore();

const draft = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const scrollRef = ref<HTMLElement | null>(null);

const MAX_LEN = 4000;
const NEAR_LIMIT = 3600;
const MAX_TEXTAREA_HEIGHT = 160;

const avatarBox = computed(() => (props.large ? 'w-9 h-9' : 'w-8 h-8'));
const avatarIcon = computed(() => (props.large ? 'w-5 h-5' : 'w-4 h-4'));
const bubbleText = computed(() => (props.large ? 'text-[15px]' : 'text-sm'));
const bubbleMaxWidth = computed(() => (props.large ? 'max-w-[75%]' : 'max-w-[85%]'));

const charCount = computed(() => draft.value.length);
const nearLimit = computed(() => charCount.value >= NEAR_LIMIT);
const canSend = computed(
  () => draft.value.trim().length > 0 && charCount.value <= MAX_LEN && !chatStore.sending
);

const QUICK_PROMPTS = [
  'Find the cheapest paracetamol near me',
  'Is amoxicillin available without a prescription?',
  'What pharmacies are open right now?',
  'Help me track my last order',
];

const TOOL_LABELS: Record<string, string> = {
  search_platform_content: 'Searching FyndRx articles…',
  search_products: 'Searching products…',
  check_availability: 'Checking availability…',
  suggest_otc_category: 'Finding OTC options…',
  get_profile: 'Checking your profile…',
  get_order_history: 'Checking your orders…',
  get_active_prescriptions: 'Checking your prescriptions…',
  get_consultations: 'Checking your consultations…',
  propose_cart_item: 'Preparing a suggestion…',
};
const toolLabel = (name: string) => TOOL_LABELS[name] ?? 'Working on it…';

// The in-progress assistant reply is a real message in the list (so it
// renders inline like any other bubble) — this just tags which one it is,
// so it can show a thinking/tool indicator instead of blank text, and a
// streaming cursor once text starts arriving.
const isStreamingPlaceholder = (msg: { id: string }) => msg.id.startsWith('streaming-');

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
    }
  });
};

const streamingContentLength = computed(() => {
  const last = chatStore.messages[chatStore.messages.length - 1];
  return last && isStreamingPlaceholder(last) ? (last.content?.length ?? 0) : 0;
});

watch(() => chatStore.messages.length, scrollToBottom);
watch(() => chatStore.sending, scrollToBottom);
watch(() => chatStore.conversation?.id, scrollToBottom);
watch(streamingContentLength, scrollToBottom);

const autoGrow = () => {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
};

const send = async () => {
  const text = draft.value;
  if (!text.trim() || charCount.value > MAX_LEN || chatStore.sending) return;
  draft.value = '';
  nextTick(autoGrow);
  await chatStore.sendMessage(text);
};

const handleSendButtonClick = () => {
  if (chatStore.sending) {
    chatStore.stopStreaming();
  } else {
    send();
  }
};

const sendQuickPrompt = async (prompt: string) => {
  await chatStore.sendMessage(prompt);
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
};

const renderAssistantContent = (content: string | null) => sanitizeHtml(renderChatMarkdown(content));

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
};
</script>

<script lang="ts">
export default { name: 'ChatThread' };
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- Messages -->
    <div ref="scrollRef" class="relative z-10 flex-1 overflow-y-auto custom-scrollbar" :class="large ? 'px-2 sm:px-4 py-6 space-y-6' : 'px-4 py-4 space-y-4'">
      <!-- Empty state -->
      <div v-if="chatStore.messages.length === 0 && !chatStore.initializing">
        <!-- AI chat toggled off backend-side, and nothing to look back on either -->
        <div v-if="!settingsStore.aiChatEnabled" class="flex flex-col items-center text-center py-8 px-4">
          <div class="relative mb-4">
            <div :class="[avatarBox, 'w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center']">
              <svg class="w-7 h-7 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
              <svg class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </span>
          </div>
          <p class="font-bold text-gray-700 dark:text-gray-200 mb-1">Fynda is taking a short break</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 max-w-[220px] leading-relaxed">
            AI chat is paused for now — check back soon. You can still browse medications or book a consultation in the meantime.
          </p>
        </div>

        <!-- Normal greeting -->
        <div v-else class="space-y-4">
          <div class="flex items-start gap-2.5">
            <div :class="[avatarBox, 'shrink-0 rounded-xl bg-gradient-to-br from-[#246BFD] to-[#5089FF] flex items-center justify-center shadow-sm mt-0.5']">
              <svg :class="[avatarIcon, 'text-white']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div :class="[bubbleText, bubbleMaxWidth, 'rounded-2xl rounded-tl-sm bg-white/90 dark:bg-gray-800/90 border border-gray-200/70 dark:border-gray-700/60 px-4 py-3 text-gray-700 dark:text-gray-200 shadow-sm']">
              Hey, I'm <span class="font-bold text-[#246BFD] dark:text-[#5089FF]">Fynda</span> 👋 Ask me to compare prices, check what's in stock nearby, or find a pharmacy that's open right now.
            </div>
          </div>
          <div class="flex flex-wrap gap-2 pl-10">
            <button
              v-for="prompt in QUICK_PROMPTS"
              :key="prompt"
              @click="sendQuickPrompt(prompt)"
              class="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#246BFD]/10 dark:bg-[#246BFD]/20 text-[#246BFD] dark:text-[#5089FF] border border-[#246BFD]/15 dark:border-[#246BFD]/30 hover:bg-[#246BFD]/20 dark:hover:bg-[#246BFD]/30 transition-colors"
            >
              {{ prompt }}
            </button>
          </div>
        </div>
      </div>

      <!-- Initializing skeleton -->
      <div v-if="chatStore.initializing" class="flex items-start gap-2.5 animate-pulse">
        <div :class="[avatarBox, 'shrink-0 rounded-xl bg-gray-200 dark:bg-gray-700']"></div>
        <div class="space-y-2">
          <div class="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      <!-- Message list -->
      <template v-for="msg in chatStore.messages" :key="msg.id">
        <div v-if="msg.role === 'user'" class="flex justify-end">
          <div :class="[bubbleText, bubbleMaxWidth, 'rounded-2xl rounded-br-sm bg-gradient-to-br from-[#246BFD] to-[#5089FF] text-white px-4 py-2.5 shadow-sm whitespace-pre-wrap break-words']">
            {{ msg.content }}
            <div class="text-[10px] text-white/70 mt-1 text-right">{{ formatTime(msg.created_at) }}</div>
          </div>
        </div>
        <div v-else-if="msg.role === 'assistant'" class="space-y-2">
          <div class="flex items-start gap-2.5">
            <div :class="[avatarBox, 'shrink-0 rounded-xl bg-gradient-to-br from-[#246BFD] to-[#5089FF] flex items-center justify-center shadow-sm mt-0.5']">
              <svg :class="[avatarIcon, 'text-white']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div :class="[bubbleText, bubbleMaxWidth, 'rounded-2xl rounded-tl-sm bg-white/90 dark:bg-gray-800/90 border border-gray-200/70 dark:border-gray-700/60 px-4 py-2.5 text-gray-800 dark:text-gray-100 shadow-sm break-words']">
              <!-- Streaming placeholder: thinking dots, then a tool indicator, then live text -->
              <template v-if="isStreamingPlaceholder(msg) && !msg.content">
                <div v-if="chatStore.streamingToolName" class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-medium py-0.5">
                  <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ toolLabel(chatStore.streamingToolName) }}
                </div>
                <div v-else class="flex items-center gap-1 py-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:-0.3s]"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:-0.15s]"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"></span>
                </div>
              </template>
              <template v-else>
                <div
                  class="chat-markdown"
                  :class="{ 'is-streaming': isStreamingPlaceholder(msg) }"
                  v-html="renderAssistantContent(msg.content)"
                ></div>
                <div v-if="!isStreamingPlaceholder(msg)" class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{{ formatTime(msg.created_at) }}</div>
              </template>
            </div>
          </div>
          <div
            v-if="msg.suggestions && msg.suggestions.length"
            class="pl-10 flex gap-3 overflow-x-auto pb-1 custom-scrollbar"
          >
            <ChatSuggestionCard
              v-for="(s, idx) in msg.suggestions"
              :key="`${msg.id}-${idx}`"
              :suggestion="s"
            />
          </div>
        </div>
      </template>

      <!-- Error banner -->
      <div
        v-if="chatStore.error"
        class="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3.5 py-2.5 text-xs text-red-700 dark:text-red-300"
      >
        <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{{ chatStore.error }}</span>
      </div>
    </div>

    <!-- Input -->
    <div class="relative z-10 shrink-0" :class="large ? 'px-2 sm:px-4 pb-4 pt-2' : 'px-3.5 py-3 border-t border-gray-200/60 dark:border-gray-700/50'">
      <!-- New messages paused — read-only if there's history above, otherwise the empty state already covers it -->
      <div
        v-if="!settingsStore.aiChatEnabled"
        class="flex items-center gap-2.5 rounded-2xl bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60 px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
        :class="large ? 'max-w-3xl mx-auto' : ''"
      >
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        Fynda is taking a short break — new messages are paused right now.
      </div>

      <template v-else>
        <div class="flex items-end gap-2 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/70 dark:border-gray-700/60 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[#246BFD]/50" :class="large ? 'max-w-3xl mx-auto' : ''">
          <textarea
            ref="textareaRef"
            v-model="draft"
            rows="1"
            placeholder="Ask Fynda anything…"
            maxlength="4000"
            class="flex-1 resize-none bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none py-1 max-h-[160px]"
            :class="bubbleText"
            @input="autoGrow"
            @keydown="handleKeydown"
            :disabled="chatStore.initializing"
          ></textarea>
          <button
            @click="handleSendButtonClick"
            :disabled="!chatStore.sending && !canSend"
            class="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-[#246BFD] to-[#5089FF] shadow-sm transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
            :title="chatStore.sending ? 'Stop generating' : 'Send'"
          >
            <svg v-if="chatStore.sending" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12L3.269 3.126A59.77 59.77 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
        <div class="flex items-center justify-between mt-1.5 px-1" :class="large ? 'max-w-3xl mx-auto' : ''">
          <p class="text-[10px] text-gray-400 dark:text-gray-500">Fynda can make mistakes — confirm medical advice with a pharmacist.</p>
          <p v-if="nearLimit" class="text-[10px] font-semibold" :class="charCount > MAX_LEN ? 'text-red-500' : 'text-amber-500'">
            {{ charCount }}/{{ MAX_LEN }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 4px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.chat-markdown :deep(p) {
  margin: 0 0 0.5em;
}
.chat-markdown :deep(p:last-child) {
  margin-bottom: 0;
}
.chat-markdown :deep(ul),
.chat-markdown :deep(ol) {
  margin: 0 0 0.5em;
  padding-left: 1.25em;
}
.chat-markdown :deep(ul) {
  list-style-type: disc;
}
.chat-markdown :deep(ol) {
  list-style-type: decimal;
}
.chat-markdown :deep(li) {
  margin-bottom: 0.15em;
}
.chat-markdown :deep(code) {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 4px;
  padding: 0.1em 0.35em;
  font-size: 0.85em;
}

.chat-markdown.is-streaming :deep(p:last-child)::after {
  content: '';
  display: inline-block;
  width: 3px;
  height: 1em;
  margin-left: 2px;
  vertical-align: -0.15em;
  background: currentColor;
  opacity: 0.7;
  animation: chat-cursor-blink 1s step-start infinite;
}

@keyframes chat-cursor-blink {
  50% {
    opacity: 0;
  }
}
</style>
