<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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

type StatusKey = 'active' | 'dispensed' | 'pending' | 'expired' | 'cancelled' | 'completed';
type FilterKey = 'all' | StatusKey;

const router = useRouter();
const prescriptions = ref<Prescription[]>([]);
const selectedFilter = ref<FilterKey>('all');
const selectedPrescription = ref<Prescription | null>(null);
const loading = ref(true);

// ── Status config ─────────────────────────────────────────────
const statusConfig: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  active:    { label: 'Active',    bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-700/40', dot: 'bg-emerald-500' },
  dispensed: { label: 'Dispensed', bg: 'bg-blue-50 dark:bg-blue-900/20',     text: 'text-blue-700 dark:text-blue-300',       border: 'border-blue-200 dark:border-blue-700/40',    dot: 'bg-blue-500'    },
  pending:   { label: 'Pending',   bg: 'bg-amber-50 dark:bg-amber-900/20',   text: 'text-amber-700 dark:text-amber-300',     border: 'border-amber-200 dark:border-amber-700/40',  dot: 'bg-amber-500'   },
  expired:   { label: 'Expired',   bg: 'bg-gray-100 dark:bg-gray-700/40',    text: 'text-gray-600 dark:text-gray-400',       border: 'border-gray-200 dark:border-gray-600',       dot: 'bg-gray-400'    },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50 dark:bg-red-900/20',       text: 'text-red-700 dark:text-red-300',         border: 'border-red-200 dark:border-red-700/40',      dot: 'bg-red-500'     },
  completed: { label: 'Completed', bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-300',   border: 'border-indigo-200 dark:border-indigo-700/40',dot: 'bg-indigo-500'  },
};

const getStatus = (status: string) =>
  statusConfig[status] ?? { label: status, bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };

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

const filterCount = (key: FilterKey) =>
  key === 'all' ? prescriptions.value.length : prescriptions.value.filter(p => p.status === key).length;

const filteredPrescriptions = computed(() =>
  selectedFilter.value === 'all'
    ? prescriptions.value
    : prescriptions.value.filter(p => p.status === selectedFilter.value)
);

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
  if (origin === 'consultation') return { label: 'Consultation', icon: SparklesIcon, bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400' };
  if (origin === 'uploaded')     return { label: 'Uploaded',     icon: ArrowUpTrayIcon, bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' };
  return                                { label: 'Manual',       icon: DocumentTextIcon, bg: 'bg-slate-100 dark:bg-slate-700/40', text: 'text-slate-600 dark:text-slate-400' };
};

// ── Data ──────────────────────────────────────────────────────
const loadPrescriptions = async () => {
  loading.value = true;
  try {
    const data = await prescriptionService.getPrescriptions();
    prescriptions.value = data.sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
  } catch { prescriptions.value = []; }
  finally { loading.value = false; }
};

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

onMounted(loadPrescriptions);
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <!-- ── Header ──────────────────────────────────────────── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">My Prescriptions</h1>
          <p class="mt-1 text-gray-500 dark:text-gray-400 text-sm">Track, manage and order from your medical prescriptions.</p>
        </div>
        <button
          @click="router.push({ name: 'upload-prescription' })"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#246BFD] hover:bg-[#5089FF] text-white font-medium text-sm transition-all shadow-sm shadow-blue-200 dark:shadow-none shrink-0"
        >
          <PlusIcon class="w-4 h-4" />
          Upload Prescription
        </button>
      </div>

      <!-- ── Filter tabs ─────────────────────────────────────── -->
      <div class="flex gap-2 overflow-x-auto pb-1 mb-8 scrollbar-none">
        <button
          v-for="f in filters"
          :key="f.key"
          @click="selectedFilter = f.key"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border"
          :class="selectedFilter === f.key
            ? 'bg-[#246BFD] text-white border-[#246BFD] shadow-sm'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-[#246BFD]/40'"
        >
          {{ f.label }}
          <span
            class="text-xs px-1.5 py-0.5 rounded-full font-bold"
            :class="selectedFilter === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'"
          >{{ filterCount(f.key) }}</span>
        </button>
      </div>

      <!-- ── Loading ─────────────────────────────────────────── -->
      <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div v-for="i in 4" :key="i" class="animate-pulse h-44 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      </div>

      <!-- ── Empty state ─────────────────────────────────────── -->
      <div v-else-if="filteredPrescriptions.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
        <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
          <DocumentTextIcon class="w-10 h-10 text-gray-400" />
        </div>
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-1">No prescriptions found</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
          {{ selectedFilter === 'all' ? 'Upload your first prescription to get started.' : `You have no ${selectedFilter} prescriptions.` }}
        </p>
        <button
          v-if="selectedFilter === 'all'"
          @click="router.push({ name: 'upload-prescription' })"
          class="px-5 py-2.5 rounded-xl bg-[#246BFD] text-white text-sm font-medium hover:bg-[#5089FF] transition-colors"
        >
          Upload Prescription
        </button>
      </div>

      <!-- ── Cards grid ──────────────────────────────────────── -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div
          v-for="rx in filteredPrescriptions"
          :key="rx.id"
          class="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-[#246BFD]/30 hover:shadow-lg dark:hover:shadow-none transition-all duration-200 overflow-hidden cursor-pointer"
          @click="selectedPrescription = rx"
        >
          <!-- Top accent strip by origin -->
          <div
            class="h-1 w-full"
            :class="(rx as any).origin === 'consultation' ? 'bg-gradient-to-r from-violet-400 to-purple-500' : 'bg-gradient-to-r from-[#246BFD] to-sky-400'"
          />

          <div class="p-5">
            <!-- Row 1: origin + status -->
            <div class="flex items-center justify-between mb-3">
              <div
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                :class="[originConfig((rx as any).origin).bg, originConfig((rx as any).origin).text]"
              >
                <component :is="originConfig((rx as any).origin).icon" class="w-3.5 h-3.5" />
                {{ originConfig((rx as any).origin).label }}
              </div>
              <div
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                :class="[getStatus(rx.status).bg, getStatus(rx.status).text, getStatus(rx.status).border]"
              >
                <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="getStatus(rx.status).dot" />
                {{ getStatus(rx.status).label }}
              </div>
            </div>

            <!-- Row 2: title + Rx number -->
            <div class="mb-3">
              <h3 class="font-bold text-gray-900 dark:text-white text-base leading-snug">
                {{ rx.title || 'Prescription' }}
              </h3>
              <p class="text-xs font-mono text-gray-400 dark:text-gray-500 mt-0.5">{{ rx.prescription_number }}</p>
            </div>

            <!-- Row 3: doctor + date -->
            <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
              <div class="flex items-center gap-1.5">
                <div class="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <UserIcon class="w-3 h-3" />
                </div>
                <span class="truncate max-w-[140px]">{{ rx.doctor_name }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <CalendarIcon class="w-3.5 h-3.5" />
                {{ formatDate(rx.prescription_date) }}
              </div>
            </div>

            <!-- Row 4: drugs or empty state -->
            <div class="mb-4">
              <template v-if="rx.drugs && rx.drugs.length">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(drug, i) in rx.drugs.slice(0, 3)"
                    :key="i"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-100 dark:border-blue-800/30"
                  >
                    <BeakerIcon class="w-3 h-3" />
                    {{ getDrugLabel(drug as any) }}
                  </span>
                  <span
                    v-if="rx.drugs.length > 3"
                    class="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs font-medium"
                  >
                    +{{ rx.drugs.length - 3 }} more
                  </span>
                </div>
              </template>
              <div v-else class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 italic">
                <InformationCircleIcon class="w-3.5 h-3.5 shrink-0" />
                No medications listed
              </div>
            </div>

            <!-- Row 5: actions -->
            <div class="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                class="text-xs text-[#246BFD] font-medium flex items-center gap-1 hover:gap-2 transition-all"
                @click.stop="selectedPrescription = rx"
              >
                View details <ChevronRightIcon class="w-3.5 h-3.5" />
              </button>
              <button
                v-if="rx.status === 'active' && rx.drugs?.length"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#246BFD] hover:bg-[#5089FF] text-white text-xs font-semibold transition-all shadow-sm"
                @click.stop="openOrderModal(rx)"
              >
                <ShoppingCartIcon class="w-3.5 h-3.5" />
                Order
              </button>
            </div>
          </div>
        </div>
      </div>
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
          <div class="relative w-full max-w-xl h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden">

            <!-- Sticky header -->
            <div class="shrink-0 bg-gradient-to-r from-[#1A2233] to-[#246BFD] px-6 pt-6 pb-5">
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
              <!-- Status chip -->
              <div class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="getStatus(selectedPrescription.status).dot" />
                {{ getStatus(selectedPrescription.status).label }}
              </div>
            </div>

            <!-- Scrollable body -->
            <div class="flex-1 overflow-y-auto">

              <!-- Meta grid -->
              <div class="grid grid-cols-2 gap-3 p-5 border-b border-gray-100 dark:border-gray-800">
                <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Prescriber</p>
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-[#246BFD]/10 flex items-center justify-center shrink-0">
                      <UserIcon class="w-4 h-4 text-[#246BFD]" />
                    </div>
                    <p class="text-sm font-semibold text-gray-800 dark:text-white leading-tight">{{ selectedPrescription.doctor_name }}</p>
                  </div>
                </div>

                <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Issued</p>
                  <div class="flex items-center gap-2">
                    <CalendarIcon class="w-4 h-4 text-gray-400 shrink-0" />
                    <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ formatDate(selectedPrescription.prescription_date) }}</p>
                  </div>
                </div>

                <div v-if="selectedPrescription.expiry_date" class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Expires</p>
                  <div class="flex items-center gap-2">
                    <ClockIcon class="w-4 h-4 text-gray-400 shrink-0" />
                    <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ formatDate(selectedPrescription.expiry_date) }}</p>
                  </div>
                </div>

                <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Issued</p>
                  <div class="flex items-center gap-2">
                    <CalendarIcon class="w-4 h-4 text-gray-400 shrink-0" />
                    <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ formatDate(selectedPrescription.created_at) }}</p>
                  </div>
                </div>
              </div>

              <!-- Medications -->
              <div class="p-5">
                <h3 class="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
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
                    class="rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                  >
                    <!-- Drug header -->
                    <div class="bg-blue-50 dark:bg-blue-900/10 px-4 py-3 flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="font-bold text-gray-900 dark:text-white text-sm leading-snug">
                          {{ getDrugLabel(drug as any) }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {{ (drug as any).display_name || (drug as any).drug_name || drug.name }}
                        </p>
                      </div>
                      <span class="shrink-0 px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-xs font-bold text-[#246BFD] border border-blue-100 dark:border-blue-800/30 shadow-sm">
                        {{ drug.dose }}
                      </span>
                    </div>

                    <!-- Drug details grid -->
                    <div class="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                      <div class="px-3 py-2.5 text-center">
                        <p class="text-[9px] uppercase font-bold text-gray-400 tracking-wide">Frequency</p>
                        <p class="text-xs font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{{ drug.frequency }}</p>
                      </div>
                      <div class="px-3 py-2.5 text-center">
                        <p class="text-[9px] uppercase font-bold text-gray-400 tracking-wide">Duration</p>
                        <p class="text-xs font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{{ drug.duration }}</p>
                      </div>
                      <div class="px-3 py-2.5 text-center">
                        <p class="text-[9px] uppercase font-bold text-gray-400 tracking-wide">Qty</p>
                        <p class="text-xs font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{{ drug.quantity }}</p>
                      </div>
                    </div>

                    <!-- Instruction -->
                    <div v-if="drug.instruction" class="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-700">
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
                <div class="rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <InformationCircleIcon class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p class="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Clinical Notes</p>
                  </div>
                  <p class="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">{{ selectedPrescription.notes }}</p>
                </div>
              </div>

            </div>

            <!-- Sticky footer actions -->
            <div class="shrink-0 border-t border-gray-100 dark:border-gray-800 px-5 py-4 bg-white dark:bg-gray-900 space-y-2">
              <!-- Consultation link (only for consultation-origin prescriptions) -->
              <button
                v-if="selectedPrescription.origin === 'consultation' && extractConsultationNumber(selectedPrescription.notes)"
                class="w-full py-2.5 rounded-xl border border-violet-200 dark:border-violet-700/40 bg-violet-50 dark:bg-violet-900/10 text-violet-700 dark:text-violet-300 text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-violet-100 dark:hover:bg-violet-900/20 disabled:opacity-60"
                :disabled="consultationLoading"
                @click="openConsultation(selectedPrescription)"
              >
                <span v-if="consultationLoading" class="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <ChatBubbleLeftRightIcon v-else class="w-4 h-4" />
                {{ consultationLoading ? 'Opening…' : `View Consultation · ${extractConsultationNumber(selectedPrescription.notes)}` }}
                <ArrowTopRightOnSquareIcon v-if="!consultationLoading" class="w-3.5 h-3.5 opacity-60" />
              </button>

              <div class="flex gap-3">
                <button
                  @click="selectedPrescription = null"
                  class="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
                <button
                  v-if="selectedPrescription.status === 'active' && selectedPrescription.drugs?.length"
                  class="flex-1 py-2.5 rounded-xl bg-[#246BFD] hover:bg-[#5089FF] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  @click="openOrderModal(selectedPrescription)"
                >
                  <ShoppingCartIcon class="w-4 h-4" />
                  Order Medications
                </button>
                <button
                  v-if="selectedPrescription.status === 'active' && !selectedPrescription.drugs?.length"
                  class="flex-1 py-2.5 rounded-xl bg-[#246BFD] hover:bg-[#5089FF] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
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
          <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            <!-- Header -->
            <div class="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
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
                class="w-full flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-[#246BFD]/40 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all text-left group"
                @click="goToMedication(drug)"
              >
                <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                  <BeakerIcon class="w-5 h-5 text-[#246BFD]" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm text-gray-900 dark:text-white leading-snug">{{ drug.display_name || drug.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ drug.dose }} · {{ drug.frequency }} · {{ drug.duration }}</p>
                </div>
                <ChevronRightIcon class="w-4 h-4 text-gray-400 group-hover:text-[#246BFD] transition-colors shrink-0" />
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
