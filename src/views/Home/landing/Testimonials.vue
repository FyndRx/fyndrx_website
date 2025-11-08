<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';

const { registerElement } = useScrollAnimation();

onMounted(() => {
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
});

const testimonials = ref([
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Regular Customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    rating: 5,
    text: 'FyndRx has made getting my prescriptions so much easier! I can compare prices, upload my prescription, and have it delivered to my door. Absolutely fantastic service!',
    location: 'Accra, Ghana'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Chronic Medication User',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    rating: 5,
    text: 'As someone who needs regular refills, the order tracking and reminder features are life-changing. I never miss a refill now, and the prices are very competitive!',
    location: 'Kumasi, Ghana'
  },
  {
    id: 3,
    name: 'Aisha Mohammed',
    role: 'Working Professional',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    rating: 5,
    text: 'The verified pharmacy network gives me peace of mind. I know I\'m getting genuine medications every time. Customer support is also excellent - very responsive!',
    location: 'Tema, Ghana'
  },
  {
    id: 4,
    name: 'David Okafor',
    role: 'Small Business Owner',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    rating: 5,
    text: 'I run a busy schedule and FyndRx fits perfectly into my lifestyle. Quick ordering, fast delivery, and transparent pricing. Couldn\'t ask for more!',
    location: 'Takoradi, Ghana'
  },
  {
    id: 5,
    name: 'Grace Adeyemi',
    role: 'Healthcare Worker',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop',
    rating: 5,
    text: 'Even as a healthcare professional, I use FyndRx for convenience. The platform is well-designed, secure, and the pharmacies are all properly licensed. Highly recommended!',
    location: 'Tamale, Ghana'
  },
  {
    id: 6,
    name: 'Emmanuel Obi',
    role: 'Senior Citizen',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    rating: 5,
    text: 'At my age, going to the pharmacy can be difficult. FyndRx has made it so much easier with home delivery. The app is simple to use, and my children help me place orders.',
    location: 'Cape Coast, Ghana'
  }
]);
</script>

<script lang="ts">
export default {
  name: 'Testimonials',
}
</script>

<template>
  <section class="py-20 bg-gray-50 dark:bg-gray-800">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="mb-16 text-center scroll-animate slide-up">
        <h2 class="mb-4 text-4xl font-medium text-gray-900 dark:text-white">
          What Our <span class="text-[#246BFD]">Customers</span> Say
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Real stories from real people who trust FyndRx
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(testimonial, index) in testimonials"
          :key="testimonial.id"
          class="scroll-animate slide-up"
          :class="`delay-${(index + 1) * 100}`"
        >
          <div class="h-full p-8 transition-all duration-300 bg-white shadow-lg dark:bg-gray-900 rounded-2xl hover:shadow-2xl hover:-translate-y-2">
            <div class="flex items-center mb-6">
              <img
                :src="testimonial.avatar"
                :alt="testimonial.name"
                class="w-16 h-16 mr-4 rounded-full"
              />
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">
                  {{ testimonial.name }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ testimonial.role }}
                </p>
                <div class="flex items-center mt-1">
                  <svg
                    v-for="star in testimonial.rating"
                    :key="star"
                    class="w-4 h-4 text-[#FE9615]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>

            <p class="mb-4 text-gray-600 dark:text-gray-300">
              "{{ testimonial.text }}"
            </p>

            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              {{ testimonial.location }}
            </div>
          </div>
        </div>
      </div>

      <div class="mt-16 text-center scroll-animate slide-up delay-700">
        <div class="inline-flex items-center p-4 space-x-4 bg-white shadow-lg dark:bg-gray-900 rounded-2xl">
          <div class="flex -space-x-4">
            <img
              v-for="i in 4"
              :key="i"
              :src="`https://i.pravatar.cc/100?img=${i}`"
              alt="Customer"
              class="w-12 h-12 border-4 border-white rounded-full dark:border-gray-900"
            />
          </div>
          <div class="text-left">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">10,000+</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Happy Customers</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scroll-animate {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.scroll-animate.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>



