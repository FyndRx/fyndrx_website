<script setup lang="ts">
import { defineProps } from 'vue';
import MedicationCardSkeleton from './MedicationCardSkeleton.vue';
import PharmacyCardSkeleton from './PharmacyCardSkeleton.vue';
import OrderCardSkeleton from './OrderCardSkeleton.vue';

interface Props {
  type: 'medication' | 'pharmacy' | 'order' | 'prescription';
  count?: number;
  columns?: 1 | 2 | 3;
}

const props = withDefaults(defineProps<Props>(), {
  count: 6,
  columns: 3
});

const getGridCols = () => {
  const colsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  };
  return colsMap[props.columns];
};

const getComponent = () => {
  const components = {
    medication: MedicationCardSkeleton,
    pharmacy: PharmacyCardSkeleton,
    order: OrderCardSkeleton,
    prescription: OrderCardSkeleton
  };
  return components[props.type];
};
</script>

<template>
  <div class="grid gap-6" :class="getGridCols()">
    <component 
      :is="getComponent()" 
      v-for="index in count" 
      :key="index"
    />
  </div>
</template>

