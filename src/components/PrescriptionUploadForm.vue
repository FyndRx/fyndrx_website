<script setup lang="ts">
import { ref, reactive } from 'vue';
import { prescriptionService, type PrescriptionUploadData } from '@/services/prescription';
import { validationRules as globalValidationRules, validateForm, type ValidationError } from '@/utils/validation';
import TextInput from '@/components/TextInput.vue';

const form = ref<PrescriptionUploadData>({
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  prescription_picture: new File([], ''),
});

const loading = ref(false);
const success = ref<string | null>(null);
const error = ref<string | null>(null);
const prescriptionPreview = ref<string | null>(null);
const fieldErrors = reactive<Record<string, string>>({});

const formValidationRules = {
  first_name: [
    globalValidationRules.required,
    globalValidationRules.minLength(2),
    globalValidationRules.maxLength(50),
  ],
  last_name: [
    globalValidationRules.required,
    globalValidationRules.minLength(2),
    globalValidationRules.maxLength(50),
  ],
  email: [
    globalValidationRules.required,
    globalValidationRules.email,
  ],
  phone_number: [
    globalValidationRules.required,
    globalValidationRules.phone,
  ],
  prescription_picture: [
    globalValidationRules.required,
    globalValidationRules.fileSize(10 * 1024 * 1024), // 10MB
    globalValidationRules.fileType(['image/jpeg', 'image/png', 'image/gif']),
  ],
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    form.value.prescription_picture = file;
    
    // Validate file
    const errors = validateForm({ prescription_picture: file }, { prescription_picture: formValidationRules.prescription_picture });
    if (errors.length > 0) {
      fieldErrors.prescription_picture = errors[0].message;
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      prescriptionPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async () => {
  try {
    // Reset states
    loading.value = true;
    error.value = null;
    success.value = null;
    Object.keys(fieldErrors).forEach(key => delete fieldErrors[key]);

    // Validate form
    const errors = validateForm(form.value, formValidationRules);
    if (errors.length > 0) {
      errors.forEach(err => {
        fieldErrors[err.field] = err.message;
      });
      return;
    }

    // Submit form
    await prescriptionService.uploadPrescription(form.value);
    success.value = 'Prescription uploaded successfully! We will contact you shortly.';
    
    // Reset form
    form.value = {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      prescription_picture: new File([], ''),
    };
    prescriptionPreview.value = null;
  } catch (err: any) {
    if (err.response?.data?.message) {
      error.value = err.response.data.message;
    } else {
      error.value = err instanceof Error ? err.message : 'Failed to upload prescription';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
      Upload Prescription
    </h3>
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      Upload your prescription and we'll help you find the best prices for your medications.
    </p>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextInput
          v-model="form.first_name"
          label="First Name"
          type="text"
          required
          :error="fieldErrors.first_name"
        />
        <TextInput
          v-model="form.last_name"
          label="Last Name"
          type="text"
          required
          :error="fieldErrors.last_name"
        />
        <TextInput
          v-model="form.email"
          label="Email"
          type="email"
          required
          :error="fieldErrors.email"
        />
        <TextInput
          v-model="form.phone_number"
          label="Phone Number"
          type="tel"
          required
          :error="fieldErrors.phone_number"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Prescription Image
        </label>
        <div 
          class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors"
          :class="[
            fieldErrors.prescription_picture
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          ]"
        >
          <div class="space-y-1 text-center">
            <div v-if="!prescriptionPreview" class="flex text-sm text-gray-600 dark:text-gray-400">
              <label
                for="prescription-file"
                class="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary hover:text-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
              >
                <span>Upload a file</span>
                <input
                  id="prescription-file"
                  type="file"
                  accept="image/*"
                  class="sr-only"
                  @change="handleFileSelect"
                />
              </label>
              <p class="pl-1">or drag and drop</p>
            </div>
            <div v-else class="relative">
              <img
                :src="prescriptionPreview"
                alt="Prescription preview"
                class="max-h-48 rounded-lg"
              />
              <button
                type="button"
                @click="prescriptionPreview = null; form.prescription_picture = new File([], '')"
                class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF up to 10MB
            </p>
            <p v-if="fieldErrors.prescription_picture" class="text-sm text-red-600 dark:text-red-400">
              {{ fieldErrors.prescription_picture }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
        {{ error }}
      </div>

      <div v-if="success" class="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm">
        {{ success }}
      </div>

      <button
        type="submit"
        class="w-full px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        :disabled="loading"
      >
        <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-upload'"></i>
        <span>{{ loading ? 'Uploading...' : 'Upload Prescription' }}</span>
      </button>
    </form>
  </div>
</template> 