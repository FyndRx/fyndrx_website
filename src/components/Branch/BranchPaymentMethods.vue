<script setup lang="ts">
import { inject } from 'vue';
import type { useBranchDetail } from '@/composables/useBranchDetail';

const branchState = inject<ReturnType<typeof useBranchDetail>>('branchState')!;
</script>

<template>
  <section v-if="branchState.branch.value && (branchState.branch.value.acceptedPaymentMethods ?? []).length > 0">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-1 h-7 bg-amber-500 rounded-full"></div>
      <h2 class="text-xl font-black text-gray-900 dark:text-white">Payment Methods</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-if="branchState.hasOnlinePay.value" class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#246BFD] to-[#5089FF] p-6 shadow-lg shadow-blue-500/20">
        <div class="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10"></div>
        <div class="absolute top-8 -right-2 w-16 h-16 rounded-full bg-white/8"></div>
        <div class="relative z-10 flex items-start justify-between mb-8">
          <div><p class="text-[10px] font-black uppercase tracking-widest text-white/60">Accepted</p><p class="text-xl font-black text-white">Online Payment</p></div>
          <div class="flex flex-col items-center gap-1.5">
            <div class="w-10 h-7 rounded-md bg-white/20 border border-white/30 relative overflow-hidden"><div class="absolute inset-y-0 left-1/2 w-px bg-white/30"></div><div class="absolute inset-x-0 top-1/2 h-px bg-white/30"></div></div>
            <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"/></svg>
          </div>
        </div>
        <div class="relative z-10 flex items-center justify-between">
          <div class="flex items-center gap-2"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2v-8a2 2 0 00-2-2H8a2 2 0 00-2 2v8a2 2 0 002 2zm0-10V9a4 4 0 118 0v2"/></svg><span class="text-sm font-semibold text-white/80">Secure · Instant</span></div>
          <div class="flex gap-1"><div class="w-8 h-5 rounded bg-white/20 border border-white/30"></div><div class="w-8 h-5 rounded bg-white/10 border border-white/20"></div></div>
        </div>
      </div>
      <div v-if="branchState.hasCashPOS.value" class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-700 dark:to-gray-600 p-6 shadow-lg">
        <div class="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-white/5"></div>
        <div class="absolute -bottom-2 right-10 w-16 h-16 rounded-full bg-white/4"></div>
        <div class="relative z-10 flex items-start justify-between mb-8">
          <div><p class="text-[10px] font-black uppercase tracking-widest text-white/50">Accepted</p><p class="text-xl font-black text-white">Cash & POS</p></div>
          <div class="flex gap-2 items-center">
            <div class="w-9 h-12 rounded-lg bg-white/15 border border-white/20 flex flex-col items-center justify-between py-1.5 px-1"><div class="w-full h-2 rounded-sm bg-white/30"></div><div class="space-y-0.5 w-full px-0.5"><div class="h-px bg-white/20 rounded"></div><div class="h-px bg-white/20 rounded"></div><div class="h-px bg-white/20 rounded w-2/3"></div></div><div class="w-4 h-3 rounded-sm bg-emerald-500/70"></div></div>
            <div class="w-12 h-7 rounded-md bg-emerald-600/40 border border-emerald-500/30 flex items-center justify-center"><div class="w-4 h-4 rounded-full border border-emerald-400/50 flex items-center justify-center"><span class="text-[8px] font-black text-emerald-300">₵</span></div></div>
          </div>
        </div>
        <div class="relative z-10 flex items-center gap-2"><svg class="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg><span class="text-sm font-semibold text-white/70">Cash · Debit · Credit</span></div>
      </div>
    </div>
  </section>
</template>
