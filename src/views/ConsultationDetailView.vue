<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { format } from 'date-fns';
import { consultationService } from '@/services/consultationService';
import type { Consultation } from '@/types/consultation';
import Badge from '@/components/Badge.vue';
import Button from '@/components/Button.vue';
import Card from '@/components/Card.vue';
import { 
  UserCircleIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  CalendarIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  BeakerIcon,
  ArrowLeftIcon,
  PaperClipIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  StarIcon as StarIconOutline
} from '@heroicons/vue/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/vue/24/solid';

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
  if (!path) {
    return '#';
  }
  if (path.startsWith('http')) return path;
  // Use environment variable for storage URL
  const storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage/';
  return `${storageUrl}${path.replace(/^\/+/, '')}`;
};

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
    
    // Fetch the file as a blob
    const response = await fetch(url);
    const blob = await response.blob();
    
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error('Download failed:', err);
    // Fallback to opening in new tab
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
    
    // Update local state
    consultation.value.rating = userRating.value;
    consultation.value.rating_feedback = userFeedback.value;
    
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
    
    if (consultation.value) {
       // Initialize rating state
       if (consultation.value.rating) {
         userRating.value = consultation.value.rating;
         userFeedback.value = consultation.value.rating_feedback || '';
       }
    } else {
      error.value = 'Consultation data is empty';
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

const priorityColor = computed(() => {
  if (!consultation.value) return 'default';
  switch (consultation.value.priority) {
    case 'urgent': return 'error';
    case 'high': return 'warning';
    case 'normal': return 'primary';
    case 'low': return 'default';
    default: return 'default';
  }
});

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  try {
    return format(new Date(dateStr), 'PPP p');
  } catch {
    return dateStr;
  }
};

const goBack = () => router.push('/consultations');

onMounted(() => {
  fetchConsultation();
});
</script>

<template>
  <div class="container mx-auto px-4 pt-28 pb-12 max-w-6xl">
    <!-- Back Navigation -->
    <button 
      @click="goBack" 
      class="flex items-center text-gray-500 hover:text-[#246BFD] transition-colors mb-6 group"
    >
      <ArrowLeftIcon class="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
      Back to Consultations
    </button>

    <div v-if="loading" class="space-y-6">
      <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
      <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
    </div>

    <div v-else-if="error" class="text-center py-20">
      <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">{{ error }}</h3>
      <Button variant="secondary" @click="goBack">Return to List</Button>
    </div>

    <div v-else-if="!consultation" class="text-center py-20">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">No Consultation Data</h3>
        <p class="text-gray-500 mb-6">Unable to retrieve details for this consultation.</p>
        <Button variant="secondary" @click="goBack">Return to List</Button>
    </div>

    <div v-else class="space-y-6">
      
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <div class="flex items-center gap-3 mb-2">
             <Badge :variant="statusColor" size="lg" class="capitalize">
              {{ consultation.status?.replace('_', ' ') }}
             </Badge>
             <span class="text-sm text-gray-500 font-mono">#{{ consultation.consultation_number }}</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ consultation.subject }}
          </h1>
          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
            <div class="flex items-center gap-1">
              <CalendarIcon class="w-4 h-4" />
              Created {{ formatDate(consultation.created_at) }}
            </div>
            <div class="flex items-center gap-1">
              <ClockIcon class="w-4 h-4" />
              Priority: <Badge :variant="priorityColor" size="sm" class="ml-1 uppercase text-xs">{{ consultation.priority }}</Badge>
            </div>
             <div v-if="consultation.scheduled_at" class="flex items-center gap-1 text-[#246BFD] font-medium">
              <ClockIcon class="w-4 h-4" />
              Scheduled: {{ formatDate(consultation.scheduled_at) }}
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left Column: Clinical Info (2/3 width) -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Clinical Details -->
          <Card class="p-0 overflow-hidden border-none shadow-lg">
            <div class="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-800">
               <h3 class="font-semibold text-gray-900 dark:text-white flex items-center">
                 <DocumentTextIcon class="w-5 h-5 mr-2 text-[#246BFD]" />
                 Clinical Details
               </h3>
            </div>
            <div class="p-6 space-y-6">
              
              <div v-if="consultation.symptoms">
                <label class="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Symptoms</label>
                <div class="text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl leading-relaxed">
                  {{ consultation.symptoms }}
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div v-if="consultation.medical_history">
                  <label class="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Medical History</label>
                  <p class="text-gray-700 dark:text-gray-300">{{ consultation.medical_history }}</p>
                </div>
                <div v-if="consultation.allergies">
                  <label class="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Allergies</label>
                  <p class="text-red-600 dark:text-red-400 font-medium">{{ consultation.allergies }}</p>
                </div>
              </div>

              <div v-if="consultation.current_medications">
                 <div class="flex items-center gap-2 mb-2">
                   <BeakerIcon class="w-4 h-4 text-gray-400" />
                   <label class="block text-xs uppercase tracking-wider text-gray-500 font-bold">Current Medications</label>
                 </div>
                 <p class="text-gray-700 dark:text-gray-300">{{ consultation.current_medications }}</p>
              </div>

               <div v-if="consultation.consultation_notes" class="pt-4 border-t border-gray-100 dark:border-gray-700">
                 <label class="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Patient Notes</label>
                 <p class="text-gray-600 dark:text-gray-400 italic">"{{ consultation.consultation_notes }}"</p>
              </div>
            </div>
          </Card>

          <!-- Pharmacist Response Section -->
          <Card 
            v-if="consultation.status === 'responded' || consultation.status === 'completed' || consultation.recommendations || consultation.pharmacist_notes" 
            class="p-0 overflow-hidden border-teal-500 border shadow-lg ring-1 ring-teal-500/20"
          >
             <div class="bg-teal-50 dark:bg-teal-900/20 p-4 border-b border-teal-100 dark:border-teal-800">
               <h3 class="font-semibold text-teal-900 dark:text-teal-100 flex items-center">
                 <ChatBubbleLeftRightIcon class="w-5 h-5 mr-2" />
                 Pharmacist Response
               </h3>
            </div>
             <div class="p-6 space-y-6">
                <!-- Recommendations -->
                <div v-if="consultation.recommendations">
                  <label class="block text-xs uppercase tracking-wider text-teal-600 dark:text-teal-400 font-bold mb-2">Recommendations</label>
                  <div class="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                    {{ consultation.recommendations }}
                  </div>
                </div>

                <!-- Pharmacist Notes -->
                <div v-if="consultation.pharmacist_notes">
                   <label class="block text-xs uppercase tracking-wider text-teal-600 dark:text-teal-400 font-bold mb-2">Notes</label>
                   <p class="text-gray-700 dark:text-gray-300">{{ consultation.pharmacist_notes }}</p>
                </div>

                 <!-- Cancelled Reason (if separate, typically unique to cancel status but fits here for feedback) -->
             </div>
          </Card>

          <!-- Review & Rating Section -->
          <Card 
            v-if="(consultation.status === 'responded' || consultation.status === 'completed') && !consultation.cancelled_at" 
            class="p-0 overflow-hidden border-yellow-400 border shadow-lg ring-1 ring-yellow-400/20"
          >
             <div class="bg-yellow-50 dark:bg-yellow-900/10 p-4 border-b border-yellow-100 dark:border-yellow-800">
               <h3 class="font-semibold text-yellow-800 dark:text-yellow-200 flex items-center">
                 <StarIconSolid class="w-5 h-5 mr-2" />
                 Rate Your Experience
               </h3>
            </div>
             <div class="p-6 space-y-6">
                
                <div class="flex flex-col items-center">
                   <div class="flex items-center gap-2 mb-4">
                      <button 
                        v-for="star in 5" 
                        :key="star"
                        @click="!consultation.rating ? userRating = star : null"
                        class="focus:outline-none transition-transform hover:scale-110"
                        :class="consultation.rating ? 'cursor-default' : 'cursor-pointer'"
                      >
                         <component 
                           :is="star <= userRating ? StarIconSolid : StarIconOutline" 
                           class="w-8 h-8 transition-colors duration-200"
                           :class="star <= userRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                         />
                      </button>
                   </div>
                   <p class="text-sm font-medium text-gray-500 mb-6" v-if="!consultation.rating">
                     {{ userRating === 0 ? 'Click stars to rate' : `You picked ${userRating} star${userRating > 1 ? 's' : ''}` }}
                   </p>
                </div>

                <div v-if="!consultation.rating">
                  <label class="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Feedback (Optional)</label>
                  <textarea 
                    v-model="userFeedback"
                    rows="3"
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-[#246BFD] focus:outline-none transition-all resize-none text-sm"
                    placeholder="How was your consultation experience?"
                  ></textarea>
                </div>
                <div v-else-if="consultation.rating_feedback">
                   <label class="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Your Feedback</label>
                   <p class="text-gray-700 dark:text-gray-300 italic">"{{ consultation.rating_feedback }}"</p>
                </div>

                <div v-if="!consultation.rating" class="flex justify-end">
                   <Button 
                     variant="primary" 
                     :loading="isSubmittingRating"
                     :disabled="userRating === 0"
                     @click="submitReview"
                   >
                     Submit Review
                   </Button>
                </div>
             </div>
          </Card>

           <!-- Attachments Section -->
           <Card v-if="consultation.attachments && consultation.attachments.length > 0" class="p-0 overflow-hidden border-none shadow-md">
            <div class="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-800">
               <h3 class="font-semibold text-gray-900 dark:text-white flex items-center">
                 <PaperClipIcon class="w-5 h-5 mr-2 text-[#246BFD]" />
                 Attachments
               </h3>
            </div>
            <div class="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div 
                v-for="(file, index) in consultation.attachments" 
                :key="index"
                class="group relative aspect-square rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-all duration-300"
              >
                <!-- Image Preview -->
                <template v-if="isImage(file)">
                    <img 
                      :src="getFileUrl(file)" 
                      :alt="getFileName(file)"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a 
                          :href="getFileUrl(file)" 
                          target="_blank"
                          class="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-colors"
                          title="View"
                        >
                            <EyeIcon class="w-5 h-5" />
                        </a>
                        <button 
                          @click.prevent="forceDownload(file)"
                          class="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-colors"
                          title="Download"
                        >
                            <ArrowDownTrayIcon class="w-5 h-5" />
                        </button>
                    </div>
                </template>

                <!-- Document File -->
                <template v-else>
                    <div class="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        <div class="w-12 h-12 mb-3 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#246BFD]">
                            <DocumentIcon class="w-6 h-6" />
                        </div>
                        <p class="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-2 break-all">{{ getFileName(file) }}</p>
                    </div>
                    <!-- Hover Actions for Docs -->
                     <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                        <div class="flex gap-2">
                             <a 
                              :href="getFileUrl(file)" 
                              target="_blank"
                              class="p-2 bg-white dark:bg-gray-800 shadow-md rounded-full text-gray-600 dark:text-gray-300 hover:text-[#246BFD] transition-colors"
                              title="View"
                            >
                                <EyeIcon class="w-4 h-4" />
                            </a>
                             <button 
                              @click.prevent="forceDownload(file)"
                              class="p-2 bg-white dark:bg-gray-800 shadow-md rounded-full text-gray-600 dark:text-gray-300 hover:text-[#246BFD] transition-colors"
                              title="Download"
                            >
                                <ArrowDownTrayIcon class="w-4 h-4" />
                            </button>
                        </div>
                     </div>
                </template>
              </div>
            </div>
          </Card>
        </div>

        <!-- Right Column: Patient & Context (1/3 width) -->
        <div class="space-y-6">
          
          <!-- Patient Card -->
          <Card class="p-6 text-center relative overflow-hidden">
             <div class="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#246BFD]/10 to-transparent"></div>
             <div class="relative z-10">
               <div class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto flex items-center justify-center mb-4 shadow-inner">
                 <UserCircleIcon class="w-12 h-12 text-gray-400" />
               </div>
               <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1">{{ consultation.patient_name }}</h3>
               <p class="text-sm text-gray-500 mb-6">Patient</p>
               
               <div class="space-y-3 text-left">
                 <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                   <PhoneIcon class="w-5 h-5 text-gray-400" />
                   <span class="text-sm font-medium">{{ consultation.patient_phone }}</span>
                 </div>
                 <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                   <EnvelopeIcon class="w-5 h-5 text-gray-400" />
                   <span class="text-sm font-medium">{{ consultation.patient_email }}</span>
                 </div>
               </div>
             </div>
          </Card>

          <!-- Assigned Pharmacist Card -->
          <Card v-if="consultation.assigned_pharmacist" class="p-6 relative overflow-hidden text-center border-t-4 border-t-teal-500">
             <div class="relative z-10">
               <div class="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 rounded-full mx-auto flex items-center justify-center mb-3">
                 <UserCircleIcon class="w-10 h-10 text-teal-600 dark:text-teal-400" />
               </div>
               <h3 class="text-base font-bold text-gray-900 dark:text-white mb-1">{{ consultation.assigned_pharmacist.name }}</h3>
               <p class="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-4">Pharmacist</p>
               
               <div class="space-y-2 text-left bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                 <div class="flex items-center gap-2">
                   <PhoneIcon class="w-4 h-4 text-gray-400" />
                   <span class="text-xs font-medium text-gray-700 dark:text-gray-300 break-all">{{ consultation.assigned_pharmacist.phone_number }}</span>
                 </div>
                 <div class="flex items-center gap-2">
                   <EnvelopeIcon class="w-4 h-4 text-gray-400" />
                   <span class="text-xs font-medium text-gray-700 dark:text-gray-300 break-all">{{ consultation.assigned_pharmacist.email }}</span>
                 </div>
               </div>
             </div>
          </Card>

          <!-- Pharmacy Card -->
          <Card v-if="consultation.pharmacy" class="p-4 border-l-4 border-l-emerald-500">
             <div class="flex items-center gap-3">
               <div class="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                  <BeakerIcon class="w-6 h-6" />
               </div>
               <div>
                  <p class="text-xs text-gray-500 uppercase font-bold">Assigned Pharmacy</p>
                  <p class="font-bold text-gray-900 dark:text-white">{{ consultation.pharmacy.name }}</p>
               </div>
             </div>
          </Card>

          <!-- Type Info -->
          <Card class="p-4 flex items-center gap-4">
             <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-[#246BFD]">
               <ChatBubbleLeftRightIcon class="w-6 h-6" />
             </div>
             <div>
               <p class="text-xs text-gray-500 uppercase font-bold">Consultation Type</p>
               <p class="font-semibold text-gray-900 dark:text-white capitalize">{{ consultation.consultation_type.replace('_', ' ') }}</p>
             </div>
          </Card>

          <!-- Cancelled Reason -->
          <Card v-if="consultation.status === 'cancelled' && consultation.cancellation_reason" class="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
             <h4 class="text-red-800 dark:text-red-300 font-bold text-sm mb-1">Cancellation Reason</h4>
             <p class="text-red-700 dark:text-red-400 text-sm">{{ consultation.cancellation_reason }}</p>
          </Card>
          
        </div>

      </div>
    </div>
  </div>
</template>
