<script setup lang="ts">
import { computed } from 'vue';
import type { Consultation } from '@/types/consultation';
import { format } from 'date-fns';
import Badge from '@/components/Badge.vue';
import Button from '@/components/Button.vue';
import { CalendarIcon, BuildingStorefrontIcon, UserIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  consultation: Consultation;
}>();

defineEmits(['view', 'cancel']);

const priorityColor = computed(() => {
  switch (props.consultation.priority) {
    case 'urgent': return 'error';
    case 'high': return 'warning';
    case 'normal': return 'primary';
    case 'low': return 'default';
    default: return 'default';
  }
});

const formattedDate = computed(() => {
  try {
    const date = new Date(props.consultation.created_at);
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, 'MMM d, yyyy h:mm a');
  } catch (e) {
    return 'N/A';
  }
});
</script>

<template>
  <div 
    class="group relative bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
  >
    <!-- Status Accent Bar -->
    <div 
      class="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300"
      :class="{
        'bg-yellow-400': consultation.status === 'pending',
        'bg-blue-500': consultation.status === 'in_review',
        'bg-green-500': consultation.status === 'responded' || consultation.status === 'completed',
        'bg-red-500': consultation.status === 'cancelled',
        'bg-gray-300': !consultation.status
      }"
    ></div>

    <div class="pl-3">
      <!-- Header -->
      <div class="flex justify-between items-start mb-3">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-xs font-bold tracking-wider text-gray-400 uppercase">#{{ consultation.consultation_number }}</span>
            <span 
              class="flex h-2 w-2 rounded-full" 
              :class="{
                 'bg-yellow-400': consultation.status === 'pending',
                 'bg-blue-500': consultation.status === 'in_review',
                 'bg-green-500': consultation.status === 'responded' || consultation.status === 'completed',
                 'bg-red-500': consultation.status === 'cancelled',
                 'bg-gray-300': !consultation.status
              }"
            ></span>
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">{{ consultation.status?.replace('_', ' ') || 'Unknown' }}</span>
          </div>
          <h3 class="font-bold text-lg text-gray-900 dark:text-white group-hover:text-[#246BFD] transition-colors line-clamp-1">
            {{ consultation.subject }}
          </h3>
        </div>
        <Badge :variant="priorityColor" size="sm" class="uppercase text-[10px] tracking-wide">{{ consultation.priority }}</Badge>
      </div>

      <!-- Info Grid -->
      <div class="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 dark:text-gray-300 mb-5">
        <div class="flex items-center gap-2">
          <CalendarIcon class="w-4 h-4 text-gray-400" />
          <span class="truncate">{{ formattedDate }}</span>
        </div>
        <div class="flex items-center gap-2">
          <UserIcon class="w-4 h-4 text-gray-400" />
          <span class="truncate">{{ consultation.patient_name }}</span>
        </div>
        <div class="flex items-center gap-2 col-span-2" v-if="consultation.pharmacy">
          <BuildingStorefrontIcon class="w-4 h-4 text-gray-400" />
          <span class="truncate">{{ consultation.pharmacy.name }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-gray-50 dark:border-gray-700/50">
        <Button 
          v-if="consultation.status === 'pending'"
          variant="secondary" 
          size="small" 
          @click.stop="$emit('cancel', consultation)"
          class="!px-3 !py-1.5 text-xs font-medium dark:bg-transparent dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-400 dark:hover:text-white hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          title="Cancel Consultation"
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          size="small"
          @click="$emit('view', consultation)"
          class="!px-4 !py-1.5 text-xs font-medium shadow-none hover:shadow-md"
          title="View Consultation Details"
        >
          View Details
        </Button>
      </div>
    </div>
  </div>
</template>
