<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { pharmacyService } from '@/services/pharmacyService';
import type { PharmacyServiceGroup } from '@/models/Pharmacy';

const props = defineProps<{
  modelValue: string[];       // array of service slugs
  error?: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>();

const isOpen = ref(false);
const search = ref('');
const wrapperRef = ref<HTMLElement | null>(null);
const searchRef = ref<HTMLInputElement | null>(null);
const catalog = ref<PharmacyServiceGroup[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    catalog.value = await pharmacyService.getServicesCatalog();
  } catch {
    catalog.value = [];
  } finally {
    loading.value = false;
  }
  document.addEventListener('mousedown', onOutside);
});

onUnmounted(() => document.removeEventListener('mousedown', onOutside));

function onOutside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    isOpen.value = false;
    search.value = '';
  }
}

function open() {
  isOpen.value = true;
  setTimeout(() => searchRef.value?.focus(), 50);
}

function toggle(slug: string) {
  const next = props.modelValue.includes(slug)
    ? props.modelValue.filter(s => s !== slug)
    : [...props.modelValue, slug];
  emit('update:modelValue', next);
}

function remove(slug: string) {
  emit('update:modelValue', props.modelValue.filter(s => s !== slug));
}

function clearAll() {
  emit('update:modelValue', []);
}

const filteredCatalog = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return catalog.value;
  return catalog.value
    .map(group => ({
      ...group,
      services: group.services.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.slug.includes(q) ||
        (s.description ?? '').toLowerCase().includes(q)
      ),
    }))
    .filter(g => g.services.length > 0);
});

// Build a slug → name lookup for display
const slugMap = computed(() => {
  const m: Record<string, string> = {};
  for (const g of catalog.value) for (const s of g.services) m[s.slug] = s.name;
  return m;
});

const selectedNames = computed(() =>
  props.modelValue.map(slug => slugMap.value[slug] ?? slug)
);

const CATEGORY_COLORS: Record<string, string> = {
  dispensing:  'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  clinical:    'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300',
  diagnostic:  'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
  lab:         'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
  delivery:    'bg-[#246BFD]/8 dark:bg-[#246BFD]/15 text-[#246BFD]',
  wellness:    'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300',
  specialized: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
  operational: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
};
</script>

<template>
  <div ref="wrapperRef" class="relative">
    <!-- Trigger -->
    <div
      @click="open"
      class="min-h-[44px] w-full px-3 py-2 rounded-xl border cursor-text flex flex-wrap gap-1.5 items-center transition-all"
      :class="[
        isOpen
          ? 'border-[#246BFD] ring-2 ring-[#246BFD]/20 bg-white dark:bg-gray-800'
          : error
            ? 'border-red-400 bg-white dark:bg-gray-800'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
      ]"
    >
      <!-- Selected chips -->
      <span
        v-for="(slug, i) in modelValue"
        :key="slug"
        class="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 text-xs font-semibold rounded-full bg-[#246BFD] text-white"
      >
        {{ selectedNames[i] }}
        <button
          type="button"
          @click.stop="remove(slug)"
          class="w-4 h-4 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </span>

      <!-- Placeholder -->
      <span v-if="modelValue.length === 0" class="text-sm text-gray-400 dark:text-gray-500 select-none">
        Select services…
      </span>

      <!-- Right controls -->
      <div class="ml-auto flex items-center gap-1 pl-1 flex-shrink-0">
        <button
          v-if="modelValue.length > 0"
          type="button"
          @click.stop="clearAll"
          class="w-5 h-5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title="Clear all"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <svg
          class="w-4 h-4 text-gray-400 transition-transform duration-200"
          :class="isOpen ? 'rotate-180' : ''"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
    </div>

    <!-- Dropdown — fixed to the wrapper width, uses fixed positioning via portal-like z-index -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1 scale-[0.98]"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-1 scale-[0.98]"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 right-0 top-full mt-2 z-[999] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl shadow-black/10 overflow-hidden"
        style="min-width: 100%"
      >
        <!-- Search bar -->
        <div class="p-3 border-b border-gray-100 dark:border-gray-700">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              ref="searchRef"
              v-model="search"
              type="text"
              placeholder="Search services…"
              class="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#246BFD]/20 focus:border-[#246BFD] text-gray-900 dark:text-white placeholder-gray-400 transition-all"
              @click.stop
            />
          </div>
        </div>

        <!-- Results -->
        <div class="max-h-72 overflow-y-auto py-2">
          <div v-if="loading" class="py-10 text-center text-sm text-gray-400">Loading services…</div>

          <template v-else-if="filteredCatalog.length > 0">
            <div v-for="group in filteredCatalog" :key="group.category" class="mb-1">
              <!-- Category header -->
              <div class="px-4 py-1.5 flex items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{{ group.label }}</span>
                <div class="flex-1 h-px bg-gray-100 dark:bg-gray-700/60"></div>
              </div>

              <!-- Services in this category -->
              <button
                v-for="service in group.services"
                :key="service.slug"
                type="button"
                @click.stop="toggle(service.slug)"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
              >
                <!-- Checkbox indicator -->
                <div
                  class="w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  :class="modelValue.includes(service.slug)
                    ? 'bg-[#246BFD] border-[#246BFD]'
                    : 'border-gray-300 dark:border-gray-600 group-hover:border-[#246BFD]/50'"
                  style="width: 18px; height: 18px;"
                >
                  <svg v-if="modelValue.includes(service.slug)" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>

                <!-- Service info -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#246BFD] transition-colors">{{ service.name }}</p>
                  <p v-if="service.description" class="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{{ service.description }}</p>
                </div>

                <!-- Category pill -->
                <span
                  class="flex-shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full"
                  :class="CATEGORY_COLORS[service.category] ?? CATEGORY_COLORS.operational"
                >{{ service.category }}</span>
              </button>
            </div>
          </template>

          <div v-else class="py-10 text-center text-sm text-gray-400">No services match "{{ search }}"</div>
        </div>

        <!-- Footer: count + done -->
        <div class="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span class="text-xs font-medium text-gray-400">
            {{ modelValue.length }} selected
          </span>
          <button
            type="button"
            @click="isOpen = false; search = ''"
            class="px-4 py-1.5 text-xs font-bold rounded-full bg-[#246BFD] text-white hover:bg-[#1a56d6] active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
