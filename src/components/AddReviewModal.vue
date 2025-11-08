<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNotification } from '@/composables/useNotification';
import RatingStars from './RatingStars.vue';

interface Props {
  show: boolean;
  targetType: 'pharmacy' | 'medication' | 'order';
  targetId: string;
  targetName: string;
  orderId?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', data: {
    rating: number;
    title: string;
    comment: string;
  }): void;
}>();

const notification = useNotification();

const rating = ref(0);
const title = ref('');
const comment = ref('');
const submitting = ref(false);

const canSubmit = computed(() => {
  return rating.value > 0 && title.value.trim().length > 0 && comment.value.trim().length > 0;
});

const handleSubmit = async () => {
  if (!canSubmit.value) {
    notification.warning('Incomplete Review', 'Please fill in all fields and provide a rating.');
    return;
  }

  submitting.value = true;

  try {
    emit('submit', {
      rating: rating.value,
      title: title.value.trim(),
      comment: comment.value.trim(),
    });

    notification.success('Review Submitted', 'Thank you for your feedback!');
    
    rating.value = 0;
    title.value = '';
    comment.value = '';
    
    emit('close');
  } catch (error) {
    notification.error('Submission Failed', 'Failed to submit review. Please try again.');
  } finally {
    submitting.value = false;
  }
};

const handleClose = () => {
  if (!submitting.value) {
    emit('close');
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="handleClose"
      >
        <div class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 z-10 flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Write a Review</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Share your experience with {{ targetName }}
              </p>
            </div>
            <button
              @click="handleClose"
              class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              :disabled="submitting"
            >
              <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-6">
            <div>
              <label class="block mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                Your Rating <span class="text-red-500">*</span>
              </label>
              <div class="flex items-center gap-2">
                <RatingStars
                  :rating="rating"
                  :interactive="true"
                  size="xl"
                  @update:rating="rating = $event"
                />
                <span v-if="rating > 0" class="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {{ ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating] }}
                </span>
              </div>
            </div>

            <div>
              <label class="block mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                Review Title <span class="text-red-500">*</span>
              </label>
              <input
                v-model="title"
                type="text"
                placeholder="Summarize your experience"
                maxlength="100"
                class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-[#246BFD] focus:border-transparent transition-all"
                :disabled="submitting"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ title.length }}/100 characters
              </p>
            </div>

            <div>
              <label class="block mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                Your Review <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="comment"
                rows="6"
                placeholder="Tell us more about your experience..."
                maxlength="1000"
                class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-[#246BFD] focus:border-transparent transition-all resize-none"
                :disabled="submitting"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {{ comment.length }}/1000 characters
              </p>
            </div>

            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <div class="flex gap-3">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <p class="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                    Review Guidelines
                  </p>
                  <ul class="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Be honest and specific about your experience</li>
                    <li>• Focus on your personal experience with the {{ targetType }}</li>
                    <li>• Avoid profanity and personal attacks</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="sticky bottom-0 flex gap-3 p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
            <button
              @click="handleClose"
              class="flex-1 px-6 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              :disabled="submitting"
            >
              Cancel
            </button>
            <button
              @click="handleSubmit"
              class="flex-1 px-6 py-3 rounded-xl bg-[#246BFD] text-white font-semibold hover:bg-[#5089FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :disabled="!canSubmit || submitting"
            >
              <svg v-if="submitting" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ submitting ? 'Submitting...' : 'Submit Review' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>

