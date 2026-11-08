<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { medicationService } from '@/services/medicationService';
import type { Medication } from '@/models/Medication';
import LazyImage from './LazyImage.vue';
import FavoriteButton from './FavoriteButton.vue';
import { formatCurrency } from '@/utils/currency';

interface Props {
  show: boolean;
  medicationId: number | null;
  brandId?: number | string;
  formId?: number | string;
  strengthId?: number | string;
  unitId?: number | string;
  uomId?: number | string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const router = useRouter();
const medication = ref<Medication | null>(null);
const loading = ref(false);
const closeButton = ref<HTMLButtonElement | null>(null);

// Categories arrive as objects ({ id, name, slug }), plain strings, or a legacy single string.
const categoryNames = computed<string[]>(() => {
  const raw = medication.value?.category;
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return (list as Array<string | { name: string }>)
    .map((c) => (typeof c === 'string' ? c : c?.name))
    .filter((n): n is string => !!n);
});

const forms = computed(() => medication.value?.forms ?? []);
const brands = computed(() => medication.value?.brands ?? []);

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close');
};

const loadMedication = async () => {
  if (!props.medicationId) {
    medication.value = null;
    return;
  }
  
  loading.value = true;
  try {
    medication.value = await medicationService.getMedicationById(props.medicationId);
  } catch (err) {
    console.error('Error loading medication:', err);
    medication.value = null;
  } finally {
    loading.value = false;
  }
};

const viewFullDetails = () => {
  if (medication.value) {
    const productId = medication.value.product_id || medication.value.id;
    router.push({ 
      path: `/medication/${productId}`
    });
    emit('close');
  }
};

// Watch for show prop changes
watch(() => props.show, async (isShowing) => {
  if (isShowing) {
    document.addEventListener('keydown', onKeydown);
    document.body.style.overflow = 'hidden';
    if (props.medicationId) loadMedication();
    await nextTick();
    closeButton.value?.focus();
  } else {
    document.removeEventListener('keydown', onKeydown);
    document.body.style.overflow = '';
    medication.value = null;
  }
});

// Watch for medicationId changes
watch(() => props.medicationId, (newId, oldId) => {
  if (props.show && newId && newId !== oldId) {
    loadMedication();
  } else if (!newId) {
    medication.value = null;
  }
});

onMounted(() => {
  if (props.show) {
    document.addEventListener('keydown', onKeydown);
    document.body.style.overflow = 'hidden';
    if (props.medicationId) loadMedication();
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Medication quick view"
          class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-float ring-1 ring-white/70 dark:bg-gray-900 dark:ring-white/10"
          @click.stop
        >
          <div class="sticky top-0 z-20 flex justify-end h-0 pr-4 pointer-events-none">
            <button
              ref="closeButton"
              type="button"
              @click="emit('close')"
              aria-label="Close quick view"
              class="flex justify-center items-center mt-4 w-10 h-10 text-gray-600 rounded-full ring-1 shadow-card backdrop-blur-md transition duration-200 pointer-events-auto bg-white/90 ring-gray-200 ease-out-quart dark:bg-gray-800/90 dark:text-gray-300 dark:ring-white/10 hover:bg-brand-500 hover:text-white hover:ring-transparent active:scale-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Skeleton -->
          <div v-if="loading" class="p-6 sm:p-8 animate-pulse">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Image -->
              <div class="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <!-- Details -->
              <div class="space-y-4">
                <div class="flex gap-2">
                  <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
                  <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                </div>
                <div class="h-9 bg-gray-200 dark:bg-gray-700 rounded-xl w-3/4"></div>
                <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-32"></div>
                <div class="space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                </div>
                <div class="flex gap-2 flex-wrap">
                  <div v-for="i in 3" :key="i" class="h-9 bg-gray-200 dark:bg-gray-700 rounded-xl w-20"></div>
                </div>
                <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-40"></div>
              </div>
            </div>
          </div>

          <div v-else-if="medication" class="p-6 sm:p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div class="relative mb-4">
                  <LazyImage
                    :src="medication.image"
                    :alt="medication.name"
                    aspectRatio="square"
                    className="w-full h-72 sm:h-80 object-cover rounded-2xl"
                  />
                  <div class="absolute right-3 bottom-3">
                    <FavoriteButton
                      type="medication"
                      :item-id="medication.id"
                      size="large"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div class="flex flex-wrap gap-2 items-start mb-4 pr-12">
                  <span 
                    v-for="name in categoryNames"
                    :key="name"
                    class="inline-block px-3 py-1 text-sm font-medium rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300"
                  >
                    {{ name }}
                  </span>
                  <span 
                    v-if="medication.requiresPrescription" 
                    class="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-accent-500/15 text-accent-700 dark:text-accent-300"
                  >
                    Rx Required
                  </span>
                </div>

                <h2 class="mb-3 text-2xl font-semibold text-gray-900 sm:text-3xl dark:text-white">
                  {{ medication.name }}
                </h2>

                <div class="flex items-center gap-3 mb-6 flex-wrap">
                  <div
                    v-if="medication.pharmacy_count !== undefined"
                    class="inline-flex items-center px-3 py-1 bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium rounded-full"
                  >
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Available at {{ medication.pharmacy_count }} {{ medication.pharmacy_count === 1 ? 'pharmacy' : 'pharmacies' }}
                  </div>

                  <div v-if="medication.price" class="flex items-center gap-2">
                    <span class="text-2xl font-bold text-brand-500 dark:text-brand-300">
                      {{ formatCurrency(medication.discount_price || medication.price) }}
                    </span>
                    <span v-if="medication.discount_price" class="text-lg text-gray-400 line-through">
                      {{ formatCurrency(medication.price) }}
                    </span>
                    <span
                      v-if="medication.discount_price"
                      class="px-2 py-0.5 text-xs font-bold rounded-full bg-green-500/10 text-green-700 dark:text-green-400"
                    >
                      -{{ medication.discount_percentage ? Math.round(medication.discount_percentage) : Math.round((1 - medication.discount_price / medication.price) * 100) }}%
                    </span>
                  </div>
                </div>

                <p class="text-gray-700 dark:text-gray-300 mb-6">
                  {{ medication.description }}
                </p>

                <div v-if="forms.length > 0 || brands.length > 0" class="mb-6 space-y-4">
                  <div v-if="forms.length > 0">
                    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Available Forms</h3>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="form in forms.slice(0, 4)"
                        :key="form.id"
                        class="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-full dark:bg-white/10 dark:text-gray-300"
                      >
                        {{ form.form_name }}
                      </span>
                      <span v-if="forms.length > 4" class="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">
                        +{{ forms.length - 4 }} more
                      </span>
                    </div>
                  </div>

                  <div v-if="brands.length > 0">
                    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Available Brands</h3>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="brand in brands.slice(0, 3)"
                        :key="brand.id"
                        class="px-3 py-1 text-sm rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300"
                      >
                        {{ brand.name }}
                      </span>
                      <span v-if="brands.length > 3" class="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">
                        +{{ brands.length - 3 }} more
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex gap-3">
                  <button
                    @click="viewFullDetails"
                    class="flex-1 px-6 py-3 font-medium text-white rounded-full shadow-glow-brand transition duration-200 bg-brand-500 ease-out-quart hover:bg-brand-600 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-20">
            <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-gray-600 dark:text-gray-400">Medication not found</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95) translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active > div,
  .modal-leave-active > div {
    transition: none;
  }
}
</style>

