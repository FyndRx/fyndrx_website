<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const isOpen = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);

const HOUR_LIST = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
const MIN_LIST = ['00', '15', '30', '45'];

function parse(val: string) {
  const [h, m] = (val || '08:00').split(':');
  const h24 = parseInt(h, 10);
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? '12' : String(h24 % 12);
  const minVal = parseInt(m || '0', 10);
  const snapped = MIN_LIST.reduce((prev, curr) =>
    Math.abs(parseInt(curr) - minVal) < Math.abs(parseInt(prev) - minVal) ? curr : prev
  );
  return { hour: h12, minute: snapped, period };
}

const sel = ref(parse(props.modelValue));

watch(() => props.modelValue, (v) => { sel.value = parse(v); }, { immediate: true });

const display = computed(() => `${sel.value.hour}:${sel.value.minute} ${sel.value.period}`);

function to24h() {
  let h = parseInt(sel.value.hour, 10);
  if (sel.value.period === 'AM' && h === 12) h = 0;
  else if (sel.value.period === 'PM' && h !== 12) h += 12;
  emit('update:modelValue', `${String(h).padStart(2, '0')}:${sel.value.minute}`);
}

function pickHour(h: string) { sel.value.hour = h; to24h(); }
function pickMin(m: string) { sel.value.minute = m; to24h(); }
function pickPeriod(p: string) { sel.value.period = p; to24h(); }

function outside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) isOpen.value = false;
}

onMounted(() => document.addEventListener('mousedown', outside));
onUnmounted(() => document.removeEventListener('mousedown', outside));
</script>

<template>
  <div ref="wrapperRef" class="relative select-none">
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:border-[#246BFD] hover:text-[#246BFD] focus:outline-none focus:ring-2 focus:ring-[#246BFD]/20 transition-all min-w-[7rem]"
      :class="isOpen ? 'border-[#246BFD] text-[#246BFD] ring-2 ring-[#246BFD]/20' : ''"
    >
      <svg class="w-3.5 h-3.5 flex-shrink-0 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ display }}</span>
      <svg class="w-3 h-3 text-gray-400 ml-auto flex-shrink-0 transition-transform" :class="isOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute top-full mt-2 left-0 z-[999] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl shadow-black/10 p-3 flex gap-1"
      >
        <!-- Hours column -->
        <div class="flex flex-col overflow-y-auto max-h-52 gap-0.5 pr-0.5">
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center pb-1.5 sticky top-0 bg-white dark:bg-gray-800 z-10">HR</p>
          <button
            v-for="h in HOUR_LIST" :key="h" type="button"
            @click="pickHour(h)"
            :class="[
              'w-10 py-1.5 rounded-lg text-sm font-medium transition-all text-center',
              sel.hour === h ? 'bg-[#246BFD] text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
            ]"
          >{{ h }}</button>
        </div>

        <div class="w-px bg-gray-100 dark:bg-gray-700 mx-0.5 self-stretch"></div>

        <!-- Minutes column -->
        <div class="flex flex-col gap-0.5">
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center pb-1.5">MIN</p>
          <button
            v-for="m in MIN_LIST" :key="m" type="button"
            @click="pickMin(m)"
            :class="[
              'w-10 py-1.5 rounded-lg text-sm font-medium transition-all text-center',
              sel.minute === m ? 'bg-[#246BFD] text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
            ]"
          >{{ m }}</button>
        </div>

        <div class="w-px bg-gray-100 dark:bg-gray-700 mx-0.5 self-stretch"></div>

        <!-- AM/PM column -->
        <div class="flex flex-col gap-0.5">
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center pb-1.5">‌</p>
          <button
            v-for="p in ['AM', 'PM']" :key="p" type="button"
            @click="pickPeriod(p)"
            :class="[
              'w-12 py-1.5 rounded-lg text-sm font-semibold transition-all text-center',
              sel.period === p ? 'bg-[#246BFD] text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
            ]"
          >{{ p }}</button>
        </div>
      </div>
    </Transition>
  </div>
</template>
