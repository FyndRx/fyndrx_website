<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { consultationService } from '@/services/consultationService';
import type { Consultation, ConsultationFilters } from '@/types/consultation';
import DataTable, { type DataTableColumn } from '@/components/DataTable.vue';
import { format } from 'date-fns';
import Pagination from '@/components/Pagination.vue';
import Dropdown from '@/components/Dropdown.vue';
import TextInput from '@/components/TextInput.vue';

const props = defineProps<{
  refreshTrigger?: number;
}>();

const columns: DataTableColumn[] = [
  { key: 'consultation', label: 'Consultation', primary: true, cellClass: 'whitespace-nowrap' },
  { key: 'type', label: 'Type', hideBelow: 1280 },
  { key: 'summary', label: 'Summary' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'flags', label: 'Follow-up' },
  { key: 'actions', label: '', align: 'right', cellClass: 'whitespace-nowrap' },
];

const statusChip = (status?: string) => {
  switch (status) {
    case 'pending': return 'bg-accent-500/15 text-accent-700 dark:text-accent-300';
    case 'in_review': return 'bg-brand-500/10 text-brand-700 dark:text-brand-300';
    case 'responded':
    case 'completed': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    case 'cancelled': return 'bg-red-500/10 text-red-700 dark:text-red-400';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-300';
  }
};

const priorityChip = (priority?: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-500/10 text-red-700 dark:text-red-400';
    case 'high': return 'bg-accent-500/15 text-accent-700 dark:text-accent-300';
    case 'normal': return 'bg-brand-500/10 text-brand-700 dark:text-brand-300';
    default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-300';
  }
};

const label = (v?: string) => (v ? v.replace(/_/g, ' ') : '');

const shortDate = (d?: string) => {
  try {
    const date = new Date(d || '');
    return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM d, yyyy');
  } catch {
    return 'N/A';
  }
};

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

const handlePerPageChange = (perPage: number) => {
  filters.value.per_page = perPage;
  filters.value.page = 1;
  fetchConsultations();
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
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">My Consultations</h2>
    </div>

    <!-- Filter Bar -->
    <div class="p-4 mb-6 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
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
            <span v-if="filters.status" class="px-2.5 py-1 bg-brand-500/10 text-brand-700 dark:text-brand-300 rounded-full">Status: {{ filters.status.replace('_', ' ') }}</span>
            <span v-if="filters.priority" class="px-2.5 py-1 bg-accent-500/15 text-accent-700 dark:text-accent-300 rounded-full">Priority: {{ filters.priority }}</span>
            <span v-if="filters.type" class="px-2.5 py-1 bg-brand-500/10 text-brand-700 dark:text-brand-300 rounded-full">Type: {{ filters.type.replace('_', ' ') }}</span>
          </div>
          <button 
            @click="clearFilters" 
            class="text-red-600 dark:text-red-400 hover:text-red-700 font-medium px-3 py-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20"
          >
            Clear Filters
          </button>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :rows="consultations"
      :row-key="(c) => c.id"
      caption="Your consultations"
      clickable
      :loading="loading"
      :skeleton-rows="4"
      @row-click="handleView"
    >
      <template #cell-consultation="{ row: c }">
        <p class="font-mono text-sm font-semibold text-gray-900 dark:text-white">#{{ c.consultation_number }}</p>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{{ shortDate(c.created_at) }}</p>
      </template>

      <template #cell-type="{ row: c }">
        <span class="text-sm text-gray-700 capitalize dark:text-gray-200">{{ label(c.consultation_type) || 'General' }}</span>
        <span v-if="c.scheduled_at" class="block text-xs text-brand-600 dark:text-brand-300">Scheduled</span>
      </template>

      <template #cell-summary="{ row: c }">
        <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 md:max-w-[18rem] text-left">
          {{ c.chief_complaint || c.symptoms || 'Awaiting pharmacist review' }}
        </p>
      </template>

      <template #cell-priority="{ row: c }">
        <span class="inline-flex items-center px-2.5 py-1 text-xs font-medium capitalize rounded-full" :class="priorityChip(c.priority)">{{ c.priority }}</span>
      </template>

      <template #cell-status="{ row: c }">
        <span class="inline-flex items-center px-2.5 py-1 text-xs font-medium capitalize rounded-full whitespace-nowrap" :class="statusChip(c.status)">{{ label(c.status) || 'Unknown' }}</span>
      </template>

      <template #cell-flags="{ row: c }">
        <div class="flex flex-wrap items-center gap-1.5 md:justify-start justify-end">
          <span v-if="c.parent_consultation_id" class="px-2.5 py-1 text-xs font-medium rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300">Follow-up</span>
          <span v-if="c.follow_up_consultations?.length" class="px-2.5 py-1 text-xs font-medium rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300">{{ c.follow_up_consultations.length }} thread{{ c.follow_up_consultations.length === 1 ? '' : 's' }}</span>
          <span v-else-if="c.requires_followup" class="px-2.5 py-1 text-xs font-medium rounded-full bg-accent-500/15 text-accent-700 dark:text-accent-300">Needed</span>
          <span v-if="c.diagnoses?.length" class="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-500/10 text-gray-700 dark:text-gray-300">{{ c.diagnoses.length }} dx</span>
          <span v-if="!c.parent_consultation_id && !c.follow_up_consultations?.length && !c.requires_followup && !c.diagnoses?.length" class="text-sm text-gray-400">—</span>
        </div>
      </template>

      <template #cell-actions="{ row: c }">
        <button
          type="button"
          class="px-4 py-1.5 text-sm font-medium transition duration-200 rounded-full text-brand-600 bg-brand-500/10 ease-out-quart hover:bg-brand-500 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:text-brand-300 dark:hover:text-white"
          :aria-label="`View consultation ${c.consultation_number}`"
          @click.stop="handleView(c)"
        >View</button>
      </template>

      <template #empty>
        <div class="px-6 py-16 text-center">
          <h3 class="mb-2 text-xl font-medium text-gray-900 dark:text-white">No consultations found</h3>
          <p class="text-gray-600 dark:text-gray-300">{{ filters.search || filters.status || filters.priority || filters.type ? 'Nothing matches your filters.' : "You haven't created any consultations yet." }}</p>
        </div>
      </template>

      <template #footer>
        <Pagination
          embedded
          :current-page="meta.current_page ?? 1"
          :total-pages="meta.last_page ?? 1"
          :total-items="meta.total ?? consultations.length"
          :per-page="meta.per_page ?? filters.per_page ?? 10"
          :per-page-options="[10, 25, 50, 100]"
          @update:page="handlePageChange"
          @update:per-page="handlePerPageChange"
        />
      </template>
    </DataTable>
  </div>
</template>
