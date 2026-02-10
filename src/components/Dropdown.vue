<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import CustomCheckbox from './CustomCheckbox.vue';

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
  variant?: 'default' | 'outlined';
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | (string | number)[]): void;
  (e: 'change', value: string | number | (string | number)[]): void;
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

const container = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const menuPosition = ref({ top: '0px', left: '0px', width: '0px' });

const updatePosition = () => {
  if (container.value) {
    const rect = container.value.getBoundingClientRect();
    menuPosition.value = {
      top: `${rect.bottom + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`
    };
  }
};

watch(isOpen, async (val) => {
  if (val) {
    // Wait for DOM update/render if needed, but rects are sync usually. 
    // However, if layout shifts, tick helps.
    // Also calculating position immediately.
    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
  } else {
    window.removeEventListener('scroll', updatePosition);
    window.removeEventListener('resize', updatePosition);
  }
});

// Click outside handler
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node;
  const inContainer = container.value && container.value.contains(target);
  const inMenu = menuRef.value && menuRef.value.contains(target);
  
  if (isOpen.value && !inContainer && !inMenu) {
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

<script lang="ts">
export default {
  name: 'Dropdown'
};
</script>


<template>
  <div ref="container" class="w-full dropdown-container">
    <!-- Label -->
    <label 
      v-if="label" 
      class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
      <span v-if="required" class="ml-1 text-red-500">*</span>
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
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      ]"
    >
      <button
        type="button"
        class="flex items-center justify-between w-full px-5 py-3 rounded-full transition-all duration-300"
        :class="[
           variant === 'outlined' 
             ? 'border-2 border-gray-200 dark:border-gray-700 bg-transparent' 
             : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
           error 
             ? 'border-red-500 dark:border-red-500' 
             : 'hover:border-[#246BFD] dark:hover:border-[#246BFD]'
        ]"
        :disabled="disabled"
        @click="toggleDropdown"
      >
        <span class="truncate dark:text-gray-100">{{ displayValue }}</span>
        <div class="flex items-center space-x-2">
          <button
            v-if="clearable && modelValue"
            type="button"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            @click="clearSelection"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <svg 
            class="w-5 h-5 transition-transform duration-200 text-gray-400"
            :class="{ 'transform rotate-180': isOpen }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </button>

      <!-- Dropdown Menu Teleported to Body -->
      <Teleport to="body">
        <div
          v-if="isOpen"
          ref="menuRef"
          :style="menuPosition"
          class="absolute z-[999] mt-2 overflow-auto bg-white border border-gray-200 shadow-xl dark:bg-gray-800 rounded-2xl dark:border-gray-700 max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <!-- Search Input -->
          <div v-if="searchable" class="sticky top-0 p-2 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
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
              class="px-4 py-2 transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              :class="{
                'opacity-50 cursor-not-allowed': option.disabled,
                'bg-[#246BFD]/10 text-[#246BFD]': 
                  (multiple && (modelValue as (string | number)[]).includes(option.value)) ||
                  (!multiple && modelValue === option.value)
              }"
              @click="selectOption(option)"
            >
              <div class="flex items-center">
                <div v-if="multiple" class="mr-2" @click.stop>
                  <CustomCheckbox
                    :model-value="(modelValue as (string | number)[]).includes(option.value)"
                    size="small"
                    @click.stop
                  />
                </div>
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>
      </Teleport>
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