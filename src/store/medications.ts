import { defineStore } from 'pinia';
import { ref, reactive, computed, watch } from 'vue';
import { medicationService } from '@/services/medicationService';
import type { Medication } from '@/models/Medication';
import type { PaginationMeta } from '@/models/api/ApiResponse';

interface LoadOptions {
  append?: boolean;
}

export const useMedicationsStore = defineStore('medications', () => {
  const searchQuery = ref('');
  const selectedCategory = ref<string>('all');
  const selectedForm = ref<string>('all');
  const selectedBrand = ref<string>('all');
  const requiresPrescription = ref<'all' | 'yes' | 'no'>('all');
  const sortBy = ref<string>('name');
  const showFilters = ref(false);

  const allMedications = ref<Medication[]>([]);
  const liveSearchMeta = ref<PaginationMeta | null>(null);
  const pagination = reactive({
    page: 1,
    perPage: 15,
    total: 0,
    lastPage: 1,
  });
  const loading = ref(false);
  const loadingMore = ref(false);
  const error = ref<string | null>(null);

  const quickViewMedicationId = ref<number | null>(null);
  const showQuickView = ref(false);

  const comparisonList = ref<Medication[]>([]);
  const comparisonModalOpen = ref(false);

  const hasMoreRemoteResults = computed(() => pagination.page < pagination.lastPage);
  const activeFiltersCount = computed(() => {
    let count = 0;
    if (selectedCategory.value !== 'all') count++;
    if (selectedForm.value !== 'all') count++;
    if (selectedBrand.value !== 'all') count++;
    if (requiresPrescription.value !== 'all') count++;
    if (sortBy.value !== 'name') count++;
    return count;
  });

  let searchDebounce: ReturnType<typeof setTimeout> | null = null;
  const initialized = ref(false);

  const clearSearchDebounce = () => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
      searchDebounce = null;
    }
  };

  const triggerDebouncedReload = () => {
    clearSearchDebounce();
    searchDebounce = setTimeout(() => {
      pagination.page = 1;
      loadMedications();
    }, 350);
  };

  const loadMedications = async (options: LoadOptions = {}) => {
    const { append = false } = options;

    if (append) {
      loadingMore.value = true;
    } else {
      loading.value = true;
      error.value = null;
    }

    try {
      const trimmedQuery = searchQuery.value.trim();
      const targetPage = append ? pagination.page + 1 : pagination.page;

      const { medications, meta } = await medicationService.liveSearch({
        query: trimmedQuery || '',
        page: targetPage,
        perPage: pagination.perPage,
        category: selectedCategory.value !== 'all' ? selectedCategory.value : undefined,
        form: selectedForm.value !== 'all' ? selectedForm.value : undefined,
        brand: selectedBrand.value !== 'all' ? selectedBrand.value : undefined,
        requiresPrescription: requiresPrescription.value !== 'all' ? requiresPrescription.value : undefined,
        sort: sortBy.value,
      });

      allMedications.value = append
        ? [...allMedications.value, ...medications]
        : [...medications];

      liveSearchMeta.value = meta || null;
      pagination.page = meta?.current_page ?? targetPage;
      pagination.lastPage = meta?.last_page ?? pagination.page;
      pagination.total = meta?.total ?? allMedications.value.length;
    } catch (err: any) {
      console.error('Error loading medications:', err);
      if (!append) {
        error.value = err.message || 'Failed to load medications';
        allMedications.value = [];
      }
    } finally {
      if (append) {
        loadingMore.value = false;
      } else {
        loading.value = false;
      }
    }
  };

  const initializeMedications = async (initialSearch?: string) => {
    if (initialSearch) {
      searchQuery.value = initialSearch;
    }
    await loadMedications();
    initialized.value = true;
  };

  const refreshMedications = async () => {
    pagination.page = 1;
    await loadMedications();
  };

  const loadMore = async () => {
    if (hasMoreRemoteResults.value && !loadingMore.value) {
      await loadMedications({ append: true });
    }
  };

  const clearFilters = () => {
    selectedCategory.value = 'all';
    selectedForm.value = 'all';
    selectedBrand.value = 'all';
    requiresPrescription.value = 'all';
    sortBy.value = 'name';
    searchQuery.value = '';
  };

  const setShowFilters = (value: boolean) => {
    showFilters.value = value;
  };

  const toggleShowFilters = () => {
    showFilters.value = !showFilters.value;
  };

  const setPage = async (page: number) => {
    pagination.page = page;
    await loadMedications();
  };

  const setPerPage = async (perPage: number) => {
    pagination.perPage = perPage;
    pagination.page = 1; // Reset to first page when changing page size
    await loadMedications();
  };

  const openQuickView = (id: number) => {
    quickViewMedicationId.value = id;
    showQuickView.value = true;
  };

  const closeQuickView = () => {
    showQuickView.value = false;
    quickViewMedicationId.value = null;
  };

  const comparisonIds = computed(() => comparisonList.value.map(m => m.id));

  const isInComparison = (id: number) => {
    return comparisonIds.value.includes(id);
  };

  const addToComparison = async (id: number) => {
    if (isInComparison(id) || comparisonList.value.length >= 4) {
      return;
    }
    try {
      const medication = await medicationService.getMedicationById(id);
      if (medication) {
        comparisonList.value = [...comparisonList.value, medication];
      }
    } catch (err) {
      console.error('Error adding medication to comparison:', err);
    }
  };

  const removeFromComparison = (id: number) => {
    comparisonList.value = comparisonList.value.filter(med => med.id !== id);
  };

  const clearComparison = () => {
    comparisonList.value = [];
    comparisonModalOpen.value = false;
  };

  const toggleComparison = async (id: number) => {
    if (isInComparison(id)) {
      removeFromComparison(id);
    } else {
      await addToComparison(id);
    }
  };

  const openComparisonModal = () => {
    if (comparisonList.value.length >= 2) {
      comparisonModalOpen.value = true;
    }
  };

  const closeComparisonModal = () => {
    comparisonModalOpen.value = false;
  };

  watch(searchQuery, () => {
    if (!initialized.value) return;
    triggerDebouncedReload();
  });

  watch(
    [selectedCategory, selectedForm, selectedBrand, requiresPrescription, sortBy],
    () => {
      if (!initialized.value) return;
      clearSearchDebounce();
      pagination.page = 1;
      loadMedications();
    }
  );

  return {
    // state
    searchQuery,
    selectedCategory,
    selectedForm,
    selectedBrand,
    requiresPrescription,
    sortBy,
    showFilters,
    allMedications,
    liveSearchMeta,
    pagination,
    loading,
    loadingMore,
    error,
    quickViewMedicationId,
    showQuickView,
    comparisonList,
    comparisonModalOpen,
    hasMoreRemoteResults,
    activeFiltersCount,
    // actions
    initializeMedications,
    refreshMedications,
    loadMore,
    clearFilters,
    setShowFilters,
    toggleShowFilters,
    openQuickView,
    closeQuickView,
    toggleComparison,
    isInComparison,
    addToComparison,
    removeFromComparison,
    clearComparison,
    openComparisonModal,
    closeComparisonModal,
    setPage,
    setPerPage,
  };
});

