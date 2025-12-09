<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotification } from '@/composables/useNotification';
import { authService } from '@/services/auth.service';
import TextInput from '@/components/TextInput.vue';

const router = useRouter();
const notification = useNotification();

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  notes: '',
});

const loading = ref(false);
const prescriptionFile = ref<File | null>(null);

onMounted(async () => {
  try {
    const user = await authService.getUserDetails();
    if (user) {
      form.value.first_name = user.firstname || '';
      form.value.last_name = user.lastname || '';
      form.value.email = user.email || '';
      form.value.phone_number = user.phone_number || '';
    }
  } catch (error) {
    console.error('Failed to load user details:', error);
  }
});

const prescriptionPreview = ref<string | null>(null);
const fieldErrors = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
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
    
    prescriptionFile.value = file;
    
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
  prescriptionFile.value = null;
  prescriptionPreview.value = null;
  
  const fileInput = document.querySelector('#prescription-file') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

const resetForm = () => {
  form.value = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    notes: '',
  };
  removePrescription();
  fieldErrors.value = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    prescription: ''
  };
};

const validateForm = () => {
  let isValid = true;
  fieldErrors.value = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    prescription: ''
  };

  if (!form.value.first_name.trim()) {
    fieldErrors.value.first_name = 'First name is required';
    isValid = false;
  }

  if (!form.value.last_name.trim()) {
    fieldErrors.value.last_name = 'Last name is required';
    isValid = false;
  }

  if (!form.value.email.trim()) {
    fieldErrors.value.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    fieldErrors.value.email = 'Please enter a valid email';
    isValid = false;
  }

  if (!form.value.phone_number.trim()) {
    fieldErrors.value.phone_number = 'Phone number is required';
    isValid = false;
  }

  if (!prescriptionFile.value) {
    fieldErrors.value.prescription = 'Prescription file is required';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    notification.warning('Validation Error', 'Please fill in all required fields');
    return;
  }

  try {
    loading.value = true;
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    notification.success(
      'Prescription Uploaded Successfully!',
      'We will review your prescription and contact you shortly.'
    );
    
    resetForm();
    
    setTimeout(() => {
      router.push({ name: 'prescriptions' });
    }, 2000);
  } catch (err: any) {
    notification.error(
      'Upload Failed',
      err.message || 'Failed to upload prescription. Please try again.'
    );
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Upload Prescription
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Upload your prescription and we'll help you find the best prices for your medications
        </p>
      </div>
      
      <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl md:p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Personal Information -->
          <div>
            <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextInput
                v-model="form.first_name"
                label="First Name"
                type="text"
                placeholder="Enter your first name"
                required
                :error="fieldErrors.first_name"
              />
              <TextInput
                v-model="form.last_name"
                label="Last Name"
                type="text"
                placeholder="Enter your last name"
                required
                :error="fieldErrors.last_name"
              />
              <TextInput
                v-model="form.email"
                label="Email Address"
                type="email"
                placeholder="your.email@example.com"
                required
                :error="fieldErrors.email"
              />
              <TextInput
                v-model="form.phone_number"
                label="Phone Number"
                type="tel"
                placeholder="+233 XX XXX XXXX"
                required
                :error="fieldErrors.phone_number"
              />
            </div>
          </div>

          <!-- Prescription Upload -->
          <div>
            <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Prescription Document</h2>
            
            <div v-if="!prescriptionFile" class="relative">
              <input
                id="prescription-file"
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/jpg"
                class="hidden"
                @change="handlePrescriptionUpload"
              />
              <label
                for="prescription-file"
                class="flex flex-col items-center justify-center w-full p-8 transition-all duration-300 border-2 border-dashed rounded-xl cursor-pointer hover:border-[#246BFD] hover:bg-blue-50 dark:hover:bg-blue-900/10"
                :class="[
                  fieldErrors.prescription
                    ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
                ]"
              >
                <svg class="w-12 h-12 mb-3" :class="fieldErrors.prescription ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p class="mb-2 text-sm font-medium" :class="fieldErrors.prescription ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'">
                  <span class="text-[#246BFD]">Click to upload</span> or drag and drop
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  PDF, PNG, JPG or JPEG (max. 10MB)
                </p>
              </label>
              <p v-if="fieldErrors.prescription" class="mt-2 text-sm text-red-600 dark:text-red-400">
                {{ fieldErrors.prescription }}
              </p>
            </div>

            <!-- Preview -->
            <div v-else class="p-4 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 rounded-xl">
              <div class="flex items-start gap-4">
                <div v-if="prescriptionPreview === 'pdf'" class="flex-shrink-0">
                  <div class="flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <svg class="w-10 h-10 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </div>
                <div v-else class="flex-shrink-0">
                  <img
                    :src="prescriptionPreview || ''"
                    alt="Prescription preview"
                    class="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {{ prescriptionFile.name }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {{ (prescriptionFile.size / 1024 / 1024).toFixed(2) }} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      @click="removePrescription"
                      class="flex-shrink-0 p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                  <div class="mt-2 flex items-center gap-2">
                    <div class="flex-1 bg-green-200 dark:bg-green-800 rounded-full h-1.5">
                      <div class="bg-green-600 dark:bg-green-400 h-1.5 rounded-full" style="width: 100%"></div>
                    </div>
                    <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Notes -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Additional Notes (Optional)
            </label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent transition-all"
              placeholder="Any additional information about your prescription..."
            ></textarea>
          </div>

          <!-- Info Banner -->
          <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div class="flex gap-3">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
              </svg>
              <div class="text-sm text-blue-800 dark:text-blue-200">
                <p class="font-medium mb-1">What happens next?</p>
                <ul class="space-y-1 list-disc list-inside">
                  <li>Our pharmacists will review your prescription</li>
                  <li>We'll find the best prices across multiple pharmacies</li>
                  <li>You'll receive a call/email within 24 hours</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex gap-3">
            <button
              type="button"
              @click="router.push({ name: 'prescriptions' })"
              class="px-6 py-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 px-6 py-3 bg-[#246BFD] text-white font-medium rounded-full hover:bg-[#5089FF] transition-all duration-300 shadow-lg hover:shadow-[#246BFD]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :disabled="loading"
            >
              <svg v-if="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loading ? 'Uploading...' : 'Upload Prescription' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template> 