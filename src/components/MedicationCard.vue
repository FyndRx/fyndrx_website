<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import LazyImage from '@/components/LazyImage.vue';
import RatingStars from '@/components/RatingStars.vue';
import { reviewService } from '@/services/reviewService';

interface Props {
  medication: {
    id: number;
    name: string;
    description?: string | null;
    brands?: Array<{ id: number; name: string }>;
    forms?: Array<{
      id: number;
      form_name: string;
      strengths: Array<{
        id: number;
        strength: string;
        uoms: Array<{ id: number; uom: string }>;
      }>;
    }>;
    price?: number;
    discount_price?: number;
    image?: string;
    pharmacy_count?: number;
  };
  variant?: 'simple' | 'detailed' | 'coupon';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'detailed'
});

const router = useRouter();
const rating = ref<{ average: number; count: number }>({ average: 0, count: 0 });

const loadRating = async () => {
  try {
    const stats = await reviewService.getReviewStats('medication', props.medication.id);
    rating.value = {
      average: stats.averageRating || 0,
      count: stats.totalReviews || 0
    };
  } catch (err) {
    console.error('Error loading medication rating:', err);
  }
};

const medicationRating = computed(() => rating.value);

onMounted(() => {
  loadRating();
});

const discountPercentage = computed(() => {
  if (props.medication.price && props.medication.discount_price) {
    return Math.round((1 - props.medication.discount_price / props.medication.price) * 100);
  }
  return 0;
});

const handleClick = () => {
  router.push(`/medication/${props.medication.id}`);
};
</script>

<script lang="ts">
export default {
  name: 'MedicationCard'
};
</script>

<template>
  <!-- Simple List View -->
  <div 
    v-if="variant === 'simple'" 
    class="inline-flex gap-2 items-center px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm transition-all cursor-pointer dark:bg-gray-800 hover:shadow-md dark:border-gray-700"
    @click="handleClick"
  >
    <div class="flex gap-2 items-center">
      <span class="font-medium text-gray-900 dark:text-white">{{ medication.name }}</span>
      <span v-if="medication.brands?.length" class="text-sm text-gray-500 dark:text-gray-400">
        ({{ medication.brands.map(brand => brand.name).join(', ') }})
      </span>
    </div>
    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </div>

  <!-- Detailed Card View -->
  <div 
    v-else-if="variant === 'detailed'" 
    class="overflow-hidden bg-white rounded-2xl shadow-lg cursor-pointer dark:bg-gray-800 hover-lift"
    @click="handleClick"
  >
    <!-- Drug Image -->
    <div class="relative h-48 bg-gray-100 dark:bg-gray-700">
      <LazyImage
        :src="medication.image || '/images/medications/default.jpg'"
        :alt="medication.name"
        aspectRatio="landscape"
        className="w-full h-full object-cover"
      />
      <div v-if="discountPercentage > 0" class="absolute top-4 right-4">
        <span class="px-3 py-1 rounded-full text-sm font-medium bg-[#246BFD]/10 text-[#246BFD]">
          {{ discountPercentage }}% OFF
        </span>
      </div>
    </div>

    <!-- Drug Info -->
    <div class="p-6">
      <h4 class="mb-2 text-xl font-medium text-gray-900 dark:text-white">
        {{ medication.name }}
      </h4>
      
      <!-- Pharmacy Availability -->
      <div v-if="medication.pharmacy_count !== undefined" class="flex items-center mb-3 space-x-2">
        <div class="flex items-center px-2 py-1 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
          <svg class="w-3.5 h-3.5 text-green-600 dark:text-green-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <span class="text-xs font-medium text-green-700 dark:text-green-300">
            Available at {{ medication.pharmacy_count }} {{ medication.pharmacy_count === 1 ? 'pharmacy' : 'pharmacies' }}
          </span>
        </div>
      </div>
      
      <div class="mb-3">
        <RatingStars 
          v-if="medicationRating.count > 0"
          :rating="medicationRating.average" 
          :count="medicationRating.count"
          :show-count="true"
          size="sm"
        />
        <span v-else class="text-sm text-gray-500 dark:text-gray-400">No reviews yet</span>
      </div>

      <p v-if="medication.description" class="mb-4 text-gray-600 dark:text-gray-300">
        {{ medication.description }}
      </p>

      <!-- Price -->
      <div v-if="medication.price && medication.discount_price" class="flex items-center mb-4 space-x-2">
        <span class="text-2xl font-bold text-[#246BFD]">
          Ghc{{ medication.discount_price.toFixed(2) }}
        </span>
        <span class="text-lg text-gray-500 line-through">
          Ghc{{ medication.price.toFixed(2) }}
        </span>
      </div>

      <!-- Brands -->
      <div v-if="medication.brands?.length" class="mb-4">
        <h5 class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          Available Brands
        </h5>
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="brand in medication.brands" 
            :key="brand.id"
            class="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300"
          >
            {{ brand.name }}
          </span>
        </div>
      </div>

      <!-- Forms -->
      <div v-if="medication.forms?.length">
        <h5 class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          Available Forms
        </h5>
        <div class="space-y-2">
          <div 
            v-for="form in medication.forms" 
            :key="form.id"
            class="p-3 bg-gray-50 rounded-lg dark:bg-gray-700"
          >
            <div class="mb-1 font-medium text-gray-900 dark:text-white">
              {{ form.form_name }}
            </div>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="strength in form.strengths" 
                :key="strength.id"
                class="px-2 py-1 rounded-full text-xs bg-[#246BFD]/10 text-[#246BFD]"
              >
                {{ strength.strength }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Coupon Card View -->
  <div 
    v-else 
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover-lift border-2 border-dashed border-[#246BFD] cursor-pointer"
    @click="handleClick"
  >
    <div class="p-6">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h4 class="mb-1 text-xl font-medium text-gray-900 dark:text-white">
            {{ medication.name }}
          </h4>
          <p v-if="medication.brands?.length" class="text-sm text-gray-500 dark:text-gray-400">
            {{ medication.brands.map(brand => brand.name).join(', ') }}
          </p>
        </div>
        <div v-if="discountPercentage > 0" class="text-right">
          <span class="block text-3xl font-bold text-[#246BFD]">{{ discountPercentage }}%</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">OFF</span>
        </div>
      </div>

      <div class="flex justify-between items-center mb-4">
        <div v-if="medication.price && medication.discount_price">
          <span class="text-lg font-medium text-gray-900 dark:text-white">
            Ghc{{ medication.discount_price.toFixed(2) }}
          </span>
          <span class="ml-2 text-sm text-gray-500 line-through">
            Ghc{{ medication.price.toFixed(2) }}
          </span>
        </div>
        <button 
          class="px-4 py-2 rounded-full bg-[#246BFD] text-white text-sm font-medium hover:bg-[#5089FF] transition-colors"
          @click.stop="handleClick"
        >
          Get Coupon
        </button>
      </div>

      <div class="text-sm text-gray-500 dark:text-gray-400">
        <p>Valid until: {{ new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString() }}</p>
        <p class="mt-1">Terms and conditions apply</p>
      </div>
    </div>
  </div>
</template>

<style scoped>

.hover-lift {
  transition: transform 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-5px);
}
</style> 