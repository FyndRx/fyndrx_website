<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';
import LazyImage from '@/components/LazyImage.vue';
import AddressSection from '@/components/profile/AddressSection.vue';
import MedicalHistorySection from '@/components/profile/MedicalHistorySection.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import type { UserSession } from '@/models/api';

const router = useRouter();
const authStore = useAuthStore();
const user = computed(() => authStore.user);

const activeTab = ref('personal');

const tabs = [
  { id: 'personal', label: 'Personal Information', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'addresses', label: 'Delivery Addresses', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'medical', label: 'Medical History', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'sessions', label: 'Active Sessions', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
];

const sessionsLoading = ref(false);
const sessionsError = ref<string | null>(null);

const fetchSessions = async () => {
  try {
    sessionsLoading.value = true;
    sessionsError.value = null;
    await authStore.fetchActiveSessions();
  } catch (err: any) {
    sessionsError.value = err.message || 'Failed to load active sessions';
  } finally {
    sessionsLoading.value = false;
  }
};

const sessionPendingRevoke = ref<UserSession | null>(null);
const revokeLoading = ref(false);
const revokeError = ref<string | null>(null);

const handleRevokeSession = (session: UserSession) => {
  sessionPendingRevoke.value = session;
  revokeError.value = null;
};

const cancelRevoke = () => {
  if (revokeLoading.value) return;
  sessionPendingRevoke.value = null;
  revokeError.value = null;
};

const confirmRevoke = async () => {
  if (!sessionPendingRevoke.value) return;
  revokeLoading.value = true;
  revokeError.value = null;
  try {
    await authStore.revokeSession(sessionPendingRevoke.value.id);
    sessionPendingRevoke.value = null;
  } catch (err: any) {
    revokeError.value = err.message || 'Failed to revoke session. Please try again.';
  } finally {
    revokeLoading.value = false;
  }
};

watch(activeTab, (newTab) => {
  if (newTab === 'sessions') {
    fetchSessions();
  }
});
</script>

<template>
  <div class="pb-24">
    <div class="px-4 mx-auto max-w-6xl">
      <!-- Header / hero -->
      <div class="mb-8 overflow-hidden rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
        <div class="relative h-28 bg-gradient-to-r from-brand-500 to-brand-400">
          <div class="absolute -bottom-16 left-6 md:left-12">
            <div class="w-32 h-32 p-1 overflow-hidden bg-white md:w-36 md:h-36 rounded-3xl shadow-float ring-4 ring-white dark:bg-gray-900 dark:ring-gray-800">
              <LazyImage
                v-if="user?.profile_picture"
                :src="user?.profile_picture_full || user?.profile_picture || ''"
                :alt="user?.fullname || 'Profile'"
                :aspectRatio="'square'"
                class="object-cover w-full h-full rounded-2xl"
              />
              <div v-else class="flex items-center justify-center w-full h-full rounded-2xl bg-brand-500/10">
                <span class="text-4xl font-semibold text-brand-500 dark:text-brand-300">{{ authStore.userInitials }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col justify-between gap-6 px-6 pt-20 pb-6 md:px-12 md:flex-row md:items-end">
          <div class="space-y-1.5 min-w-0">
            <h1 class="text-3xl font-medium text-gray-900 capitalize md:text-4xl dark:text-white">{{ user?.firstname }} {{ user?.lastname }}</h1>
            <div class="flex flex-wrap items-center text-sm text-gray-600 gap-x-5 gap-y-1 dark:text-gray-300">
              <span class="flex items-center min-w-0">
                <svg class="w-4 h-4 mr-2 shrink-0 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span class="truncate">{{ user?.email }}</span>
              </span>
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-2 shrink-0 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 014 0m-5 8a2 2 0 100-4 2 2 0 000 4zm5 3h1.414a1 1 0 01.707.293l.586.586a1 1 0 001.414 0l.586-.586a1 1 0 01.707-.293H19"></path></svg>
                Member ID: {{ user?.member_id || 'N/A' }}
              </span>
            </div>
          </div>

          <button
            type="button"
            @click="router.push('/profile/edit')"
            class="flex items-center justify-center w-full px-6 py-3 space-x-2 md:w-auto shrink-0 font-medium text-white rounded-full shadow-glow-brand transition duration-200 bg-brand-500 ease-out-quart hover:bg-brand-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 01-2 2v11a2 2 0 012 2h11a2 2 0 012-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            <span>Edit Profile</span>
          </button>
        </div>

        <!-- Tabs -->
        <div class="px-6 border-t md:px-12 border-gray-200/70 bg-white/40 dark:border-white/10 dark:bg-white/5">
          <div class="flex gap-8 overflow-x-auto no-scrollbar" role="tablist">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab.id"
              @click="activeTab = tab.id"
              class="relative flex items-center px-1 py-4 space-x-2 text-sm font-semibold transition duration-200 whitespace-nowrap ease-out-quart focus-visible:outline-none focus-visible:text-brand-600"
              :class="activeTab === tab.id ? 'text-brand-600 dark:text-brand-300' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon"></path>
              </svg>
              <span>{{ tab.label }}</span>
              <span v-if="activeTab === tab.id" class="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-brand-500"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div class="space-y-8 lg:col-span-8">
          <transition mode="out-in" enter-active-class="animate-in fade-in slide-in-from-bottom-4 duration-300" leave-active-class="animate-out fade-out slide-out-to-top-4 duration-200">
            <div :key="activeTab" class="p-6 sm:p-8 md:p-10 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">

              <!-- Personal info -->
              <div v-if="activeTab === 'personal'" class="space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
                  <div class="group">
                    <p class="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">First name</p>
                    <p class="pb-2 text-lg font-medium text-gray-900 transition-colors border-b dark:text-white border-gray-200/70 dark:border-white/10 group-hover:border-brand-500/40 capitalize">{{ user?.firstname }}</p>
                  </div>
                  <div class="group">
                    <p class="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Last name</p>
                    <p class="pb-2 text-lg font-medium text-gray-900 transition-colors border-b dark:text-white border-gray-200/70 dark:border-white/10 group-hover:border-brand-500/40 capitalize">{{ user?.lastname }}</p>
                  </div>
                  <div class="group">
                    <p class="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Email address</p>
                    <p class="pb-2 text-lg font-medium text-gray-900 transition-colors border-b dark:text-white border-gray-200/70 dark:border-white/10 group-hover:border-brand-500/40">{{ user?.email }}</p>
                  </div>
                  <div class="group">
                    <p class="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Phone number</p>
                    <p class="pb-2 text-lg font-medium text-gray-900 transition-colors border-b dark:text-white border-gray-200/70 dark:border-white/10 group-hover:border-brand-500/40">{{ user?.phone_number || 'Not provided' }}</p>
                  </div>
                  <div class="group">
                    <p class="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Date of birth</p>
                    <p class="pb-2 text-lg font-medium text-gray-900 transition-colors border-b dark:text-white border-gray-200/70 dark:border-white/10 group-hover:border-brand-500/40">{{ user?.dob ? new Date(user.dob).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Not provided' }}</p>
                  </div>
                  <div class="group">
                    <p class="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">Gender</p>
                    <p class="pb-2 text-lg font-medium text-gray-900 transition-colors border-b dark:text-white border-gray-200/70 dark:border-white/10 group-hover:border-brand-500/40 capitalize">{{ user?.gender || 'Not specified' }}</p>
                  </div>
                </div>

                <div class="flex items-start p-6 space-x-4 rounded-2xl bg-brand-500/10 ring-1 ring-brand-500/15">
                  <div class="p-3 rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-900 dark:text-white">Security &amp; Privacy</h4>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      Your data is protected with 256-bit encryption. We only share information with authorized healthcare providers when necessary for your treatment.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Addresses -->
              <div v-else-if="activeTab === 'addresses'">
                <AddressSection />
              </div>

              <!-- Medical history -->
              <div v-else-if="activeTab === 'medical'">
                <MedicalHistorySection />
              </div>

              <!-- Active sessions -->
              <div v-else-if="activeTab === 'sessions'" class="space-y-6">
                <div class="flex items-center justify-between pb-4 border-b border-gray-200/70 dark:border-white/10">
                  <div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Active Sessions</h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage the devices logged into your account.</p>
                  </div>
                  <button
                    type="button"
                    @click="fetchSessions"
                    :disabled="sessionsLoading"
                    class="p-2 text-gray-500 transition rounded-full hover:bg-brand-500/10 hover:text-brand-600 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
                    aria-label="Refresh sessions"
                    title="Refresh sessions"
                  >
                    <svg class="w-5 h-5" :class="sessionsLoading ? 'animate-spin' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path>
                    </svg>
                  </button>
                </div>

                <div v-if="sessionsLoading && !authStore.activeSessions.length" class="flex flex-col items-center justify-center py-12 space-y-4">
                  <div class="w-10 h-10 border-2 rounded-full border-brand-500 border-t-transparent animate-spin" role="status" aria-label="Loading"></div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Loading your active sessions…</p>
                </div>

                <div v-else-if="sessionsError" class="flex items-start p-6 space-x-3 text-red-700 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 dark:text-red-400" role="alert">
                  <svg class="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <div>
                    <p class="text-sm font-semibold">Failed to load sessions</p>
                    <p class="mt-1 text-xs">{{ sessionsError }}</p>
                    <button type="button" @click="fetchSessions" class="mt-2 text-xs font-semibold underline hover:no-underline">Try again</button>
                  </div>
                </div>

                <div v-else-if="!authStore.activeSessions.length" class="py-12 text-center rounded-2xl bg-white/60 ring-1 ring-gray-200/70 dark:bg-white/5 dark:ring-white/10">
                  <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">No active sessions found.</p>
                </div>

                <ul v-else class="space-y-3">
                  <li
                    v-for="session in authStore.activeSessions"
                    :key="session.id"
                    class="flex flex-col justify-between gap-4 p-5 transition duration-200 sm:flex-row sm:items-center rounded-2xl bg-white/60 ring-1 ring-gray-200/70 hover:ring-brand-500/30 dark:bg-white/5 dark:ring-white/10"
                  >
                    <div class="flex items-start space-x-4">
                      <div class="p-3 text-gray-500 rounded-xl bg-gray-500/10 shrink-0 dark:text-gray-300">
                        <svg v-if="session.device_name?.toLowerCase().includes('phone') || session.device_name?.toLowerCase().includes('iphone') || session.device_name?.toLowerCase().includes('android')" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <div class="space-y-1 min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                          <h4 class="font-semibold text-gray-900 capitalize dark:text-white">{{ session.device_name || 'Unknown Device' }}</h4>
                          <span v-if="session.is_current" class="px-2.5 py-0.5 text-xs font-medium rounded-full text-brand-700 bg-brand-500/10 dark:text-brand-300">Current device</span>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                          IP: {{ session.ip_address || 'Unknown' }}
                          <span v-if="session.user_agent" class="hidden ml-2 md:inline opacity-70">• {{ session.user_agent }}</span>
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          Last active: {{ new Date(session.last_active).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) }}
                        </p>
                      </div>
                    </div>

                    <div v-if="!session.is_current" class="self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        @click="handleRevokeSession(session)"
                        class="px-4 py-2 text-sm font-medium text-red-600 transition duration-200 rounded-full ring-1 ring-red-200 ease-out-quart dark:text-red-400 dark:ring-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20"
                      >Revoke access</button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </transition>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6 lg:col-span-4">
          <!-- Wallet -->
          <div class="p-6 text-white rounded-3xl shadow-float bg-gradient-to-br from-brand-950 via-brand-900 to-gray-900 sm:p-8">
            <h3 class="flex items-center mb-6 text-base font-medium text-white/80">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              FyndRx Wallet
            </h3>
            <div class="mb-6 space-y-1">
              <span class="text-sm text-white/60">Total savings</span>
              <div class="flex items-baseline text-4xl font-semibold text-white">
                <span class="mr-1 text-xl font-medium text-brand-300">GH₵</span>
                {{ user?.saved_money?.toFixed(2) || '0.00' }}
              </div>
            </div>
            <div class="flex items-center p-4 rounded-2xl bg-white/5 ring-1 ring-white/10">
              <div class="flex items-center justify-center w-10 h-10 mr-3 rounded-full bg-brand-500/25 text-brand-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 014 0m-5 8a2 2 0 100-4 2 2 0 000 4zm5 3h1.414a1 1 0 01.707.293l.586.586a1 1 0 001.414 0l.586-.586a1 1 0 01.707-.293H19"></path></svg>
              </div>
              <div class="text-sm">
                <p class="text-white/60">Member ID</p>
                <p class="font-medium">{{ user?.member_id || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <!-- Quick actions -->
          <div class="p-6 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10 sm:p-8">
            <h4 class="mb-5 font-semibold text-gray-900 dark:text-white">Quick Actions</h4>
            <div class="space-y-2.5">
              <button type="button" @click="router.push('/orders')" class="flex items-center justify-between w-full p-3 text-left transition duration-200 group rounded-2xl bg-white/60 ring-1 ring-gray-200/70 ease-out-quart hover:bg-brand-500/5 hover:ring-brand-500/40 dark:bg-white/5 dark:ring-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30">
                <span class="flex items-center gap-3">
                  <span class="flex items-center justify-center w-10 h-10 rounded-full bg-accent-500/15 text-accent-600 dark:text-accent-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                  </span>
                  <span class="text-sm font-medium text-gray-800 dark:text-gray-100">My Orders</span>
                </span>
                <svg class="w-4 h-4 text-gray-400 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
              <button type="button" @click="router.push('/prescriptions')" class="flex items-center justify-between w-full p-3 text-left transition duration-200 group rounded-2xl bg-white/60 ring-1 ring-gray-200/70 ease-out-quart hover:bg-brand-500/5 hover:ring-brand-500/40 dark:bg-white/5 dark:ring-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30">
                <span class="flex items-center gap-3">
                  <span class="flex items-center justify-center w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </span>
                  <span class="text-sm font-medium text-gray-800 dark:text-gray-100">My Prescriptions</span>
                </span>
                <svg class="w-4 h-4 text-gray-400 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
              <button type="button" @click="router.push('/consultations')" class="flex items-center justify-between w-full p-3 text-left transition duration-200 group rounded-2xl bg-white/60 ring-1 ring-gray-200/70 ease-out-quart hover:bg-brand-500/5 hover:ring-brand-500/40 dark:bg-white/5 dark:ring-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30">
                <span class="flex items-center gap-3">
                  <span class="flex items-center justify-center w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                  </span>
                  <span class="text-sm font-medium text-gray-800 dark:text-gray-100">Consultations</span>
                </span>
                <svg class="w-4 h-4 text-gray-400 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>

          <!-- Danger zone -->
          <div class="p-6 rounded-3xl bg-white/70 shadow-card ring-1 ring-red-200 backdrop-blur-md dark:bg-gray-800/60 dark:ring-red-900/40 sm:p-8">
            <h4 class="mb-2 font-semibold text-red-600 dark:text-red-400">Danger Zone</h4>
            <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and all associated data.</p>
            <button
              type="button"
              @click="router.push('/profile/delete-account')"
              class="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-medium text-red-600 transition duration-200 rounded-full ring-1 ring-red-200 ease-out-quart dark:text-red-400 dark:ring-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :show="!!sessionPendingRevoke"
      title="Revoke this device?"
      variant="danger"
      confirm-label="Revoke Access"
      :loading="revokeLoading"
      :error-message="revokeError || undefined"
      @confirm="confirmRevoke"
      @cancel="cancelRevoke"
    >
      <template #icon>
        <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </template>
      <p v-if="sessionPendingRevoke" class="text-sm text-gray-500 dark:text-gray-400">
        <span class="font-semibold text-gray-700 capitalize dark:text-gray-300">{{ sessionPendingRevoke.device_name || 'This device' }}</span>
        will be signed out immediately
        <span v-if="sessionPendingRevoke.ip_address">from IP {{ sessionPendingRevoke.ip_address }}</span>.
        You'll need to log in again on that device to continue.
      </p>
    </ConfirmDialog>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes slide-in-from-bottom-4 {
  from {
    transform: translateY(1rem);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slide-out-to-top-4 {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-1rem);
    opacity: 0;
  }
}

.animate-in {
  animation-fill-mode: both;
}

.animate-out {
  animation-fill-mode: both;
}
</style>