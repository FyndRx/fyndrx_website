<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useInView } from '@/composables/useInView';
import { newsletterService } from '@/services/newsletter';
import { validationRules as globalValidationRules, validateForm } from '@/utils/validation';

const sectionRef = ref<HTMLElement | null>(null);
const { inView } = useInView(sectionRef, { threshold: 0.2 });

const benefits = [
  {
    title: 'Weekly health tips',
    text: 'Expert-curated advice from licensed pharmacists',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Drug shortage alerts',
    text: 'Be first to know when medications are restocked',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  },
  {
    title: 'Exclusive discounts',
    text: 'Subscriber-only deals from partner pharmacies',
    icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
  },
];

const email = ref('');
const loading = ref(false);
const success = ref<string | null>(null);
const error = ref<string | null>(null);
const fieldErrors = reactive<Record<string, string>>({});

const formValidationRules = {
  email: [
    globalValidationRules.required,
    globalValidationRules.email,
  ],
};

const handleSubmit = async () => {
  try {
    // Reset states
    loading.value = true;
    error.value = null;
    success.value = null;
    Object.keys(fieldErrors).forEach(key => delete fieldErrors[key]);

    // Validate form
    const errors = validateForm({ email: email.value }, formValidationRules);
    if (errors.length > 0) {
      errors.forEach(err => {
        fieldErrors[err.field] = err.message;
      });
      return;
    }

    // Submit form
    await newsletterService.subscribe(email.value);
    success.value = 'Thank you for subscribing to our newsletter!';
    email.value = '';
  } catch (err: any) {
    if (err.response?.data?.message) {
      error.value = err.response.data.message;
    } else {
      error.value = err instanceof Error ? err.message : 'Failed to subscribe to newsletter';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<script lang="ts">
  export default {
    name: 'NewsletterSignup',
  }
</script>

<template>
  <section
    ref="sectionRef"
    class="newsletter-panel relative overflow-hidden mx-4 sm:mx-6 lg:mx-auto lg:max-w-7xl my-10 py-14 sm:py-20 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-brand-600 to-brand-500 shadow-float"
    :class="{ 'is-in': inView }"
  >
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute -top-32 -right-24 w-[26rem] h-[26rem] rounded-full bg-white/12 blur-3xl"></div>
      <div class="absolute -bottom-40 -left-24 w-[26rem] h-[26rem] rounded-full bg-accent-500/20 blur-3xl"></div>
    </div>

    <div class="relative px-5 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="grid items-center grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
        <!-- Pitch -->
        <div class="reveal-left">
          <h2 class="mb-4 text-3xl font-medium text-white sm:text-4xl">
            Stay Updated with FyndRx
          </h2>
          <p class="mb-8 text-lg sm:text-xl text-white/85">
            Join thousands of subscribers who get health tips, drug alerts, and exclusive offers delivered straight to their inbox.
          </p>
          <ul class="space-y-4">
            <li v-for="benefit in benefits" :key="benefit.title" class="flex items-start gap-3">
              <span class="flex items-center justify-center w-10 h-10 mt-0.5 rounded-full shrink-0 bg-white/12 ring-1 ring-white/20">
                <svg class="w-5 h-5 text-accent-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="benefit.icon" />
                </svg>
              </span>
              <div>
                <p class="font-semibold text-white">{{ benefit.title }}</p>
                <p class="text-sm text-white/75">{{ benefit.text }}</p>
              </div>
            </li>
          </ul>
        </div>

        <!-- Form -->
        <div class="reveal-right">
          <div class="p-6 bg-white shadow-float sm:p-8 rounded-3xl dark:bg-gray-800">
            <p class="mb-5 text-gray-600 dark:text-gray-300">
              Stay updated with our latest news, offers, and healthcare tips.
            </p>

            <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
              <div>
                <label for="newsletter-email" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div class="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="newsletter-email"
                    v-model="email"
                    type="email"
                    autocomplete="email"
                    inputmode="email"
                    placeholder="Enter your email"
                    :aria-invalid="fieldErrors.email ? 'true' : undefined"
                    :aria-describedby="fieldErrors.email ? 'newsletter-email-error' : undefined"
                    class="flex-1 min-w-0 px-5 py-3 text-gray-900 placeholder-gray-400 transition bg-white border rounded-full outline-none focus:ring-4 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    :class="fieldErrors.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500/20 dark:border-white/10'"
                  />
                  <button
                    type="submit"
                    class="inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white transition duration-200 rounded-full bg-brand-500 shadow-glow-brand ease-out-quart hover:bg-brand-400 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
                    :disabled="loading"
                  >
                    <svg v-if="loading" class="w-5 h-5 animate-spin motion-reduce:animate-none" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{{ loading ? 'Subscribing...' : 'Subscribe' }}</span>
                  </button>
                </div>
                <p v-if="fieldErrors.email" id="newsletter-email-error" class="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                  {{ fieldErrors.email }}
                </p>
              </div>

              <!-- Status messages: announced to assistive tech when they appear -->
              <div aria-live="polite">
                <p v-if="error" class="p-3 text-sm text-red-700 rounded-2xl bg-red-50 dark:bg-red-500/10 dark:text-red-300">
                  {{ error }}
                </p>
                <p v-if="success" class="flex items-center gap-2 p-3 text-sm text-green-700 rounded-2xl bg-green-50 dark:bg-green-500/10 dark:text-green-300">
                  <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ success }}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Scroll-in via `.is-in` (useInView). Slides vertically on small screens so nothing starts off-screen. */
.reveal-left,
.reveal-right {
  opacity: 0;
  transition:
    opacity 0.7s cubic-bezier(0.25, 1, 0.5, 1),
    transform 0.7s cubic-bezier(0.25, 1, 0.5, 1);
}

.reveal-left {
  transform: translateX(-24px);
}

.reveal-right {
  transform: translateX(24px);
  transition-delay: 0.1s;
}

.is-in .reveal-left,
.is-in .reveal-right {
  opacity: 1;
  transform: none;
}

@media (max-width: 1023px) {
  .reveal-left,
  .reveal-right {
    transform: translateY(18px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal-left,
  .reveal-right {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
