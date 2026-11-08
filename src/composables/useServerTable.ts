import { ref, watch, onMounted, type Ref } from 'vue';

export interface PageMeta {
  current_page?: number;
  last_page?: number;
  total?: number;
  per_page?: number;
}

export interface TableQuery<F> {
  page: number;
  perPage: number;
  q: string;
  filter: F;
}

/**
 * State + paging logic for a server-driven table: search (`q`), one filter, page and per-page.
 *
 * - Changing the search, the filter or the per-page size returns to page 1.
 * - Responses that arrive out of order are ignored (only the latest request wins).
 * - If a page comes back empty but earlier pages exist (e.g. the last item on the last page was
 *   removed), it steps back to the last real page instead of showing an empty table.
 * - The fetcher stays in the page, so a page can also pick extras (counts, totals) off the
 *   response as a side effect.
 */
export function useServerTable<T, F = string>(options: {
  fetcher: (query: TableQuery<F>) => Promise<{ rows: T[]; meta: PageMeta | null }>;
  initialFilter: F;
  perPage?: number;
  /** Scrolled into view after a page change so the user lands at the top of the new rows. */
  scrollTarget?: Ref<HTMLElement | null>;
}) {
  const rows = ref([]) as Ref<T[]>;
  const loading = ref(true);
  const page = ref(1);
  const perPage = ref(options.perPage ?? 10);
  const total = ref(0);
  const lastPage = ref(1);
  const q = ref('');
  const filter = ref(options.initialFilter) as Ref<F>;

  let requestId = 0;

  async function load(targetPage = page.value) {
    const id = ++requestId;
    loading.value = true;
    try {
      const { rows: fetched, meta } = await options.fetcher({
        page: targetPage,
        perPage: perPage.value,
        q: q.value,
        filter: filter.value,
      });
      if (id !== requestId) return; // a newer request superseded this one

      const last = meta?.last_page ?? 1;
      if (fetched.length === 0 && targetPage > 1 && (meta?.total ?? 0) > 0) {
        await load(Math.min(targetPage - 1, last));
        return;
      }

      rows.value = fetched;
      page.value = meta?.current_page ?? targetPage;
      lastPage.value = last;
      total.value = meta?.total ?? fetched.length;
    } catch (err) {
      if (id !== requestId) return;
      console.error('Error loading table data:', err);
      rows.value = [];
      total.value = 0;
      lastPage.value = 1;
    } finally {
      if (id === requestId) loading.value = false;
    }
  }

  function setPage(p: number) {
    if (p === page.value || p < 1 || p > lastPage.value) return;
    load(p).then(() => options.scrollTarget?.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function setPerPage(n: number) {
    perPage.value = n;
    load(1);
  }

  watch([q, filter], () => load(1));
  onMounted(() => load(1));

  return { rows, loading, page, perPage, total, lastPage, q, filter, load, setPage, setPerPage };
}
