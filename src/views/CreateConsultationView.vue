<script setup lang="ts">
import { ref, computed, reactive, onMounted, nextTick } from 'vue';
import { useNotification } from '@/composables/useNotification';
import { useRouter } from 'vue-router';
import { consultationService } from '@/services/consultationService';
import { authService } from '@/services/auth.service';
import { pharmacyService } from '@/services/pharmacyService';
import type { Pharmacy, PharmacyBranch } from '@/models/Pharmacy';
import type { ConsultationType, PatientConsultationIntake } from '@/types/consultation';
import Button from '@/components/Button.vue';
import TextInput from '@/components/TextInput.vue';
import Card from '@/components/Card.vue';
import DateTimePicker from '@/components/DateTimePicker.vue';
import {
  CheckCircleIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserPlusIcon,
  CheckIcon,
  MapPinIcon,
} from '@heroicons/vue/24/outline';
import { StarIcon, ShieldCheckIcon, HeartIcon, BoltIcon, SparklesIcon } from '@heroicons/vue/24/solid';

const router = useRouter();
const { success: notifySuccess } = useNotification();
const currentStep = ref(1);
const submitting = ref(false);
const error = ref('');

// ── Pharmacy state ────────────────────────────────────────────
const pharmaciesData = ref<Pharmacy[]>([]);
const selectedPharmacy = ref<Pharmacy | null>(null);
const loadingBranches = ref(false);
const showPharmacyPicker = ref(false);
const showBranchPicker = ref(false);
const pharmacySearch = ref('');
const branchSearch = ref('');
const userLocation = ref<{ lat: number; lng: number } | null>(null);

// Refs + position for teleported dropdown panels
const pharmacyTriggerRef = ref<HTMLElement | null>(null);
const branchTriggerRef = ref<HTMLElement | null>(null);
const pharmacyPanelPos = ref({ top: '0px', left: '0px', width: '0px' });
const branchPanelPos = ref({ top: '0px', left: '0px', width: '0px' });

function calcPos(triggerRef: HTMLElement, pos: typeof pharmacyPanelPos) {
  const rect = triggerRef.getBoundingClientRect();
  pos.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  };
}

const openPharmacyPicker = () => {
  showBranchPicker.value = false;
  showPharmacyPicker.value = !showPharmacyPicker.value;
  if (showPharmacyPicker.value && pharmacyTriggerRef.value) {
    nextTick(() => calcPos(pharmacyTriggerRef.value!, pharmacyPanelPos));
  }
};

const openBranchPicker = () => {
  showPharmacyPicker.value = false;
  showBranchPicker.value = !showBranchPicker.value;
  if (showBranchPicker.value && branchTriggerRef.value) {
    nextTick(() => calcPos(branchTriggerRef.value!, branchPanelPos));
  }
};

// ── File state ────────────────────────────────────────────────
const isDragOver = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const previewFiles = ref<Array<{ file: File; preview: string | null; name: string }>>([]);

const form = reactive<PatientConsultationIntake & { booking_for: 'myself' | 'someone_else' }>({
  booking_for: 'myself',
  consultation_type: 'general',
  chief_complaint: '',
  consultation_notes: '',
  patient_name: '',
  patient_email: '',
  patient_phone: '',
  patient_date_of_birth: '',
  patient_gender: '',
  pharmacy_id: undefined,
  pharmacy_branch_id: undefined,
  scheduled_at: '',
  source: 'web',
  user_id: undefined,
  attachments: [],
});

const consultationTypes = [
  { value: 'general', label: 'General advice', icon: StarIcon, desc: 'Questions about health or medicines' },
  { value: 'medication_review', label: 'Medication review', icon: ShieldCheckIcon, desc: 'Check interactions or dosing' },
  { value: 'chronic_disease', label: 'Chronic care', icon: HeartIcon, desc: 'Ongoing condition support' },
  { value: 'acute_illness', label: 'Feeling unwell', icon: BoltIcon, desc: 'Recent illness or symptoms' },
  { value: 'wellness', label: 'Wellness', icon: SparklesIcon, desc: 'Prevention and lifestyle' },
];

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

const steps = [
  { number: 1, title: 'Service', icon: BuildingStorefrontIcon },
  { number: 2, title: 'You', icon: UserIcon },
  { number: 3, title: 'Request', icon: ClipboardDocumentListIcon },
];

const stepsProgress = computed(() => ((currentStep.value - 1) / (steps.length - 1)) * 100);

const canProceed = computed(() => {
  if (currentStep.value === 1) return !!form.consultation_type;
  if (currentStep.value === 2) return !!(form.patient_name?.trim() && form.patient_phone?.trim());
  if (currentStep.value === 3) return form.chief_complaint.trim().length >= 10;
  return true;
});

const nextStep = () => {
  error.value = '';
  if (!canProceed.value) {
    if (currentStep.value === 3)
      error.value = 'Please describe your reason for visit (10+ characters).';
    return;
  }
  if (currentStep.value < 3) currentStep.value++;
};

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

// ── Distance helpers ──────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

// ── Pharmacies with distance, sorted nearest-first ───────────
type PharmacyWithDist = Pharmacy & { distKm: number | null };

const pharmaciesWithDistance = computed<PharmacyWithDist[]>(() => {
  return pharmaciesData.value.map(p => {
    let distKm: number | null = null;
    if (userLocation.value && p.location?.lat && p.location?.lng) {
      distKm = haversineKm(userLocation.value.lat, userLocation.value.lng, p.location.lat, p.location.lng);
    }
    return { ...p, distKm };
  }).sort((a, b) => {
    if (a.distKm !== null && b.distKm !== null) return a.distKm - b.distKm;
    return a.distKm !== null ? -1 : b.distKm !== null ? 1 : 0;
  });
});

const filteredPharmacies = computed(() => {
  const q = pharmacySearch.value.toLowerCase().trim();
  if (!q) return pharmaciesWithDistance.value;
  return pharmaciesWithDistance.value.filter(p =>
    p.name.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q)
  );
});

// ── Branches with distance ────────────────────────────────────
type BranchWithDist = PharmacyBranch & { distKm: number | null };

const selectedPharmacyBranches = computed<BranchWithDist[]>(() => {
  if (!selectedPharmacy.value?.branches?.length) return [];
  return (selectedPharmacy.value.branches).map(b => {
    let distKm: number | null = null;
    const bLat = parseFloat(b.latitude || '');
    const bLng = parseFloat(b.longitude || '');
    if (userLocation.value && !isNaN(bLat) && !isNaN(bLng)) {
      distKm = haversineKm(userLocation.value.lat, userLocation.value.lng, bLat, bLng);
    }
    return { ...b, distKm };
  }).sort((a, b) => {
    if (a.distKm !== null && b.distKm !== null) return a.distKm - b.distKm;
    return a.distKm !== null ? -1 : b.distKm !== null ? 1 : 0;
  });
});

const filteredBranches = computed(() => {
  const q = branchSearch.value.toLowerCase().trim();
  if (!q) return selectedPharmacyBranches.value;
  return selectedPharmacyBranches.value.filter(b =>
    b.branchName?.toLowerCase().includes(q) || b.address?.toLowerCase().includes(q)
  );
});

const selectedBranch = computed<BranchWithDist | null>(() => {
  if (!form.pharmacy_branch_id) return null;
  return selectedPharmacyBranches.value.find(b => b.id === form.pharmacy_branch_id) ?? null;
});

const currentConsultationType = computed(() =>
  consultationTypes.find(t => t.value === form.consultation_type)
);

// ── Pharmacy / Branch selection ───────────────────────────────
const selectPharmacy = async (pharmacy: PharmacyWithDist) => {
  selectedPharmacy.value = pharmacy;
  form.pharmacy_id = pharmacy.id;
  form.pharmacy_branch_id = undefined;
  showPharmacyPicker.value = false;
  pharmacySearch.value = '';

  if (!pharmacy.branches?.length && pharmacy.branchesCount > 0) {
    loadingBranches.value = true;
    try {
      const full = await pharmacyService.getPharmacy(pharmacy.id);
      selectedPharmacy.value = { ...full, distKm: pharmacy.distKm } as PharmacyWithDist;
    } catch { /* keep what we have */ }
    finally { loadingBranches.value = false; }
  }

  if (selectedPharmacy.value?.branches?.length) showBranchPicker.value = true;
};

const selectBranch = (branch: BranchWithDist) => {
  form.pharmacy_branch_id = branch.id;
  showBranchPicker.value = false;
  branchSearch.value = '';
};

// ── Patient fields ────────────────────────────────────────────
const currentUser = ref<Record<string, unknown> | null>(null);
const isProfileIncomplete = ref(false);

const setPatientToSelf = () => {
  if (!currentUser.value) return;
  const u = currentUser.value;
  form.patient_name = (u.fullname as string) || `${u.firstname || ''} ${u.lastname || ''}`.trim();
  form.patient_email = (u.email as string) || '';
  form.patient_phone = (u.phone_number as string) || '';
  form.patient_date_of_birth = (u.dob as string) || '';
  form.patient_gender = (u.gender as string) || '';
  form.user_id = u.id as string;
  isProfileIncomplete.value = !u.dob || !u.gender;
};

const setPatientToOther = () => {
  form.patient_name = '';
  form.patient_email = '';
  form.patient_phone = '';
  form.patient_date_of_birth = '';
  form.patient_gender = '';
  if (currentUser.value) form.user_id = currentUser.value.id as string;
  isProfileIncomplete.value = false;
};

const handleBookingForChange = (val: 'myself' | 'someone_else') => {
  form.booking_for = val;
  val === 'myself' ? setPatientToSelf() : setPatientToOther();
};

const formatScheduled = (iso: string) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString([], {
      weekday: 'short', year: 'numeric', month: 'short',
      day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
    });
  } catch { return iso; }
};

// ── File / dropzone ───────────────────────────────────────────
const addFiles = (files: File[]) => {
  files.filter(f => f.size <= 5 * 1024 * 1024).forEach(file => {
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    previewFiles.value.push({ file, preview, name: file.name });
  });
  form.attachments = previewFiles.value.map(f => f.file);
};

const onDrop = (e: DragEvent) => {
  isDragOver.value = false;
  addFiles(Array.from(e.dataTransfer?.files || []));
};

const onFileInputChange = (e: Event) => {
  addFiles(Array.from((e.target as HTMLInputElement).files || []));
};

const removeFile = (idx: number) => {
  const removed = previewFiles.value.splice(idx, 1)[0];
  if (removed.preview) URL.revokeObjectURL(removed.preview);
  form.attachments = previewFiles.value.map(f => f.file);
};

// ── Submit ────────────────────────────────────────────────────
const submitConsultation = async () => {
  if (!canProceed.value) { error.value = 'Please complete all required fields.'; return; }
  try {
    submitting.value = true;
    error.value = '';
    if (!form.user_id) { error.value = 'Please sign in to book a consultation.'; return; }
    if (isProfileIncomplete.value && form.booking_for === 'myself') {
      await authService.updateUserDetails({ dob: form.patient_date_of_birth, gender: form.patient_gender });
    }
    const { booking_for, user_id, ...intake } = form;
    const response = await consultationService.createConsultation(intake) as any;
    const apiMessage = response?.message || response?.data?.message;
    notifySuccess(
      'Consultation submitted!',
      apiMessage || `Your request has been received. A pharmacist will be in touch with you shortly.`,
      6000,
    );
    setTimeout(() => router.push('/consultations'), 800);
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } };
    error.value = e.response?.data?.message || 'Failed to book consultation. Please try again.';
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      userLocation.value = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    });
  }
  try {
    const user = await authService.getUserDetails();
    if (user) { currentUser.value = user; setPatientToSelf(); }
    const list = await pharmacyService.getAllPharmacies();
    pharmaciesData.value = list || [];
    if (pharmaciesData.value.length && !form.pharmacy_id) {
      const first = pharmaciesData.value[0];
      form.pharmacy_id = first.id;
      selectedPharmacy.value = { ...first, distKm: null } as PharmacyWithDist;
    }
  } catch {
    form.pharmacy_id = undefined;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 px-4">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Book a pharmacy consultation</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
          Tell us why you need help. A pharmacist will review your request and take any clinical measurements during your visit.
        </p>
      </div>

      <!-- Staff-only notice -->
      <div class="mb-8 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/80 dark:bg-blue-950/30 px-5 py-4 flex gap-3">
        <div class="text-blue-600 dark:text-blue-400 text-xl shrink-0">ℹ️</div>
        <p class="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
          <strong>You do not need to enter vital signs</strong> (blood pressure, temperature, etc.) — those are recorded by our pharmacy team when you are seen.
        </p>
      </div>

      <!-- Stepper -->
      <div class="mb-10 relative flex justify-between max-w-md mx-auto">
        <div class="absolute top-5 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-0" />
        <div class="absolute top-5 left-0 h-0.5 bg-[#246BFD] -z-0 transition-all duration-500" :style="{ width: `${stepsProgress}%` }" />
        <div v-for="step in steps" :key="step.number" class="relative z-10 flex flex-col items-center">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white dark:bg-gray-800 transition-colors"
            :class="currentStep >= step.number ? 'border-[#246BFD] text-[#246BFD]' : 'border-gray-300 text-gray-400'"
          >
            <component :is="step.icon" class="w-5 h-5" />
          </div>
          <span class="mt-2 text-xs font-medium" :class="currentStep >= step.number ? 'text-[#246BFD]' : 'text-gray-400'">
            {{ step.title }}
          </span>
        </div>
      </div>

      <Card class="p-8 min-h-[360px]">
        <Transition name="fade" mode="out-in">

          <!-- ── Step 1: Service ──────────────────────────────── -->
          <div v-if="currentStep === 1" key="s1" class="space-y-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">What do you need?</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-for="type in consultationTypes"
                :key="type.value"
                type="button"
                class="p-4 border rounded-xl text-left transition-all flex gap-3 items-start"
                :class="form.consultation_type === type.value
                  ? 'border-[#246BFD] ring-2 ring-[#246BFD]/30 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'"
                @click="form.consultation_type = type.value as ConsultationType"
              >
                <component :is="type.icon" class="w-6 h-6 text-[#246BFD] shrink-0" />
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">{{ type.label }}</div>
                  <div class="text-xs text-gray-500 mt-0.5">{{ type.desc }}</div>
                </div>
              </button>
            </div>

            <!-- Pharmacy picker -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Preferred pharmacy
              </label>

              <!-- Trigger button -->
              <button
                ref="pharmacyTriggerRef"
                type="button"
                class="w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-left transition-colors"
                :class="showPharmacyPicker ? 'border-[#246BFD] ring-2 ring-[#246BFD]/20' : 'border-gray-200 dark:border-gray-700 hover:border-[#246BFD]/50'"
                @click="openPharmacyPicker"
              >
                <div v-if="selectedPharmacy" class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 flex items-center justify-center">
                    <img v-if="selectedPharmacy.logo" :src="selectedPharmacy.logo" class="w-full h-full object-cover" />
                    <BuildingStorefrontIcon v-else class="w-5 h-5 text-gray-400" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ selectedPharmacy.name }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ selectedPharmacy.address }}</p>
                  </div>
                </div>
                <span v-else class="text-sm text-gray-400">Select a pharmacy</span>
                <ChevronDownIcon class="w-4 h-4 text-gray-400 shrink-0 transition-transform" :class="{ 'rotate-180': showPharmacyPicker }" />
              </button>

              <!-- Pharmacy list panel — teleported to body so it escapes any overflow/stacking context -->
              <Teleport to="body">
                <template v-if="showPharmacyPicker">
                  <div class="fixed inset-0 z-[9998]" @click="showPharmacyPicker = false" />
                  <div
                    class="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
                    :style="pharmacyPanelPos"
                  >
                    <div class="p-3 border-b border-gray-100 dark:border-gray-700">
                      <div class="relative">
                        <input
                          v-model="pharmacySearch"
                          type="text"
                          placeholder="Search by name or area..."
                          class="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#246BFD]/30 focus:border-[#246BFD]"
                          @click.stop
                        />
                        <BuildingStorefrontIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                      <p v-if="userLocation" class="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                        <MapPinIcon class="w-3 h-3" /> Sorted by distance from your location
                      </p>
                    </div>
                    <div class="max-h-60 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
                      <button
                        v-for="(pharmacy, idx) in filteredPharmacies"
                        :key="pharmacy.id"
                        type="button"
                        class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                        :class="{ 'bg-blue-50/40 dark:bg-blue-900/10': form.pharmacy_id === pharmacy.id }"
                        @click.stop="selectPharmacy(pharmacy)"
                      >
                        <div class="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 flex items-center justify-center">
                          <img v-if="pharmacy.logo" :src="pharmacy.logo" class="w-full h-full object-cover" />
                          <BuildingStorefrontIcon v-else class="w-5 h-5 text-gray-400" />
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2">
                            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ pharmacy.name }}</p>
                            <span
                              v-if="idx === 0 && pharmacy.distKm !== null"
                              class="shrink-0 text-[9px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30 px-1.5 py-0.5 rounded-full"
                            >NEAREST</span>
                          </div>
                          <p class="text-xs text-gray-500 truncate">{{ pharmacy.address }}</p>
                        </div>
                        <div class="shrink-0 flex items-center gap-2">
                          <span v-if="pharmacy.distKm !== null" class="text-xs font-bold text-[#246BFD] bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                            {{ fmtDist(pharmacy.distKm) }}
                          </span>
                          <CheckIcon v-if="form.pharmacy_id === pharmacy.id" class="w-4 h-4 text-[#246BFD]" />
                        </div>
                      </button>
                      <div v-if="!filteredPharmacies.length" class="px-4 py-6 text-center text-sm text-gray-400">
                        No pharmacies match your search.
                      </div>
                    </div>
                  </div>
                </template>
              </Teleport>

              <!-- Branch picker -->
              <div v-if="selectedPharmacy" class="space-y-2 mt-1">
                <div v-if="loadingBranches" class="flex items-center gap-2 text-xs text-gray-500 py-2">
                  <div class="w-3 h-3 border-2 border-[#246BFD] border-t-transparent rounded-full animate-spin" />
                  Loading branches…
                </div>
                <template v-else-if="selectedPharmacyBranches.length > 0">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Branch
                    <span class="ml-1 text-xs font-normal text-gray-400">{{ selectedPharmacyBranches.length }} available</span>
                  </label>

                  <button
                    ref="branchTriggerRef"
                    type="button"
                    class="w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-left transition-colors"
                    :class="showBranchPicker ? 'border-[#246BFD] ring-2 ring-[#246BFD]/20' : 'border-gray-200 dark:border-gray-700 hover:border-[#246BFD]/50'"
                    @click="openBranchPicker"
                  >
                    <div v-if="selectedBranch" class="flex items-center gap-3 min-w-0">
                      <div class="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 shrink-0 flex items-center justify-center">
                        <MapPinIcon class="w-4 h-4 text-indigo-500" />
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ selectedBranch.branchName }}</p>
                        <p class="text-xs text-gray-500 truncate">{{ selectedBranch.address }}</p>
                      </div>
                    </div>
                    <span v-else class="text-sm text-gray-400">Select a branch</span>
                    <ChevronDownIcon class="w-4 h-4 text-gray-400 shrink-0 transition-transform" :class="{ 'rotate-180': showBranchPicker }" />
                  </button>

                  <!-- Branch panel — also teleported -->
                  <Teleport to="body">
                    <template v-if="showBranchPicker">
                      <div class="fixed inset-0 z-[9998]" @click="showBranchPicker = false" />
                      <div
                        class="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
                        :style="branchPanelPos"
                      >
                        <div class="p-3 border-b border-gray-100 dark:border-gray-700">
                          <div class="relative">
                            <input
                              v-model="branchSearch"
                              type="text"
                              placeholder="Search branches..."
                              class="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#246BFD]/30 focus:border-[#246BFD]"
                              @click.stop
                            />
                            <MapPinIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <div class="max-h-52 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50">
                          <button
                            v-for="(branch, idx) in filteredBranches"
                            :key="branch.id"
                            type="button"
                            class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                            :class="{ 'bg-blue-50/40 dark:bg-blue-900/10': form.pharmacy_branch_id === branch.id }"
                            @click.stop="selectBranch(branch)"
                          >
                            <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 shrink-0 flex items-center justify-center">
                              <MapPinIcon class="w-4 h-4 text-indigo-500" />
                            </div>
                            <div class="flex-1 min-w-0">
                              <div class="flex items-center gap-2">
                                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ branch.branchName }}</p>
                                <span v-if="idx === 0 && branch.distKm !== null" class="shrink-0 text-[9px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30 px-1.5 py-0.5 rounded-full">NEAREST</span>
                              </div>
                              <p class="text-xs text-gray-500 truncate">{{ branch.address }}</p>
                            </div>
                            <div class="shrink-0 flex items-center gap-2">
                              <span v-if="branch.distKm !== null" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">
                                {{ fmtDist(branch.distKm) }}
                              </span>
                              <CheckIcon v-if="form.pharmacy_branch_id === branch.id" class="w-4 h-4 text-[#246BFD]" />
                            </div>
                          </button>
                        </div>
                      </div>
                    </template>
                  </Teleport>
                </template>
              </div>
            </div>

            <DateTimePicker
              label="Preferred date & time (optional)"
              format="datetime"
              :model-value="form.scheduled_at || ''"
              @update:model-value="(val: string) => (form.scheduled_at = val)"
              :min-date="new Date().toISOString()"
            />
          </div>

          <!-- ── Step 2: Patient ──────────────────────────────── -->
          <div v-else-if="currentStep === 2" key="s2" class="space-y-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Who is this for?</h2>

            <!-- Creative booking-for cards -->
            <div class="grid grid-cols-2 gap-4">
              <button
                type="button"
                class="relative overflow-hidden p-5 rounded-2xl border-2 text-left transition-all duration-200"
                :class="form.booking_for === 'myself'
                  ? 'border-[#246BFD] bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-blue-900/20 dark:to-indigo-900/10 shadow-md shadow-blue-100 dark:shadow-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'"
                @click="handleBookingForChange('myself')"
              >
                <!-- Check indicator -->
                <div class="absolute top-3 right-3">
                  <div
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                    :class="form.booking_for === 'myself' ? 'border-[#246BFD] bg-[#246BFD]' : 'border-gray-300 dark:border-gray-600'"
                  >
                    <CheckIcon v-if="form.booking_for === 'myself'" class="w-3 h-3 text-white" />
                  </div>
                </div>
                <!-- Icon -->
                <div
                  class="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center transition-all"
                  :class="form.booking_for === 'myself' ? 'bg-[#246BFD] text-white shadow-lg shadow-blue-300/40 dark:shadow-blue-900/40' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'"
                >
                  <UserIcon class="w-6 h-6" />
                </div>
                <p class="font-bold text-gray-900 dark:text-white text-sm mb-1">For Myself</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Pre-fill with your registered profile</p>
              </button>

              <button
                type="button"
                class="relative overflow-hidden p-5 rounded-2xl border-2 text-left transition-all duration-200"
                :class="form.booking_for === 'someone_else'
                  ? 'border-[#246BFD] bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-blue-900/20 dark:to-indigo-900/10 shadow-md shadow-blue-100 dark:shadow-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'"
                @click="handleBookingForChange('someone_else')"
              >
                <div class="absolute top-3 right-3">
                  <div
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                    :class="form.booking_for === 'someone_else' ? 'border-[#246BFD] bg-[#246BFD]' : 'border-gray-300 dark:border-gray-600'"
                  >
                    <CheckIcon v-if="form.booking_for === 'someone_else'" class="w-3 h-3 text-white" />
                  </div>
                </div>
                <div
                  class="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center transition-all"
                  :class="form.booking_for === 'someone_else' ? 'bg-[#246BFD] text-white shadow-lg shadow-blue-300/40 dark:shadow-blue-900/40' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'"
                >
                  <UserPlusIcon class="w-6 h-6" />
                </div>
                <p class="font-bold text-gray-900 dark:text-white text-sm mb-1">Someone Else</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Enter the patient's details manually</p>
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput label="Full name" v-model="form.patient_name" required :disabled="form.booking_for === 'myself'" />
              <TextInput label="Phone" v-model="form.patient_phone" required :disabled="form.booking_for === 'myself'" />
              <TextInput label="Email" v-model="form.patient_email" :disabled="form.booking_for === 'myself'" />
              <DateTimePicker
                label="Date of birth"
                format="date"
                :model-value="form.patient_date_of_birth || ''"
                @update:model-value="(val: string) => (form.patient_date_of_birth = val)"
                :max-date="new Date().toISOString()"
                :disabled="form.booking_for === 'myself' && !isProfileIncomplete"
              />
            </div>

            <!-- Inline gender selector -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="g in genderOptions"
                  :key="g.value"
                  type="button"
                  class="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                  :class="form.patient_gender === g.value
                    ? 'border-[#246BFD] bg-[#246BFD] text-white shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#246BFD]/40'"
                  :disabled="form.booking_for === 'myself' && !isProfileIncomplete"
                  @click="form.patient_gender = g.value"
                >
                  {{ g.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- ── Step 3: Request ──────────────────────────────── -->
          <div v-else key="s3" class="space-y-6">
            <TextInput
              type="textarea"
              label="Why are you requesting this consultation?"
              v-model="form.chief_complaint"
              :rows="4"
              required
              placeholder="Describe your concern in your own words — e.g. 'I have had a dry cough for 3 days and want advice on over-the-counter options.'"
              helper-text="At least 10 characters. A pharmacist will follow up with you."
            />

            <TextInput
              type="textarea"
              label="Anything else we should know? (optional)"
              v-model="form.consultation_notes"
              :rows="2"
              placeholder="Preferred contact time, accessibility needs, etc."
            />

            <!-- Dropzone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Photos <span class="text-xs font-normal text-gray-400">(optional)</span>
              </label>

              <div
                class="relative border-2 border-dashed rounded-2xl px-6 py-8 text-center cursor-pointer transition-all duration-200"
                :class="isDragOver
                  ? 'border-[#246BFD] bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-[#246BFD]/50 hover:bg-gray-50 dark:hover:bg-gray-800/40'"
                @dragover.prevent="isDragOver = true"
                @dragleave.prevent="isDragOver = false"
                @drop.prevent="onDrop"
                @click="fileInputRef?.click()"
              >
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  multiple
                  class="hidden"
                  @change="onFileInputChange"
                />
                <div class="flex flex-col items-center gap-3 pointer-events-none">
                  <div
                    class="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
                    :class="isDragOver ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'"
                  >
                    <ArrowUpTrayIcon class="w-7 h-7 transition-colors" :class="isDragOver ? 'text-[#246BFD]' : 'text-gray-400'" />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      <span class="text-[#246BFD] font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p class="text-xs text-gray-500 mt-1">Prescription label, rash photo, referral letter — JPG, PNG or PDF, max 5MB each</p>
                  </div>
                </div>
              </div>

              <!-- File previews -->
              <div v-if="previewFiles.length" class="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-3">
                <div v-for="(pf, idx) in previewFiles" :key="idx" class="relative group">
                  <div class="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <img v-if="pf.preview" :src="pf.preview" class="w-full h-full object-cover" />
                    <DocumentTextIcon v-else class="w-7 h-7 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full items-center justify-center shadow-sm hidden group-hover:flex transition-all"
                    @click.stop="removeFile(idx)"
                  >
                    <XMarkIcon class="w-3 h-3" />
                  </button>
                  <p class="text-[10px] text-gray-500 truncate mt-1 leading-tight">{{ pf.name }}</p>
                </div>
              </div>
            </div>

            <!-- Summary card -->
            <div class="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
              <!-- Header -->
              <div class="px-5 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <ClipboardDocumentListIcon class="w-4 h-4 text-gray-400" />
                <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Consultation Summary</span>
              </div>

              <div class="p-5 space-y-4 bg-white dark:bg-gray-800/30">
                <!-- Service -->
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <component :is="currentConsultationType?.icon" class="w-4 h-4 text-[#246BFD]" />
                  </div>
                  <div>
                    <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Service</p>
                    <p class="text-sm font-semibold text-gray-800 dark:text-gray-100 capitalize">
                      {{ form.consultation_type.replace(/_/g, ' ') }}
                    </p>
                  </div>
                </div>

                <!-- Patient -->
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                    <UserIcon class="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Patient</p>
                    <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ form.patient_name || '—' }}</p>
                  </div>
                </div>

                <!-- Pharmacy + Branch -->
                <div v-if="selectedPharmacy" class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                    <BuildingStorefrontIcon class="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pharmacy</p>
                    <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ selectedPharmacy.name }}</p>
                    <p v-if="selectedBranch" class="text-xs text-gray-500">{{ selectedBranch.branchName }}</p>
                  </div>
                </div>

                <!-- Schedule -->
                <div v-if="form.scheduled_at" class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                    <CalendarIcon class="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Scheduled</p>
                    <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ formatScheduled(form.scheduled_at || '') }}</p>
                  </div>
                </div>

                <!-- Chief complaint -->
                <div v-if="form.chief_complaint" class="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <p class="text-xs text-gray-400 italic line-clamp-3">"{{ form.chief_complaint }}"</p>
                </div>
              </div>
            </div>

            <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>

        </Transition>
      </Card>

      <div class="mt-8 flex justify-between">
        <Button v-if="currentStep > 1" variant="secondary" @click="prevStep">
          <ChevronLeftIcon class="w-4 h-4 inline mr-1" /> Back
        </Button>
        <span v-else />

        <Button
          v-if="currentStep < 3"
          variant="primary"
          :disabled="!canProceed"
          @click="nextStep"
        >
          Continue <ChevronRightIcon class="w-4 h-4 inline ml-1" />
        </Button>
        <Button
          v-else
          variant="primary"
          :loading="submitting"
          :disabled="!canProceed"
          class="bg-green-600 hover:bg-green-700"
          @click="submitConsultation"
        >
          Submit request <CheckCircleIcon class="w-5 h-5 inline ml-1" />
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
