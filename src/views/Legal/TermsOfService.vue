<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { informationService, type LegalDocument } from '@/services/informationService';
import { useSeoMeta } from '@/composables/useSeoMeta';

useSeoMeta({
  title: 'Terms of Service | FyndRx',
  description: 'FyndRx Terms of Service — the rules governing use of Ghana\'s most convenient online pharmacy platform. Read before using our medication ordering, prescription upload, and teleconsultation services.',
  keywords: 'FyndRx terms of service, online pharmacy terms, terms and conditions Ghana, ePharmacy legal',
  ogType: 'website',
});

const document = ref<LegalDocument | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    document.value = await informationService.getLegalDocument('terms-of-service');
  } catch (error) {
    console.error('Failed to load terms of service:', error);
  } finally {
    loading.value = false;
  }
});

const fallback = `
<h2>1. Acceptance of Terms</h2>
<p>By accessing or using the FyndRx platform — including our website, mobile application, and all associated services (the "Platform") — you agree to be bound by these Terms of Service ("Terms") and our <a href="/privacy">Privacy Policy</a>. If you do not agree to these Terms, you must not use the Platform.</p>
<p>These Terms constitute a legally binding agreement between you and FyndRx, governed by the laws of the <strong>Republic of Ghana</strong>, including the Electronic Transactions Act, 2008 (Act 772).</p>

<h2>2. Eligibility</h2>
<p>You must be at least <strong>18 years of age</strong> to create an account and use the Platform. By registering, you represent and warrant that you meet this requirement. Individuals ordering medications for a minor must do so under parental or guardian authority and accept full responsibility for the transaction.</p>

<h2>3. Services Offered</h2>
<p>FyndRx provides the following services through its Platform:</p>
<ul>
  <li><strong>Medication Search & Ordering:</strong> Search for medications, compare prices across partner pharmacies, and place orders for home delivery or pharmacy pickup.</li>
  <li><strong>Prescription Upload:</strong> Securely upload prescriptions for verification and fulfilment by licensed partner pharmacies.</li>
  <li><strong>Teleconsultation:</strong> Connect with licensed healthcare professionals for medical assessments, diagnosis, and digital prescriptions.</li>
  <li><strong>Pharmacy Finder:</strong> Locate verified partner pharmacies near your location.</li>
  <li><strong>Order Tracking:</strong> Real-time updates on the status of your medication orders.</li>
</ul>
<p>FyndRx acts as a marketplace and facilitator. The actual sale of medications is conducted by our partner pharmacies, which are independently licensed by the <strong>Ghana Pharmacy Council</strong> and the <strong>Food and Drugs Authority (FDA) of Ghana</strong>.</p>

<h2>4. Prescription & Medication Policy</h2>
<ul>
  <li>Prescription-only medications (POM) require a valid prescription from a licensed medical practitioner before they can be dispensed.</li>
  <li>You must not upload fraudulent, altered, or expired prescriptions. Doing so is a criminal offence under the <strong>Public Health Act, 2012 (Act 851)</strong> and may result in immediate account termination and referral to law enforcement.</li>
  <li>FyndRx reserves the right to reject any prescription that cannot be verified as legitimate.</li>
  <li>Over-the-counter (OTC) medications may be ordered without a prescription, subject to availability and pharmacy-specific requirements.</li>
  <li>It is your responsibility to disclose any known allergies, contraindications, or concurrent medications to the dispensing pharmacist or consulting doctor.</li>
</ul>

<h2>5. Account Responsibilities</h2>
<ul>
  <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
  <li>You must notify us immediately of any unauthorised access to your account at <strong>support@fyndrx.com</strong>.</li>
  <li>You are responsible for all activity that occurs under your account.</li>
  <li>You must provide accurate and current information during registration and keep it updated.</li>
  <li>One person may not maintain more than one account. Duplicate accounts may be merged or terminated.</li>
</ul>

<h2>6. Prohibited Conduct</h2>
<p>You agree not to:</p>
<ul>
  <li>Submit false, fraudulent, or misleading information</li>
  <li>Attempt to obtain prescription medications without a valid prescription</li>
  <li>Reverse-engineer, scrape, or systematically extract data from the Platform</li>
  <li>Use the Platform to facilitate illegal drug trade or misuse of controlled substances</li>
  <li>Harass, threaten, or abuse other users, pharmacists, or FyndRx staff</li>
  <li>Attempt to circumvent any security, fraud prevention, or access-control measures</li>
</ul>

<h2>7. Payment Terms</h2>
<ul>
  <li>Payments are processed securely through regulated third-party gateways. FyndRx does not store card or mobile money credentials.</li>
  <li>Prices displayed are set by partner pharmacies and may vary between pharmacies. FyndRx is not responsible for pricing errors.</li>
  <li>Payment is due at the time of order placement. Orders are not confirmed until payment is received.</li>
  <li>All prices are in Ghanaian Cedis (GHS) unless otherwise stated.</li>
</ul>

<h2>8. Delivery Policy</h2>
<ul>
  <li>Delivery timelines are estimates only and may be affected by factors outside our control (e.g., traffic, weather, pharmacy preparation time).</li>
  <li>Deliveries are made to the address provided at checkout. FyndRx is not liable for failed deliveries due to incorrect or inaccessible addresses.</li>
  <li>You or an authorised representative must be available to receive orders. Prescription medications may require identity verification on delivery.</li>
  <li>Risk of loss and title of products passes to you upon delivery.</li>
</ul>

<h2>9. Returns & Refunds</h2>
<ul>
  <li>Due to the nature of pharmaceutical products, <strong>medications cannot be returned</strong> once dispensed, unless the product is defective, damaged, or incorrectly supplied.</li>
  <li>Refund requests for incorrect or damaged orders must be submitted within <strong>48 hours of receipt</strong> via our support channel.</li>
  <li>Refunds are processed within 5–10 business days to the original payment method.</li>
  <li>Teleconsultation fees are non-refundable once a consultation has commenced.</li>
</ul>

<h2>10. Intellectual Property</h2>
<p>All content on the Platform — including logos, design, text, software, and databases — is the property of FyndRx or its licensors and is protected under Ghanaian and international intellectual property law. You may not reproduce, distribute, or create derivative works from any Platform content without our prior written consent.</p>

<h2>11. Disclaimer of Warranties</h2>
<p>The Platform is provided on an "as is" and "as available" basis. While we strive for accuracy, FyndRx does not warrant that medication information, prices, or pharmacy availability displayed on the Platform is always accurate, complete, or up to date. Medical information provided through our Platform does not constitute a substitute for professional medical advice, diagnosis, or treatment.</p>

<h2>12. Limitation of Liability</h2>
<p>To the fullest extent permitted by Ghanaian law, FyndRx shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability for any claim shall not exceed the amount you paid for the specific order or service giving rise to the claim.</p>

<h2>13. Indemnification</h2>
<p>You agree to indemnify and hold harmless FyndRx, its directors, employees, and partners from any claims, damages, or expenses arising from your breach of these Terms or your misuse of the Platform.</p>

<h2>14. Modifications to Terms</h2>
<p>We may update these Terms at any time. Material changes will be communicated via email or in-app notification at least <strong>14 days</strong> before the effective date. Continued use of the Platform after that date constitutes acceptance of the updated Terms.</p>

<h2>15. Termination</h2>
<p>FyndRx reserves the right to suspend or terminate your account at any time for breach of these Terms, fraudulent activity, or conduct that may harm other users or our partners. You may terminate your account at any time by contacting support.</p>

<h2>16. Governing Law & Dispute Resolution</h2>
<p>These Terms are governed by the laws of the <strong>Republic of Ghana</strong>. Any disputes shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to arbitration in Accra under the rules of the Arbitration Centre of the Ghana Bar Association, before recourse to the courts.</p>

<h2>17. Contact</h2>
<p>For questions about these Terms:</p>
<ul>
  <li><strong>Email:</strong> legal@fyndrx.com</li>
  <li><strong>Phone:</strong> +233 53 051 0839</li>
  <li><strong>Address:</strong> FyndRx, Ghana</li>
</ul>
`;
</script>

<template>
  <div class="min-h-screen py-12 mt-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">

      <!-- Page Header -->
      <div class="mb-8 text-center">
        <span class="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-widest text-[#246BFD] bg-[#246BFD]/10 rounded-full">Legal</span>
        <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white">Terms of Service</h1>
        <p class="mt-3 text-gray-500 dark:text-gray-400">Governed by the laws of the Republic of Ghana</p>
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
