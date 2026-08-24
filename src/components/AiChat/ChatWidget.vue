<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';
import ChatThread from './ChatThread.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const chatStore = useChatStore();

const showNewChatConfirm = ref(false);

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
</script>

<script lang="ts">
export default { name: 'ChatWidget' };
</script>

<template>
  <div v-if="route.name !== 'ai-chat'" class="print:hidden fixed bottom-24 right-4 md:bottom-5 md:right-5 z-[60] flex flex-col items-end">
    <!-- Chat Panel -->
    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform opacity-0 scale-90 translate-y-4"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 translate-y-4"
    >
      <div
        v-if="chatStore.isOpen"
        class="mb-3 w-[92vw] max-w-[400px] h-[min(640px,80vh)] rounded-3xl bg-white/80 dark:bg-gray-900/85 backdrop-blur-2xl border border-white/60 dark:border-gray-700/50 shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden relative"
      >
        <!-- Decorative glows -->
        <div class="absolute -top-24 -left-16 w-48 h-48 bg-[#246BFD]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -right-16 w-48 h-48 bg-fuchsia-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Header -->
        <div class="relative z-10 px-4 py-3.5 flex items-center justify-between border-b border-gray-200/60 dark:border-gray-700/50 shrink-0">
          <div class="flex items-center gap-3">
            <div class="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#246BFD] to-[#5089FF] flex items-center justify-center shadow-lg shadow-[#246BFD]/30 rotate-3">
              <svg class="w-6 h-6 text-white -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-white dark:border-gray-900">
                <span class="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></span>
              </span>
            </div>
            <div>
              <p class="text-sm font-bold text-gray-900 dark:text-white leading-tight">Fynda</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 leading-tight">FyndRx Assistant · Online</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button
              @click="requestNewChat"
              :disabled="chatStore.initializing"
              class="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 dark:hover:text-gray-200 transition-colors disabled:opacity-40"
              title="New chat"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <button
              @click="expand"
              class="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 dark:hover:text-gray-200 transition-colors"
              title="Open full chat page"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 6.75v4.5m0-4.5h-4.5m4.5 0L15 15M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15" />
              </svg>
            </button>
            <button
              @click="chatStore.close"
              class="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 dark:hover:text-gray-200 transition-colors"
              title="Close chat"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <ChatThread />
      </div>
    </transition>

    <!-- Floating Action Button -->
    <button
      @click="chatStore.toggle"
      class="relative w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#246BFD] to-[#5089FF] shadow-xl shadow-[#246BFD]/40 flex items-center justify-center text-white transition-transform duration-300 hover:scale-110 active:scale-95 group"
      title="Chat with Fynda"
    >
      <span
        v-if="!chatStore.hasBeenOpened"
        class="absolute inset-0 rounded-full bg-[#246BFD] animate-ping opacity-60"
      ></span>
      <svg
        v-if="!chatStore.isOpen"
        class="w-7 h-7 transition-transform duration-300 group-hover:rotate-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
      <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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
