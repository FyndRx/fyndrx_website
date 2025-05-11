<script setup lang="ts">
import { ref, onMounted, computed, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import { pharmacyService } from '@/services/pharmacyService';
import type { Pharmacy, Review } from '@/types/pharmacy';

// Import components
const PharmacyMap = defineAsyncComponent(() => import('@/components/PharmacyMap.vue'));
const DateTimePicker = defineAsyncComponent(() => import('@/components/DateTimePicker.vue'));

const route = useRoute();
const router = useRouter();
const { registerElement } = useScrollAnimation();

const pharmacy = ref<Pharmacy | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const activeTab = ref('overview');
const newReview = ref({
  rating: 5,
  comment: '',
  user: 'Anonymous', // In a real app, this would come from the auth store
  date: new Date().toISOString()
});

const showReviewForm = ref(false);
const prescriptionFile = ref<File | null>(null);
const pickupDateTime = ref('');
const prescriptionError = ref<string | null>(null);
const pickupError = ref<string | null>(null);
const isUploading = ref(false);
const isScheduling = ref(false);

const loadPharmacy = async () => {
  loading.value = true;
  error.value = null;
  try {
    const id = parseInt(route.params.id as string);
    pharmacy.value = await pharmacyService.getPharmacy(id);
  } catch (err) {
    error.value = 'Failed to load pharmacy details. Please try again later.';
    console.error('Error loading pharmacy:', err);
  } finally {
    loading.value = false;
  }
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      prescriptionError.value = 'Please upload a PDF, JPEG, or PNG file';
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      prescriptionError.value = 'File size should be less than 5MB';
      return;
    }
    prescriptionFile.value = file;
    prescriptionError.value = null;
  }
};

const handlePrescriptionUpload = async () => {
  if (!prescriptionFile.value || !pharmacy.value) return;

  isUploading.value = true;
  prescriptionError.value = null;

  try {
    await pharmacyService.uploadPrescription(pharmacy.value.id, prescriptionFile.value);
    // Show success message
    prescriptionFile.value = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  } catch (err) {
    prescriptionError.value = 'Failed to upload prescription. Please try again.';
    console.error('Error uploading prescription:', err);
  } finally {
    isUploading.value = false;
  }
};

const handlePickupSchedule = async () => {
  if (!pharmacy.value || !pickupDateTime.value) return;

  isScheduling.value = true;
  pickupError.value = null;

  try {
    const date = new Date(pickupDateTime.value);
    const formattedDate = date.toISOString().split('T')[0];
    const formattedTime = date.toTimeString().split(' ')[0];

    await pharmacyService.schedulePickup(pharmacy.value.id, formattedDate, formattedTime);
    // Show success message
    pickupDateTime.value = '';
  } catch (err) {
    pickupError.value = 'Failed to schedule pickup. Please try again.';
    console.error('Error scheduling pickup:', err);
  } finally {
    isScheduling.value = false;
  }
};

const handleReviewSubmit = async () => {
  if (!pharmacy.value || !newReview.value.comment) return;

  try {
    await pharmacyService.addReview(pharmacy.value.id, newReview.value);
    // Refresh pharmacy data to show new review
    await loadPharmacy();
    // Reset form
    newReview.value = {
      rating: 5,
      comment: '',
      user: 'Anonymous',
      date: new Date().toISOString()
    };
    showReviewForm.value = false;
  } catch (err) {
    console.error('Error submitting review:', err);
    // Show error message
  }
};

onMounted(() => {
  loadPharmacy();
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD]"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen">
      <p class="text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
      <button 
        @click="loadPharmacy"
        class="px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Pharmacy Content -->
    <div v-else-if="pharmacy" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Hero Section -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg mb-8 scroll-animate slide-up">
        <div class="relative h-64">
          <div class="absolute inset-0 bg-gradient-to-br from-[#246BFD]/20 to-[#FE9615]/20 dark:from-[#246BFD]/10 dark:to-[#FE9615]/10"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <p class="text-gray-400 dark:text-gray-500">Pharmacy Image</p>
          </div>
          <div class="absolute top-4 right-4">
            <span
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="pharmacy.isOpen ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
            >
              {{ pharmacy.isOpen ? 'Open' : 'Closed' }}
            </span>
          </div>
        </div>

        <div class="p-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 class="text-3xl font-medium text-gray-900 dark:text-white mb-2">
                {{ pharmacy.name }}
              </h1>
              <p class="text-gray-600 dark:text-gray-300">{{ pharmacy.address }}</p>
            </div>
            <div class="flex items-center space-x-4 mt-4 md:mt-0">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span class="ml-1 text-gray-600 dark:text-gray-300">
                  {{ pharmacy.rating }} ({{ pharmacy.reviews.length }} reviews)
                </span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                </svg>
                <span class="ml-1 text-gray-600 dark:text-gray-300">
                  {{ pharmacy.distance }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex flex-wrap gap-3">
            <button
              @click="showReviewForm = true"
              class="px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors"
            >
              Write a Review
            </button>
            <a
              :href="`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}`"
              target="_blank"
              class="px-6 py-3 rounded-full bg-white dark:bg-gray-700 text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300"
            >
              Get Directions
            </a>
            <a
              :href="`tel:${pharmacy.phone}`"
              class="px-6 py-3 rounded-full bg-white dark:bg-gray-700 text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300"
            >
              Call Pharmacy
            </a>
          </div>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Main Content -->
        <div class="flex-1">
          <!-- Tabs -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-8">
            <div class="border-b border-gray-200 dark:border-gray-700">
              <nav class="flex -mb-px">
                <button
                  v-for="tab in ['overview', 'services', 'reviews', 'medications']"
                  :key="tab"
                  @click="activeTab = tab"
                  class="px-6 py-4 text-sm font-medium border-b-2 transition-colors"
                  :class="[
                    activeTab === tab
                      ? 'border-[#246BFD] text-[#246BFD]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  ]"
                >
                  {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
                </button>
              </nav>
            </div>

            <!-- Tab Content -->
            <div class="p-6">
              <!-- Overview Tab -->
              <div v-if="activeTab === 'overview'" class="space-y-6">
                <div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">About</h3>
                  <p class="text-gray-600 dark:text-gray-300">{{ pharmacy.description }}</p>
                </div>

                <div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Working Hours</h3>
                  <div class="space-y-2">
                    <div
                      v-for="(hours, day) in pharmacy.workingHours"
                      :key="day"
                      class="flex justify-between text-gray-600 dark:text-gray-300"
                    >
                      <span class="capitalize">{{ day }}</span>
                      <span>{{ hours }}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Contact Information</h3>
                  <div class="space-y-2">
                    <p class="text-gray-600 dark:text-gray-300">
                      <span class="font-medium">Phone:</span> {{ pharmacy.phone }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-300">
                      <span class="font-medium">Email:</span> {{ pharmacy.email }}
                    </p>
                    <p class="text-gray-600 dark:text-gray-300">
                      <span class="font-medium">Website:</span>
                      <a
                        :href="pharmacy.website"
                        target="_blank"
                        class="text-[#246BFD] hover:underline"
                      >
                        {{ pharmacy.website }}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Services Tab -->
              <div v-if="activeTab === 'services'" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="service in pharmacy.services"
                    :key="service"
                    class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <h4 class="font-medium text-gray-900 dark:text-white mb-1">{{ service }}</h4>
                  </div>
                </div>
              </div>

              <!-- Reviews Tab -->
              <div v-if="activeTab === 'reviews'" class="space-y-6">
                <!-- Review Form -->
                <div v-if="showReviewForm" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Write a Review</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rating
                      </label>
                      <div class="flex items-center">
                        <button
                          v-for="star in 5"
                          :key="star"
                          @click="newReview.rating = star"
                          class="text-2xl"
                          :class="star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'"
                        >
                          ★
                        </button>
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Your Review
                      </label>
                      <textarea
                        v-model="newReview.comment"
                        rows="4"
                        class="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD]"
                        placeholder="Share your experience..."
                      ></textarea>
                    </div>
                    <div class="flex justify-end space-x-3">
                      <button
                        @click="showReviewForm = false"
                        class="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        @click="handleReviewSubmit"
                        class="px-4 py-2 rounded-lg bg-[#246BFD] text-white hover:bg-[#5089FF]"
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Reviews List -->
                <div class="space-y-6">
                  <div
                    v-for="review in pharmacy.reviews"
                    :key="review.id"
                    class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center">
                        <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <span class="text-gray-600 dark:text-gray-300 font-medium">
                            {{ review.user.charAt(0) }}
                          </span>
                        </div>
                        <div class="ml-3">
                          <p class="font-medium text-gray-900 dark:text-white">{{ review.user }}</p>
                          <p class="text-sm text-gray-500 dark:text-gray-400">
                            {{ new Date(review.date).toLocaleDateString() }}
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center">
                        <span class="text-yellow-400 mr-1">★</span>
                        <span class="text-gray-600 dark:text-gray-300">{{ review.rating }}</span>
                      </div>
                    </div>
                    <p class="text-gray-600 dark:text-gray-300">{{ review.comment }}</p>
                  </div>
                </div>
              </div>

              <!-- Medications Tab -->
              <div v-if="activeTab === 'medications'" class="space-y-6">
                <!-- Prescription Upload -->
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Upload Prescription</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prescription File
                      </label>
                      <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 dark:border-gray-600 border-dashed rounded-lg hover:border-[#246BFD] dark:hover:border-[#246BFD] transition-colors">
                        <div class="space-y-1 text-center">
                          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                          </svg>
                          <div class="flex text-sm text-gray-600 dark:text-gray-400">
                            <label class="relative cursor-pointer rounded-md font-medium text-[#246BFD] hover:text-[#5089FF] focus-within:outline-none">
                              <span>Upload a file</span>
                              <input
                                type="file"
                                class="sr-only"
                                @change="handleFileChange"
                                accept=".pdf,.jpg,.jpeg,.png"
                              />
                            </label>
                            <p class="pl-1">or drag and drop</p>
                          </div>
                          <p class="text-xs text-gray-500 dark:text-gray-400">
                            PDF, JPG, PNG up to 5MB
                          </p>
                        </div>
                      </div>
                      <p v-if="prescriptionFile" class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        Selected file: {{ prescriptionFile.name }}
                      </p>
                      <p v-if="prescriptionError" class="mt-2 text-sm text-red-500 dark:text-red-400">
                        {{ prescriptionError }}
                      </p>
                    </div>
                    <button
                      @click="handlePrescriptionUpload"
                      :disabled="!prescriptionFile || isUploading"
                      class="w-full px-4 py-2 rounded-lg bg-[#246BFD] text-white hover:bg-[#5089FF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span v-if="isUploading" class="flex items-center justify-center">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </span>
                      <span v-else>Upload Prescription</span>
                    </button>
                  </div>
                </div>

                <!-- Pickup Schedule -->
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Schedule Pickup</h3>
                  <div class="space-y-4">
                    <DateTimePicker
                      v-model="pickupDateTime"
                      label="Pickup Date and Time"
                      format="datetime"
                      :min-date="new Date().toISOString()"
                      helper="Select when you'd like to pick up your prescription"
                      :error="pickupError || undefined"
                      required
                    />
                    <button
                      @click="handlePickupSchedule"
                      :disabled="!pickupDateTime || isScheduling"
                      class="w-full px-4 py-2 rounded-lg bg-[#246BFD] text-white hover:bg-[#5089FF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span v-if="isScheduling" class="flex items-center justify-center">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Scheduling...
                      </span>
                      <span v-else>Schedule Pickup</span>
                    </button>
                  </div>
                </div>

                <!-- Medications List -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="medication in pharmacy.medications"
                    :key="medication.id"
                    class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div class="flex items-start justify-between mb-4">
                      <div>
                        <h4 class="font-medium text-gray-900 dark:text-white mb-1">{{ medication.name }}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-300">{{ medication.description }}</p>
                      </div>
                      <span
                        class="px-3 py-1 rounded-full text-sm font-medium"
                        :class="medication.inStock ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
                      >
                        {{ medication.inStock ? 'In Stock' : 'Out of Stock' }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-lg font-medium text-gray-900 dark:text-white">
                        ${{ medication.price }}
                      </span>
                      <span
                        v-if="medication.requiresPrescription"
                        class="text-sm text-gray-500 dark:text-gray-400"
                      >
                        Requires Prescription
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="lg:w-96 flex-shrink-0">
          <!-- Location Card -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-8 scroll-animate slide-up delay-200">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Location</h3>
              <div class="h-64 rounded-lg overflow-hidden mb-4">
                <PharmacyMap
                  :location="pharmacy.location"
                  :pharmacy-name="pharmacy.name"
                />
              </div>
              <p class="text-gray-600 dark:text-gray-300">{{ pharmacy.address }}</p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg scroll-animate slide-up delay-300">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div class="space-y-3">
                <button
                  @click="showReviewForm = true"
                  class="w-full px-4 py-3 rounded-lg bg-[#246BFD] text-white hover:bg-[#5089FF] transition-colors"
                >
                  Write a Review
                </button>
                <a
                  :href="`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}`"
                  target="_blank"
                  class="block w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300 text-center"
                >
                  Get Directions
                </a>
                <a
                  :href="`tel:${pharmacy.phone}`"
                  class="block w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300 text-center"
                >
                  Call Pharmacy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scroll-animate {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.scroll-animate.visible {
  opacity: 1;
  transform: translateY(0);
}
</style> 