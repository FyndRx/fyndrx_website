<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { consultationService } from '@/services/consultationService';
import type { ConsultationType, PatientConsultationIntake } from '@/types/consultation';
import Button from '@/components/Button.vue';
import TextInput from '@/components/TextInput.vue';
import Alert from '@/components/Alert.vue';
import { ChatBubbleLeftRightIcon, BeakerIcon, HeartIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  isOpen: boolean;
  parentConsultationId?: string;
  parentConsultationNumber?: string;
}>();
const emit = defineEmits(['close', 'created']);
const authStore = useAuthStore();

const loading = ref(false);
const error = ref('');

const isFollowUp = computed(() => !!props.parentConsultationId);

const form = reactive<PatientConsultationIntake>({
  consultation_type: 'general',
  chief_complaint: '',
  consultation_notes: '',
  patient_name: authStore.user?.firstname
    ? `${authStore.user.firstname} ${authStore.user.lastname || ''}`.trim()
    : '',
  patient_email: authStore.user?.email || '',
  patient_phone: authStore.user?.phone_number || '',
  pharmacy_id: undefined,
  source: 'web',
  user_id: authStore.user?.id || undefined,
});

const consultationTypeOptions = [
  { label: 'General', value: 'general', icon: ChatBubbleLeftRightIcon },
  { label: 'Med review', value: 'medication_review', icon: BeakerIcon },
  { label: 'Chronic care', value: 'chronic_disease', icon: HeartIcon },
  { label: 'Acute illness', value: 'acute_illness', icon: ShieldCheckIcon },
] as const;

const submit = async () => {
  error.value = '';
  if (form.chief_complaint.trim().length < 10) {
    error.value = 'Please describe your concern (at least 10 characters).';
    return;
  }
  if (!form.user_id) {
    form.user_id = authStore.user?.id || undefined;
    if (!form.user_id) {
      error.value = 'Please sign in again.';
      return;
    }
  }
  try {
    loading.value = true;
    const payload: PatientConsultationIntake = { ...form };
    if (props.parentConsultationId) {
      payload.parent_consultation_id = props.parentConsultationId;
    }
    await consultationService.createConsultation(payload);
    emit('created');
    emit('close');
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
    if (e.response?.data?.errors) {
      error.value = Object.values(e.response.data.errors).flat().join(' ');
    } else {
      error.value = e.response?.data?.message || 'Failed to book consultation';
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
        <div
          class="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6"
          @click.stop
        >
          <!-- Follow-up context banner -->
          <div v-if="isFollowUp" class="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/40 rounded-xl px-4 py-3 mb-5">
            <div class="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-300 shrink-0">
              <ArrowPathIcon class="w-4 h-4" />
            </div>
            <div>
              <p class="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Follow-up Consultation</p>
              <p class="text-sm text-purple-600 dark:text-purple-400">
                Linked to <span class="font-mono font-bold">#{{ parentConsultationNumber }}</span>
              </p>
            </div>
          </div>

          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {{ isFollowUp ? 'Book a follow-up' : 'Quick consultation request' }}
          </h2>
          <p class="text-sm text-gray-500 mb-4">Vitals and clinical assessment are completed by our pharmacy team.</p>

          <Alert v-if="error" type="error" :message="error" class="mb-4" />

          <form @submit.prevent="submit" class="space-y-4">
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="type in consultationTypeOptions"
                :key="type.value"
                type="button"
                class="p-2 border rounded-lg text-xs font-medium flex items-center gap-2"
                :class="
                  form.consultation_type === type.value
                    ? 'border-[#246BFD] bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                "
                @click="form.consultation_type = type.value as ConsultationType"
              >
                <component :is="type.icon" class="w-4 h-4" />
                {{ type.label }}
              </button>
            </div>

            <TextInput
              v-model="form.chief_complaint"
              type="textarea"
              :label="isFollowUp ? 'What has changed since your last visit?' : 'Why do you need help?'"
              :rows="3"
              required
              :placeholder="isFollowUp ? 'Describe your current symptoms or update...' : 'Describe your concern...'"
            />

            <div class="flex gap-3 pt-2">
              <Button type="button" variant="secondary" class="flex-1" @click="$emit('close')">Cancel</Button>
              <Button type="submit" variant="primary" class="flex-1" :loading="loading">
                {{ isFollowUp ? 'Submit Follow-up' : 'Submit' }}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
