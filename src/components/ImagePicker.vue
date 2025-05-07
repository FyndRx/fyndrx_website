<script setup lang="ts">
import { ref, computed } from 'vue';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

const props = defineProps<{
  modelValue: string;
  label?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  size?: 'small' | 'medium' | 'large';
  aspectRatio?: number;
  maxSize?: number; // in MB
  accept?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
  (e: 'error', error: string): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const imagePreview = ref<HTMLImageElement | null>(null);
const cropper = ref<Cropper | null>(null);
const isCropping = ref(false);
const selectedFile = ref<File | null>(null);

// Computed
const previewClasses = computed(() => [
  'w-full h-48 rounded-2xl object-cover',
  props.size === 'small' ? 'h-32' : 
  props.size === 'large' ? 'h-64' : 
  'h-48'
]);

// Methods
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  
  // Check file size
  if (props.maxSize && file.size > props.maxSize * 1024 * 1024) {
    emit('error', `File size must be less than ${props.maxSize}MB`);
    return;
  }

  // Check file type
  if (props.accept && !file.type.match(props.accept)) {
    emit('error', 'Invalid file type');
    return;
  }

  selectedFile.value = file;
  const reader = new FileReader();
  
  reader.onload = (e) => {
    if (imagePreview.value) {
      imagePreview.value.src = e.target?.result as string;
      isCropping.value = true;
      
      // Initialize cropper
      if (cropper.value) {
        cropper.value.destroy();
      }
      
      cropper.value = new Cropper(imagePreview.value, {
        aspectRatio: props.aspectRatio,
        viewMode: 2,
        autoCropArea: 1,
        responsive: true,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
      });
    }
  };
  
  reader.readAsDataURL(file);
};

const cropImage = () => {
  if (!cropper.value) return;
  
  const canvas = cropper.value.getCroppedCanvas({
    maxWidth: 1920,
    maxHeight: 1920,
    fillColor: '#fff',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  });
  
  const croppedImage = canvas.toDataURL('image/jpeg');
  emit('update:modelValue', croppedImage);
  emit('change', croppedImage);
  isCropping.value = false;
  
  if (cropper.value) {
    cropper.value.destroy();
    cropper.value = null;
  }
};

const cancelCrop = () => {
  isCropping.value = false;
  if (cropper.value) {
    cropper.value.destroy();
    cropper.value = null;
  }
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  selectedFile.value = null;
};

const triggerFileInput = () => {
  if (!props.disabled && fileInput.value) {
    fileInput.value.click();
  }
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

    <!-- Image Preview -->
    <div 
      class="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-[#246BFD] dark:hover:border-[#246BFD] transition-colors"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
      @click="triggerFileInput"
    >
      <!-- Preview Image -->
      <img
        v-if="modelValue"
        :src="modelValue"
        :class="previewClasses"
        alt="Preview"
      />
      
      <!-- Placeholder -->
      <div 
        v-else 
        class="flex flex-col items-center justify-center p-6 text-gray-400"
        :class="previewClasses"
      >
        <i class="fas fa-cloud-upload-alt text-4xl mb-2"></i>
        <p class="text-sm">Click to upload image</p>
      </div>

      <!-- File Input -->
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        :accept="accept || 'image/*'"
        @change="handleFileSelect"
      />
    </div>

    <!-- Cropping Modal -->
    <div
      v-if="isCropping"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 max-w-2xl w-full mx-4">
        <div class="relative">
          <img
            ref="imagePreview"
            class="max-h-[60vh] w-full"
            alt="Crop preview"
          />
        </div>
        
        <div class="flex justify-end space-x-4 mt-4">
          <button
            class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            @click="cancelCrop"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-[#246BFD] text-white rounded-full hover:bg-[#5089FF] transition-colors"
            @click="cropImage"
          >
            Crop & Save
          </button>
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

<style>
.cropper-view-box,
.cropper-face {
  border-radius: 50%;
}
</style> 