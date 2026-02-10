<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotification } from '@/composables/useNotification';
import { prescriptionService, type CreatePrescriptionRequest } from '@/services/prescription';
import TextInput from '@/components/TextInput.vue';
import Button from '@/components/Button.vue';
import { ArrowLeftIcon, CloudArrowUpIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/vue/24/outline';

const router = useRouter();
const notification = useNotification();

const form = ref<CreatePrescriptionRequest>({
  title: '',
  doctorName: '',
  prescriptionDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  notes: '',
  prescription_picture: null
});

const loading = ref(false);
const prescriptionPreview = ref<string | null>(null);
const fieldErrors = ref({
  title: '',
  doctorName: '',
  prescriptionDate: '',
  expiryDate: '',
  prescription: ''
});

const handlePrescriptionUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      fieldErrors.value.prescription = 'Please upload a PDF, JPEG, or PNG file';
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      fieldErrors.value.prescription = 'File size should be less than 10MB';
        return;
    }
    
    // Assign directly to the form property expected by the service
    form.value.prescription_picture = file;
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        prescriptionPreview.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      prescriptionPreview.value = 'pdf';
    }
    
    fieldErrors.value.prescription = '';
  }
};

const removePrescription = () => {
  form.value.prescription_picture = null;
  prescriptionPreview.value = null;
  
  const fileInput = document.querySelector('#prescription-file') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

const validateForm = () => {
    let isValid = true;
    fieldErrors.value = {
        title: '',
        doctorName: '',
        prescriptionDate: '',
        expiryDate: '',
        prescription: ''
    };

    if (!form.value.prescription_picture) {
        fieldErrors.value.prescription = 'Prescription file is required';
        isValid = false;
    }

    if (form.value.expiryDate && form.value.prescriptionDate) {
        if (new Date(form.value.expiryDate) < new Date(form.value.prescriptionDate)) {
            fieldErrors.value.expiryDate = 'Expiry date cannot be before prescription date';
            isValid = false;
        }
    }

    return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    notification.warning('Validation Error', 'Please check the form for errors');
    return;
  }

  try {
    loading.value = true;
    
    await prescriptionService.createPrescription(form.value);
    
    notification.success(
      'Prescription Uploaded Successfully!',
      'Your prescription has been securely saved.'
    );
    
    setTimeout(() => {
      router.push({ name: 'prescriptions' });
    }, 1500);
  } catch (err: any) {
    console.error(err);
    notification.error(
      'Upload Failed',
      err.message || 'Failed to upload prescription. Please try again.'
    );
  } finally {
    loading.value = false;
  }
};

const goBack = () => router.push({ name: 'prescriptions' });
</script>

<template>
  <div class="min-h-screen pt-28 pb-20 bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 max-w-3xl">
      <!-- Header -->
      <div class="mb-8">
        <button 
          @click="goBack" 
          class="flex items-center text-gray-500 hover:text-[#246BFD] transition-colors mb-6 group font-medium"
        >
          <ArrowLeftIcon class="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Prescriptions
        </button>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Upload Prescription
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Upload your prescription to securely store it and order medications.
        </p>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <form @submit.prevent="handleSubmit" class="space-y-8">
            
          <!-- Prescription Details (Moved to Top) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <TextInput
                v-model="form.title"
                label="Prescription Title (Optional)"
                placeholder="e.g., Monthly Medication"
                :error="fieldErrors.title"
              />
              
              <TextInput
                v-model="form.doctorName"
                label="Doctor's Name (Optional)"
                placeholder="Dr. Smith"
                :error="fieldErrors.doctorName"
              />

              <TextInput
                v-model="form.prescriptionDate"
                type="date"
                label="Prescription Date"
                :error="fieldErrors.prescriptionDate"
              />

              <TextInput
                v-model="form.expiryDate"
                type="date"
                label="Expiry Date (Optional)"
                :error="fieldErrors.expiryDate"
              />
          </div>

          <!-- Notes (Middle) -->
          <div>
            <label class="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              Notes (Optional)
            </label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent transition-all outline-none"
              placeholder="Any additional notes..."
            ></textarea>
          </div>

          <!-- File Upload Section (Moved to Bottom) -->
          <div>
            <label class="block mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              Prescription Document <span class="text-red-500">*</span>
            </label>
            
            <div v-if="!form.prescription_picture" class="relative">
              <input
                id="prescription-file"
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/jpg"
                class="hidden"
                @change="handlePrescriptionUpload"
              />
              <label
                for="prescription-file"
                class="flex flex-col items-center justify-center w-full h-64 transition-all duration-300 border-2 border-dashed rounded-2xl cursor-pointer hover:border-[#246BFD] hover:bg-blue-50 dark:hover:bg-blue-900/10 group"
                :class="[
                  fieldErrors.prescription
                    ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30'
                ]"
              >
                <div class="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <CloudArrowUpIcon class="w-8 h-8 text-[#246BFD]" />
                </div>
                <p class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  Click to upload or drag and drop
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  PDF, PNG, JPG or JPEG (max. 10MB)
                </p>
              </label>
              <p v-if="fieldErrors.prescription" class="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                {{ fieldErrors.prescription }}
              </p>
            </div>

            <!-- Preview Section -->
            <div v-else class="p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 rounded-2xl flex items-center gap-4">
              <div class="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                 <img
                    v-if="prescriptionPreview && prescriptionPreview !== 'pdf'"
                    :src="prescriptionPreview"
                    alt="Preview"
                    class="w-full h-full object-cover"
                  />
                  <DocumentTextIcon v-else class="w-10 h-10 text-gray-400" />
              </div>
              
              <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {{ (form.prescription_picture as File).name }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ ((form.prescription_picture as File).size / 1024 / 1024).toFixed(2) }} MB
                  </p>
              </div>

              <button
                type="button"
                @click="removePrescription"
                class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Remove file"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-4 pt-4">
            <Button
              variant="secondary"
              type="button"
              @click="goBack"
              class="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              class="flex-1"
              :loading="loading"
            >
              Upload Prescription
            </Button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>