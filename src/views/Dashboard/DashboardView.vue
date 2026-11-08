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
import type { FavoriteDrug } from '@/services/favoritesService';
import { orderService } from '@/services/orderService';
import LazyImage from '@/components/LazyImage.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import SpotlightCardAd from '@/components/ads/formats/SpotlightCardAd.vue';
import { useAds } from '@/composables/useAds';
import { useAdsStore } from '@/store/ads';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const user = computed(() => authStore.user);
const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
});

const orders = ref<Order[]>([]);
const loading = ref(true);
const favoriteDrugs = ref<FavoriteDrug[]>([]);
const favoritePharmacies = ref<Pharmacy[]>([]);
const recentlyViewed = ref<Medication[]>([]);

// ─── Computed ────────────────────────────────────────────────────────────────

const activeOrders = computed(() =>
  orders.value.filter(o => !['completed', 'cancelled'].includes(o.status))
);

const completedOrders = computed(() =>
  orders.value.filter(o => o.status === 'completed')
);

const totalSpent = computed(() =>
  completedOrders.value.reduce((sum, o) => sum + o.total, 0)
);

const recentOrders = computed(() => orders.value.slice(0, 5));

const totalFavorites = computed(() =>
  favoriteDrugs.value.length + favoritePharmacies.value.length
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getCategoryName = (cat: any): string =>
  typeof cat === 'string' ? cat : cat?.name ?? '';

const drugDisplayName = (d: FavoriteDrug) =>
  d.product?.name ?? d.drug?.name ?? 'Unknown';

const drugImage = (d: FavoriteDrug) =>
  d.product?.image ?? null;

const drugItemId = (d: FavoriteDrug) =>
  d.product?.id ?? d.drug?.id ?? d.id;

// ─── Quick actions ───────────────────────────────────────────────────────────

const quickActions = [
  { to: '/medications', label: 'Browse', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { to: '/consultations', label: 'Consult', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { to: '/upload-prescription', label: 'Upload Rx', accent: true, icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
  { to: '/pharmacies', label: 'Pharmacies', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
  { to: '/orders', label: 'Orders', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/favorites', label: 'Favorites', fill: true, icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
];

// ─── Data loading ─────────────────────────────────────────────────────────────

const loadDashboardData = async () => {
  loading.value = true;
  try {
    const [ordersData, drugsResult, pharmsResult, recentData] = await Promise.all([
      orderService.getOrders({ per_page: 20 }),
      favoritesService.getFavoriteDrugs(1, 4),
      favoritesService.getFavoritePharmacies(1, 3),
      recentlyViewedService.getRecentlyViewed(),
    ]);

    orders.value = ordersData.orders;

    favoriteDrugs.value = drugsResult.data;
    favoritePharmacies.value = pharmsResult.data;

    if (recentData.length) {
      const ids = recentData.slice(0, 4).map((d: any) => d.drug_id ?? d.product_id).filter(Boolean);
      if (ids.length) {
        const { medicationService } = await import('@/services/medicationService');
        recentlyViewed.value = await medicationService.getMultipleMedications(ids);
      }
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
  } finally {
    loading.value = false;
  }
};

const adsStore = useAdsStore();
const { resolved: dashboardAd } = useAds({ zone: 'Z6-dashboard-spotlight', route: 'dashboard', isAuthed: true });

onMounted(() => {
  loadDashboardData();
  adsStore.load();
});
</script>

<template>
  <div class="pb-24">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

      <!-- ── Hero greeting ── -->
      <div class="flex items-end justify-between mb-8">
        <div>
          <p class="mb-1 text-sm font-medium text-brand-600 dark:text-brand-300">{{ greeting }}</p>
          <h1 class="text-3xl font-medium text-gray-900 sm:text-4xl dark:text-white">
            {{ user?.firstname }} {{ user?.lastname }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Here's your health overview for today</p>
        </div>
        <router-link to="/profile" class="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/70 shadow-sm ring-1 ring-gray-200/70 dark:ring-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-brand-500 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          Profile
        </router-link>
      </div>

      <!-- ── Stat cards ── -->
      <div class="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        <!-- Total Orders -->
        <div class="p-5 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-bold text-gray-500 dark:text-gray-400">Total Orders</p>
            <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20">
              <svg class="w-4.5 h-4.5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
          </div>
          <div v-if="loading" class="w-16 h-8 bg-gray-100 rounded-lg dark:bg-gray-700 animate-pulse"></div>
          <p v-else class="text-3xl font-semibold text-gray-900 dark:text-white">{{ orders.length }}</p>
          <p class="mt-1 text-xs text-gray-400">{{ completedOrders.length }} completed</p>
        </div>

        <!-- Active Orders -->
        <div class="relative p-5 overflow-hidden rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-bold text-gray-500 dark:text-gray-400">Active</p>
            <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20">
              <svg class="w-4.5 h-4.5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <div v-if="loading" class="w-12 h-8 bg-gray-100 rounded-lg dark:bg-gray-700 animate-pulse"></div>
          <p v-else class="text-3xl font-semibold" :class="activeOrders.length ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-white'">{{ activeOrders.length }}</p>
          <p class="mt-1 text-xs text-gray-400">in progress</p>
        </div>

        <!-- Cart -->
        <div class="p-5 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-bold text-gray-500 dark:text-gray-400">Cart</p>
            <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
              <svg class="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
          </div>
          <p class="text-3xl font-semibold text-gray-900 dark:text-white">{{ cartStore.cartItemsCount }}</p>
          <router-link to="/cart" class="text-xs text-brand-500 mt-1 font-medium hover:underline">View cart →</router-link>
        </div>

        <!-- Total Spent -->
        <div class="p-5 rounded-3xl shadow-glow-brand bg-gradient-to-br from-brand-500 to-brand-400">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-bold text-brand-100 ">Total Spent</p>
            <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20">
              <svg class="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <div v-if="loading" class="w-24 h-8 rounded-lg bg-white/20 animate-pulse"></div>
          <p v-else class="text-3xl font-semibold text-white">{{ formatCurrency(totalSpent) }}</p>
          <p class="mt-1 text-xs text-brand-100">lifetime value</p>
        </div>
      </div>

      <!-- Z6: Dashboard spotlight ad — once per session, auth-only -->
      <div v-if="dashboardAd" class="mb-6">
        <SpotlightCardAd :ad="dashboardAd" zone="Z6-dashboard-spotlight" />
      </div>

      <!-- ── Main content grid ── -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <!-- Left: orders + recent ── -->
        <div class="space-y-6 lg:col-span-2">

          <!-- Active orders alert -->
          <div v-if="!loading && activeOrders.length" class="flex items-center gap-4 p-4 border bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-700/40 rounded-2xl">
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-800 shrink-0">
              <svg class="w-5 h-5 text-brand-600 dark:text-brand-300 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-brand-900 dark:text-brand-100">{{ activeOrders.length }} active order{{ activeOrders.length > 1 ? 's' : '' }} in progress</p>
              <p class="text-xs text-brand-600 dark:text-brand-400">Your medications are on their way.</p>
            </div>
            <router-link to="/orders" class="shrink-0 px-4 py-1.5 rounded-full bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors">Track</router-link>
          </div>

          <!-- Recent orders -->
          <div class="rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
            <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-200/70 dark:border-white/10">
              <h2 class="font-bold text-gray-900 dark:text-white">Recent Orders</h2>
              <router-link to="/orders" class="text-xs font-semibold text-brand-500 hover:text-brand-400">View all →</router-link>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="p-6 space-y-4">
              <div v-for="i in 3" :key="i" class="flex gap-4 animate-pulse">
                <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl shrink-0"></div>
                <div class="flex-1 space-y-2">
                  <div class="w-1/2 h-4 bg-gray-100 rounded dark:bg-gray-700"></div>
                  <div class="w-1/3 h-3 bg-gray-100 rounded dark:bg-gray-700"></div>
                </div>
              </div>
            </div>

            <!-- Empty -->
            <div v-else-if="!recentOrders.length" class="px-6 py-12 text-center">
              <svg class="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">No orders yet</p>
              <router-link to="/medications" class="px-5 py-2 rounded-full bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors">Start shopping</router-link>
            </div>

            <!-- List -->
            <div v-else class="divide-y divide-gray-50 dark:divide-gray-700/50">
              <div
                v-for="order in recentOrders"
                :key="order.id"
                @click="router.push({ name: 'order-detail', params: { id: order.id } })"
                class="flex items-center gap-4 px-6 py-4 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40"
              >
                <div class="w-12 h-12 overflow-hidden bg-gray-100 rounded-xl dark:bg-gray-700 shrink-0">
                  <LazyImage
                    v-if="order.items?.[0]?.image"
                    :src="order.items[0].image"
                    :alt="order.items[0].medicationName"
                    aspectRatio="square"
                    className="w-full h-full object-cover"
                  />
                  <div v-else class="flex items-center justify-center w-full h-full">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate dark:text-white">{{ order.orderNumber }}</p>
                  <p class="text-xs text-gray-500 truncate dark:text-gray-400">{{ order.pharmacyName }}</p>
                  <p class="text-xs text-gray-400 dark:text-gray-500">{{ formatDate(order.createdAt) }}</p>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-sm font-bold text-gray-900 dark:text-white">{{ formatCurrency(order.total) }}</p>
                  <StatusBadge :status="order.status" size="xs" show-dot class="mt-1" />
                </div>
              </div>
            </div>
          </div>

          <!-- Recently Viewed -->
          <div v-if="recentlyViewed.length" class="rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
            <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-200/70 dark:border-white/10">
              <h2 class="font-bold text-gray-900 dark:text-white">Recently Viewed</h2>
              <router-link to="/medications" class="text-xs font-semibold text-brand-500 hover:text-brand-400">Browse →</router-link>
            </div>
            <div class="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
              <div
                v-for="med in recentlyViewed"
                :key="med.id"
                @click="router.push({ name: 'MedicationDetail', params: { id: med.product_id ?? med.id } })"
                class="overflow-hidden transition-colors cursor-pointer group rounded-xl bg-white/60 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div class="h-20 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <LazyImage
                    :src="med.image"
                    :alt="med.name"
                    aspectRatio="square"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div class="p-2">
                  <p class="text-xs font-semibold text-gray-800 dark:text-white truncate group-hover:text-brand-500 transition-colors">{{ med.name }}</p>
                  <template v-if="med.category">
                    <span class="text-xs text-gray-400 truncate block">
                      {{ getCategoryName(Array.isArray(med.category) ? med.category[0] : med.category) }}
                    </span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right sidebar ── -->
        <div class="space-y-6">

          <!-- Favorites summary -->
          <div class="rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
            <div class="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-200/70 dark:border-white/10">
              <div class="flex items-center gap-2">
                <div class="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                </div>
                <h2 class="text-sm font-bold text-gray-900 dark:text-white">Favourites</h2>
              </div>
              <router-link to="/favorites" class="text-xs font-semibold text-brand-500 hover:text-brand-400">See all →</router-link>
            </div>

            <div v-if="loading" class="p-4 space-y-3">
              <div v-for="i in 3" :key="i" class="flex gap-3 animate-pulse">
                <div class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl shrink-0"></div>
                <div class="flex-1 space-y-1.5">
                  <div class="h-3.5 bg-gray-100 dark:bg-gray-700 rounded w-3/4"></div>
                  <div class="w-1/2 h-3 bg-gray-100 rounded dark:bg-gray-700"></div>
                </div>
              </div>
            </div>

            <div v-else-if="totalFavorites === 0" class="px-5 py-8 text-center">
              <svg class="w-10 h-10 mx-auto mb-2 text-gray-200 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              <p class="mb-3 text-xs text-gray-400">Nothing saved yet</p>
              <router-link to="/medications" class="text-xs text-brand-500 font-semibold hover:underline">Browse medications →</router-link>
            </div>

            <div v-else class="divide-y divide-gray-50 dark:divide-gray-700/50">
              <!-- Drug favourites -->
              <div
                v-for="drug in favoriteDrugs"
                :key="`fd-${drug.id}`"
                @click="router.push({ name: 'MedicationDetail', params: { id: drugItemId(drug) } })"
                class="flex items-center gap-3 px-5 py-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40"
              >
                <div class="flex items-center justify-center w-10 h-10 overflow-hidden rounded-xl bg-brand-50 dark:bg-gray-700 shrink-0">
                  <LazyImage :src="drugImage(drug) || ''" :alt="drugDisplayName(drug)" className="object-cover w-full h-full" aspectRatio="square" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate dark:text-white">{{ drugDisplayName(drug) }}</p>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span v-if="drug.product?.pharmacy_count" class="inline-flex items-center gap-1 text-xs text-brand-500 font-medium">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                      {{ drug.product.pharmacy_count }} {{ drug.product.pharmacy_count === 1 ? 'pharmacy' : 'pharmacies' }}
                    </span>
                    <span v-if="drug.product?.requires_prescription ?? drug.drug?.requires_prescription" class="px-1.5 py-0.5 text-xs font-semibold rounded bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400">Rx</span>
                  </div>
                </div>
                <svg class="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              </div>

              <!-- Pharmacy favourites -->
              <div
                v-for="pharmacy in favoritePharmacies"
                :key="`fp-${pharmacy.id}`"
                @click="router.push({ name: 'pharmacy', params: { id: pharmacy.id } })"
                class="flex items-center gap-3 px-5 py-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40"
              >
                <div class="flex items-center justify-center w-10 h-10 overflow-hidden rounded-xl bg-emerald-50 dark:bg-gray-700 shrink-0">
                  <LazyImage :src="pharmacy.logo || pharmacy.image || ''" :alt="pharmacy.name" className="object-cover w-full h-full" aspectRatio="square" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate dark:text-white">{{ pharmacy.name }}</p>
                  <div class="flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span
                      class="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-bold rounded-full"
                      :class="pharmacy.isOpen
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="pharmacy.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'"></span>
                      {{ pharmacy.isOpen ? 'Open' : 'Closed' }}
                    </span>
                    <span v-if="pharmacy.distance" class="text-xs text-gray-400">· {{ pharmacy.distance }}</span>
                    <span v-if="pharmacy.branchesCount > 1" class="text-xs text-gray-400">· {{ pharmacy.branchesCount }} branches</span>
                  </div>
                </div>
                <svg class="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              </div>
            </div>
          </div>

          <!-- Quick actions -->
          <div class="p-5 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
            <h2 class="mb-4 text-sm font-bold text-gray-900 dark:text-white">Quick Actions</h2>
            <div class="grid grid-cols-2 gap-2.5">
              <router-link
                v-for="action in quickActions"
                :key="action.to"
                :to="action.to"
                class="flex flex-col items-center gap-2 p-3 text-center transition duration-200 rounded-2xl bg-white/60 ring-1 ring-gray-200/70 ease-out-quart hover:-translate-y-0.5 hover:bg-brand-500/5 hover:ring-brand-500/40 dark:bg-white/5 dark:ring-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
              >
                <span
                  class="flex items-center justify-center w-10 h-10 rounded-full"
                  :class="action.accent ? 'bg-accent-500/15 text-accent-600 dark:text-accent-300' : 'bg-brand-500/10 text-brand-600 dark:text-brand-300'"
                >
                  <svg class="w-5 h-5" :fill="action.fill ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" :stroke-width="action.fill ? 0 : 2" :d="action.icon" />
                  </svg>
                </span>
                <span class="text-xs font-medium text-gray-700 dark:text-gray-200">{{ action.label }}</span>
              </router-link>
            </div>
          </div>

          <!-- Help CTA -->
          <div class="p-5 text-white rounded-3xl shadow-glow-brand bg-gradient-to-br from-brand-500 to-brand-400">
            <p class="mb-1 font-bold">Need assistance?</p>
            <p class="mb-4 text-sm text-brand-100">Our pharmacists are here to help.</p>
            <router-link to="/consultations/new" class="inline-block px-5 py-2.5 text-sm font-semibold transition duration-200 bg-white rounded-full text-brand-600 ease-out-quart hover:bg-brand-50 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60">
              Start a Consultation
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
