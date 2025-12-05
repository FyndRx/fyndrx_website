<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { consultationService } from '@/services/consultationService';
import type { Consultation, ConsultationFilters } from '@/types/consultation';
import ConsultationCard from './ConsultationCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import Pagination from '@/components/Pagination.vue';
import Dropdown from '@/components/Dropdown.vue';

const props = defineProps<{
  refreshTrigger?: number;
}>();

const loading = ref(false);
const consultations = ref<Consultation[]>([]);
const meta = ref<any>({});

const filters = ref<ConsultationFilters>({
  page: 1,
  per_page: 10,
  sort_by: 'created_at',
  sort_order: 'desc'
});

const sortOptions = [
  { label: 'Newest First', value: 'created_at:desc' },
  { label: 'Oldest First', value: 'created_at:asc' },
  { label: 'Priority (High-Low)', value: 'priority:desc' },
  { label: 'Priority (Low-High)', value: 'priority:asc' }
];

const selectedSort = ref('created_at:desc');

const fetchConsultations = async () => {
  try {
    loading.value = true;
    const [sortBy, sortOrder] = selectedSort.value.split(':');
    filters.value.sort_by = sortBy;
    filters.value.sort_order = sortOrder as 'asc' | 'desc';
    
    const response = await consultationService.getConsultations(filters.value);
    
    // Handle both array response and paginated response structure
    if (Array.isArray(response)) {
      consultations.value = response;
    } else if (response && (response as any).data) {
      consultations.value = (response as any).data;
      meta.value = (response as any).meta || {};
    }
  } catch (error) {
    console.error('Failed to fetch consultations:', error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  filters.value.page = page;
  fetchConsultations();
};

const handleCancel = async (consultation: Consultation) => {
  if (!confirm('Are you sure you want to cancel this consultation?')) return;
  
  try {
    await consultationService.cancelConsultation(consultation.id, 'User cancelled');
    fetchConsultations();
  } catch (error) {
    console.error('Failed to cancel consultation:', error);
  }
};

watch(() => props.refreshTrigger, () => {
  fetchConsultations();
});

watch(selectedSort, () => {
  filters.value.page = 1;
  fetchConsultations();
});

const router = useRouter();

const handleView = (consultation: Consultation) => {
  router.push({ name: 'consultation-detail', params: { id: consultation.id } });
};

onMounted(() => {
  fetchConsultations();
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-white">My Consultations</h2>
      <div class="w-48">
        <Dropdown
          v-model="selectedSort"
          :options="sortOptions"
          placeholder="Sort by"
        />
      </div>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl h-40 border border-gray-200 dark:border-gray-700"></div>
    </div>

    <div v-else-if="consultations.length > 0" class="space-y-4">
      <ConsultationCard
        v-for="consultation in consultations"
        :key="consultation.id"
        :consultation="consultation"
        @cancel="handleCancel"
        @view="handleView"
      />
      
      <Pagination
        v-if="meta.last_page > 1"
        :current-page="meta.current_page"
        :total-pages="meta.last_page"
        :total-items="meta.total"
        :per-page="meta.per_page"
        @page-change="handlePageChange"
        @update:per-page="(val) => { filters.per_page = val; fetchConsultations(); }"
        class="mt-6"
      />
    </div>

    <EmptyState
      v-else
      title="No consultations found"
      description="You haven't created any consultations yet."
      icon="chat-bubble-left-right"
    />
  </div>
</template>
