<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';
import { useSettingsStore } from '@/store/settings';
import { stickyBarVisible } from '@/composables/useAdSession';
import { useScrollTuck } from '@/composables/useScrollTuck';
import ChatThread from './ChatThread.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const chatStore = useChatStore();
const settingsStore = useSettingsStore();

const showNewChatConfirm = ref(false);
const fabRef = ref<HTMLButtonElement | null>(null);

// On phones the button steps out of the way while you scroll down through content, and returns when
// you scroll up or reach the top/bottom. It never tucks while the chat is open.
const { tucked: scrolledAway } = useScrollTuck();
const isTucked = computed(() => scrolledAway.value && !chatStore.isOpen);

const expand = () => {
  chatStore.close();
  router.push({ name: 'ai-chat' });
};

// Authenticated: harmless, the old thread stays in the /chat history list.
// Guest: lossy — there's no history list to get it back from — so confirm first.
const requestNewChat = () => {
  if (chatStore.initializing) return;
  if (authStore.isAuthenticated) {
    chatStore.startNewConversation();
  } else {
    showNewChatConfirm.value = true;
  }
};

const confirmNewChat = () => {
  showNewChatConfirm.value = false;
  chatStore.startNewConversation();
};

// Escape closes the panel and hands focus back to the button that opened it.
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && chatStore.isOpen && !showNewChatConfirm.value) {
    chatStore.close();
    fabRef.value?.focus();
  }
};

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

const headerButton =
  'flex items-center justify-center w-10 h-10 rounded-full text-gray-500 transition-colors hover:bg-gray-900/5 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100';
</script>

<script lang="ts">
export default { name: 'ChatWidget' };
</script>

<template>
  <div
    v-if="settingsStore.aiChatEnabled && route.name !== 'ai-chat'"
    class="print:hidden fixed right-4 md:right-5 md:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-end transition-[bottom] duration-300 ease-out-quart motion-reduce:transition-none"
    :class="stickyBarVisible ? 'bottom-[calc(6rem+env(safe-area-inset-bottom))]' : 'bottom-[calc(1rem+env(safe-area-inset-bottom))]'"
  >
    <!-- Chat panel -->
    <transition
      enter-active-class="transition ease-out duration-300 motion-reduce:duration-0"
      enter-from-class="transform opacity-0 scale-90 translate-y-4"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-200 motion-reduce:duration-0"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 translate-y-4"
    >
      <div
        v-if="chatStore.isOpen"
        id="chat-panel"
        role="dialog"
        aria-label="Chat with Fynda"
        class="relative flex flex-col mb-3 overflow-hidden w-[calc(100vw-2rem)] max-w-[400px] md:h-[min(640px,calc(100dvh-6.75rem))] rounded-3xl bg-white/85 dark:bg-gray-900/90 backdrop-blur-2xl ring-1 ring-gray-900/5 dark:ring-white/10 shadow-float"
        :class="stickyBarVisible ? 'h-[min(640px,calc(100dvh-11.25rem))]' : 'h-[min(640px,calc(100dvh-8rem))]'"
      >
        <!-- Ambient light, in the site's own colours -->
        <div class="absolute w-48 h-48 rounded-full pointer-events-none -top-24 -left-16 bg-brand-500/20 blur-3xl" aria-hidden="true"></div>
        <div class="absolute w-48 h-48 rounded-full pointer-events-none -bottom-24 -right-16 bg-accent-500/12 blur-3xl" aria-hidden="true"></div>

        <!-- Header -->
        <div class="relative z-10 flex items-center justify-between px-4 py-3.5 border-b border-gray-900/5 shrink-0 dark:border-white/10">
          <div class="flex items-center gap-3">
            <div class="relative flex items-center justify-center w-11 h-11 rotate-3 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 shadow-glow-brand">
              <svg class="w-6 h-6 text-white -rotate-3" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-white dark:border-gray-900">
                <span class="absolute inset-0 bg-green-400 rounded-full opacity-75 animate-ping motion-reduce:hidden"></span>
              </span>
            </div>
            <div>
              <p class="text-sm font-bold leading-tight text-gray-900 dark:text-white">Fynda</p>
              <p class="text-xs leading-tight text-gray-500 dark:text-gray-400">FyndRx Assistant · Online</p>
            </div>
          </div>
          <div class="flex items-center gap-0.5">
            <button
              type="button"
              :class="headerButton"
              :disabled="chatStore.initializing"
              aria-label="New chat"
              @click="requestNewChat"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <button type="button" :class="headerButton" aria-label="Open full chat page" @click="expand">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 6.75v4.5m0-4.5h-4.5m4.5 0L15 15M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15" />
              </svg>
            </button>
            <button type="button" :class="headerButton" aria-label="Close chat" @click="chatStore.close">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <ChatThread />
      </div>
    </transition>

    <!-- Floating action button: slimmer on phones, and tucks toward the edge while you scroll down -->
    <button
      ref="fabRef"
      type="button"
      class="relative flex items-center justify-center w-12 h-12 text-white rounded-full group md:w-[60px] md:h-[60px] bg-gradient-to-br from-brand-500 to-brand-400 shadow-glow-brand transition duration-300 ease-out-quart hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40 motion-reduce:transition-none"
      :class="isTucked ? 'translate-x-full opacity-70' : ''"
      :aria-label="chatStore.isOpen ? 'Close chat' : 'Chat with Fynda'"
      :aria-expanded="chatStore.isOpen"
      aria-controls="chat-panel"
      @click="chatStore.toggle"
    >
      <!-- Attention ring: a few pulses on first visit, then it settles (and never under reduced motion) -->
      <span
        v-if="!chatStore.hasBeenOpened"
        class="absolute inset-0 rounded-full bg-brand-500 opacity-60 animate-[ping_1.6s_cubic-bezier(0,0,0.2,1)_3] motion-reduce:hidden"
        aria-hidden="true"
      ></span>
      <svg
        v-if="!chatStore.isOpen"
        class="relative w-6 h-6 transition-transform duration-300 md:w-7 md:h-7 group-hover:rotate-12 motion-reduce:transition-none"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
      <svg v-else class="relative w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <ConfirmDialog
      :show="showNewChatConfirm"
      title="Start a new chat?"
      message="As a guest, this conversation can't be reopened once you leave it. Sign in to keep a history you can come back to."
      confirm-label="Start new chat"
      variant="primary"
      @confirm="confirmNewChat"
      @cancel="showNewChatConfirm = false"
    />
  </div>
</template>
