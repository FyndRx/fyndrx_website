<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import TextInput from '@/components/TextInput.vue';
import DateTimePicker from '@/components/DateTimePicker.vue';
import Dropdown from '@/components/Dropdown.vue';
import LazyImage from '@/components/LazyImage.vue';
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
  dob: user.value?.dob || '',
  gender: user.value?.gender || '',
});

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

// Image upload handling
const imageInput = ref<HTMLInputElement | null>(null);
const currentImageSrc = ref(user.value?.profile_picture_full || user.value?.profile_picture || '');
const showCropper = ref(false);
const selectedFile = ref<File | null>(null);
const cropperRef = ref();

const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      currentImageSrc.value = e.target?.result as string;
      showCropper.value = true;
    };
    reader.readAsDataURL(input.files[0]);
  }
};

const cropImage = () => {
  if (cropperRef.value) {
    cropperRef.value.getCropData((data: string) => {
      fetch(data)
        .then(res => res.blob())
        .then(blob => {
          selectedFile.value = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
          showCropper.value = false;
          currentImageSrc.value = data;
        });
    });
  }
};

const cancelCrop = () => {
  showCropper.value = false;
  currentImageSrc.value = user.value?.profile_picture_full || user.value?.profile_picture || '';
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = null;
    success.value = null;

    const updateData = {
      firstname: form.value.firstname,
      lastname: form.value.lastname,
      email: form.value.email,
      phone_number: form.value.phone_number,
      dob: form.value.dob,
      gender: form.value.gender
    };

    if (selectedFile.value) {
       await authStore.uploadProfilePicture(selectedFile.value);
    }

    await authStore.updateUserDetails(updateData);
    
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
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 pt-28 pb-20">
    <div class="container mx-auto px-4 max-w-5xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center">
          <button
            @click="router.back()"
            class="mr-4 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-[#246BFD] transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Edit Profile</h1>
            <p class="text-sm text-gray-500 font-medium">Update your account information and settings</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left Column: Avatar -->
        <div class="lg:col-span-4">
          <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-white/50 dark:border-gray-700/50 text-center">
            <div class="relative inline-block group">
              <div class="w-40 h-40 rounded-3xl overflow-hidden bg-blue-50 dark:bg-blue-900/10 p-1 shadow-inner ring-4 ring-gray-50 dark:ring-gray-900">
                <LazyImage
                  v-if="currentImageSrc"
                  :src="currentImageSrc"
                  :alt="user?.fullname || 'Profile'"
                  :aspectRatio="'square'"
                  class="w-full h-full object-cover rounded-2xl"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <span class="text-5xl font-bold text-[#246BFD] opacity-50">{{ authStore.userInitials }}</span>
                </div>
              </div>
              <button
                @click="imageInput?.click()"
                class="absolute -bottom-2 -right-2 bg-[#246BFD] text-white w-10 h-10 rounded-xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>
              <input
                ref="imageInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleImageSelect"
              />
            </div>
            
            <div class="mt-6 space-y-2">
              <h3 class="font-bold text-gray-900 dark:text-white">{{ user?.fullname }}</h3>
              <p class="text-xs text-gray-500 font-medium uppercase tracking-widest">Member ID: {{ user?.member_id }}</p>
            </div>

            <div class="mt-8 pt-8 border-t border-gray-50 dark:border-gray-700">
              <div class="flex items-center justify-between text-sm mb-4">
                <span class="text-gray-500 font-medium">Account Status</span>
                <span class="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold text-xs uppercase">Active</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500 font-medium">Joined Date</span>
                <span class="text-gray-900 dark:text-white font-bold">{{ user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Form -->
        <div class="lg:col-span-8">
          <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-white/50 dark:border-gray-700/50">
            <div class="p-8 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <h2 class="font-bold text-gray-900 dark:text-white flex items-center">
                <svg class="w-5 h-5 mr-2 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Personal Information
              </h2>
            </div>
            
            <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput
                  v-model="form.firstname"
                  label="First Name"
                  placeholder="Enter your first name"
                  required
                />
                <TextInput
                  v-model="form.lastname"
                  label="Last Name"
                  placeholder="Enter your last name"
                  required
                />
                <TextInput
                  v-model="form.email"
                  label="Email Address"
                  type="email"
                  placeholder="your@email.com"
                  required
                />
                <TextInput
                  v-model="form.phone_number"
                  label="Phone Number"
                  type="tel"
                  placeholder="+233..."
                />
                <DateTimePicker
                  v-model="form.dob"
                  label="Date of Birth"
                  format="date"
                  :max-date="new Date().toISOString()"
                />
                <Dropdown
                  v-model="form.gender"
                  label="Gender"
                  :options="genderOptions"
                  placeholder="Select Gender"
                />
              </div>

              <!-- Messages -->
              <transition enter-active-class="animate-in fade-in slide-in-from-top-2" leave-active-class="animate-out fade-out slide-out-to-top-2">
                <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center space-x-3 border border-red-100 dark:border-red-800/30">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="text-sm font-bold">{{ error }}</span>
                </div>
              </transition>

              <transition enter-active-class="animate-in fade-in slide-in-from-top-2" leave-active-class="animate-out fade-out slide-out-to-top-2">
                <div v-if="success" class="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl flex items-center space-x-3 border border-green-100 dark:border-green-800/30">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span class="text-sm font-bold">{{ success }}</span>
                </div>
              </transition>

              <div class="pt-6 flex items-center justify-end space-x-4 border-t border-gray-50 dark:border-gray-700">
                <button
                  type="button"
                  @click="router.back()"
                  class="px-8 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="loading"
                  class="px-10 py-3 rounded-2xl bg-[#246BFD] text-white font-bold hover:bg-[#5089FF] shadow-lg shadow-[#246BFD]/20 disabled:opacity-50 transition-all flex items-center space-x-2"
                >
                  <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                  </svg>
                  <span>{{ loading ? 'Saving...' : 'Save Changes' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Cropper Modal -->
    <div
      v-if="showCropper"
      class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden max-w-xl w-full shadow-2xl animate-in zoom-in duration-300">
        <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 class="font-bold text-gray-900 dark:text-white">Adjust Profile Picture</h3>
          <button @click="cancelCrop" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="aspect-square bg-gray-900">
          <vue-cropper
            ref="cropperRef"
            :img="currentImageSrc"
            :output-size="1"
            :output-type="'jpeg'"
            :auto-crop="true"
            :fixed="true"
            :fixed-number="[1, 1]"
            :center-box="true"
            :high="true"
          />
        </div>
        <div class="p-6 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-3">
          <button
            @click="cancelCrop"
            class="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 font-bold text-gray-500 hover:bg-white transition-all"
          >
            Cancel
          </button>
          <button
            @click="cropImage"
            class="px-8 py-2.5 bg-[#246BFD] text-white rounded-xl font-bold hover:bg-[#5089FF] shadow-lg shadow-[#246BFD]/20 transition-all"
          >
            Crop & Apply
          </button>
        </div>
      </div>
    </div>
  </div>
</template>