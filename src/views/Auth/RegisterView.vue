<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import TextInput from '@/components/TextInput.vue';
import CustomCheckbox from '@/components/CustomCheckbox.vue';
import SocialSignInButtons from '@/components/SocialSignInButtons.vue';
import logoBlueOrange from '@/assets/logo/logo_blue_orange.png';
import logoWhiteOrange from '@/assets/logo/logo_white_orange.png';
import { handleApiError } from '@/utils/errorHandler';

const router = useRouter();
const authStore = useAuthStore();

const step = ref(1); // 1: Details, 2: OTP
const loading = ref(false);
const resendLoading = ref(false);
const globalError = ref('');

const handleSocialSuccess = () => {
  router.push({ name: 'dashboard' });
};

const handleSocialError = (message: string) => {
  globalError.value = message;
};

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
  otp: '',
});

const validationErrors = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  terms: '',
  otp: '',
});

const emailFormatValid = ref(true);
const phoneFormatValid = ref(true);

// Requires at least one letter and one number, 8-72 chars (72 = common bcrypt input cap)
const isStrongPassword = (value: string) => /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/.test(value);

const validateStep1 = () => {
  let isValid = true;
  validationErrors.value = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    terms: '',
    otp: '',
  };

  if (!form.value.firstName.trim()) {
    validationErrors.value.firstName = 'First name is required';
    isValid = false;
  } else if (form.value.firstName.trim().length > 50) {
    validationErrors.value.firstName = 'First name is too long';
    isValid = false;
  }

  if (!form.value.lastName.trim()) {
    validationErrors.value.lastName = 'Last name is required';
    isValid = false;
  } else if (form.value.lastName.trim().length > 50) {
    validationErrors.value.lastName = 'Last name is too long';
    isValid = false;
  }

  // Email is optional — a phone number is the required contact/login method — but
  // whatever's entered still has to look like a real address.
  if (form.value.email.trim()) {
    if (form.value.email.trim().length > 254) {
      validationErrors.value.email = 'Email is too long';
      isValid = false;
    } else if (!emailFormatValid.value) {
      validationErrors.value.email = 'Please enter a valid email address';
      isValid = false;
    }
  }

  if (!form.value.phoneNumber.trim()) {
    validationErrors.value.phoneNumber = 'Phone number is required';
    isValid = false;
  } else if (!phoneFormatValid.value) {
    validationErrors.value.phoneNumber = 'Please enter a valid phone number';
    isValid = false;
  }

  if (!form.value.password) {
    validationErrors.value.password = 'Password is required';
    isValid = false;
  } else if (!isStrongPassword(form.value.password)) {
    validationErrors.value.password = 'Password must be 8+ characters and include at least one letter and one number';
    isValid = false;
  }

  if (!form.value.confirmPassword) {
    validationErrors.value.confirmPassword = 'Please confirm your password';
    isValid = false;
  } else if (form.value.password !== form.value.confirmPassword) {
    validationErrors.value.confirmPassword = 'Passwords do not match';
    isValid = false;
  }

  if (!form.value.acceptTerms) {
    validationErrors.value.terms = 'You must accept the terms and conditions';
    isValid = false;
  }

  return isValid;
};

const handleSendOTP = async (isResend = false) => {
  if (!isResend && !validateStep1()) return;

  const busyRef = isResend ? resendLoading : loading;
  busyRef.value = true;
  globalError.value = '';

  try {
    // Send OTP
    await authStore.sendOTP({
      email: form.value.email.trim() || undefined,
      phone_number: form.value.phoneNumber.trim()
    });

    // Move to next step
    if (!isResend) step.value = 2;
  } catch (error: any) {
    const apiError = handleApiError(error);
    if (apiError.errors) {
      if (apiError.errors.email) validationErrors.value.email = apiError.errors.email[0];
      if (apiError.errors.phone_number) validationErrors.value.phoneNumber = apiError.errors.phone_number[0];
      if (apiError.errors.password) validationErrors.value.password = apiError.errors.password[0];
    }

    if (!apiError.errors) {
       globalError.value = apiError.message || 'Failed to send OTP. Please try again.';
    }
  } finally {
    busyRef.value = false;
  }
};

const handleRegister = async () => {
    validationErrors.value.otp = '';

    if (!form.value.otp.trim()) {
        validationErrors.value.otp = 'OTP is required';
        return;
    }
    if (!/^\d{4,6}$/.test(form.value.otp.trim())) {
        validationErrors.value.otp = 'Please enter the numeric code sent to you';
        return;
    }

    loading.value = true;
    globalError.value = '';

    try {
        await authStore.register({
            firstname: form.value.firstName.trim(),
            lastname: form.value.lastName.trim(),
            email: form.value.email.trim() || undefined,
            phone_number: form.value.phoneNumber.trim(),
            password: form.value.password,
            otp: form.value.otp.trim()
        });
        
        // Success - redirect to dashboard
        router.push('/dashboard');
    } catch (error: any) {
        const apiError = handleApiError(error);
         if (apiError.errors) {
            if (apiError.errors.otp) validationErrors.value.otp = apiError.errors.otp[0];
            // Handle other errors that might come back
            if (apiError.errors.email) {
                step.value = 1;
                validationErrors.value.email = apiError.errors.email[0];
            }
        }
        
         if (!apiError.errors && !validationErrors.value.otp) {
            globalError.value = apiError.message || 'Registration failed. Please try again.';
        }
    } finally {
        loading.value = false;
    }
}

const handleSubmit = async () => {
  if (step.value === 1) {
    await handleSendOTP();
  } else {
    await handleRegister();
  }
};

const handleEmailValidation = (isValid: boolean) => {
  emailFormatValid.value = isValid;
  if (!isValid && form.value.email) {
    validationErrors.value.email = 'Please enter a valid email address';
  } else {
    validationErrors.value.email = '';
  }
};

const handlePhoneValidation = (isValid: boolean) => {
  phoneFormatValid.value = isValid;
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
          :src="logoBlueOrange" 
          alt="FyndRx Logo" 
          class="mx-auto h-12 w-auto dark:hidden"
        />
        <img 
          :src="logoWhiteOrange" 
          alt="FyndRx Logo" 
          class="mx-auto h-12 w-auto hidden dark:block"
        />
        <h2 class="mt-6 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {{ step === 1 ? 'Create your account' : 'Verify Phone Number' }}
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span v-if="step === 1">
              Already have an account?
              <router-link
                to="/login"
                class="font-medium text-[#246BFD] hover:text-[#5089FF] dark:text-[#5089FF] dark:hover:text-[#246BFD]"
              >
                Sign in
              </router-link>
            </span>
            <span v-else>
                We sent a code to {{ form.phoneNumber }}
                <button @click="step = 1" type="button" class="text-[#246BFD] hover:underline ml-1">Change</button>
            </span>
        </p>
      </div>

      <!-- Registration Form -->
      <div class="mt-8 bg-white dark:bg-gray-800 py-6 sm:py-8 px-4 sm:px-6 lg:px-12 shadow-xl rounded-2xl">
        <div v-if="globalError" class="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {{ globalError }}
        </div>

        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div v-if="step === 1" class="space-y-6">
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
                label="Email Address (optional)"
                placeholder="Enter your email address"
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
                helper="At least 8 characters, with one letter and one number"
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
                <div class="pt-0.5">
                <CustomCheckbox
                    v-model="form.acceptTerms"
                    size="small"
                />
                </div>
                <div class="ml-3 text-sm">
                <label class="font-medium text-gray-900 dark:text-gray-300">
                    I agree to the
                    <router-link to="/terms" target="_blank" class="text-[#246BFD] hover:text-[#5089FF] dark:text-[#5089FF] dark:hover:text-[#246BFD] underline">
                    Terms of Service
                    </router-link>
                    and
                    <router-link to="/privacy" target="_blank" class="text-[#246BFD] hover:text-[#5089FF] dark:text-[#5089FF] dark:hover:text-[#246BFD] underline">
                    Privacy Policy
                    </router-link>
                </label>
                <p v-if="validationErrors.terms" class="mt-1 text-red-600 dark:text-red-400">
                    {{ validationErrors.terms }}
                </p>
                </div>
            </div>
          </div>

          <div v-else class="space-y-6">
             <TextInput
                v-model="form.otp"
                type="text"
                label="OTP Verification Code"
                placeholder="Enter the 4-digit code"
                required
                autocomplete="one-time-code"
                :error="validationErrors.otp"
            />
            <p class="text-sm text-gray-500">
                Didn't receive code?
                <button
                  type="button"
                  @click="handleSendOTP(true)"
                  class="text-[#246BFD] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                  :disabled="resendLoading"
                  :aria-busy="resendLoading"
                >{{ resendLoading ? 'Sending...' : 'Resend' }}</button>
            </p>
          </div>

          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#246BFD] hover:bg-[#5089FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#246BFD] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading"
              :aria-busy="loading"
              :aria-disabled="loading"
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
              {{ loading ? 'Processing...' : (step === 1 ? 'Continue' : 'Verify & Create Account') }}
            </button>
          </div>
        </form>

        <div v-if="step === 1" class="mt-6">
          <SocialSignInButtons @success="handleSocialSuccess" @error="handleSocialError" />
        </div>
      </div>
    </div>
  </div>
</template> 