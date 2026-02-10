<script setup lang="ts">
import { computed } from 'vue';
import type { Consultation } from '@/types/consultation';
import { format } from 'date-fns';
import Badge from '@/components/Badge.vue';
import { 
  CalendarIcon, 
  BoltIcon, 
  PaperClipIcon, 
  ChevronRightIcon
} from '@heroicons/vue/24/outline';

const props = defineProps<{
  consultation: Consultation;
}>();

defineEmits(['view', 'cancel']);

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

const formattedDate = computed(() => {
  try {
    const date = new Date(props.consultation.created_at);
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, 'MMM d, yyyy');
  } catch (e) {
    return 'N/A';
  }
});
</script>

<template>
  <div 
    class="group relative bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full cursor-pointer"
    @click="$emit('view', consultation)"
  >
    <!-- Top Row: ID, Priority, Status -->
    <div class="flex justify-between items-start mb-4">
       <div class="flex items-center gap-2">
         <Badge 
             size="sm" 
             class="capitalize !rounded-full !px-3 font-bold shadow-sm"
             :variant="statusColor"
          >
             {{ consultation.status?.replace('_', ' ') || 'Unknown' }}
          </Badge>
          <!-- <span class="font-mono text-xs text-gray-400">#{{ consultation.consultation_number }}</span> -->
       </div>
       
       <div :title="`Priority: ${consultation.priority}`" class="flex items-center gap-1 px-2.5 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-full" :class="{
             'bg-red-50 text-red-600': consultation.priority === 'urgent',
             'bg-orange-50 text-orange-600': consultation.priority === 'high',
             'bg-blue-50 text-blue-600': consultation.priority === 'normal',
             'bg-gray-50 text-gray-600': consultation.priority === 'low'
          }">
             <BoltIcon class="w-3.5 h-3.5" />
             <span class="text-xs font-bold uppercase">{{ consultation.priority }}</span>
       </div>
    </div>

    <!-- Main Content: Subject -->
    <div class="mb-4">
      <h3 class="font-bold font-mono text-lg text-gray-900 dark:text-white group-hover:text-[#246BFD] transition-colors mb-2 line-clamp-2" :title="consultation.consultation_type_label || consultation.consultation_type">
         <!-- {{ consultation.consultation_type ? consultation.consultation_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General Consultation' }} -->
         #{{ consultation.consultation_number }}
      </h3>
       <div class="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
         <div class="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
           <CalendarIcon class="w-4 h-4" />
           {{ formattedDate }}
         </div>
         
         <div v-if="consultation.scheduled_at" class="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg">
           <CalendarIcon class="w-4 h-4" />
           Scheduled
         </div>

         <div v-if="consultation.consultation_type" class="px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700 capitalize">
            {{ consultation.consultation_type.replace('_', ' ') }}
         </div>
      </div>
    </div>

    <!-- Extra Data: Vitals Strip & Counts -->
    <div class="mt-auto pt-4 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between">
       
       <!-- Vitals Mini Summary -->
       <div 
         v-if="consultation.vitals && Object.values(consultation.vitals).some(v => v)" 
         class="flex items-center gap-2 overflow-x-auto scrollbar-hide max-w-[65%]"
       >
          <!-- BP -->
          <div v-if="consultation.vitals.blood_pressure_systolic" class="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 px-2 py-1 rounded-md" title="Blood Pressure">
             <span class="text-red-500 font-bold">BP</span>
             {{ consultation.vitals.blood_pressure_systolic }}/{{ consultation.vitals.blood_pressure_diastolic }}
          </div>
          <!-- Heart Rate -->
          <div v-if="consultation.vitals.heart_rate" class="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 px-2 py-1 rounded-md" title="Heart Rate">
             <span class="text-blue-500 font-bold">HR</span>
             {{ consultation.vitals.heart_rate }}
          </div>
          <!-- Temp -->
          <div v-if="consultation.vitals.temperature" class="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 px-2 py-1 rounded-md" title="Temperature">
             <span class="text-orange-500 font-bold">T</span>
             {{ consultation.vitals.temperature }}°
          </div>
          <!-- O2 -->
          <div v-if="consultation.vitals.oxygen_saturation" class="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 px-2 py-1 rounded-md" title="Oxygen Saturation">
             <span class="text-cyan-500 font-bold">O₂</span>
             {{ consultation.vitals.oxygen_saturation }}%
          </div>
          <!-- Resp Rate -->
          <div v-if="consultation.vitals.respiratory_rate" class="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 px-2 py-1 rounded-md" title="Respiratory Rate">
             <span class="text-purple-500 font-bold">RR</span>
             {{ consultation.vitals.respiratory_rate }}
          </div>
          <!-- Weight -->
          <div v-if="consultation.vitals.weight" class="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 px-2 py-1 rounded-md" title="Weight">
             <span class="text-gray-500 font-bold">Wt</span>
             {{ consultation.vitals.weight }}kg
          </div>
          <!-- Height -->
          <div v-if="consultation.vitals.height" class="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 px-2 py-1 rounded-md" title="Height">
             <span class="text-gray-500 font-bold">Ht</span>
             {{ consultation.vitals.height }}cm
          </div>
       </div>
       <div v-else class="text-xs text-gray-400 italic">
          No vitals recorded
       </div>

       <!-- Right Side Metadata -->
       <div class="flex items-center gap-3">
          <!-- Diagnoses Count -->
          <div v-if="consultation.diagnoses?.length" class="flex items-center text-purple-500 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-md" title="Diagnoses">
              <span class="text-xs font-bold">{{ consultation.diagnoses.length }} DX</span>
          </div>

          <!-- Attachments Count -->
          <div v-if="consultation.attachments?.length" class="flex items-center text-gray-400" title="Attachments">
              <PaperClipIcon class="w-4 h-4" />
              <span class="text-sm ml-0.5 font-medium">{{ consultation.attachments.length }}</span>
          </div>
          
           <!-- Arrow -->
           <div class="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-[#246BFD] group-hover:text-white transition-all duration-300">
              <ChevronRightIcon class="w-3 h-3" />
           </div>
       </div>

    </div>
  </div>
</template>
