<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  modelValue: string;
  label?: string;
  placeholder?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  size?: 'small' | 'medium' | 'large';
  format?: 'date' | 'time' | 'datetime';
  minDate?: string;
  maxDate?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}>();

const isOpen = ref(false);
const selectedDate = ref<Date | null>(null);
const selectedHour = ref<string>('12');
const selectedMinute = ref<string>('00');
const selectedPeriod = ref<'AM' | 'PM'>('AM');

// Generate arrays for hours and minutes
const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

// Computed
const displayValue = computed(() => {
  if (!props.modelValue) return props.placeholder || 'Select date and time';
  
  const date = new Date(props.modelValue);
  if (isNaN(date.getTime())) return 'Invalid date';

  switch (props.format) {
    case 'date':
      return date.toLocaleDateString();
    case 'time':
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    default:
      return date.toLocaleString([], { 
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });
  }
});

// Methods
const togglePicker = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
  }
};

const selectDate = (date: Date) => {
  selectedDate.value = date;
  updateValue();
};

const updateValue = () => {
  if (!selectedDate.value) return;

  const date = selectedDate.value;
  const hour = parseInt(selectedHour.value);
  const minute = parseInt(selectedMinute.value);
  
  // Convert to 24-hour format
  const hour24 = selectedPeriod.value === 'PM' ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
  
  date.setHours(hour24);
  date.setMinutes(minute);
  
  emit('update:modelValue', date.toISOString());
  emit('change', date.toISOString());
};

// Watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const date = new Date(newValue);
    if (!isNaN(date.getTime())) {
      selectedDate.value = date;
      
      // Convert to 12-hour format
      let hour = date.getHours();
      selectedPeriod.value = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      
      selectedHour.value = hour.toString().padStart(2, '0');
      selectedMinute.value = date.getMinutes().toString().padStart(2, '0');
    }
  }
}, { immediate: true });

// Click outside handler
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.datetime-picker-container')) {
    isOpen.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="w-full datetime-picker-container">
    <!-- Label -->
    <label 
      v-if="label" 
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Picker Button -->
    <div 
      class="relative"
      :class="[
        'rounded-full font-medium transition-all duration-300',
        'focus-within:ring-2 focus-within:ring-[#246BFD] focus-within:ring-opacity-50',
        size === 'small' ? 'text-sm' : 
        size === 'large' ? 'text-lg' : 
        'text-base',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        error 
          ? 'border-red-500 dark:border-red-500' 
          : 'border-gray-200 dark:border-gray-700 hover:border-[#246BFD] dark:hover:border-[#246BFD]'
      ]"
    >
      <button
        type="button"
        class="w-full flex items-center justify-between px-5 py-3 bg-white dark:bg-gray-800 border rounded-full"
        :disabled="disabled"
        @click="togglePicker"
      >
        <span class="truncate">{{ displayValue }}</span>
        <i class="fas fa-calendar text-gray-400"></i>
      </button>

      <!-- Picker Menu -->
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <!-- Date Picker -->
        <div v-if="format !== 'time'" class="p-4">
          <div class="grid grid-cols-7 gap-1">
            <!-- Calendar header -->
            <div class="col-span-7 flex items-center justify-between mb-2">
              <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <i class="fas fa-chevron-left"></i>
              </button>
              <span class="font-medium">March 2024</span>
              <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
            
            <!-- Week days -->
            <div 
              v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" 
              :key="day"
              class="text-center text-sm text-gray-500 dark:text-gray-400"
            >
              {{ day }}
            </div>
            
            <!-- Calendar days -->
            <div 
              v-for="day in 31" 
              :key="day"
              class="text-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer"
              :class="{
                'bg-[#246BFD] text-white': selectedDate?.getDate() === day,
                'text-gray-400': false // Add logic for disabled dates
              }"
              @click="selectDate(new Date(2024, 2, day))"
            >
              {{ day }}
            </div>
          </div>
        </div>

        <!-- Time Picker -->
        <div v-if="format !== 'date'" class="p-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-center space-x-4">
            <div class="flex items-center space-x-2">
              <!-- Hours Dropdown -->
              <select
                v-model="selectedHour"
                @change="updateValue"
                class="w-20 px-2 py-1 text-center border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#246BFD] focus:ring-opacity-50 appearance-none cursor-pointer"
              >
                <option v-for="hour in hours" :key="hour" :value="hour">{{ hour }}</option>
              </select>

              <span class="text-gray-600 dark:text-gray-300">:</span>

              <!-- Minutes Dropdown -->
              <select
                v-model="selectedMinute"
                @change="updateValue"
                class="w-20 px-2 py-1 text-center border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#246BFD] focus:ring-opacity-50 appearance-none cursor-pointer"
              >
                <option v-for="minute in minutes" :key="minute" :value="minute">{{ minute }}</option>
              </select>

              <!-- AM/PM Dropdown -->
              <select
                v-model="selectedPeriod"
                @change="updateValue"
                class="w-20 px-2 py-1 text-center border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#246BFD] focus:ring-opacity-50 appearance-none cursor-pointer"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Helper Text -->
    <p 
      v-if="helper && !error" 
      class="mt-2 text-sm text-gray-500 dark:text-gray-400"
    >
      {{ helper }}
    </p>

    <!-- Error Message -->
    <p 
      v-if="error" 
      class="mt-2 text-sm text-red-500 dark:text-red-400"
    >
      {{ error }}
    </p>
  </div>
</template> 