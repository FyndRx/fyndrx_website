<script setup lang="ts">
import { ref, computed } from 'vue';

interface FilePickerProps {
  modelValue: File[];
  label?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

const props = withDefaults(defineProps<FilePickerProps>(), {
  modelValue: () => [],
  multiple: false,
  maxSize: 10,
  acceptedTypes: () => ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: File[]): void;
  (e: 'error', error: string): void;
}>();

const isDragActive = ref(false);

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  isDragActive.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  isDragActive.value = false;
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragActive.value = false;
  
  if (e.dataTransfer?.files) {
    handleFiles(Array.from(e.dataTransfer.files));
  }
};

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files) {
    handleFiles(Array.from(input.files));
  }
};

const handleFiles = (files: File[]) => {
  const validFiles = files.filter(file => isValidFile(file));
  
  if (!props.multiple) {
    emit('update:modelValue', validFiles.slice(0, 1));
  } else {
    emit('update:modelValue', [...props.modelValue, ...validFiles]);
  }
};

const isValidFile = (file: File): boolean => {
  if (!props.acceptedTypes.includes(file.type)) {
    emit('error', `Please upload one of the following file types: ${props.acceptedTypes.join(', ')}`);
    return false;
  }
  
  if (file.size > props.maxSize * 1024 * 1024) {
    emit('error', `File size must be less than ${props.maxSize}MB`);
    return false;
  }
  
  return true;
};

const removeFile = (index: number) => {
  const newFiles = [...props.modelValue];
  newFiles.splice(index, 1);
  emit('update:modelValue', newFiles);
};

const acceptAttribute = computed(() => {
  const extensions = props.acceptedTypes.map(type => {
    switch (type) {
      case 'image/png': return '.png';
      case 'image/jpeg': return '.jpg,.jpeg';
      case 'image/jpg': return '.jpg';
      case 'application/pdf': return '.pdf';
      default: return '';
    }
  });
  return extensions.filter(ext => ext).join(',');
});
</script>

<script lang="ts">
export default {
  name: 'FilePicker'
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

    <!-- Upload Area -->
    <div
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#246BFD] transition-colors cursor-pointer"
      :class="[
        { 'border-[#246BFD] bg-blue-50 dark:bg-blue-900/20': isDragActive },
        { 'opacity-50 cursor-not-allowed': disabled }
      ]"
    >
      <div class="space-y-1 text-center">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <div class="flex text-sm text-gray-600 dark:text-gray-400">
          <label
            class="relative cursor-pointer rounded-md font-medium text-[#246BFD] hover:text-[#5089FF] focus-within:outline-none"
          >
            <span>Upload {{ multiple ? 'files' : 'a file' }}</span>
            <input
              type="file"
              class="sr-only"
              :accept="acceptAttribute"
              :multiple="multiple"
              :disabled="disabled"
              @change="handleFileSelect"
            />
          </label>
          <p class="pl-1">or drag and drop</p>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ acceptedTypes.join(', ').replace('image/', '').replace('application/', '').toUpperCase() }} up to {{ maxSize }}MB
        </p>
      </div>
    </div>

    <!-- File List -->
    <div v-if="modelValue.length > 0" class="mt-4 space-y-2">
      <div
        v-for="(file, index) in modelValue"
        :key="index"
        class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
      >
        <span class="text-sm text-gray-600 dark:text-gray-400">{{ file.name }}</span>
        <button
          type="button"
          @click="removeFile(index)"
          class="text-red-500 hover:text-red-700"
        >
          Remove
        </button>
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