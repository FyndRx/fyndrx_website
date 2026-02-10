<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  HeartIcon,
  ChevronLeftIcon, 
  ChevronRightIcon,
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline';

const currentSlide = ref(0);
const autoplayInterval = ref<any>(null);

const slides = [
  {
    id: 1,
    tag: 'New In-Person Service',
    title: 'Sexual & Reproductive',
    highlight: 'Health Counseling',
    description: 'Professional, confidential, and judgment-free support for your well-being. Talk to our specialists in a private setting.',
    theme: {
      bg: 'from-[#1A2233] to-[#243B55]',
      accent: '#FE9615',
      secondary: '#246BFD',
      text_gradient: 'from-[#FE9615] to-[#FFB75E]'
    },
    topics: [
      { text: 'Family Planning Methods', icon: HeartIcon, color: 'text-pink-500' },
      { text: 'Pregnancies', icon: SparklesIcon, color: 'text-purple-500' }, // Using Sparkles as generic icon for now
      { text: 'Sexual & Genital Infections', icon: ShieldCheckIcon, color: 'text-red-500' }
    ],
    details: {
      days: 'Tuesday • Wednesday • Thursday',
      time: '10:00 AM - 5:00 PM',
      location: 'Behind Nahda Basic School. Nyohini-Yepala, Tamale'
    }
  },
  {
    id: 2,
    tag: 'Vaccination Drive',
    title: 'Immunization &',
    highlight: 'Travel Vaccines',
    description: 'Protect yourself and your family. Walk-ins available for flu shots, Hepatitis B, and travel immunizations.',
    theme: {
      bg: 'from-[#064E3B] to-[#065F46]', // Dark Green
      accent: '#34D399', // Green
      secondary: '#10B981',
      text_gradient: 'from-[#34D399] to-[#6EE7B7]'
    },
    topics: [
      { text: 'Flu Shots', icon: ShieldCheckIcon, color: 'text-emerald-400' },
      { text: 'Travel Vaccines', icon: MapPinIcon, color: 'text-teal-400' },
      { text: 'Hepatitis B', icon: SparklesIcon, color: 'text-cyan-400' }
    ],
    details: {
      days: 'Monday - Friday',
      time: '9:00 AM - 6:00 PM',
      location: 'Behind Nahda Basic School. Nyohini-Yepala, Tamale'
    }
  },
  {
    id: 3,
    tag: 'Chronic Care',
    title: 'Diabetes & Hypertension',
    highlight: 'Management Program',
    description: 'Get personalized support, medication reviews, and lifestyle coaching to manage your chronic conditions effectively.',
    theme: {
      bg: 'from-[#312E81] to-[#4338CA]', // Indigo
      accent: '#818CF8', // Light Indigo
      secondary: '#6366F1',
      text_gradient: 'from-[#818CF8] to-[#A5B4FC]'
    },
    topics: [
      { text: 'Blood Glucose Monitoring', icon: HeartIcon, color: 'text-rose-400' },
      { text: 'BP Checks', icon: ClockIcon, color: 'text-indigo-400' },
      { text: 'Medication Review', icon: ShieldCheckIcon, color: 'text-violet-400' }
    ],
    details: {
      days: 'By Appointment',
      time: 'Weekdays & Saturdays',
      location: 'Behind Nahda Basic School. Nyohini-Yepala, Tamale'
    }
  }
];

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length;
};

const goToSlide = (index: number) => {
  currentSlide.value = index;
};

const startAutoplay = () => {
  stopAutoplay();
  autoplayInterval.value = setInterval(nextSlide, 8000);
};

const stopAutoplay = () => {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value);
    autoplayInterval.value = null;
  }
};

onMounted(() => {
  startAutoplay();
});

onUnmounted(() => {
  stopAutoplay();
});
</script>

<template>
  <div class="py-16 px-4 sm:px-6 lg:px-8">
    <div class="relative overflow-hidden rounded-[2.5rem] shadow-2xl transition-all duration-700 ease-in-out"
       :class="`bg-gradient-to-br ${slides[currentSlide].theme.bg}`"
       @mouseenter="stopAutoplay"
       @mouseleave="startAutoplay"
    >
      
      <!-- Background Decorations (Dynamic Colors) -->
      <div 
        class="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 transition-colors duration-700 opacity-20"
        :style="{ backgroundColor: slides[currentSlide].theme.accent }"
      ></div>
      <div 
        class="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 transition-colors duration-700 opacity-20"
        :style="{ backgroundColor: slides[currentSlide].theme.secondary }"
      ></div>
      
      <!-- Slide Content -->
      <div class="relative z-10 px-6 py-12 md:py-16 md:px-12 lg:px-20 min-h-[600px] flex items-center">
        <!-- Transition wrapper -->
        <transition mode="out-in" enter-active-class="duration-500 ease-out" enter-from-class="opacity-0 translate-x-4" enter-to-class="opacity-100 translate-x-0" leave-active-class="duration-300 ease-in" leave-from-class="opacity-100 translate-x-0" leave-to-class="opacity-0 -translate-x-4">
          
          <div :key="currentSlide" class="w-full">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              <!-- Content Left -->
              <div class="space-y-8">
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span class="w-2 h-2 rounded-full animate-pulse" :style="{ backgroundColor: slides[currentSlide].theme.accent }"></span>
                  <span class="text-xs font-bold uppercase tracking-wider" :style="{ color: slides[currentSlide].theme.accent }">
                    {{ slides[currentSlide].tag }}
                  </span>
                </div>
                
                <h2 class="text-3xl md:text-5xl font-bold text-white leading-tight">
                  {{ slides[currentSlide].title }} <br/>
                  <span class="text-transparent bg-clip-text bg-gradient-to-r" :class="slides[currentSlide].theme.text_gradient">
                    {{ slides[currentSlide].highlight }}
                  </span>
                </h2>
                
                <p class="text-lg text-gray-300 leading-relaxed max-w-xl">
                  {{ slides[currentSlide].description }}
                </p>
                
                <!-- Topics -->
                <div class="flex flex-wrap gap-3">
                  <div 
                    v-for="(topic, idx) in slides[currentSlide].topics" 
                    :key="idx"
                    class="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white backdrop-blur-sm hover:bg-white/10 transition-colors"
                  >
                    <component :is="topic.icon" class="w-5 h-5" :class="topic.color" />
                    <span>{{ topic.text }}</span>
                  </div>
                </div>

              </div>
              
              <!-- Info Right -->
              <div class="lg:pl-10">
                <div class="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
                   <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   
                   <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
                      <MapPinIcon class="w-6 h-6" :style="{ color: slides[currentSlide].theme.accent }" />
                      Session Details
                   </h3>
                   
                   <div class="space-y-6 relative z-10">
                      <div class="flex items-start gap-4">
                         <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                            <CalendarIcon class="w-5 h-5" :style="{ color: slides[currentSlide].theme.accent }" />
                         </div>
                         <div>
                            <p class="text-xs uppercase font-bold text-gray-400 mb-1">When</p>
                            <p class="text-white font-medium">{{ slides[currentSlide].details.days }}</p>
                         </div>
                      </div>
                      
                      <div class="flex items-start gap-4">
                         <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                            <ClockIcon class="w-5 h-5" :style="{ color: slides[currentSlide].theme.secondary }" />
                         </div>
                         <div>
                            <p class="text-xs uppercase font-bold text-gray-400 mb-1">Time</p>
                            <p class="text-white font-medium">{{ slides[currentSlide].details.time }}</p>
                         </div>
                      </div>
                      
                      <div class="flex items-start gap-4 pt-4 border-t border-white/10">
                          <div>
                            <p class="text-xs uppercase font-bold text-gray-400 mb-1">Where</p>
                            <p class="text-white font-bold text-lg">{{ slides[currentSlide].details.location }}</p>
                            <p class="text-sm text-gray-400">(Physical Office)</p>
                          </div>
                      </div>
                   </div>
                </div>
              </div>
              
            </div>
          </div>
        </transition>
      </div>

      <!-- Controls -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <button 
          @click="prevSlide"
          class="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
        >
          <ChevronLeftIcon class="w-5 h-5" />
        </button>
        
        <div class="flex gap-2">
          <button
            v-for="(_, index) in slides"
            :key="index"
            @click="goToSlide(index)"
            class="w-2.5 h-2.5 rounded-full transition-all duration-300"
            :class="currentSlide === index ? 'bg-white w-8' : 'bg-white/30 hover:bg-white/50'"
          ></button>
        </div>

        <button 
          @click="nextSlide"
          class="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
        >
          <ChevronRightIcon class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>
