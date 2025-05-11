<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import TextInput from '@/components/TextInput.vue';
import { VueCropper } from 'vue-cropper';
import 'vue-cropper/dist/index.css';

const router = useRouter();
const authStore = useAuthStore();
const user = computed(() => authStore.user);

const form = ref({
  firstname: user.value?.firstname || '',
  lastname: user.value?.lastname || '',
  email: user.value?.email || '',
  phone_number: user.value?.phone_number || '',
});

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

// Image upload handling
const imageInput = ref<HTMLInputElement | null>(null);
const imagePreview = ref<HTMLImageElement | null>(null);
const showCropper = ref(false);
const selectedFile = ref<File | null>(null);
const cropperRef = ref();

const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      if (imagePreview.value) {
        imagePreview.value.src = e.target?.result as string;
        showCropper.value = true;
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
};

const cropImage = () => {
  if (cropperRef.value) {
    cropperRef.value.getCropData((data: string) => {
      // Convert base64 to blob
      fetch(data)
        .then(res => res.blob())
        .then(blob => {
          selectedFile.value = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
          showCropper.value = false;
          if (imagePreview.value) {
            imagePreview.value.src = data;
          }
        });
    });
  }
};

const cancelCrop = () => {
  showCropper.value = false;
  if (imagePreview.value) {
    imagePreview.value.src = user.value?.profile_picture || '';
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = null;
    success.value = null;

    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append('firstname', form.value.firstname);
    formData.append('lastname', form.value.lastname);
    formData.append('email', form.value.email);
    formData.append('phone_number', form.value.phone_number);
    
    if (selectedFile.value) {
      formData.append('profile_picture', selectedFile.value);
    }

    // TODO: Implement the API call to update profile
    // await authService.updateProfile(formData);
    
    success.value = 'Profile updated successfully!';
    setTimeout(() => {
      router.push('/profile');
    }, 1500);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update profile';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto px-4 py-36">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center mb-8">
        <button
          @click="router.back()"
          class="mr-4 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary/80 transition-colors"
        >
          <i class="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-300">
        <!-- Profile Picture Section -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Picture</h2>
          <div class="flex items-center space-x-6">
            <div class="relative group">
              <div class="w-32 h-32 rounded-full overflow-hidden bg-primary/10 dark:bg-primary/20 flex items-center justify-center ring-4 ring-primary/20 dark:ring-primary/30">
                <img
                  ref="imagePreview"
                  :src="user?.profile_picture || ''"
                  :alt="`${user?.firstname} ${user?.lastname}`"
                  class="w-full h-full object-cover"
                />
                <span v-if="!user?.profile_picture" class="text-4xl text-primary dark:text-primary/80 font-medium">
                  {{ authStore.userInitials }}
                </span>
              </div>
              <div class="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  @click="imageInput?.click()"
                  class="text-white text-sm font-medium hover:text-primary/90 transition-colors"
                >
                  <i class="fas fa-camera text-xl"></i>
                </button>
              </div>
              <input
                ref="imageInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageSelect"
              />
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <p>Click on the camera icon to upload a new profile picture</p>
              <p class="text-xs mt-1">JPG, PNG or GIF (max. 2MB)</p>
            </div>
          </div>
        </div>

        <!-- Image Cropper Modal -->
        <div
          v-if="showCropper"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-2xl w-full">
            <div class="aspect-square max-h-[60vh] overflow-hidden">
              <vue-cropper
                ref="cropperRef"
                :img="imagePreview?.src"
                :output-size="1"
                :output-type="'jpeg'"
                :info="true"
                :full="true"
                :can-move="false"
                :can-scale="false"
                :auto-crop="true"
                :fixed="true"
                :fixed-number="[1, 1]"
                :center-box="true"
                :info-true="true"
                :high="true"
              />
            </div>
            <div class="flex justify-end space-x-4 mt-4">
              <button
                @click="cancelCrop"
                class="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              >
                Cancel
              </button>
              <button
                @click="cropImage"
                class="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-primary/20"
              >
                Crop & Save
              </button>
            </div>
          </div>
        </div>

        <!-- Form Section -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              v-model="form.firstname"
              label="First Name"
              type="text"
              required
            />
            <TextInput
              v-model="form.lastname"
              label="Last Name"
              type="text"
              required
            />
            <TextInput
              v-model="form.email"
              label="Email"
              type="email"
              required
            />
            <TextInput
              v-model="form.phone_number"
              label="Phone Number"
              type="tel"
            />
          </div>

          <!-- Error and Success Messages -->
          <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            {{ error }}
          </div>
          <div v-if="success" class="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
            {{ success }}
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="router.back()"
              class="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              :disabled="loading"
            >
              <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              <span>{{ loading ? 'Saving...' : 'Save Changes' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template> 