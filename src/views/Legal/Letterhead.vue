<script setup lang="ts">
import { ref } from 'vue';
import logoIconPlainBg from '@/assets/logo/logo_icon_plain_bg.png';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, ImageRun } from 'docx';

const letterheadInfo = ref({
  companyName: 'FyndRx',
  tagline: 'Your Trusted Healthcare Partner',
  address: {
    street: 'Mayflower Building, Community 10',
    city: 'Tema',
    country: 'Greater Accra',
    postalCode: 'GA-123-4567'
  },
  contact: {
    phone: '+233 24 399 6999',
    email: 'info@fyndrx.com',
    website: 'www.fyndrx.com'
  },
  social: {
    facebook: 'fyndrx',
    twitter: 'fyndrx_',
    instagram: 'fyndrx_',
    linkedin: 'fyndrx'
  }
});

const letterheadRef = ref<HTMLElement | null>(null);
const isDownloading = ref(false);

const downloadPDF = async () => {
  if (!letterheadRef.value) return;
  
  isDownloading.value = true;
  try {
    const canvas = await html2canvas(letterheadRef.value, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('fyndrx-letterhead.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    isDownloading.value = false;
  }
};

const downloadWord = async () => {
  if (!letterheadRef.value) return;
  
  isDownloading.value = true;
  try {
    const canvas = await html2canvas(letterheadRef.value, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Create a new document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                data: canvas.toDataURL('image/png').split(',')[1],
                transformation: {
                  width: 500,
                  height: 700
                },
                type: 'png'
              })
            ]
          })
        ]
      }]
    });

    // Generate and save the document
    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([new Uint8Array(buffer)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(blob, 'fyndrx-letterhead.docx');
  } catch (error) {
    console.error('Error generating Word document:', error);
  } finally {
    isDownloading.value = false;
  }
};

const downloadPNG = async () => {
  if (!letterheadRef.value) return;
  
  isDownloading.value = true;
  try {
    const canvas = await html2canvas(letterheadRef.value, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, 'fyndrx-letterhead.png');
      }
    });
  } catch (error) {
    console.error('Error generating PNG:', error);
  } finally {
    isDownloading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen py-12 mt-12 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-[210mm] px-4 mx-auto sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Official Letterhead</h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          Download our official letterhead for business correspondence
        </p>
      </div>

      <!-- Letterhead Preview -->
      <div ref="letterheadRef" class="w-[210mm] h-[297mm] bg-white p-8 shadow-lg relative overflow-hidden">
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-5">
          <div class="absolute inset-0 bg-gradient-to-br from-[#246BFD] to-[#FE9615]"></div>
          <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
        </div>

        <!-- Top Border with Logo -->
        <div class="relative">
          <div class="h-3 bg-gradient-to-r from-[#246BFD] via-[#FE9615] to-[#246BFD] mb-8 rounded-full"></div>
          <div class="absolute right-0 -top-4">
            <div class="p-2 bg-white rounded-lg shadow-lg">
              <img :src="logoIconPlainBg" alt="FyndRx Logo" class="w-16 h-16" />
            </div>
          </div>
        </div>

        <!-- Header Section -->
        <div class="relative flex items-start justify-between mb-12">
          <!-- Company Info -->
          <div class="flex-1">
            <div class="mb-6">
              <h2 class="text-4xl font-bold bg-gradient-to-r from-[#246BFD] to-[#FE9615] bg-clip-text text-transparent">
                {{ letterheadInfo.companyName }}
              </h2>
              <p class="mt-1 text-xl text-gray-600">{{ letterheadInfo.tagline }}</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="flex items-center text-gray-600">
                <svg class="w-5 h-5 mr-2 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                {{ letterheadInfo.contact.phone }}
              </div>
              <div class="flex items-center text-gray-600">
                <svg class="w-5 h-5 mr-2 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {{ letterheadInfo.contact.email }}
              </div>
            </div>
          </div>
          <!-- Date and Reference -->
          <div class="space-y-4 text-right">
            <div class="inline-block px-4 py-2 rounded-lg shadow-sm bg-gray-50">
              <p class="text-sm font-medium text-gray-900">Date</p>
              <p class="text-sm text-gray-600">{{ new Date().toLocaleDateString() }}</p>
            </div>
            <div class="inline-block px-4 py-2 rounded-lg shadow-sm bg-gray-50">
              <p class="text-sm font-medium text-gray-900">Reference</p>
              <p class="text-sm text-gray-600">FRX-{{ new Date().getFullYear() }}-{{ Math.floor(Math.random() * 10000).toString().padStart(4, '0') }}</p>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="relative flex-1 min-h-[400px] border-t border-b border-gray-200 py-8">
          <!-- This area is left blank for the actual letter content -->
          <div class="flex items-center justify-center h-full text-gray-400">
            <p>Letter content goes here</p>
          </div>
        </div>

        <!-- Footer Section -->
        <div class="relative mt-8">
          <!-- Contact Information -->
          <div class="grid grid-cols-3 gap-8 mb-8">
            <div class="p-6 shadow-sm bg-gray-50 rounded-xl">
              <h3 class="flex items-center mb-3 text-sm font-semibold text-gray-900">
                <svg class="w-4 h-4 mr-2 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Address
              </h3>
              <p class="text-sm text-gray-600">
                {{ letterheadInfo.address.street }}<br>
                {{ letterheadInfo.address.city }}, {{ letterheadInfo.address.country }}<br>
                {{ letterheadInfo.address.postalCode }}
              </p>
            </div>
            <div class="p-6 shadow-sm bg-gray-50 rounded-xl">
              <h3 class="flex items-center mb-3 text-sm font-semibold text-gray-900">
                <svg class="w-4 h-4 mr-2 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Contact
              </h3>
              <p class="text-sm text-gray-600">
                Phone: {{ letterheadInfo.contact.phone }}<br>
                Email: {{ letterheadInfo.contact.email }}<br>
                Website: {{ letterheadInfo.contact.website }}
              </p>
            </div>
            <div class="p-6 shadow-sm bg-gray-50 rounded-xl">
              <h3 class="flex items-center mb-3 text-sm font-semibold text-gray-900">
                <svg class="w-4 h-4 mr-2 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Business Hours
              </h3>
              <p class="text-sm text-gray-600">
                Monday - Friday: 8:00 AM - 6:00 PM<br>
                Saturday: 9:00 AM - 2:00 PM<br>
                Sunday: Closed
              </p>
            </div>
          </div>

          <!-- Social Media and QR Code -->
          <div class="flex items-center justify-between mb-8">
            <div class="flex space-x-6">
              <a href="#" class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-[#246BFD] hover:text-white transition-all duration-300">
                <span class="sr-only">Facebook</span>
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#" class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-[#246BFD] hover:text-white transition-all duration-300">
                <span class="sr-only">Twitter</span>
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-[#246BFD] hover:text-white transition-all duration-300">
                <span class="sr-only">Instagram</span>
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
              <a href="#" class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-[#246BFD] hover:text-white transition-all duration-300">
                <span class="sr-only">LinkedIn</span>
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
            <div class="p-4 rounded-lg shadow-sm bg-gray-50">
              <div class="text-center">
                <p class="mb-1 text-sm font-medium text-gray-900">Scan to Visit</p>
                <div class="w-24 h-24 p-2 bg-white rounded">
                  <!-- Placeholder for QR Code -->
                  <div class="flex items-center justify-center w-full h-full bg-gray-200 rounded">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v4m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
                    </svg>
                  </div>
                </div>
                <p class="mt-1 text-xs text-gray-600">{{ letterheadInfo.contact.website }}</p>
              </div>
            </div>
          </div>

          <!-- Bottom Border -->
          <div class="h-3 bg-gradient-to-r from-[#246BFD] via-[#FE9615] to-[#246BFD] rounded-full"></div>
        </div>

        <!-- Download Options -->
        <div class="mt-8 space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Download Formats</h3>
          <div class="flex flex-wrap gap-4">
            <button 
              @click="downloadPDF"
              :disabled="isDownloading"
              class="px-6 py-3 text-sm font-medium text-white bg-[#246BFD] rounded-full hover:bg-[#5089FF] hover:shadow-lg hover:shadow-[#246BFD]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
              <span v-if="isDownloading">Downloading...</span>
              <span v-else>Download PDF</span>
            </button>
            <button 
              @click="downloadWord"
              :disabled="isDownloading"
              class="px-6 py-3 text-sm font-medium text-[#246BFD] border border-[#246BFD] rounded-full hover:bg-[#246BFD] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span v-if="isDownloading">Downloading...</span>
              <span v-else>Download Word</span>
            </button>
            <button 
              @click="downloadPNG"
              :disabled="isDownloading"
              class="px-6 py-3 text-sm font-medium text-[#246BFD] border border-[#246BFD] rounded-full hover:bg-[#246BFD] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span v-if="isDownloading">Downloading...</span>
              <span v-else>Download PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* A4 size styles */
@media print {
  .letterhead {
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;
  }
}
</style> 