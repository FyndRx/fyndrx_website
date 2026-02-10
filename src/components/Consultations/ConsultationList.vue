<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { consultationService } from '@/services/consultationService';
import type { Consultation, ConsultationFilters } from '@/types/consultation';
import ConsultationCard from './ConsultationCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import Pagination from '@/components/Pagination.vue';
import Dropdown from '@/components/Dropdown.vue';
import TextInput from '@/components/TextInput.vue';

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
    
    // Remove undefined/empty filters
    const activeFilters = { ...filters.value };
    if (!activeFilters.search) delete activeFilters.search;
    if (!activeFilters.status) delete activeFilters.status;
    if (!activeFilters.priority) delete activeFilters.priority;
    if (!activeFilters.type) delete activeFilters.type;

    const response = await consultationService.getConsultations(activeFilters);
    
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

let debounceTimer: any = null;
const debounceFetch = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    filters.value.page = 1;
    fetchConsultations();
  }, 500);
};

const clearFilters = () => {
  filters.value.search = undefined;
  filters.value.status = undefined;
  filters.value.priority = undefined;
  filters.value.type = undefined;
  filters.value.page = 1;
  fetchConsultations();
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
    </div>

    <!-- Filter Bar -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <!-- Search -->
        <div class="lg:col-span-2">
           <TextInput
             :model-value="filters.search || ''"
             @update:modelValue="(val: string) => { filters.search = val; debounceFetch(); }"
             placeholder="Search by consultation number..." 
             type="search"
             variant="outlined"
             class="w-full"
           />
        </div>

        <!-- Status Filter -->
        <div>
           <Dropdown 
             :model-value="filters.status || ''"
             @update:modelValue="(val: any) => { filters.status = (val as any) || undefined; fetchConsultations(); }"
             :options="[
               { label: 'All Statuses', value: '' },
               { label: 'Pending', value: 'pending' },
               { label: 'In Review', value: 'in_review' },
               { label: 'Responded', value: 'responded' },
               { label: 'Completed', value: 'completed' },
               { label: 'Cancelled', value: 'cancelled' }
             ]"
             placeholder="Status"
             variant="outlined"
           />
        </div>

        <!-- Priority Filter -->
        <div>
           <Dropdown 
             :model-value="filters.priority || ''"
             @update:modelValue="(val: any) => { filters.priority = (val as any) || undefined; fetchConsultations(); }"
             :options="[
               { label: 'All Priorities', value: '' },
               { label: 'Urgent', value: 'urgent' },
               { label: 'High', value: 'high' },
               { label: 'Normal', value: 'normal' },
               { label: 'Low', value: 'low' }
             ]"
             placeholder="Priority"
             variant="outlined"
           />
        </div>

        <!-- Type Filter -->
        <div>
           <Dropdown 
             :model-value="filters.type || ''"
             @update:modelValue="(val: any) => { filters.type = (val as any) || undefined; fetchConsultations(); }"
             :options="[
               { label: 'All Types', value: '' },
               { label: 'General', value: 'general' },
               { label: 'Med Review', value: 'medication_review' },
               { label: 'Chronic Disease', value: 'chronic_disease' },
               { label: 'Acute Illness', value: 'acute_illness' },
               { label: 'Wellness', value: 'wellness' },
               { label: 'Vaccination', value: 'vaccination' }
             ]"
             placeholder="Type"
             variant="outlined"
           />
        </div>

        <!-- Sort -->
        <div>
           <Dropdown
             v-model="selectedSort"
             :options="sortOptions"
             placeholder="Sort by"
             variant="outlined"
           />
        </div>
      </div>
      
      <!-- Active Filters Summary & Clear -->
      <div v-if="filters.search || filters.status || filters.priority || filters.type" class="mt-4 flex items-center justify-between text-xs animate-fade-in-down">
          <div class="flex flex-wrap gap-2">
            <span v-if="filters.status" class="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg border border-blue-100 dark:border-blue-900/30">Status: {{ filters.status.replace('_', ' ') }}</span>
            <span v-if="filters.priority" class="px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg border border-orange-100 dark:border-orange-900/30">Priority: {{ filters.priority }}</span>
            <span v-if="filters.type" class="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg border border-purple-100 dark:border-purple-900/30">Type: {{ filters.type.replace('_', ' ') }}</span>
          </div>
          <button 
            @click="clearFilters" 
            class="text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Clear Filters
          </button>
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
