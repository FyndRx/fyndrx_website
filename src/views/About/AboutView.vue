<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSeoMeta } from '@/composables/useSeoMeta';
import { informationService, type TeamMember, type TeamMemberSocialLinks, type AppSettings } from '@/services/informationService';
import { sanitizeHtml } from '@/utils/sanitize';

interface SocialIconDef {
  label: string;
  color: string;
  path: string;
}

// Keyed by the platform values the admin panel's "Social Links" repeater
// offers, plus a couple seen in already-seeded data (e.g. "github") that
// aren't in that list yet. Anything else falls back to a generic link icon.
const SOCIAL_ICONS: Record<string, SocialIconDef> = {
  linkedin: {
    label: 'LinkedIn',
    color: '#0A66C2',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 110-4.124 2.062 2.062 0 010 4.124zM7.119 20.452H3.555V9h3.564v11.452z',
  },
  x: {
    label: 'X',
    color: '#000000',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  twitter: {
    label: 'Twitter',
    color: '#1DA1F2',
    path: 'M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.024-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.163-1.227.163-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.324-2.41z',
  },
  facebook: {
    label: 'Facebook',
    color: '#1877F2',
    path: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 011.141.195v3.325a8.623 8.623 0 00-.653-.036 26.805 26.805 0 00-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 00-.679.622c-.191.303-.29.612-.29 1.198v1.351h2.98v3.667h-2.98v7.98H9.101z',
  },
  instagram: {
    label: 'Instagram',
    color: '#E4405F',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
  youtube: {
    label: 'YouTube',
    color: '#FF0000',
    path: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  whatsapp: {
    label: 'WhatsApp',
    color: '#25D366',
    path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.822 9.822 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
  },
  telegram: {
    label: 'Telegram',
    color: '#26A5E4',
    path: 'M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.751-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.332-1.386 4.025-1.627 4.476-1.635z',
  },
  tiktok: {
    label: 'TikTok',
    color: '#000000',
    path: 'M16.6 5.82s.51.5 0 0A4.278 4.278 0 0115.54 3h-3.09v12.4a2.592 2.592 0 01-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 004.3 1.38V7.3s-1.88.09-3.24-1.48z',
  },
  snapchat: {
    label: 'Snapchat',
    color: '#FFFC00',
    path: 'M12.006 1.5c3.19 0 5.53 2.36 5.7 5.49.05.86.03 1.72.02 2.58.16.09.37.13.66.05.32-.09.62-.28.96-.28.44 0 .8.32.8.79 0 .38-.24.63-.55.83.5.35 1.15.53 1.7.72.3.1.48.42.4.73-.12.46-.65.6-1.05.75-.2.07-.27.28-.17.47.16.32.28.66.15 1.01-.15.4-.55.55-.93.6-.32.05-.35.29-.24.55.14.33.03.63-.27.79-.44.24-1.04.2-1.5.42-.4.19-.55.62-.9.87-.72.5-1.65.68-2.5.68-.85 0-1.78-.18-2.5-.68-.35-.25-.5-.68-.9-.87-.46-.22-1.06-.18-1.5-.42-.3-.16-.41-.46-.27-.79.11-.26.08-.5-.24-.55-.38-.05-.78-.2-.93-.6-.13-.35-.01-.69.15-1.01.1-.19.03-.4-.17-.47-.4-.15-.93-.29-1.05-.75-.08-.31.1-.63.4-.73.55-.19 1.2-.37 1.7-.72-.31-.2-.55-.45-.55-.83 0-.47.36-.79.8-.79.34 0 .64.19.96.28.29.08.5.04.66-.05-.01-.86-.03-1.72.02-2.58.17-3.13 2.51-5.49 5.7-5.49z',
  },
  github: {
    label: 'GitHub',
    color: '#181717',
    path: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
  },
};

const GENERIC_LINK_ICON = 'M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5';

const socialIconFor = (platform: string): SocialIconDef => {
  const key = platform.trim().toLowerCase();
  if (key === 'twitter' || key === 'x') return SOCIAL_ICONS.x; // treat legacy "twitter" data the same as "x"
  return SOCIAL_ICONS[key] ?? { label: platform, color: '#6B7280', path: GENERIC_LINK_ICON };
};

// The admin panel saves this as a repeater (array of { platform, url }), but
// some earlier records were seeded as a flat { [platform]: url } map — accept
// either so a member's socials don't just silently disappear.
const socialLinksFor = (raw: TeamMemberSocialLinks | null | undefined): Array<{ platform: string; url: string }> => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((entry) => entry?.platform && entry?.url);
  }
  return Object.entries(raw)
    .filter(([, url]) => !!url)
    .map(([platform, url]) => ({ platform, url }));
};

useSeoMeta({
  title: 'About FyndRx | Safest and Most Convenient Online Pharmacy in Ghana',
  description: 'Learn about FyndRx, Ghana\'s safest and most convenient online pharmacy. Order prescriptions, consult pharmacists, and get medicine delivered to your doorstep. Discover our mission to make healthcare accessible to all.',
  keywords: 'about FyndRx, online pharmacy Ghana, ePharmacy, healthcare platform, medicine delivery, pharmacist consultation, prescription upload',
  ogType: 'website',
});

const isVisible = ref(false);
const activeValue = ref<number | null>(null);
const team = ref<TeamMember[]>([]);
const appSettings = ref<AppSettings | null>(null);
const loading = ref(true);

// Roughly how many characters a 3-line clamp fits at this card width/font size —
// used to decide whether a bio needs a "Read more" toggle at all, so short bios
// that already fit don't get a pointless button.
const BIO_CLAMP_THRESHOLD = 130;
const expandedBios = ref<Set<number>>(new Set());
const bioNeedsToggle = (member: TeamMember) => member.bio.length > BIO_CLAMP_THRESHOLD;
const toggleBio = (id: number) => {
  if (expandedBios.value.has(id)) {
    expandedBios.value.delete(id);
  } else {
    expandedBios.value.add(id);
  }
};

onMounted(async () => {
  isVisible.value = true;
  
  try {
    const [teamData, settings] = await Promise.all([
      informationService.getTeamMembers(),
      informationService.getAppSettings()
    ]);
    team.value = teamData;
    appSettings.value = settings;
  } catch (error) {
    console.error('Failed to load about page data:', error);
  } finally {
    loading.value = false;
  }
});

const features = [
  {
    title: 'Medicine Search & Ordering',
    description: 'Search for medicines from a wide catalogue, compare prices across multiple pharmacies, and order with ease — all from your device.',
    icon: 'search',
    color: '#246BFD',
  },
  {
    title: 'Prescription Upload',
    description: 'Upload your prescriptions securely and let our partner pharmacies prepare your medication. No more queues or waiting.',
    icon: 'prescription',
    color: '#FE9615',
  },
  {
    title: 'Pharmacist Consultation',
    description: 'Connect with licensed pharmacists anytime you need professional advice. Get expert guidance from the comfort of your home.',
    icon: 'consultation',
    color: '#10B981',
  },
  {
    title: 'Pharmacy Finder',
    description: 'Locate pharmacies near you with real-time availability. Find the closest, most affordable option in seconds.',
    icon: 'location',
    color: '#8B5CF6',
  },
];

const values = [
  {
    title: 'Safety & Reliability',
    description: 'Every pharmacy and product on FyndRx is verified. We ensure that you receive only genuine, quality-assured medication.',
    icon: 'shield',
  },
  {
    title: 'Multiple Price Options',
    description: 'Compare prices across partner pharmacies to find the best deal. No hidden charges — complete transparency on every order.',
    icon: 'price',
  },
  {
    title: 'Flexible Payments',
    description: 'Pay the way that works for you. We support mobile money, credit/debit cards, and more payment options.',
    icon: 'payment',
  },
  {
    title: '24/7 Access',
    description: 'Access healthcare anytime, anywhere. FyndRx is available around the clock — because health does not wait.',
    icon: 'clock',
  },
  {
    title: 'Easy Prescriptions',
    description: 'Upload, manage, and refill your prescriptions digitally. Keep your medical history organized in one secure place.',
    icon: 'document',
  },
  {
    title: 'Expert Consultation',
    description: 'Book a telehealth consultation with licensed professionals. Get prescriptions, advice, and follow-up care remotely.',
    icon: 'doctor',
  },
];

const steps = [
  { step: '01', title: 'Search', description: 'Search for your medicine or browse categories', color: '#246BFD' },
  { step: '02', title: 'Upload', description: 'Upload your prescription if required', color: '#FE9615' },
  { step: '03', title: 'Compare', description: 'Compare prices across partner pharmacies', color: '#10B981' },
  { step: '04', title: 'Deliver', description: 'Get your medication delivered to your door', color: '#8B5CF6' },
];

const stats = [
  { label: 'Active Users', value: '10K+' },
  { label: 'Partner Pharmacies', value: '100+' },
  { label: 'Cities Covered', value: '20+' },
  { label: 'Customer Satisfaction', value: '98%' },
];
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">

    <!-- ===================== HERO SECTION ===================== -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-[#246BFD]/10 via-transparent to-[#FE9615]/10"></div>
      <!-- Decorative circles -->
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-[#246BFD]/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FE9615]/5 rounded-full blur-3xl"></div>

      <div class="relative px-4 py-24 mx-auto max-w-7xl sm:py-32 sm:px-6 lg:px-8">
        <div class="text-center" :class="{ 'animate-fade-in': isVisible }">
          <div class="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-[#246BFD] bg-[#246BFD]/10 rounded-full">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Convenient · Reliable · Safe
          </div>
          <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Your Healthcare, <br class="hidden sm:block" />
            <span class="relative">
              <span class="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#246BFD] to-[#5089FF]">Reimagined</span>
              <span class="absolute bottom-2 left-0 w-full h-3 bg-[#246BFD]/10 rounded-full -z-0"></span>
            </span>
          </h1>
          <p class="max-w-3xl mx-auto mt-6 text-lg text-gray-600 dark:text-gray-300 sm:text-xl leading-relaxed">
            FyndRx is the most convenient, reliable, and safe online healthcare platform. 
            Order medicines online with ease, consult a pharmacist at any time of need, and access 
            healthcare anytime, anywhere.
          </p>
        </div>
      </div>
    </section>

    <!-- ===================== WHAT WE DO SECTION ===================== -->
    <section class="py-20 bg-white dark:bg-gray-800">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="text-center mb-16" :class="{ 'animate-fade-in': isVisible }">
          <h2 class="text-base text-[#FE9615] font-semibold tracking-wide uppercase">What We Do</h2>
          <p class="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Everything You Need in One Platform
          </p>
          <p class="max-w-2xl mx-auto mt-4 text-lg text-gray-500 dark:text-gray-400">
            From searching for medicines to finding pharmacies near you — FyndRx puts healthcare at your fingertips.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(feature, index) in features"
            :key="feature.title"
            class="relative group p-8 bg-white dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 hover:-translate-y-1"
            :class="{ 'animate-fade-in': isVisible }"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            <!-- Icon -->
            <div
              class="flex items-center justify-center w-14 h-14 rounded-xl mb-6 transition-transform duration-300 group-hover:scale-110"
              :style="{ backgroundColor: feature.color + '15' }"
            >
              <!-- Search icon -->
              <svg v-if="feature.icon === 'search'" class="w-7 h-7" :style="{ color: feature.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <!-- Prescription icon -->
              <svg v-if="feature.icon === 'prescription'" class="w-7 h-7" :style="{ color: feature.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <!-- Consultation icon -->
              <svg v-if="feature.icon === 'consultation'" class="w-7 h-7" :style="{ color: feature.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <!-- Location icon -->
              <svg v-if="feature.icon === 'location'" class="w-7 h-7" :style="{ color: feature.color }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ feature.title }}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{{ feature.description }}</p>

            <!-- Bottom accent line -->
            <div
              class="absolute bottom-0 left-0 w-0 h-1 rounded-b-2xl transition-all duration-500 group-hover:w-full"
              :style="{ backgroundColor: feature.color }"
            ></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== MISSION SECTION ===================== -->
    <section class="py-20 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-[#246BFD]/5 to-[#FE9615]/5"></div>
      <div class="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
          <!-- Left: Mission text -->
          <div :class="{ 'animate-fade-in': isVisible }">
            <h2 class="text-base text-[#246BFD] dark:text-[#5089FF] font-semibold tracking-wide uppercase mb-2">
              Our Mission
            </h2>
            <p class="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl mb-6">
              Making Healthcare Accessible for Everyone
            </p>
            <div
              v-if="appSettings?.about.description"
              class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6 prose prose-lg dark:prose-invert max-w-none"
              v-html="sanitizeHtml(appSettings.about.description)"
            ></div>
            <p class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6" v-else>
              We believe that access to quality healthcare is a fundamental right, not a privilege. FyndRx was founded to
              bridge the gap between patients and pharmacies, making it easier to find, compare, and order the medicines
              you need — no matter where you are.
            </p>
          </div>

          <!-- Right: Mission visual -->
          <div class="relative" :class="{ 'animate-fade-in': isVisible }">
            <div class="grid grid-cols-2 gap-4">
              <!-- Vision -->
              <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div class="w-10 h-10 rounded-xl bg-[#246BFD]/10 flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Our Vision</h4>
                <div
                  class="text-sm text-gray-500 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none prose-p:my-0"
                  v-html="sanitizeHtml(appSettings?.about.vision || 'A world where quality healthcare is just a tap away for everyone.')"
                ></div>
              </div>
              <!-- Mission -->
              <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mt-8">
                <div class="w-10 h-10 rounded-xl bg-[#FE9615]/10 flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 text-[#FE9615]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Our Mission</h4>
                <div
                  class="text-sm text-gray-500 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none prose-p:my-0"
                  v-html="sanitizeHtml(appSettings?.about.mission || 'Using technology to simplify and transform how people access medicine.')"
                ></div>
              </div>
              <!-- Trust -->
              <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div class="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Trust</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">Partnering with verified pharmacies to ensure safety and quality.</p>
              </div>
              <!-- Impact -->
              <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mt-8">
                <div class="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center mb-3">
                  <svg class="w-5 h-5 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-900 dark:text-white mb-1">Impact</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">Reaching communities across Ghana with accessible healthcare solutions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== WHY CHOOSE US SECTION ===================== -->
    <section class="py-20 bg-white dark:bg-gray-800">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="text-center mb-16" :class="{ 'animate-fade-in': isVisible }">
          <h2 class="text-base text-[#246BFD] dark:text-[#5089FF] font-semibold tracking-wide uppercase">Why Choose FyndRx</h2>
          <p class="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Built Around What Matters to You
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(value, index) in values"
            :key="value.title"
            class="relative group flex items-start gap-4 p-6 rounded-2xl bg-gray-50 dark:bg-gray-700/30 hover:bg-white dark:hover:bg-gray-700/60 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300 cursor-default"
            :class="{ 'animate-fade-in': isVisible }"
            :style="{ animationDelay: `${index * 80}ms` }"
            @mouseenter="activeValue = index"
            @mouseleave="activeValue = null"
          >
            <!-- Icon -->
            <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#246BFD]/10 to-[#FE9615]/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <svg v-if="value.icon === 'shield'" class="w-6 h-6 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <svg v-if="value.icon === 'price'" class="w-6 h-6 text-[#FE9615]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <svg v-if="value.icon === 'payment'" class="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <svg v-if="value.icon === 'clock'" class="w-6 h-6 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-if="value.icon === 'document'" class="w-6 h-6 text-[#EC4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <svg v-if="value.icon === 'doctor'" class="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            <div>
              <h3 class="text-base font-bold text-gray-900 dark:text-white mb-1">{{ value.title }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ value.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== STATS SECTION ===================== -->
    <section class="py-16 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-[#246BFD] to-[#5089FF]"></div>
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJINHYtMmgzMnptMC0zMFYySDR2Mmgzem0wIDE1VjE3SDR2Mmgzem0wIDE1VjMySDR2Mmgzem0wLTE1VjE3SDR2Mmgzem0wIDE1VjMySDR2Mmgzem0wLTE1VjE3SDR2Mmgzem0wIDE1VjMySDR2Mmgzem0wLTE1VjE3SDR2MmgzMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      <div class="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 gap-8 md:grid-cols-4" :class="{ 'animate-fade-in': isVisible }">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="text-4xl font-extrabold text-white sm:text-5xl">
              {{ stat.value }}
            </div>
            <div class="mt-2 text-lg text-white/80">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== HOW IT WORKS SECTION ===================== -->
    <section class="py-20 bg-white dark:bg-gray-800">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="text-center mb-16" :class="{ 'animate-fade-in': isVisible }">
          <h2 class="text-base text-[#FE9615] font-semibold tracking-wide uppercase">How It Works</h2>
          <p class="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Your Health in 4 Simple Steps
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(item, index) in steps"
            :key="item.step"
            class="relative text-center group"
            :class="{ 'animate-fade-in': isVisible }"
            :style="{ animationDelay: `${index * 150}ms` }"
          >
            <!-- Step number -->
            <div
              class="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 text-2xl font-extrabold text-white transition-transform duration-300 group-hover:scale-110"
              :style="{ background: `linear-gradient(135deg, ${item.color}, ${item.color}CC)` }"
            >
              {{ item.step }}
              <!-- Pulse ring -->
              <div
                class="absolute inset-0 rounded-full animate-ping opacity-20"
                :style="{ backgroundColor: item.color }"
              ></div>
            </div>

            <!-- Connector line (hidden on last item and mobile) -->
            <div
              v-if="index < steps.length - 1"
              class="absolute top-10 left-[calc(50%+44px)] right-[-20%] h-0.5 bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600 hidden lg:block"
            ></div>

            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ item.title }}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== TEAM SECTION ===================== -->
    <section class="py-20 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"></div>
      <div class="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="mb-16 text-center" :class="{ 'animate-fade-in': isVisible }">
          <h2 class="text-base text-[#246BFD] dark:text-[#5089FF] font-semibold tracking-wide uppercase">Our Team</h2>
          <p class="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Meet the People Behind FyndRx
          </p>
          <p class="max-w-2xl mx-auto mt-4 text-lg text-gray-600 dark:text-gray-300">
            A passionate team committed to revolutionizing healthcare accessibility through technology.
          </p>
        </div>

        <div class="flex flex-wrap justify-center gap-y-12 gap-x-8 lg:gap-x-12 max-w-6xl mx-auto">
          <div
            v-for="member in team"
            :key="member.id"
            class="group flex flex-col items-center text-center w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-2rem)]"
            :class="{ 'animate-fade-in': isVisible }"
          >
            <div class="relative inline-block mb-6 shrink-0">
              <div class="absolute -inset-2 bg-gradient-to-r from-[#246BFD]/30 to-[#FE9615]/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img
                class="relative w-36 h-36 mx-auto rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-lg transition-transform duration-300 group-hover:scale-105"
                :src="member.image"
                :alt="member.name"
              />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white break-words">{{ member.name }}</h3>
            <p class="text-[#246BFD] dark:text-[#5089FF] font-medium mt-1 break-words">{{ member.role }}</p>
            <p
              class="text-sm text-gray-500 dark:text-gray-400 mt-3 px-4 break-words"
              :class="expandedBios.has(member.id) ? '' : 'line-clamp-3'"
            >
              {{ member.bio }}
            </p>
            <button
              v-if="bioNeedsToggle(member)"
              type="button"
              @click="toggleBio(member.id)"
              class="text-xs font-bold text-[#246BFD] dark:text-[#5089FF] hover:underline mt-1.5"
            >
              {{ expandedBios.has(member.id) ? 'Show less' : 'Read more' }}
            </button>

            <div
              v-if="socialLinksFor(member.social_links).length"
              class="flex items-center justify-center gap-2.5 mt-5"
            >
              <a
                v-for="link in socialLinksFor(member.social_links)"
                :key="link.platform"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                :title="socialIconFor(link.platform).label"
                class="w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ring-1 ring-gray-100 dark:ring-gray-700"
              >
                <svg
                  class="w-4 h-4 transition-colors"
                  :style="{ color: socialIconFor(link.platform).color }"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path :d="socialIconFor(link.platform).path" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div v-if="!loading && team.length === 0" class="text-center text-gray-500 py-12">
          No team members listed at the moment.
        </div>
      </div>
    </section>

    <!-- ===================== CTA SECTION ===================== -->
    <section class="py-20 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-[#246BFD] to-[#5089FF]"></div>
      <div class="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div class="relative px-4 mx-auto text-center max-w-3xl sm:px-6 lg:px-8" :class="{ 'animate-fade-in': isVisible }">
        <h2 class="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
          Ready to Access Healthcare<br />the Smarter Way?
        </h2>
        <p class="mt-6 text-lg text-white/80 leading-relaxed">
          Join thousands of users who trust FyndRx for their healthcare needs. 
          Get started today — it is free, fast, and secure.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          <router-link
            to="/register"
            class="px-10 py-4 rounded-full bg-white text-[#246BFD] font-bold hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 transform hover:-translate-y-1"
          >
            Get Started for Free
          </router-link>
          <router-link
            to="/contact"
            class="px-10 py-4 rounded-full bg-transparent text-white font-bold border-2 border-white/50 hover:bg-white/10 hover:border-white transition-all duration-300 transform hover:-translate-y-1"
          >
            Contact Us
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>