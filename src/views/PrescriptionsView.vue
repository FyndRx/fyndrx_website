<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { prescriptionService } from '@/services/prescription';
import { consultationService } from '@/services/consultationService';
import type { Prescription, PrescriptionDrug } from '@/models/Prescription';
import {
  DocumentTextIcon,
  PlusIcon,
  BeakerIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  XMarkIcon,
  SparklesIcon,
  ArrowUpTrayIcon,
  ShoppingCartIcon,
  InformationCircleIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/vue/24/outline';
import DataTable, { type DataTableColumn } from '@/components/DataTable.vue';
import TableSearch from '@/components/TableSearch.vue';
import Pagination from '@/components/Pagination.vue';
import { useServerTable } from '@/composables/useServerTable';
import StatusBadge from '@/components/StatusBadge.vue';
import { getStatusColor } from '@/utils/statusColors';

type StatusKey = 'active' | 'dispensed' | 'pending' | 'expired' | 'cancelled' | 'completed';
type FilterKey = 'all' | StatusKey;

const router = useRouter();
const selectedPrescription = ref<Prescription | null>(null);
const counts = ref<Record<FilterKey, number>>({
  all: 0, active: 0, dispensed: 0, pending: 0, expired: 0, cancelled: 0, completed: 0,
});
const tableTop = ref<HTMLElement | null>(null);

// Search, filter, page and per-page are all handled server-side
const {
  rows: prescriptions,
  loading,
  q: search,
  filter: selectedFilter,
  page,
  perPage,
  total,
  lastPage,
  setPage,
  setPerPage,
} = useServerTable<Prescription, FilterKey>({
  initialFilter: 'all',
  scrollTarget: tableTop,
  fetcher: async ({ page, perPage, q, filter }) => {
    const { prescriptions: rows, meta } = await prescriptionService.getPrescriptions({
      status: filter,
      q: q || undefined,
      per_page: perPage,
      page,
    });
    if (meta?.counts) counts.value = meta.counts;
    return { rows, meta };
  },
});

// ── Filters ───────────────────────────────────────────────────
const filters: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'active',    label: 'Active'    },
  { key: 'pending',   label: 'Pending'   },
  { key: 'dispensed', label: 'Dispensed' },
  { key: 'completed', label: 'Completed' },
  { key: 'expired',   label: 'Expired'   },
  { key: 'cancelled', label: 'Cancelled' },
];

const filterCount = (key: FilterKey) => counts.value[key];

// ── Helpers ───────────────────────────────────────────────────
const formatDate = (d?: string | null) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getDrugLabel = (drug: PrescriptionDrug & { display_name?: string; drug_name?: string }) => {
  if (drug.brand_name) return drug.brand_name;
  const raw = (drug as any).display_name || (drug as any).drug_name || drug.name || '';
  return raw.split('•')[0].trim() || raw;
};

const originConfig = (origin?: string) => {
  if (origin === 'consultation') return { label: 'Consultation', icon: SparklesIcon, bg: 'bg-brand-500/10', text: 'text-brand-700 dark:text-brand-300' };
  return                                { label: 'Uploaded',     icon: ArrowUpTrayIcon, bg: 'bg-accent-500/15', text: 'text-accent-700 dark:text-accent-300' };
};

const columns: DataTableColumn[] = [
  { key: 'prescription', label: 'Prescription', primary: true },
  { key: 'origin', label: 'Source', hideBelow: 1400, cellClass: 'whitespace-nowrap' },
  { key: 'doctor', label: 'Prescriber', hideBelow: 1400 },
  { key: 'date', label: 'Issued', cellClass: 'whitespace-nowrap' },
  { key: 'drugs', label: 'Medications' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '', align: 'right', cellClass: 'whitespace-nowrap' },
];

// ── Consultation link ─────────────────────────────────────────
const consultationLoading = ref(false);

const extractConsultationNumber = (notes?: string | null): string | null => {
  if (!notes) return null;
  const match = notes.match(/CONS-[A-Z0-9-]+/i);
  return match ? match[0].toUpperCase() : null;
};

const openConsultation = async (rx: Prescription) => {
  const consultationNumber = extractConsultationNumber(rx.notes);
  if (!consultationNumber) return;
  try {
    consultationLoading.value = true;
    const results = await consultationService.getConsultations({ search: consultationNumber } as any);
    const list = Array.isArray(results) ? results : (results as any).data ?? [];
    const found = list.find((c: any) =>
      c.consultation_number?.toUpperCase() === consultationNumber
    ) ?? list[0];
    if (found) {
      selectedPrescription.value = null;
      router.push({ name: 'consultation-detail', params: { id: found.id } });
    }
  } catch { /* silently ignore */ }
  finally { consultationLoading.value = false; }
};

// ── Order modal ───────────────────────────────────────────────
const showOrderModal = ref(false);
const orderPrescription = ref<Prescription | null>(null);

const openOrderModal = (rx: Prescription) => {
  orderPrescription.value = rx;
  showOrderModal.value = true;
};

const goToMedication = (drug: PrescriptionDrug) => {
  showOrderModal.value = false;
  selectedPrescription.value = null;
  const id = drug.product_id ?? drug.drug_id;
  router.push({ name: 'MedicationDetail', params: { id } });
};

</script>

<template>
  <div class="pb-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <!-- ── Header ──────────────────────────────────────────── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-medium text-gray-900 sm:text-4xl dark:text-white">My <span class="text-brand-500 dark:text-brand-400">Prescriptions</span></h1>
          <p class="mt-1 text-gray-600 dark:text-gray-300">Track, manage and order from your medical prescriptions.</p>
        </div>
        <button
          type="button"
          @click="router.push({ name: 'upload-prescription' })"
          class="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition duration-200 rounded-full shadow-glow-brand shrink-0 bg-brand-500 ease-out-quart hover:bg-brand-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
        >
          <PlusIcon class="w-4 h-4" />
          Upload Prescription
        </button>
      </div>

      <!-- ── Filters ─────────────────────────────────────────── -->
      <div ref="tableTop" class="flex flex-col gap-3 mb-4 scroll-mt-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="w-full lg:max-w-sm">
          <TableSearch v-model="search" placeholder="Search title, Rx number or medication…" label="Search prescriptions" />
        </div>
      <div class="flex gap-2 px-1 py-2 -mx-1 overflow-x-auto" role="group" aria-label="Filter prescriptions">
        <button
          v-for="f in filters"
          :key="f.key"
          type="button"
          :aria-pressed="selectedFilter === f.key"
          @click="selectedFilter = f.key"
          class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-full transition duration-200 ease-out-quart active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
          :class="selectedFilter === f.key
            ? 'bg-brand-500 text-white shadow-glow-brand'
            : 'bg-white/80 text-gray-700 ring-1 ring-gray-200 backdrop-blur hover:ring-brand-500 hover:text-brand-600 dark:bg-white/5 dark:text-gray-200 dark:ring-white/10 dark:hover:text-brand-300'"
        >
          {{ f.label }}
          <span
            class="text-xs px-1.5 py-0.5 rounded-full font-semibold"
            :class="selectedFilter === f.key ? 'bg-white/25 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'"
          >{{ filterCount(f.key) }}</span>
        </button>
      </div>
      </div>

      <!-- ── Table ───────────────────────────────────────────── -->
      <DataTable
        :columns="columns"
        :rows="prescriptions"
        :row-key="(rx) => rx.id"
        caption="Your prescriptions"
        clickable
        :loading="loading"
        @row-click="(rx) => (selectedPrescription = rx)"
      >
        <template #cell-prescription="{ row: rx }">
          <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ rx.title || 'Prescription' }}</p>
          <p class="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400">{{ rx.prescription_number }}</p>
        </template>

        <template #cell-origin="{ row: rx }">
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            :class="[originConfig((rx as any).origin).bg, originConfig((rx as any).origin).text]"
          >
            <component :is="originConfig((rx as any).origin).icon" class="w-3.5 h-3.5" />
            {{ originConfig((rx as any).origin).label }}
          </span>
        </template>

        <template #cell-doctor="{ row: rx }">
          <span class="text-sm text-gray-700 dark:text-gray-200">{{ rx.doctor_name || '—' }}</span>
        </template>

        <template #cell-date="{ row: rx }">
          <span class="text-sm text-gray-600 dark:text-gray-300">{{ formatDate(rx.prescription_date) }}</span>
        </template>

        <template #cell-drugs="{ row: rx }">
          <div class="text-left md:max-w-[16rem]">
            <template v-if="rx.drugs && rx.drugs.length">
              <p class="text-sm text-gray-800 truncate dark:text-gray-100">
                {{ rx.drugs.slice(0, 2).map((d) => getDrugLabel(d as any)).join(', ') }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ rx.drugs.length }} {{ rx.drugs.length === 1 ? 'medication' : 'medications' }}<template v-if="rx.drugs.length > 2"> · +{{ rx.drugs.length - 2 }} more</template>
              </p>
            </template>
            <p v-else class="text-sm italic text-gray-400 dark:text-gray-500">No medications listed</p>
          </div>
        </template>

        <template #cell-status="{ row: rx }">
          <StatusBadge :status="rx.status" size="sm" show-dot />
        </template>

        <template #cell-actions="{ row: rx }">
          <div class="flex items-center justify-end gap-2">
            <button
              v-if="rx.status === 'active' && rx.drugs?.length"
              type="button"
              class="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white transition duration-200 rounded-full shadow-glow-brand bg-brand-500 ease-out-quart hover:bg-brand-600 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
              @click.stop="openOrderModal(rx)"
            >
              <ShoppingCartIcon class="w-4 h-4" />
              Order
            </button>
            <button
              type="button"
              class="flex items-center justify-center text-gray-500 transition duration-200 rounded-full w-9 h-9 ease-out-quart hover:bg-brand-500 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:text-gray-300"
              :aria-label="`View details of ${rx.title || 'prescription'}`"
              @click.stop="selectedPrescription = rx"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </template>

        <template #empty>
          <div class="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div class="flex items-center justify-center w-20 h-20 mb-5 rounded-full bg-brand-500/10">
              <DocumentTextIcon class="w-10 h-10 text-brand-500" />
            </div>
            <h3 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">No prescriptions found</h3>
            <p class="max-w-xs mb-6 text-sm text-gray-500 dark:text-gray-400">
              {{ search ? `Nothing matches “${search}”.` : selectedFilter === 'all' ? 'Upload your first prescription to get started.' : `You have no ${selectedFilter} prescriptions.` }}
            </p>
            <button
              v-if="search"
              type="button"
              @click="search = ''"
              class="px-6 py-3 text-sm font-medium text-white transition duration-200 rounded-full shadow-glow-brand bg-brand-500 ease-out-quart hover:bg-brand-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
            >Clear search</button>
            <button
              v-else-if="selectedFilter === 'all'"
              type="button"
              @click="router.push({ name: 'upload-prescription' })"
              class="px-6 py-3 text-sm font-medium text-white transition duration-200 rounded-full shadow-glow-brand bg-brand-500 ease-out-quart hover:bg-brand-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
            >Upload Prescription</button>
          </div>
        </template>

        <template #footer>
          <Pagination
            embedded
            :current-page="page"
            :total-pages="lastPage"
            :total-items="total"
            :per-page="perPage"
            :per-page-options="[10, 25, 50, 100]"
            @update:page="setPage"
            @update:per-page="setPerPage"
          />
        </template>
      </DataTable>
    </div>

    <!-- ── Detail drawer ───────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="drawer">
        <div
          v-if="selectedPrescription"
          class="fixed inset-0 z-50 flex justify-end"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="selectedPrescription = null" />

          <!-- Panel -->
          <div class="relative w-full max-w-xl h-full bg-white dark:bg-gray-900 shadow-card flex flex-col overflow-hidden">

            <!-- Sticky header -->
            <div class="shrink-0 bg-gradient-to-r from-[#1A2233] to-brand-500 px-6 pt-6 pb-5">
              <div class="flex items-start justify-between mb-3">
                <div
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 text-white"
                >
                  <component :is="originConfig((selectedPrescription as any).origin).icon" class="w-3.5 h-3.5" />
                  {{ originConfig((selectedPrescription as any).origin).label }}
                </div>
                <button
                  @click="selectedPrescription = null"
                  class="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
              <h2 class="text-xl font-bold text-white leading-tight">{{ selectedPrescription.title || 'Prescription' }}</h2>
              <p class="text-sm font-mono text-white/60 mt-0.5">{{ selectedPrescription.prescription_number }}</p>
              <!-- Status chip (translucent, sits on the image header — keeps its own
                   on-dark styling but sources the dot color from the shared map) -->
              <div class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="getStatusColor(selectedPrescription.status).dot" />
                {{ getStatusColor(selectedPrescription.status).label }}
              </div>
            </div>

            <!-- Scrollable body -->
            <div class="flex-1 overflow-y-auto">

              <!-- Meta grid -->
              <div class="grid grid-cols-2 gap-3 p-5 border-b border-gray-100 dark:border-gray-800">
                <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p class="text-xs font-bold text-gray-400 mb-1">Prescriber</p>
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                      <UserIcon class="w-4 h-4 text-brand-500" />
                    </div>
                    <p class="text-sm font-semibold text-gray-800 dark:text-white leading-tight">{{ selectedPrescription.doctor_name }}</p>
                  </div>
                </div>

                <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p class="text-xs font-bold text-gray-400 mb-1">Issued</p>
                  <div class="flex items-center gap-2">
                    <CalendarIcon class="w-4 h-4 text-gray-400 shrink-0" />
                    <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ formatDate(selectedPrescription.prescription_date) }}</p>
                  </div>
                </div>

                <div v-if="selectedPrescription.expiry_date" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p class="text-xs font-bold text-gray-400 mb-1">Expires</p>
                  <div class="flex items-center gap-2">
                    <ClockIcon class="w-4 h-4 text-gray-400 shrink-0" />
                    <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ formatDate(selectedPrescription.expiry_date) }}</p>
                  </div>
                </div>

                <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p class="text-xs font-bold text-gray-400 mb-1">Issued</p>
                  <div class="flex items-center gap-2">
                    <CalendarIcon class="w-4 h-4 text-gray-400 shrink-0" />
                    <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ formatDate(selectedPrescription.created_at) }}</p>
                  </div>
                </div>
              </div>

              <!-- Medications -->
              <div class="p-5">
                <h3 class="text-xs font-bold text-gray-400 mb-4 flex items-center gap-2">
                  <BeakerIcon class="w-4 h-4" />
                  Medications
                  <span class="ml-auto bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full">
                    {{ selectedPrescription.drugs?.length ?? 0 }}
                  </span>
                </h3>

                <div v-if="selectedPrescription.drugs?.length" class="space-y-3">
                  <div
                    v-for="(drug, i) in selectedPrescription.drugs"
                    :key="i"
                    class="rounded-2xl ring-1 ring-gray-200/70 dark:ring-white/10 overflow-hidden"
                  >
                    <!-- Drug header -->
                    <div class="bg-brand-50 dark:bg-brand-900/10 px-4 py-3 flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="font-bold text-gray-900 dark:text-white text-sm leading-snug">
                          {{ getDrugLabel(drug as any) }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {{ (drug as any).display_name || (drug as any).drug_name || drug.name }}
                        </p>
                      </div>
                      <span class="shrink-0 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-gray-800/70 text-xs font-bold text-brand-500 border border-brand-100 dark:border-brand-800/30 shadow-sm">
                        {{ drug.dose }}
                      </span>
                    </div>

                    <!-- Drug details grid -->
                    <div class="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 bg-white/80 dark:bg-gray-800/70">
                      <div class="px-3 py-2.5 text-center">
                        <p class="text-xs font-bold text-gray-400 ">Frequency</p>
                        <p class="text-xs font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{{ drug.frequency }}</p>
                      </div>
                      <div class="px-3 py-2.5 text-center">
                        <p class="text-xs font-bold text-gray-400 ">Duration</p>
                        <p class="text-xs font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{{ drug.duration }}</p>
                      </div>
                      <div class="px-3 py-2.5 text-center">
                        <p class="text-xs font-bold text-gray-400 ">Qty</p>
                        <p class="text-xs font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{{ drug.quantity }}</p>
                      </div>
                    </div>

                    <!-- Instruction -->
                    <div v-if="drug.instruction" class="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200/70 dark:border-white/10">
                      <p class="text-xs text-gray-500 dark:text-gray-400 italic">"{{ drug.instruction }}"</p>
                    </div>
                  </div>
                </div>

                <div v-else class="flex flex-col items-center py-8 text-center">
                  <BeakerIcon class="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
                  <p class="text-sm text-gray-400 dark:text-gray-500">No medications listed on this prescription.</p>
                </div>
              </div>

              <!-- Notes -->
              <div v-if="selectedPrescription.notes" class="px-5 pb-5">
                <div class="rounded-2xl bg-accent-50 dark:bg-accent-900/10 border border-accent-100 dark:border-accent-800/30 p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <InformationCircleIcon class="w-4 h-4 text-accent-600 dark:text-accent-400 shrink-0" />
                    <p class="text-xs font-bold text-accent-700 dark:text-accent-400 ">Clinical Notes</p>
                  </div>
                  <p class="text-sm text-accent-800 dark:text-accent-200 leading-relaxed">{{ selectedPrescription.notes }}</p>
                </div>
              </div>

            </div>

            <!-- Sticky footer actions -->
            <div class="shrink-0 border-t border-gray-100 dark:border-gray-800 px-5 py-4 bg-white dark:bg-gray-900 space-y-2">
              <!-- Consultation link (only for consultation-origin prescriptions) -->
              <button
                v-if="selectedPrescription.origin === 'consultation' && extractConsultationNumber(selectedPrescription.notes)"
                class="w-full py-2.5 rounded-full border border-brand-200 dark:border-brand-700/40 bg-brand-50 dark:bg-brand-900/10 text-brand-700 dark:text-brand-300 text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-brand-100 dark:hover:bg-brand-900/20 disabled:opacity-60"
                :disabled="consultationLoading"
                @click="openConsultation(selectedPrescription)"
              >
                <span v-if="consultationLoading" class="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <ChatBubbleLeftRightIcon v-else class="w-4 h-4" />
                {{ consultationLoading ? 'Opening…' : `View Consultation · ${extractConsultationNumber(selectedPrescription.notes)}` }}
                <ArrowTopRightOnSquareIcon v-if="!consultationLoading" class="w-3.5 h-3.5 opacity-60" />
              </button>

              <div class="flex gap-3">
                <button
                  @click="selectedPrescription = null"
                  class="flex-1 py-2.5 rounded-full ring-1 ring-gray-200/70 dark:ring-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
                <button
                  v-if="selectedPrescription.status === 'active' && selectedPrescription.drugs?.length"
                  class="flex-1 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  @click="openOrderModal(selectedPrescription)"
                >
                  <ShoppingCartIcon class="w-4 h-4" />
                  Order Medications
                </button>
                <button
                  v-if="selectedPrescription.status === 'active' && !selectedPrescription.drugs?.length"
                  class="flex-1 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  @click="router.push({ name: 'upload-prescription' })"
                >
                  <ArrowUpTrayIcon class="w-4 h-4" />
                  Add Medications
                </button>
              </div>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Order drug picker modal ──────────────────────────────── -->
    <Teleport to="body">
      <Transition name="fade-up">
        <div
          v-if="showOrderModal && orderPrescription"
          class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="showOrderModal = false"
        >
          <div class="w-full max-w-md bg-white/80 dark:bg-gray-800/70 rounded-3xl shadow-card overflow-hidden">
            <!-- Header -->
            <div class="px-6 pt-5 pb-4 border-b border-gray-200/70 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 class="font-bold text-gray-900 dark:text-white">Order Medications</h3>
                <p class="text-xs text-gray-500 mt-0.5">Select a medication to find pharmacies &amp; prices</p>
              </div>
              <button @click="showOrderModal = false" class="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <XMarkIcon class="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <!-- Drug list -->
            <div class="p-4 space-y-2 max-h-80 overflow-y-auto">
              <button
                v-for="(drug, i) in orderPrescription.drugs"
                :key="i"
                class="w-full flex items-center gap-3 p-4 rounded-full ring-1 ring-gray-200/70 dark:ring-white/10 hover:border-brand-500/40 hover:bg-brand-50/40 dark:hover:bg-brand-900/10 transition-all text-left group"
                @click="goToMedication(drug)"
              >
                <div class="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
                  <BeakerIcon class="w-5 h-5 text-brand-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm text-gray-900 dark:text-white leading-snug">{{ drug.display_name || drug.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ drug.dose }} · {{ drug.frequency }} · {{ drug.duration }}</p>
                </div>
                <ChevronRightIcon class="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors shrink-0" />
              </button>
            </div>

            <!-- Footer note -->
            <div class="px-6 pb-5">
              <p class="text-xs text-gray-400 dark:text-gray-500 text-center">
                You'll be able to compare pharmacy prices and add to cart on the next page.
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-enter-active .relative,
.drawer-leave-active .relative {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from .relative {
  transform: translateX(100%);
}
.drawer-leave-to .relative {
  transform: translateX(100%);
}

.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

.fade-up-enter-active, .fade-up-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-up-enter-from, .fade-up-leave-to { opacity: 0; transform: translateY(12px); }
</style>
