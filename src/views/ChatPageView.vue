<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useSeoMeta } from '@/composables/useSeoMeta';
import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';
import ChatThread from '@/components/AiChat/ChatThread.vue';
import { timeAgo } from '@/utils/date';

useSeoMeta({
  title: 'Chat with Fynda | FyndRx',
  description: 'Ask Fynda, your FyndRx assistant, to compare medication prices, check stock, and find open pharmacies near you.',
  ogType: 'website',
});

const authStore = useAuthStore();
const chatStore = useChatStore();

const sidebarOpen = ref(false);
const bootError = ref<string | null>(null);

const conversationTitle = computed(() => chatStore.conversation?.title || 'New conversation');

const bootstrap = async () => {
  bootError.value = null;
  try {
    if (authStore.isAuthenticated) {
      await chatStore.loadConversations(1);
      if (chatStore.conversations.length > 0) {
        await chatStore.selectConversation(chatStore.conversations[0].id);
      } else {
        await chatStore.startNewConversation();
      }
    } else {
      await chatStore.initConversation();
    }
  } catch (err: any) {
    bootError.value = err?.message || "Fynda couldn't load right now.";
  }
};

onMounted(bootstrap);

// If the user signs in/out while sitting on this page, re-run the bootstrap
// against the new tier instead of showing a stale or empty thread.
watch(() => authStore.isAuthenticated, bootstrap);

const handleNewChat = async () => {
  await chatStore.startNewConversation();
  sidebarOpen.value = false;
};

const handleSelect = async (id: string) => {
  await chatStore.selectConversation(id);
  sidebarOpen.value = false;
};
</script>

<script lang="ts">
export default { name: 'ChatPageView' };
</script>

<template>
  <div class="pt-20 h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
    <!-- Decorative ambient glows -->
    <div class="absolute top-24 -left-24 w-96 h-96 bg-[#246BFD]/10 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-400/10 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Mobile sidebar backdrop -->
    <transition enter-active-class="transition-opacity duration-200" leave-active-class="transition-opacity duration-150" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div
        v-if="sidebarOpen"
        @click="sidebarOpen = false"
        class="fixed inset-0 top-20 z-30 bg-black/40 md:hidden"
      ></div>
    </transition>

    <div class="relative z-10 flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <aside
        class="fixed md:static top-20 md:top-auto bottom-0 md:bottom-auto left-0 z-40 w-[280px] md:w-72 h-[calc(100vh-5rem)] md:h-auto shrink-0 flex flex-col bg-white dark:bg-gray-900 md:bg-white/70 md:dark:bg-gray-900/40 border-r border-gray-200/70 dark:border-gray-800/70 transform transition-transform duration-300 md:translate-x-0"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <div class="p-3.5 shrink-0">
          <button
            v-if="authStore.isAuthenticated"
            @click="handleNewChat"
            :disabled="chatStore.initializing"
            class="w-full flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#246BFD] to-[#5089FF] shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-60"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New chat
          </button>
        </div>

        <!-- Authenticated: conversation history -->
        <div v-if="authStore.isAuthenticated" class="flex-1 overflow-y-auto px-2.5 pb-3 space-y-1 custom-scrollbar">
          <div v-if="chatStore.conversationsLoading && chatStore.conversations.length === 0" class="space-y-2 px-1.5 pt-1">
            <div v-for="i in 5" :key="i" class="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
          </div>

          <div v-else-if="chatStore.conversations.length === 0" class="px-3 pt-6 text-center">
            <div class="mx-auto w-14 h-14 rounded-2xl bg-[#246BFD]/10 flex items-center justify-center mb-3 rotate-3">
              <svg class="w-7 h-7 text-[#246BFD] -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">No conversations yet</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Say hello to Fynda to get started.</p>
          </div>

          <template v-else>
            <button
              v-for="conv in chatStore.conversations"
              :key="conv.id"
              @click="handleSelect(conv.id)"
              class="group relative w-full text-left px-3 py-2.5 rounded-xl transition-colors flex flex-col gap-0.5"
              :class="conv.id === chatStore.conversation?.id
                ? 'bg-[#246BFD]/10 dark:bg-[#246BFD]/15'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800/70'"
            >
              <span
                v-if="conv.id === chatStore.conversation?.id"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-[#246BFD] to-[#5089FF]"
              ></span>
              <span
                class="text-sm font-semibold truncate"
                :class="conv.id === chatStore.conversation?.id ? 'text-[#246BFD] dark:text-[#5089FF]' : 'text-gray-700 dark:text-gray-200'"
              >
                {{ conv.title || 'New conversation' }}
              </span>
              <span class="text-[11px] text-gray-400 dark:text-gray-500">{{ timeAgo(conv.last_message_at || conv.created_at) }}</span>
            </button>

            <button
              v-if="chatStore.hasMoreConversations"
              @click="chatStore.loadMoreConversations"
              :disabled="chatStore.conversationsLoading"
              class="w-full text-center py-2 text-xs font-semibold text-[#246BFD] dark:text-[#5089FF] hover:underline disabled:opacity-50"
            >
              {{ chatStore.conversationsLoading ? 'Loading…' : 'Load more' }}
            </button>
          </template>
        </div>

        <!-- Guest: single-thread notice -->
        <div v-else class="flex-1 overflow-y-auto px-3.5 pb-4">
          <div class="rounded-2xl border border-[#246BFD]/20 bg-[#246BFD]/5 dark:bg-[#246BFD]/10 p-4 mt-1">
            <p class="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">You're chatting as a guest</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
              This conversation stays on this device. Sign in to save your chat history and pick it up from anywhere.
            </p>
            <router-link
              :to="{ name: 'login' }"
              class="inline-flex items-center justify-center w-full rounded-xl py-2 text-xs font-bold text-white bg-gradient-to-r from-[#246BFD] to-[#5089FF] shadow-sm hover:shadow-md transition-all"
            >
              Sign in
            </router-link>
          </div>
        </div>
      </aside>

      <!-- Main -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Topbar -->
        <div class="shrink-0 flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-gray-200/70 dark:border-gray-800/70 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm">
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="md:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
            title="Conversations"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>

          <div class="relative w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-[#246BFD] to-[#5089FF] flex items-center justify-center shadow-sm rotate-3 hidden sm:flex">
            <svg class="w-5 h-5 text-white -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ conversationTitle }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              Fynda · FyndRx Assistant
            </p>
          </div>

          <button
            v-if="authStore.isAuthenticated"
            @click="handleNewChat"
            :disabled="chatStore.initializing"
            class="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#246BFD] dark:text-[#5089FF] px-3 py-2 rounded-xl hover:bg-[#246BFD]/10 transition-colors disabled:opacity-50"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New chat
          </button>
        </div>

        <div v-if="bootError" class="mx-4 sm:mx-6 mt-4 flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3.5 py-2.5 text-xs text-red-700 dark:text-red-300">
          <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ bootError }}</span>
        </div>

        <ChatThread large />
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
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
</style>
