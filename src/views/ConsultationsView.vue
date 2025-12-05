<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { consultationService } from '@/services/consultationService';
import type { ConsultationStats } from '@/types/consultation';
import ConsultationStatsComponent from '@/components/Consultations/ConsultationStats.vue';
import ConsultationList from '@/components/Consultations/ConsultationList.vue';
import CreateConsultationModal from '@/components/Consultations/CreateConsultationModal.vue';
import Button from '@/components/Button.vue';

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
const showCreateModal = ref(false);
const refreshTrigger = ref(0);

const fetchStats = async () => {
  try {
    loadingStats.value = true;
    stats.value = await consultationService.getConsultationStats();
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  } finally {
    loadingStats.value = false;
  }
};

const handleConsultationCreated = () => {
  refreshTrigger.value++;
  fetchStats();
};

onMounted(() => {
  fetchStats();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Consultations</h1>
        <p class="text-gray-600 mt-1">Manage your medical consultations and history</p>
      </div>
      <Button variant="primary" @click="showCreateModal = true">
        <span class="i-heroicons-plus w-5 h-5 mr-2"></span>
        New Consultation
      </Button>
    </div>

    <ConsultationStatsComponent :stats="stats" :loading="loadingStats" />

    <div class="mt-8">
      <ConsultationList :refresh-trigger="refreshTrigger" />
    </div>

    <CreateConsultationModal
      :is-open="showCreateModal"
      @close="showCreateModal = false"
      @created="handleConsultationCreated"
    />
  </div>
</template>
