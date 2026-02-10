<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { StarIcon } from '@heroicons/vue/24/solid';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import Button from '@/components/Button.vue';

interface Testimony {
  id: string;
  name: string;
  role: string | null;
  location: string | null;
  avatar: string | null;
  rating: number;
  testimony: string;
  date: string;
  verified: boolean;
}

const testimonies = ref<Testimony[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const carouselRef = ref<HTMLElement | null>(null);

// Modal State
const isModalOpen = ref(false);
const isSubmitting = ref(false);
const submissionSuccess = ref(false);
const showSuccessToast = ref(false);
const form = ref({
  name: '',
  role: '',
  location: '',
  rating: 5,
  testimony: ''
});

// Fetch Testimonies
const fetchTestimonies = async () => {
  try {
    isLoading.value = true;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/testimonies?page=1`, {
        headers: {
            'X-API-Key': import.meta.env.VITE_API_KEY as string
        }
    });
    
    if (!response.ok) throw new Error('Failed to fetch testimonies');
    
    const data = await response.json();
    testimonies.value = data.data;
  } catch (err) {
    console.error('Error fetching testimonies:', err);
    error.value = 'Failed to load stories.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchTestimonies();
});

// Carousel Logic
const scroll = (direction: 'left' | 'right') => {
  if (!carouselRef.value) return;
  const scrollAmount = 400; // Widget width + gap
  if (direction === 'left') {
    carouselRef.value.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  } else {
    carouselRef.value.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
};

// Form Submission
const submitTestimony = async () => {
    if (!form.value.name || !form.value.testimony) return;

    try {
        isSubmitting.value = true;
        const response = await fetch(`${import.meta.env.VITE_API_URL}/testimonies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': import.meta.env.VITE_API_KEY as string
            },
            body: JSON.stringify(form.value)
        });

        if (!response.ok) throw new Error('Submission failed');

        submissionSuccess.value = true;
        showSuccessToast.value = true;
        
        // Reset and close after delay
        setTimeout(() => {
            isModalOpen.value = false;
            submissionSuccess.value = false;
            form.value = { name: '', role: '', location: '', rating: 5, testimony: '' };
        }, 2000);
        
        setTimeout(() => {
             showSuccessToast.value = false;
        }, 4000);

    } catch (err) {
        console.error('Error submitting:', err);
        // Handle error (maybe toast)
    } finally {
        isSubmitting.value = false;
    }
};

</script>

<template>
  <section class="py-24 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
     <!-- Background Decor -->
     <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 dark:bg-blue-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
     <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-100/50 dark:bg-orange-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>


    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div class="max-w-2xl">
          <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Stories from our <span class="text-[#246BFD]">Community</span>
          </h2>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
            See how FyndRx is making healthcare accessible for people across Ghana.
          </p>
        </div>
        
        <div class="flex items-center gap-4">
             <button @click="isModalOpen = true" class="px-6 py-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                Share Your Story
             </button>
             
             <!-- Nav Buttons -->
             <div class="flex gap-2">
                <button @click="scroll('left')" class="p-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-[#246BFD] hover:border-[#246BFD] transition-all">
                    <ChevronLeftIcon class="w-5 h-5" />
                </button>
                <button @click="scroll('right')" class="p-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-[#246BFD] hover:border-[#246BFD] transition-all">
                    <ChevronRightIcon class="w-5 h-5" />
                </button>
             </div>
        </div>
      </div>

      <!-- Testimonies Carousel -->
      <div 
        ref="carouselRef"
        class="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
        style="scrollbar-width: none; -ms-overflow-style: none;"
      >
        <!-- Loading State -->
        <template v-if="isLoading">
            <div v-for="n in 3" :key="n" class="min-w-[350px] md:min-w-[400px] bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700/50 shadow-sm animate-pulse">
                <div class="flex items-center gap-4 mb-6">
                    <div class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div class="space-y-2">
                        <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div class="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
                <div class="space-y-2">
                    <div class="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div class="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div class="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        </template>

        <!-- Cards -->
        <div 
          v-for="story in testimonies" 
          :key="story.id"
          class="min-w-[300px] md:min-w-[400px] snap-start bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <div>
              <!-- Rating -->
              <div class="flex gap-1 mb-6">
                 <StarIcon v-for="i in 5" :key="i" class="w-5 h-5" :class="i <= story.rating ? 'text-[#FE9615]' : 'text-gray-200 dark:text-gray-700'" />
              </div>
              
              <!-- Content -->
              <p class="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
                "{{ story.testimony }}"
              </p>
          </div>

          <!-- Author -->
          <div class="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
             <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#246BFD] to-[#5089FF] flex items-center justify-center text-white font-bold text-lg shrink-0">
                {{ story.name.charAt(0) }}
             </div>
             <div>
                <h4 class="font-bold text-gray-900 dark:text-white">{{ story.name }}</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                   <span v-if="story.role">{{ story.role }}</span>
                   <span v-if="story.role && story.location">•</span>
                   <span v-if="story.location">{{ story.location }}</span>
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Submission Modal -->
    <transition enter-active-class="duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="isModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            
            <div 
               class="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform transition-all"
               @click.stop
            >
               <!-- Header -->
               <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                   <h3 class="text-lg font-bold text-gray-900 dark:text-white">Share Your Story</h3>
                   <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                       <XMarkIcon class="w-6 h-6" />
                   </button>
               </div>
               
               <!-- Success State -->
                <div v-if="submissionSuccess" class="p-12 text-center">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckIcon class="w-8 h-8 text-green-600" />
                    </div>
                    <h4 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h4>
                    <p class="text-gray-500 dark:text-gray-400">Your story has been submitted for review.</p>
                </div>

               <!-- Form -->
               <div v-else class="p-6 space-y-4">
                  <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
                      <input v-model="form.name" type="text" class="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-[#246BFD] outline-none transition-all dark:text-white" placeholder="First Name Last Name" />
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                      <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role (Optional)</label>
                          <input v-model="form.role" type="text" class="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-[#246BFD] outline-none transition-all dark:text-white" placeholder="e.g. Patient" />
                      </div>
                      <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location (Optional)</label>
                          <input v-model="form.location" type="text" class="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-[#246BFD] outline-none transition-all dark:text-white" placeholder="Average City" />
                      </div>
                  </div>

                  <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                      <div class="flex gap-2">
                          <button 
                             v-for="star in 5" 
                             :key="star"
                             @click="form.rating = star"
                             type="button"
                             class="transition-transform hover:scale-110 focus:outline-none"
                          >
                             <StarIcon class="w-8 h-8 transition-colors" :class="star <= form.rating ? 'text-[#FE9615]' : 'text-gray-200 dark:text-gray-700'" />
                          </button>
                      </div>
                  </div>

                  <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Experience</label>
                      <textarea v-model="form.testimony" rows="4" class="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-[#246BFD] outline-none transition-all resize-none dark:text-white" placeholder="Share your experience..."></textarea>
                  </div>
               </div>

               <!-- Footer Actions -->
               <div v-if="!submissionSuccess" class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                   <button @click="isModalOpen = false" class="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium">Cancel</button>
                   <Button 
                      @click="submitTestimony" 
                      :disabled="isSubmitting || !form.name || !form.testimony"
                      class="!px-6 !py-2 !h-auto !text-sm"
                   >
                       <span v-if="isSubmitting">Submitting...</span>
                       <span v-else>Submit Story</span>
                   </Button>
               </div>
            </div>
        </div>
    </transition>
    
    <!-- Toast (Optional, if global toast not available) -->
    <!-- Assuming global setup, but adding local for surety -->
  </section>
</template>

<style scoped>
/* Hide scrollbar */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
</style>
