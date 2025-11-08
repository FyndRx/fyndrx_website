<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: boolean | (string | number)[];
  value?: string | number;
  label?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'switch' | 'card';
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  variant: 'default',
  color: 'primary'
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean | (string | number)[]];
}>();

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.value !== undefined && props.modelValue.includes(props.value);
  }
  return props.modelValue;
});

const handleChange = () => {
  if (props.disabled) return;

  if (Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue];
    const index = props.value !== undefined ? newValue.indexOf(props.value) : -1;
    
    if (index > -1) {
      newValue.splice(index, 1);
    } else if (props.value !== undefined) {
      newValue.push(props.value);
    }
    
    emit('update:modelValue', newValue);
  } else {
    emit('update:modelValue', !props.modelValue);
  }
};

const sizeClasses = {
  small: 'w-4 h-4',
  medium: 'w-5 h-5',
  large: 'w-6 h-6'
};

const colorClasses = {
  primary: {
    bg: 'bg-[#246BFD]',
    border: 'border-[#246BFD]',
    focus: 'focus:ring-[#246BFD]',
    hover: 'hover:border-[#246BFD]'
  },
  success: {
    bg: 'bg-green-500',
    border: 'border-green-500',
    focus: 'focus:ring-green-500',
    hover: 'hover:border-green-500'
  },
  warning: {
    bg: 'bg-yellow-500',
    border: 'border-yellow-500',
    focus: 'focus:ring-yellow-500',
    hover: 'hover:border-yellow-500'
  },
  danger: {
    bg: 'bg-red-500',
    border: 'border-red-500',
    focus: 'focus:ring-red-500',
    hover: 'hover:border-red-500'
  }
};

const getColorClass = computed(() => colorClasses[props.color]);
</script>

<template>
  <!-- Default Variant -->
  <div v-if="variant === 'default'" class="inline-flex items-start">
    <div class="relative flex items-center">
      <input
        type="checkbox"
        :checked="isChecked"
        :disabled="disabled"
        @change="handleChange"
        class="sr-only peer"
      />
      <div
        @click="handleChange"
        :class="[
          'relative cursor-pointer rounded-lg border-2 transition-all duration-300 flex items-center justify-center',
          sizeClasses[size],
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          isChecked 
            ? `${getColorClass.bg} ${getColorClass.border} shadow-lg` 
            : `border-gray-300 dark:border-gray-600 ${getColorClass.hover} hover:shadow-md`,
          !disabled && !isChecked ? 'hover:scale-105' : '',
          !disabled && isChecked ? 'scale-110' : '',
          error ? 'border-red-500' : ''
        ]"
      >
        <svg
          v-if="isChecked"
          :class="[
            'text-white transition-all duration-300',
            size === 'small' ? 'w-3 h-3' : size === 'medium' ? 'w-3.5 h-3.5' : 'w-4 h-4',
            isChecked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
    </div>
    
    <div v-if="label || description" class="ml-3 flex-1" @click="handleChange">
      <label
        v-if="label"
        :class="[
          'font-medium cursor-pointer select-none transition-colors',
          size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg',
          disabled ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-900 dark:text-white hover:text-[#246BFD]'
        ]"
      >
        {{ label }}
      </label>
      <p
        v-if="description"
        :class="[
          'text-gray-600 dark:text-gray-400',
          size === 'small' ? 'text-xs' : 'text-sm',
          disabled ? 'opacity-50' : ''
        ]"
      >
        {{ description }}
      </p>
    </div>
  </div>

  <!-- Switch Variant -->
  <div v-else-if="variant === 'switch'" class="inline-flex items-center">
    <input
      type="checkbox"
      :checked="isChecked"
      :disabled="disabled"
      @change="handleChange"
      class="sr-only peer"
    />
    <div
      @click="handleChange"
      :class="[
        'relative cursor-pointer rounded-full transition-all duration-300',
        size === 'small' ? 'w-9 h-5' : size === 'medium' ? 'w-11 h-6' : 'w-14 h-7',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        isChecked ? getColorClass.bg : 'bg-gray-300 dark:bg-gray-600',
        !disabled ? 'hover:shadow-lg' : ''
      ]"
    >
      <div
        :class="[
          'absolute top-1 left-1 bg-white rounded-full shadow-md transition-transform duration-300',
          size === 'small' ? 'w-3 h-3' : size === 'medium' ? 'w-4 h-4' : 'w-5 h-5',
          isChecked 
            ? (size === 'small' ? 'translate-x-4' : size === 'medium' ? 'translate-x-5' : 'translate-x-7')
            : 'translate-x-0'
        ]"
      ></div>
    </div>
    
    <label
      v-if="label"
      @click="handleChange"
      :class="[
        'ml-3 font-medium cursor-pointer select-none',
        size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg',
        disabled ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-900 dark:text-white'
      ]"
    >
      {{ label }}
    </label>
  </div>

  <!-- Card Variant -->
  <div
    v-else-if="variant === 'card'"
    @click="handleChange"
    :class="[
      'relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1',
      isChecked 
        ? `${getColorClass.border} ${getColorClass.bg} bg-opacity-5 dark:bg-opacity-10 shadow-lg` 
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
    ]"
  >
    <div class="flex items-start gap-3">
      <div
        :class="[
          'relative flex-shrink-0 rounded-lg border-2 transition-all duration-300 flex items-center justify-center mt-0.5',
          size === 'small' ? 'w-4 h-4' : size === 'medium' ? 'w-5 h-5' : 'w-6 h-6',
          isChecked 
            ? `${getColorClass.bg} ${getColorClass.border}` 
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        ]"
      >
        <svg
          v-if="isChecked"
          :class="[
            'text-white transition-all duration-300',
            size === 'small' ? 'w-3 h-3' : size === 'medium' ? 'w-3.5 h-3.5' : 'w-4 h-4'
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      
      <div class="flex-1">
        <p
          :class="[
            'font-semibold transition-colors',
            size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg',
            isChecked ? getColorClass.bg.replace('bg-', 'text-') : 'text-gray-900 dark:text-white'
          ]"
        >
          {{ label }}
        </p>
        <p
          v-if="description"
          :class="[
            'text-gray-600 dark:text-gray-400 mt-1',
            size === 'small' ? 'text-xs' : 'text-sm'
          ]"
        >
          {{ description }}
        </p>
      </div>
    </div>

    <!-- Selected Badge -->
    <div
      v-if="isChecked"
      :class="[
        'absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold',
        getColorClass.bg,
        'text-white'
      ]"
    >
      ✓ Selected
    </div>
  </div>

  <!-- Error Message -->
  <p v-if="error" class="mt-1 text-sm text-red-500 flex items-center gap-1">
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
    </svg>
    {{ error }}
  </p>
</template>

<style scoped>
@keyframes checkmark {
  0% {
    transform: scale(0) rotate(45deg);
  }
  50% {
    transform: scale(1.2) rotate(45deg);
  }
  100% {
    transform: scale(1) rotate(45deg);
  }
}

.peer:checked ~ div svg {
  animation: checkmark 0.3s ease-out;
}
</style>

