<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import type { MedicalRecord } from '@/models/User';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const authStore = useAuthStore();
const showModal = ref(false);
const editingRecord = ref<MedicalRecord | null>(null);
const loading = ref(false);
const selectedCategory = ref<string | null>(null);

interface CategoryMeta {
  name: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  hoverRing: string;
  solid: string;
}

const categoryMeta: CategoryMeta[] = [
  {
    name: 'Allergy',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-200 dark:border-rose-900/30',
    hoverRing: 'hover:ring-4 hover:ring-rose-500/10',
    solid: 'bg-rose-500',
  },
  {
    name: 'Chronic Condition',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-900/30',
    hoverRing: 'hover:ring-4 hover:ring-amber-500/10',
    solid: 'bg-amber-500',
  },
  {
    name: 'Current Medication',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.675.337a4 4 0 01-2.586.344l-2.387-.477a2 2 0 00-1.022.547l-1.428 1.428a2 2 0 00-.586 1.414v.572a2 2 0 002 2h12a2 2 0 002-2v-.572a2 2 0 00-.586-1.414l-1.428-1.428z',
    color: 'text-[#246BFD] dark:text-[#5089FF]',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-900/30',
    hoverRing: 'hover:ring-4 hover:ring-[#246BFD]/10',
    solid: 'bg-[#246BFD]',
  },
  {
    name: 'Past Surgery',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-200 dark:border-violet-900/30',
    hoverRing: 'hover:ring-4 hover:ring-violet-500/10',
    solid: 'bg-violet-500',
  },
  {
    name: 'Family History',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-900/30',
    hoverRing: 'hover:ring-4 hover:ring-emerald-500/10',
    solid: 'bg-emerald-500',
  },
];

const categories = categoryMeta.map(c => c.name);

const form = ref({
  category: 'Allergy',
  item_name: '',
  notes: '',
  status: 'Active',
  date_identified: ''
});

const allRecords = computed(() => authStore.user?.medical_records || []);
const hasAnyRecords = computed(() => allRecords.value.length > 0);

const countFor = (category: string) => allRecords.value.filter(r => r.category === category).length;

const visibleCategories = computed(() =>
  selectedCategory.value ? categoryMeta.filter(c => c.name === selectedCategory.value) : categoryMeta
);

const groupedRecords = computed(() => {
  return categories.reduce((acc, cat) => {
    acc[cat] = allRecords.value.filter(r => r.category === cat);
    return acc;
  }, {} as Record<string, MedicalRecord[]>);
});

const toggleCategory = (name: string) => {
  selectedCategory.value = selectedCategory.value === name ? null : name;
};

const openAddModal = (category?: string) => {
  editingRecord.value = null;
  form.value = {
    category: category || 'Allergy',
    item_name: '',
    notes: '',
    status: 'Active',
    date_identified: ''
  };
  showModal.value = true;
};

const openEditModal = (record: MedicalRecord) => {
  editingRecord.value = record;
  form.value = {
    category: record.category,
    item_name: record.item_name,
    notes: record.notes || '',
    status: record.status,
    date_identified: record.date_identified ? record.date_identified.split('T')[0] : ''
  };
  showModal.value = true;
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    if (editingRecord.value) {
      await authStore.updateMedicalRecord(editingRecord.value.id, form.value);
    } else {
      await authStore.addMedicalRecord(form.value);
    }
    showModal.value = false;
  } catch (error) {
    console.error('Failed to save medical record:', error);
  } finally {
    loading.value = false;
  }
};

const recordPendingDelete = ref<MedicalRecord | null>(null);
const deleteLoading = ref(false);

const requestDelete = (record: MedicalRecord) => {
  recordPendingDelete.value = record;
};

const cancelDelete = () => {
  if (deleteLoading.value) return;
  recordPendingDelete.value = null;
};

const confirmDelete = async () => {
  if (!recordPendingDelete.value) return;
  deleteLoading.value = true;
  try {
    await authStore.deleteMedicalRecord(recordPendingDelete.value.id);
    recordPendingDelete.value = null;
  } catch (error) {
    console.error('Failed to delete medical record:', error);
  } finally {
    deleteLoading.value = false;
  }
};
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
        <svg class="w-6 h-6 mr-2 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        Medical History
      </h3>
      <button
        @click="openAddModal()"
        class="text-sm font-black text-[#246BFD] hover:text-[#5089FF] transition-all flex items-center space-x-1 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full border border-blue-100 dark:border-blue-800/20"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Add Medical Entry</span>
      </button>
    </div>

    <!-- Category Filter Strip (doubles as an at-a-glance summary) -->
    <div v-if="hasAnyRecords" class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
      <button
        v-for="cat in categoryMeta"
        :key="cat.name"
        @click="toggleCategory(cat.name)"
        class="flex-shrink-0 flex items-center gap-2 pl-2.5 pr-4 py-2 rounded-full border-2 transition-all duration-300"
        :class="selectedCategory === cat.name
          ? `${cat.solid} border-transparent text-white shadow-lg`
          : `bg-white dark:bg-gray-800 ${cat.border} ${cat.color} hover:shadow-md`"
      >
        <span
          class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          :class="selectedCategory === cat.name ? 'bg-white/20' : cat.bg"
        >
          <svg class="w-4 h-4" :class="selectedCategory === cat.name ? 'text-white' : cat.color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="cat.icon"></path>
          </svg>
        </span>
        <span class="text-xs font-black uppercase tracking-tight whitespace-nowrap">{{ cat.name }}</span>
        <span
          class="text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
          :class="selectedCategory === cat.name ? 'bg-white/25 text-white' : `${cat.bg} ${cat.color}`"
        >
          {{ countFor(cat.name) }}
        </span>
      </button>
    </div>

    <!-- Category Groups -->
    <div v-if="hasAnyRecords" class="space-y-8">
      <div v-for="cat in visibleCategories" :key="cat.name">
        <div v-if="groupedRecords[cat.name].length" class="space-y-3">
          <div class="flex items-center text-[10px] font-black uppercase tracking-[0.2em] px-1" :class="cat.color">
            <span class="w-1.5 h-1.5 rounded-full mr-2" :class="cat.solid"></span>
            {{ cat.name }}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="record in groupedRecords[cat.name]"
              :key="record.id"
              class="group relative p-5 rounded-2xl border-2 bg-white dark:bg-gray-800/50 transition-all duration-300 hover:shadow-xl"
              :class="[cat.border, cat.hoverRing]"
            >
              <div class="flex justify-between items-start gap-3">
                <div class="flex items-start gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" :class="cat.bg">
                    <svg class="w-5 h-5" :class="cat.color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="cat.icon"></path>
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <h4 class="font-bold text-gray-900 dark:text-white truncate">{{ record.item_name }}</h4>
                    <div class="flex items-center space-x-2 mt-1 flex-wrap gap-y-1">
                      <span class="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-black uppercase tracking-tighter">
                        {{ record.status }}
                      </span>
                      <span v-if="record.date_identified" class="text-[10px] text-gray-400 font-medium">
                        {{ new Date(record.date_identified).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button @click="openEditModal(record)" class="p-2 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-[#246BFD] hover:bg-blue-50 transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 01-2 2v11a2 2 0 012 2h11a2 2 0 012-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button @click="requestDelete(record)" class="p-2 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <p v-if="record.notes" class="mt-3 pl-[52px] text-xs text-gray-600 dark:text-gray-400 line-clamp-2 italic leading-relaxed">
                "{{ record.notes }}"
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedCategory && !groupedRecords[selectedCategory].length" class="text-center py-10 text-sm text-gray-400">
        No {{ selectedCategory.toLowerCase() }} entries yet.
        <button @click="openAddModal(selectedCategory)" class="text-[#246BFD] font-bold hover:underline ml-1">Add one</button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 bg-gray-50 dark:bg-gray-700/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-600">
      <div class="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
      </div>
      <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Private Medical Profile</h4>
      <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
        Keep your medical history organized and private. This information helps pharmacists and doctors provide safer care.
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <button
          v-for="cat in categoryMeta.slice(0, 3)"
          :key="cat.name"
          @click="openAddModal(cat.name)"
          class="px-4 py-2.5 rounded-full bg-white dark:bg-gray-700 border-2 text-sm font-bold transition-colors flex items-center space-x-2"
          :class="[cat.border, cat.color]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="cat.icon"></path>
          </svg>
          <span>Add {{ cat.name }}</span>
        </button>
      </div>
    </div>

    <!-- Medical Record Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div class="bg-white dark:bg-gray-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div class="p-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-blue-50/30 dark:bg-blue-900/10">
          <div>
            <h4 class="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              {{ editingRecord ? 'Edit Entry' : 'Add Medical Entry' }}
            </h4>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Kept private &amp; encrypted</p>
          </div>
          <button @click="showModal = false" class="w-12 h-12 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-8 space-y-6 overflow-y-auto max-h-[75vh] no-scrollbar">
          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="cat in categoryMeta"
                :key="cat.name"
                type="button"
                @click="form.category = cat.name"
                class="px-3 py-2.5 rounded-full border-2 text-[10px] font-black uppercase tracking-tight transition-all"
                :class="form.category === cat.name ? `${cat.solid} border-transparent text-white shadow-md` : `bg-gray-50 dark:bg-gray-700 ${cat.border} ${cat.color} hover:shadow-sm`"
              >
                {{ cat.name }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Name / Condition</label>
            <input
              v-model="form.item_name"
              type="text"
              required
              class="w-full px-5 py-4 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-[#246BFD]/10 focus:border-[#246BFD] outline-none transition-all shadow-sm font-bold"
              placeholder="e.g. Penicillin Allergy, Diabetes Type 2"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
              <select
                v-model="form.status"
                class="w-full px-5 py-4 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-[#246BFD]/10 focus:border-[#246BFD] outline-none transition-all"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive / History</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Date Identified</label>
              <input
                v-model="form.date_identified"
                type="date"
                class="w-full px-5 py-4 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-[#246BFD]/10 focus:border-[#246BFD] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Notes / Details</label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-[#246BFD]/10 focus:border-[#246BFD] outline-none transition-all resize-none"
              placeholder="Any additional details or severity..."
            ></textarea>
            <p class="mt-2 text-[10px] text-gray-400 flex items-center">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              This information is encrypted at rest for your security.
            </p>
          </div>

          <div class="pt-4 flex space-x-4">
            <button
              type="button"
              @click="showModal = false"
              class="flex-1 px-8 py-4 rounded-full border-2 border-gray-100 dark:border-gray-700 text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all uppercase tracking-widest text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-[2] px-8 py-4 rounded-full bg-[#246BFD] text-white font-black hover:bg-[#5089FF] shadow-xl shadow-[#246BFD]/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-3 uppercase tracking-widest text-xs"
            >
              <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loading ? 'Saving...' : (editingRecord ? 'Update Entry' : 'Save Entry') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmDialog
      :show="!!recordPendingDelete"
      title="Delete this record?"
      variant="danger"
      confirm-label="Delete Entry"
      :loading="deleteLoading"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    >
      <p v-if="recordPendingDelete" class="text-sm text-gray-500 dark:text-gray-400">
        <span class="font-bold text-gray-700 dark:text-gray-300">{{ recordPendingDelete.item_name }}</span>
        will be permanently removed from your medical history.
      </p>
    </ConfirmDialog>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
