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
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';

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

const statusConfig: Record<string, { label: string; classes: string }> = {
  pending:          { label: 'Pending',    classes: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300' },
  confirmed:        { label: 'Confirmed',  classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
  processing:       { label: 'Processing', classes: 'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300' },
  ready:            { label: 'Ready',      classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' },
  out_for_delivery: { label: 'Delivering', classes: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300' },
  completed:        { label: 'Completed',  classes: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  cancelled:        { label: 'Cancelled',  classes: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' },
};

const statusOf = (status: string) =>
  statusConfig[status] ?? { label: status, classes: 'bg-gray-100 text-gray-700' };

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

    orders.value = ordersData.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

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

onMounted(() => { loadDashboardData(); });
</script>

<template>
  <div class="min-h-screen pt-20 pb-16 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

      <!-- ── Hero greeting ── -->
      <div class="flex items-end justify-between mb-8">
        <div>
          <p class="text-sm font-medium text-[#246BFD] mb-1">{{ greeting }}</p>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ user?.firstname }} {{ user?.lastname }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Here's your health overview for today</p>
        </div>
        <router-link to="/profile" class="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-[#246BFD] transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          Profile
        </router-link>
      </div>

      <!-- ── Stat cards ── -->
      <div class="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        <!-- Total Orders -->
        <div class="p-5 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-bold tracking-wide text-gray-500 uppercase dark:text-gray-400">Total Orders</p>
            <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <svg class="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
          </div>
          <div v-if="loading" class="w-16 h-8 bg-gray-100 rounded-lg dark:bg-gray-700 animate-pulse"></div>
          <p v-else class="text-3xl font-black text-gray-900 dark:text-white">{{ orders.length }}</p>
          <p class="mt-1 text-xs text-gray-400">{{ completedOrders.length }} completed</p>
        </div>

        <!-- Active Orders -->
        <div class="relative p-5 overflow-hidden bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
          <div v-if="activeOrders.length" class="absolute top-0 right-0 w-2 h-full bg-violet-500 rounded-r-2xl"></div>
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-bold tracking-wide text-gray-500 uppercase dark:text-gray-400">Active</p>
            <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/20">
              <svg class="w-4.5 h-4.5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <div v-if="loading" class="w-12 h-8 bg-gray-100 rounded-lg dark:bg-gray-700 animate-pulse"></div>
          <p v-else class="text-3xl font-black" :class="activeOrders.length ? 'text-violet-600 dark:text-violet-400' : 'text-gray-900 dark:text-white'">{{ activeOrders.length }}</p>
          <p class="mt-1 text-xs text-gray-400">in progress</p>
        </div>

        <!-- Cart -->
        <div class="p-5 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-bold tracking-wide text-gray-500 uppercase dark:text-gray-400">Cart</p>
            <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
              <svg class="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
          </div>
          <p class="text-3xl font-black text-gray-900 dark:text-white">{{ cartStore.cartItemsCount }}</p>
          <router-link to="/cart" class="text-xs text-[#246BFD] mt-1 font-medium hover:underline">View cart →</router-link>
        </div>

        <!-- Total Spent -->
        <div class="bg-gradient-to-br from-[#246BFD] to-[#5089FF] rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-bold tracking-wide text-blue-100 uppercase">Total Spent</p>
            <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20">
              <svg class="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <div v-if="loading" class="w-24 h-8 rounded-lg bg-white/20 animate-pulse"></div>
          <p v-else class="text-3xl font-black text-white">{{ formatCurrency(totalSpent) }}</p>
          <p class="mt-1 text-xs text-blue-100">lifetime value</p>
        </div>
      </div>

      <!-- ── Main content grid ── -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <!-- Left: orders + recent ── -->
        <div class="space-y-6 lg:col-span-2">

          <!-- Active orders alert -->
          <div v-if="!loading && activeOrders.length" class="flex items-center gap-4 p-4 border bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700/40 rounded-2xl">
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-800 shrink-0">
              <svg class="w-5 h-5 text-violet-600 dark:text-violet-300 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-violet-900 dark:text-violet-100">{{ activeOrders.length }} active order{{ activeOrders.length > 1 ? 's' : '' }} in progress</p>
              <p class="text-xs text-violet-600 dark:text-violet-400">Your medications are on their way.</p>
            </div>
            <router-link to="/orders" class="shrink-0 px-4 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors">Track</router-link>
          </div>

          <!-- Recent orders -->
          <div class="bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
            <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
              <h2 class="font-bold text-gray-900 dark:text-white">Recent Orders</h2>
              <router-link to="/orders" class="text-xs font-semibold text-[#246BFD] hover:text-[#5089FF]">View all →</router-link>
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
              <router-link to="/medications" class="px-5 py-2 rounded-xl bg-[#246BFD] text-white text-sm font-semibold hover:bg-[#5089FF] transition-colors">Start shopping</router-link>
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
                  <p class="text-[11px] text-gray-400 dark:text-gray-500">{{ formatDate(order.createdAt) }}</p>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-sm font-bold text-gray-900 dark:text-white">{{ formatCurrency(order.total) }}</p>
                  <span :class="['inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full', statusOf(order.status).classes]">
                    {{ statusOf(order.status).label }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recently Viewed -->
          <div v-if="recentlyViewed.length" class="bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
            <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
              <h2 class="font-bold text-gray-900 dark:text-white">Recently Viewed</h2>
              <router-link to="/medications" class="text-xs font-semibold text-[#246BFD] hover:text-[#5089FF]">Browse →</router-link>
            </div>
            <div class="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
              <div
                v-for="med in recentlyViewed"
                :key="med.id"
                @click="router.push({ name: 'MedicationDetail', params: { id: med.product_id ?? med.id } })"
                class="overflow-hidden transition-colors cursor-pointer group rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                  <p class="text-xs font-semibold text-gray-800 dark:text-white truncate group-hover:text-[#246BFD] transition-colors">{{ med.name }}</p>
                  <template v-if="med.category">
                    <span class="text-[10px] text-gray-400 truncate block">
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
          <div class="bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
            <div class="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div class="flex items-center gap-2">
                <div class="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                </div>
                <h2 class="text-sm font-bold text-gray-900 dark:text-white">Favourites</h2>
              </div>
              <router-link to="/favorites" class="text-xs font-semibold text-[#246BFD] hover:text-[#5089FF]">See all →</router-link>
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
              <router-link to="/medications" class="text-xs text-[#246BFD] font-semibold hover:underline">Browse medications →</router-link>
            </div>

            <div v-else class="divide-y divide-gray-50 dark:divide-gray-700/50">
              <!-- Drug favourites -->
              <div
                v-for="drug in favoriteDrugs"
                :key="`fd-${drug.id}`"
                @click="router.push({ name: 'MedicationDetail', params: { id: drugItemId(drug) } })"
                class="flex items-center gap-3 px-5 py-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40"
              >
                <div class="flex items-center justify-center w-10 h-10 overflow-hidden rounded-xl bg-blue-50 dark:bg-gray-700 shrink-0">
                  <img v-if="drugImage(drug)" :src="drugImage(drug)!" :alt="drugDisplayName(drug)" class="object-cover w-full h-full" />
                  <svg v-else class="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate dark:text-white">{{ drugDisplayName(drug) }}</p>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span v-if="drug.product?.pharmacy_count" class="inline-flex items-center gap-1 text-[11px] text-[#246BFD] font-medium">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                      {{ drug.product.pharmacy_count }} {{ drug.product.pharmacy_count === 1 ? 'pharmacy' : 'pharmacies' }}
                    </span>
                    <span v-if="drug.product?.requires_prescription ?? drug.drug?.requires_prescription" class="px-1.5 py-0.5 text-[10px] font-black rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Rx</span>
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
                  <img v-if="pharmacy.logo || pharmacy.image" :src="pharmacy.logo || pharmacy.image" :alt="pharmacy.name" class="object-cover w-full h-full" />
                  <svg v-else class="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 truncate dark:text-white">{{ pharmacy.name }}</p>
                  <div class="flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span
                      class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full"
                      :class="pharmacy.isOpen
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="pharmacy.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'"></span>
                      {{ pharmacy.isOpen ? 'Open' : 'Closed' }}
                    </span>
                    <span v-if="pharmacy.distance" class="text-[11px] text-gray-400">· {{ pharmacy.distance }}</span>
                    <span v-if="pharmacy.branchesCount > 1" class="text-[11px] text-gray-400">· {{ pharmacy.branchesCount }} branches</span>
                  </div>
                </div>
                <svg class="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              </div>
            </div>
          </div>

          <!-- Quick actions -->
          <div class="p-5 bg-white border border-gray-100 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
            <h2 class="mb-4 text-sm font-bold text-gray-900 dark:text-white">Quick Actions</h2>
            <div class="grid grid-cols-2 gap-2">

              <router-link to="/medications" class="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all hover:-translate-y-0.5 text-center">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <span class="text-[11px] font-semibold text-blue-700 dark:text-blue-400">Browse</span>
              </router-link>

              <router-link to="/consultations" class="flex flex-col items-center gap-2 p-3 rounded-xl bg-teal-50 dark:bg-teal-900/10 hover:bg-teal-100 dark:hover:bg-teal-900/20 transition-all hover:-translate-y-0.5 text-center">
                <svg class="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                <span class="text-[11px] font-semibold text-teal-700 dark:text-teal-400">Consult</span>
              </router-link>

              <router-link to="/upload-prescription" class="flex flex-col items-center gap-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/10 hover:bg-violet-100 dark:hover:bg-violet-900/20 transition-all hover:-translate-y-0.5 text-center">
                <svg class="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                <span class="text-[11px] font-semibold text-violet-700 dark:text-violet-400">Upload Rx</span>
              </router-link>

              <router-link to="/pharmacies" class="flex flex-col items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-all hover:-translate-y-0.5 text-center">
                <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                <span class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Pharmacies</span>
              </router-link>

              <router-link to="/orders" class="flex flex-col items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-all hover:-translate-y-0.5 text-center">
                <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span class="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Orders</span>
              </router-link>

              <router-link to="/favorites" class="flex flex-col items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all hover:-translate-y-0.5 text-center">
                <svg class="w-5 h-5 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                <span class="text-[11px] font-semibold text-red-700 dark:text-red-400">Favorites</span>
              </router-link>

            </div>
          </div>

          <!-- Help CTA -->
          <div class="bg-gradient-to-br from-[#246BFD] to-[#5089FF] rounded-2xl p-5 text-white">
            <p class="mb-1 font-bold">Need assistance?</p>
            <p class="mb-4 text-sm text-blue-100">Our pharmacists are here to help.</p>
            <router-link to="/consultations/new" class="inline-block px-5 py-2 rounded-xl bg-white text-[#246BFD] text-sm font-bold hover:bg-blue-50 transition-colors">
              Start a Consultation
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
