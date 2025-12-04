<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { prescriptionService } from '@/services/prescription';
import LazyImage from '@/components/LazyImage.vue';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  id: number;
  userId: number;
  prescriptionNumber: string;
  patientName: string;
  doctorName: string;
  prescriptionDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending_approval';
  medications: Medication[];
  prescriptionImage: string;
  notes: string;
  createdAt: string;
}

const router = useRouter();
const prescriptions = ref<Prescription[]>([]);
const selectedFilter = ref<'all' | 'active' | 'expired' | 'pending'>('all');
const selectedPrescription = ref<Prescription | null>(null);
const showDetailModal = ref(false);
const loading = ref(true);

const statusColors = {
  active: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-200', border: 'border-green-200 dark:border-green-800' },
  expired: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', border: 'border-gray-200 dark:border-gray-600' },
  pending_approval: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-200', border: 'border-yellow-200 dark:border-yellow-800' }
};

const statusLabels = {
  active: 'Active',
  expired: 'Expired',
  pending_approval: 'Pending Approval'
};

const filteredPrescriptions = computed(() => {
  if (selectedFilter.value === 'all') return prescriptions.value;
  if (selectedFilter.value === 'pending') {
    return prescriptions.value.filter(p => p.status === 'pending_approval');
  }
  return prescriptions.value.filter(p => p.status === selectedFilter.value);
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
};

const isExpiringSoon = (expiryDate: string) => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
};

const viewDetails = (prescription: Prescription) => {
  selectedPrescription.value = prescription;
  showDetailModal.value = true;
};

const closeModal = () => {
  showDetailModal.value = false;
  selectedPrescription.value = null;
};

const uploadNewPrescription = () => {
  router.push({ name: 'upload-prescription' });
};

const loadPrescriptions = async () => {
  loading.value = true;
  try {
    const data = await prescriptionService.getPrescriptions();
    prescriptions.value = data.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (err) {
    console.error('Error loading prescriptions:', err);
    prescriptions.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadPrescriptions();
});
</script>

<template>
  <div class="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="mb-2 text-3xl font-medium text-gray-900 dark:text-white">My Prescriptions</h1>
          <p class="text-gray-600 dark:text-gray-300">Manage and view your medical prescriptions</p>
        </div>
        <button
          @click="uploadNewPrescription"
          class="flex items-center gap-2 px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all duration-300 hover:shadow-lg"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Upload New
        </button>
      </div>

      <div class="mb-6">
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            @click="selectedFilter = 'all'"
            :class="[
              'px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap',
              selectedFilter === 'all'
                ? 'bg-[#246BFD] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            All ({{ prescriptions.length }})
          </button>
          <button
            @click="selectedFilter = 'active'"
            :class="[
              'px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap',
              selectedFilter === 'active'
                ? 'bg-[#246BFD] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            Active ({{ prescriptions.filter(p => p.status === 'active').length }})
          </button>
          <button
            @click="selectedFilter = 'expired'"
            :class="[
              'px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap',
              selectedFilter === 'expired'
                ? 'bg-[#246BFD] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            Expired ({{ prescriptions.filter(p => p.status === 'expired').length }})
          </button>
          <button
            @click="selectedFilter = 'pending'"
            :class="[
              'px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap',
              selectedFilter === 'pending'
                ? 'bg-[#246BFD] text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            Pending ({{ prescriptions.filter(p => p.status === 'pending_approval').length }})
          </button>
        </div>
      </div>

      <div v-if="loading" class="py-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD] mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-300">Loading prescriptions...</p>
      </div>

      <div v-else-if="filteredPrescriptions.length === 0" class="py-16 text-center">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mb-2 text-xl font-medium text-gray-900 dark:text-white">No prescriptions found</h3>
        <p class="mb-6 text-gray-600 dark:text-gray-300">Upload your first prescription to get started</p>
        <button
          @click="uploadNewPrescription"
          class="inline-block px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors"
        >
          Upload Prescription
        </button>
      </div>

      <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div
          v-for="prescription in filteredPrescriptions"
          :key="prescription.id"
          class="p-6 transition-all duration-300 bg-white cursor-pointer dark:bg-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-1"
          @click="viewDetails(prescription)"
        >
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-20 h-20 overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-lg">
              <LazyImage
                :src="prescription.prescriptionImage"
                :alt="`Prescription ${prescription.prescriptionNumber}`"
                aspectRatio="square"
                className="w-full h-full object-cover"
              />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ prescription.prescriptionNumber }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Dr. {{ prescription.doctorName }}</p>
                </div>
                <span
                  :class="[
                    'px-3 py-1 text-xs font-semibold rounded-full',
                    statusColors[prescription.status].bg,
                    statusColors[prescription.status].text
                  ]"
                >
                  {{ statusLabels[prescription.status] }}
                </span>
              </div>

              <div class="mb-3">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medications:</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(med, index) in prescription.medications.slice(0, 2)"
                    :key="index"
                    class="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full"
                  >
                    {{ med.name }} {{ med.dosage }}
                  </span>
                  <span
                    v-if="prescription.medications.length > 2"
                    class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                  >
                    +{{ prescription.medications.length - 2 }} more
                  </span>
                </div>
              </div>

              <div class="flex items-center justify-between text-sm">
                <div class="text-gray-600 dark:text-gray-400">
                  <span class="font-medium">Issued:</span> {{ formatDate(prescription.prescriptionDate) }}
                </div>
                <div class="text-gray-600 dark:text-gray-400">
                  <span class="font-medium">Expires:</span> {{ formatDate(prescription.expiryDate) }}
                </div>
              </div>

              <div v-if="isExpiringSoon(prescription.expiryDate) && prescription.status === 'active'" class="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p class="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                  Expiring soon! Renew your prescription
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Prescription Detail Modal -->
    <div
      v-if="showDetailModal && selectedPrescription"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click.self="closeModal"
    >
      <div class="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
        <div class="sticky top-0 z-10 flex items-center justify-between p-6 bg-gradient-to-r from-[#246BFD] to-[#5089FF]">
          <div>
            <h2 class="text-2xl font-bold text-white">{{ selectedPrescription.prescriptionNumber }}</h2>
            <p class="text-white/80">Dr. {{ selectedPrescription.doctorName }}</p>
          </div>
          <button
            @click="closeModal"
            class="p-2 transition-colors rounded-full text-white hover:bg-white/20"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-6">
          <!-- Prescription Image -->
          <div class="overflow-hidden rounded-xl">
            <LazyImage
              :src="selectedPrescription.prescriptionImage"
              :alt="`Prescription ${selectedPrescription.prescriptionNumber}`"
              aspectRatio="landscape"
              className="w-full object-cover"
            />
          </div>

          <!-- Status and Dates -->
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <span
                :class="[
                  'inline-block px-3 py-1 text-sm font-semibold rounded-full',
                  statusColors[selectedPrescription.status].bg,
                  statusColors[selectedPrescription.status].text
                ]"
              >
                {{ statusLabels[selectedPrescription.status] }}
              </span>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Issued Date</p>
              <p class="font-semibold text-gray-900 dark:text-white">{{ formatDate(selectedPrescription.prescriptionDate) }}</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Expiry Date</p>
              <p class="font-semibold text-gray-900 dark:text-white">{{ formatDate(selectedPrescription.expiryDate) }}</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Patient</p>
              <p class="font-semibold text-gray-900 dark:text-white">{{ selectedPrescription.patientName }}</p>
            </div>
          </div>

          <!-- Medications -->
          <div>
            <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Prescribed Medications</h3>
            <div class="space-y-3">
              <div
                v-for="(med, index) in selectedPrescription.medications"
                :key="index"
                class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
              >
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-semibold text-blue-900 dark:text-blue-100">{{ med.name }}</h4>
                  <span class="px-2 py-1 text-xs font-medium bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 rounded-full">
                    {{ med.dosage }}
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span class="text-gray-600 dark:text-gray-400">Frequency:</span>
                    <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ med.frequency }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span class="ml-1 font-medium text-gray-900 dark:text-white">{{ med.duration }}</span>
                  </div>
                </div>
                <div class="mt-2 text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Instructions:</span>
                  <p class="mt-1 text-gray-900 dark:text-white">{{ med.instructions }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Doctor's Notes -->
          <div v-if="selectedPrescription.notes" class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <h3 class="mb-2 text-sm font-semibold text-yellow-900 dark:text-yellow-100">Doctor's Notes</h3>
            <p class="text-sm text-yellow-800 dark:text-yellow-200">{{ selectedPrescription.notes }}</p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              @click="closeModal"
              class="flex-1 px-6 py-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            <button
              v-if="selectedPrescription.status === 'active'"
              class="flex-1 px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors"
            >
              Order Medications
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

