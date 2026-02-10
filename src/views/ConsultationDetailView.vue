<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { format } from 'date-fns';
import { consultationService } from '@/services/consultationService';
import type { Consultation } from '@/types/consultation';
import Badge from '@/components/Badge.vue';
import Button from '@/components/Button.vue';
import Card from '@/components/Card.vue';
import { 
  UserCircleIcon,
  CalendarIcon, 
  ClockIcon, 
  DocumentTextIcon, 
  ArrowLeftIcon, 
  ArrowDownTrayIcon,
  BuildingStorefrontIcon,
  SparklesIcon,
  BeakerIcon,
  HeartIcon,
  BoltIcon
} from '@heroicons/vue/24/outline';
import { 
  StarIcon as StarIconSolid, 
  ClipboardDocumentCheckIcon,
  PrinterIcon
} from '@heroicons/vue/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/vue/24/outline';
import logoBlueOrange from '@/assets/logo/logo_blue_orange.png';

const route = useRoute();
const router = useRouter();
const consultation = ref<Consultation | null>(null);
const loading = ref(true);
const error = ref('');

// Rating State
const userRating = ref(0);
const userFeedback = ref('');
const isSubmittingRating = ref(false);

const getFileUrl = (path: string) => {
  if (!path) return '#';
  if (path.startsWith('http')) return path;
  const storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage/';
  return `${storageUrl}${path.replace(/^\/+/, '')}`;
};

const openFile = (url: string) => window.open(url, '_blank');

const isImage = (path: string) => {
  const ext = path.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '');
};

const getFileName = (path: string) => {
  return path.split('/').pop() || 'Attachment';
};

const forceDownload = async (path: string) => {
  try {
    const url = getFileUrl(path);
    const filename = getFileName(path);
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error('Download failed:', err);
    window.open(getFileUrl(path), '_blank');
  }
};

const submitReview = async () => {
  if (!consultation.value || userRating.value === 0) return;
  try {
    isSubmittingRating.value = true;
    await consultationService.rateConsultation(
      consultation.value.id,
      userRating.value,
      userFeedback.value
    );
    consultation.value.rating = userRating.value;
    consultation.value.feedback = userFeedback.value;
  } catch (err) {
    console.error('Failed to submit review:', err);
  } finally {
    isSubmittingRating.value = false;
  }
};

const fetchConsultation = async () => {
  try {
    loading.value = true;
    const id = Number(route.params.id);
    const response = await consultationService.getConsultationById(id);
    consultation.value = (response as any).data || response;
    
    if (consultation.value && consultation.value.rating) {
      userRating.value = consultation.value.rating;
      userFeedback.value = consultation.value.feedback || '';
    }
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

const goBack = () => router.push('/consultations');

const printConsultation = () => {
    window.print();
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

onMounted(() => {
  fetchConsultation();
  window.addEventListener('beforeprint', handleBeforePrint);
  window.addEventListener('afterprint', handleAfterPrint);
});

onUnmounted(() => {
  window.removeEventListener('beforeprint', handleBeforePrint);
  window.removeEventListener('afterprint', handleAfterPrint);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-900 pt-28 pb-20">
    <div class="container mx-auto px-4 max-w-7xl print:pb-32">
      <!-- Back Navigation -->
      <button 
        @click="goBack" 
        class="print:hidden flex items-center text-gray-500 hover:text-[#246BFD] transition-colors mb-8 group font-medium"
      >
        <ArrowLeftIcon class="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Consultations
      </button>

      <div v-if="loading" class="space-y-6 animate-pulse">
        <div class="h-40 bg-gray-200 dark:bg-gray-800 rounded-3xl w-full"></div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div class="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
           <div class="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      </div>

      <div v-else-if="error || !consultation" class="text-center py-20">
        <div class="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentTextIcon class="w-10 h-10 text-red-500" />
        </div>
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">{{ error || 'Consultation not found' }}</h3>
        <div class="print:hidden mt-4">
           <Button variant="secondary" @click="goBack">Return to List</Button>
        </div>
      </div>

      <div v-else class="space-y-8">
        
        <!-- Print Header (Visible only in print) -->
        <div class="hidden print:block mb-8">
           <!-- Top Bar -->
           <div class="flex justify-between items-center border-b-2 border-[#FE9615] pb-6 mb-6">
              <img :src="logoBlueOrange" alt="FyndRx" class="h-12 w-auto object-contain" />
              <div class="text-right">
                 <h1 class="text-3xl font-bold text-[#1A2233]">Consultation Report</h1>
                 <p class="text-sm text-gray-500 mt-1">Generated on {{ format(new Date(), 'PPP') }}</p>
              </div>
           </div>

           <!-- Meta Grid -->
           <!-- Meta Box -->
           <div class="flex justify-between items-start bg-gray-50 p-6 rounded-xl border border-gray-100">
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

        <!-- Premium Header Area -->
        <div class="print:hidden bg-white dark:bg-gray-800 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div class="flex items-center gap-3 mb-3">
                 <Badge :variant="statusColor" size="lg" class="capitalize !rounded-full !px-4 shadow-sm">
                  {{ consultation.status?.replace('_', ' ') }}
                 </Badge>
                 <!-- <span class="text-sm text-gray-400 font-mono tracking-wide">#{{ consultation.consultation_number }}</span> -->
              </div>
              <h1 class="text-3xl md:text-4xl font-bold font-mono text-gray-900 dark:text-white mb-4 leading-tight">
                #{{ consultation?.consultation_number }}
                <!-- {{ consultation.consultation_type ? consultation.consultation_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General Consultation' }} -->
              </h1>
              
              <div class="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <CalendarIcon class="w-4 h-4" />
                  </div>
                  <span>{{ formatDate(consultation.created_at) }}</span>
                </div>
                <div class="flex items-center gap-2">
                   <div class="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                     <ClockIcon class="w-4 h-4" />
                   </div>
                   <span>Priority: <span class="uppercase font-bold text-gray-700 dark:text-gray-300">{{ consultation?.priority }}</span></span>
                </div>
              </div>
            </div>
            
            <!-- Print Button (Header) -->
            <button 
               @click="printConsultation"
               class="hidden md:flex items-center gap-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-5 py-3 rounded-xl transition-all font-medium border border-gray-100 dark:border-gray-600 print:hidden shadow-sm"
            >
               <PrinterIcon class="w-5 h-5" />
               <span>Print Report</span>
            </button>


          </div>
        </div>

        <!-- Timeline / Metadata Bar -->
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">

           <!-- Scheduled -->
           <div v-if="consultation?.scheduled_at" class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300">
                 <CalendarIcon class="w-5 h-5" />
              </div>
              <div>
                 <p class="text-[10px] uppercase font-bold text-blue-400">Scheduled For</p>
                 <p class="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{{ formatDate(consultation?.scheduled_at) }}</p>
              </div>
           </div>
           
           <!-- Response Time -->
           <div v-if="consultation?.responded_at || consultation?.response_time_minutes" class="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-300">
                 <ClockIcon class="w-5 h-5" />
              </div>
              <div>
                 <p class="text-[10px] uppercase font-bold text-green-600">Response Time</p>
                 <p class="font-semibold text-gray-900 dark:text-white">
                   <span v-if="consultation?.response_time_minutes">{{ consultation?.response_time_minutes }} mins</span>
                   <span v-else>Responded</span>
                 </p>
              </div>
           </div>
           
           <!-- Follow Up -->
           <div v-if="consultation?.requires_followup" class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-300">
                 <CalendarIcon class="w-5 h-5" />
              </div>
              <div>
                 <p class="text-[10px] uppercase font-bold text-purple-600">Follow Up</p>
                 <p class="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                    {{ consultation?.followup_date ? formatDate(consultation?.followup_date) : 'Required' }}
                 </p>
              </div>
           </div>


        </div>


        <!-- Vitals Section (Standalone Grid) -->
        <div 
          v-if="consultation?.vitals && Object.values(consultation?.vitals || {}).some(v => v !== null && v !== undefined && v !== '')" 
          class="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700"
        >
            <h4 class="text-xs uppercase font-bold text-gray-400 mb-4 tracking-wider flex items-center gap-2">
                <HeartIcon class="w-4 h-4" />
                Vitals & Measurements
            </h4>
            <div class="grid grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-4">
                <template v-for="(value, key) in consultation?.vitals" :key="key">
                  <!-- Exclude diastolic since it's combined with systolic, but ensure we render if needed -->
                  <div 
                    v-if="value && key !== 'blood_pressure_diastolic'" 
                    class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-2xl flex items-center gap-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  >
                      <!-- Icons based on key -->
                      <div 
                        class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                        :class="{
                           'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400': key.includes('blood_pressure'),
                           'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400': key === 'heart_rate',
                           'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400': key === 'temperature',
                           'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400': key === 'oxygen_saturation',
                           'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400': key === 'respiratory_rate',
                           'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300': key === 'weight' || key === 'height'
                        }"
                      >
                        <HeartIcon v-if="key.includes('blood_pressure')" class="w-6 h-6" />
                        <BoltIcon v-else-if="key === 'temperature' || key === 'heart_rate'" class="w-6 h-6" />
                        <span v-else-if="key === 'oxygen_saturation'" class="font-bold text-sm">O₂</span>
                        <span v-else-if="key === 'weight'" class="font-bold text-sm">Kg</span>
                        <span v-else-if="key === 'height'" class="font-bold text-sm">Cm</span>
                        <span v-else class="font-bold text-sm">Rx</span>
                      </div>
                      
                      <div class="min-w-0">
                        <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider truncate">
                          {{ key.replace(/_/g, ' ').replace('systolic', '').replace('diastolic', '') }}
                        </p>
                        <p class="font-bold text-gray-900 dark:text-white text-lg">
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

        <!-- Diagnoses Section (Standalone Grid) -->
        <div 
           v-if="consultation.diagnoses && consultation.diagnoses.length > 0" 
           class="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 print:hidden"
        >
            <h4 class="text-xs uppercase font-bold text-gray-400 mb-4 tracking-wider flex items-center gap-2">
                <ClipboardDocumentCheckIcon class="w-4 h-4" />
                Medical Diagnoses
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 gap-4">
                <div 
                   v-for="diagnosis in consultation?.diagnoses" 
                   :key="diagnosis.id"
                   class="group relative overflow-hidden bg-fuchsia-50 dark:bg-fuchsia-900/10 p-5 rounded-2xl border border-fuchsia-100 dark:border-fuchsia-800/30 transition-all hover:shadow-md hover:border-fuchsia-200 dark:hover:border-fuchsia-700"
                >
                   <div class="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 text-fuchsia-600 dark:text-fuchsia-400"></div>
                   
                   <div class="relative z-10">
                      <div class="flex justify-between items-start mb-2">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 shadow-sm border border-fuchsia-100 dark:border-fuchsia-900/50">
                           {{ diagnosis.icd_code || 'DX' }}
                        </span>
                        <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-md">{{ diagnosis.type }}</span>
                      </div>
                      
                      <h3 class="font-bold text-gray-900 dark:text-white text-lg mb-1 group-hover:text-fuchsia-700 dark:group-hover:text-fuchsia-300 transition-colors">
                        {{ diagnosis.name }}
                      </h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ diagnosis.category }}</p>
                   </div>
                </div>
            </div>
        </div>

        <!-- Print: Diagnoses List -->
        <div 
            v-if="consultation.diagnoses && consultation.diagnoses.length > 0" 
            class="hidden print:block mt-8 mb-6 break-inside-avoid"
        >
            <h4 class="text-xs uppercase font-bold text-gray-400 mb-4 tracking-wider flex items-center gap-2 border-b-2 border-gray-100 pb-2">
                <ClipboardDocumentCheckIcon class="w-4 h-4" />
                Medical Diagnoses
            </h4>
            
            <div class="flex flex-col">
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

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 print:block">
          
          <!-- LEFT COLUMN: Main Clinical Info -->
          <div class="xl:col-span-2 space-y-8">
            


            <!-- Web: Clinical Details Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
               <Card class="p-6 border-none shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 bg-white dark:bg-gray-800">
                  <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Symptoms</h4>
                  <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ consultation?.symptoms || 'No symptoms recorded.' }}</p>
               </Card>
               <Card class="p-6 border-none shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 bg-white dark:bg-gray-800">
                  <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Medical History</h4>
                  <div class="prose prose-sm dark:prose-invert text-gray-700 dark:text-gray-300" v-html="consultation?.medical_history || 'None recorded.'"></div>
               </Card>
               <Card class="p-6 border-none shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 bg-white dark:bg-gray-800">
                  <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Allergies</h4>
                  <p class="text-red-500 font-medium" v-html="consultation?.allergies || 'No known allergies.'"></p>
               </Card>
               <Card class="p-6 border-none shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 bg-white dark:bg-gray-800">
                  <h4 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Current Medications</h4>
                  <p class="text-gray-700 dark:text-gray-300">{{ consultation?.current_medications || 'None.' }}</p>
               </Card>
            </div>

            <!-- Print: Clinical Details Grid -->
            <div class="hidden print:grid grid-cols-2 gap-x-12 gap-y-8 mb-8 break-inside-avoid">
               <div class="break-inside-avoid">
                  <h4 class="text-[10px] uppercase font-bold text-gray-400 mb-2 border-b border-gray-100 pb-1">Symptoms</h4>
                  <p class="text-sm text-gray-900 leading-relaxed">{{ consultation?.symptoms || 'No symptoms recorded.' }}</p>
               </div>
               <div class="break-inside-avoid">
                  <h4 class="text-[10px] uppercase font-bold text-gray-400 mb-2 border-b border-gray-100 pb-1">Medical History</h4>
                  <div class="text-sm text-gray-900 leading-relaxed" v-html="consultation?.medical_history || 'None recorded.'"></div>
               </div>
               <div class="break-inside-avoid">
                  <h4 class="text-[10px] uppercase font-bold text-gray-400 mb-2 border-b border-gray-100 pb-1">Allergies</h4>
                  <p class="text-sm text-red-600 font-medium leading-relaxed" v-html="consultation?.allergies || 'No known allergies.'"></p>
               </div>
               <div class="break-inside-avoid">
                   <h4 class="text-[10px] uppercase font-bold text-gray-400 mb-2 border-b border-gray-100 pb-1">Current Medications</h4>
                   <p class="text-sm text-gray-900 leading-relaxed">{{ consultation?.current_medications || 'None.' }}</p>
               </div>
            </div>

            <!-- Pharmacist Response & Treatment Plan -->
            <div v-if="consultation?.status !== 'pending' && (consultation?.recommendations || consultation?.pharmacist_notes)" class="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10 rounded-[2rem] p-8 border border-teal-100 dark:border-teal-800/30">
               <h3 class="text-xl font-bold text-teal-900 dark:text-teal-100 mb-6 flex items-center gap-2">
                 <SparklesIcon class="w-6 h-6" />
                 Pharmacist Response & Plan
               </h3>
               
               <div class="space-y-6">
                 <div v-if="consultation?.recommendations" class="bg-white/60 dark:bg-gray-900/40 rounded-2xl p-6 backdrop-blur-sm">
                    <h4 class="font-bold text-teal-800 dark:text-teal-200 mb-3 text-sm uppercase">Recommendations</h4>
                    <div class="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200" v-html="consultation?.recommendations"></div>
                 </div>

                 <div v-if="consultation?.pharmacist_notes" class="bg-white/60 dark:bg-gray-900/40 rounded-2xl p-6 backdrop-blur-sm">
                    <h4 class="font-bold text-teal-800 dark:text-teal-200 mb-3 text-sm uppercase">Private Notes</h4>
                    <div class="text-gray-700 dark:text-gray-300 italic">{{ consultation?.pharmacist_notes }}</div>
                 </div>
               </div>
            </div>
            
            <!-- Prescription Section (Single Object) -->
             <div v-if="consultation?.prescription" class="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] p-6 border border-indigo-100 dark:border-indigo-800/30 print:hidden">
               <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <div>
                    <h3 class="text-lg font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                      <BeakerIcon class="w-5 h-5" />
                      Prescription #{{ consultation?.prescription?.prescription_number }}
                    </h3>
                    <p class="text-xs text-indigo-500 mt-1">Issued {{ formatDate(consultation?.prescription?.created_at) }}</p>
                  </div>
                  <Badge variant="primary" class="px-2 mt-2 sm:mt-0">{{ consultation?.prescription?.status }}</Badge>
               </div>
               
               <div class="grid grid-cols-1 gap-4">
                  <div 
                    v-for="drug in consultation?.prescription?.drugs" 
                    :key="drug.id"
                    class="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                  >
                     <div class="mb-3">
                        <h4 class="font-bold text-gray-900 dark:text-white text-base leading-snug">
                           {{ formatDrugDisplay(drug) }}
                        </h4>
                     </div>
                     
                     <div class="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl">
                        <div class="font-bold flex items-center gap-2">
                           <span class="bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded text-xs text-gray-700 dark:text-gray-300">QTY: {{ drug.quantity }} {{ drug.uom }}</span>
                        </div>
                        <span class="hidden sm:inline text-gray-300">|</span>
                        <div class="flex items-center gap-2 font-medium">
                           <ClockIcon class="w-4 h-4 text-indigo-500" />
                           {{ drug.frequency }}
                        </div>
                        <span class="hidden sm:inline text-gray-300">|</span>
                        <div class="flex items-center gap-2 font-medium">
                           <CalendarIcon class="w-4 h-4 text-indigo-500" />
                           {{ drug.duration }}
                        </div>
                     </div>

                     <div v-if="drug.instruction" class="mt-3 text-sm text-gray-600 dark:text-gray-300 italic pl-3 border-l-2 border-indigo-400">
                       "{{ drug.instruction }}"
                     </div>
                  </div>
               </div>
               </div>

             <!-- Print: Prescription Table -->
             <div v-if="consultation?.prescription" class="hidden print:block mt-6 break-inside-avoid">
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

          <!-- RIGHT COLUMN: Patient, Pharmacy, Meta -->
          <div class="space-y-6 print:hidden">
            
            <!-- Patient Mini Card -->
            <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
               <div class="flex items-center gap-4 mb-6">
                 <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center text-[#246BFD]">
                    <UserCircleIcon class="w-8 h-8" />
                 </div>
                 <div>
                    <h3 class="font-bold text-gray-900 dark:text-white">{{ consultation?.patient_name }}</h3>
                    <p class="text-sm text-gray-500">{{ consultation?.patient_email }}</p>
                    <p class="text-sm text-gray-500">{{ consultation?.patient_phone }}</p>
                 </div>
               </div>
               
               <div class="grid grid-cols-2 gap-3 text-center">
                  <div class="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl">
                     <p class="text-[10px] uppercase font-bold text-gray-400">Gender</p>
                     <p class="font-semibold text-gray-900 dark:text-white capitalize">{{ consultation?.patient_gender || 'N/A' }}</p>
                  </div>
                   <div class="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl">
                     <p class="text-[10px] uppercase font-bold text-gray-400">DOB</p>
                     <p class="font-semibold text-gray-900 dark:text-white">{{ consultation?.patient_date_of_birth || 'N/A' }}</p>
                  </div>
               </div>
            </div>

            <!-- Pharmacy Info -->
            <div v-if="consultation?.pharmacy" class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
               <h4 class="text-xs uppercase font-bold text-gray-400 mb-4 tracking-wider">Assigned Pharmacy</h4>
               <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600">
                     <BuildingStorefrontIcon class="w-6 h-6" />
                  </div>
                  <div>
                     <p class="font-bold text-gray-900 dark:text-white">{{ consultation?.pharmacy?.name }}</p>
                     <p class="text-xs text-gray-500 mt-0.5">Primary Provider</p>
                  </div>
               </div>
               
               <div v-if="consultation?.assigned_pharmacist" class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div class="flex items-center gap-3">
                     <div class="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span class="text-xs font-bold">{{ consultation?.assigned_pharmacist?.name.charAt(0) }}</span>
                     </div>
                     <div>
                        <p class="text-sm font-semibold">{{ consultation?.assigned_pharmacist?.name }}</p>
                        <p class="text-[10px] text-gray-500 uppercase">Pharmacist</p>
                     </div>
                  </div>
               </div>
            </div>

            <!-- Attachments -->
             <div v-if="consultation?.attachments && consultation?.attachments.length > 0" class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
               <h4 class="text-xs uppercase font-bold text-gray-400 mb-4 tracking-wider flex justify-between">
                 Attachments 
                 <span class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-[10px]">{{ consultation?.attachments?.length }}</span>
               </h4>
               
               <div class="space-y-3">
                 <div 
                    v-for="(file, idx) in consultation?.attachments" 
                    :key="idx"
                    class="group flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    @click="isImage(file) ? openFile(getFileUrl(file)) : forceDownload(file)"
                 >
                    <img 
                      v-if="isImage(file)" 
                      :src="getFileUrl(file)" 
                      class="w-10 h-10 rounded-lg object-cover bg-white" 
                    />
                    <div v-else class="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300">
                        <DocumentTextIcon class="w-5 h-5" />
                    </div>
                    
                    <div class="flex-1 min-w-0">
                       <p class="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{{ getFileName(file) }}</p>
                       <p class="text-[10px] text-gray-400">Click to view</p>
                    </div>
                    <ArrowDownTrayIcon class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
               </div>
             </div>
            
            <!-- Rating Section -->
            <div v-if="['responded', 'completed'].includes(consultation?.status || '') && consultation?.status !== 'cancelled'" class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-yellow-100 dark:border-yellow-900/30 relative overflow-hidden">
               <div class="absolute top-0 right-0 w-20 h-20 bg-yellow-400/10 rounded-bl-[3rem]"></div>
               <h4 class="font-bold text-gray-900 dark:text-white mb-4">Consultation Review</h4>
               
               <div class="flex justify-center gap-2 mb-6">
                 <button 
                    v-for="star in 5" 
                    :key="star"
                    @click="!consultation?.rating ? userRating = star : null"
                    :disabled="!!consultation?.rating"
                    class="transition-transform hover:scale-110 focus:outline-none"
                    :class="!!consultation?.rating ? 'cursor-default' : 'cursor-pointer'"
                  >
                     <component 
                       :is="star <= userRating ? StarIconSolid : StarIconOutline" 
                       class="w-8 h-8"
                       :class="star <= userRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                     />
                  </button>
               </div>
               
               <div v-if="!consultation?.rating">
                  <textarea 
                    v-model="userFeedback"
                    rows="3"
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-[#246BFD] focus:outline-none transition-all resize-none text-sm mb-4"
                    placeholder="Describe your experience..."
                  ></textarea>
                  <Button 
                     variant="primary" 
                     class="w-full !rounded-xl"
                     :loading="isSubmittingRating"
                     :disabled="userRating === 0"
                     @click="submitReview"
                   >
                     Submit Feedback
                   </Button>
               </div>
               <div v-else-if="consultation?.feedback">
                  <p class="text-sm text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl">"{{ consultation?.feedback }}"</p>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Print Footer -->
    <div class="hidden print:flex fixed bottom-0 left-0 right-0 border-t-2 border-[#246BFD] bg-white p-8 flex-col gap-4 text-xs text-gray-500">
      <div class="flex justify-between items-start">
         <div class="space-y-1">
            <p class="font-bold text-[#1A2233] text-sm mb-2">FyndRx Healthcare</p>
            <p>Mayflower Building, Community 10</p>
            <p>Tema, Greater Accra</p>
         </div>
         <div class="space-y-1 text-right">
            <p>info@fyndrx.com</p>
            <p>+233 24 399 6999</p>
            <p class="font-medium text-[#FE9615]">www.fyndrx.com</p>
         </div>
      </div>
      <div class="text-center pt-4 border-t border-gray-100">
         <p>&copy; {{ new Date().getFullYear() }} FyndRx. Confidential Medical Record.</p>
      </div>
    </div>
  </div>
</template>
