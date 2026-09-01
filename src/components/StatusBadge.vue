<script setup lang="ts">
import { computed } from 'vue';
import { getStatusColor } from '@/utils/statusColors';
import StatusIcon from '@/components/StatusIcon.vue';

const props = withDefaults(defineProps<{
  status: string;
  /** xs = tight list rows (notifications), sm = card/list badges, md = detail-page hero badge */
  size?: 'xs' | 'sm' | 'md';
  showDot?: boolean;
  showIcon?: boolean;
  glow?: boolean;
}>(), {
  size: 'sm',
  showDot: false,
  showIcon: false,
  glow: false,
});

const style = computed(() => getStatusColor(props.status));

const sizeClass = computed(() => ({
  xs: 'px-2 py-0.5 text-[10px] gap-1',
  sm: 'px-3 py-1 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
}[props.size]));

const iconSizeClass = computed(() => ({ xs: 'w-3 h-3', sm: 'w-3.5 h-3.5', md: 'w-4 h-4' }[props.size]));
const dotSizeClass = computed(() => (props.size === 'md' ? 'w-2 h-2' : 'w-1.5 h-1.5'));
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border font-bold whitespace-nowrap"
    :class="[style.pill, sizeClass]"
  >
    <StatusIcon v-if="showIcon" :status="status" :class="iconSizeClass" />
    <span
      v-else-if="showDot"
      class="rounded-full shrink-0"
      :class="[style.dot, dotSizeClass, glow ? style.glow : '']"
    ></span>
    {{ style.label }}
  </span>
</template>
