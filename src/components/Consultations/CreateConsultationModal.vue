<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/store/auth';
import { consultationService } from '@/services/consultationService';
import type { ConsultationType, ConsultationPriority, CreateConsultationPayload } from '@/types/consultation';
import Button from '@/components/Button.vue';
import TextInput from '@/components/TextInput.vue';
import Textarea from '@/components/Textarea.vue';
import Dropdown from '@/components/Dropdown.vue';
import Alert from '@/components/Alert.vue';
import { 
  ChatBubbleLeftRightIcon, 
  BeakerIcon, 
  HeartIcon, 
  ShieldCheckIcon,
  SparklesIcon,
  UserPlusIcon,
  PaperClipIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close', 'created']);
const authStore = useAuthStore();

const loading = ref(false);
const error = ref('');

// Updated interface matching backend requirements
interface ConsultationForm {
  consultation_type: ConsultationType;
  subject: string;
  symptoms: string;
  medical_history: string;
  current_medications: string;
  allergies: string;
  consultation_notes: string;
  priority: ConsultationPriority;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_date_of_birth: string;
  patient_gender: 'male' | 'female' | ''; 
  pharmacy_id: number;
  // pharmacy_branch_id set to 1 by default logic or backend? user prompt says pharmacy_id maintains 1.
  // We'll keep pharmacy_branch_id if needed, or remove if unused. Keeping clean for now.
  scheduled_at: string;
  source: string;
  attachments: File[];
  user_id: number;
}

const form = reactive<ConsultationForm>({
  consultation_type: 'general',
  subject: '',
  symptoms: '',
  medical_history: '',
  current_medications: '',
  allergies: '',
  consultation_notes: '',
  priority: 'normal',
  patient_name: authStore.user?.firstname ? `${authStore.user.firstname} ${authStore.user.lastname}` : '',
  patient_email: authStore.user?.email || '',
  patient_phone: authStore.user?.phone_number || '',
  patient_date_of_birth: '',
  patient_gender: '', 
  pharmacy_id: 1, // Requirement: pharmacy_id should maintain 1
  scheduled_at: '',
  source: 'web',
  attachments: [],
  user_id: authStore.user?.id || 0 // Requirement: user_id should be current user's id
});

const consultationTypeOptions = [
  { label: 'General', value: 'general', icon: ChatBubbleLeftRightIcon, desc: 'General health inquiries' },
  { label: 'Med Review', value: 'medication_review', icon: BeakerIcon, desc: 'Review current meds' },
  { label: 'Chronic Care', value: 'chronic_disease', icon: HeartIcon, desc: 'Long-term condition' },
  { label: 'Acute Illness', value: 'acute_illness', icon: ShieldCheckIcon, desc: 'Sudden sickness' },
  { label: 'Wellness', value: 'wellness', icon: SparklesIcon, desc: 'Checkups & health' },
  { label: 'Vaccination', value: 'vaccination', icon: UserPlusIcon, desc: 'Vaccine scheduling' }
] as const;

const priorityOptions = [
  { label: 'Low', value: 'low', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  { label: 'Normal', value: 'normal', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { label: 'High', value: 'high', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  { label: 'Urgent', value: 'urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' }
];

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' }
];

const fileInput = ref<HTMLInputElement | null>(null);

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const newFiles = Array.from(target.files);
    
    // Validate each file
    const validFiles = newFiles.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isValidType) {
        error.value = `File ${file.name} is not a supported type.`;
        return false;
      }
      if (!isValidSize) {
        error.value = `File ${file.name} exceeds 5MB limit.`;
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      form.attachments.push(...validFiles);
      error.value = ''; // Clear error if successful
    }
  }
  // Reset input so same file can be selected again if needed (though not strictly necessary here)
  if (target) target.value = '';
};

const removeFile = (index: number) => {
  form.attachments.splice(index, 1);
};

const validateForm = (): boolean => {
  if (!form.subject || form.subject.length > 255) {
    error.value = 'Subject is required and must be less than 255 characters.';
    return false;
  }
  
  if (form.scheduled_at) {
    const scheduledDate = new Date(form.scheduled_at);
    const now = new Date();
    if (scheduledDate <= now) {
      error.value = 'Scheduled date must be in the future.';
      return false;
    }
  }

  // user_id check
  if (!form.user_id) {
    // Attempt to recover user_id if authStore loaded late
    form.user_id = authStore.user?.id || 0;
    if (!form.user_id) {
       error.value = 'User authentication invalid. Please reload.';
       return false;
    }
  }

  return true;
};

const submit = async () => {
  error.value = '';
  if (!validateForm()) return;

  try {
    loading.value = true;
    
    // Prepare payload
    const payload: CreateConsultationPayload = {
      ...form,
      // Ensure specific fields are correctly typed/formatted if needed
      user_id: form.user_id,
      pharmacy_id: form.pharmacy_id,
      patient_gender: form.patient_gender as 'male' | 'female' | undefined, // handle empty string case
    };

    // Remove empty strings for optional fields to keep payload clean (optional but good practice)
    if (!payload.patient_gender) delete payload.patient_gender;
    if (!payload.scheduled_at) delete payload.scheduled_at;

    await consultationService.createConsultation(payload);
    emit('created');
    emit('close');
  } catch (err: any) {
    console.error('Submission error:', err);
    if (err.response?.data?.errors) {
      // Format validation errors into a list
      const errorMessages = Object.values(err.response.data.errors).flat();
      error.value = errorMessages.join('\n');
    } else {
      error.value = err.response?.data?.message || 'Failed to create consultation';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="$emit('close')"
      >
        <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-0" @click.stop>
          
          <!-- Sticky Header -->
          <div class="sticky top-0 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700 rounded-t-3xl">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">
              New Consultation
            </h2>
            <button
              @click="$emit('close')"
              class="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
              
          <div class="p-6 space-y-8">
            <Alert v-if="error" type="error" :message="error" />

            <!-- STEP 1: TRIAGE -->
            <section class="space-y-4">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                1. Triage & Priority
              </label>
              
              <!-- Visual Type Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div
                  v-for="type in consultationTypeOptions"
                  :key="type.value"
                  @click="form.consultation_type = type.value"
                  :class="[
                    'cursor-pointer rounded-xl p-3 border transition-all duration-200 flex flex-col items-center text-center gap-2 group hover:border-[#246BFD] dark:hover:border-[#246BFD]',
                    form.consultation_type === type.value
                      ? 'bg-[#246BFD]/5 border-[#246BFD] ring-1 ring-[#246BFD]'
                      : 'bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                  ]"
                >
                  <component 
                    :is="type.icon" 
                    :class="[
                      'w-6 h-6 transition-colors',
                      form.consultation_type === type.value ? 'text-[#246BFD]' : 'text-gray-500 dark:text-gray-400 group-hover:text-[#246BFD]'
                    ]"
                  />
                  <div class="space-y-0.5">
                    <div class="text-xs font-semibold text-gray-900 dark:text-white">{{ type.label }}</div>
                    <div class="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{{ type.desc }}</div>
                  </div>
                </div>
              </div>

              <!-- Priority Pills -->
              <div class="flex flex-wrap gap-2 pt-2">
                <button
                  v-for="p in priorityOptions"
                  :key="p.value"
                  type="button"
                  @click="form.priority = p.value as ConsultationPriority"
                  :class="[
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-transparent',
                    form.priority === p.value
                      ? `ring-2 ring-offset-2 dark:ring-offset-gray-800 ${p.color} ring-current`
                      : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  ]"
                >
                  {{ p.label }}
                </button>
              </div>
            </section>

            <hr class="border-gray-100 dark:border-gray-700" />

            <!-- STEP 2: PATIENT INFO -->
            <section class="space-y-4">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                2. Patient Profile
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput label="Full Name" v-model="form.patient_name" required placeholder="John Doe" />
                <Dropdown label="Gender" v-model="form.patient_gender" :options="genderOptions" placeholder="Select Gender" />
                <TextInput label="Date of Birth" type="date" v-model="form.patient_date_of_birth" />
                <TextInput label="Phone Number" v-model="form.patient_phone" required placeholder="+123..." />
                <TextInput label="Email Address" type="email" v-model="form.patient_email" class="md:col-span-2" placeholder="email@example.com" />
              </div>
            </section>

            <hr class="border-gray-100 dark:border-gray-700" />

            <!-- STEP 3: CLINICAL DETAILS -->
            <section class="space-y-4">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                3. Clinical Details
              </label>
              
              <TextInput 
                label="Subject / Chief Complaint" 
                v-model="form.subject" 
                placeholder="E.g., Severe migraine since yesterday"
                required 
              />
              
              <div class="grid grid-cols-1 gap-4">
                <Textarea label="Symptoms" v-model="form.symptoms" placeholder="Describe symptoms in detail..." :rows="3" />
                <Textarea label="Medical History" v-model="form.medical_history" placeholder="Previous conditions, surgeries..." :rows="2" />
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textarea label="Current Medications" v-model="form.current_medications" placeholder="List active prescriptions" :rows="2" />
                  <Textarea label="Allergies" v-model="form.allergies" placeholder="Known drug/food allergies" :rows="2" />
                </div>
                <!-- New Notes Field -->
                <Textarea label="Consultation Notes" v-model="form.consultation_notes" placeholder="Any additional notes..." :rows="2" />
              </div>
            </section>

            <hr class="border-gray-100 dark:border-gray-700" />

            <!-- STEP 4: ADDITIONAL INFO -->
            <section class="space-y-4">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                4. Review & Schedule
              </label>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Scheduled At -->
                <TextInput 
                  label="Schedule (Optional)" 
                  type="datetime-local" 
                  v-model="form.scheduled_at" 
                  hint="Leave blank for immediate request"
                />

                <!-- Attachments -->
                <div class="space-y-1">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                   Attachments (Max 5MB)
                  </label>
                  
                  <!-- File Input / Drop area -->
                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      @click="fileInput?.click()"
                      class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#246BFD] transition-colors flex items-center gap-2"
                    >
                      <PaperClipIcon class="w-4 h-4" />
                      Attach Files
                    </button>
                    <input
                      ref="fileInput"
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/jpg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      class="hidden"
                      @change="handleFileSelect"
                    />
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ form.attachments.length }} files selected
                    </span>
                  </div>

                  <!-- File List -->
                  <div v-if="form.attachments.length > 0" class="mt-3 space-y-2">
                    <div 
                      v-for="(file, index) in form.attachments" 
                      :key="index"
                      class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm border border-gray-100 dark:border-gray-700"
                    >
                      <div class="flex items-center gap-2 overflow-hidden">
                        <PaperClipIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span class="truncate text-gray-700 dark:text-gray-200">{{ file.name }}</span>
                        <span class="text-xs text-gray-500">({{ (file.size / 1024 / 1024).toFixed(2) }} MB)</span>
                      </div>
                      <button 
                        @click="removeFile(index)"
                        class="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 rounded transition-colors"
                      >
                        <XMarkIcon class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Footer Actions -->
          <div class="bg-gray-50 dark:bg-gray-900/50 backdrop-blur px-6 py-4 flex justify-end gap-3 rounded-b-3xl border-t border-gray-100 dark:border-gray-700">
            <Button
              variant="secondary"
              @click="$emit('close')"
              class="dark:bg-transparent dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              :loading="loading"
              @click="submit"
              class="min-w-[140px]"
            >
              Submit Request
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95) translateY(10px);
}
</style>
