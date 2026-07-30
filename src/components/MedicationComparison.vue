<script setup lang="ts">
import { useMedicationComparison } from '@/composables/useMedicationComparison';
import ComparisonTray from '@/components/Comparison/ComparisonTray.vue';
import ComparisonModal from '@/components/Comparison/ComparisonModal.vue';

const {
  comparisonList,
  comparisonModalOpen,
  loadingPrices,
  lowestPrice,
  gridCols,
  clearAll,
  removeFromComparison,
  openComparison,
  closeComparison,
  viewMedication,
  getCategoryNames,
  effectivePrice,
  isBestValue,
  isMostAvailable,
  pharmaciesFor,
  effectivePriceFor,
} = useMedicationComparison();
</script>

<template>
  <div>
    <ComparisonTray
      :comparison-list="comparisonList"
      @clear-all="clearAll"
      @remove="removeFromComparison"
      @open="openComparison"
    />

    <ComparisonModal
      :open="comparisonModalOpen"
      :comparison-list="comparisonList"
      :grid-cols="gridCols"
      :loading-prices="loadingPrices"
      :lowest-price="lowestPrice"
      :is-best-value="isBestValue"
      :is-most-available="isMostAvailable"
      :effective-price="effectivePrice"
      :effective-price-for="effectivePriceFor"
      :pharmacies-for="pharmaciesFor"
      :get-category-names="getCategoryNames"
      @close="closeComparison"
      @view="viewMedication"
    />
  </div>
</template>
