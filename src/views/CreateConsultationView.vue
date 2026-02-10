<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { consultationService } from '@/services/consultationService';
import { authService } from '@/services/auth.service';
import type { CreateConsultationPayload, ConsultationType, ConsultationPriority } from '@/types/consultation';
import Button from '@/components/Button.vue';
import TextInput from '@/components/TextInput.vue';
import Card from '@/components/Card.vue';
import Dropdown from '@/components/Dropdown.vue';
import { 
  CheckCircleIcon, 
  UserIcon,
  ClipboardDocumentListIcon, 
  ClockIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  HeartIcon as HeartOutlineIcon
} from '@heroicons/vue/24/outline';
import { StarIcon, ShieldCheckIcon, HeartIcon, BoltIcon, ChartBarIcon } from '@heroicons/vue/24/solid';

const router = useRouter();
const currentStep = ref(1);
const submitting = ref(false);
const error = ref('');
const formErrors = reactive({
  symptoms: '',
  medical_history: '',
  current_medications: '',
  allergies: ''
});

// Form Data with Defaults
const form = reactive<CreateConsultationPayload>({
  consultation_type: 'general',
  priority: 'normal',

  symptoms: '',
  medical_history: '',
  current_medications: '',
  allergies: '',
  consultation_notes: '',
  patient_name: '',
  patient_email: '',
  patient_phone: '',
  patient_date_of_birth: '',
  patient_gender: '',
  vitals: {
    blood_pressure_systolic: undefined,
    blood_pressure_diastolic: undefined,
    heart_rate: undefined,
    temperature: undefined,
    oxygen_saturation: undefined,
    respiratory_rate: undefined,
    weight: undefined,
    height: undefined
  },
  pharmacy_id: 1, // Hardcoded as requested
  source: 'web',
  user_id: 0
});

// Options
const consultationTypes = [
  { value: 'general', label: 'General Inquiry', icon: StarIcon, desc: 'General health questions' },
  { value: 'medication_review', label: 'Medication Review', icon: ShieldCheckIcon, desc: 'Review current meds' },
  { value: 'chronic_disease', label: 'Chronic Disease', icon: HeartIcon, desc: 'Sort term management' },
  { value: 'acute_illness', label: 'Acute Illness', icon: BoltIcon, desc: 'Flu, cold, etc.' },
];

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

const steps = [
  { number: 1, title: 'Triage', icon: ClockIcon },
  { number: 2, title: 'Patient', icon: UserIcon },
  { number: 3, title: 'Vitals', icon: HeartOutlineIcon },
  { number: 4, title: 'Clinical', icon: ClipboardDocumentListIcon },
  { number: 5, title: 'Review', icon: CheckCircleIcon },
];

// Navigation Logic
const nextStep = () => {
  if (currentStep.value === 4) { // Clinical Step Validation
    let isValid = true;
    
    // Reset errors
    Object.keys(formErrors).forEach(k => (formErrors as any)[k] = '');

    if (!form.symptoms) {
      formErrors.symptoms = 'Symptoms description is required';
      isValid = false;
    }
    if (!form.medical_history) {
      formErrors.medical_history = 'Medical history is required (or type "None")';
      isValid = false;
    }
    if (!form.current_medications) {
      formErrors.current_medications = 'Current medications is required (or type "None")';
      isValid = false;
    }
    if (!form.allergies) {
      formErrors.allergies = 'Allergies info is required (or type "None")';
      isValid = false;
    }

    if (!isValid) {
       error.value = 'Please fill in all required clinical context fields.';
       // Auto-clear error after 3 seconds
       setTimeout(() => error.value = '', 3000);
       return;
    }
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

    // Update profile if needed
    if (isProfileIncomplete.value) {
      await authService.updateUserDetails({
        dob: form.patient_date_of_birth,
        gender: form.patient_gender
      });
    }

    await consultationService.createConsultation(form);
    router.push('/consultations');
  } catch (err: any) {
    console.error(err);
    error.value = err.response?.data?.message || 'Failed to create consultation.';
  } finally {
    submitting.value = false;
  }
};



const stepsProgress = computed(() => {
  return ((currentStep.value - 1) / (steps.length - 1)) * 100;
});


// State to track if profile needs update
const isProfileIncomplete = ref(false);

onMounted(async () => {
  try {
    const user = await authService.getUserDetails();
    if (user) {
      form.patient_name = user.fullname || `${user.firstname || ''} ${user.lastname || ''}`.trim();
      form.patient_email = user.email || '';
      form.patient_phone = user.phone_number || '';
      form.patient_date_of_birth = user.dob || '';
      // @ts-ignore
      form.patient_gender = user.gender || '';
      form.user_id = user.id;

      // Check if profile is incomplete
      if (!user.dob || !user.gender) {
        isProfileIncomplete.value = true;
      }
    }
  } catch (err) {
    console.error('Failed to load user details:', err);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 px-4">
    <div class="max-w-5xl mx-auto">
      
      <!-- Stepper Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-6">New Consultation</h1>
        
        <div class="relative flex justify-between items-center mx-auto">
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
      <Card class="p-8 min-h-[400px] relative transition-all duration-500">
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
                  label="Date of Birth" 
                  type="date" 
                  v-model="form.patient_date_of_birth" 
                  :disabled="!isProfileIncomplete"
                  required 
                />
             </div>
            
            <div>
              <Dropdown 
                label="Gender" 
                :options="genderOptions"
                v-model="form.patient_gender"
                placeholder="Select Gender"
                :disabled="!isProfileIncomplete"
                required
              />
            </div>
          </div>

          <!-- STEP 3: VITALS -->
          <div v-else-if="currentStep === 3" key="step3" class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Vital Signs (Optional)</h2>
            <p class="text-sm text-gray-500 -mt-3 mb-6">Providing these helps the doctor assess your condition better.</p>

            <div v-if="form.vitals" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <!-- Blood Pressure -->
              <div class="md:col-span-2 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <div class="flex items-center gap-2 mb-3 text-red-700 dark:text-red-400 font-medium">
                  <HeartIcon class="w-5 h-5" /> Blood Pressure
                </div>
                <div class="flex gap-4">
                  <TextInput 
                    label="Systolic (mmHg)" 
                    type="number" 
                    v-model="form.vitals.blood_pressure_systolic" 
                    placeholder="120"
                  />
                  <TextInput 
                    label="Diastolic (mmHg)" 
                    type="number" 
                    v-model="form.vitals.blood_pressure_diastolic" 
                    placeholder="80"
                  />
                </div>
              </div>

              <!-- Heart Rate -->
              <div class="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                 <div class="flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-400 font-medium">
                  <ChartBarIcon class="w-5 h-5" /> Heart Rate
                </div>
                <TextInput 
                  label="BPM" 
                  type="number" 
                  v-model="form.vitals.heart_rate" 
                  placeholder="72"
                />
              </div>

              <!-- Temperature -->
              <div class="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30">
                 <div class="flex items-center gap-2 mb-3 text-orange-700 dark:text-orange-400 font-medium">
                  <BoltIcon class="w-5 h-5" /> Temperature
                </div>
                <TextInput 
                  label="Celsius (°C)" 
                  type="number" 
                  v-model="form.vitals.temperature" 
                  placeholder="36.5"
                  step="0.1"
                />
              </div>

              <!-- Oxygen Saturation -->
              <div class="p-4 bg-cyan-50 dark:bg-cyan-900/10 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                 <div class="flex items-center gap-2 mb-3 text-cyan-700 dark:text-cyan-400 font-medium">
                  <span class="font-bold text-lg">O₂</span> Oxygen Sat
                </div>
                <TextInput 
                  label="Percent (%)" 
                  type="number" 
                  v-model="form.vitals.oxygen_saturation" 
                  placeholder="98"
                />
              </div>

               <!-- Respiratory Rate -->
              <div class="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30">
                 <div class="flex items-center gap-2 mb-3 text-purple-700 dark:text-purple-400 font-medium">
                   <span class="font-bold text-lg">RR</span> Respiratory Rate
                </div>
                <TextInput 
                  label="Breaths/min" 
                  type="number" 
                  v-model="form.vitals.respiratory_rate" 
                  placeholder="16"
                />
              </div>

               <!-- Weight -->
              <div class="p-4 bg-gray-100 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700">
                 <div class="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-400 font-medium">
                   Weight
                </div>
                <TextInput 
                  label="kg" 
                  type="number" 
                  v-model="form.vitals.weight" 
                  placeholder="70"
                  step="0.1"
                />
              </div>

               <!-- Height -->
              <div class="p-4 bg-gray-100 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700">
                 <div class="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-400 font-medium">
                   Height
                </div>
                <TextInput 
                  label="cm" 
                  type="number" 
                  v-model="form.vitals.height" 
                  placeholder="175"
                />
              </div>

            </div>
          </div>

          <!-- STEP 4: CLINICAL -->
          <div v-else-if="currentStep === 4" key="step4" class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Clinical Context</h2>
            

            
            <TextInput 
              type="textarea" 
              label="Symptoms" 
              v-model="form.symptoms" 
              placeholder="Describe what you are feeling..." 
              :rows="3" 
              required
              :error="formErrors.symptoms"
            />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput 
                type="textarea" 
                label="Medical History" 
                v-model="form.medical_history" 
                placeholder="Past conditions... (or 'None')" 
                :rows="2" 
                required
                :error="formErrors.medical_history"
              />
              <TextInput 
                type="textarea" 
                label="Current Medications" 
                v-model="form.current_medications" 
                placeholder="Meds you are taking... (or 'None')" 
                :rows="2" 
                required
                :error="formErrors.current_medications"
              />
              <TextInput 
                type="textarea" 
                label="Allergies" 
                v-model="form.allergies" 
                placeholder="Any known allergies... (or 'None')" 
                :rows="2"
                class="md:col-span-2" 
                required
                :error="formErrors.allergies"
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



          <!-- STEP 5: REVIEW -->
          <div v-else-if="currentStep === 5" key="step5" class="space-y-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">Review Summary</h2>
            
            <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
               <!-- Decorative Header -->
               <div class="h-2 w-full bg-gradient-to-r from-blue-500 to-[#246BFD]"></div>
               
               <div class="p-8">
                 <div class="flex justify-between items-start mb-6 pb-6 border-b border-gray-100 dark:border-gray-700 border-dashed">
                    <div>

                      <h3 class="text-xl font-bold text-gray-900 dark:text-white capitalize">{{ form.consultation_type.replace(/_/g, ' ') }}</h3>
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

                  <div v-if="form.vitals && Object.values(form.vitals).some(v => v)" class="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700 border-dashed">
                      <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Vitals</p>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div v-if="form.vitals.blood_pressure_systolic">
                          <p class="text-xs text-gray-400">BP</p>
                          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ form.vitals.blood_pressure_systolic }}/{{ form.vitals.blood_pressure_diastolic }} mmHg</p>
                        </div>
                        <div v-if="form.vitals.heart_rate">
                          <p class="text-xs text-gray-400">Heart Rate</p>
                          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ form.vitals.heart_rate }} BPM</p>
                        </div>
                        <div v-if="form.vitals.temperature">
                          <p class="text-xs text-gray-400">Temp</p>
                          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ form.vitals.temperature }} °C</p>
                        </div>
                        <div v-if="form.vitals.oxygen_saturation">
                          <p class="text-xs text-gray-400">O₂ Sat</p>
                          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ form.vitals.oxygen_saturation }}%</p>
                        </div>
                         <div v-if="form.vitals.weight">
                          <p class="text-xs text-gray-400">Weight</p>
                          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ form.vitals.weight }} kg</p>
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


                 </div>
               </div>
            </div>

            <!-- Floating Error Toast -->
            <Transition name="toast">
              <div v-if="error" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium animate-bounce-short">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                {{ error }}
              </div>
            </Transition>
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

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
