<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import TextInput from '@/components/TextInput.vue';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
});

const validationErrors = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  terms: '',
});

const handleSubmit = async () => {
  // Reset validation errors
  validationErrors.value = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    terms: '',
  };

  // Validate form
  if (!form.value.firstName) {
    validationErrors.value.firstName = 'First name is required';
    return;
  }
  if (!form.value.lastName) {
    validationErrors.value.lastName = 'Last name is required';
    return;
  }
  if (!form.value.email) {
    validationErrors.value.email = 'Email is required';
    return;
  }
  if (!form.value.phoneNumber) {
    validationErrors.value.phoneNumber = 'Phone number is required';
    return;
  }
  if (!form.value.password) {
    validationErrors.value.password = 'Password is required';
    return;
  }
  if (form.value.password.length < 8) {
    validationErrors.value.password = 'Password must be at least 8 characters long';
    return;
  }
  if (form.value.password !== form.value.confirmPassword) {
    validationErrors.value.confirmPassword = 'Passwords do not match';
    return;
  }
  if (!form.value.acceptTerms) {
    validationErrors.value.terms = 'You must accept the terms and conditions';
    return;
  }

  try {
    loading.value = true;
    await authStore.register({
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      email: form.value.email,
      phoneNumber: form.value.phoneNumber,
      password: form.value.password,
      role: 'patient', // Default role for new registrations
    });
    // Redirect to OTP verification page with email
    router.push({
      path: '/verify-otp',
      query: { email: form.value.email }
    });
  } catch (error) {
    console.error('Registration failed:', error);
    validationErrors.value.email = 'Registration failed. Please try again.';
  } finally {
    loading.value = false;
  }
};

const handleEmailValidation = (isValid: boolean) => {
  if (!isValid && form.value.email) {
    validationErrors.value.email = 'Please enter a valid email address';
  } else {
    validationErrors.value.email = '';
  }
};

const handlePhoneValidation = (isValid: boolean) => {
  if (!isValid && form.value.phoneNumber) {
    validationErrors.value.phoneNumber = 'Please enter a valid phone number';
  } else {
    validationErrors.value.phoneNumber = '';
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-xl w-full space-y-8">
      <!-- Logo -->
      <div class="text-center">
        <img 
          src="/src/assets/logo/logo_blue_orange.png" 
          alt="FyndRx Logo" 
          class="mx-auto h-12 w-auto dark:hidden"
        />
        <img 
          src="/src/assets/logo/logo_white_orange.png" 
          alt="FyndRx Logo" 
          class="mx-auto h-12 w-auto hidden dark:block"
        />
        <h2 class="mt-6 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Already have an account?
          <router-link
            to="/login"
            class="font-medium text-[#246BFD] hover:text-[#5089FF] dark:text-[#5089FF] dark:hover:text-[#246BFD]"
          >
            Sign in
          </router-link>
        </p>
      </div>

      <!-- Registration Form -->
      <div class="mt-8 bg-white dark:bg-gray-800 py-6 sm:py-8 px-4 sm:px-6 lg:px-12 shadow-xl rounded-2xl">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <TextInput
              v-model="form.firstName"
              type="text"
              label="First Name"
              placeholder="Enter your first name"
              required
              autocomplete="given-name"
              :error="validationErrors.firstName"
            />

            <TextInput
              v-model="form.lastName"
              type="text"
              label="Last Name"
              placeholder="Enter your last name"
              required
              autocomplete="family-name"
              :error="validationErrors.lastName"
            />
          </div>

          <TextInput
            v-model="form.email"
            type="email"
            label="Email Address"
            placeholder="Enter your email address"
            required
            autocomplete="email"
            :error="validationErrors.email"
            @validation="handleEmailValidation"
          />

          <TextInput
            v-model="form.phoneNumber"
            type="tel"
            label="Phone Number"
            placeholder="Enter your phone number"
            required
            autocomplete="tel"
            acceptPhone
            :error="validationErrors.phoneNumber"
            @validation="handlePhoneValidation"
          />

          <TextInput
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            required
            autocomplete="new-password"
            :error="validationErrors.password"
          />

          <TextInput
            v-model="form.confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            required
            autocomplete="new-password"
            :error="validationErrors.confirmPassword"
          />

          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="terms"
                v-model="form.acceptTerms"
                name="terms"
                type="checkbox"
                required
                class="h-4 w-4 text-[#246BFD] focus:ring-[#246BFD] border-gray-300 dark:border-gray-600 rounded"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="terms" class="font-medium text-gray-900 dark:text-gray-300">
                I agree to the
                <a href="#" class="text-[#246BFD] hover:text-[#5089FF] dark:text-[#5089FF] dark:hover:text-[#246BFD]">
                  Terms of Service
                </a>
                and
                <a href="#" class="text-[#246BFD] hover:text-[#5089FF] dark:text-[#5089FF] dark:hover:text-[#246BFD]">
                  Privacy Policy
                </a>
              </label>
              <p v-if="validationErrors.terms" class="mt-1 text-red-600 dark:text-red-400">
                {{ validationErrors.terms }}
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#246BFD] hover:bg-[#5089FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#246BFD] transition-all duration-300"
              :disabled="loading"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ loading ? 'Creating account...' : 'Create account' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template> 