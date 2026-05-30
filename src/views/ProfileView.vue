<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';
import LazyImage from '@/components/LazyImage.vue';
import AddressSection from '@/components/profile/AddressSection.vue';
import MedicalHistorySection from '@/components/profile/MedicalHistorySection.vue';

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

const handleRevokeSession = async (id: number) => {
  if (confirm('Are you sure you want to revoke this session? The device will be logged out immediately.')) {
    try {
      await authStore.revokeSession(id);
    } catch (err: any) {
      alert(err.message || 'Failed to revoke session');
    }
  }
};

watch(activeTab, (newTab) => {
  if (newTab === 'sessions') {
    fetchSessions();
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 pt-28 pb-20">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Header / Hero Section -->
      <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden mb-8 transition-all duration-300">
        <div class="h-32 bg-gradient-to-r from-[#246BFD] to-[#5089FF] relative">
          <div class="absolute inset-0 bg-black/10"></div>
          <div class="absolute -bottom-16 left-8 md:left-12">
            <div class="relative group">
              <div class="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden bg-white dark:bg-gray-900 p-1 shadow-2xl ring-4 ring-white dark:ring-gray-800">
                <LazyImage
                  v-if="user?.profile_picture"
                  :src="user?.profile_picture_full || user?.profile_picture || ''"
                  :alt="user?.fullname || 'Profile'"
                  :aspectRatio="'square'"
                  class="w-full h-full object-cover rounded-2xl"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                  <span class="text-4xl font-bold text-[#246BFD]">
                    {{ authStore.userInitials }}
                  </span>
                </div>
              </div>
              <button 
                @click="router.push('/profile/edit')"
                class="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 text-[#246BFD] p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:scale-110 transition-transform"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="pt-20 pb-8 px-8 md:px-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="space-y-1">
            <h1 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              {{ user?.firstname }} {{ user?.lastname }}
            </h1>
            <div class="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400 font-medium">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-[#246BFD]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {{ user?.email }}
              </span>
              <span class="hidden md:block text-gray-300">|</span>
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-[#246BFD]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 014 0m-5 8a2 2 0 100-4 2 2 0 000 4zm5 3h1.414a1 1 0 01.707.293l.586.586a1 1 0 001.414 0l.586-.586a1 1 0 01.707-.293H19"></path>
                </svg>
                Member ID: {{ user?.member_id || 'N/A' }}
              </span>
            </div>
          </div>
          
          <div class="flex gap-3">
            <button
              @click="router.push('/dashboard')"
              class="px-5 py-2.5 rounded-xl border-2 border-[#246BFD]/20 hover:border-[#246BFD]/40 font-bold text-gray-600 dark:text-gray-400 hover:bg-[#246BFD]/5 transition-all flex items-center space-x-2 shadow-sm"
            >
              <svg class="w-5 h-5 text-[#246BFD]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
              <span>Dashboard</span>
            </button>
            <button
              @click="router.push('/profile/edit')"
              class="px-6 py-2.5 rounded-xl bg-[#246BFD] text-white font-bold hover:bg-[#5089FF] shadow-lg shadow-[#246BFD]/20 hover:shadow-[#246BFD]/30 transition-all flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 01-2 2v11a2 2 0 012 2h11a2 2 0 012-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              <span>Edit Account</span>
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="px-8 md:px-12 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div class="flex overflow-x-auto no-scrollbar gap-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="py-5 px-1 font-bold text-sm uppercase tracking-widest transition-all relative flex items-center space-x-2 whitespace-nowrap"
              :class="activeTab === tab.id ? 'text-[#246BFD]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'"
            >
              <svg class="w-4 h-4" :class="activeTab === tab.id ? 'scale-110' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon"></path>
              </svg>
              <span>{{ tab.label }}</span>
              <div
                v-if="activeTab === tab.id"
                class="absolute bottom-0 left-0 right-0 h-1 bg-[#246BFD] rounded-t-full shadow-[0_-2px_8px_rgba(36,107,253,0.4)]"
              ></div>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-8 space-y-8">
          <transition mode="out-in" enter-active-class="animate-in fade-in slide-in-from-bottom-4 duration-300" leave-active-class="animate-out fade-out slide-out-to-top-4 duration-200">
            <div :key="activeTab" class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-10 transition-all duration-300 border border-white/50 dark:border-gray-700/50">
              
              <!-- Personal Info Tab -->
              <div v-if="activeTab === 'personal'" class="space-y-10">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div class="space-y-1 group">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">First Name</label>
                    <p class="text-xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-50 dark:border-gray-700 pb-2 group-hover:border-[#246BFD]/30 transition-colors capitalize">
                      {{ user?.firstname }}
                    </p>
                  </div>
                  <div class="space-y-1 group">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Last Name</label>
                    <p class="text-xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-50 dark:border-gray-700 pb-2 group-hover:border-[#246BFD]/30 transition-colors capitalize">
                      {{ user?.lastname }}
                    </p>
                  </div>
                  <div class="space-y-1 group">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Email Address</label>
                    <p class="text-xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-50 dark:border-gray-700 pb-2 group-hover:border-[#246BFD]/30 transition-colors">
                      {{ user?.email }}
                    </p>
                  </div>
                  <div class="space-y-1 group">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Phone Number</label>
                    <p class="text-xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-50 dark:border-gray-700 pb-2 group-hover:border-[#246BFD]/30 transition-colors">
                      {{ user?.phone_number || 'Not provided' }}
                    </p>
                  </div>
                  <div class="space-y-1 group">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date of Birth</label>
                    <p class="text-xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-50 dark:border-gray-700 pb-2 group-hover:border-[#246BFD]/30 transition-colors">
                      {{ user?.dob ? new Date(user.dob).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Not provided' }}
                    </p>
                  </div>
                  <div class="space-y-1 group">
                    <label class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Gender</label>
                    <p class="text-xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-50 dark:border-gray-700 pb-2 group-hover:border-[#246BFD]/30 transition-colors capitalize">
                      {{ user?.gender || 'Not specified' }}
                    </p>
                  </div>
                </div>

                <div class="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-6 flex items-start space-x-4 border border-blue-100 dark:border-blue-800/20">
                  <div class="p-3 bg-blue-100 dark:bg-blue-800/30 rounded-xl text-[#246BFD]">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-bold text-gray-900 dark:text-white">Security & Privacy</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Your data is protected with 256-bit encryption. We only share information with authorized healthcare providers when necessary for your treatment.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Addresses Tab -->
              <div v-else-if="activeTab === 'addresses'">
                <AddressSection />
              </div>

              <!-- Medical History Tab -->
              <div v-else-if="activeTab === 'medical'">
                <MedicalHistorySection />
              </div>

              <!-- Active Sessions Tab -->
              <div v-else-if="activeTab === 'sessions'" class="space-y-8">
                <div class="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-gray-700">
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Active Sessions</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                      Manage the devices logged into your account.
                    </p>
                  </div>
                  <button 
                    @click="fetchSessions"
                    :disabled="sessionsLoading"
                    class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                    title="Refresh Sessions"
                  >
                    <svg 
                      class="w-5 h-5" 
                      :class="sessionsLoading ? 'animate-spin' : ''" 
                      fill="none" 
                      stroke="currentColor" 
                      stroke-width="2"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path>
                    </svg>
                  </button>
                </div>

                <div v-if="sessionsLoading && !authStore.activeSessions.length" class="flex flex-col items-center justify-center py-12 space-y-4">
                  <div class="w-10 h-10 border-4 border-[#246BFD] border-t-transparent rounded-full animate-spin"></div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Loading your active sessions...</p>
                </div>

                <div v-else-if="sessionsError" class="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-6 rounded-2xl border border-red-100 dark:border-red-900/20 flex items-start space-x-3">
                  <svg class="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <div>
                    <p class="font-bold text-sm">Failed to load sessions</p>
                    <p class="text-xs opacity-90 mt-1">{{ sessionsError }}</p>
                    <button @click="fetchSessions" class="mt-2 text-xs font-bold underline hover:no-underline">Try again</button>
                  </div>
                </div>

                <div v-else-if="!authStore.activeSessions.length" class="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                  <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <p class="mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium">No active sessions found.</p>
                </div>

                <div v-else class="space-y-4">
                  <div 
                    v-for="session in authStore.activeSessions" 
                    :key="session.id"
                    class="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-[#246BFD]/20 dark:hover:border-[#246BFD]/20 transition-all duration-300 gap-4"
                  >
                    <div class="flex items-start space-x-4">
                      <div class="p-3.5 bg-gray-50 dark:bg-gray-800/80 rounded-xl text-gray-500 dark:text-gray-400 shrink-0">
                        <!-- Render generic device/browser icons based on device name -->
                        <svg v-if="session.device_name?.toLowerCase().includes('phone') || session.device_name?.toLowerCase().includes('iphone') || session.device_name?.toLowerCase().includes('android')" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <div class="space-y-1">
                        <div class="flex flex-wrap items-center gap-2">
                          <h4 class="font-bold text-gray-900 dark:text-white capitalize">
                            {{ session.device_name || 'Unknown Device' }}
                          </h4>
                          <span 
                            v-if="session.is_current" 
                            class="px-2 py-0.5 text-[10px] font-bold text-[#246BFD] bg-[#246BFD]/10 rounded-full border border-[#246BFD]/20 tracking-wider uppercase"
                          >
                            Current Device
                          </span>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          IP: {{ session.ip_address || 'Unknown' }}
                          <span v-if="session.user_agent" class="opacity-60 hidden md:inline ml-2">• {{ session.user_agent }}</span>
                        </p>
                        <p class="text-[11px] text-gray-400 dark:text-gray-500">
                          Last active: {{ new Date(session.last_active).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) }}
                        </p>
                      </div>
                    </div>

                    <div v-if="!session.is_current" class="flex items-center shrink-0 self-end sm:self-center">
                      <button
                        @click="handleRevokeSession(session.id)"
                        class="px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl transition-all shadow-sm"
                      >
                        Revoke Access
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Sidebar Stats -->
        <div class="lg:col-span-4 space-y-6">
          <div class="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 shadow-xl text-white">
            <h3 class="text-lg font-bold mb-6 flex items-center opacity-80">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              FyndRx Wallet
            </h3>
            <div class="space-y-1 mb-8">
              <span class="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Savings</span>
              <div class="text-5xl font-black text-[#246BFD] flex items-baseline">
                <span class="text-2xl mr-1 font-bold">GH₵</span>
                {{ user?.saved_money?.toFixed(2) || '0.00' }}
              </div>
            </div>
            <div class="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 text-[#246BFD]">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z"></path>
                  </svg>
                </div>
                <div class="text-xs">
                  <p class="font-bold">Platinum Member</p>
                  <p class="opacity-50">Since 2024</p>
                </div>
              </div>
              <svg class="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-50 dark:border-gray-700">
            <h4 class="font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h4>
            <div class="space-y-3">
              <button @click="router.push('/orders')" class="w-full flex items-center justify-between p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-800/20 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-all group">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center mr-3 text-amber-600 dark:text-amber-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                  </div>
                  <span class="font-bold text-sm text-gray-700 dark:text-gray-200">My Orders</span>
                </div>
                <svg class="w-4 h-4 text-amber-400 opacity-50 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
              <button @click="router.push('/prescriptions')" class="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 transition-all group">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-800/30 flex items-center justify-center mr-3 text-emerald-600 dark:text-emerald-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <span class="font-bold text-sm text-gray-700 dark:text-gray-200">My Prescriptions</span>
                </div>
                <svg class="w-4 h-4 text-emerald-400 opacity-50 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
              <button @click="router.push('/consultations')" class="w-full flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-all group">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center mr-3 text-[#246BFD] dark:text-[#5089FF]">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                  </div>
                  <span class="font-bold text-sm text-gray-700 dark:text-gray-200">Consultations</span>
                </div>
                <svg class="w-4 h-4 text-[#246BFD] opacity-50 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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