<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { informationService, type AppSettings, type Partner } from '@/services/informationService';
import { stripHtml } from '@/utils/sanitize';
import logoWhiteOrange from '@/assets/logo/logo_white_orange.png';
import appStoreBanner from '@/assets/appstore_banner.svg';
import playStoreBanner from '@/assets/playstore_banner.svg';

const currentYear = ref(new Date().getFullYear());

// A partner logo that fails to load falls back to the partner's name as text.
const brokenLogos = ref<Set<string | number>>(new Set());
const onLogoError = (id: string | number) => {
  brokenLogos.value = new Set(brokenLogos.value).add(id);
};

const appSettings = ref<AppSettings | null>(null);
const partners = ref<Partner[]>([]);

// The about description can be rich text (HTML) — strip it to plain text so a
// "Read more" toggle can safely clamp/expand it without leaking markup.
const aboutText = computed(
  () => stripHtml(appSettings.value?.about.description) || 'Your trusted partner in accessible and affordable healthcare.'
);
const ABOUT_CLAMP_THRESHOLD = 120;
const aboutNeedsToggle = computed(() => aboutText.value.length > ABOUT_CLAMP_THRESHOLD);
const aboutExpanded = ref(false);

onMounted(async () => {
  try {
    const [settings, partnersData] = await Promise.all([
      informationService.getAppSettings(),
      informationService.getPartners()
    ]);
    appSettings.value = settings;
    partners.value = partnersData;
  } catch (error) {
    console.error('Failed to load footer data:', error);
  }
});

const backToTop = () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
};

// Link groups: one data source, one template block.
const linkGroups = computed(() => [
  { title: 'Quick Links', links: quickLinks },
  { title: 'Support', links: supportLinks },
  { title: 'Information', links: informationLinks.filter((link) => !link.devOnly || !isProduction) },
]);

const contactItems = computed(() => {
  const contact = appSettings.value?.contact;
  if (!contact) return [];
  return [
    contact.address && {
      key: 'address',
      text: contact.address,
      href: null as string | null,
      icon: ['M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', 'M15 11a3 3 0 11-6 0 3 3 0 016 0z'],
    },
    contact.email && {
      key: 'email',
      text: contact.email,
      href: `mailto:${contact.email}`,
      icon: ['M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'],
    },
    contact.phone && {
      key: 'phone',
      text: contact.phone,
      href: `tel:${contact.phone}`,
      icon: ['M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'],
    },
    contact.hours && {
      key: 'hours',
      text: contact.hours,
      href: null,
      icon: ['M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'],
    },
  ].filter(Boolean) as { key: string; text: string; href: string | null; icon: string[] }[];
});

const socialLinks = computed(() =>
  defaultSocialLinks
    .map((social) => ({
      ...social,
      href: appSettings.value?.socials[social.key as keyof AppSettings['socials']] as string | undefined,
    }))
    .filter((social) => !!social.href),
);

const defaultSocialLinks = [
  {
    name: 'Facebook',
    icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    key: 'facebook'
  },
  {
    name: 'X',
    icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    key: 'twitter'
  },
  {
    name: 'Instagram',
    icon: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z',
    key: 'instagram'
  },
  {
    name: 'YouTube',
    icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    key: 'youtube'
  },
  {
    name: 'TikTok',
    icon: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
    key: 'tiktok'
  },
  {
    name: 'LinkedIn',
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    key: 'linkedin'
  }
];

interface FooterLink {
  name: string;
  path: string;
  highlight?: boolean;
  devOnly?: boolean;
}

const quickLinks: FooterLink[] = [
  { name: 'Home', path: '/' },
  { name: 'Blog', path: '/blog' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
  { name: 'Partner With Us', path: '/pharmacy/onboard', highlight: true },
];

const supportLinks: FooterLink[] = [
  { name: 'How to Use FyndRx', path: '/how-to-use' },
  { name: 'Help Center', path: '/help' },
  { name: 'FAQs', path: '/faq' },
  { name: 'Report a Problem', path: '/report' },
  { name: 'Feedback', path: '/feedback' }
];

const isProduction = import.meta.env.PROD;

const informationLinks: FooterLink[] = [
  { name: 'Terms of Service', path: '/terms' },
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'Email Gallery', path: '/email-gallery', devOnly: true },
  { name: 'Cookie Policy', path: '/cookies' },
  { name: 'Accessibility', path: '/accessibility' },
  { name: 'Sitemap', path: '/sitemap' }
];
</script>

<script lang="ts">
export default {
  name: 'Footer'
};
</script>

<template>
  <footer class="print:hidden px-4 pt-10 pb-6 sm:px-6">
    <div
      class="relative overflow-hidden mx-auto lg:max-w-7xl rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-gray-900 via-brand-950 to-gray-900 text-white ring-1 ring-white/10 shadow-float"
    >
      <!-- Ambient light: the same blue and orange as the page, kept very low -->
      <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div class="absolute -top-40 -left-24 w-[30rem] h-[30rem] rounded-full bg-brand-500/20 blur-3xl"></div>
        <div class="absolute -bottom-48 -right-24 w-[30rem] h-[30rem] rounded-full bg-accent-500/10 blur-3xl"></div>
        <!-- Thin brand-colour highlight along the top edge -->
        <div class="absolute top-0 h-px inset-x-12 bg-gradient-to-r from-transparent via-accent-500/70 to-transparent"></div>
      </div>

      <div class="relative px-6 pt-12 pb-8 sm:px-10 sm:pt-14 lg:px-14">
        <div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <!-- Brand -->
          <div class="space-y-6 lg:col-span-5">
            <router-link to="/" class="inline-flex items-center group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 rounded-xl" aria-label="FyndRx home">
              <img
                :src="logoWhiteOrange"
                alt="FyndRx"
                class="w-auto h-14 sm:h-16 transition-transform duration-300 ease-out-quart group-hover:rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
              />
            </router-link>

            <div>
              <p class="max-w-md leading-relaxed text-gray-300" :class="aboutExpanded ? '' : 'line-clamp-3'">
                {{ aboutText }}
              </p>
              <button
                v-if="aboutNeedsToggle"
                type="button"
                class="mt-2 text-sm font-bold rounded text-accent-400 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-500/30"
                :aria-expanded="aboutExpanded"
                @click="aboutExpanded = !aboutExpanded"
              >
                {{ aboutExpanded ? 'Show less' : 'Read more' }}
              </button>
            </div>

            <ul v-if="socialLinks.length" class="flex flex-wrap gap-3">
              <li v-for="social in socialLinks" :key="social.name">
                <a
                  :href="social.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="`FyndRx on ${social.name}`"
                  class="flex items-center justify-center text-gray-300 transition duration-200 rounded-full w-11 h-11 bg-white/10 ring-1 ring-white/10 ease-out-quart hover:-translate-y-0.5 hover:bg-accent-500 hover:text-white active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                >
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path :d="social.icon" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          <!-- Link columns -->
          <div class="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <nav v-for="group in linkGroups" :key="group.title" :aria-label="group.title">
              <h3 class="mb-5 text-sm font-semibold tracking-wider text-white uppercase">{{ group.title }}</h3>
              <ul class="space-y-3">
                <li v-for="link in group.links" :key="link.name">
                  <router-link :to="link.path" custom v-slot="{ href, navigate, isActive }">
                    <a
                      :href="href"
                      class="group inline-flex items-center gap-1.5 rounded transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
                      :class="isActive
                        ? 'text-brand-300 font-semibold'
                        : link.highlight
                          ? 'text-accent-400 font-semibold hover:text-accent-300'
                          : 'text-gray-300 hover:text-white'"
                      :aria-current="isActive ? 'page' : undefined"
                      @click="navigate"
                    >
                      {{ link.name }}
                      <svg
                        v-if="link.highlight"
                        class="w-3.5 h-3.5 transition-transform duration-200 ease-out-quart group-hover:translate-x-0.5"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </router-link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <!-- Contact + app badges -->
        <div
          v-if="contactItems.length || appSettings?.links.app_store || appSettings?.links.play_store"
          class="flex flex-col gap-8 pt-8 mt-12 border-t lg:flex-row lg:items-center lg:justify-between border-white/10"
        >
          <ul v-if="contactItems.length" class="grid grid-cols-1 gap-x-8 gap-y-3 text-gray-300 sm:grid-cols-2 lg:flex lg:flex-wrap">
            <li v-for="item in contactItems" :key="item.key" class="flex items-start gap-2.5">
              <svg class="w-5 h-5 mt-0.5 text-accent-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path v-for="d in item.icon" :key="d" stroke-linecap="round" stroke-linejoin="round" :d="d" />
              </svg>
              <a v-if="item.href" :href="item.href" class="transition-colors rounded hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30">{{ item.text }}</a>
              <span v-else>{{ item.text }}</span>
            </li>
          </ul>

          <div class="flex flex-wrap items-center gap-3 shrink-0">
            <a
              v-if="appSettings?.links.app_store"
              :href="appSettings.links.app_store"
              target="_blank"
              rel="noopener noreferrer"
              class="transition duration-200 rounded-lg ease-out-quart hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              <img :src="appStoreBanner" alt="Download on the App Store" class="w-auto h-11" />
            </a>
            <a
              v-if="appSettings?.links.play_store"
              :href="appSettings.links.play_store"
              target="_blank"
              rel="noopener noreferrer"
              class="transition duration-200 rounded-lg ease-out-quart hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              <img :src="playStoreBanner" alt="Get it on Google Play" class="w-auto h-11" />
            </a>
          </div>
        </div>

        <!-- Partners: on light chips so any logo, dark or light, stays legible -->
        <div v-if="partners.length > 0" class="pt-8 mt-8 border-t border-white/10">
          <h3 class="mb-6 text-xs font-bold tracking-[0.2em] text-center text-gray-400 uppercase">Trusted Partners</h3>
          <ul class="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <li v-for="partner in partners" :key="partner.id">
              <a
                :href="partner.website"
                target="_blank"
                rel="noopener noreferrer"
                :title="partner.name"
                class="flex items-center justify-center h-14 px-5 transition duration-200 bg-white rounded-2xl opacity-90 ease-out-quart hover:-translate-y-0.5 hover:opacity-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              >
                <span v-if="brokenLogos.has(partner.id)" class="text-sm font-medium text-gray-700">{{ partner.name }}</span>
                <img
                  v-else
                  :src="partner.logo"
                  :alt="partner.name"
                  class="object-contain w-auto max-w-full max-h-8 md:max-h-9"
                  @error="onLogoError(partner.id)"
                />
              </a>
            </li>
          </ul>
        </div>

        <!-- Copyright (back-to-top sits on the left so it never collides with the floating chat button) -->
        <div class="flex items-center gap-4 pt-6 mt-8 border-t border-white/10">
          <button
            type="button"
            aria-label="Back to top"
            class="flex items-center justify-center text-gray-300 transition duration-200 rounded-full w-11 h-11 shrink-0 bg-white/10 ring-1 ring-white/10 ease-out-quart hover:-translate-y-0.5 hover:bg-white/20 hover:text-white active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            @click="backToTop"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <p class="text-sm text-gray-400">&copy; {{ currentYear }} FyndRX. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
