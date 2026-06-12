<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { consultationService } from '@/services/consultationService';
import type { PublicConsultationSearchResponse, Drug } from '@/types/consultation';
import {
  ClockIcon, CheckCircleIcon, XCircleIcon, ArrowLeftIcon,
  UserIcon, BeakerIcon, ClipboardDocumentListIcon, DocumentTextIcon,
  ShieldCheckIcon, HeartIcon, ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/solid';

const router = useRouter();
const route = useRoute();
const consultation = ref<PublicConsultationSearchResponse | null>(null);
const fetchError = ref('');

onMounted(async () => {
  const n = route.query.n as string;
  const c = route.query.c as string;
  const type = route.query.t as string;

  if (!n || !c) { router.push({ name: 'public-consultation-search' }); return; }

  try {
    const params: any = { consultation_number: n };
    if (type === 'phone') params.patient_phone = c;
    else params.patient_email = c;

    consultation.value = await consultationService.searchPublicConsultation(params);
  } catch (err: any) {
    fetchError.value = err?.response?.data?.message || 'Failed to load consultation.';
  }
});

function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  const el = document.createElement('div');
  el.innerHTML = html;
  return el.textContent?.trim() || '';
}

function hasRichContent(html: string | null | undefined): boolean {
  return stripHtml(html).length > 0;
}

function formatDate(dateStr: string | null | undefined, withTime = false): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return withTime
    ? d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function age(dob: string | null | undefined): string {
  if (!dob) return '';
  const years = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return `${years} yrs`;
}

const STATUS_STEPS = [
  { key: 'submitted', label: 'Submitted', statuses: ['pending'] },
  { key: 'in_review',  label: 'In Review',  statuses: ['in_review'] },
  { key: 'responded',  label: 'Responded',  statuses: ['responded'] },
  { key: 'completed',  label: 'Completed',  statuses: ['completed'] },
];

const currentStepIndex = computed(() => {
  const s = consultation.value?.status;
  if (s === 'cancelled') return -1;
  const idx = STATUS_STEPS.findIndex(step => step.statuses.includes(s ?? ''));
  return idx === -1 ? 0 : idx;
});

const statusConfig = computed(() => {
  switch (consultation.value?.status) {
    case 'pending':    return { color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-700', dot: 'bg-amber-400', icon: ClockIcon };
    case 'in_review':  return { color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-700', dot: 'bg-blue-400', icon: ClockIcon };
    case 'responded':  return { color: 'text-[#246BFD] bg-blue-50 dark:bg-blue-900/20 dark:text-[#5089FF] border-blue-200 dark:border-blue-700', dot: 'bg-[#246BFD]', icon: CheckCircleIcon };
    case 'completed':  return { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700', dot: 'bg-emerald-400', icon: CheckCircleIcon };
    case 'cancelled':  return { color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-700', dot: 'bg-red-400', icon: XCircleIcon };
    default:           return { color: 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700', dot: 'bg-gray-400', icon: ClockIcon };
  }
});

const hasVitals = computed(() => {
  if (!consultation.value?.vitals) return false;
  return Object.values(consultation.value.vitals).some(v => v !== null && v !== undefined && v !== '');
});

function drugName(drug: Drug): string {
  return drug.display_name || drug.drug_name || drug.name || 'Unknown';
}
</script>

<template>
  <div>
  <div v-if="fetchError" class="flex items-center justify-center min-h-[60vh] px-4">
    <div class="text-center max-w-sm">
      <p class="text-red-500 font-semibold mb-2">Could not load consultation</p>
      <p class="text-sm text-gray-500 mb-4">{{ fetchError }}</p>
      <button @click="router.push({ name: 'public-consultation-search' })" class="text-sm text-[#246BFD] hover:underline">Go back and try again</button>
    </div>
  </div>
  <div v-else-if="!consultation" class="flex items-center justify-center min-h-[60vh]">
    <div class="animate-spin rounded-full h-8 w-8 border-2 border-[#246BFD] border-t-transparent"></div>
  </div>

  <div v-else class="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">

    <!-- Back -->
    <button @click="router.push({ name: 'public-consultation-search' })" class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#246BFD] transition-colors">
      <ArrowLeftIcon class="w-4 h-4" />
      Back to search
    </button>

    <!-- ── Header card ───────────────────────────────────────────── -->
    <div class="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      <div class="bg-gradient-to-r from-[#246BFD]/8 to-transparent dark:from-[#246BFD]/15 px-6 py-5 flex flex-col sm:flex-row sm:items-start gap-4">
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Consultation</p>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white font-mono">{{ consultation.consultation_number }}</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ consultation.consultation_type_label }} &middot; Submitted {{ formatDate(consultation.created_at, true) }}</p>
        </div>
        <div :class="['inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold flex-shrink-0', statusConfig.color]">
          <span :class="['w-2 h-2 rounded-full flex-shrink-0', statusConfig.dot, consultation.status === 'pending' || consultation.status === 'in_review' ? 'animate-pulse' : '']"></span>
          {{ consultation.status_label }}
        </div>
      </div>

      <!-- Status stepper -->
      <div v-if="consultation.status !== 'cancelled'" class="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
        <div class="flex items-center gap-0">
          <template v-for="(step, i) in STATUS_STEPS" :key="step.key">
            <div class="flex flex-col items-center flex-shrink-0">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all', i <= currentStepIndex ? 'bg-[#246BFD] border-[#246BFD] text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-400']">
                <CheckCircleIcon v-if="i < currentStepIndex" class="w-4 h-4" />
                <span v-else>{{ i + 1 }}</span>
              </div>
              <p :class="['mt-1.5 text-[10px] font-semibold whitespace-nowrap', i <= currentStepIndex ? 'text-[#246BFD] dark:text-[#5089FF]' : 'text-gray-400']">{{ step.label }}</p>
            </div>
            <div v-if="i < STATUS_STEPS.length - 1" :class="['flex-1 h-0.5 mb-5 mx-1', i < currentStepIndex ? 'bg-[#246BFD]' : 'bg-gray-200 dark:bg-gray-700']"></div>
          </template>
        </div>
      </div>

      <!-- Cancelled banner -->
      <div v-else class="px-6 py-3 border-t border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
        <XCircleIcon class="w-4 h-4 flex-shrink-0" />
        This consultation was cancelled.
        <span v-if="(consultation as any).cancellation_reason" class="text-red-500">{{ (consultation as any).cancellation_reason }}</span>
      </div>
    </div>

    <!-- ── Two-column layout ─────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- LEFT: Patient info + vitals -->
      <div class="space-y-6">

        <!-- Patient card -->
        <div class="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-5">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 rounded-lg bg-[#246BFD]/10 dark:bg-[#246BFD]/20 flex items-center justify-center">
              <UserIcon class="w-4 h-4 text-[#246BFD]" />
            </div>
            <h2 class="text-sm font-bold text-gray-900 dark:text-white">Patient</h2>
          </div>
          <div class="space-y-3">
            <div>
              <p class="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Name</p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ consultation.patient_name }}</p>
            </div>
            <div v-if="consultation.patient_gender" class="flex gap-6">
              <div>
                <p class="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Gender</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white capitalize">{{ consultation.patient_gender }}</p>
              </div>
              <div v-if="consultation.patient_date_of_birth">
                <p class="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Age</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ age(consultation.patient_date_of_birth) }}</p>
              </div>
            </div>
            <div v-else-if="consultation.patient_date_of_birth">
              <p class="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Date of Birth</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ formatDate(consultation.patient_date_of_birth) }} <span class="text-gray-400">({{ age(consultation.patient_date_of_birth) }})</span></p>
            </div>
            <div v-if="consultation.patient_phone">
              <p class="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Phone</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ consultation.patient_phone }}</p>
            </div>
            <div v-if="consultation.patient_email">
              <p class="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Email</p>
              <p class="text-sm font-medium text-gray-900 dark:text-white break-all">{{ consultation.patient_email }}</p>
            </div>
          </div>
        </div>

        <!-- Vitals card -->
        <div v-if="hasVitals" class="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-5">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
              <HeartIcon class="w-4 h-4 text-rose-500" />
            </div>
            <h2 class="text-sm font-bold text-gray-900 dark:text-white">Vitals</h2>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div v-if="consultation.vitals?.blood_pressure_systolic && consultation.vitals?.blood_pressure_diastolic" class="col-span-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-400 mb-0.5">Blood Pressure</p>
              <p class="text-base font-bold text-gray-900 dark:text-white">{{ consultation.vitals.blood_pressure_systolic }}/{{ consultation.vitals.blood_pressure_diastolic }} <span class="text-xs font-normal text-gray-400">mmHg</span></p>
            </div>
            <div v-if="consultation.vitals?.heart_rate" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-400 mb-0.5">Heart Rate</p>
              <p class="text-sm font-bold text-gray-900 dark:text-white">{{ consultation.vitals.heart_rate }} <span class="text-xs font-normal text-gray-400">bpm</span></p>
            </div>
            <div v-if="consultation.vitals?.temperature" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-400 mb-0.5">Temperature</p>
              <p class="text-sm font-bold text-gray-900 dark:text-white">{{ consultation.vitals.temperature }} <span class="text-xs font-normal text-gray-400">°C</span></p>
            </div>
            <div v-if="consultation.vitals?.weight" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-400 mb-0.5">Weight</p>
              <p class="text-sm font-bold text-gray-900 dark:text-white">{{ consultation.vitals.weight }} <span class="text-xs font-normal text-gray-400">kg</span></p>
            </div>
            <div v-if="consultation.vitals?.height" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-400 mb-0.5">Height</p>
              <p class="text-sm font-bold text-gray-900 dark:text-white">{{ consultation.vitals.height }} <span class="text-xs font-normal text-gray-400">cm</span></p>
            </div>
            <div v-if="consultation.vitals?.oxygen_saturation" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-400 mb-0.5">SpO₂</p>
              <p class="text-sm font-bold text-gray-900 dark:text-white">{{ consultation.vitals.oxygen_saturation }}<span class="text-xs font-normal text-gray-400">%</span></p>
            </div>
          </div>
        </div>

        <!-- Timestamps -->
        <div class="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-5">
          <h2 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Timeline</h2>
          <div class="space-y-2.5">
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-500">Submitted</span>
              <span class="text-xs font-medium text-gray-900 dark:text-white">{{ formatDate(consultation.created_at, true) }}</span>
            </div>
            <div v-if="consultation.responded_at" class="flex justify-between items-center">
              <span class="text-xs text-gray-500">Responded</span>
              <span class="text-xs font-medium text-gray-900 dark:text-white">{{ formatDate(consultation.responded_at, true) }}</span>
            </div>
            <div v-if="consultation.completed_at" class="flex justify-between items-center">
              <span class="text-xs text-gray-500">Completed</span>
              <span class="text-xs font-medium text-gray-900 dark:text-white">{{ formatDate(consultation.completed_at, true) }}</span>
            </div>
            <div v-if="consultation.requires_followup && consultation.followup_date" class="flex justify-between items-center">
              <span class="text-xs text-amber-500 font-medium">Follow-up</span>
              <span class="text-xs font-medium text-amber-600 dark:text-amber-400">{{ formatDate(consultation.followup_date) }}</span>
            </div>
            <div v-if="consultation.priority" class="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-gray-700">
              <span class="text-xs text-gray-500">Priority</span>
              <span :class="['text-xs font-semibold capitalize px-2 py-0.5 rounded-full', consultation.priority === 'urgent' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : consultation.priority === 'high' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300']">{{ consultation.priority_label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Main clinical content -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Chief complaint -->
        <div class="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-5">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <ExclamationTriangleIcon class="w-4 h-4 text-amber-500" />
            </div>
            <h2 class="text-sm font-bold text-gray-900 dark:text-white">Chief Complaint</h2>
          </div>
          <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-amber-50/50 dark:bg-amber-900/10 rounded-xl px-4 py-3 border border-amber-100 dark:border-amber-900/30 italic">
            "{{ consultation.chief_complaint }}"
          </p>

          <!-- Additional clinical fields -->
          <div class="mt-4 space-y-4">
            <div v-if="consultation.current_medications">
              <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Current Medications</p>
              <p class="text-sm text-gray-700 dark:text-gray-300">{{ consultation.current_medications }}</p>
            </div>
            <div v-if="consultation.allergies">
              <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Allergies</p>
              <p class="text-sm text-gray-700 dark:text-gray-300">{{ consultation.allergies }}</p>
            </div>
            <div v-if="hasRichContent(consultation.medical_history)">
              <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Medical History</p>
              <div class="text-sm text-gray-700 dark:text-gray-300 rich-content" v-html="consultation.medical_history"></div>
            </div>
          </div>
        </div>

        <!-- Diagnoses -->
        <div v-if="consultation.diagnoses && consultation.diagnoses.length > 0" class="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-5">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <ShieldCheckIcon class="w-4 h-4 text-purple-500" />
            </div>
            <h2 class="text-sm font-bold text-gray-900 dark:text-white">Diagnoses</h2>
          </div>
          <div class="space-y-2">
            <div
              v-for="diagnosis in consultation.diagnoses"
              :key="diagnosis.id"
              class="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700"
            >
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ diagnosis.name }}</p>
                <p v-if="diagnosis.category" class="text-xs text-gray-400 mt-0.5">{{ diagnosis.category }}</p>
              </div>
              <div class="flex flex-col items-end gap-1 flex-shrink-0">
                <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                  :class="diagnosis.type === 'Primary' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'">
                  {{ diagnosis.type }}
                </span>
                <span v-if="diagnosis.icd_code" class="text-[10px] font-mono text-gray-400">{{ diagnosis.icd_code }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Clinical notes -->
        <div v-if="hasRichContent(consultation.consultation_notes) || hasRichContent(consultation.pharmacist_notes)" class="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-5">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <ClipboardDocumentListIcon class="w-4 h-4 text-[#246BFD]" />
            </div>
            <h2 class="text-sm font-bold text-gray-900 dark:text-white">Clinical Notes</h2>
          </div>
          <div v-if="hasRichContent(consultation.consultation_notes)">
            <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Doctor's Notes</p>
            <div class="text-sm text-gray-700 dark:text-gray-300 rich-content" v-html="consultation.consultation_notes"></div>
          </div>
          <div v-if="hasRichContent(consultation.pharmacist_notes)" :class="hasRichContent(consultation.consultation_notes) ? 'mt-4 pt-4 border-t border-gray-100 dark:border-gray-700' : ''">
            <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Pharmacist's Notes</p>
            <div class="text-sm text-gray-700 dark:text-gray-300 rich-content" v-html="consultation.pharmacist_notes"></div>
          </div>
        </div>

        <!-- Treatment plan / Recommendations -->
        <div v-if="hasRichContent(consultation.recommendations) || consultation.requires_followup" class="rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-900/10 shadow-sm p-5">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <DocumentTextIcon class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 class="text-sm font-bold text-gray-900 dark:text-white">Treatment Plan</h2>
          </div>
          <div v-if="hasRichContent(consultation.recommendations)" class="text-sm text-gray-700 dark:text-gray-300 rich-content" v-html="consultation.recommendations"></div>
          <div v-if="consultation.requires_followup" class="mt-4 flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
            <ClockIcon class="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-xs font-semibold text-amber-700 dark:text-amber-400">Follow-up Required</p>
              <p v-if="consultation.followup_date" class="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Scheduled for {{ formatDate(consultation.followup_date) }}</p>
              <p v-if="consultation.followup_notes" class="text-xs text-amber-600 dark:text-amber-500 mt-0.5">{{ consultation.followup_notes }}</p>
            </div>
          </div>
        </div>

        <!-- Prescription & Drugs -->
        <div v-if="consultation.prescription" class="rounded-2xl border border-[#246BFD]/20 dark:border-[#246BFD]/30 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
          <div class="bg-[#246BFD]/5 dark:bg-[#246BFD]/10 px-5 py-4 flex items-center justify-between gap-3 border-b border-[#246BFD]/10 dark:border-[#246BFD]/20">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-[#246BFD]/10 dark:bg-[#246BFD]/20 flex items-center justify-center">
                <BeakerIcon class="w-4 h-4 text-[#246BFD]" />
              </div>
              <div>
                <h2 class="text-sm font-bold text-gray-900 dark:text-white">Prescription</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-mono">{{ consultation.prescription.prescription_number }}</p>
              </div>
            </div>
            <span :class="['text-xs font-bold px-2.5 py-1 rounded-full capitalize', consultation.prescription.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400']">
              {{ consultation.prescription.status }}
            </span>
          </div>

          <div class="p-5">
            <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
              {{ consultation.prescription.drugs.length }} {{ consultation.prescription.drugs.length === 1 ? 'medication' : 'medications' }} prescribed
            </p>
            <div class="space-y-3">
              <div
                v-for="drug in consultation.prescription.drugs"
                :key="drug.id"
                class="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 hover:border-[#246BFD]/30 dark:hover:border-[#246BFD]/30 transition-colors group"
              >
                <!-- Drug image -->
                <div class="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
                  <img v-if="drug.image" :src="drug.image" :alt="drugName(drug)" class="w-full h-full object-contain p-1" />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                    <BeakerIcon class="w-6 h-6" />
                  </div>
                </div>

                <!-- Drug details -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-gray-900 dark:text-white leading-snug">{{ drugName(drug) }}</p>
                  <div class="mt-1.5 flex flex-wrap gap-1.5">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-[#246BFD]/8 text-[#246BFD] dark:text-[#5089FF] text-[11px] font-medium">{{ drug.dose }}</span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[11px] font-medium">{{ drug.frequency }}</span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[11px] font-medium">{{ drug.duration }}</span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[11px] font-medium">Qty: {{ drug.quantity }}</span>
                  </div>
                  <p v-if="drug.instruction" class="mt-1.5 text-xs text-gray-500 dark:text-gray-400 italic">{{ drug.instruction }}</p>
                </div>

                <!-- Order button -->
                <router-link
                  v-if="drug.drug_id"
                  :to="{ name: 'medication-detail', params: { id: drug.drug_id } }"
                  class="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#246BFD] text-white text-xs font-bold hover:bg-[#1a56d6] active:scale-95 transition-all opacity-0 group-hover:opacity-100 self-center"
                >
                  Order
                  <ArrowTopRightOnSquareIcon class="w-3.5 h-3.5" />
                </router-link>
              </div>
            </div>

            <p v-if="consultation.prescription.notes" class="mt-3 text-xs text-gray-500 dark:text-gray-400 italic border-t border-gray-100 dark:border-gray-700 pt-3">
              Note: {{ consultation.prescription.notes }}
            </p>
          </div>
        </div>

        <!-- Pending state nudge -->
        <div v-if="consultation.status === 'pending'" class="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-center">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-3">
            <ClockIcon class="w-6 h-6 text-amber-500" />
          </div>
          <p class="text-sm font-semibold text-gray-900 dark:text-white">Awaiting pharmacist review</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">You'll receive a response via the contact details you provided. Come back here anytime to check progress.</p>
        </div>

      </div>
    </div>
  </div>
  </div>
</template>

<style scoped>
.rich-content :deep(p) {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}
.rich-content :deep(p:last-child) {
  margin-bottom: 0;
}
.rich-content :deep(ul),
.rich-content :deep(ol) {
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
}
.rich-content :deep(li) {
  margin-bottom: 0.25rem;
}
.rich-content :deep(strong) {
  font-weight: 600;
}
</style>
