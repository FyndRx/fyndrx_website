<script setup lang="ts">
interface Props {
  show: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  errorMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  message: undefined,
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'danger',
  loading: false,
  errorMessage: undefined,
});

const emit = defineEmits<{ confirm: []; cancel: [] }>();

const close = () => {
  if (!props.loading) emit('cancel');
};
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        @click.self="close"
      >
        <Transition
          appear
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
        >
          <div class="bg-white dark:bg-gray-800 rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden text-center p-8">
            <div
              class="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
              :class="variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'"
            >
              <slot name="icon">
                <svg v-if="variant === 'danger'" class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <svg v-else class="w-8 h-8 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </slot>
            </div>

            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ title }}</h3>
            <p v-if="message" class="text-sm text-gray-500 dark:text-gray-400">{{ message }}</p>
            <slot />

            <div v-if="errorMessage" class="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-medium">
              {{ errorMessage }}
            </div>

            <div class="mt-6 flex gap-3">
              <button
                type="button"
                :disabled="loading"
                @click="emit('cancel')"
                class="flex-1 px-5 py-3 rounded-full border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                {{ cancelLabel }}
              </button>
              <button
                type="button"
                :disabled="loading"
                @click="emit('confirm')"
                class="flex-1 px-5 py-3 rounded-full font-bold text-white shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                :class="variant === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-[#246BFD] hover:bg-[#5089FF] shadow-[#246BFD]/20'"
              >
                <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? 'Please wait...' : confirmLabel }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
