<script setup lang="ts">
import { ref } from 'vue';
import TextInput from '@/components/TextInput.vue';
import FilePicker from '@/components/FilePicker.vue';

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  prescriptionFiles: [] as File[]
});

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  // TODO: Implement form submission logic
  console.log('Form submitted:', formData.value);
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl w-full">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Upload Your Prescription
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          Fill in your details and upload your prescription for processing
        </p>
      </div>

      <form @submit="handleSubmit" class="space-y-8">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextInput
            v-model="formData.firstName"
            label="First Name"
            type="text"
            required
            placeholder="Enter your first name"
          />

          <TextInput
            v-model="formData.lastName"
            label="Last Name"
            type="text"
            required
            placeholder="Enter your last name"
          />

          <TextInput
            v-model="formData.email"
            label="Email"
            type="email"
            required
            placeholder="Enter your email"
          />

          <TextInput
            v-model="formData.phoneNumber"
            label="Phone Number"
            type="tel"
            required
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <FilePicker
            v-model="formData.prescriptionFiles"
            label="Upload Prescription"
            :acceptedTypes="['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']"
            :maxSize="10"
            multiple
            required
            helper="Upload your prescriptions (PNG, JPG, PDF up to 10MB)"
          />
        </div>

        <div class="flex justify-center">
          <button
            type="submit"
            class="px-8 py-3 rounded-full bg-[#246BFD] text-white font-semibold hover:bg-[#5089FF] transition-all duration-300 hover:shadow-lg hover:shadow-[#246BFD]/20"
          >
            Submit Prescription
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 