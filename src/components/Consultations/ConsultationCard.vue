<script setup lang="ts">
import { computed } from 'vue';
import type { Consultation } from '@/types/consultation';
import { format } from 'date-fns';
import Badge from '@/components/Badge.vue';
import Card from '@/components/Card.vue';
import Button from '@/components/Button.vue';

const props = defineProps<{
  consultation: Consultation;
}>();

const emit = defineEmits(['view', 'cancel']);

const statusColor = computed(() => {
  switch (props.consultation.status) {
    case 'pending': return 'warning';
    case 'in_review': return 'primary';
    case 'responded': return 'success';
    case 'completed': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
});

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
  return format(new Date(props.consultation.created_at), 'MMM d, yyyy h:mm a');
});
</script>

<template>
  <Card class="hover:shadow-md transition-shadow duration-200">
    <div class="p-4">
      <div class="flex justify-between items-start mb-3">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-sm text-gray-500">#{{ consultation.consultation_number }}</span>
            <Badge :variant="statusColor" size="sm">{{ consultation.status.replace('_', ' ') }}</Badge>
          </div>
          <h3 class="font-semibold text-lg text-gray-900">{{ consultation.subject }}</h3>
        </div>
        <Badge :variant="priorityColor" size="sm">{{ consultation.priority }}</Badge>
      </div>

      <div class="space-y-2 text-sm text-gray-600 mb-4">
        <div class="flex items-center gap-2">
          <span class="i-heroicons-calendar w-4 h-4"></span>
          <span>{{ formattedDate }}</span>
        </div>
        <div class="flex items-center gap-2" v-if="consultation.pharmacy">
          <span class="i-heroicons-building-storefront w-4 h-4"></span>
          <span>{{ consultation.pharmacy.name }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="i-heroicons-user w-4 h-4"></span>
          <span>{{ consultation.patient_name }}</span>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-gray-100">
        <Button 
          v-if="consultation.status === 'pending'"
          variant="secondary" 
          size="small" 
          @click="$emit('cancel', consultation)"
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          size="small"
          @click="$emit('view', consultation)"
        >
          View Details
        </Button>
      </div>
    </div>
  </Card>
</template>
