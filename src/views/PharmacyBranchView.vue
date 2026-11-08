<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { useRouter } from 'vue-router';
import NotFoundState from '@/components/NotFoundState.vue';
import AddReviewModal from '@/components/AddReviewModal.vue';
import { useBranchDetail } from '@/composables/useBranchDetail';

import BranchHero from '@/components/Branch/BranchHero.vue';
import BranchStatusStrip from '@/components/Branch/BranchStatusStrip.vue';
import BranchAbout from '@/components/Branch/BranchAbout.vue';
import BranchContactInfo from '@/components/Branch/BranchContactInfo.vue';
import BranchPaymentMethods from '@/components/Branch/BranchPaymentMethods.vue';
import BranchDelivery from '@/components/Branch/BranchDelivery.vue';
import BranchServices from '@/components/Branch/BranchServices.vue';
import BranchHours from '@/components/Branch/BranchHours.vue';
import BranchLocation from '@/components/Branch/BranchLocation.vue';
import BranchMedications from '@/components/Branch/BranchMedications.vue';
import BranchReviews from '@/components/Branch/BranchReviews.vue';
import BranchFooterActions from '@/components/Branch/BranchFooterActions.vue';

const router = useRouter();
const branchState = useBranchDetail();
provide('branchState', branchState);

onMounted(() => {
  branchState.initializeData();
});
</script>

<template>
  <div class="relative min-h-screen pt-24 pb-20 isolate overflow-x-clip">
    <!-- Same pastel canvas as the rest of the site -->
    <div class="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <div class="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-accent-50/70 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950"></div>
      <div class="absolute top-[4%] -right-72 h-[40rem] w-[40rem] rounded-full bg-brand-200/40 blur-[130px] dark:bg-brand-500/10"></div>
      <div class="absolute top-[40%] -left-72 h-[40rem] w-[40rem] rounded-full bg-accent-200/40 blur-[130px] dark:bg-transparent"></div>
      <div class="absolute top-[78%] -right-72 h-[40rem] w-[40rem] rounded-full bg-brand-200/35 blur-[130px] dark:bg-brand-500/10"></div>
    </div>

    <!-- Loading -->
    <div v-if="branchState.loading.value" class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div class="w-10 h-10 border-2 rounded-full border-brand-500 border-t-transparent animate-spin"></div>
      <p class="text-sm text-gray-500 dark:text-gray-400">Loading branch details…</p>
    </div>

    <!-- Error -->
    <NotFoundState
      v-else-if="branchState.error.value === '404'"
      title="Branch Not Found"
      message="We couldn't find the pharmacy branch you're looking for. It may have been removed or you might have followed a broken link."
      actionText="Browse Pharmacies"
      :actionRoute="{ name: 'pharmacies' }"
    />
    <div v-else-if="branchState.error.value" class="max-w-2xl mx-auto px-4 py-24 text-center">
      <p class="mb-4 font-medium text-red-600 dark:text-red-400">{{ branchState.error.value }}</p>
      <button type="button" @click="router.back()" class="px-6 py-3 text-sm font-medium text-white transition duration-200 rounded-full shadow-glow-brand bg-brand-500 ease-out-quart hover:bg-brand-600 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30">Go back</button>
    </div>

    <template v-else-if="branchState.branch.value">

      <BranchHero />
      <BranchStatusStrip />

      <div class="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 mt-6">
        <BranchAbout />
        <BranchContactInfo />
        <BranchPaymentMethods />
        <BranchDelivery />
        <BranchServices />
        <BranchHours />
        <BranchLocation />
        <BranchMedications />
        <BranchReviews />
        <BranchFooterActions />
      </div>
    </template>

    <AddReviewModal
      :show="branchState.showReviewModal.value"
      target-type="pharmacy"
      :target-id="branchState.pharmacyId"
      :target-name="branchState.branch.value?.branchName ?? branchState.pharmacyName.value"
      @close="branchState.showReviewModal.value = false"
      @submit="branchState.handleAddReview"
    />
  </div>
</template>
