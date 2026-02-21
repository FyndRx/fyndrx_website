<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();
const { registerElement } = useScrollAnimation();

// FAQ Data
const faqs = [
  {
    question: 'How does the online consultation work?',
    answer: 'It\'s simple and asynchronous. You fill out a comprehensive medical questionnaire about your symptoms and history. A licensed doctor reviews your answers and determines the best treatment plan.'
  },
  {
    question: 'Do I need to video chat with a doctor?',
    answer: 'No video chat or appointment is required. The entire process is handled through our secure online form. If the doctor needs more information, they will reach out to you via our secure messaging platform.'
  },
  {
    question: 'Can I get a prescription online?',
    answer: 'Yes. If the doctor deems it medically necessary based on your assessment, they can write a digital prescription which you can use to order medications directly from our pharmacy partners.'
  },
  {
    question: 'Is my personal health information safe?',
    answer: 'Your privacy is our top priority. We use end-to-end encryption for all data and adhere to strict data protection regulations to keep your information secure.'
  }
];

const openFaq = ref<number | null>(null);

const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? null : index;
};

const steps = [
  {
    title: 'Sign Up',
    description: 'Create your free account in less than 2 minutes.',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  },
  {
    title: 'Complete Assessment',
    description: 'Fill out a simple health questionnaire about your symptoms.',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    title: 'Doctor Review',
    description: 'A licensed doctor reviews your info within 24 hours.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
  },
  {
    title: 'Get Prescription',
    description: 'Receive your treatment plan and digital prescription instantly.',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
  }
];

const activeTab = ref<'new' | 'track'>('new');
const quickTrackNumber = ref('');

const handleQuickTrack = () => {
    if (quickTrackNumber.value) {
        router.push({ 
            name: 'public-consultation-search', 
            query: { consultation_number: quickTrackNumber.value } 
        });
    }
};

onMounted(() => {
    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((element) => registerElement(element as HTMLElement));
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    
    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 overflow-hidden lg:pt-40 lg:pb-28">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-[#FE9615]/10 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 -left-24 w-72 h-72 bg-[#246BFD]/10 rounded-full blur-3xl"></div>
      </div>
      
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="text-left scroll-animate slide-in-left">
             <span class="inline-block px-4 py-1.5 mb-6 text-sm font-semibold text-[#246BFD] bg-[#246BFD]/10 rounded-full">
                FyndRX Telehealth
             </span>
             <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white mb-6">
                Healthcare Reimagined <br />
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#246BFD] to-[#60a5fa]">
                  Simple, Secure, Smart.
                </span>
             </h1>
             <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Get expert medical advice, diagnoses, and prescriptions by simply filling out a health assessment. Convenient, confidential, and no appointments needed.
             </p>
             <div class="flex flex-col sm:flex-row gap-4">
                 <button
                   @click="router.push('/about')"
                   class="px-8 py-4 text-lg font-bold text-gray-700 dark:text-white transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 hover:-translate-y-1"
                 >
                   Learn More
                 </button>
             </div>
          </div>

          <!-- Right Column: Action Card -->
          <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-2 border border-gray-100 dark:border-gray-700 scroll-animate slide-in-right">
             <!-- Tabs -->
             <div class="flex p-1 bg-gray-100 dark:bg-gray-700/50 rounded-2xl mb-6">
                <button 
                  @click="activeTab = 'new'"
                  class="flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300"
                  :class="activeTab === 'new' ? 'bg-white dark:bg-gray-800 text-[#246BFD] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
                >
                  New Consultation
                </button>
                <button 
                  @click="activeTab = 'track'"
                  class="flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300"
                  :class="activeTab === 'track' ? 'bg-white dark:bg-gray-800 text-[#246BFD] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
                >
                  Track Status
                </button>
             </div>

             <!-- New Consultation Content -->
             <div v-if="activeTab === 'new'" class="p-4 sm:p-6">
                <div class="mb-6">
                   <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Start your journey</h3>
                   <p class="text-gray-600 dark:text-gray-400">Fill out a simple assessment and get connected with a doctor in minutes.</p>
                </div>
                
                 <button
                   @click="router.push({ name: authStore.isAuthenticated ? 'create-consultation' : 'public-create-consultation' })"
                   class="w-full py-4 text-lg font-bold text-white transition-all duration-300 bg-[#246BFD] rounded-xl shadow-lg hover:bg-[#1a55db] hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                 >
                   Start Assessment
                   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                 </button>

                 <p class="mt-4 text-xs text-center text-gray-400">
                    Already have an account? <router-link to="/login" class="text-[#246BFD] hover:underline">Login here</router-link>
                 </p>
             </div>

             <!-- Track Status Content -->
             <div v-else class="p-4 sm:p-6">
                <div class="mb-6">
                   <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your status</h3>
                   <p class="text-gray-600 dark:text-gray-400">Enter your consultation number to see updates.</p>
                </div>
                
                <form @submit.prevent="handleQuickTrack" class="space-y-4">
                    <div>
                        <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Consultation Number</label>
                        <input 
                            v-model="quickTrackNumber"
                            type="text" 
                            placeholder="e.g. CONS-2026-XXXX"
                            class="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#246BFD] outline-none transition-all"
                            required
                        >
                    </div>
                    <button
                        type="submit"
                        class="w-full py-4 text-lg font-bold text-white transition-all duration-300 bg-gray-900 dark:bg-gray-700 rounded-xl shadow-lg hover:bg-black dark:hover:bg-gray-600 hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                        Track Status
                    </button>
                </form>
             </div>
          </div>
       </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-20 bg-white dark:bg-gray-800 relative z-10">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="text-center mb-16 scroll-animate slide-in-top">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-4">How It Works</h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">Four simple steps to better health</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="relative p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl scroll-animate slide-in-bottom"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
             <!-- Connector Line (Desktop) -->
            <div 
              v-if="index < steps.length - 1"
              class="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2 z-0"
            ></div>

            <div class="w-14 h-14 mx-auto mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center relative z-10">
              <svg class="w-7 h-7 text-[#FE9615]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="step.icon"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">{{ step.title }}</h3>
            <p class="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
              {{ step.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-20 bg-gray-50 dark:bg-gray-900">
      <div class="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
        <div class="text-center mb-16 scroll-animate slide-in-top">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-4">Frequently Asked Questions</h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">Everything you need to know about our telehealth services</p>
        </div>

        <div class="space-y-4">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index"
            class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 scroll-animate slide-in-bottom"
            :class="{ 'ring-2 ring-[#246BFD]/20': openFaq === index }"
          >
            <button
              @click="toggleFaq(index)"
              class="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none"
            >
              <span class="text-lg font-semibold text-gray-900 dark:text-white">{{ faq.question }}</span>
              <span 
                class="ml-4 transform transition-transform duration-300 text-gray-400"
                :class="{ 'rotate-180 text-[#246BFD]': openFaq === index }"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </span>
            </button>
            <div 
              v-show="openFaq === index"
              class="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4"
            >
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-white dark:bg-gray-800">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="bg-[#246BFD] rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden scroll-animate scale-up">
           <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
           <div class="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
           
           <h2 class="text-3xl font-bold sm:text-4xl mb-6 relative z-10">Ready to prioritize your health?</h2>
           <p class="text-xl text-blue-100 mb-10 max-w-2xl mx-auto relative z-10">
             Join thousands of patients who trust FyndRX for their medical needs. Start your journey to better health today.
           </p>
           <button
            @click="router.push({ name: authStore.isAuthenticated ? 'create-consultation' : 'public-create-consultation' })"
            class="px-10 py-4 text-lg font-bold text-[#246BFD] bg-white rounded-full shadow-lg hover:bg-gray-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative z-10"
           >
             Book Consultation Now
           </button>
        </div>
      </div>
    </section>


  </div>
</template>
