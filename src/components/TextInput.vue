<script setup lang="ts">
import { computed, ref } from 'vue';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  PhoneIcon, 
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline';

const props = defineProps<{
  modelValue?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'textarea' | 'datetime-local';
  label?: string;
  placeholder?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outlined';
  icon?: string;
  acceptPhone?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'focus'): void;
  (e: 'blur'): void;
  (e: 'validation', isValid: boolean): void;
}>();

const showPassword = ref(false);
const isPhoneNumber = ref(false);

const inputClasses = computed(() => [
  props.type === 'textarea' ? 'rounded-2xl' : 'rounded-full',
  'w-full font-medium transition-all duration-300',
  'focus:outline-none focus:ring-2 focus:ring-[#246BFD] focus:ring-opacity-50',
  props.size === 'small' ? 'text-sm px-4 py-2' : 
  props.size === 'large' ? 'text-lg px-6 py-4' : 
  'px-5 py-3',
  props.variant === 'outlined' 
    ? 'border-2 border-gray-200 dark:border-gray-700 bg-transparent' 
    : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
  props.error 
    ? 'border-red-500 dark:border-red-500' 
    : 'hover:border-[#246BFD] dark:hover:border-[#246BFD]',
  props.disabled ? 'opacity-50 cursor-not-allowed' : '',
  'pl-12', // Always add left padding for the icon
  'pr-12' // Always add right padding for the password toggle icon
]);

const getInputIcon = computed(() => {
  switch (props.type) {
    case 'email':
      return EnvelopeIcon;
    case 'password':
      return LockClosedIcon;
    case 'tel':
      return PhoneIcon;
    case 'search':
      return MagnifyingGlassIcon;
    case 'date':
    case 'datetime-local':
      return CalendarIcon;
    default:
      return PencilIcon;
  }
});

const validateInput = (value: string) => {
  if (!value) {
    emit('validation', false);
    return;
  }

  if (props.type === 'email' && props.acceptPhone) {
    // Check if it's a valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(value);
    
    // Check if it's a valid Ghana phone number
    const phoneRegex = /^(?:\+233|0)[2-9]\d{8}$/;
    const isPhone = phoneRegex.test(value);
    
    isPhoneNumber.value = isPhone;
    
    if (isPhone) {
      // Format the phone number with +233 prefix
      const formattedNumber = value.startsWith('0') 
        ? '+233' + value.slice(1)
        : value;
      emit('update:modelValue', formattedNumber);
    }
    
    emit('validation', isEmail || isPhone);
  } else if (props.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    emit('validation', emailRegex.test(value));
  } else if (props.type === 'tel') {
    const phoneRegex = /^(?:\+233|0)[2-9]\d{8}$/;
    const isValid = phoneRegex.test(value);
    if (isValid && value.startsWith('0')) {
      emit('update:modelValue', '+233' + value.slice(1));
    }
    emit('validation', isValid);
  } else {
    emit('validation', true);
  }
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  emit('update:modelValue', value);
  validateInput(value);
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
</script>

<script lang="ts">
export default {
  name: 'TextInput'
};
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

    <!-- Input Container -->
    <div class="relative group">
      <!-- Left Icon -->
      <div 
        class="absolute left-0 pl-4 flex pointer-events-none transition-colors duration-300"
        :class="type === 'textarea' ? 'top-4 items-start' : 'inset-y-0 items-center'"
      >
        <component 
          :is="getInputIcon" 
          class="w-5 h-5 text-[#246BFD] group-hover:text-[#5089FF] transition-colors duration-300"
        />
      </div>

      <!-- Input or Textarea -->
      <component
        :is="type === 'textarea' ? 'textarea' : 'input'"
        :type="type !== 'textarea' ? (type === 'password' ? (showPassword ? 'text' : 'password') : type || 'text') : undefined"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :rows="rows"
        :class="[
          ...inputClasses,
          type === 'textarea' ? 'py-3 min-h-[100px] resize-y' : ''
        ]"
        @input="handleInput"
        @focus="emit('focus')"
        @blur="emit('blur')"
      />

      <!-- Right Icon (Password Toggle) -->
      <div 
        v-if="type === 'password'"
        class="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer transition-colors duration-300"
        @click="togglePassword"
      >
        <component 
          :is="showPassword ? EyeSlashIcon : EyeIcon"
          class="w-5 h-5 text-[#246BFD] hover:text-[#5089FF] transition-colors duration-300"
        />
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