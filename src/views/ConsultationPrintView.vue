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
  ClipboardDocumentCheckIcon
} from '@heroicons/vue/24/outline';
import logoBlueOrange from '@/assets/logo/logo_blue_orange.png';

const route = useRoute();
const consultation = ref<Consultation | null>(null);
const loading = ref(true);
const error = ref('');

const fetchConsultation = async () => {
  try {
    loading.value = true;
    const id = Number(route.params.id);
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

const formatDrugDisplay = (drug: any) => {
  const parts = [
    drug.drug_name,
    drug.brand_name,
    drug.form_name,
    drug.dose,
    drug.uom
  ];
  return parts.filter(p => p && p.toString().trim() !== '').join(' • ').toUpperCase();
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
  await fetchConsultation();
  // Auto-print after data load
  setTimeout(() => window.print(), 1000); 
});

onUnmounted(() => {
  window.removeEventListener('beforeprint', handleBeforePrint);
  window.removeEventListener('afterprint', handleAfterPrint);
});
</script>

<template>
  <!-- Main Container: Force white background, removing dark mode logic for print -->
  <div class="min-h-screen bg-white text-gray-900 mx-auto max-w-7xl">
    
    <!-- Loading state (minimal) -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="error || !consultation" class="text-center py-20">
        <h3 class="text-xl font-bold">{{ error || 'Consultation not found' }}</h3>
    </div>

    <!-- PRINT LAYOUT (Visible by default) -->
    <div v-else class="w-full table border-collapse">
        
        <!-- Header (Repeatable) -->
        <div class="table-header-group">
          <div class="table-row">
            <div class="table-cell pt-[10mm] px-[10mm] pb-[10mm]">
              <!-- Top Bar -->
              <div class="flex justify-between items-center border-b-2 border-[#FE9615] pb-6 mb-6">
                  <img :src="logoBlueOrange" alt="FyndRx" class="h-12 w-auto object-contain" />
                  <div class="text-right">
                    <h1 class="text-3xl font-bold text-[#1A2233]">Consultation Report</h1>
                    <p class="text-sm text-gray-500 mt-1">Generated on {{ format(new Date(), 'PPP') }}</p>
                  </div>
              </div>

              <!-- Meta Grid -->
              <div class="flex justify-between items-start bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
                  <div>
                    <h1 class="text-3xl font-bold font-mono text-gray-900 mb-4">
                      #{{ consultation?.consultation_number }}
                    </h1>
                    
                    <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                      <div class="flex items-center gap-2">
                        <div class="p-1.5 bg-gray-100 rounded-full">
                          <CalendarIcon class="w-4 h-4" />
                        </div>
                        <span>{{ formatDate(consultation.created_at) }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="p-1.5 bg-gray-100 rounded-full">
                          <UserCircleIcon class="w-4 h-4" />
                        </div>
                        <span class="capitalize">{{ consultation?.patient_gender || 'N/A' }} <span class="text-gray-300 mx-1">|</span> {{ consultation?.patient_date_of_birth || 'N/A' }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <div class="p-1.5 bg-gray-100 rounded-full">
                          <ClockIcon class="w-4 h-4" />
                        </div>
                        <span>Priority: <span class="uppercase font-bold text-gray-700">{{ consultation?.priority }}</span></span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex flex-col items-end">
                    <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Status</p>
                    <Badge :variant="statusColor" size="lg" class="capitalize">{{ consultation?.status?.replace('_', ' ') }}</Badge>
                  </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Spacer (Repeatable) -->
        <div class="table-footer-group">
          <div class="table-row">
            <div class="table-cell px-[10mm]">
              <!-- Exact height matcher for the fixed footer -->
              <div class="h-[140px]" aria-hidden="true"></div>
            </div>
          </div>
        </div>

        <!-- Content Body -->
        <div class="table-row-group">
          <div class="table-row">
            <div class="table-cell px-[10mm]">

                <!-- Vitals Section -->
                 <div 
                  v-if="consultation?.vitals && Object.values(consultation?.vitals || {}).some(v => v !== null && v !== undefined && v !== '')" 
                  class="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-6 break-inside-avoid"
                >
                    <h4 class="text-xs uppercase font-bold text-gray-400 mb-4 tracking-wider flex items-center gap-2">
                        <HeartIcon class="w-4 h-4" />
                        Vitals & Measurements
                    </h4>
                    <div class="grid grid-cols-4 gap-4">
                        <template v-for="(value, key) in consultation?.vitals" :key="key">
                          <div 
                            v-if="value && key !== 'blood_pressure_diastolic'" 
                            class="bg-gray-50 p-4 rounded-xl flex items-center gap-4"
                          >
                              <div 
                                class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
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
                                <span v-else-if="key === 'oxygen_saturation'" class="font-bold text-sm">O₂</span>
                                <span v-else-if="key === 'weight'" class="font-bold text-sm">Kg</span>
                                <span v-else-if="key === 'height'" class="font-bold text-sm">Cm</span>
                                <span v-else class="font-bold text-sm">Rx</span>
                              </div>
                              
                              <div class="min-w-0">
                                <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider truncate">
                                  {{ key.replace(/_/g, ' ').replace('systolic', '').replace('diastolic', '') }}
                                </p>
                                <p class="font-bold text-gray-900 text-sm">
                                   <span v-if="key === 'blood_pressure_systolic'">
                                      {{ value }}/{{ consultation?.vitals?.blood_pressure_diastolic }}
                                   </span>
                                   <span v-else>{{ value }}</span>
                                   <span class="text-sm text-gray-400 font-normal ml-1">
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

                <!-- Diagnoses List -->
                <div 
                    v-if="consultation.diagnoses && consultation.diagnoses.length > 0" 
                    class="mt-8 mb-6 break-inside-avoid"
                >
                    <h4 class="text-xs uppercase font-bold text-gray-400 mb-4 tracking-wider flex items-center gap-2 border-b-2 border-gray-100 pb-2">
                        <ClipboardDocumentCheckIcon class="w-4 h-4" />
                        Medical Diagnoses
                    </h4>
                    
                    <div class="flex flex-col gap-y-4">
                        <div 
                            v-for="diagnosis in consultation?.diagnoses" 
                            :key="diagnosis.id"
                            class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 break-inside-avoid"
                        >
                            <div class="flex items-center gap-4">
                                <span class="inline-flex items-center px-2.5 py-1 rounded bg-fuchsia-50 text-xs font-bold text-fuchsia-700 font-mono border border-fuchsia-100">
                                    {{ diagnosis.icd_code || 'DX' }}
                                </span>
                                <div>
                                    <h3 class="font-bold text-gray-900 text-sm leading-tight mb-0.5">
                                        {{ diagnosis.name }}
                                    </h3>
                                    <p class="text-xs text-gray-500">{{ diagnosis.category }}</p>
                                </div>
                            </div>
                            <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                {{ diagnosis.type }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Pharmacist Notes (if any) -->
                <div v-if="consultation?.recommendations || consultation?.pharmacist_notes" class="mb-6 break-inside-avoid">
                   <div class="bg-teal-50/50 rounded-2xl p-6 border border-teal-100">
                       <h3 class="text-lg font-bold text-teal-900 mb-4 flex items-center gap-2">
                         <SparklesIcon class="w-5 h-5" />
                         Pharmacist Response
                       </h3>
                       <div class="space-y-4">
                         <div v-if="consultation?.recommendations">
                            <h4 class="font-bold text-teal-800 text-xs uppercase mb-2">Recommendations</h4>
                            <div class="prose prose-sm text-gray-800" v-html="consultation?.recommendations"></div>
                         </div>
                         <div v-if="consultation?.pharmacist_notes">
                            <h4 class="font-bold text-teal-800 text-xs uppercase mb-2">Notes</h4>
                            <div class="text-gray-700 italic text-sm">{{ consultation?.pharmacist_notes }}</div>
                         </div>
                       </div>
                   </div>
                </div>

                <!-- Prescription Table -->
                 <div v-if="consultation?.prescription" class="mt-6 break-inside-avoid">
                     <h3 class="text-sm font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex justify-between items-center bg-gray-50 p-2 rounded-t">
                        <span class="flex items-center gap-2">
                            <BeakerIcon class="w-4 h-4 text-gray-500" />
                            Prescription #{{ consultation?.prescription?.prescription_number }}
                        </span>
                        <span class="text-xs font-normal text-gray-500">Issued: {{ formatDate(consultation?.prescription?.created_at) }}</span>
                     </h3>
                     <div class="overflow-hidden border-x border-b border-gray-200 rounded-b">
                        <table class="w-full text-sm text-left">
                            <thead class="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                <tr>
                                    <th class="py-2 px-4 w-2/3">Medication Details</th>
                                    <th class="py-2 px-4">Instructions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                <tr v-for="drug in consultation?.prescription?.drugs" :key="drug.id" class="break-inside-avoid shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
                                    <td class="py-3 px-4 align-top">
                                        <div class="font-bold text-gray-900 text-sm mb-1 leading-snug">
                                            {{ formatDrugDisplay(drug) }}
                                        </div>
                                        <div class="text-xs text-gray-500 font-mono">
                                            QTY: {{ drug.quantity }} {{ drug.uom }} • {{ drug.frequency }} • {{ drug.duration }}
                                        </div>
                                    </td>
                                    <td class="py-3 px-4 align-top">
                                        <div v-if="drug.instruction" class="text-xs italic text-gray-600">
                                            "{{ drug.instruction }}"
                                        </div>
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

    <!-- Fixed Print Footer (Visual) -->
    <div class="fixed bottom-0 left-0 w-full z-50 px-[10mm] pb-[5mm]">
        <div class="border-t-2 border-[#246BFD] bg-white pt-4 pb-0 flex flex-col gap-2 text-xs text-gray-500">
            <div class="flex justify-between items-start">
              <div class="space-y-0.5">
                  <p class="font-bold text-[#1A2233] text-sm mb-1">FyndRx Healthcare</p>
                  <p>Mayflower Building, Community 10, Tema</p>
              </div>
              <div class="space-y-0.5 text-right">
                  <p>info@fyndrx.com | +233 53 051 0839</p>
                  <p class="font-medium text-[#FE9615]">www.fyndrx.com</p>
              </div>
            </div>
            <div class="text-center pt-2 border-t border-gray-100 mt-2">
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
    margin: 0; /* Zero margin to allow background to fill page */
  }

  /* Ensure background colors print */
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    margin: 0;
    background-color: #f9fafb !important;
  }
}
</style>
