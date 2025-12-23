<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNotification } from '@/composables/useNotification';
import type { Order } from '@/models/Order';
import { paymentService, type Transaction } from '@/services/paymentService';
import { orderService } from '@/services/orderService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const route = useRoute();
const router = useRouter();
const notification = useNotification();

const transaction = ref<Transaction | null>(null);
const order = ref<Order | null>(null);
const loading = ref(true);
const downloading = ref(false);
const receiptRef = ref<HTMLElement | null>(null);

const receiptData = computed(() => {
  if (!transaction.value || !order.value) return null;

  return {
    orderId: order.value.id,
    orderNumber: order.value.orderNumber || order.value.id,
    transactionId: transaction.value.id,
    transactionReference: transaction.value.reference,
    customerName: 'John Mensah',
    customerEmail: (transaction.value as any).metadata?.customerEmail || '',
    customerPhone: (transaction.value as any).metadata?.customerPhone || order.value.phoneNumber,
    pharmacyName: order.value.pharmacyName,
    pharmacyAddress: order.value.pharmacyAddress || '',
    items: order.value.items.map(item => ({
      name: `${item.medicationName}${item.brandName ? ` (${item.brandName})` : ''} - ${item.formName} ${item.strength}`,
      quantity: item.quantity,
      unitPrice: item.discountPrice || item.price,
      total: (item.discountPrice || item.price) * item.quantity
    })),
    subtotal: order.value.subtotal,
    deliveryFee: order.value.deliveryFee,
    total: order.value.total,
    amountPaid: transaction.value.amount,
    paymentMethod: transaction.value.payment_method === 'platform' ? 'Online Payment (Paystack)' : 'Pay at Pharmacy',
    paymentStatus: transaction.value.status,
    paidAt: transaction.value.paid_at,
    issuedAt: new Date().toISOString()
  };
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const printReceipt = () => {
  window.print();
};

const downloadReceipt = async () => {
  if (!receiptRef.value || !receiptData.value) return;

  try {
    downloading.value = true;
    
    const element = receiptRef.value;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    const filename = `FyndRx_Receipt_${receiptData.value.orderNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
    
    notification.success('PDF Downloaded', 'Your receipt has been downloaded successfully.');
  } catch (error) {
    console.error('Error generating PDF:', error);
    notification.error('Download Failed', 'Failed to generate PDF. Please try printing instead.');
  } finally {
    downloading.value = false;
  }
};

const loadReceipt = async () => {
  loading.value = true;
  try {
    const transactionId = route.params.id as string;
    transaction.value = await paymentService.getTransaction(transactionId);
    
    if (transaction.value && transaction.value.order_id) {
      order.value = await orderService.getOrder(transaction.value.order_id);
    }
    
    if (!transaction.value || !order.value) {
      router.push({ name: 'transactions' });
    }
  } catch (err) {
    console.error('Error loading receipt:', err);
    notification.error('Error', 'Failed to load receipt');
    router.push({ name: 'transactions' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadReceipt();
});
</script>

<template>
  <div class="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
      <div v-if="loading" class="py-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD] mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-300">Loading receipt...</p>
      </div>

      <div v-else-if="receiptData">
        <!-- Action Buttons (Hide on print) -->
        <div class="flex items-center justify-between mb-6 print:hidden">
          <button
            @click="router.push({ name: 'transactions' })"
            class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#246BFD] transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Transactions
          </button>

          <div class="flex gap-3">
            <button
              @click="printReceipt"
              class="flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium border-2 border-gray-300 dark:border-gray-600 hover:border-[#246BFD] hover:text-[#246BFD] transition-all"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              Print
            </button>
            <button
              @click="downloadReceipt"
              :disabled="downloading"
              class="flex items-center gap-2 px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="!downloading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ downloading ? 'Generating...' : 'Download PDF' }}</span>
            </button>
          </div>
        </div>

        <!-- Receipt Content -->
        <div ref="receiptRef" class="p-8 bg-white shadow-lg dark:bg-gray-800 rounded-2xl md:p-12">
          <!-- Header -->
          <div class="mb-8 pb-8 border-b-2 border-gray-200 dark:border-gray-700">
            <div class="flex items-start justify-between mb-6">
              <div>
                <h1 class="text-3xl font-bold text-[#246BFD] mb-2">FyndRx</h1>
                <p class="text-sm text-gray-600 dark:text-gray-400">ePharmacy Platform</p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">RECEIPT</p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ receiptData.orderNumber }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Bill To</p>
                <p class="font-semibold text-gray-900 dark:text-white">{{ receiptData.customerName }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ receiptData.customerEmail }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ receiptData.customerPhone }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">From</p>
                <p class="font-semibold text-gray-900 dark:text-white">{{ receiptData.pharmacyName }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ receiptData.pharmacyAddress }}</p>
              </div>
            </div>
          </div>

          <!-- Transaction Details -->
          <div class="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Transaction ID</p>
                <p class="text-sm font-mono text-gray-900 dark:text-white">{{ receiptData.transactionId }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Reference</p>
                <p class="text-sm font-mono text-gray-900 dark:text-white break-all">{{ receiptData.transactionReference }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Payment Date</p>
                <p class="text-sm text-gray-900 dark:text-white">{{ receiptData.paidAt ? formatDate(receiptData.paidAt) : 'Pending' }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Status</p>
                <span
                  :class="[
                    'inline-block px-3 py-1 text-xs font-semibold rounded-full',
                    receiptData.paymentStatus === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                  ]"
                >
                  {{ receiptData.paymentStatus === 'success' ? 'Paid' : 'Pending' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div class="mb-8">
            <table class="w-full">
              <thead>
                <tr class="border-b-2 border-gray-200 dark:border-gray-700">
                  <th class="pb-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Item</th>
                  <th class="pb-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                  <th class="pb-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Unit Price</th>
                  <th class="pb-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in receiptData.items"
                  :key="index"
                  class="border-b border-gray-100 dark:border-gray-700"
                >
                  <td class="py-4 text-sm text-gray-900 dark:text-white">{{ item.name }}</td>
                  <td class="py-4 text-sm text-center text-gray-900 dark:text-white">{{ item.quantity }}</td>
                  <td class="py-4 text-sm text-right text-gray-900 dark:text-white">GHS {{ item.unitPrice.toFixed(2) }}</td>
                  <td class="py-4 text-sm text-right font-semibold text-gray-900 dark:text-white">GHS {{ item.total.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="mb-8">
            <div class="flex justify-end">
              <div class="w-full md:w-80 space-y-3">
                <div class="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>GHS {{ receiptData.subtotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Delivery Fee</span>
                  <span>GHS {{ receiptData.deliveryFee.toFixed(2) }}</span>
                </div>
                <div class="pt-3 border-t-2 border-gray-200 dark:border-gray-700">
                  <div class="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span class="text-[#246BFD]">GHS {{ receiptData.total.toFixed(2) }}</span>
                  </div>
                </div>
                <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600 dark:text-gray-400">Payment Method</span>
                    <span class="font-medium text-gray-900 dark:text-white">{{ receiptData.paymentMethod }}</span>
                  </div>
                  <div class="flex justify-between text-sm mt-2">
                    <span class="text-gray-600 dark:text-gray-400">Amount Paid</span>
                    <span class="font-bold text-green-600 dark:text-green-400">GHS {{ receiptData.amountPaid.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Thank you for choosing FyndRx!
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-500">
              This is an electronic receipt. For any queries, contact us at info@fyndrx.com or +233 24 399 6999
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  body {
    background: white !important;
  }
  
  .print\:hidden {
    display: none !important;
  }
  
  nav, header, footer, .no-print {
    display: none !important;
  }
}
</style>

