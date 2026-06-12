<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { informationService, type LegalDocument } from '@/services/informationService';
import { useSeoMeta } from '@/composables/useSeoMeta';

useSeoMeta({
  title: 'Privacy Policy | FyndRx',
  description: 'FyndRx Privacy Policy — how we collect, use, and protect your personal and health data in compliance with the Ghana Data Protection Act, 2012 (Act 843).',
  keywords: 'FyndRx privacy policy, data protection Ghana, health data privacy, GDPA Act 843',
  ogType: 'website',
});

const document = ref<LegalDocument | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    document.value = await informationService.getLegalDocument('privacy-policy');
  } catch (error) {
    console.error('Failed to load privacy policy:', error);
  } finally {
    loading.value = false;
  }
});

const fallback = `
<h2>1. Introduction</h2>
<p>FyndRx ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform — including our website, mobile application, and related services (collectively, the "Platform"). It applies to all users in Ghana and complies with the <strong>Data Protection Act, 2012 (Act 843)</strong> of the Republic of Ghana.</p>
<p>By using the FyndRx Platform, you consent to the practices described in this Policy. If you do not agree, please discontinue use of the Platform.</p>

<h2>2. Information We Collect</h2>
<h3>2.1 Personal Information</h3>
<ul>
  <li>Full name, date of birth, gender</li>
  <li>Email address and phone number</li>
  <li>Delivery address and location data</li>
  <li>National ID or Ghana Card number (where required for prescription verification)</li>
  <li>Payment information (processed securely via third-party payment gateways; we do not store card details)</li>
</ul>
<h3>2.2 Health & Medical Data</h3>
<ul>
  <li>Prescriptions uploaded to the Platform</li>
  <li>Medication order history</li>
  <li>Consultation notes and medical assessments submitted through our teleconsultation service</li>
  <li>Health conditions disclosed during consultations or registration</li>
</ul>
<p><strong>Special Category Data Notice:</strong> Health and medical data is classified as sensitive personal data under Act 843. We process it only with your explicit consent and apply enhanced security measures to its storage and handling.</p>
<h3>2.3 Usage & Technical Data</h3>
<ul>
  <li>Device type, operating system, and browser information</li>
  <li>IP address and general geographic location</li>
  <li>Pages visited, search queries, and interaction data</li>
  <li>Session duration and click-through data</li>
</ul>

<h2>3. How We Use Your Information</h2>
<ul>
  <li><strong>To fulfil your orders:</strong> Processing medication orders, verifying prescriptions, and coordinating delivery with partner pharmacies.</li>
  <li><strong>To provide teleconsultation services:</strong> Facilitating communication between you and licensed healthcare professionals.</li>
  <li><strong>To manage your account:</strong> Authentication, account security, and profile management.</li>
  <li><strong>To process payments:</strong> Securely handling transactions through regulated payment processors.</li>
  <li><strong>To improve our services:</strong> Analysing usage patterns to improve platform features and user experience.</li>
  <li><strong>To communicate with you:</strong> Sending order confirmations, delivery updates, health tips (newsletter), and support responses.</li>
  <li><strong>To comply with legal obligations:</strong> Meeting regulatory requirements under Ghanaian law including the Food and Drugs Authority (FDA) and Ghana Pharmacy Council requirements.</li>
</ul>

<h2>4. Sharing Your Information</h2>
<p>We do not sell your personal data. We share your information only in the following circumstances:</p>
<ul>
  <li><strong>Partner Pharmacies:</strong> Your name, delivery address, and prescription details are shared with the pharmacy fulfilling your order. All partner pharmacies are bound by confidentiality obligations.</li>
  <li><strong>Licensed Healthcare Professionals:</strong> If you use our teleconsultation service, relevant health information is shared with the consulted doctor or pharmacist.</li>
  <li><strong>Payment Processors:</strong> Transaction data is passed to regulated payment gateways for payment processing.</li>
  <li><strong>Delivery Partners:</strong> Your name and delivery address are shared with logistics providers to fulfil your order.</li>
  <li><strong>Legal & Regulatory Bodies:</strong> We may disclose information when required by Ghanaian law, court order, or regulatory authority (including the Ghana FDA and Data Protection Commission).</li>
  <li><strong>Analytics Providers:</strong> Anonymised, aggregated usage data may be shared with analytics partners.</li>
</ul>

<h2>5. Data Security</h2>
<p>We implement industry-standard security measures including:</p>
<ul>
  <li>TLS/SSL encryption for all data in transit</li>
  <li>AES-256 encryption for sensitive data at rest</li>
  <li>Role-based access controls limiting who can view health data</li>
  <li>Regular security audits and vulnerability assessments</li>
  <li>Secure, access-controlled server infrastructure</li>
</ul>
<p>Despite these measures, no system is completely impenetrable. In the event of a data breach affecting your rights and freedoms, we will notify you and the Data Protection Commission within 72 hours of becoming aware.</p>

<h2>6. Your Rights Under the Ghana Data Protection Act, 2012</h2>
<p>As a data subject, you have the right to:</p>
<ul>
  <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
  <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
  <li><strong>Erasure:</strong> Request deletion of your data where there is no legitimate reason for continued processing.</li>
  <li><strong>Objection:</strong> Object to processing of your data for direct marketing purposes.</li>
  <li><strong>Data Portability:</strong> Request your data in a structured, machine-readable format.</li>
  <li><strong>Withdraw Consent:</strong> Withdraw consent for non-essential data processing at any time.</li>
</ul>
<p>To exercise any of these rights, contact our Data Protection Officer at <strong>privacy@fyndrx.com</strong>. We will respond within 30 days.</p>

<h2>7. Data Retention</h2>
<p>We retain your personal data for as long as your account is active or as needed to provide services. Medical records and prescription data are retained for a minimum of 7 years in compliance with Ghanaian healthcare regulations. You may request deletion of non-medical data at any time by contacting us.</p>

<h2>8. Cookies</h2>
<p>We use cookies and similar technologies to enhance your experience. See our <a href="/cookies">Cookie Policy</a> for full details.</p>

<h2>9. Third-Party Links</h2>
<p>Our Platform may contain links to third-party websites (e.g., pharmacy websites, government health portals). We are not responsible for the privacy practices of those websites. We encourage you to review their privacy policies before providing any personal information.</p>

<h2>10. Children's Privacy</h2>
<p>Our Platform is not directed to children under 18. We do not knowingly collect personal information from minors. If you believe a child has provided us with their information, please contact us immediately.</p>

<h2>11. Changes to This Policy</h2>
<p>We may update this Privacy Policy periodically. We will notify you of material changes by email or via a prominent notice on the Platform at least 14 days before the change takes effect. Continued use of the Platform after the effective date constitutes acceptance of the updated Policy.</p>

<h2>12. Contact Our Data Protection Officer</h2>
<p>For privacy-related inquiries, data access requests, or complaints:</p>
<ul>
  <li><strong>Email:</strong> privacy@fyndrx.com</li>
  <li><strong>Phone:</strong> +233 53 051 0839</li>
  <li><strong>Address:</strong> FyndRx, Ghana</li>
</ul>
<p>You also have the right to lodge a complaint with the <strong>Data Protection Commission of Ghana</strong> if you believe your data has been mishandled.</p>
`;
</script>

<template>
  <div class="min-h-screen py-12 mt-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">

      <!-- Page Header -->
      <div class="mb-8 text-center">
        <span class="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-widest text-[#246BFD] bg-[#246BFD]/10 rounded-full">Legal</span>
        <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white">Privacy Policy</h1>
        <p class="mt-3 text-gray-500 dark:text-gray-400">Compliant with the Ghana Data Protection Act, 2012 (Act 843)</p>
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
        <router-link to="/terms" class="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD] transition-colors">Terms of Service</router-link>
        <router-link to="/cookies" class="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD] transition-colors">Cookie Policy</router-link>
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
