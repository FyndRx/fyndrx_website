<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { format } from 'date-fns';
import { consultationService } from '@/services/consultationService';
import type { Consultation } from '@/types/consultation';
import {
  UserCircleIcon,
  CalendarIcon,
  ClockIcon,
  HeartIcon,
  BoltIcon,
  SparklesIcon,
  BeakerIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline';
import logoBlueOrange from '@/assets/logo/logo_blue_orange.png';

const route = useRoute();
const consultation = ref<Consultation | null>(null);
const loading = ref(true);
const error = ref('');

const fetchConsultation = async () => {
  try {
    loading.value = true;
    const id = route.params.id as string;
    const response = await consultationService.getConsultationById(id);
    consultation.value = (response as any).data || response;
  } catch (err) {
    console.error('Failed to load consultation:', err);
    error.value = 'Consultation not found or access denied.';
  } finally {
    loading.value = false;
  }
};

const statusColor = computed(() => {
  if (!consultation.value) return 'default';
  switch (consultation.value.status) {
    case 'pending': return 'warning';
    case 'in_review': return 'primary';
    case 'responded': return 'success';
    case 'completed': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
});

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return 'N/A';
  try {
    return format(new Date(dateStr), 'PPP p');
  } catch {
    return dateStr;
  }
};

const formatDrugDisplay = (drug: {
  display_name?: string;
  drug_name?: string;
  name?: string;
  brand_name?: string | null;
  form_name?: string;
  dose?: string;
}) => {
  const productLine =
    drug.display_name?.trim() ||
    drug.drug_name?.trim() ||
    drug.name?.trim();

  if (productLine) {
    return productLine.toUpperCase();
  }

  const parts = [drug.brand_name, drug.form_name].filter(
    (p) => p && p.toString().trim() !== ''
  );
  return parts.join(' • ').toUpperCase();
};

const wasDarkMode = ref(false);

const handleBeforePrint = () => {
  if (document.documentElement.classList.contains('dark')) {
    wasDarkMode.value = true;
    document.documentElement.classList.remove('dark');
  } else {
    wasDarkMode.value = false;
  }
};

const handleAfterPrint = () => {
  if (wasDarkMode.value) {
    document.documentElement.classList.add('dark');
  }
};

onMounted(async () => {
  // Strip dark mode immediately — print view is always light
  if (document.documentElement.classList.contains('dark')) {
    wasDarkMode.value = true;
    document.documentElement.classList.remove('dark');
  }

  window.addEventListener('beforeprint', handleBeforePrint);
  window.addEventListener('afterprint', handleAfterPrint);

  await fetchConsultation();
  setTimeout(() => window.print(), 1000);
});

onUnmounted(() => {
  window.removeEventListener('beforeprint', handleBeforePrint);
  window.removeEventListener('afterprint', handleAfterPrint);
  // Restore dark mode if it was active when this view was opened
  if (wasDarkMode.value) {
    document.documentElement.classList.add('dark');
  }
});
</script>

<template>
  <div class="min-h-screen text-gray-900 mx-auto max-w-7xl">

    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#246BFD]"></div>
    </div>

    <div v-else-if="error || !consultation" class="text-center py-20">
      <h3 class="text-xl font-bold">{{ error || 'Consultation not found' }}</h3>
    </div>

    <div v-else class="w-full table border-collapse">

      <!-- ── Repeatable Header ───────────────────────────────────────────── -->
      <div class="table-header-group">
        <div class="table-row">
          <div class="table-cell pt-[10mm] px-[12mm] pb-[5mm]">

            <!-- Branding Bar -->
            <div class="flex justify-between items-center border-b-2 border-[#FE9615] pb-5 mb-5">
              <img :src="logoBlueOrange" alt="FyndRx" class="h-11 w-auto object-contain" />
              <div class="text-right">
                <h1 class="text-2xl font-bold text-[#1A2233]">Consultation Report</h1>
                <p class="text-xs text-gray-400 mt-0.5">Generated {{ format(new Date(), 'PPP') }}</p>
              </div>
            </div>

            <!-- Consultation Number + Timeline + Status -->
            <div class="flex justify-between items-start bg-gray-50 rounded-xl border border-gray-100 px-6 py-5 mb-4">
              <div class="flex-1">
                <h2 class="text-3xl font-bold font-mono text-gray-900 mb-3">
                  #{{ consultation?.consultation_number }}
                </h2>

                <div class="flex flex-wrap items-center gap-3">
                  <!-- Submitted -->
                  <div class="flex items-center gap-1.5 text-xs text-gray-500">
                    <div class="p-1 bg-gray-200 rounded-full">
                      <CalendarIcon class="w-3 h-3" />
                    </div>
                    <span>Submitted {{ formatDate(consultation.created_at) }}</span>
                  </div>

                  <!-- Responded (emerald chip) -->
                  <div v-if="consultation?.responded_at" class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-medium">
                    <CheckCircleIcon class="w-3 h-3" />
                    <span>Responded · <span class="font-bold">{{ formatDate(consultation.responded_at) }}</span></span>
                  </div>

                  <!-- Priority chip -->
                  <div
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase border"
                    :class="{
                      'bg-red-50 text-red-700 border-red-200': ['urgent','critical'].includes(consultation?.priority || ''),
                      'bg-orange-50 text-orange-700 border-orange-200': consultation?.priority === 'high',
                      'bg-sky-50 text-sky-700 border-sky-200': consultation?.priority === 'low',
                      'bg-gray-100 text-gray-600 border-gray-200': !consultation?.priority || consultation?.priority === 'normal'
                    }"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full shrink-0"
                      :class="{
                        'bg-red-500': ['urgent','critical'].includes(consultation?.priority || ''),
                        'bg-orange-500': consultation?.priority === 'high',
                        'bg-sky-500': consultation?.priority === 'low',
                        'bg-gray-400': !consultation?.priority || consultation?.priority === 'normal'
                      }"
                    ></span>
                    <span>{{ consultation?.priority || 'normal' }}</span>
                  </div>
                </div>
              </div>

              <!-- Status chip (right) -->
              <div class="flex flex-col items-end gap-1.5 ml-6 shrink-0">
                <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Status</p>
                <div
                  class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold capitalize border"
                  :class="{
                    'bg-amber-50 text-amber-700 border-amber-200': consultation?.status === 'pending',
                    'bg-blue-50 text-blue-700 border-blue-200': consultation?.status === 'in_review',
                    'bg-emerald-50 text-emerald-700 border-emerald-200': ['responded','completed'].includes(consultation?.status || ''),
                    'bg-red-50 text-red-700 border-red-200': consultation?.status === 'cancelled',
                    'bg-gray-100 text-gray-600 border-gray-200': !['pending','in_review','responded','completed','cancelled'].includes(consultation?.status || '')
                  }"
                >
                  {{ consultation?.status?.replace('_', ' ') }}
                </div>
              </div>
            </div>

            <!-- Patient Strip -->
            <div class="flex items-center gap-5 bg-[#246BFD]/5 border border-[#246BFD]/10 rounded-xl px-5 py-4">
              <div class="w-12 h-12 rounded-full bg-[#246BFD]/10 flex items-center justify-center text-[#246BFD] shrink-0">
                <UserCircleIcon class="w-7 h-7" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-gray-900 text-base leading-tight">{{ consultation?.patient_name }}</h3>
                <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-gray-500">
                  <span>{{ consultation?.patient_email }}</span>
                  <span v-if="consultation?.patient_phone" class="text-gray-300">·</span>
                  <span v-if="consultation?.patient_phone">{{ consultation?.patient_phone }}</span>
                </div>
              </div>
              <div class="flex items-center gap-4 text-xs shrink-0">
                <div class="text-center">
                  <p class="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Gender</p>
                  <p class="font-semibold text-gray-700 capitalize">{{ consultation?.patient_gender || 'N/A' }}</p>
                </div>
                <div class="w-px h-8 bg-gray-200"></div>
                <div class="text-center">
                  <p class="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Date of Birth</p>
                  <p class="font-semibold text-gray-700">{{ consultation?.patient_date_of_birth || 'N/A' }}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- ── Repeatable Footer Spacer ────────────────────────────────────── -->
      <div class="table-footer-group">
        <div class="table-row">
          <div class="table-cell px-[12mm]">
            <div class="h-[130px]" aria-hidden="true"></div>
          </div>
        </div>
      </div>

      <!-- ── Body Content ────────────────────────────────────────────────── -->
      <div class="table-row-group">
        <div class="table-row">
          <div class="table-cell px-[12mm] pb-[6mm]">

            <!-- Vitals -->
            <div
              v-if="consultation?.vitals && Object.values(consultation?.vitals || {}).some(v => v !== null && v !== undefined && v !== '')"
              class="bg-white rounded-2xl border border-gray-100 p-5 mb-5 break-inside-avoid shadow-sm"
            >
              <h4 class="text-xs uppercase font-bold text-gray-400 mb-4 tracking-wider flex items-center gap-2">
                <HeartIcon class="w-4 h-4" />
                Vitals & Measurements
              </h4>
              <div class="grid grid-cols-4 gap-3">
                <template v-for="(value, key) in consultation?.vitals" :key="key">
                  <div
                    v-if="value && key !== 'blood_pressure_diastolic'"
                    class="bg-gray-50 p-3 rounded-xl flex items-center gap-3"
                  >
                    <div
                      class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                      :class="{
                        'bg-red-100 text-red-600': key.includes('blood_pressure'),
                        'bg-blue-100 text-blue-600': key === 'heart_rate',
                        'bg-orange-100 text-orange-600': key === 'temperature',
                        'bg-cyan-100 text-cyan-600': key === 'oxygen_saturation',
                        'bg-purple-100 text-purple-600': key === 'respiratory_rate',
                        'bg-gray-100 text-gray-600': key === 'weight' || key === 'height'
                      }"
                    >
                      <HeartIcon v-if="key.includes('blood_pressure')" class="w-4 h-4" />
                      <BoltIcon v-else-if="key === 'temperature' || key === 'heart_rate'" class="w-4 h-4" />
                      <span v-else-if="key === 'oxygen_saturation'">O₂</span>
                      <span v-else-if="key === 'weight'">Kg</span>
                      <span v-else-if="key === 'height'">Cm</span>
                      <span v-else>Rx</span>
                    </div>
                    <div class="min-w-0">
                      <p class="text-[9px] text-gray-500 uppercase font-bold tracking-wider truncate">
                        {{ key.replace(/_/g, ' ').replace('systolic', '').replace('diastolic', '') }}
                      </p>
                      <p class="font-bold text-gray-900 text-sm">
                        <span v-if="key === 'blood_pressure_systolic'">{{ value }}/{{ consultation?.vitals?.blood_pressure_diastolic }}</span>
                        <span v-else>{{ value }}</span>
                        <span class="text-xs text-gray-400 font-normal ml-0.5">
                          <span v-if="key.includes('blood_pressure')">mmHg</span>
                          <span v-else-if="key === 'temperature'">°C</span>
                          <span v-else-if="key === 'heart_rate'">bpm</span>
                          <span v-else-if="key === 'oxygen_saturation'">%</span>
                          <span v-else-if="key === 'weight'">kg</span>
                          <span v-else-if="key === 'height'">cm</span>
                          <span v-else-if="key === 'respiratory_rate'">/min</span>
                        </span>
                      </p>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- Diagnoses (name-only chips) -->
            <div
              v-if="consultation.diagnoses && consultation.diagnoses.length > 0"
              class="bg-white rounded-2xl border border-gray-100 px-5 py-4 mb-5 break-inside-avoid shadow-sm"
            >
              <h4 class="text-xs uppercase font-bold text-gray-400 mb-3 tracking-wider flex items-center gap-2">
                <ClipboardDocumentCheckIcon class="w-4 h-4" />
                Medical Diagnoses
              </h4>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="diagnosis in consultation?.diagnoses"
                  :key="diagnosis.id"
                  class="inline-flex items-center gap-2 bg-fuchsia-50 px-4 py-2 rounded-full border border-fuchsia-100"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-fuchsia-500 shrink-0"></span>
                  <span class="font-semibold text-gray-800 text-sm">{{ diagnosis.name }}</span>
                </div>
              </div>
            </div>

            <!-- Patient's Request -->
            <div v-if="consultation?.chief_complaint" class="bg-white rounded-2xl border border-gray-100 px-5 py-4 mb-5 break-inside-avoid shadow-sm">
              <h4 class="text-xs uppercase font-bold text-gray-400 mb-2 tracking-wider">Patient's Request</h4>
              <p class="text-gray-700 leading-relaxed italic text-sm">"{{ consultation?.chief_complaint }}"</p>
            </div>

            <!-- Pharmacist Response -->
            <div v-if="consultation?.recommendations || consultation?.pharmacist_notes" class="mb-5 break-inside-avoid">
              <div class="bg-teal-50/70 rounded-2xl border border-teal-100 p-5">
                <h3 class="text-sm font-bold text-teal-900 mb-4 flex items-center gap-2">
                  <SparklesIcon class="w-4 h-4" />
                  Pharmacist Response &amp; Plan
                </h3>
                <div class="space-y-4">
                  <div v-if="consultation?.recommendations">
                    <h4 class="font-bold text-teal-800 text-[10px] uppercase mb-1.5 tracking-wide">Recommendations</h4>
                    <div class="prose prose-sm text-gray-800 text-sm" v-html="consultation?.recommendations"></div>
                  </div>
                  <div v-if="consultation?.pharmacist_notes">
                    <h4 class="font-bold text-teal-800 text-[10px] uppercase mb-1.5 tracking-wide">Pharmacist Notes</h4>
                    <p class="text-gray-700 italic text-sm">{{ consultation?.pharmacist_notes }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Prescription Table -->
            <div v-if="consultation?.prescription" class="break-inside-avoid">
              <div class="flex justify-between items-center bg-indigo-50 border border-b-0 border-indigo-100 rounded-t-xl px-5 py-3">
                <span class="flex items-center gap-2 text-sm font-bold text-indigo-900">
                  <BeakerIcon class="w-4 h-4" />
                  Prescription #{{ consultation?.prescription?.prescription_number }}
                </span>
                <span class="text-xs text-indigo-500">Issued {{ formatDate(consultation?.prescription?.created_at) }}</span>
              </div>
              <div class="overflow-hidden border border-indigo-100 rounded-b-xl">
                <table class="w-full text-sm text-left">
                  <thead class="bg-indigo-50/50 border-b border-indigo-100">
                    <tr>
                      <th class="py-2 px-4 w-2/3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">Medication</th>
                      <th class="py-2 px-4 text-[10px] uppercase tracking-wider text-gray-500 font-bold">Instructions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr v-for="drug in consultation?.prescription?.drugs" :key="drug.id" class="break-inside-avoid">
                      <td class="py-3 px-4 align-top">
                        <div class="font-bold text-gray-900 text-sm mb-1 leading-snug">
                          {{ formatDrugDisplay(drug) }}
                        </div>
                        <div v-if="drug.dose" class="text-xs text-gray-500 mb-1">Dose: {{ drug.dose }}</div>
                        <div class="text-xs text-gray-400 font-mono">
                          QTY: {{ drug.quantity }} {{ drug.uom }} · {{ drug.frequency }} · {{ drug.duration }}
                        </div>
                      </td>
                      <td class="py-3 px-4 align-top">
                        <div v-if="drug.instruction" class="text-xs italic text-gray-600">"{{ drug.instruction }}"</div>
                        <span v-else class="text-xs text-gray-400 italic">None</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>

    <!-- Fixed Print Footer -->
    <div class="fixed bottom-0 left-0 w-full z-50 px-[12mm] pb-[4mm]">
      <div class="border-t-2 border-[#246BFD] bg-white pt-3 flex flex-col gap-1.5 text-xs text-gray-500">
        <div class="flex justify-between items-start">
          <div class="space-y-0.5">
            <p class="font-bold text-[#1A2233] text-sm">FyndRx Healthcare</p>
            <p>Mayflower Building, Community 10, Tema</p>
          </div>
          <div class="space-y-0.5 text-right">
            <p>info@fyndrx.com | +233 53 051 0839</p>
            <p class="font-medium text-[#FE9615]">www.fyndrx.com</p>
          </div>
        </div>
        <div class="text-center pt-2 border-t border-gray-100">
          <p>&copy; {{ new Date().getFullYear() }} FyndRx. Confidential Medical Record.</p>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@media print {
  @page {
    size: auto;
    margin-top: 10mm;
    margin-bottom: 0;
    margin-left: 0;
    margin-right: 0;
  }

  /* First page: header cell provides its own pt-[10mm] */
  @page :first {
    margin-top: 0;
  }

  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    margin: 0;
    background: transparent !important;
    font-family: 'MADEOkineSans', sans-serif !important;
  }

  /* Force font on every element — overrides any Tailwind font-sans inheritance */
  * {
    font-family: 'MADEOkineSans', sans-serif !important;
  }

  /* Restore mono where it matters */
  .font-mono, .font-mono * {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  }
}
</style>
