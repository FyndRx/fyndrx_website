<script setup lang="ts">
import { inject } from 'vue';
import type { usePharmacy } from '@/composables/usePharmacy';

const pharmacyState = inject<ReturnType<typeof usePharmacy>>('pharmacyState')!;
</script>

<template>
  <div v-if="pharmacyState.pharmacy.value" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Empty state -->
    <div v-if="pharmacyState.pharmacy.value.services.length === 0" class="py-16 text-center">
      <div class="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
      </div>
      <p class="text-sm font-medium text-gray-400">No services listed yet.</p>
    </div>

    <template v-else>
      <!-- Count bar + category filter strip -->
      <div class="flex items-center gap-3 flex-wrap">
        <span class="text-sm font-bold text-gray-900 dark:text-white">{{ pharmacyState.pharmacy.value.services.length }} service{{ pharmacyState.pharmacy.value.services.length !== 1 ? 's' : '' }}</span>
        <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        <!-- All pill -->
        <button
          @click="pharmacyState.activeServiceCategory.value = null"
          class="px-3.5 py-1.5 text-xs font-bold rounded-full transition-all"
          :class="pharmacyState.activeServiceCategory.value === null
            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
        >All</button>
        <!-- Category pills -->
        <button
          v-for="cat in pharmacyState.serviceCategories.value"
          :key="cat.key"
          @click="pharmacyState.activeServiceCategory.value = cat.key"
          class="px-3.5 py-1.5 text-xs font-bold rounded-full transition-all capitalize"
          :class="pharmacyState.activeServiceCategory.value === cat.key
            ? `${pharmacyState.SERVICE_CATEGORY_STYLES[cat.key]?.bg ?? 'bg-gray-500'} text-white`
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
        >{{ cat.label }}</button>
      </div>

      <!-- Service grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          v-for="service in pharmacyState.filteredServices.value"
          :key="service.slug || service.id"
          class="group relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg cursor-default"
          :class="[
            service.category && pharmacyState.SERVICE_CATEGORY_STYLES[service.category]
              ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600'
              : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/50'
          ]"
        >
          <!-- Colored left accent -->
          <div
            class="absolute left-0 top-4 bottom-4 w-0.5 rounded-full"
            :class="pharmacyState.SERVICE_CATEGORY_STYLES[service.category ?? '']?.bg ?? 'bg-gray-300'"
          ></div>

          <!-- Icon -->
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-gray-700/60 transition-transform duration-300 group-hover:scale-110">
            <svg
              class="w-5 h-5"
              :class="pharmacyState.SERVICE_CATEGORY_STYLES[service.category ?? '']?.text ?? 'text-gray-500 dark:text-gray-400'"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                :d="pharmacyState.SERVICE_CATEGORY_STYLES[service.category ?? '']?.icon ?? 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'"
              />
            </svg>
          </div>

          <!-- Content -->
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <h4 class="text-sm font-bold text-gray-900 dark:text-white leading-tight">{{ service.name }}</h4>
              <span
                v-if="service.category"
                class="flex-shrink-0 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700"
                :class="pharmacyState.SERVICE_CATEGORY_STYLES[service.category ?? '']?.text ?? 'text-gray-500'"
              >{{ service.category }}</span>
            </div>
            <p v-if="service.description" class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{{ service.description }}</p>
          </div>
        </div>
      </div>

      <!-- Transition message when filtered -->
      <p v-if="pharmacyState.activeServiceCategory.value && pharmacyState.filteredServices.value.length === 0" class="text-center text-sm text-gray-400 py-8">
        No services in this category.
      </p>
    </template>
  </div>
</template>
