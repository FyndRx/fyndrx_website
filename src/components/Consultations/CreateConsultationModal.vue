<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/store/auth';
import { consultationService } from '@/services/consultationService';
import type { CreateConsultationPayload, ConsultationType, ConsultationPriority } from '@/types/consultation';
import Button from '@/components/Button.vue';
import TextInput from '@/components/TextInput.vue';
import Textarea from '@/components/Textarea.vue';
import Dropdown from '@/components/Dropdown.vue';
import Alert from '@/components/Alert.vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close', 'created']);
const authStore = useAuthStore();

const loading = ref(false);
const error = ref('');

// Local interface for form state to ensure v-model compatibility
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
  pharmacy_id: number;
  source: string;
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
  pharmacy_id: 1,
  source: 'web'
});

const consultationTypes: { label: string; value: ConsultationType }[] = [
  { label: 'General Consultation', value: 'general' },
  { label: 'Medication Review', value: 'medication_review' },
  { label: 'Chronic Disease Management', value: 'chronic_disease' },
  { label: 'Acute Illness', value: 'acute_illness' },
  { label: 'Wellness Check', value: 'wellness' },
  { label: 'Vaccination', value: 'vaccination' }
];

const priorities: { label: string; value: ConsultationPriority }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' }
];

const submit = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const payload: CreateConsultationPayload = {
      ...form,
      // Optional fields can remain as empty strings or be undefined
      // The API likely handles empty strings, but strict typing might require matching the interface exactly
      // If CreateConsultationPayload has optional fields, passing string is fine as string | undefined includes string
    };

    await consultationService.createConsultation(payload);
    emit('created');
    emit('close');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to create consultation';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="$emit('close')"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                New Consultation
              </h3>
              
              <div class="mt-4 space-y-4">
                <Alert v-if="error" type="error" :message="error" class="mb-4" />

                <div class="grid grid-cols-2 gap-4">
                  <Dropdown
                    label="Type"
                    :model-value="form.consultation_type"
                    @update:model-value="(val) => form.consultation_type = val as ConsultationType"
                    :options="consultationTypes"
                  />
                  <Dropdown
                    label="Priority"
                    :model-value="form.priority"
                    @update:model-value="(val) => form.priority = val as ConsultationPriority"
                    :options="priorities"
                  />
                </div>

                <TextInput
                  label="Subject"
                  v-model="form.subject"
                  placeholder="Briefly describe the issue"
                  required
                />

                <Textarea
                  label="Symptoms"
                  v-model="form.symptoms"
                  placeholder="Describe your symptoms..."
                  :rows="3"
                />

                <Textarea
                  label="Current Medications"
                  v-model="form.current_medications"
                  placeholder="List any medications you are currently taking"
                  :rows="2"
                />

                <div class="grid grid-cols-2 gap-4">
                  <TextInput
                    label="Patient Name"
                    v-model="form.patient_name"
                    required
                  />
                  <TextInput
                    label="Phone Number"
                    v-model="form.patient_phone"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <Button
            variant="primary"
            :loading="loading"
            @click="submit"
            class="w-full sm:w-auto sm:ml-3"
          >
            Create Consultation
          </Button>
          <Button
            variant="secondary"
            @click="$emit('close')"
            class="mt-3 w-full sm:w-auto sm:mt-0"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
