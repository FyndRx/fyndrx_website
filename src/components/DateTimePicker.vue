<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  modelValue: string | undefined | null;
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
const triggerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const dropdownPosition = ref({ top: '0px', left: '0px', width: '0px' });

const selectedDate = ref<Date | null>(null);
const selectedHour = ref<string>('12');
const selectedMinute = ref<string>('00');
const selectedPeriod = ref<'AM' | 'PM'>('AM');
const currentMonth = ref(new Date());

// Generate arrays for hours and minutes
const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

// Computed
const displayValue = computed(() => {
  if (!props.modelValue) return props.placeholder || 'Select date';
  
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

const inputClasses = computed(() => [
  'rounded-full',
  'w-full font-medium transition-all duration-300 text-left flex items-center justify-between',
  'focus:outline-none focus:ring-2 focus:ring-[#246BFD] focus:ring-opacity-50',
  props.size === 'small' ? 'text-sm px-4 py-2' : 
  props.size === 'large' ? 'text-lg px-6 py-4' : 
  'px-5 py-3',
  'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
  props.error 
    ? 'border-red-500 dark:border-red-500' 
    : 'hover:border-[#246BFD] dark:hover:border-[#246BFD]',
  props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
  'pr-12' // Space for icon
]);

// Methods
const updateDropdownPosition = () => {
  if (triggerRef.value) {
    const rect = triggerRef.value.getBoundingClientRect();
    
    // Check if dropdown would go off screen bottom
    const dropdownHeight = 400; // Approximate max height
    const spaceBelow = window.innerHeight - rect.bottom;
    const showAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    if (showAbove) {
       dropdownPosition.value = {
        top: `${rect.top - 8 - (dropdownRef.value?.offsetHeight || 0)}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`
      };
    } else {
      // For fixed positioning, we don't need scrollTop
      dropdownPosition.value = {
        top: `${rect.bottom + 8}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`
      };
    }
  }
};

const togglePicker = async () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
      await nextTick();
      updateDropdownPosition();
    }
  }
};

const closePicker = () => {
  isOpen.value = false;
};

const selectDate = (date: Date) => {
  if (isDisabled(date)) return;
  selectedDate.value = date;
  updateValue();
  if (props.format === 'date') {
    closePicker();
  }
};

const updateValue = () => {
  if (!selectedDate.value) return;

  const date = new Date(selectedDate.value);
  
  if (props.format !== 'date') {
    const hour = parseInt(selectedHour.value);
    const minute = parseInt(selectedMinute.value);
    
    // Convert to 24-hour format
    const hour24 = selectedPeriod.value === 'PM' ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
    
    date.setHours(hour24);
    date.setMinutes(minute);
  } else {
      // Keep existing time if any, or default to 00:00:00 for clean date
      // Actually for 'date' format usually we just want the date part, but ISO string includes time.
      // Let's set to noon to avoid timezone shifting issues when just picking a date
      date.setHours(12, 0, 0, 0);
  }
  
  emit('update:modelValue', date.toISOString());
  emit('change', date.toISOString());
};

const changeMonth = (delta: number) => {
  const newDate = new Date(currentMonth.value);
  newDate.setMonth(newDate.getMonth() + delta);
  currentMonth.value = newDate;
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear();
  let startYear = currentYear - 80;
  let endYear = currentYear + 20;

  if (props.minDate) {
    startYear = new Date(props.minDate).getFullYear();
  }
  
  if (props.maxDate) {
    endYear = new Date(props.maxDate).getFullYear();
  }

  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }
  return years;
});

const isPrevDisabled = computed(() => {
  if (!props.minDate) return false;
  const min = new Date(props.minDate);
  const current = new Date(currentMonth.value);
  
  const minMonth = min.getFullYear() * 12 + min.getMonth();
  const curMonth = current.getFullYear() * 12 + current.getMonth();
  
  return curMonth <= minMonth;
});

const isNextDisabled = computed(() => {
  if (!props.maxDate) return false;
  const max = new Date(props.maxDate);
  const current = new Date(currentMonth.value);
  
  const maxMonth = max.getFullYear() * 12 + max.getMonth();
  const curMonth = current.getFullYear() * 12 + current.getMonth();
  
  return curMonth >= maxMonth;
});

const changeMonthSelect = (monthIndex: number) => {
  const newDate = new Date(currentMonth.value);
  newDate.setMonth(monthIndex);
  currentMonth.value = newDate;
};

const changeYearSelect = (year: number) => {
  const newDate = new Date(currentMonth.value);
  newDate.setFullYear(year);
  currentMonth.value = newDate;
};

const isDisabled = (date: Date) => {
  if (!date) return true;
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  if (props.minDate) {
    const min = new Date(props.minDate);
    min.setHours(0, 0, 0, 0);
    if (checkDate < min) return true;
  }

  if (props.maxDate) {
    const max = new Date(props.maxDate);
    max.setHours(0, 0, 0, 0);
    if (checkDate > max) return true;
  }

  return false;
};

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const days = [];
  // Add empty placeholders for previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
};



// Watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const date = new Date(newValue);
    if (!isNaN(date.getTime())) {
      selectedDate.value = date;
      currentMonth.value = new Date(date); // Center calendar on selected date
      
      // Update time states
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
  if (
    isOpen.value &&
    triggerRef.value &&
    !triggerRef.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    closePicker();
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', updateDropdownPosition);
  window.addEventListener('scroll', updateDropdownPosition, true); // true for capture to catch scroll in parents
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', updateDropdownPosition);
  window.removeEventListener('scroll', updateDropdownPosition, true);
});
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label 
      v-if="label" 
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Trigger Button -->
    <div class="relative group" ref="triggerRef">
      <button
        type="button"
        :class="inputClasses"
        :disabled="disabled"
        @click="togglePicker"
      >
        <span :class="!modelValue ? 'text-gray-400' : 'text-gray-900 dark:text-white'">
          {{ displayValue }}
        </span>
        
         <!-- Right Icon -->
        <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none transition-colors duration-300">
            <CalendarIcon class="w-5 h-5 text-[#246BFD] group-hover:text-[#5089FF]" />
        </div>
      </button>
    </div>

    <!-- Teleported Dropdown -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="fixed z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-72 sm:w-80"
        :style="dropdownPosition"
      >
        <!-- Date Picker -->
        <div v-if="format !== 'time'" class="p-4">
          <!-- Calendar header -->
          <div class="flex items-center justify-between mb-4">
            <button 
                @click.stop="changeMonth(-1)"
                :disabled="isPrevDisabled"
                class="p-2 rounded-lg transition-colors"
                :class="isPrevDisabled ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'"
            >
              <ChevronLeftIcon class="w-5 h-5" />
            </button>
            
            <div class="flex items-center gap-2">
                <!-- Month Selector -->
                <select 
                    :value="currentMonth.getMonth()"
                    @change="(e) => changeMonthSelect(parseInt((e.target as HTMLSelectElement).value))"
                    class="bg-transparent font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 py-0.5 outline-none focus:ring-2 focus:ring-[#246BFD]"
                    @click.stop
                >
                    <option v-for="(month, index) in monthNames" :key="index" :value="index">
                        {{ month }}
                    </option>
                </select>

                <!-- Year Selector -->
                <select 
                    :value="currentMonth.getFullYear()"
                    @change="(e) => changeYearSelect(parseInt((e.target as HTMLSelectElement).value))"
                    class="bg-transparent font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 py-0.5 outline-none focus:ring-2 focus:ring-[#246BFD]"
                    @click.stop
                >
                    <option v-for="year in availableYears" :key="year" :value="year">
                        {{ year }}
                    </option>
                </select>
            </div>

            <button 
                @click.stop="changeMonth(1)"
                :disabled="isNextDisabled"
                class="p-2 rounded-lg transition-colors"
                :class="isNextDisabled ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'"
            >
              <ChevronRightIcon class="w-5 h-5" />
            </button>
          </div>
          
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div 
              v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" 
              :key="day"
              class="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
            >
              {{ day }}
            </div>
          </div>
          
          <div class="grid grid-cols-7 gap-1">
            <div 
              v-for="(date, index) in getDaysInMonth(currentMonth)" 
              :key="index"
              class="aspect-square flex items-center justify-center p-1"
            >
                <button
                    v-if="date"
                    type="button"
                    @click.stop="selectDate(date)"
                    :disabled="isDisabled(date)"
                    class="w-full h-full rounded-full flex items-center justify-center text-sm transition-all"
                    :class="[
                        selectedDate?.toDateString() === date.toDateString() 
                            ? 'bg-[#246BFD] text-white font-medium shadow-md shadow-blue-200 dark:shadow-none' 
                            : isDisabled(date)
                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700',
                    ]"
                >
                    {{ date.getDate() }}
                </button>
            </div>
          </div>
        </div>

        <!-- Time Picker -->
        <div v-if="format !== 'date'" class="p-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-center space-x-2">
            <!-- Hours -->
            <select
              v-model="selectedHour"
              @change="updateValue"
              class="px-2 py-1.5 text-center border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#246BFD] text-sm"
            >
              <option v-for="hour in hours" :key="hour" :value="hour">{{ hour }}</option>
            </select>

            <span class="text-gray-500 font-medium">:</span>

            <!-- Minutes -->
            <select
              v-model="selectedMinute"
              @change="updateValue"
              class="px-2 py-1.5 text-center border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#246BFD] text-sm"
            >
              <option v-for="minute in minutes" :key="minute" :value="minute">{{ minute }}</option>
            </select>

            <!-- AM/PM -->
            <select
              v-model="selectedPeriod"
              @change="updateValue"
              class="px-2 py-1.5 text-center border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#246BFD] text-sm"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>
    </Teleport>

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