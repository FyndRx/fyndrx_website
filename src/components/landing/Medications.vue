<script setup lang="ts">
import { ref, onMounted } from 'vue';

const searchQuery = ref('');
const searchResults = ref([]);
const popularDrugs = ref([
  {
    id: 1,
    name: 'Amoxicillin',
    image: '/src/assets/images/medications/amoxicillin.jpg',
    description: 'Antibiotic used to treat bacterial infections',
    price: 25.99,
    discountPrice: 19.99,
    brands: ['Amoxil', 'Trimox'],
    forms: [
      {
        name: 'Capsules',
        strengths: ['250mg', '500mg']
      },
      {
        name: 'Suspension',
        strengths: ['125mg/5ml', '250mg/5ml']
      }
    ]
  },
  {
    id: 2,
    name: 'Ibuprofen',
    image: '/src/assets/images/medications/ibuprofen.jpg',
    description: 'Nonsteroidal anti-inflammatory drug (NSAID) used to reduce pain and inflammation',
    price: 15.99,
    discountPrice: 12.99,
    brands: ['Advil', 'Motrin'],
    forms: [
      {
        name: 'Tablets',
        strengths: ['200mg', '400mg', '600mg']
      },
      {
        name: 'Liquid',
        strengths: ['100mg/5ml']
      }
    ]
  },
  {
    id: 3,
    name: 'Omeprazole',
    image: '/src/assets/images/medications/omeprazole.jpg',
    description: 'Proton pump inhibitor used to reduce stomach acid production',
    price: 35.99,
    discountPrice: 29.99,
    brands: ['Prilosec', 'Losec'],
    forms: [
      {
        name: 'Capsules',
        strengths: ['10mg', '20mg', '40mg']
      },
      {
        name: 'Tablets',
        strengths: ['20mg']
      }
    ]
  }
]);

const handleSearch = () => {
  // TODO: Implement actual search functionality
  console.log('Searching for:', searchQuery.value);
};

const isVisible = ref(false);

onMounted(() => {
  isVisible.value = true;
});
</script>

<script lang="ts">
export default {
  name: 'Medications'
};
</script>

<template>
  <section class="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-16 scroll-animate slide-up">
        <h2 class="text-4xl font-medium text-gray-900 dark:text-white mb-4">
          Find Your <span class="text-[#246BFD]">Medications</span>
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Search and compare prices for your medications
        </p>
      </div>

      <!-- Search Bar -->
      <div class="max-w-2xl mx-auto mb-16 scroll-animate slide-up delay-200">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search medications..."
            class="w-full px-6 py-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#246BFD] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            @keyup.enter="handleSearch"
          />
          <button 
            class="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 rounded-full bg-[#246BFD] text-white hover:bg-[#5089FF] transition-colors"
            @click="handleSearch"
          >
            Find CARE
          </button>
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="mb-16">
        <!-- Search results will be displayed here -->
      </div>

      <!-- Popular Medications -->
      <div class="scroll-animate slide-up delay-300">
        <h3 class="text-2xl font-medium text-gray-900 dark:text-white mb-8 text-center">
          Popular Medications
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="drug in popularDrugs" 
            :key="drug.id"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover-lift"
          >
            <!-- Drug Image -->
            <div class="relative h-48 bg-gray-100 dark:bg-gray-700">
              <img 
                :src="drug.image" 
                :alt="drug.name"
                class="w-full h-full object-cover"
              />
              <div class="absolute top-4 right-4">
                <span class="px-3 py-1 rounded-full text-sm font-medium bg-[#246BFD]/10 text-[#246BFD]">
                  {{ Math.round((1 - drug.discountPrice / drug.price) * 100) }}% OFF
                </span>
              </div>
            </div>

            <!-- Drug Info -->
            <div class="p-6">
              <h4 class="text-xl font-medium text-gray-900 dark:text-white mb-2">
                {{ drug.name }}
              </h4>
              <p class="text-gray-600 dark:text-gray-300 mb-4">
                {{ drug.description }}
              </p>

              <!-- Price -->
              <div class="flex items-center space-x-2 mb-4">
                <span class="text-2xl font-bold text-[#246BFD]">
                  ${{ drug.discountPrice.toFixed(2) }}
                </span>
                <span class="text-lg text-gray-500 line-through">
                  ${{ drug.price.toFixed(2) }}
                </span>
              </div>

              <!-- Brands -->
              <div class="mb-4">
                <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Available Brands
                </h5>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="brand in drug.brands" 
                    :key="brand"
                    class="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    {{ brand }}
                  </span>
                </div>
              </div>

              <!-- Forms -->
              <div>
                <h5 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Available Forms
                </h5>
                <div class="space-y-2">
                  <div 
                    v-for="form in drug.forms" 
                    :key="form.name"
                    class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                  >
                    <div class="font-medium text-gray-900 dark:text-white mb-1">
                      {{ form.name }}
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <span 
                        v-for="strength in form.strengths" 
                        :key="strength"
                        class="px-2 py-1 rounded-full text-xs bg-[#246BFD]/10 text-[#246BFD]"
                      >
                        {{ strength }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hover-lift {
  transition: transform 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-5px);
}

.scroll-animate {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.scroll-animate.slide-up {
  opacity: 1;
  transform: translateY(0);
}

.delay-200 {
  transition-delay: 200ms;
}

.delay-300 {
  transition-delay: 300ms;
}
</style> 