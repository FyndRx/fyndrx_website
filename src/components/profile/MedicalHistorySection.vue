<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import type { MedicalRecord } from '@/models/User';

const authStore = useAuthStore();
const showModal = ref(false);
const editingRecord = ref<MedicalRecord | null>(null);
const loading = ref(false);

const categories = [
  'Allergy',
  'Chronic Condition',
  'Current Medication',
  'Past Surgery',
  'Family History'
];

const form = ref({
  category: 'Allergy',
  item_name: '',
  notes: '',
  status: 'Active',
  date_identified: ''
});

const groupedRecords = computed(() => {
  const records = authStore.user?.medical_records || [];
  return categories.reduce((acc, cat) => {
    acc[cat] = records.filter(r => r.category === cat);
    return acc;
  }, {} as Record<string, MedicalRecord[]>);
});

const hasAnyRecords = computed(() => (authStore.user?.medical_records?.length || 0) > 0);

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

const deleteRecord = async (id: number) => {
  if (confirm('Are you sure you want to delete this record?')) {
    try {
      await authStore.deleteMedicalRecord(id);
    } catch (error) {
      console.error('Failed to delete medical record:', error);
    }
  }
};

const getCategoryIconPath = (category: string) => {
  switch (category) {
    case 'Allergy': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
    case 'Chronic Condition': return 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z';
    case 'Current Medication': return 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.675.337a4 4 0 01-2.586.344l-2.387-.477a2 2 0 00-1.022.547l-1.428 1.428a2 2 0 00-.586 1.414v.572a2 2 0 002 2h12a2 2 0 002-2v-.572a2 2 0 00-.586-1.414l-1.428-1.428z';
    case 'Past Surgery': return 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4';
    case 'Family History': return 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z';
    default: return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
  }
};
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
        <svg class="w-6 h-6 mr-2 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        Medical History
      </h3>
      <button
        @click="openAddModal()"
        class="text-sm font-medium text-[#246BFD] hover:text-[#5089FF] transition-colors flex items-center space-x-1"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Add Medical Entry</span>
      </button>
    </div>

    <!-- Category Groups -->
    <div v-if="hasAnyRecords" class="space-y-6">
      <div v-for="category in categories" :key="category">
        <div v-if="groupedRecords[category].length" class="space-y-3">
          <div class="flex items-center text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getCategoryIconPath(category)"></path>
            </svg>
            {{ category }}
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="record in groupedRecords[category]"
              :key="record.id"
              class="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-md transition-all group"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ record.item_name }}</h4>
                  <div class="flex items-center space-x-3 mt-1 flex-wrap gap-y-1">
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-black uppercase tracking-tighter">
                      {{ record.status }}
                    </span>
                    <span v-if="record.date_identified" class="text-[10px] text-gray-400 font-medium">
                      Identified: {{ new Date(record.date_identified).toLocaleDateString() }}
                    </span>
                  </div>
                  <p v-if="record.notes" class="mt-3 text-xs text-gray-600 dark:text-gray-400 line-clamp-2 italic leading-relaxed">
                    "{{ record.notes }}"
                  </p>
                </div>
                
                <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <button @click="openEditModal(record)" class="p-2 text-gray-400 hover:text-[#246BFD] transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 01-2 2v11a2 2 0 012 2h11a2 2 0 012-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button @click="deleteRecord(record.id)" class="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700">
      <div class="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-10 h-10 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
      </div>
      <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Private Medical Profile</h4>
      <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6 text-sm">
        Keep your medical history organized and private. This information helps pharmacists and doctors provide safer care.
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <button
          v-for="cat in categories.slice(0, 3)"
          :key="cat"
          @click="openAddModal(cat)"
          class="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm font-medium hover:border-[#246BFD] transition-colors flex items-center space-x-2"
        >
          <svg class="w-4 h-4 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getCategoryIconPath(cat)"></path>
          </svg>
          <span>Add {{ cat }}</span>
        </button>
      </div>
    </div>

    <!-- Medical Record Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-blue-50/30 dark:bg-blue-900/10">
          <h4 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <svg class="w-6 h-6 mr-2 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            {{ editingRecord ? 'Edit Entry' : 'Add Medical Entry' }}
          </h4>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Category</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="cat in categories"
                :key="cat"
                type="button"
                @click="form.category = cat"
                class="px-3 py-2 rounded-lg border text-[10px] font-black uppercase tracking-tight transition-all"
                :class="form.category === cat ? 'bg-[#246BFD] border-[#246BFD] text-white' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#246BFD]/50'"
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Name / Condition</label>
            <input
              v-model="form.item_name"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD]/20 focus:border-[#246BFD] outline-none transition-all"
              placeholder="e.g. Penicillin Allergy, Diabetes Type 2"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Status</label>
              <select
                v-model="form.status"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD]/20 focus:border-[#246BFD] outline-none transition-all"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive / History</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Date Identified</label>
              <input
                v-model="form.date_identified"
                type="date"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD]/20 focus:border-[#246BFD] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Notes / Details</label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD]/20 focus:border-[#246BFD] outline-none transition-all resize-none"
              placeholder="Any additional details or severity..."
            ></textarea>
            <p class="mt-2 text-[10px] text-gray-400 flex items-center">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              This information is encrypted at rest for your security.
            </p>
          </div>

          <div class="pt-4 flex space-x-3">
            <button
              type="button"
              @click="showModal = false"
              class="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 px-6 py-3 rounded-xl bg-[#246BFD] text-white font-bold hover:bg-[#5089FF] shadow-lg shadow-[#246BFD]/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
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
  </div>
</template>
