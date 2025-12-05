<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { consultationService } from '@/services/consultationService';
import { authService } from '@/services/auth.service';
import type { CreateConsultationPayload, ConsultationType, ConsultationPriority } from '@/types/consultation';
import Button from '@/components/Button.vue';
import TextInput from '@/components/TextInput.vue';
import Card from '@/components/Card.vue';
import { 
  CheckCircleIcon, 
  UserIcon,
  ClipboardDocumentListIcon, 
  ClockIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PaperClipIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';
import { StarIcon, ShieldCheckIcon, HeartIcon, BoltIcon } from '@heroicons/vue/24/solid';

const router = useRouter();
const currentStep = ref(1);
const submitting = ref(false);
const error = ref('');

// Form Data with Defaults
const form = reactive<CreateConsultationPayload>({
  consultation_type: 'general',
  priority: 'normal',
  subject: '',
  symptoms: '',
  medical_history: '',
  current_medications: '',
  allergies: '',
  consultation_notes: '',
  patient_name: '',
  patient_email: '',
  patient_phone: '',
  patient_date_of_birth: '',
  patient_gender: '' as any,
  pharmacy_id: 1, // Hardcoded as requested
  source: 'web',
  attachments: [],
  user_id: 0
});

// Options
const consultationTypes = [
  { value: 'general', label: 'General Inquiry', icon: StarIcon, desc: 'General health questions' },
  { value: 'medication_review', label: 'Medication Review', icon: ShieldCheckIcon, desc: 'Review current meds' },
  { value: 'chronic_disease', label: 'Chronic Disease', icon: HeartIcon, desc: 'Sort term management' },
  { value: 'acute_illness', label: 'Acute Illness', icon: BoltIcon, desc: 'Flu, cold, etc.' },
];

const steps = [
  { number: 1, title: 'Triage', icon: ClockIcon },
  { number: 2, title: 'Patient', icon: UserIcon },
  { number: 3, title: 'Clinical', icon: ClipboardDocumentListIcon },
  { number: 4, title: 'Attachments', icon: PaperClipIcon },
  { number: 5, title: 'Review', icon: CheckCircleIcon },
];

// Navigation Logic
const nextStep = () => {
  if (currentStep.value === 3 && !form.subject) { // Clinical is now Step 3
    alert('Subject is required');
    return;
  }
  if (currentStep.value < 5) currentStep.value++;
};

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

const submitConsultation = async () => {
  try {
    submitting.value = true;
    error.value = '';

    if (!form.user_id) {
      error.value = 'User ID is missing. Please try reloading the page.';
      submitting.value = false;
      return;
    }

    console.log(form);
    await consultationService.createConsultation(form);
    router.push('/consultations');
  } catch (err: any) {
    console.error(err);
    error.value = err.response?.data?.message || 'Failed to create consultation.';
  } finally {
    submitting.value = false;
  }
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const newFiles = Array.from(target.files);
    // Append to existing files (optional, or replace)
    // Here we'll append
    if (!form.attachments) form.attachments = [];
    form.attachments = [...form.attachments, ...newFiles];
  }
};

const removeFile = (index: number) => {
  if (form.attachments) {
    form.attachments = form.attachments.filter((_, i) => i !== index);
  }
};

const stepsProgress = computed(() => {
  return ((currentStep.value - 1) / (steps.length - 1)) * 100;
});

onMounted(async () => {
  try {
    const user = await authService.getUserDetails();
    if (user) {
      form.patient_name = user.fullname || `${user.firstname || ''} ${user.lastname || ''}`.trim();
      form.patient_email = user.email || '';
      form.patient_phone = user.phone_number || '';
      form.patient_date_of_birth = user.dob || '';
      form.user_id = user.id;
    }
  } catch (err) {
    console.error('Failed to load user details:', err);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 px-4">
    <div class="max-w-3xl mx-auto">
      
      <!-- Stepper Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-6">New Consultation</h1>
        
        <div class="relative flex justify-between items-center max-w-lg mx-auto">
          <!-- Progress Bar Background -->
          <div class="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-0 -translate-y-1/2 rounded-full"></div>
          <!-- Active Progress -->
          <div class="absolute top-1/2 left-0 h-1 bg-[#246BFD] -z-0 -translate-y-1/2 rounded-full transition-all duration-500" :style="{ width: `${stepsProgress}%` }"></div>

          <!-- Steps -->
          <div 
            v-for="step in steps" 
            :key="step.number"
            class="relative z-10 flex flex-col items-center group cursor-pointer"
            @click="currentStep > step.number ? currentStep = step.number : null"
          >
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white dark:bg-gray-800"
              :class="[
                currentStep >= step.number ? 'border-[#246BFD] text-[#246BFD]' : 'border-gray-300 dark:border-gray-600 text-gray-400'
              ]"
            >
              <component :is="step.icon" class="w-5 h-5" />
            </div>
            <span 
              class="absolute -bottom-6 text-xs font-medium transition-colors duration-300 whitespace-nowrap"
              :class="currentStep >= step.number ? 'text-[#246BFD]' : 'text-gray-400'"
            >
              {{ step.title }}
            </span>
          </div>
        </div>
      </div>

      <!-- Form Content -->
      <Card class="p-8 min-h-[400px] relative overflow-hidden transition-all duration-500">
        <Transition name="fade" mode="out-in">
          
          <!-- STEP 1: TRIAGE -->
          <div v-if="currentStep === 1" key="step1" class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Urgency & Type</h2>
            
            <div class="space-y-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Consultation Type</label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  v-for="type in consultationTypes" 
                  :key="type.value"
                  @click="form.consultation_type = type.value as ConsultationType"
                  class="p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md flex items-center gap-3"
                  :class="form.consultation_type === type.value ? 'border-[#246BFD] bg-blue-50 dark:bg-blue-900/20 ring-1 ring-[#246BFD]' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'"
                >
                  <div class="p-2 rounded-full bg-white dark:bg-gray-800 text-[#246BFD]">
                    <component :is="type.icon" class="w-5 h-5" />
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">{{ type.label }}</div>
                    <div class="text-xs text-gray-500">{{ type.desc }}</div>
                  </div>
                </div>
              </div>
            </div>

              <div class="space-y-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority Level</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="p in ['low', 'normal', 'high', 'urgent']"
                  :key="p"
                  type="button"
                  @click="form.priority = p as ConsultationPriority"
                  class="px-4 py-2 rounded-full text-sm font-medium capitalize transition-all border"
                  :class="[
                    form.priority === p 
                      ? 'text-white shadow-md' 
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                    form.priority === p && p === 'low' ? 'bg-green-500 border-green-500' : '',
                    form.priority === p && p === 'normal' ? 'bg-[#246BFD] border-[#246BFD]' : '',
                    form.priority === p && p === 'high' ? 'bg-orange-500 border-orange-500' : '',
                    form.priority === p && p === 'urgent' ? 'bg-red-500 border-red-500' : ''
                  ]"
                >
                  {{ p }}
                </button>
              </div>
            </div>
            
            <div class="pt-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
               <p class="text-sm text-yellow-800 dark:text-yellow-200 flex items-center">
                 <ClockIcon class="w-4 h-4 mr-2" />
                 Typical response time for  <strong>{{ form.priority }}</strong>  priority is under 24 hours.
               </p>
            </div>
          </div>

          <!-- STEP 2: PATIENT PROFILE -->
          <div v-else-if="currentStep === 2" key="step2" class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Patient Details</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
               <TextInput label="Full Name" v-model="form.patient_name" disabled />
               <TextInput label="Email Address" v-model="form.patient_email" disabled />
               <TextInput label="Phone Number" v-model="form.patient_phone" disabled />
               
               <TextInput 
                 label="Date of Birth *" 
                 type="date" 
                 v-model="form.patient_date_of_birth" 
                 required 
               />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender *</label>
              <div class="relative">
                <select 
                  v-model="form.patient_gender"
                  class="w-full px-5 py-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#246BFD] focus:ring-opacity-50 transition-all font-medium"
                  required
                >
                  <option value="" disabled selected>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 3: CLINICAL -->
          <div v-else-if="currentStep === 3" key="step3" class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Clinical Context</h2>
            
            <TextInput label="Subject / Check-in Reason *" v-model="form.subject" placeholder="e.g. Severe Headache" required />
            
            <TextInput 
              type="textarea" 
              label="Symptoms" 
              v-model="form.symptoms" 
              placeholder="Describe what you are feeling..." 
              :rows="3" 
            />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput 
                type="textarea" 
                label="Medical History" 
                v-model="form.medical_history" 
                placeholder="Past conditions..." 
                :rows="2" 
              />
              <TextInput 
                type="textarea" 
                label="Current Medications" 
                v-model="form.current_medications" 
                placeholder="Meds you are taking..." 
                :rows="2" 
              />
              <TextInput 
                type="textarea" 
                label="Allergies" 
                v-model="form.allergies" 
                placeholder="Any known allergies..." 
                :rows="2"
                class="md:col-span-2" 
              />
              <TextInput 
                type="textarea" 
                label="Consultation Notes" 
                v-model="form.consultation_notes" 
                placeholder="Any additional context..." 
                :rows="2"
                class="md:col-span-2" 
              />
            </div>
          </div>

          <!-- STEP 4: ATTACHMENTS -->
          <div v-else-if="currentStep === 4" key="step4" class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Attachments</h2>
            <p class="text-sm text-gray-500 mb-6">Upload any relevant documents, reports, or images.</p>
            
            <div class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-[#246BFD] transition-colors bg-gray-50 dark:bg-gray-800/50">
               <input 
                 type="file" 
                 multiple 
                 class="hidden" 
                 id="file-upload"
                 @change="handleFileChange"
                 accept="image/*,.pdf,.doc,.docx"
               />
               <label for="file-upload" class="cursor-pointer flex flex-col items-center justify-center">
                 <div class="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-[#246BFD]">
                   <PaperClipIcon class="w-8 h-8" />
                 </div>
                 <p class="font-medium text-gray-900 dark:text-white">Click to upload files</p>
                 <p class="text-xs text-gray-500 mt-2">PDF, DOC, JPG, PNG (Max 5MB)</p>
               </label>
            </div>

            <!-- File List -->
            <div v-if="form.attachments && form.attachments.length > 0" class="space-y-2 mt-4">
              <div 
                v-for="(file, index) in form.attachments" 
                :key="index"
                class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <div class="flex items-center gap-3 overflow-hidden">
                   <div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                     <PaperClipIcon class="w-4 h-4 text-gray-500" />
                   </div>
                   <span class="text-sm font-medium truncate text-gray-700 dark:text-gray-300">{{ file.name }}</span>
                   <span class="text-xs text-gray-400">({{ (file.size / 1024).toFixed(0) }} KB)</span>
                </div>
                <button 
                  @click="removeFile(index)" 
                  class="p-1 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-400 transition-colors"
                >
                  <XMarkIcon class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- STEP 5: REVIEW -->
          <div v-else-if="currentStep === 5" key="step5" class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">Review Summary</h2>
            
            <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
               <!-- Decorative Header -->
               <div class="h-2 w-full bg-gradient-to-r from-blue-500 to-[#246BFD]"></div>
               
               <div class="p-8">
                 <div class="flex justify-between items-start mb-6 pb-6 border-b border-gray-100 dark:border-gray-700 border-dashed">
                    <div>
                      <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Subject</p>
                      <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ form.subject }}</h3>
                    </div>
                    <div class="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg text-xs font-mono text-gray-500">
                      Draft
                    </div>
                 </div>

                 <div class="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Type</p>
                      <div class="flex items-center gap-2">
                        <StarIcon v-if="form.consultation_type === 'general'" class="w-5 h-5 text-yellow-400" />
                        <ShieldCheckIcon v-else-if="form.consultation_type === 'medication_review'" class="w-5 h-5 text-blue-400" />
                        <span class="font-medium text-gray-700 dark:text-gray-300 capitalize">{{ form.consultation_type.replace('_', ' ') }}</span>
                      </div>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Priority</p>
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                        :class="{
                          'bg-green-100 text-green-800': form.priority === 'low',
                          'bg-blue-100 text-blue-800': form.priority === 'normal',
                          'bg-orange-100 text-orange-800': form.priority === 'high',
                          'bg-red-100 text-red-800': form.priority === 'urgent'
                        }"
                      >
                        {{ form.priority }}
                      </span>
                    </div>
                  </div>

                  <div class="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700 border-dashed">
                      <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Patient Details</p>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <p class="text-xs text-gray-400">Name</p>
                          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ form.patient_name }}</p>
                        </div>
                         <div>
                          <p class="text-xs text-gray-400">Date of Birth</p>
                          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ form.patient_date_of_birth }}</p>
                        </div>
                        <div>
                          <p class="text-xs text-gray-400">Gender</p>
                          <p class="text-sm font-medium text-gray-900 dark:text-white capitalize">{{ form.patient_gender }}</p>
                        </div>
                      </div>
                  </div>

                  <div class="space-y-4">
                    <div v-if="form.symptoms">
                      <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Detailed Symptoms</p>
                      <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed border border-gray-100 dark:border-gray-700">
                        "{{ form.symptoms }}"
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div v-if="form.medical_history">
                          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">History</p>
                          <p class="text-sm text-gray-700 dark:text-gray-300">{{ form.medical_history }}</p>
                       </div>
                        <div v-if="form.allergies">
                          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Allergies</p>
                          <p class="text-sm text-red-600 dark:text-red-400 font-medium">{{ form.allergies }}</p>
                       </div>
                       <div v-if="form.current_medications">
                          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Meds</p>
                          <p class="text-sm text-gray-700 dark:text-gray-300">{{ form.current_medications }}</p>
                       </div>
                    </div>

                    <div v-if="form.attachments && form.attachments.length > 0" class="pt-4 border-t border-gray-100 dark:border-gray-700 border-dashed">
                      <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Attachments ({{ form.attachments.length }})</p>
                      <div class="flex flex-wrap gap-2">
                        <div 
                          v-for="(file, i) in form.attachments" 
                          :key="i"
                          class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <PaperClipIcon class="w-3 h-3 text-gray-400" />
                          <span class="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[150px]">{{ file.name }}</span>
                        </div>
                      </div>
                    </div>
                 </div>
               </div>
            </div>

            <div v-if="error" class="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center border border-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              {{ error }}
            </div>
          </div>

        </Transition>
      </Card>

      <!-- Footer Actions -->
      <div class="mt-8 flex justify-between items-center">
        <Button 
          v-if="currentStep > 1"
          variant="secondary"
          @click="prevStep"
          class="flex items-center"
        >
          <ChevronLeftIcon class="w-4 h-4 mr-2" /> Back
        </Button>
        <div v-else></div> <!-- Spacer -->

        <Button 
          v-if="currentStep < 5"
          variant="primary"
          @click="nextStep"
          class="flex items-center"
        >
          Next <ChevronRightIcon class="w-4 h-4 ml-2" />
        </Button>
        <Button 
          v-else
          variant="primary"
          :loading="submitting"
          @click="submitConsultation"
          class="bg-green-600 hover:bg-green-700 border-green-600 flex items-center px-8"
        >
          Confirm Consultation <CheckCircleIcon class="w-5 h-5 ml-2" />
        </Button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
