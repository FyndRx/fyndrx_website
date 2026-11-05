<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { StarIcon, CheckBadgeIcon } from '@heroicons/vue/24/solid';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon, CheckIcon } from '@heroicons/vue/24/outline';
import Button from '@/components/Button.vue';
import { useInView } from '@/composables/useInView';
import { useCarousel } from '@/composables/useCarousel';

interface Testimony {
  id: string;
  name: string;
  role: string | null;
  location: string | null;
  avatar: string | null;
  rating: number;
  testimony: string;
  date: string;
  verified: boolean;
}

const testimonies = ref<Testimony[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const sectionRef = ref<HTMLElement | null>(null);
const carouselRef = ref<HTMLElement | null>(null);

const { inView } = useInView(sectionRef, { threshold: 0.1 });
const { canScrollLeft, canScrollRight, update: updateEdges, scrollByCard, fadeStyle } = useCarousel(carouselRef);

// Modal state
const isModalOpen = ref(false);
const isSubmitting = ref(false);
const submissionSuccess = ref(false);
const submitError = ref<string | null>(null);
const shareButtonRef = ref<HTMLButtonElement | null>(null);
const nameInputRef = ref<HTMLInputElement | null>(null);
const form = ref({
  name: '',
  role: '',
  location: '',
  rating: 5,
  testimony: '',
});

// Avatars that fail to load fall back to the initial.
const brokenAvatars = ref<Set<string>>(new Set());
const onAvatarError = (id: string) => {
  brokenAvatars.value = new Set(brokenAvatars.value).add(id);
};

const fetchTestimonies = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/testimonies?page=1`, {
      headers: {
        'X-API-Key': import.meta.env.VITE_API_KEY as string,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch testimonies');

    const data = await response.json();
    testimonies.value = data.data;
  } catch (err) {
    console.error('Error fetching testimonies:', err);
    error.value = 'Failed to load stories.';
  } finally {
    isLoading.value = false;
    await nextTick();
    updateEdges();
  }
};

const openModal = async () => {
  submitError.value = null;
  isModalOpen.value = true;
  await nextTick();
  nameInputRef.value?.focus();
};

const closeModal = () => {
  isModalOpen.value = false;
  // Return focus to what opened the dialog
  nextTick(() => shareButtonRef.value?.focus());
};

const submitTestimony = async () => {
  if (!form.value.name || !form.value.testimony) return;

  try {
    isSubmitting.value = true;
    submitError.value = null;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/testimonies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': import.meta.env.VITE_API_KEY as string,
      },
      body: JSON.stringify(form.value),
    });

    if (!response.ok) throw new Error('Submission failed');

    submissionSuccess.value = true;

    // Reset and close after a beat
    setTimeout(() => {
      closeModal();
      submissionSuccess.value = false;
      form.value = { name: '', role: '', location: '', rating: 5, testimony: '' };
    }, 2000);
  } catch (err) {
    console.error('Error submitting:', err);
    submitError.value = "We couldn't submit your story. Please check your connection and try again.";
  } finally {
    isSubmitting.value = false;
  }
};

// Escape closes the dialog; the page behind doesn't scroll while it's open.
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isModalOpen.value) closeModal();
};

watch(isModalOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : '';
});

onMounted(() => {
  fetchTestimonies();
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});

const fieldClass =
  'w-full px-4 py-2.5 rounded-full border border-gray-200 bg-white text-gray-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 dark:border-white/10 dark:bg-gray-900 dark:text-white';

const navButtonClass =
  'flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 bg-white/70 text-gray-600 backdrop-blur transition duration-200 ease-out-quart hover:border-brand-500 hover:text-brand-500 active:scale-95 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:border-white/10 dark:bg-white/5 dark:text-gray-300';
</script>

<script lang="ts">
export default {
  name: 'Testimonials',
};
</script>

<template>
  <section ref="sectionRef" class="relative py-16 sm:py-24" :class="{ 'is-in': inView }">
    <div class="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex flex-col justify-between gap-6 mb-10 sm:mb-12 md:flex-row md:items-end reveal">
        <div class="max-w-2xl">
          <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl dark:text-white">
            Stories from our <span class="text-brand-500">Community</span>
          </h2>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
            See how FyndRx is making healthcare accessible for people across Ghana.
          </p>
        </div>

        <div class="flex items-center gap-3 sm:gap-4">
          <button
            ref="shareButtonRef"
            type="button"
            class="px-6 py-2.5 font-medium text-gray-900 transition duration-200 border border-gray-200 rounded-full shadow-card bg-white/70 backdrop-blur ease-out-quart hover:-translate-y-0.5 hover:border-brand-500 hover:text-brand-600 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
            @click="openModal"
          >
            Share Your Story
          </button>

          <div v-if="testimonies.length > 1" class="hidden gap-2 md:flex">
            <button type="button" aria-label="Previous stories" :disabled="!canScrollLeft" :class="navButtonClass" @click="scrollByCard(-1)">
              <ChevronLeftIcon class="w-5 h-5" />
            </button>
            <button type="button" aria-label="Next stories" :disabled="!canScrollRight" :class="navButtonClass" @click="scrollByCard(1)">
              <ChevronRightIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex gap-6 pb-8 overflow-hidden" aria-hidden="true">
        <div
          v-for="n in 3"
          :key="n"
          class="shrink-0 basis-[85%] sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)] rounded-3xl bg-white/60 p-8 shadow-card ring-1 ring-white/70 animate-pulse motion-reduce:animate-none dark:bg-gray-800/40 dark:ring-white/10"
        >
          <div class="flex gap-1 mb-6">
            <div v-for="i in 5" :key="i" class="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div class="space-y-3">
            <div class="w-full h-3 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div class="w-full h-3 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div class="w-2/3 h-3 bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
          <div class="flex items-center gap-4 pt-6 mt-10 border-t border-gray-100 dark:border-white/10">
            <div class="w-10 h-10 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            <div class="space-y-2">
              <div class="w-28 h-3.5 bg-gray-200 rounded dark:bg-gray-700"></div>
              <div class="w-20 h-3 bg-gray-200 rounded dark:bg-gray-700"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error / empty -->
      <div
        v-else-if="error || testimonies.length === 0"
        class="flex flex-col items-center px-6 py-14 text-center rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10"
        role="status"
      >
        <span class="flex items-center justify-center mb-4 w-14 h-14 rounded-2xl bg-accent-500/10 text-accent-600 dark:text-accent-400">
          <StarIcon class="w-7 h-7" />
        </span>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ error ? "We couldn't load stories right now" : 'No stories yet' }}
        </h3>
        <p class="max-w-md mt-2 text-gray-600 dark:text-gray-300">
          {{ error ? 'Please try again in a moment.' : 'Be the first to tell the community how FyndRx has helped you.' }}
        </p>
        <button
          type="button"
          class="px-6 py-3 mt-6 font-medium transition duration-200 border-2 rounded-full text-brand-600 border-brand-500 ease-out-quart hover:bg-brand-500 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:text-brand-300 dark:hover:text-white"
          @click="error ? fetchTestimonies() : openModal()"
        >
          {{ error ? 'Try again' : 'Share Your Story' }}
        </button>
      </div>

      <!-- Carousel (bleeds to the screen edge on phones) -->
      <div
        v-else
        ref="carouselRef"
        class="testimony-scroller flex gap-6 pb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 overflow-x-auto snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 lg:scroll-px-0 scrollbar-hide"
        :style="fadeStyle"
        @scroll.passive="updateEdges"
      >
        <article
          v-for="(story, index) in testimonies"
          :key="story.id"
          class="testimony-card relative flex flex-col justify-between overflow-hidden shrink-0 basis-[85%] sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)] snap-start rounded-3xl bg-white/70 p-6 sm:p-8 shadow-card ring-1 ring-white/70 backdrop-blur-md transition-shadow duration-300 hover:shadow-card-hover dark:bg-gray-800/60 dark:ring-white/10"
          :style="{ '--i': index }"
        >
          <!-- Decorative quote mark -->
          <svg class="absolute w-20 h-20 -top-1 right-4 text-brand-500/10" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
          </svg>

          <div class="relative">
            <div class="flex gap-1 mb-5" :aria-label="`Rated ${story.rating} out of 5`" role="img">
              <StarIcon
                v-for="i in 5"
                :key="i"
                class="w-5 h-5"
                :class="i <= story.rating ? 'text-accent-500' : 'text-gray-200 dark:text-gray-700'"
              />
            </div>

            <blockquote class="mb-8 text-lg leading-relaxed text-gray-700 dark:text-gray-200">
              “{{ story.testimony }}”
            </blockquote>
          </div>

          <div class="relative flex items-center gap-4 pt-6 border-t border-gray-900/5 dark:border-white/10">
            <img
              v-if="story.avatar && !brokenAvatars.has(story.id)"
              :src="story.avatar"
              :alt="story.name"
              class="object-cover w-11 h-11 rounded-full shrink-0 ring-2 ring-white dark:ring-gray-700"
              loading="lazy"
              @error="onAvatarError(story.id)"
            />
            <div
              v-else
              class="flex items-center justify-center w-11 h-11 text-lg font-bold text-white rounded-full shrink-0 bg-gradient-to-br from-brand-500 to-brand-400"
              aria-hidden="true"
            >
              {{ story.name.charAt(0) }}
            </div>
            <div class="min-w-0">
              <h3 class="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                <span class="truncate">{{ story.name }}</span>
                <CheckBadgeIcon v-if="story.verified" class="w-5 h-5 text-brand-500 shrink-0" title="Verified" />
              </h3>
              <p v-if="story.role || story.location" class="text-sm text-gray-500 dark:text-gray-400">
                <span v-if="story.role">{{ story.role }}</span>
                <span v-if="story.role && story.location"> • </span>
                <span v-if="story.location">{{ story.location }}</span>
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Submission modal -->
    <Transition name="modal">
      <div
        v-if="isModalOpen"
        class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="story-dialog-title"
          class="modal-panel w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl dark:bg-gray-800"
        >
          <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-gray-800/95">
            <h3 id="story-dialog-title" class="text-lg font-bold text-gray-900 dark:text-white">Share Your Story</h3>
            <button
              type="button"
              aria-label="Close"
              class="p-1 text-gray-400 transition-colors rounded-full hover:text-gray-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:hover:text-gray-200"
              @click="closeModal"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Success -->
          <div v-if="submissionSuccess" class="p-12 text-center" role="status">
            <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full dark:bg-green-500/15">
              <CheckIcon class="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Thank You!</h4>
            <p class="text-gray-500 dark:text-gray-400">Your story has been submitted for review.</p>
          </div>

          <!-- Form -->
          <form v-else class="p-6 space-y-4" @submit.prevent="submitTestimony">
            <div>
              <label for="story-name" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Your Name</label>
              <input id="story-name" ref="nameInputRef" v-model="form.name" type="text" :class="fieldClass" placeholder="First Name Last Name" required />
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label for="story-role" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Role (Optional)</label>
                <input id="story-role" v-model="form.role" type="text" :class="fieldClass" placeholder="e.g. Patient" />
              </div>
              <div>
                <label for="story-location" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Location (Optional)</label>
                <input id="story-location" v-model="form.location" type="text" :class="fieldClass" placeholder="e.g. Accra" />
              </div>
            </div>

            <fieldset>
              <legend class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Rating</legend>
              <div class="flex gap-1">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  :aria-label="`${star} star${star > 1 ? 's' : ''}`"
                  :aria-pressed="star <= form.rating"
                  class="p-1 transition-transform rounded-full hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
                  @click="form.rating = star"
                >
                  <StarIcon class="w-8 h-8 transition-colors" :class="star <= form.rating ? 'text-accent-500' : 'text-gray-200 dark:text-gray-700'" />
                </button>
              </div>
            </fieldset>

            <div>
              <label for="story-text" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Your Experience</label>
              <textarea
                id="story-text"
                v-model="form.testimony"
                rows="4"
                class="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-gray-900 outline-none transition resize-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                placeholder="Share your experience..."
                required
              ></textarea>
            </div>

            <p v-if="submitError" class="px-4 py-3 text-sm text-red-700 rounded-2xl bg-red-50 dark:bg-red-500/10 dark:text-red-300" role="alert">
              {{ submitError }}
            </p>

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                class="px-4 py-2 font-medium text-gray-600 transition-colors rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeModal"
              >
                Cancel
              </button>
              <Button
                type="submit"
                :disabled="isSubmitting || !form.name || !form.testimony"
                class="!px-6 !py-2 !h-auto !text-sm"
              >
                <span v-if="isSubmitting">Submitting...</span>
                <span v-else>Submit Story</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
/* Scroll-in via `.is-in` (useInView): header, then cards stagger. */
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1),
    transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.testimony-card {
  opacity: 0;
  transform: translateY(18px);
  transition:
    opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1) calc(0.15s + var(--i) * 0.1s),
    transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) calc(0.15s + var(--i) * 0.1s),
    box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.is-in .reveal,
.is-in .testimony-card {
  opacity: 1;
  transform: none;
}

/* Edge fades: only a side that still has content gets one */
.testimony-scroller {
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 var(--fl, 0px), #000 calc(100% - var(--fr, 0px)), transparent 100%);
  mask-image: linear-gradient(to right, transparent 0, #000 var(--fl, 0px), #000 calc(100% - var(--fr, 0px)), transparent 100%);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Modal: backdrop fades; the panel scales up from 96% (and slides up from the bottom on phones). */
.modal-enter-active {
  transition: opacity 0.2s cubic-bezier(0.25, 1, 0.5, 1);
}
.modal-leave-active {
  transition: opacity 0.15s ease-in;
}
.modal-enter-active .modal-panel {
  transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-panel {
  transform: translateY(24px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .testimony-card {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .modal-panel {
    transition: none;
  }
}
</style>
