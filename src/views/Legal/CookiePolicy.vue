<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { informationService, type LegalDocument } from '@/services/informationService';
import { useSeoMeta } from '@/composables/useSeoMeta';

useSeoMeta({
  title: 'Cookie Policy | FyndRx',
  description: 'FyndRx Cookie Policy — how we use cookies and similar tracking technologies on our online pharmacy platform, and how you can manage your preferences.',
  keywords: 'FyndRx cookie policy, cookies online pharmacy Ghana, tracking technology, cookie consent',
  ogType: 'website',
});

const document = ref<LegalDocument | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    document.value = await informationService.getLegalDocument('cookie-policy');
  } catch (error) {
    console.error('Failed to load cookie policy:', error);
  } finally {
    loading.value = false;
  }
});

const fallback = `
<h2>1. What Are Cookies?</h2>
<p>Cookies are small text files placed on your device (computer, tablet, or mobile phone) when you visit a website. They allow the site to remember your actions and preferences over a period of time so you don't have to re-enter information each visit. Cookies can be "session cookies" (deleted when you close your browser) or "persistent cookies" (stored on your device for a set period).</p>
<p>Similar technologies such as web beacons, pixels, and local storage may also be used by the FyndRx Platform and are covered under this policy.</p>

<h2>2. How We Use Cookies</h2>
<p>FyndRx uses the following categories of cookies:</p>

<h3>Strictly Necessary Cookies</h3>
<p>These cookies are essential for the Platform to function and cannot be switched off. They are typically set in response to actions you take such as logging in, adding items to your cart, or submitting a prescription. Without these cookies, services you have asked for cannot be provided.</p>
<ul>
  <li>User authentication and session management</li>
  <li>Shopping cart and order state</li>
  <li>Security and fraud prevention tokens</li>
  <li>Load balancing and server routing</li>
</ul>

<h3>Performance & Analytics Cookies</h3>
<p>These cookies help us understand how visitors interact with our Platform by collecting and reporting anonymised information. This allows us to improve the user experience over time.</p>
<ul>
  <li><strong>Google Analytics:</strong> Tracks page views, user journeys, and usage patterns. Data is anonymised and aggregated.</li>
  <li>Error monitoring and crash reporting tools to identify and fix technical issues.</li>
</ul>

<h3>Functionality Cookies</h3>
<p>These cookies enable personalised features and remember choices you make (such as language preferences, dark/light mode, or your saved delivery addresses) to provide a more personalised experience.</p>

<h3>Marketing & Targeting Cookies</h3>
<p>With your consent, we may use marketing cookies to show you relevant health-related promotions and products. These may be set by our trusted advertising partners and allow us and them to build a profile of your interests based on your browsing.</p>
<ul>
  <li>Social media retargeting (Facebook Pixel, Google Ads)</li>
  <li>Promotional email tracking</li>
</ul>
<p>You can opt out of marketing cookies at any time without affecting the core functionality of the Platform.</p>

<h2>3. Third-Party Cookies</h2>
<p>Some cookies on our Platform are set by third-party services we use. These third parties have their own privacy and cookie policies:</p>
<ul>
  <li><strong>Google Analytics (Google LLC)</strong> — analytics and performance tracking</li>
  <li><strong>Payment Processors</strong> — secure payment processing</li>
  <li><strong>Google Maps</strong> — pharmacy finder and delivery address functionality</li>
  <li><strong>Firebase</strong> — push notifications and real-time features</li>
</ul>
<p>FyndRx does not control these third-party cookies. Please review the respective privacy policies of these providers for more information.</p>

<h2>4. Cookie Retention Periods</h2>
<ul>
  <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
  <li><strong>Authentication cookies:</strong> Up to 30 days</li>
  <li><strong>Analytics cookies:</strong> Up to 24 months</li>
  <li><strong>Preference cookies:</strong> Up to 12 months</li>
  <li><strong>Marketing cookies:</strong> Up to 90 days</li>
</ul>

<h2>5. Managing Your Cookie Preferences</h2>
<p>You can control and manage cookies in several ways:</p>
<h3>Through your browser</h3>
<p>Most browsers allow you to refuse or delete cookies through their settings. The method varies by browser — refer to your browser's help documentation:</p>
<ul>
  <li>Chrome: Settings → Privacy and Security → Cookies and other site data</li>
  <li>Firefox: Options → Privacy & Security → Cookies and Site Data</li>
  <li>Safari: Preferences → Privacy → Manage Website Data</li>
</ul>
<p>Please note that disabling certain cookies may affect the functionality of the Platform, including the ability to place orders or access your account.</p>
<h3>Opt-Out of Analytics</h3>
<p>You can opt out of Google Analytics tracking by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.</p>

<h2>6. Health Data & Sensitive Information</h2>
<p>FyndRx does not use cookies to track or store health-related data such as prescriptions, diagnoses, or medication history. All sensitive health information is handled through our secure application layer, not through cookies.</p>

<h2>7. Changes to This Policy</h2>
<p>We may update this Cookie Policy from time to time. Material changes will be communicated via a prominent notice on the Platform. Your continued use of the Platform following such notice constitutes your acceptance of the updated policy.</p>

<h2>8. Contact Us</h2>
<p>If you have questions about our use of cookies, please contact:</p>
<ul>
  <li><strong>Email:</strong> privacy@fyndrx.com</li>
  <li><strong>Phone:</strong> +233 53 051 0839</li>
</ul>
`;
</script>

<template>
  <div class="min-h-screen py-12 mt-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">

      <!-- Page Header -->
      <div class="mb-8 text-center">
        <span class="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-widest text-[#246BFD] bg-[#246BFD]/10 rounded-full">Legal</span>
        <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white">Cookie Policy</h1>
        <p class="mt-3 text-gray-500 dark:text-gray-400">How we use cookies and tracking technologies on the FyndRx Platform</p>
      </div>

      <div class="p-8 bg-white shadow-sm dark:bg-gray-800 rounded-2xl">
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD]"></div>
        </div>
        <div v-else-if="document" class="prose dark:prose-invert max-w-none">
          <div v-html="document.content"></div>
          <p v-if="document.updated_at" class="mt-8 text-sm text-gray-500">
            Last updated: {{ new Date(document.updated_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) }}
          </p>
        </div>
        <div v-else class="prose dark:prose-invert max-w-none">
          <div v-html="fallback"></div>
          <p class="mt-8 text-sm text-gray-500">Effective date: June 2025</p>
        </div>
      </div>

      <!-- Legal Nav -->
      <div class="mt-8 flex flex-wrap justify-center gap-3 text-sm">
        <router-link to="/privacy" class="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD] transition-colors">Privacy Policy</router-link>
        <router-link to="/terms" class="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD] transition-colors">Terms of Service</router-link>
        <router-link to="/accessibility" class="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD] transition-colors">Accessibility</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose :deep(h2) { font-size: 1.4rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; color: #111827; }
.prose :deep(h3) { font-size: 1.1rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #1f2937; }
.prose :deep(p) { margin-bottom: 1rem; line-height: 1.75; color: #4b5563; }
.prose :deep(ul) { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
.prose :deep(ol) { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
.prose :deep(li) { margin-bottom: 0.4rem; line-height: 1.7; color: #4b5563; }
.prose :deep(strong) { font-weight: 600; color: #111827; }
.prose :deep(a) { color: #246BFD; text-decoration: underline; }
.prose :deep(a:hover) { color: #5089FF; }
.dark .prose :deep(h2) { color: #f9fafb; }
.dark .prose :deep(h3) { color: #f3f4f6; }
.dark .prose :deep(p), .dark .prose :deep(li) { color: #d1d5db; }
.dark .prose :deep(strong) { color: #f9fafb; }
</style>
