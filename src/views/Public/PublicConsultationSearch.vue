<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { consultationService } from '@/services/consultationService';
import TextInput from '@/components/TextInput.vue';
import Button from '@/components/Button.vue';
import Card from '@/components/Card.vue';
import { MagnifyingGlassIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/vue/24/outline';

const route = useRoute();
const router = useRouter();

const consultationNumber = ref((route.query.consultation_number as string) || (route.query.number as string) || '');
const contactInfo = ref('');
const loading = ref(false);
const error = ref('');

// Show a success banner when redirected from create flow
const justCreated = route.query.created === 'true';
if (justCreated && route.query.number) {
  consultationNumber.value = route.query.number as string;
}

const search = async () => {
  if (!consultationNumber.value || !contactInfo.value) {
    error.value = 'Please provide both your consultation number and contact info.';
    return;
  }

  try {
    loading.value = true;
    error.value = '';

    const params: any = { consultation_number: consultationNumber.value };
    if (contactInfo.value.includes('@')) {
      params.patient_email = contactInfo.value;
    } else {
      params.patient_phone = contactInfo.value;
    }

    // Validate that the consultation exists before navigating
    await consultationService.searchPublicConsultation(params);

    const isEmail = contactInfo.value.includes('@');
    router.push({
      name: 'public-consultation-result',
      query: {
        n: consultationNumber.value,
        c: contactInfo.value,
        t: isEmail ? 'email' : 'phone',
      },
    });
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Consultation not found. Please check your details and try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex-grow flex items-center justify-center p-4 py-12">
    <div class="w-full max-w-md space-y-6">

      <!-- Created success banner -->
      <div v-if="justCreated" class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl px-5 py-4 flex items-start gap-3">
        <CheckCircleIcon class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Consultation submitted!</p>
          <p class="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Your number is <span class="font-mono font-bold">{{ consultationNumber }}</span>. Enter your email or phone below to view it.</p>
        </div>
      </div>

      <div class="text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#246BFD]/10 dark:bg-[#246BFD]/20 mb-4">
          <MagnifyingGlassIcon class="w-7 h-7 text-[#246BFD]" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Track Consultation</h2>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Enter your consultation number and the email or phone you used when booking.
        </p>
      </div>

      <Card class="p-6">
        <form @submit.prevent="search" class="space-y-5">
          <TextInput
            label="Consultation Number"
            v-model="consultationNumber"
            placeholder="e.g. CONS-2026-XXXX"
            required
          />
          <TextInput
            label="Email or Phone"
            v-model="contactInfo"
            placeholder="Email address or phone number"
            required
          />

          <div v-if="error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm flex items-start gap-2 border border-red-100 dark:border-red-900/30">
            <ExclamationCircleIcon class="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{{ error }}</span>
          </div>

          <Button type="submit" variant="primary" block :loading="loading">
            <template #default>
              <span class="flex items-center justify-center gap-2">
                <MagnifyingGlassIcon class="w-4 h-4" />
                Find my consultation
              </span>
            </template>
          </Button>
        </form>
      </Card>

      <p class="text-xs text-center text-gray-400 dark:text-gray-500">
        Don't have a consultation yet?
        <router-link :to="{ name: 'public-create-consultation' }" class="text-[#246BFD] hover:underline font-medium">Request one here</router-link>
      </p>
    </div>
  </div>
</template>
