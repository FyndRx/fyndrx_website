<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { useGoogleMaps } from '@/composables/useGoogleMaps';
import TextInput from '@/components/TextInput.vue';

const PharmacyMap = defineAsyncComponent(() => import('@/components/PharmacyMap.vue'));

const isVisible = ref(false);
const { loadGoogleMapsScript } = useGoogleMaps();

onMounted(() => {
  isVisible.value = true;
  loadGoogleMapsScript();
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
  successMessage.value = '';
  errorMessage.value = '';
  validationErrors.value = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

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
    await new Promise(resolve => setTimeout(resolve, 1000));
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
  address: 'Mayflower Building, Community 10',
  city: 'Tema, Greater Accra',
  email: 'info@fyndrx.com',
  phone: '+233 24 399 6999',
  hours: 'Monday - Friday: 9:00 AM - 6:00 PM',
};

const officeLocation = {
  lat: 5.6698,
  lng: -0.0166
};

const socialLinks = [
  {
    name: 'Facebook',
    icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    url: 'https://www.facebook.com/fyndrx'
  },
  {
    name: 'X',
    icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    url: '#'
  },
  {
    name: 'Instagram',
    icon: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z',
    url: 'https://instagram.com/fyndrx_'
  },
  {
    name: 'YouTube',
    icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    url: 'https://www.youtube.com/@fyndrx_'
  },
  {
    name: 'TikTok',
    icon: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
    url: 'https://www.tiktok.com/@fyndrx_'
  },
  {
    name: 'LinkedIn',
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    url: 'https://www.linkedin.com/company/fyndrx'
  }
];
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-[#246BFD]/10 to-[#FE9615]/10"></div>
      <div class="relative px-4 py-24 mx-auto max-w-7xl sm:py-32 sm:px-6 lg:px-8">
        <div class="text-center" :class="{ 'animate-fade-in': isVisible }">
          <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Get in <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#246BFD] to-[#FE9615]">Touch</span>
          </h1>
          <p class="max-w-3xl mx-auto mt-6 text-xl text-gray-600 dark:text-gray-300">
            Have questions? We're here to help. Reach out to us and we'll get back to you as soon as possible.
          </p>
        </div>
      </div>
    </section>

    <!-- Contact Form Section -->
    <section class="py-16 bg-white dark:bg-gray-800">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <!-- Contact Form -->
          <div class="p-8 bg-white shadow-xl dark:bg-gray-800 rounded-2xl" :class="{ 'animate-fade-in': isVisible }">
            <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Send us a Message
            </h2>

            <!-- Success Message -->
            <div v-if="successMessage" class="p-4 mb-6 text-green-800 rounded-lg bg-green-50 dark:bg-green-900 dark:text-green-200">
              {{ successMessage }}
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="p-4 mb-6 text-red-800 rounded-lg bg-red-50 dark:bg-red-900 dark:text-red-200">
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
                <label for="message" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
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
            <div class="p-8 bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
              <h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
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
                    class="w-5 h-5 text-gray-600 transition-colors dark:text-gray-300 group-hover:text-white" 
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

    <!-- Map Section -->
    <section class="py-16 bg-gray-50 dark:bg-gray-900">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="mb-8 text-center">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
            Visit Our Office
          </h2>
          <p class="mt-2 text-lg text-gray-600 dark:text-gray-300">
            We're located in Tema, Greater Accra
          </p>
        </div>

        <div class="overflow-hidden bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
          <div class="grid grid-cols-1 lg:grid-cols-3">
            <!-- Map -->
            <div class="lg:col-span-2 h-96 lg:h-auto">
              <PharmacyMap
                :location="officeLocation"
                pharmacy-name="FyndRx Office"
              />
            </div>

            <!-- Location Info -->
            <div class="p-8 bg-gradient-to-br from-[#246BFD]/5 to-[#FE9615]/5 dark:from-[#246BFD]/10 dark:to-[#FE9615]/10">
              <h3 class="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                Our Location
              </h3>

              <div class="space-y-6">
                <div class="flex items-start gap-3">
                  <div class="flex items-center justify-center w-10 h-10 rounded-full bg-[#246BFD]/10">
                    <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">Address</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ contactInfo.address }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ contactInfo.city }}</p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="flex items-center justify-center w-10 h-10 rounded-full bg-[#246BFD]/10">
                    <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">Business Hours</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ contactInfo.hours }}</p>
                  </div>
                </div>

                <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <a
                    :href="`https://www.google.com/maps/dir/?api=1&destination=${officeLocation.lat},${officeLocation.lng}`"
                    target="_blank"
                    class="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all duration-300 hover:shadow-lg"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                    </svg>
                    Get Directions
                  </a>
                </div>
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