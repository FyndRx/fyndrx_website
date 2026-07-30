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
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-20">

    <!-- Loading -->
    <div v-if="branchState.loading.value" class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div class="w-12 h-12 border-t-2 border-b-2 border-[#246BFD] rounded-full animate-spin"></div>
      <p class="text-sm font-semibold text-gray-500">Loading branch details…</p>
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
      <p class="text-red-500 font-semibold mb-4">{{ branchState.error.value }}</p>
      <button @click="router.back()" class="px-6 py-2.5 rounded-xl bg-[#246BFD] text-white text-sm font-bold">Go back</button>
    </div>

    <template v-else-if="branchState.branch.value">

      <BranchHero />
      <BranchStatusStrip />

      <div class="max-w-5xl mx-auto px-4 sm:px-6 space-y-14 mt-10">
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
