<script setup lang="ts">
import { inject } from 'vue';
import type { useBranchDetail } from '@/composables/useBranchDetail';

const branchState = inject<ReturnType<typeof useBranchDetail>>('branchState')!;
</script>

<template>
  <section v-if="branchState.branch.value">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-1 h-7 bg-emerald-500 rounded-full"></div>
      <h2 class="text-xl font-black text-gray-900 dark:text-white">Contact & Info</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div class="space-y-1">
        <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</p>
        <a :href="`tel:${branchState.branch.value.phone}`" class="block text-lg font-black text-gray-900 dark:text-white hover:text-[#246BFD] transition-colors">{{ branchState.branch.value.phone }}</a>
        <a v-if="branchState.branch.value.whatsappNumber" :href="branchState.whatsappUrl.value!" target="_blank" class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.546 5.878L0 24l6.269-1.519A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.91 0-3.697-.504-5.244-1.383l-.374-.222-3.893.943.976-3.79-.244-.39A9.97 9.97 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
          WhatsApp
        </a>
      </div>
      <div v-if="branchState.branch.value.email || branchState.branch.value.website" class="space-y-1">
        <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Online</p>
        <a v-if="branchState.branch.value.email" :href="`mailto:${branchState.branch.value.email}`" class="block text-sm font-semibold text-gray-900 dark:text-white hover:text-[#246BFD] transition-colors truncate">{{ branchState.branch.value.email }}</a>
        <a v-if="branchState.branch.value.website" :href="branchState.branch.value.website" target="_blank" class="inline-flex items-center gap-1 text-sm font-semibold text-[#246BFD] hover:underline">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          Visit website
        </a>
      </div>
      <div v-if="branchState.branch.value.managerName" class="space-y-1">
        <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Manager</p>
        <p class="text-base font-black text-gray-900 dark:text-white">{{ branchState.branch.value.managerName }}</p>
        <a v-if="branchState.branch.value.managerPhone" :href="`tel:${branchState.branch.value.managerPhone}`" class="block text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline">{{ branchState.branch.value.managerPhone }}</a>
        <a v-if="branchState.branch.value.managerEmail" :href="`mailto:${branchState.branch.value.managerEmail}`" class="block text-sm text-gray-500 hover:text-[#246BFD] truncate">{{ branchState.branch.value.managerEmail }}</a>
      </div>
      <div v-if="(branchState.branch.value.languages ?? []).length > 0" class="space-y-2">
        <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Languages Spoken</p>
        <div class="flex flex-wrap gap-1.5">
          <span v-for="lang in branchState.branch.value.languages" :key="lang" class="px-3 py-1 text-xs font-bold rounded-full bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800/30">{{ lang }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
