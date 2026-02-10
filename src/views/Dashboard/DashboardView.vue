<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { favoritesService } from '@/services/favoritesService';
import { recentlyViewedService } from '@/services/recentlyViewedService';
import type { Order } from '@/models/Order';
import type { Medication } from '@/models/Medication';
import type { Pharmacy } from '@/models/Pharmacy';
import { orderService } from '@/services/orderService';
import LazyImage from '@/components/LazyImage.vue';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();
const user = computed(() => authStore.user);

const orders = ref<Order[]>([]);
const loading = ref(true);
const favoriteMedications = ref<Medication[]>([]);
const favoritePharmacies = ref<Pharmacy[]>([]);
const recentlyViewed = ref<Medication[]>([]);

const recentOrders = computed(() => orders.value.slice(0, 3));

const activeOrders = computed(() => 
  orders.value.filter(o => !['completed', 'cancelled'].includes(o.status))
);

const totalSpent = computed(() => 
  orders.value
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + order.total, 0)
);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  });
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
  ready: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
  out_for_delivery: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
};

const totalFavorites = computed(() => {
  return favoriteMedications.value.length + favoritePharmacies.value.length;
});

const loadDashboardData = async () => {
  loading.value = true;
  try {
    orders.value = await orderService.getOrders({ per_page: 10 });
    orders.value = orders.value.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const savedDrugs = await favoritesService.getSavedDrugs();
    if (savedDrugs.length > 0) {
      const drugIds = savedDrugs.slice(0, 3).map(d => d.drug_id);
      const { medicationService } = await import('@/services/medicationService');
      favoriteMedications.value = await medicationService.getMultipleMedications(drugIds);
    }
    
    const recentlyViewedData = await recentlyViewedService.getRecentlyViewed();
    if (recentlyViewedData.length > 0) {
      const drugIds = recentlyViewedData.slice(0, 4).map(d => d.drug_id);
      const { medicationService } = await import('@/services/medicationService');
      recentlyViewed.value = await medicationService.getMultipleMedications(drugIds);
    }
  } catch (err) {
    console.error('Error loading dashboard data:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDashboardData();
});
</script>

<template>
  <div class="min-h-screen px-4 pt-24 pb-12 bg-gray-50 dark:bg-gray-900 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {{ user?.firstname }}!
        </h1>
        <p class="text-gray-600 dark:text-gray-300">Here's what's happening with your orders</p>
      </div>

      <div class="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <div class="p-6 transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{{ orders.length }}</p>
            </div>
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="p-6 transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Active Orders</p>
              <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{{ activeOrders.length }}</p>
            </div>
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="p-6 transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Cart Items</p>
              <p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{{ cartStore.cartItemsCount }}</p>
            </div>
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="p-6 transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
              <p class="mt-2 text-3xl font-bold text-[#246BFD]">GHS {{ totalSpent.toFixed(2) }}</p>
            </div>
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-[#246BFD]/10">
              <svg class="w-6 h-6 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Favorites & Recently Viewed Section -->
      <div class="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        <!-- Favorites -->
        <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
              <div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Favorites ({{ totalFavorites }})</h2>
            </div>
            <router-link
              to="/favorites"
              class="text-sm font-medium text-[#246BFD] hover:text-[#5089FF] transition-colors"
            >
              View All →
            </router-link>
          </div>

          <div v-if="totalFavorites === 0" class="py-8 text-center">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">No favorites yet</p>
            <router-link
              to="/medications"
              class="text-sm font-medium text-[#246BFD] hover:text-[#5089FF]"
            >
              Browse Medications →
            </router-link>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="medication in favoriteMedications"
              :key="`fav-med-${medication.id}`"
              @click="router.push({ name: 'MedicationDetail', params: { id: medication.id } })"
              class="flex items-center gap-3 p-3 transition-all rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LazyImage
                :src="medication.image"
                :alt="medication.drug_name"
                aspectRatio="square"
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 dark:text-white truncate">{{ medication.drug_name }}</p>
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="(cat, index) in (Array.isArray(medication.category) ? medication.category.slice(0, 1) : [medication.category])"
                    :key="index"
                    class="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                  >
                    {{ cat }}
                  </span>
                </div>
              </div>
              <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>

            <div
              v-for="pharmacy in favoritePharmacies"
              :key="`fav-pharm-${pharmacy.id}`"
              @click="router.push({ name: 'pharmacy', params: { id: pharmacy.id } })"
              class="flex items-center gap-3 p-3 transition-all rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LazyImage
                :src="pharmacy.image"
                :alt="pharmacy.name"
                aspectRatio="square"
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 dark:text-white truncate">{{ pharmacy.name }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ pharmacy.distance }}</p>
              </div>
              <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Recently Viewed -->
        <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
              <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Recently Viewed</h2>
            </div>
            <router-link
              to="/medications"
              class="text-sm font-medium text-[#246BFD] hover:text-[#5089FF] transition-colors"
            >
              Browse →
            </router-link>
          </div>

          <div v-if="recentlyViewed.length === 0" class="py-8 text-center">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">No recent views</p>
            <router-link
              to="/medications"
              class="text-sm font-medium text-[#246BFD] hover:text-[#5089FF]"
            >
              Start Browsing →
            </router-link>
          </div>

          <div v-else class="grid grid-cols-2 gap-3">
            <div
              v-for="medication in recentlyViewed"
              :key="`recent-${medication.id}`"
              @click="router.push({ name: 'MedicationDetail', params: { id: medication.id } })"
              class="p-3 transition-all rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LazyImage
                :src="medication.image"
                :alt="medication.drug_name"
                aspectRatio="square"
                className="w-full h-20 rounded-lg object-cover mb-2"
              />
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ medication.drug_name }}</p>
              <div class="flex flex-wrap gap-1">
                <span 
                  v-for="(cat, index) in (Array.isArray(medication.category) ? medication.category.slice(0, 1) : [medication.category])"
                  :key="index"
                  class="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                >
                  {{ cat }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
              <router-link
                to="/orders"
                class="text-sm font-medium text-[#246BFD] hover:text-[#5089FF] transition-colors"
              >
                View All →
              </router-link>
            </div>

            <div v-if="loading" class="py-12 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#246BFD] mx-auto"></div>
            </div>

            <div v-else-if="recentOrders.length === 0" class="py-12 text-center">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p class="text-gray-600 dark:text-gray-300">No orders yet</p>
              <router-link
                to="/medications"
                class="inline-block mt-4 px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors"
              >
                Start Shopping
              </router-link>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="order in recentOrders"
                :key="order.id"
                @click="router.push({ name: 'order-detail', params: { id: order.id } })"
                class="flex items-center gap-4 p-4 transition-all duration-300 cursor-pointer rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div class="flex-shrink-0 w-12 h-12 overflow-hidden bg-gray-200 dark:bg-gray-600 rounded-lg">
                  <LazyImage
                    v-if="order.items && order.items.length > 0 && order.items[0].image"
                    :src="order.items[0].image"
                    :alt="order.items[0].medicationName"
                    aspectRatio="square"
                    className="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                  </div>
                </div>
                
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 truncate dark:text-white">{{ order.orderNumber }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ order.pharmacyName }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-500">{{ formatDate(order.createdAt) }}</p>
                </div>

                <div class="text-right">
                  <p class="font-semibold text-[#246BFD]">GHS {{ order.total.toFixed(2) }}</p>
                  <span
                    :class="[
                      'inline-block px-2 py-1 text-xs font-medium rounded-full',
                      statusColors[order.status] || statusColors.pending
                    ]"
                  >
                    {{ order.status === 'out_for_delivery' ? 'Delivering' : (order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
            <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            <div class="space-y-3">
              <router-link
                to="/consultations"
                class="flex items-center gap-3 p-3 transition-all rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 group"
              >
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/20 group-hover:bg-teal-200 dark:group-hover:bg-teal-900/30 transition-colors">
                  <svg class="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
                <span class="font-medium text-gray-900 dark:text-white">My Consultations</span>
              </router-link>
              <router-link
                to="/medications"
                class="flex items-center gap-3 p-3 transition-all rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 group"
              >
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
                  <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <span class="font-medium text-gray-900 dark:text-white">Browse Medications</span>
              </router-link>

              <router-link
                to="/upload-prescription"
                class="flex items-center gap-3 p-3 transition-all rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 group"
              >
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/30 transition-colors">
                  <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                </div>
                <span class="font-medium text-gray-900 dark:text-white">Upload Prescription</span>
              </router-link>

              <router-link
                to="/pharmacies"
                class="flex items-center gap-3 p-3 transition-all rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 group"
              >
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 group-hover:bg-green-200 dark:group-hover:bg-green-900/30 transition-colors">
                  <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  </svg>
                </div>
                <span class="font-medium text-gray-900 dark:text-white">Find Pharmacies</span>
              </router-link>

              <router-link
                to="/favorites"
                class="flex items-center gap-3 p-3 transition-all rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 group"
              >
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 group-hover:bg-red-200 dark:group-hover:bg-red-900/30 transition-colors">
                  <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </div>
                <span class="font-medium text-gray-900 dark:text-white">My Favorites</span>
              </router-link>

              <router-link
                to="/medications?compare=true"
                class="flex items-center gap-3 p-3 transition-all rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 group"
              >
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/30 transition-colors">
                  <svg class="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <span class="font-medium text-gray-900 dark:text-white">Compare Medications</span>
              </router-link>

              <router-link
                to="/profile/edit"
                class="flex items-center gap-3 p-3 transition-all rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 group"
              >
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                  <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <span class="font-medium text-gray-900 dark:text-white">Update Profile</span>
              </router-link>
            </div>
          </div>

          <div class="p-6 bg-gradient-to-br from-[#246BFD] to-[#5089FF] shadow-lg rounded-2xl">
            <h3 class="mb-2 text-lg font-semibold text-white">Need Help?</h3>
            <p class="mb-4 text-sm text-white/90">Our support team is here to assist you</p>
            <router-link
              to="/help"
              class="inline-block px-6 py-3 font-medium text-[#246BFD] bg-white rounded-full hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 