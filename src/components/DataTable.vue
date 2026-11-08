<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * Data table used by the account pages (orders, transactions, prescriptions, ...).
 *
 * - Desktop: a real, semantic <table>.
 * - Below 1024px: the same markup restyles into labelled stacked rows (each cell shows its column
 *   label), so there is never a sideways-scrolling table. A column marked `primary` becomes the
 *   row's title; a column with an empty label (e.g. actions) is shown without a label.
 * - Cells are rendered through `#cell-<key>` slots (falls back to `row[key]`).
 * - Clickable rows are keyboard accessible (focusable, Enter/Space); put buttons/links inside
 *   cells with `@click.stop` so they don't also trigger the row.
 */
export interface DataTableColumn {
  key: string;
  /** Column heading. Leave empty for icon/action columns (no label on phones either). */
  label: string;
  align?: 'left' | 'right' | 'center';
  /** The row's title cell on phones (shown first, full width, no label). */
  primary?: boolean;
  /** Extra classes for the <td> (e.g. widths, whitespace-nowrap). */
  cellClass?: string;
  /** Extra classes for the <th>. */
  headerClass?: string;
  /**
   * In table mode, hide this column below the given viewport width (px). The dashboard sidebar
   * leaves little room between 1024 and ~1400px, so secondary columns step aside there. The
   * column still shows in the stacked phone/tablet layout.
   */
  hideBelow?: 1280 | 1400;
}

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn[];
    rows: T[];
    rowKey: (row: T) => string | number;
    /** Accessible name for the table (read by screen readers, not shown). */
    caption: string;
    clickable?: boolean;
    loading?: boolean;
    skeletonRows?: number;
  }>(),
  { clickable: false, loading: false, skeletonRows: 5 },
);

const emit = defineEmits<{ (e: 'row-click', row: T): void }>();

// Literal class strings so Tailwind can see them
const hideClass = (c: DataTableColumn) =>
  c.hideBelow === 1400 ? 'hidden min-[1400px]:table-cell' : c.hideBelow === 1280 ? 'hidden min-[1280px]:table-cell' : '';

const alignClass = (a?: 'left' | 'right' | 'center') =>
  a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

function activate(row: T) {
  if (props.clickable) emit('row-click', row);
}
</script>

<template>
  <div class="dt overflow-hidden rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
    <div class="overflow-x-auto">
      <table class="w-full text-sm" :aria-busy="loading">
        <caption class="sr-only">{{ caption }}</caption>

        <thead class="dt-head bg-white/50 dark:bg-white/5">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              scope="col"
              class="px-3 xl:px-4 py-3.5 text-xs font-semibold text-gray-500 whitespace-nowrap dark:text-gray-400"
              :class="[alignClass(col.align), hideClass(col), col.headerClass]"
            >{{ col.label }}</th>
          </tr>
        </thead>

        <tbody>
          <!-- Loading skeleton -->
          <template v-if="loading">
            <tr v-for="n in skeletonRows" :key="`sk-${n}`" class="dt-row border-t border-gray-200/70 dark:border-white/10" aria-hidden="true">
              <td v-for="col in columns" :key="col.key" class="px-3 xl:px-4 py-4" :class="hideClass(col)" :data-primary="col.primary || undefined" data-nolabel>
                <div class="h-4 rounded bg-gray-200 animate-pulse dark:bg-white/10" :class="col.primary ? 'w-40' : 'w-20'"></div>
              </td>
            </tr>
          </template>

          <!-- Rows -->
          <template v-else>
            <tr
              v-for="(row, index) in rows"
              :key="rowKey(row)"
              class="dt-row border-t border-gray-200/70 transition-colors duration-150 dark:border-white/10"
              :class="clickable ? 'cursor-pointer hover:bg-brand-500/5 focus-visible:bg-brand-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500/40' : ''"
              :tabindex="clickable ? 0 : undefined"
              @click="activate(row)"
              @keydown.enter.self="activate(row)"
              @keydown.space.self.prevent="activate(row)"
            >
              <td
                v-for="col in columns"
                :key="col.key"
                class="px-3 xl:px-4 py-4 align-middle text-gray-700 dark:text-gray-200"
                :class="[alignClass(col.align), hideClass(col), col.cellClass]"
                :data-label="col.label"
                :data-primary="col.primary || undefined"
                :data-nolabel="!col.label || undefined"
              >
                <slot :name="`cell-${col.key}`" :row="row" :index="index">{{ row[col.key] }}</slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Empty state (parent decides the wording / call to action) -->
    <div v-if="!loading && rows.length === 0">
      <slot name="empty" />
    </div>

    <!-- Load more / pagination -->
    <div v-if="$slots.footer && !loading && rows.length > 0" class="flex justify-center px-5 py-4 border-t border-gray-200/70 dark:border-white/10">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
/* Below lg: the table becomes labelled stacked rows. */
@media (max-width: 1023px) {
  .dt table,
  .dt tbody {
    display: block;
  }

  .dt thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .dt tr.dt-row {
    display: block;
    padding: 0.75rem 1.25rem;
  }

  .dt td {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.375rem 0;
    text-align: right;
  }

  .dt td::before {
    content: attr(data-label);
    flex-shrink: 0;
    font-size: 0.75rem;
    font-weight: 500;
    text-align: left;
    color: rgb(107 114 128);
  }

  :global(.dark) .dt td::before {
    color: rgb(156 163 175);
  }

  /* Title cell: full width, no label */
  .dt td[data-primary] {
    display: block;
    padding-top: 0.25rem;
    text-align: left;
  }

  /* Cells without a label (actions, skeleton) */
  .dt td[data-nolabel]::before,
  .dt td[data-primary]::before {
    display: none;
  }

  .dt td[data-nolabel]:not([data-primary]) {
    justify-content: flex-end;
  }
}
</style>
