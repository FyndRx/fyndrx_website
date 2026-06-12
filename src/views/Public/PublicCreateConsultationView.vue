<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { consultationService } from '@/services/consultationService';
import type { ConsultationType, PatientConsultationIntake } from '@/types/consultation';
import Button from '@/components/Button.vue';
import TextInput from '@/components/TextInput.vue';
import DateTimePicker from '@/components/DateTimePicker.vue';
import Card from '@/components/Card.vue';
import { ExclamationCircleIcon } from '@heroicons/vue/24/outline';
import { StarIcon, BoltIcon } from '@heroicons/vue/24/solid';

const router = useRouter();
const submitting = ref(false);
const error = ref('');

const form = reactive<PatientConsultationIntake>({
  consultation_type: 'general',
  chief_complaint: '',
  patient_name: '',
  patient_email: '',
  patient_phone: '',
  patient_date_of_birth: '',
  patient_gender: '',
  pharmacy_id: undefined,
  source: 'web',
});

const consultationTypes = [
  { value: 'general', label: 'General advice', icon: StarIcon },
  { value: 'acute_illness', label: 'Feeling unwell', icon: BoltIcon },
];

const submit = async () => {
  try {
    submitting.value = true;
    error.value = '';

    if (!form.patient_name?.trim() || !form.patient_phone?.trim() || !form.patient_email?.trim()) {
      error.value = 'Please enter your name, phone, and email.';
      return;
    }
    if (form.chief_complaint.trim().length < 10) {
      error.value = 'Please describe why you need a consultation (at least 10 characters).';
      return;
    }

    const response = await consultationService.createPublicConsultation(form);

    router.push({
      name: 'public-consultation-search',
      query: {
        created: 'true',
        number: (response as { consultation_number?: string }).consultation_number,
      },
    });
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } };
    error.value = e.response?.data?.message || 'Failed to submit. Please try again.';
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="flex-grow py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-10">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Request a consultation</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          No account needed. A pharmacist will contact you after reviewing your request.
        </p>
      </div>

      <div class="mb-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
        Clinical measurements (blood pressure, temperature, etc.) are taken by our staff — you only need to describe your concern below.
      </div>

      <Card class="p-8">
        <form @submit.prevent="submit" class="space-y-8">
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">How can we help?</h3>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <button
                v-for="type in consultationTypes"
                :key="type.value"
                type="button"
                class="p-3 border rounded-xl flex items-center gap-2 text-left transition-all"
                :class="
                  form.consultation_type === type.value
                    ? 'border-[#246BFD] bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                "
                @click="form.consultation_type = type.value as ConsultationType"
              >
                <component :is="type.icon" class="w-5 h-5 text-[#246BFD]" />
                <span class="font-medium text-sm">{{ type.label }}</span>
              </button>
            </div>

            <TextInput
              label="Describe your concern"
              v-model="form.chief_complaint"
              type="textarea"
              :rows="4"
              required
              placeholder="In your own words — what symptoms or questions do you have?"
            />
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Your contact details</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput label="Full name" v-model="form.patient_name" required />
              <TextInput label="Phone" v-model="form.patient_phone" required />
              <TextInput label="Email" v-model="form.patient_email" required class="md:col-span-2" />
              <DateTimePicker
                label="Date of birth (optional)"
                format="date"
                :model-value="form.patient_date_of_birth || ''"
                @update:model-value="(val: string) => (form.patient_date_of_birth = val)"
                :max-date="new Date().toISOString()"
              />
              <div>
                <p class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender (optional)</p>
                <div class="flex gap-3">
                  <button
                    v-for="g in ['Male', 'Female']"
                    :key="g"
                    type="button"
                    @click="form.patient_gender = form.patient_gender === g.toLowerCase() ? '' : g.toLowerCase()"
                    :class="[
                      'flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                      form.patient_gender === g.toLowerCase()
                        ? 'border-[#246BFD] bg-blue-50 dark:bg-blue-900/20 text-[#246BFD] dark:text-[#5089FF]'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                    ]"
                  >{{ g }}</button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="error" class="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-xl flex gap-2 text-sm">
            <ExclamationCircleIcon class="w-5 h-5 shrink-0" />
            {{ error }}
          </div>

          <Button type="submit" variant="primary" block :loading="submitting">
            Submit request
          </Button>
          <p class="text-xs text-center text-gray-500">
            By submitting, you agree that a licensed pharmacist will review your request. This is not emergency care.
          </p>
        </form>
      </Card>
    </div>
  </div>
</template>
