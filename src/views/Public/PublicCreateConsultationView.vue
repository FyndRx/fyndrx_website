<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { consultationService } from '@/services/consultationService';
import type { CreateConsultationPayload, ConsultationType } from '@/types/consultation';
import Button from '@/components/Button.vue';
import TextInput from '@/components/TextInput.vue';
import DateTimePicker from '@/components/DateTimePicker.vue';
import Card from '@/components/Card.vue';
import { ExclamationCircleIcon } from '@heroicons/vue/24/outline';
import { StarIcon, BoltIcon } from '@heroicons/vue/24/solid';

const router = useRouter();
const submitting = ref(false);
const error = ref('');

// Simplified form for public (single step or fewer steps)
// Let's do a single page form for public to reduce friction

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
  pharmacy_id: 1, // Default
  source: 'web_public',
  user_id: 0 // No user
});

const consultationTypes = [
  { value: 'general', label: 'General Inquiry', icon: StarIcon },
  { value: 'acute_illness', label: 'Acute Illness', icon: BoltIcon },
];

const submit = async () => {
    try {
        submitting.value = true;
        error.value = '';

        // Basic Validation
        if (!form.patient_name || !form.patient_phone || !form.symptoms) {
            error.value = 'Please fill in all required fields.';
            submitting.value = false;
            return;
        }

        const response = await consultationService.createPublicConsultation(form);
        
        // Redirect to success or search page with the new ID/Number
        // Assuming response contains the created consultation
        // We might want to show a success modal first
        
        router.push({ 
            name: 'public-consultation-search', 
            query: { 
                created: 'true', 
                number: (response as any).consultation_number 
            } 
        });

    } catch (err: any) {
        console.error(err);
        error.value = err.response?.data?.message || 'Failed to create consultation.';
    } finally {
        submitting.value = false;
    }
};
</script>

<template>
    <div class="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto">
            <div class="text-center mb-10">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Start a Consultation</h1>
                <p class="mt-2 text-gray-600 dark:text-gray-400">
                    Get professional medical advice without an account.
                </p>
                <!-- Guest Mode Banner -->
                <div class="mt-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 max-w-2xl mx-auto flex items-start gap-4 text-left">
                     <div class="p-2 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-300 flex-shrink-0">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     </div>
                     <div>
                        <h4 class="font-semibold text-blue-900 dark:text-blue-100 text-sm">Create an account for a better experience</h4>
                        <p class="text-sm text-blue-800 dark:text-blue-300 mt-1">
                            Logged-in users can track consultation history, manage prescriptions, and save details for faster checkout.
                        </p>
                        <div class="mt-3 flex gap-4">
                            <router-link to="/login" class="text-sm font-bold text-[#246BFD] hover:underline">Login</router-link>
                            <router-link to="/register" class="text-sm font-bold text-[#246BFD] hover:underline">Sign Up</router-link>
                        </div>
                     </div>
                </div>
            </div>

            <Card class="p-8">
                <form @submit.prevent="submit" class="space-y-8">
                    
                    <!-- Section 1: Type & Symptoms -->
                    <div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">What can we help you with?</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div 
                                v-for="type in consultationTypes" 
                                :key="type.value"
                                @click="form.consultation_type = type.value as ConsultationType"
                                class="p-4 border rounded-xl cursor-pointer transition-all flex items-center gap-3"
                                :class="form.consultation_type === type.value ? 'border-[#246BFD] bg-blue-50 dark:bg-blue-900/20 ring-1 ring-[#246BFD]' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'"
                            >
                                <component :is="type.icon" class="w-5 h-5 text-[#246BFD]" />
                                <span class="font-medium text-gray-900 dark:text-white">{{ type.label }}</span>
                            </div>
                        </div>

                        <TextInput 
                            label="Symptoms / Reason for Visit" 
                            v-model="form.symptoms" 
                            type="textarea" 
                            :rows="3" 
                            required 
                            placeholder="Describe your symptoms..." 
                        />
                    </div>

                    <!-- Section 2: Patient Info -->
                    <div>
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Patient Information</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextInput 
                                label="Full Name" 
                                v-model="form.patient_name" 
                                required 
                                placeholder="Patient's Name" 
                            />
                            <TextInput 
                                label="Phone Number" 
                                v-model="form.patient_phone" 
                                required 
                                placeholder="Active phone number" 
                            />
                             <TextInput 
                                label="Email Address" 
                                v-model="form.patient_email" 
                                placeholder="Optional" 
                            />
                                <DateTimePicker 
                                    label="Date of Birth"
                                    format="date"
                                    :model-value="form.patient_date_of_birth || ''"
                                    @update:model-value="(val: string) => form.patient_date_of_birth = val"
                                    :max-date="new Date().toISOString()"
                                    required
                                />
                        </div>
                    </div>

                    <!-- Error & Submit -->
                    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
                        <ExclamationCircleIcon class="w-5 h-5" />
                        {{ error }}
                    </div>

                    <div class="pt-4">
                        <Button 
                            type="submit" 
                            variant="primary" 
                            block 
                            :loading="submitting"
                        >
                            Request Consultation
                        </Button>
                        <p class="text-xs text-center text-gray-500 mt-4">
                            By submitting, you agree to our Terms of Service. Your data is processed securely and is only available to our clinical staff.
                        </p>
                    </div>

                </form>
            </Card>
        </div>
    </div>
</template>
