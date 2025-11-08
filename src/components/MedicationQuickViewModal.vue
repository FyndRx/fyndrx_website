<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { dataService } from '@/services/dataService';
import type { Medication } from '@/models/Medication';
import LazyImage from './LazyImage.vue';
import FavoriteButton from './FavoriteButton.vue';

interface Props {
  show: boolean;
  medicationId: number | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const router = useRouter();
const medication = ref<Medication | null>(null);
const loading = ref(false);

const loadMedication = async () => {
  if (!props.medicationId) return;
  
  loading.value = true;
  try {
    const med = dataService.getMedicationById(props.medicationId);
    medication.value = med || null;
  } finally {
    loading.value = false;
  }
};

const viewFullDetails = () => {
  if (medication.value) {
    router.push({ name: 'MedicationDetail', params: { id: medication.value.id } });
    emit('close');
  }
};

watch(() => props.show, (newVal) => {
  if (newVal && props.medicationId) {
    loadMedication();
  }
});

watch(() => props.medicationId, () => {
  if (props.show && props.medicationId) {
    loadMedication();
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div
          class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
          @click.stop
        >
          <button
            @click="emit('close')"
            class="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          <div v-if="loading" class="flex items-center justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD]"></div>
          </div>

          <div v-else-if="medication" class="p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div class="relative mb-4">
                  <LazyImage
                    :src="medication.image"
                    :alt="medication.drug_name"
                    aspectRatio="square"
                    className="w-full h-80 object-cover rounded-xl"
                  />
                  <div class="absolute top-4 right-4">
                    <FavoriteButton
                      type="medication"
                      :item-id="medication.id"
                      size="large"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div class="flex items-start gap-3 mb-4">
                  <span class="inline-block px-3 py-1 text-sm font-medium rounded-full bg-[#246BFD]/10 text-[#246BFD]">
                    {{ medication.category }}
                  </span>
                  <span 
                    v-if="medication.requiresPrescription" 
                    class="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                  >
                    Rx Required
                  </span>
                </div>

                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {{ medication.drug_name }}
                </h2>

                <p class="text-gray-700 dark:text-gray-300 mb-6">
                  {{ medication.description }}
                </p>

                <div class="space-y-4 mb-6">
                  <div>
                    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Available Forms</h3>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="form in medication.forms.slice(0, 4)"
                        :key="form.id"
                        class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                      >
                        {{ form.form_name }}
                      </span>
                      <span v-if="medication.forms.length > 4" class="px-3 py-1 text-sm text-gray-500">
                        +{{ medication.forms.length - 4 }} more
                      </span>
                    </div>
                  </div>

                  <div v-if="medication.brands.length > 0">
                    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Available Brands</h3>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="brand in medication.brands.slice(0, 3)"
                        :key="brand.id"
                        class="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full"
                      >
                        {{ brand.name }}
                      </span>
                      <span v-if="medication.brands.length > 3" class="px-3 py-1 text-sm text-gray-500">
                        +{{ medication.brands.length - 3 }} more
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex gap-3">
                  <button
                    @click="viewFullDetails"
                    class="flex-1 px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all duration-300 shadow-lg hover:shadow-xl"
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
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.9);
}
</style>

