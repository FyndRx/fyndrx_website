<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TextInput from '@/components/TextInput.vue';

const isVisible = ref(false);

onMounted(() => {
  isVisible.value = true;
});

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
});

const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const validationErrors = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
});

const handleSubmit = async () => {
  // Reset messages and validation errors
  successMessage.value = '';
  errorMessage.value = '';
  validationErrors.value = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  // Validate form
  if (!form.value.name) {
    validationErrors.value.name = 'Name is required';
    return;
  }
  if (!form.value.email) {
    validationErrors.value.email = 'Email is required';
    return;
  }
  if (!form.value.subject) {
    validationErrors.value.subject = 'Subject is required';
    return;
  }
  if (!form.value.message) {
    validationErrors.value.message = 'Message is required';
    return;
  }

  try {
    loading.value = true;
    // TODO: Implement the actual contact form submission
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
    successMessage.value = 'Thank you for your message! We will get back to you soon.';
    form.value = {
      name: '',
      email: '',
      subject: '',
      message: '',
    };
  } catch (error) {
    console.error('Contact form submission failed:', error);
    errorMessage.value = 'Failed to send message. Please try again.';
  } finally {
    loading.value = false;
  }
};

const contactInfo = {
  address: '123 Healthcare Street, Medical District',
  city: 'Accra, Ghana',
  email: 'info@fyndrx.com',
  phone: '+233 555 123 456',
  hours: 'Monday - Friday: 9:00 AM - 6:00 PM',
};

const socialLinks = [
  {
    name: 'Facebook',
    icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    url: '#',
  },
  {
    name: 'Twitter',
    icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
    url: '#',
  },
  {
    name: 'LinkedIn',
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    url: '#',
  },
];
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-[#246BFD]/10 to-[#FE9615]/10"></div>
      <div class="max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 relative">
        <div class="text-center" :class="{ 'animate-fade-in': isVisible }">
          <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Get in <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#246BFD] to-[#FE9615]">Touch</span>
          </h1>
          <p class="mt-6 max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300">
            Have questions? We're here to help. Reach out to us and we'll get back to you as soon as possible.
          </p>
        </div>
      </div>
    </section>

    <!-- Contact Form Section -->
    <section class="py-16 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Contact Form -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8" :class="{ 'animate-fade-in': isVisible }">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Send us a Message
            </h2>

            <!-- Success Message -->
            <div v-if="successMessage" class="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200">
              {{ successMessage }}
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200">
              {{ errorMessage }}
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div>
                <TextInput
                  v-model="form.name"
                  label="Name"
                  type="text"
                  :error="validationErrors.name"
                  placeholder="Your name"
                />
              </div>

              <div>
                <TextInput
                  v-model="form.email"
                  label="Email"
                  type="email"
                  :error="validationErrors.email"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <TextInput
                  v-model="form.subject"
                  label="Subject"
                  type="text"
                  :error="validationErrors.subject"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  v-model="form.message"
                  rows="4"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent transition-colors"
                  :class="{ 'border-red-500': validationErrors.message }"
                  placeholder="Your message..."
                ></textarea>
                <p v-if="validationErrors.message" class="mt-1 text-sm text-red-600 dark:text-red-400">
                  {{ validationErrors.message }}
                </p>
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="w-full px-8 py-3 rounded-full bg-gradient-to-r from-[#246BFD] to-[#5089FF] text-white font-semibold hover:shadow-lg hover:shadow-[#246BFD]/20 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading ? 'Sending...' : 'Send Message' }}
              </button>
            </form>
          </div>

          <!-- Contact Information -->
          <div class="space-y-8" :class="{ 'animate-fade-in': isVisible }">
            <div class="bg-gradient-to-r from-[#246BFD]/10 to-[#FE9615]/10 rounded-2xl p-8">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h3>
              <div class="space-y-4">
                <div class="flex items-start">
                  <svg class="h-6 w-6 text-[#246BFD] dark:text-[#5089FF] mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div class="ml-3">
                    <p class="text-gray-600 dark:text-gray-300">{{ contactInfo.address }}</p>
                    <p class="text-gray-600 dark:text-gray-300">{{ contactInfo.city }}</p>
                  </div>
                </div>

                <div class="flex items-center">
                  <svg class="h-6 w-6 text-[#246BFD] dark:text-[#5089FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a :href="'mailto:' + contactInfo.email" class="ml-3 text-gray-600 dark:text-gray-300 hover:text-[#246BFD] dark:hover:text-[#5089FF]">
                    {{ contactInfo.email }}
                  </a>
                </div>

                <div class="flex items-center">
                  <svg class="h-6 w-6 text-[#246BFD] dark:text-[#5089FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a :href="'tel:' + contactInfo.phone" class="ml-3 text-gray-600 dark:text-gray-300 hover:text-[#246BFD] dark:hover:text-[#5089FF]">
                    {{ contactInfo.phone }}
                  </a>
                </div>

                <div class="flex items-center">
                  <svg class="h-6 w-6 text-[#246BFD] dark:text-[#5089FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="ml-3 text-gray-600 dark:text-gray-300">{{ contactInfo.hours }}</p>
                </div>
              </div>
            </div>

            <!-- Social Links -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Follow Us
              </h3>
              <div class="flex space-x-4">
                <a 
                  v-for="social in socialLinks" 
                  :key="social.name"
                  :href="social.url"
                  class="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#246BFD]/10 to-[#FE9615]/10 hover:bg-[#FE9615] transition-all duration-300 group"
                >
                  <svg 
                    class="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-white transition-colors" 
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path :d="social.icon" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 