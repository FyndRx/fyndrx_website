<script setup lang="ts">
import { ref } from 'vue';
import { dataService } from '@/services/dataService';
import type { Medication } from '@/models/Medication';
import LazyImage from './LazyImage.vue';

const comparisonList = ref<Medication[]>([]);
const showModal = ref(false);

export interface MedicationComparisonService {
  addToComparison: (medicationId: number) => void;
  removeFromComparison: (medicationId: number) => void;
  isInComparison: (medicationId: number) => boolean;
  getCount: () => number;
  openComparison: () => void;
}

const addToComparison = (medicationId: number) => {
  if (comparisonList.value.length >= 4) {
    return;
  }
  
  const medication = dataService.getMedicationById(medicationId);
  if (medication && !isInComparison(medicationId)) {
    comparisonList.value.push(medication);
  }
};

const removeFromComparison = (medicationId: number) => {
  comparisonList.value = comparisonList.value.filter(m => m.id !== medicationId);
};

const isInComparison = (medicationId: number): boolean => {
  return comparisonList.value.some(m => m.id === medicationId);
};

const getCount = (): number => {
  return comparisonList.value.length;
};

const openComparison = () => {
  showModal.value = true;
};

const clearAll = () => {
  comparisonList.value = [];
  showModal.value = false;
};

defineExpose({
  addToComparison,
  removeFromComparison,
  isInComparison,
  getCount,
  openComparison
});
</script>

<template>
  <div>
    <Transition name="float-up">
      <div
        v-if="comparisonList.length > 0"
        class="fixed bottom-6 right-6 z-40 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 max-w-sm"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="p-2 bg-[#246BFD]/10 rounded-lg">
              <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <span class="font-semibold text-gray-900 dark:text-white">
              Compare ({{ comparisonList.length }}/4)
            </span>
          </div>
          <button
            @click="clearAll"
            class="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
          >
            Clear
          </button>
        </div>

        <div class="space-y-2 mb-3">
          <div
            v-for="medication in comparisonList"
            :key="medication.id"
            class="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <img :src="medication.image" :alt="medication.drug_name" class="w-10 h-10 rounded object-cover" />
            <span class="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ medication.drug_name }}
            </span>
            <button
              @click="removeFromComparison(medication.id)"
              class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <button
          @click="openComparison"
          :disabled="comparisonList.length < 2"
          class="w-full px-4 py-2 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Compare Now
        </button>
      </div>
    </Transition>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          @click.self="showModal = false"
        >
          <div
            class="relative w-full max-w-7xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 my-8"
            @click.stop
          >
            <button
              @click="showModal = false"
              class="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Medication Comparison
            </h2>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b-2 border-gray-200 dark:border-gray-700">
                    <th class="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Feature</th>
                    <th
                      v-for="medication in comparisonList"
                      :key="medication.id"
                      class="p-4 text-center"
                    >
                      <div class="flex flex-col items-center gap-2">
                        <LazyImage
                          :src="medication.image"
                          :alt="medication.drug_name"
                          aspectRatio="square"
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <span class="font-semibold text-gray-900 dark:text-white">
                          {{ medication.drug_name }}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <td class="p-4 font-medium text-gray-700 dark:text-gray-300">Category</td>
                    <td
                      v-for="medication in comparisonList"
                      :key="`cat-${medication.id}`"
                      class="p-4 text-center"
                    >
                      <span class="inline-block px-3 py-1 text-sm rounded-full bg-[#246BFD]/10 text-[#246BFD]">
                        {{ medication.category }}
                      </span>
                    </td>
                  </tr>

                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <td class="p-4 font-medium text-gray-700 dark:text-gray-300">Prescription Required</td>
                    <td
                      v-for="medication in comparisonList"
                      :key="`rx-${medication.id}`"
                      class="p-4 text-center"
                    >
                      <span
                        v-if="medication.requiresPrescription"
                        class="inline-flex items-center px-3 py-1 text-sm rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                      >
                        Yes
                      </span>
                      <span
                        v-else
                        class="inline-flex items-center px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        No
                      </span>
                    </td>
                  </tr>

                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <td class="p-4 font-medium text-gray-700 dark:text-gray-300">Available Forms</td>
                    <td
                      v-for="medication in comparisonList"
                      :key="`forms-${medication.id}`"
                      class="p-4 text-center"
                    >
                      <div class="flex flex-wrap gap-1 justify-center">
                        <span
                          v-for="form in medication.forms.slice(0, 3)"
                          :key="form.id"
                          class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                        >
                          {{ form.form_name }}
                        </span>
                        <span v-if="medication.forms.length > 3" class="text-xs text-gray-500">
                          +{{ medication.forms.length - 3 }}
                        </span>
                      </div>
                    </td>
                  </tr>

                  <tr class="border-b border-gray-200 dark:border-gray-700">
                    <td class="p-4 font-medium text-gray-700 dark:text-gray-300">Brands</td>
                    <td
                      v-for="medication in comparisonList"
                      :key="`brands-${medication.id}`"
                      class="p-4 text-center"
                    >
                      <span class="text-sm text-gray-600 dark:text-gray-400">
                        {{ medication.brands.length }} brand{{ medication.brands.length !== 1 ? 's' : '' }}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td class="p-4 font-medium text-gray-700 dark:text-gray-300">Description</td>
                    <td
                      v-for="medication in comparisonList"
                      :key="`desc-${medication.id}`"
                      class="p-4 text-center text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span class="line-clamp-2">{{ medication.description }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.float-up-enter-active,
.float-up-leave-active {
  transition: all 0.3s ease;
}

.float-up-enter-from,
.float-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

