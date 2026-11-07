<script setup lang="ts">
/**
 * Renders a catalog product name.
 *
 * The backend composes names as
 *   DRUG • BRAND • FORM • STRENGTH+UNIT • UOM
 *   e.g. IBUPROFEN • ABBOTT • GENERAL ORAL SOLID • 400MG • TABLET(S)
 * which is hard to scan as one shouting line. Here the drug becomes the title
 * and the rest become small chips, with the dose (400MG) highlighted and the
 * unit of measure (Tablet(s)) shown as a quiet suffix.
 *
 * Names without the separator render unchanged, so it is safe anywhere.
 */
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  name: string;
  /** Tighter chips for dense lists such as order summaries. */
  compact?: boolean;
  /** Hide the chips and show only the title. */
  titleOnly?: boolean;
}>(), { compact: false, titleOnly: false });

const SEPARATOR = /\s+[•·]\s+/;

// "IBUPROFEN" -> "Ibuprofen", "GENERAL ORAL SOLID" -> "General Oral Solid".
// Doses keep their casing: "400MG" stays "400MG", "tablet(s)" -> "Tablet(s)".
const prettify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/(^|[\s(/-])([a-z])/g, (_, lead: string, ch: string) => lead + ch.toUpperCase());

const parts = computed(() => {
  const segments = (props.name || '').split(SEPARATOR).map(s => s.trim()).filter(Boolean);
  if (segments.length <= 1) {
    return { title: props.name, chips: [] as { text: string; kind: 'dose' | 'uom' | 'plain' }[] };
  }

  const [drug, ...rest] = segments;
  const isDose = (s: string) => /\d/.test(s);
  const lastIsUom = rest.length > 1 && !isDose(rest[rest.length - 1]);

  const chips = rest.map((text, i) => {
    if (isDose(text)) return { text: text.toUpperCase(), kind: 'dose' as const };
    if (lastIsUom && i === rest.length - 1) return { text: prettify(text), kind: 'uom' as const };
    return { text: prettify(text), kind: 'plain' as const };
  });

  return { title: prettify(drug), chips };
});

const chipClass = (kind: 'dose' | 'uom' | 'plain') => {
  if (kind === 'dose') {
    return 'bg-[#246BFD]/10 text-[#246BFD] dark:bg-[#246BFD]/20 dark:text-blue-300 font-bold';
  }
  if (kind === 'uom') {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-semibold';
  }
  return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 font-medium';
};
</script>

<template>
  <div class="min-w-0">
    <span class="block truncate" :title="name">{{ parts.title }}</span>
    <div
      v-if="!titleOnly && parts.chips.length"
      class="flex flex-wrap items-center gap-1"
      :class="compact ? 'mt-0.5' : 'mt-1.5'"
    >
      <span
        v-for="(chip, i) in parts.chips"
        :key="i"
        class="inline-flex items-center rounded-md whitespace-nowrap"
        :class="[chipClass(chip.kind), compact ? 'px-1.5 py-px text-[9px]' : 'px-2 py-0.5 text-[11px]']"
      >{{ chip.text }}</span>
    </div>
  </div>
</template>
