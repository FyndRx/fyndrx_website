<script setup lang="ts">
import { ref } from 'vue';
import { consultationService } from '@/services/consultationService';
import type { PublicConsultationSearchResponse } from '@/types/consultation';
import TextInput from '@/components/TextInput.vue';
import Button from '@/components/Button.vue';
import Card from '@/components/Card.vue';
import { MagnifyingGlassIcon, ExclamationCircleIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/vue/24/outline';
import { useRoute } from 'vue-router';

const route = useRoute();
const consultationNumber = ref((route.query.consultation_number as string) || (route.query.number as string) || '');
const contactInfo = ref('');

const searchResult = ref<PublicConsultationSearchResponse | null>(null);
const loading = ref(false);
const error = ref('');

const search = async () => {
    if (!consultationNumber.value || !contactInfo.value) {
        error.value = 'Please provide both consultation number and contact info.';
        return;
    }

    try {
        loading.value = true;
        error.value = '';
        searchResult.value = null;

        const params: any = {
            consultation_number: consultationNumber.value
        };
        
        // Simple heuristic for input type, or explicit choice
        // If user typed email format:
        if (contactInfo.value.includes('@')) {
             params.patient_email = contactInfo.value;
        } else {
             params.patient_phone = contactInfo.value;
        }

        const response = await consultationService.searchPublicConsultation(params);
        searchResult.value = response;
    } catch (err: any) {
        console.error(err);
        error.value = err.response?.data?.message || 'Consultation not found or details mismatch.';
    } finally {
        loading.value = false;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
        case 'completed': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
        case 'cancelled': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
        default: return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'pending': return ClockIcon;
        case 'completed': return CheckCircleIcon;
        case 'cancelled': return XCircleIcon;
        default: return ExclamationCircleIcon;
    }
};
</script>

<template>
    <div class="flex-grow flex items-center justify-center p-4">
        <div class="w-full max-w-md space-y-8">
            <div class="text-center">
                <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">Track Consultation</h2>
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Enter your consultation number and patient details to check status.
                </p>
            </div>

            <Card class="p-6">
                <form @submit.prevent="search" class="space-y-6">
                    <TextInput 
                        label="Consultation Number" 
                        v-model="consultationNumber" 
                        placeholder="e.g. CONS-2026-XXXX" 
                        required
                    />
                    
                    <TextInput 
                        label="Patient Phone or Email" 
                        v-model="contactInfo" 
                        placeholder="Enter phone or email used" 
                        required
                        type="text"
                    />

                    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
                        <ExclamationCircleIcon class="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{{ error }}</span>
                    </div>

                    <Button type="submit" variant="primary" block :loading="loading" class="flex justify-center items-center">
                        <MagnifyingGlassIcon class="w-5 h-5 mr-2" />
                        Track Status
                    </Button>
                </form>
            </Card>

            <!-- Result Card -->
            <Transition name="fade">
                <Card v-if="searchResult" class="p-6 border-t-4 border-t-[#246BFD]">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-xs text-gray-500 uppercase tracking-wide">Consultation</p>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ searchResult.consultation_number }}</h3>
                        </div>
                        <div :class="['px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1', getStatusColor(searchResult.status)]">
                            <component :is="getStatusIcon(searchResult.status)" class="w-3.5 h-3.5" />
                            <span class="capitalize">{{ searchResult.status_label || searchResult.status }}</span>
                        </div>
                    </div>

                    <div class="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div class="flex justified-between">
                             <div class="w-1/3 text-sm text-gray-500">Patient</div>
                             <div class="w-2/3 text-sm font-medium text-gray-900 dark:text-white text-right">{{ searchResult.patient_name }}</div>
                        </div>
                         <div class="flex justified-between">
                             <div class="w-1/3 text-sm text-gray-500">Created</div>
                             <div class="w-2/3 text-sm font-medium text-gray-900 dark:text-white text-right">{{ new Date(searchResult.created_at).toLocaleDateString() }}</div>
                        </div>
                        <div v-if="searchResult.doctor" class="flex justified-between">
                             <div class="w-1/3 text-sm text-gray-500">Assigned To</div>
                             <div class="w-2/3 text-sm font-medium text-gray-900 dark:text-white text-right">{{ searchResult.doctor.name }}</div>
                        </div>
                    </div>
                </Card>
            </Transition>
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
