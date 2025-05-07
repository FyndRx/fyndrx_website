<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

const props = defineProps<{
  modelValue: string | string[] | number | number[];
  options: Option[];
  label?: string;
  placeholder?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  size?: 'small' | 'medium' | 'large';
  searchable?: boolean;
  multiple?: boolean;
  clearable?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | string[] | number | number[]): void;
  (e: 'change', value: string | string[] | number | number[]): void;
}>();

const isOpen = ref(false);
const searchQuery = ref('');
const selectedOptions = ref<Option[]>([]);

// Computed
const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) return props.options;
  return props.options.filter(option => 
    option.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const displayValue = computed(() => {
  if (props.multiple) {
    return selectedOptions.value.map(opt => opt.label).join(', ');
  }
  const selected = props.options.find(opt => opt.value === props.modelValue);
  return selected?.label || props.placeholder || 'Select an option';
});

// Methods
const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
  }
};

const selectOption = (option: Option) => {
  if (option.disabled) return;

  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const index = values.indexOf(option.value);
    
    if (index === -1) {
      values.push(option.value);
    } else {
      values.splice(index, 1);
    }
    
    emit('update:modelValue', values);
    emit('change', values);
  } else {
    emit('update:modelValue', option.value);
    emit('change', option.value);
    isOpen.value = false;
  }
};

const clearSelection = (e: Event) => {
  e.stopPropagation();
  if (props.multiple) {
    emit('update:modelValue', []);
  } else {
    emit('update:modelValue', '');
  }
  emit('change', props.multiple ? [] : '');
};

// Watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (props.multiple) {
    selectedOptions.value = props.options.filter(opt => 
      (newValue as (string | number)[]).includes(opt.value)
    );
  }
}, { immediate: true });

// Click outside handler
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.dropdown-container')) {
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
  <div class="w-full dropdown-container">
    <!-- Label -->
    <label 
      v-if="label" 
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Dropdown Button -->
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
        @click="toggleDropdown"
      >
        <span class="truncate">{{ displayValue }}</span>
        <div class="flex items-center space-x-2">
          <button
            v-if="clearable && modelValue"
            type="button"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            @click="clearSelection"
          >
            <i class="fas fa-times"></i>
          </button>
          <i 
            class="fas fa-chevron-down transition-transform duration-200"
            :class="{ 'transform rotate-180': isOpen }"
          ></i>
        </div>
      </button>

      <!-- Dropdown Menu -->
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto"
      >
        <!-- Search Input -->
        <div v-if="searchable" class="p-2 sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            v-model="searchQuery"
            class="w-full px-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-[#246BFD] focus:ring-opacity-50"
            placeholder="Search..."
            @click.stop
          />
        </div>

        <!-- Options -->
        <div class="py-1">
          <div
            v-for="option in filteredOptions"
            :key="option.value"
            class="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{
              'opacity-50 cursor-not-allowed': option.disabled,
              'bg-[#246BFD]/10 text-[#246BFD]': 
                (multiple && (modelValue as (string | number)[]).includes(option.value)) ||
                (!multiple && modelValue === option.value)
            }"
            @click="selectOption(option)"
          >
            <div class="flex items-center">
              <div v-if="multiple" class="mr-2">
                <input
                  type="checkbox"
                  :checked="(modelValue as (string | number)[]).includes(option.value)"
                  class="rounded border-gray-300 text-[#246BFD] focus:ring-[#246BFD]"
                  @click.stop
                />
              </div>
              {{ option.label }}
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