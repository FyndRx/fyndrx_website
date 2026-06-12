<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { informationService, type LegalDocument } from '@/services/informationService';
import { useSeoMeta } from '@/composables/useSeoMeta';

useSeoMeta({
  title: 'Accessibility Statement | FyndRx',
  description: 'FyndRx Accessibility Statement — our commitment to making online healthcare accessible to all users, including those with disabilities. WCAG 2.1 conformance details.',
  keywords: 'FyndRx accessibility, WCAG 2.1, inclusive design, online pharmacy accessibility Ghana',
  ogType: 'website',
});

const document = ref<LegalDocument | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    document.value = await informationService.getLegalDocument('accessibility');
  } catch (error) {
    console.error('Failed to load accessibility statement:', error);
  } finally {
    loading.value = false;
  }
});

const fallback = `
<h2>Our Commitment</h2>
<p>FyndRx is committed to ensuring that our Platform is accessible to everyone — including people with visual, auditory, motor, and cognitive disabilities. We believe that access to healthcare information and services is a fundamental right, and we work continuously to remove barriers that may prevent any user from fully engaging with our Platform.</p>
<p>We aim to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> standards published by the World Wide Web Consortium (W3C).</p>

<h2>Conformance Status</h2>
<p>FyndRx is <strong>partially conformant</strong> with WCAG 2.1 Level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard. We are actively working to address all known gaps.</p>

<h2>Technical Specifications</h2>
<p>Our Platform is built with accessibility in mind and relies on the following technologies for conformance:</p>
<ul>
  <li>HTML5 semantic markup</li>
  <li>ARIA (Accessible Rich Internet Applications) labels and landmarks</li>
  <li>CSS3 for visual presentation without information loss when styles are disabled</li>
  <li>JavaScript for interactive components, with fallback behaviour for users with JavaScript disabled</li>
</ul>

<h2>Measures We Have Taken</h2>
<ul>
  <li><strong>Keyboard navigation:</strong> All interactive elements (buttons, links, forms) are accessible via keyboard without requiring a mouse.</li>
  <li><strong>Screen reader support:</strong> We use semantic HTML and ARIA attributes to support popular screen readers including NVDA, JAWS, and VoiceOver.</li>
  <li><strong>Colour contrast:</strong> Text and interactive elements meet or exceed the WCAG 2.1 AA minimum contrast ratio of 4.5:1 against their backgrounds.</li>
  <li><strong>Resizable text:</strong> All text can be resized up to 200% using browser zoom without loss of content or functionality.</li>
  <li><strong>Alternative text:</strong> All meaningful images include descriptive alt text. Decorative images are marked appropriately.</li>
  <li><strong>Form labels:</strong> All form inputs include visible labels and are associated with their controls programmatically.</li>
  <li><strong>Focus indicators:</strong> Visible focus styles are applied to all interactive elements for keyboard users.</li>
  <li><strong>Dark mode:</strong> The Platform supports a dark mode setting that reduces eye strain and improves readability for users with light sensitivity.</li>
  <li><strong>Error identification:</strong> Form validation errors are communicated both visually and through accessible text so screen reader users are informed of issues.</li>
</ul>

<h2>Known Limitations</h2>
<p>Despite our best efforts, some areas of the Platform may have accessibility limitations. Known issues include:</p>
<ul>
  <li>Some third-party components (such as the embedded map on the Contact page) may not fully meet WCAG 2.1 Level AA standards. We are working with our vendors to address this.</li>
  <li>Certain complex interactive elements (such as the prescription upload interface) are being reviewed for improved keyboard and screen reader support.</li>
  <li>Some PDF documents may not be fully accessible. We are transitioning to fully accessible HTML alternatives.</li>
</ul>
<p>We are committed to fixing these issues as part of our ongoing accessibility improvement roadmap.</p>

<h2>Accessibility Features by Page</h2>
<ul>
  <li><strong>Homepage:</strong> Landmark regions, skip navigation link, keyboard-operable search and CTAs</li>
  <li><strong>Medications:</strong> Filter controls with labelled form fields, accessible product cards</li>
  <li><strong>Prescriptions:</strong> File upload with accessible drag-and-drop and keyboard fallback</li>
  <li><strong>Consultation:</strong> Clearly structured form with step-by-step guidance</li>
  <li><strong>FAQs & Help:</strong> Accordion pattern with proper ARIA roles (expanded/collapsed state announced)</li>
</ul>

<h2>Assistive Technology Compatibility</h2>
<p>The Platform has been tested with the following assistive technologies:</p>
<ul>
  <li>NVDA + Chrome (Windows)</li>
  <li>VoiceOver + Safari (macOS and iOS)</li>
  <li>TalkBack + Chrome (Android)</li>
  <li>Keyboard-only navigation (all major browsers)</li>
</ul>

<h2>Feedback & Contact</h2>
<p>We welcome feedback on the accessibility of the FyndRx Platform. If you encounter any accessibility barriers, or if you need information in an alternative format, please contact us:</p>
<ul>
  <li><strong>Email:</strong> accessibility@fyndrx.com</li>
  <li><strong>Phone:</strong> +233 53 051 0839</li>
</ul>
<p>We aim to respond to accessibility-related feedback within <strong>5 business days</strong>.</p>

<h2>Formal Complaints</h2>
<p>If you are not satisfied with our response to your accessibility feedback, you may contact the <strong>National Commission on Civic Education (NCCE)</strong> or relevant disability rights bodies in Ghana for further assistance.</p>

<h2>Review & Updates</h2>
<p>This accessibility statement was last reviewed in <strong>June 2025</strong>. We review and update it at least annually, and immediately following any major platform release.</p>
`;
</script>

<template>
  <div class="min-h-screen py-12 mt-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">

      <!-- Page Header -->
      <div class="mb-8 text-center">
        <span class="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-widest text-[#246BFD] bg-[#246BFD]/10 rounded-full">Legal</span>
        <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white">Accessibility Statement</h1>
        <p class="mt-3 text-gray-500 dark:text-gray-400">Our commitment to an inclusive and accessible healthcare platform</p>
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
          <p class="mt-8 text-sm text-gray-500">Last reviewed: June 2025</p>
        </div>
      </div>

      <!-- Legal Nav -->
      <div class="mt-8 flex flex-wrap justify-center gap-3 text-sm">
        <router-link to="/privacy" class="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD] transition-colors">Privacy Policy</router-link>
        <router-link to="/terms" class="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD] transition-colors">Terms of Service</router-link>
        <router-link to="/cookies" class="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD] transition-colors">Cookie Policy</router-link>
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
