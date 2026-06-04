<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSeoMeta } from '@/composables/useSeoMeta';

useSeoMeta({
  title: 'Join FyndRx as a Partner Pharmacy | FyndRx',
  description: 'Register your pharmacy on FyndRx and reach thousands of patients across Ghana. Complete our simple onboarding to get listed, verified, and start receiving online orders.',
  keywords: 'join FyndRx pharmacy, partner pharmacy Ghana, register pharmacy online, FyndRx partner',
  ogType: 'website',
});

const route = useRoute();
const router = useRouter();

// ─── Constants ────────────────────────────────────────────────────────────────

const DRAFT_KEY = 'fyndrx_pharmacy_onboarding_draft';
const TOTAL_STEPS = 7;

const STEPS = [
  { id: 1, title: 'Get Started',      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 2, title: 'Business Details', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 3, title: 'Location',         icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
  { id: 4, title: 'Operations',       icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 5, title: 'Team',             icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { id: 6, title: 'Banking',          icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { id: 7, title: 'Documents',        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

const GHANA_REGIONS = [
  'Greater Accra','Ashanti','Eastern','Western','Central','Volta','Northern',
  'Upper East','Upper West','Bono','Bono East','Ahafo','Western North',
  'Oti','Savannah','North East',
];

const PHARMACY_TYPES = [
  { value: 'community', label: 'Community / Retail Pharmacy' },
  { value: 'hospital',  label: 'Hospital Pharmacy' },
  { value: 'clinic',    label: 'Clinic Pharmacy' },
  { value: 'compounding', label: 'Compounding Pharmacy' },
  { value: 'specialist',  label: 'Specialist / Niche Pharmacy' },
];

const SERVICES_LIST = [
  'Drug Dispensing', 'Prescription Verification', 'OTC Medication Supply',
  'Compounding', 'Home Delivery', 'Blood Pressure Monitoring',
  'Blood Glucose Testing', 'Malaria Rapid Diagnostic Test (MRDT)',
  'Injectable Medications', 'Pharmaceutical Care & Counselling',
  'Vaccination / Immunisation', 'Family Planning Supplies',
  'Wound Care Products', 'Mother & Child Health Products',
];

const LANGUAGES = [
  'English','Twi (Akan)','Hausa','Ga','Ewe','Dagbani','Fante','Dagaare','Nzema','Kasem',
];

const SPECIAL_STORAGE = [
  { value: 'cold_chain',         label: 'Cold Chain / Refrigerated Storage' },
  { value: 'controlled_vault',   label: 'Controlled Substances Vault' },
  { value: 'hazardous_materials',label: 'Hazardous / Cytotoxic Materials' },
];

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const DOCUMENT_REQUIREMENTS = [
  {
    key: 'gpc_license',
    label: 'Ghana Pharmacy Council (GPC) License',
    description: 'Current year\'s pharmacy operating license issued by the Ghana Pharmacy Council.',
    required: true,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    key: 'fda_certificate',
    label: 'FDA Registration Certificate',
    description: 'Food and Drugs Authority product/facility registration certificate.',
    required: true,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    key: 'business_registration',
    label: 'Business Registration Certificate',
    description: 'Certificate of incorporation or business registration from the Registrar General\'s Department.',
    required: true,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    key: 'tin_certificate',
    label: 'TIN Certificate',
    description: 'Tax Identification Number certificate from the Ghana Revenue Authority.',
    required: true,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    key: 'superintendent_license',
    label: 'Superintendent Pharmacist License',
    description: 'Current GPC practising license of the superintendent pharmacist.',
    required: true,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    key: 'facility_exterior',
    label: 'Pharmacy Exterior Photo',
    description: 'Clear photograph of the front of the pharmacy showing the signage.',
    required: true,
    accept: '.jpg,.jpeg,.png',
  },
  {
    key: 'facility_interior',
    label: 'Dispensing Area Photo',
    description: 'Photograph of the dispensing counter / dispensary area.',
    required: false,
    accept: '.jpg,.jpeg,.png',
  },
  {
    key: 'proof_of_address',
    label: 'Proof of Address',
    description: 'Recent utility bill or tenancy/lease agreement for the pharmacy premises.',
    required: false,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
];

const BANKS = [
  'GCB Bank','Ecobank Ghana','Fidelity Bank Ghana','Stanbic Bank Ghana','Absa Bank Ghana',
  'Standard Chartered Bank Ghana','Access Bank Ghana','Zenith Bank Ghana','UBA Ghana',
  'Prudential Bank','Agricultural Development Bank','NIB Ghana','CalBank','First National Bank',
];

// ─── Reactive State ───────────────────────────────────────────────────────────

const currentStep = ref(0); // 0 = welcome screen
const isSaving = ref(false);
const isSubmitted = ref(false);
const resumeAvailable = ref(false);
const applicationId = ref<string | null>(null);
const stepErrors = reactive<Record<string, string>>({});

const form = reactive({
  // Step 1 – Get Started
  contact_email: '',
  pharmacy_name: '',

  // Step 2 – Business Details
  legal_name: '',
  pharmacy_type: '',
  year_established: '',
  gpc_license_number: '',
  fda_registration_number: '',
  business_registration_number: '',
  tin_number: '',
  description: '',

  // Step 3 – Location & Contact
  street_address: '',
  area_suburb: '',
  city: '',
  region: '',
  digital_address: '',
  primary_phone: '',
  whatsapp_number: '',
  secondary_phone: '',
  business_email: '',
  website: '',

  // Step 4 – Operations
  operating_hours: DAYS.map((day) => ({
    day,
    open: '08:00',
    close: '17:00',
    is_closed: day === 'Sunday',
    is_24h: false,
  })),
  services: [] as string[],
  delivery_available: false,
  delivery_radius_km: '',
  delivery_fee_structure: '',
  special_storage: [] as string[],
  accepts_online_prescriptions: true,

  // Step 5 – Team
  superintendent_name: '',
  superintendent_license_number: '',
  superintendent_phone: '',
  superintendent_email: '',
  staff_count_pharmacists: '',
  staff_count_technicians: '',
  staff_count_assistants: '',
  languages: [] as string[],

  // Step 6 – Banking
  bank_name: '',
  bank_account_name: '',
  bank_account_number: '',
  bank_branch: '',
  mobile_money_mtn: '',
  mobile_money_vodafone: '',
  mobile_money_airteltigo: '',
  preferred_payment_method: '',
});

// Document upload state per document key
const documents = reactive<Record<string, { file: File | null; preview: string | null; name: string | null; size: string | null }>>({});
DOCUMENT_REQUIREMENTS.forEach((doc) => {
  documents[doc.key] = { file: null, preview: null, name: null, size: null };
});

// ─── Computed ─────────────────────────────────────────────────────────────────

const progressPercent = computed(() =>
  currentStep.value === 0 ? 0 : Math.round((currentStep.value / TOTAL_STEPS) * 100)
);

const uploadedCount = computed(() =>
  DOCUMENT_REQUIREMENTS.filter((d) => documents[d.key].file).length
);

const requiredDocCount = computed(() =>
  DOCUMENT_REQUIREMENTS.filter((d) => d.required).length
);

const uploadedRequiredCount = computed(() =>
  DOCUMENT_REQUIREMENTS.filter((d) => d.required && documents[d.key].file).length
);

// ─── Draft Persistence ────────────────────────────────────────────────────────

function saveDraft() {
  try {
    const state = {
      currentStep: currentStep.value,
      form: { ...form, operating_hours: [...form.operating_hours] },
      applicationId: applicationId.value,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  } catch (_) { /* storage full — silently continue */ }
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.form?.contact_email) {
      Object.assign(form, saved.form);
      applicationId.value = saved.applicationId ?? null;
      resumeAvailable.value = true;
    }
  } catch (_) { /* malformed JSON — ignore */ }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

function resumeDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    Object.assign(form, saved.form);
    applicationId.value = saved.applicationId ?? null;
    currentStep.value = saved.currentStep ?? 1;
    resumeAvailable.value = false;
  } catch (_) {}
}

function startFresh() {
  clearDraft();
  applicationId.value = null;
  resumeAvailable.value = false;
  
  // Reset all form properties to their initial values
  form.contact_email = '';
  form.pharmacy_name = '';
  form.legal_name = '';
  form.pharmacy_type = '';
  form.year_established = '';
  form.gpc_license_number = '';
  form.fda_registration_number = '';
  form.business_registration_number = '';
  form.tin_number = '';
  form.description = '';
  form.street_address = '';
  form.area_suburb = '';
  form.city = '';
  form.region = '';
  form.digital_address = '';
  form.primary_phone = '';
  form.whatsapp_number = '';
  form.secondary_phone = '';
  form.business_email = '';
  form.website = '';
  form.operating_hours = DAYS.map((day) => ({
    day,
    open: '08:00',
    close: '17:00',
    is_closed: day === 'Sunday',
    is_24h: false,
  }));
  form.services = [];
  form.delivery_available = false;
  form.delivery_radius_km = '';
  form.delivery_fee_structure = '';
  form.special_storage = [];
  form.accepts_online_prescriptions = true;
  form.superintendent_name = '';
  form.superintendent_license_number = '';
  form.superintendent_phone = '';
  form.superintendent_email = '';
  form.staff_count_pharmacists = '';
  form.staff_count_technicians = '';
  form.staff_count_assistants = '';
  form.languages = [];
  form.bank_name = '';
  form.bank_account_name = '';
  form.bank_account_number = '';
  form.bank_branch = '';
  form.mobile_money_mtn = '';
  form.mobile_money_vodafone = '';
  form.mobile_money_airteltigo = '';
  form.preferred_payment_method = '';

  // Reset the documents reactive object
  DOCUMENT_REQUIREMENTS.forEach((doc) => {
    documents[doc.key] = { file: null, preview: null, name: null, size: null };
  });
}

// ─── Validation ───────────────────────────────────────────────────────────────

function clearErrors() {
  Object.keys(stepErrors).forEach((k) => delete stepErrors[k]);
}

function validateStep(step: number): boolean {
  clearErrors();
  if (step === 1) {
    if (!form.contact_email.trim()) stepErrors.contact_email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) stepErrors.contact_email = 'Enter a valid email';
    if (!form.pharmacy_name.trim()) stepErrors.pharmacy_name = 'Required';
  }
  if (step === 2) {
    if (!form.pharmacy_type) stepErrors.pharmacy_type = 'Required';
    if (!form.year_established) stepErrors.year_established = 'Required';
    if (!form.gpc_license_number.trim()) stepErrors.gpc_license_number = 'Required';
    if (!form.fda_registration_number.trim()) stepErrors.fda_registration_number = 'Required';
    if (!form.business_registration_number.trim()) stepErrors.business_registration_number = 'Required';
    if (!form.tin_number.trim()) stepErrors.tin_number = 'Required';
  }
  if (step === 3) {
    if (!form.street_address.trim()) stepErrors.street_address = 'Required';
    if (!form.city.trim()) stepErrors.city = 'Required';
    if (!form.region) stepErrors.region = 'Required';
    if (!form.primary_phone.trim()) stepErrors.primary_phone = 'Required';
    if (!form.business_email.trim()) stepErrors.business_email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.business_email)) stepErrors.business_email = 'Enter a valid email';
  }
  if (step === 4) {
    if (form.services.length === 0) stepErrors.services = 'Select at least one service';
  }
  if (step === 5) {
    if (!form.superintendent_name.trim()) stepErrors.superintendent_name = 'Required';
    if (!form.superintendent_license_number.trim()) stepErrors.superintendent_license_number = 'Required';
    if (!form.staff_count_pharmacists) stepErrors.staff_count_pharmacists = 'Required';
  }
  if (step === 6) {
    if (!form.bank_name) stepErrors.bank_name = 'Required';
    if (!form.bank_account_name.trim()) stepErrors.bank_account_name = 'Required';
    if (!form.bank_account_number.trim()) stepErrors.bank_account_number = 'Required';
  }
  return Object.keys(stepErrors).length === 0;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

async function nextStep() {
  if (currentStep.value === 0) { currentStep.value = 1; return; }
  if (!validateStep(currentStep.value)) return;
  isSaving.value = true;
  const success = await saveToApi();
  isSaving.value = false;
  if (!success) return;
  saveDraft();
  if (currentStep.value < TOTAL_STEPS) {
    currentStep.value++;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    await submitApplication();
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function goToStep(n: number) {
  if (n < currentStep.value) { currentStep.value = n; }
}

// ─── API Calls ────────────────────────────────────────────────────────────────

async function saveToApi(): Promise<boolean> {
  delete stepErrors.api;
  try {
    const endpoint = import.meta.env.VITE_API_URL;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': import.meta.env.VITE_API_KEY as string,
    };
    const payload = {
      ...form,
      step: currentStep.value,
      application_id: applicationId.value,
    };
    const method = applicationId.value ? 'PATCH' : 'POST';
    const url = applicationId.value
      ? `${endpoint}/pharmacy-applications/${applicationId.value}`
      : `${endpoint}/pharmacy-applications`;
    const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
    if (res.ok) {
      const data = await res.json();
      if (data.application_id) applicationId.value = data.application_id;
      return true;
    } else {
      const errorData = await res.json().catch(() => ({}));
      stepErrors.api = errorData.message || 'Failed to save application progress on server.';
      return false;
    }
  } catch (_) {
    stepErrors.api = 'Network error. Failed to save application progress on server.';
    return false;
  }
}

async function submitApplication() {
  isSaving.value = true;
  delete stepErrors.submit;
  try {
    const endpoint = import.meta.env.VITE_API_URL;
    // Upload documents first
    for (const doc of DOCUMENT_REQUIREMENTS) {
      if (documents[doc.key].file && applicationId.value) {
        const fd = new FormData();
        fd.append('document_type', doc.key);
        fd.append('file', documents[doc.key].file!);
        fd.append('application_id', applicationId.value);
        const docRes = await fetch(`${import.meta.env.VITE_API_URL}/pharmacy-applications/documents`, {
          method: 'POST',
          headers: { 'X-API-Key': import.meta.env.VITE_API_KEY as string },
          body: fd,
        });
        if (!docRes.ok) {
          const docErr = await docRes.json().catch(() => ({}));
          throw new Error(docErr.message || `Failed to upload document: ${doc.label}`);
        }
      }
    }
    // Final submit
    if (applicationId.value) {
      const subRes = await fetch(`${endpoint}/pharmacy-applications/${applicationId.value}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_API_KEY as string,
        },
        body: JSON.stringify({ submitted: true }),
      });
      if (!subRes.ok) {
        const subErr = await subRes.json().catch(() => ({}));
        throw new Error(subErr.message || 'Failed to submit application.');
      }
    } else {
      throw new Error('Application ID is missing. Please make sure you have filled out the previous steps.');
    }
    clearDraft();
    isSubmitted.value = true;
  } catch (err: any) {
    stepErrors.submit = err.message || 'Submission failed. Please try again or contact support@fyndrx.com.';
  } finally {
    isSaving.value = false;
  }
}

// ─── Document Upload ──────────────────────────────────────────────────────────

function handleFileSelect(docKey: string, event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    stepErrors[`doc_${docKey}`] = 'File too large. Maximum size is 10 MB.';
    return;
  }
  delete stepErrors[`doc_${docKey}`];
  const isImage = file.type.startsWith('image/');
  documents[docKey] = {
    file,
    preview: isImage ? URL.createObjectURL(file) : null,
    name: file.name,
    size: file.size > 1024 * 1024
      ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`,
  };
}

function removeFile(docKey: string) {
  if (documents[docKey].preview) URL.revokeObjectURL(documents[docKey].preview!);
  documents[docKey] = { file: null, preview: null, name: null, size: null };
}

function triggerFileInput(docKey: string) {
  (document.getElementById(`file_${docKey}`) as HTMLInputElement)?.click();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toggleService(service: string) {
  const idx = form.services.indexOf(service);
  idx === -1 ? form.services.push(service) : form.services.splice(idx, 1);
}

function toggleStorage(val: string) {
  const idx = form.special_storage.indexOf(val);
  idx === -1 ? form.special_storage.push(val) : form.special_storage.splice(idx, 1);
}

function toggleLanguage(lang: string) {
  const idx = form.languages.indexOf(lang);
  idx === -1 ? form.languages.push(lang) : form.languages.splice(idx, 1);
}

function formatFileSize(bytes: number) {
  return bytes > 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

const years = Array.from({ length: 60 }, (_, i) => String(new Date().getFullYear() - i));

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(() => {
  // Check for resume token in URL
  const token = route.query.token as string | undefined;
  if (token) {
    // TODO: fetch application by token from API and prefill form
    currentStep.value = 1;
  }
  loadDraft();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">

    <!-- ═══════════════════════════════ SUBMITTED SUCCESS ══════════════════════ -->
    <div v-if="isSubmitted" class="flex flex-col items-center justify-center min-h-screen px-4 py-20 text-center">
      <div class="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-8">
        <svg class="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Application Submitted!</h1>
      <p class="text-lg text-gray-600 dark:text-gray-300 max-w-xl mb-8">
        Thank you, <strong>{{ form.pharmacy_name }}</strong>. Your application is now under review by the FyndRx verification team.
      </p>
      <div class="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-left space-y-4 mb-8">
        <h3 class="font-bold text-gray-900 dark:text-white">What happens next?</h3>
        <div class="space-y-3">
          <div v-for="(step, i) in [
            { title: 'Document Verification (1–3 business days)', desc: 'Our team verifies your license, FDA certificate, and registration documents.' },
            { title: 'Account Activation Email', desc: 'Once verified, you\'ll receive an email with a secure link to set your pharmacy dashboard password.' },
            { title: 'Profile Goes Live', desc: 'Your pharmacy appears on FyndRx and patients can start placing orders.' },
          ]" :key="i" class="flex items-start gap-3">
            <div class="w-7 h-7 rounded-full bg-[#246BFD]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span class="text-xs font-bold text-[#246BFD]">{{ i + 1 }}</span>
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white text-sm">{{ step.title }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Questions? Email us at <a href="mailto:partners@fyndrx.com" class="text-[#246BFD] hover:underline">partners@fyndrx.com</a>
      </p>
      <router-link to="/" class="px-8 py-3 rounded-full bg-[#246BFD] text-white font-semibold hover:bg-[#5089FF] transition-all">
        Back to Homepage
      </router-link>
    </div>

    <template v-else>

      <!-- ═══════════════════════════ WELCOME SCREEN (Step 0) ════════════════ -->
      <div v-if="currentStep === 0" class="relative">

        <!-- Resume banner -->
        <transition enter-active-class="duration-300 ease-out" enter-from-class="-translate-y-full opacity-0" enter-to-class="translate-y-0 opacity-100">
          <div v-if="resumeAvailable" class="bg-[#FE9615] text-white px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm font-medium">
            <span>You have an unfinished application for <strong>{{ form.pharmacy_name || 'your pharmacy' }}</strong>.</span>
            <div class="flex gap-3">
              <button @click="resumeDraft" class="px-4 py-1.5 rounded-full bg-white text-[#FE9615] font-semibold hover:bg-gray-100 transition-colors">
                Resume Application
              </button>
              <button @click="startFresh" class="text-white/70 hover:text-white underline">Start Fresh</button>
            </div>
          </div>
        </transition>

        <!-- Hero -->
        <div class="relative bg-gradient-to-br from-[#246BFD] to-[#5089FF] pt-20 pb-32 overflow-hidden">
          <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-[#FE9615]/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Grow Your Pharmacy<br class="hidden sm:block" />
              <span class="text-[#FE9615]">with FyndRx</span>
            </h1>
            <p class="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
              Join Ghana's fastest-growing digital health platform. Get discovered by thousands of patients, receive online orders, and streamline your prescription management.
            </p>
            <button
              @click="currentStep = 1"
              class="px-10 py-4 rounded-full bg-white text-[#246BFD] font-bold text-lg hover:bg-gray-100 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              Start Your Application
            </button>
          </div>
        </div>

        <!-- Benefits -->
        <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-20">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
            <div v-for="b in [
              { icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: '#246BFD', title: 'Increased Revenue', desc: 'Tap into a growing patient base actively searching for medications online.' },
              { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: '#FE9615', title: 'Digital Prescriptions', desc: 'Receive verified prescriptions digitally — no more paper handling errors.' },
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: '#10B981', title: 'Trusted Verification', desc: 'Our FDA & GPC verification badge builds immediate patient trust.' },
            ]" :key="b.title" class="bg-white dark:bg-gray-800 rounded-2xl p-7 shadow-md border border-gray-100 dark:border-gray-700 text-center">
              <div class="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" :style="{ backgroundColor: b.color + '15' }">
                <svg class="w-7 h-7" :style="{ color: b.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="b.icon" />
                </svg>
              </div>
              <h3 class="font-bold text-gray-900 dark:text-white mb-2">{{ b.title }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ b.desc }}</p>
            </div>
          </div>

          <!-- What you'll need -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-3xl mx-auto">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What you'll need
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div v-for="item in [
                'Ghana Pharmacy Council license (current year)',
                'FDA registration certificate',
                'Business registration (Registrar General)',
                'TIN certificate',
                'Superintendent pharmacist license',
                'Bank account details',
                'Mobile money numbers',
                'Photos of your pharmacy premises',
              ]" :key="item" class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <svg class="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ item }}
              </div>
            </div>
            <p class="mt-6 text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
              💡 You can <strong>save your progress</strong> at any step and return later — documents can be uploaded after you've filled in the text details.
            </p>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════ MULTI-STEP FORM (Steps 1–7) ════════════ -->
      <div v-else class="mt-6">

        <!-- Top Stepper -->
        <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-20 z-30 shadow-sm">
          <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

            <!-- Mobile: progress bar -->
            <div class="sm:hidden">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                  Step {{ currentStep }} of {{ TOTAL_STEPS }} — {{ STEPS[currentStep - 1]?.title }}
                </span>
                <span class="text-sm text-gray-500">{{ progressPercent }}%</span>
              </div>
              <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-[#246BFD] rounded-full transition-all duration-500" :style="{ width: progressPercent + '%' }"></div>
              </div>
            </div>

            <!-- Desktop: step pills -->
            <div class="hidden sm:flex items-center justify-between">
              <div v-for="step in STEPS" :key="step.id" class="flex items-center" :class="step.id < STEPS.length ? 'flex-1' : ''">
                <button
                  @click="goToStep(step.id)"
                  :disabled="step.id > currentStep"
                  class="flex items-center gap-2 group"
                  :class="step.id > currentStep ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'"
                >
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 text-sm font-bold"
                    :class="[
                      step.id < currentStep ? 'bg-green-500 text-white' :
                      step.id === currentStep ? 'bg-[#246BFD] text-white ring-4 ring-[#246BFD]/20' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    ]"
                  >
                    <svg v-if="step.id < currentStep" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span v-else>{{ step.id }}</span>
                  </div>
                  <span
                    class="text-xs font-medium hidden lg:block whitespace-nowrap transition-colors"
                    :class="step.id === currentStep ? 'text-[#246BFD]' : step.id < currentStep ? 'text-green-600' : 'text-gray-400'"
                  >
                    {{ step.title }}
                  </span>
                </button>
                <div v-if="step.id < STEPS.length" class="flex-1 h-px mx-2" :class="step.id < currentStep ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Body -->
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <!-- ── STEP 1: Get Started ─────────────────────────────────────── -->
          <div v-if="currentStep === 1">
            <div class="mb-8">
              <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Let's get started</h2>
              <p class="text-gray-500 dark:text-gray-400">We'll use your email to save your progress so you can return and continue at any time.</p>
            </div>
            <div class="space-y-5">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Contact Email <span class="text-red-500">*</span>
                </label>
                <input v-model="form.contact_email" type="email" placeholder="you@pharmacy.com"
                  class="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent transition-all outline-none"
                  :class="stepErrors.contact_email ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'" />
                <p v-if="stepErrors.contact_email" class="mt-1 text-xs text-red-500">{{ stepErrors.contact_email }}</p>
                <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Your application progress link will be sent here. Use the pharmacy owner or manager's email.</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Pharmacy Trading Name <span class="text-red-500">*</span>
                </label>
                <input v-model="form.pharmacy_name" type="text" placeholder="e.g. HealthPlus Pharmacy"
                  class="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent transition-all outline-none"
                  :class="stepErrors.pharmacy_name ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'" />
                <p v-if="stepErrors.pharmacy_name" class="mt-1 text-xs text-red-500">{{ stepErrors.pharmacy_name }}</p>
              </div>
            </div>
          </div>

          <!-- ── STEP 2: Business Details ────────────────────────────────── -->
          <div v-if="currentStep === 2">
            <div class="mb-8">
              <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Business Details</h2>
              <p class="text-gray-500 dark:text-gray-400">Regulatory and registration information for your pharmacy.</p>
            </div>
            <div class="space-y-5">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Legal / Registered Name</label>
                <input v-model="form.legal_name" type="text" placeholder="As on registration certificate"
                  class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all" />
                <p class="mt-1 text-xs text-gray-500">Leave blank if same as trading name.</p>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Pharmacy Type <span class="text-red-500">*</span></label>
                  <select v-model="form.pharmacy_type"
                    class="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all"
                    :class="stepErrors.pharmacy_type ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'">
                    <option value="" disabled>Select type</option>
                    <option v-for="t in PHARMACY_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
                  </select>
                  <p v-if="stepErrors.pharmacy_type" class="mt-1 text-xs text-red-500">{{ stepErrors.pharmacy_type }}</p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Year Established <span class="text-red-500">*</span></label>
                  <select v-model="form.year_established"
                    class="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all"
                    :class="stepErrors.year_established ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'">
                    <option value="" disabled>Select year</option>
                    <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                  </select>
                  <p v-if="stepErrors.year_established" class="mt-1 text-xs text-red-500">{{ stepErrors.year_established }}</p>
                </div>
              </div>

              <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <p class="text-sm font-semibold text-[#246BFD] mb-3">Regulatory Licence Numbers</p>
                <div class="space-y-4">
                  <div v-for="field in [
                    { key: 'gpc_license_number', label: 'Ghana Pharmacy Council (GPC) Licence No.', placeholder: 'e.g. GPC/2024/XXXXX' },
                    { key: 'fda_registration_number', label: 'FDA Registration Number', placeholder: 'e.g. FDA/2024/XXXXX' },
                    { key: 'business_registration_number', label: 'Business Registration No. (Registrar General)', placeholder: 'e.g. CS-123456789' },
                    { key: 'tin_number', label: 'Tax Identification Number (TIN)', placeholder: 'e.g. C0012345678' },
                  ]" :key="field.key">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ field.label }} <span class="text-red-500">*</span></label>
                    <input v-model="(form as any)[field.key]" type="text" :placeholder="field.placeholder"
                      class="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all text-sm"
                      :class="stepErrors[field.key] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'" />
                    <p v-if="stepErrors[field.key]" class="mt-1 text-xs text-red-500">{{ stepErrors[field.key] }}</p>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Brief Description of Your Pharmacy <span class="text-gray-400 font-normal">(optional)</span></label>
                <textarea v-model="form.description" rows="3" placeholder="Tell patients what makes your pharmacy special — your specialties, years of service, or community focus."
                  class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all resize-none text-sm"></textarea>
              </div>
            </div>
          </div>

          <!-- ── STEP 3: Location & Contact ─────────────────────────────── -->
          <div v-if="currentStep === 3">
            <div class="mb-8">
              <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Location & Contact</h2>
              <p class="text-gray-500 dark:text-gray-400">How patients find and reach you.</p>
            </div>
            <div class="space-y-5">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Street Address <span class="text-red-500">*</span></label>
                <input v-model="form.street_address" type="text" placeholder="House/plot number and street name"
                  class="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all"
                  :class="stepErrors.street_address ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'" />
                <p v-if="stepErrors.street_address" class="mt-1 text-xs text-red-500">{{ stepErrors.street_address }}</p>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Area / Suburb</label>
                  <input v-model="form.area_suburb" type="text" placeholder="e.g. Labone, Adum, Ashaiman"
                    class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">City / Town <span class="text-red-500">*</span></label>
                  <input v-model="form.city" type="text" placeholder="e.g. Accra, Kumasi, Tamale"
                    class="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all"
                    :class="stepErrors.city ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'" />
                  <p v-if="stepErrors.city" class="mt-1 text-xs text-red-500">{{ stepErrors.city }}</p>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Region <span class="text-red-500">*</span></label>
                  <select v-model="form.region"
                    class="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all"
                    :class="stepErrors.region ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'">
                    <option value="" disabled>Select region</option>
                    <option v-for="r in GHANA_REGIONS" :key="r" :value="r">{{ r }}</option>
                  </select>
                  <p v-if="stepErrors.region" class="mt-1 text-xs text-red-500">{{ stepErrors.region }}</p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    GhanaPostGPS Digital Address
                    <span class="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input v-model="form.digital_address" type="text" placeholder="e.g. GA-123-4567"
                    class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all" />
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Primary Phone <span class="text-red-500">*</span></label>
                  <input v-model="form.primary_phone" type="tel" placeholder="+233 XX XXX XXXX"
                    class="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all"
                    :class="stepErrors.primary_phone ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'" />
                  <p v-if="stepErrors.primary_phone" class="mt-1 text-xs text-red-500">{{ stepErrors.primary_phone }}</p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">WhatsApp Number</label>
                  <input v-model="form.whatsapp_number" type="tel" placeholder="+233 XX XXX XXXX"
                    class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all" />
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Business Email <span class="text-red-500">*</span></label>
                  <input v-model="form.business_email" type="email" placeholder="pharmacy@example.com"
                    class="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all"
                    :class="stepErrors.business_email ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'" />
                  <p v-if="stepErrors.business_email" class="mt-1 text-xs text-red-500">{{ stepErrors.business_email }}</p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Website <span class="text-gray-400 font-normal">(optional)</span></label>
                  <input v-model="form.website" type="url" placeholder="https://yourpharmacy.com"
                    class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>

          <!-- ── STEP 4: Operations ─────────────────────────────────────── -->
          <div v-if="currentStep === 4">
            <div class="mb-8">
              <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Services & Operations</h2>
              <p class="text-gray-500 dark:text-gray-400">Operating hours, services offered, and delivery capabilities.</p>
            </div>
            <div class="space-y-8">

              <!-- Operating Hours -->
              <div>
                <h3 class="text-base font-bold text-gray-900 dark:text-white mb-4">Operating Hours</h3>
                <div class="space-y-2">
                  <div v-for="(hours, idx) in form.operating_hours" :key="hours.day"
                    class="grid grid-cols-12 gap-2 items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
                    <span class="col-span-3 text-sm font-medium text-gray-700 dark:text-gray-300">{{ hours.day.slice(0, 3) }}</span>
                    <div class="col-span-3 flex items-center gap-1.5">
                      <input type="checkbox" :id="`closed_${idx}`" v-model="hours.is_closed"
                        class="rounded border-gray-300 text-[#246BFD] focus:ring-[#246BFD]" />
                      <label :for="`closed_${idx}`" class="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">Closed</label>
                    </div>
                    <template v-if="!hours.is_closed">
                      <div class="col-span-3 flex items-center gap-1.5">
                        <input type="checkbox" :id="`h24_${idx}`" v-model="hours.is_24h"
                          class="rounded border-gray-300 text-[#246BFD] focus:ring-[#246BFD]" />
                        <label :for="`h24_${idx}`" class="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">24h</label>
                      </div>
                      <div v-if="!hours.is_24h" class="col-span-3 flex items-center gap-1">
                        <input v-model="hours.open" type="time"
                          class="flex-1 px-2 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#246BFD] outline-none" />
                        <span class="text-gray-400 text-xs">–</span>
                        <input v-model="hours.close" type="time"
                          class="flex-1 px-2 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#246BFD] outline-none" />
                      </div>
                      <div v-else class="col-span-3 text-xs text-green-600 font-medium">Open 24 hours</div>
                    </template>
                    <div v-else class="col-span-6 text-xs text-gray-400 italic">Not open this day</div>
                  </div>
                </div>
              </div>

              <!-- Services -->
              <div>
                <h3 class="text-base font-bold text-gray-900 dark:text-white mb-1">Services Offered <span class="text-red-500">*</span></h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Select all that apply. This helps patients know what to expect at your pharmacy.</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="service in SERVICES_LIST"
                    :key="service"
                    type="button"
                    @click="toggleService(service)"
                    class="px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200"
                    :class="form.services.includes(service)
                      ? 'bg-[#246BFD] text-white border-[#246BFD]'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-[#246BFD] hover:text-[#246BFD]'"
                  >
                    {{ service }}
                  </button>
                </div>
                <p v-if="stepErrors.services" class="mt-2 text-xs text-red-500">{{ stepErrors.services }}</p>
              </div>

              <!-- Delivery -->
              <div class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div class="flex items-center gap-3 mb-4">
                  <input type="checkbox" id="delivery_available" v-model="form.delivery_available"
                    class="w-5 h-5 rounded border-gray-300 text-[#246BFD] focus:ring-[#246BFD]" />
                  <label for="delivery_available" class="text-base font-bold text-gray-900 dark:text-white cursor-pointer">
                    We offer home delivery
                  </label>
                </div>
                <template v-if="form.delivery_available">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Delivery Radius (km)</label>
                      <input v-model="form.delivery_radius_km" type="number" placeholder="e.g. 10"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all text-sm" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Delivery Fee Structure</label>
                      <input v-model="form.delivery_fee_structure" type="text" placeholder="e.g. GHS 10 within 5km, GHS 20 beyond"
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all text-sm" />
                    </div>
                  </div>
                </template>
              </div>

              <!-- Special Storage -->
              <div>
                <h3 class="text-base font-bold text-gray-900 dark:text-white mb-3">Special Storage Capabilities <span class="text-gray-400 font-normal text-sm">(optional)</span></h3>
                <div class="space-y-2">
                  <label v-for="opt in SPECIAL_STORAGE" :key="opt.value" class="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" :value="opt.value" v-model="form.special_storage"
                      class="w-5 h-5 rounded border-gray-300 text-[#246BFD] focus:ring-[#246BFD]" />
                    <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#246BFD] transition-colors">{{ opt.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Accepts online prescriptions -->
              <div class="flex items-center gap-3">
                <input type="checkbox" id="accepts_rx" v-model="form.accepts_online_prescriptions"
                  class="w-5 h-5 rounded border-gray-300 text-[#246BFD] focus:ring-[#246BFD]" />
                <label for="accepts_rx" class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  We accept digitally uploaded prescriptions via FyndRx
                </label>
              </div>

            </div>
          </div>

          <!-- ── STEP 5: Team ────────────────────────────────────────────── -->
          <div v-if="currentStep === 5">
            <div class="mb-8">
              <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Team & Qualifications</h2>
              <p class="text-gray-500 dark:text-gray-400">Your licensed superintendent pharmacist and staff details.</p>
            </div>
            <div class="space-y-5">
              <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                <h3 class="text-sm font-bold text-[#246BFD] uppercase tracking-wide mb-4">Superintendent Pharmacist</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name <span class="text-red-500">*</span></label>
                    <input v-model="form.superintendent_name" type="text" placeholder="Dr. Kwame Mensah"
                      class="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all"
                      :class="stepErrors.superintendent_name ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'" />
                    <p v-if="stepErrors.superintendent_name" class="mt-1 text-xs text-red-500">{{ stepErrors.superintendent_name }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">GPC Practising Licence No. <span class="text-red-500">*</span></label>
                    <input v-model="form.superintendent_license_number" type="text" placeholder="e.g. GPC/P/2024/XXXXX"
                      class="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all"
                      :class="stepErrors.superintendent_license_number ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'" />
                    <p v-if="stepErrors.superintendent_license_number" class="mt-1 text-xs text-red-500">{{ stepErrors.superintendent_license_number }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                    <input v-model="form.superintendent_phone" type="tel" placeholder="+233 XX XXX XXXX"
                      class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                    <input v-model="form.superintendent_email" type="email" placeholder="superintendent@pharmacy.com"
                      class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-base font-bold text-gray-900 dark:text-white mb-4">Staff Headcount</h3>
                <div class="grid grid-cols-3 gap-4">
                  <div v-for="field in [
                    { key: 'staff_count_pharmacists', label: 'Licensed Pharmacists', req: true },
                    { key: 'staff_count_technicians', label: 'Pharmacy Technicians', req: false },
                    { key: 'staff_count_assistants', label: 'Dispensary Assistants', req: false },
                  ]" :key="field.key">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {{ field.label }} <span v-if="field.req" class="text-red-500">*</span>
                    </label>
                    <input v-model="(form as any)[field.key]" type="number" min="0" placeholder="0"
                      class="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all text-center text-lg font-semibold"
                      :class="stepErrors[field.key] ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'" />
                    <p v-if="stepErrors[field.key]" class="mt-1 text-xs text-red-500 text-center">{{ stepErrors[field.key] }}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-base font-bold text-gray-900 dark:text-white mb-3">Languages Spoken by Staff</h3>
                <div class="flex flex-wrap gap-2">
                  <button v-for="lang in LANGUAGES" :key="lang" type="button" @click="toggleLanguage(lang)"
                    class="px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200"
                    :class="form.languages.includes(lang)
                      ? 'bg-[#FE9615] text-white border-[#FE9615]'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-[#FE9615] hover:text-[#FE9615]'">
                    {{ lang }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ── STEP 6: Banking ─────────────────────────────────────────── -->
          <div v-if="currentStep === 6">
            <div class="mb-8">
              <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Banking & Payments</h2>
              <p class="text-gray-500 dark:text-gray-400">How FyndRx will remit collected payments to your pharmacy.</p>
            </div>
            <div class="space-y-6">
              <div class="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800 flex gap-3">
                <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-sm text-amber-800 dark:text-amber-200">Payment details are encrypted and stored securely. FyndRx settles payments on a weekly basis directly to your account.</p>
              </div>

              <div>
                <h3 class="text-base font-bold text-gray-900 dark:text-white mb-4">Bank Account</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Bank Name <span class="text-red-500">*</span></label>
                    <select v-model="form.bank_name"
                      class="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all"
                      :class="stepErrors.bank_name ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'">
                      <option value="" disabled>Select bank</option>
                      <option v-for="b in BANKS" :key="b" :value="b">{{ b }}</option>
                      <option value="Other">Other</option>
                    </select>
                    <p v-if="stepErrors.bank_name" class="mt-1 text-xs text-red-500">{{ stepErrors.bank_name }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Branch</label>
                    <input v-model="form.bank_branch" type="text" placeholder="e.g. Accra Main Branch"
                      class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Account Name <span class="text-red-500">*</span></label>
                    <input v-model="form.bank_account_name" type="text" placeholder="As it appears on your bank statement"
                      class="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all"
                      :class="stepErrors.bank_account_name ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'" />
                    <p v-if="stepErrors.bank_account_name" class="mt-1 text-xs text-red-500">{{ stepErrors.bank_account_name }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Account Number <span class="text-red-500">*</span></label>
                    <input v-model="form.bank_account_number" type="text" placeholder="Bank account number"
                      class="w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all"
                      :class="stepErrors.bank_account_number ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'" />
                    <p v-if="stepErrors.bank_account_number" class="mt-1 text-xs text-red-500">{{ stepErrors.bank_account_number }}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-base font-bold text-gray-900 dark:text-white mb-4">Mobile Money Numbers <span class="text-gray-400 font-normal text-sm">(at least one recommended)</span></h3>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div v-for="mm in [
                    { key: 'mobile_money_mtn', label: 'MTN MoMo', placeholder: '024 XXX XXXX', color: '#FFC107' },
                    { key: 'mobile_money_vodafone', label: 'Telecel Cash', placeholder: '020 XXX XXXX', color: '#E53935' },
                    { key: 'mobile_money_airteltigo', label: 'AirtelTigo Money', placeholder: '026 XXX XXXX', color: '#F57C00' },
                  ]" :key="mm.key">
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{{ mm.label }}</label>
                      <input v-model="(form as any)[mm.key]" type="tel" :placeholder="mm.placeholder"
                        class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── STEP 7: Documents ───────────────────────────────────────── -->
          <div v-if="currentStep === 7">
            <div class="mb-6">
              <div class="flex items-start gap-4">
                <div>
                  <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Upload Documents</h2>
                  <p class="text-gray-500 dark:text-gray-400">Required for verification. Max 10 MB per file — PDF, JPG, or PNG.</p>
                </div>
              </div>
              <!-- Upload progress badge -->
              <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full"
                :class="uploadedRequiredCount === requiredDocCount ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'">
                <svg v-if="uploadedRequiredCount === requiredDocCount" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span class="text-sm font-semibold">{{ uploadedCount }} of {{ DOCUMENT_REQUIREMENTS.length }} documents uploaded</span>
              </div>
              <p v-if="uploadedRequiredCount < requiredDocCount" class="mt-2 text-sm text-amber-700 dark:text-amber-400">
                You can proceed and upload documents later — your application will remain in draft until all required documents are received.
              </p>
            </div>

            <div class="space-y-4">
              <div v-for="doc in DOCUMENT_REQUIREMENTS" :key="doc.key"
                class="bg-white dark:bg-gray-800 rounded-2xl border transition-colors"
                :class="documents[doc.key].file ? 'border-green-300 dark:border-green-700' : 'border-gray-200 dark:border-gray-700'">
                <div class="p-5">
                  <div class="flex items-start justify-between gap-4 mb-3">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <h4 class="text-sm font-bold text-gray-900 dark:text-white">{{ doc.label }}</h4>
                        <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="doc.required ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'">
                          {{ doc.required ? 'Required' : 'Optional' }}
                        </span>
                      </div>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ doc.description }}</p>
                    </div>
                    <!-- Uploaded state -->
                    <div v-if="documents[doc.key].file" class="flex items-center gap-2 flex-shrink-0">
                      <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <!-- Uploaded file display -->
                  <div v-if="documents[doc.key].file" class="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3">
                    <img v-if="documents[doc.key].preview" :src="documents[doc.key].preview!" class="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                    <div v-else class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ documents[doc.key].name }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ documents[doc.key].size }}</p>
                    </div>
                    <button @click="removeFile(doc.key)" type="button"
                      class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <!-- Upload zone -->
                  <div v-else>
                    <input :id="`file_${doc.key}`" type="file" :accept="doc.accept" class="sr-only"
                      @change="handleFileSelect(doc.key, $event)" />
                    <button type="button" @click="triggerFileInput(doc.key)"
                      class="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl px-6 py-5 flex flex-col items-center gap-2 hover:border-[#246BFD] hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group">
                      <svg class="w-8 h-8 text-gray-400 group-hover:text-[#246BFD] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span class="text-sm text-gray-500 dark:text-gray-400 group-hover:text-[#246BFD] transition-colors">
                        Click to browse or drag & drop
                      </span>
                      <span class="text-xs text-gray-400">{{ doc.accept.replace(/\./g, '').toUpperCase() }} • Max 10 MB</span>
                    </button>
                    <p v-if="stepErrors[`doc_${doc.key}`]" class="mt-1 text-xs text-red-500">{{ stepErrors[`doc_${doc.key}`] }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ─── Submit error ──────────────────────────────────────────── -->
          <p v-if="stepErrors.api" class="mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            {{ stepErrors.api }}
          </p>
          <p v-if="stepErrors.submit" class="mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            {{ stepErrors.submit }}
          </p>

          <!-- ─── Navigation buttons ─────────────────────────────────────── -->
          <div class="mt-10 flex items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              v-if="currentStep > 1"
              type="button"
              @click="prevStep"
              class="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div v-else></div>

            <div class="flex items-center gap-3">
              <button
                type="button"
                @click="saveDraft(); $event.target.textContent = 'Saved ✓'"
                class="px-6 py-3 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
              >
                Save Draft
              </button>
              <button
                type="button"
                @click="nextStep"
                :disabled="isSaving"
                class="flex items-center gap-2 px-8 py-3 rounded-full bg-[#246BFD] text-white font-semibold hover:bg-[#5089FF] transition-all duration-300 shadow-lg hover:shadow-[#246BFD]/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span v-if="isSaving" class="flex items-center gap-2">
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Saving…
                </span>
                <template v-else>
                  <span>{{ currentStep === TOTAL_STEPS ? 'Submit Application' : 'Continue' }}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </template>
              </button>
            </div>
          </div>

        </div><!-- /form body -->
      </div><!-- /multi-step -->
    </template><!-- /not submitted -->
  </div>
</template>
