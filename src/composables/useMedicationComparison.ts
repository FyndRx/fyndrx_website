import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useMedicationsStore } from '@/store/medications';
import { medicationService } from '@/services/medicationService';
import type { Medication } from '@/models/Medication';

export type PharmacyPrice = {
  pharmacy_id: string;
  pharmacy_name: string;
  pharmacy_logo?: string | null;
  price: number;
  discount_price?: number | null;
  in_stock: boolean;
  is_open?: boolean;
  branch_name?: string | null;
};

export function useMedicationComparison() {
  const router = useRouter();
  const medicationsStore = useMedicationsStore();
  const { comparisonList, comparisonModalOpen } = storeToRefs(medicationsStore);

  const pharmacyPricesMap = ref<Map<number | string, PharmacyPrice[]>>(new Map());
  const loadingPrices = ref(false);

  const clearAll = () => medicationsStore.clearComparison();
  const removeFromComparison = (id: number) => medicationsStore.removeFromComparison(id);
  const openComparison = () => medicationsStore.openComparisonModal();
  const closeComparison = () => medicationsStore.closeComparisonModal();

  const viewMedication = (med: Medication) => {
    closeComparison();
    router.push(`/medication/${med.product_id ?? med.id}`);
  };

  const getCategoryNames = (category: Medication['category']): string[] => {
    if (!category) return [];
    const arr = Array.isArray(category) ? category : [category];
    return arr
      .map((c: any) => (typeof c === 'string' ? c : c?.name ?? ''))
      .filter(Boolean);
  };

  const effectivePrice = (med: Medication): number | null => {
    const p = med.discount_price ?? med.starting_price ?? med.price;
    return p != null && p > 0 ? p : null;
  };

  const lowestPrice = computed(() => {
    const prices = comparisonList.value
      .map(effectivePrice)
      .filter((p): p is number => p !== null);
    return prices.length ? Math.min(...prices) : null;
  });

  const maxPharmacies = computed(() =>
    Math.max(...comparisonList.value.map(m => m.pharmacy_count ?? 0), 1)
  );

  const isBestValue = (med: Medication) => {
    const p = effectivePrice(med);
    return p !== null && lowestPrice.value !== null && p === lowestPrice.value;
  };

  const isMostAvailable = (med: Medication) =>
    (med.pharmacy_count ?? 0) > 0 && (med.pharmacy_count ?? 0) === maxPharmacies.value;

  // Label column 180px, each medication column fixed at 210px
  const gridCols = computed(
    () => `180px repeat(${comparisonList.value.length}, 210px)`
  );

  watch(comparisonModalOpen, async (open) => {
    if (!open) return;
    loadingPrices.value = true;
    pharmacyPricesMap.value = new Map();

    await Promise.all(
      comparisonList.value.map(async (med) => {
        try {
          const prices = await medicationService.getProductPrices(med.product_id ?? med.id);
          pharmacyPricesMap.value.set(med.id, prices);
        } catch {
          pharmacyPricesMap.value.set(med.id, []);
        }
      })
    );

    loadingPrices.value = false;
  });

  const pharmaciesFor = (med: Medication) => pharmacyPricesMap.value.get(med.id) ?? null;

  const effectivePriceFor = (p: PharmacyPrice) =>
    p.discount_price != null && p.discount_price < p.price ? p.discount_price : p.price;

  return {
    comparisonList,
    comparisonModalOpen,
    loadingPrices,
    lowestPrice,
    gridCols,
    clearAll,
    removeFromComparison,
    openComparison,
    closeComparison,
    viewMedication,
    getCategoryNames,
    effectivePrice,
    isBestValue,
    isMostAvailable,
    pharmaciesFor,
    effectivePriceFor,
  };
}
