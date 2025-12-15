<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { consultationService } from '@/services/consultationService';
import type { ConsultationStats } from '@/types/consultation';
import ConsultationStatsComponent from '@/components/Consultations/ConsultationStats.vue';
import ConsultationList from '@/components/Consultations/ConsultationList.vue';
import Button from '@/components/Button.vue';
import { PlusIcon } from '@heroicons/vue/24/solid';

const router = useRouter();

const stats = ref<ConsultationStats>({
  total: 0,
  pending: 0,
  in_review: 0,
  responded: 0,
  completed: 0,
  cancelled: 0,
  requires_followup: 0,
  average_rating: 0,
  total_rated: 0
});

const loadingStats = ref(false);
const refreshTrigger = ref(0);

const fetchStats = async () => {
  try {
    loadingStats.value = true;
    const response = await consultationService.getConsultationStats();
    // Handle potential data wrapper
    stats.value = (response as any).data || response;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  } finally {
    loadingStats.value = false;
  }
};

const goToCreate = () => {
  router.push({ name: 'create-consultation' });
};

onMounted(() => {
  fetchStats();
});
</script>

<template>
  <div class="container mx-auto px-4 pt-28 pb-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Consultations</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Manage your medical consultations and history</p>
      </div>
      <Button variant="primary" @click="goToCreate">
        <PlusIcon class="w-5 h-5 mr-2" />
        New Consultation
      </Button>
    </div>

    <ConsultationStatsComponent :stats="stats" :loading="loadingStats" />

    <div class="mt-8">
      <ConsultationList :refresh-trigger="refreshTrigger" />
    </div>
  </div>
</template>
