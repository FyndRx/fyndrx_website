<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNotification } from '@/composables/useNotification';
import type { Order } from '@/models/Order';
import { paymentService, type Transaction } from '@/services/paymentService';
import { orderService } from '@/services/orderService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import fyndRxLogo from '@/assets/logo/logo_blue_orange.png';

const route = useRoute();
const router = useRouter();
const notification = useNotification();

const transaction = ref<Transaction | null>(null);
const order = ref<Order | null>(null);
const loading = ref(true);
const downloading = ref(false);
const receiptRef = ref<HTMLElement | null>(null);

const receiptData = computed(() => {
  if (!order.value) return null;

  // Fallback values if transaction is missing
  const txRef = transaction.value?.reference || `ORD-${order.value.orderNumber || order.value.id}`;
  const txId = transaction.value?.id || `N/A`;
  const paymentMethod = transaction.value?.payment_method 
    ? (transaction.value.payment_method === 'platform' ? 'Online Payment (Paystack)' : 'Pay at Pharmacy')
    : (order.value.paymentMethod === 'platform' ? 'Online Payment' : 'Pay at Pharmacy');
    
  const amountPaid = transaction.value?.amount || order.value.total;
  const paymentStatus = transaction.value?.status || order.value.paymentStatus;
  const paidAt = transaction.value?.paid_at || (order.value.paymentStatus === 'paid' ? order.value.updatedAt : undefined);

  return {
    orderId: order.value.id,
    orderNumber: order.value.orderNumber || order.value.id,
    transactionId: txId,
    transactionReference: txRef,
    customerName: 'John Mensah', // This should ideally come from auth store if available, or order metadata
    customerEmail: (transaction.value as any)?.metadata?.customerEmail || '',
    customerPhone: (transaction.value as any)?.metadata?.customerPhone || order.value.phoneNumber,
    pharmacyName: order.value.pharmacyName,
    pharmacyBranch: order.value.branchName,
    pharmacyAddress: order.value.pharmacyAddress || '',
    pharmacyPhone: order.value.pharmacyPhone,
    pharmacyImage: order.value.pharmacyImage,
    items: order.value.items.map(item => ({
      name: `${item.medicationName}${item.brandName ? ` (${item.brandName})` : ''} - ${item.formName} ${item.strength}`,
      quantity: item.quantity,
      unitPrice: item.discountPrice || item.price,
      total: (item.discountPrice || item.price) * item.quantity
    })),
    subtotal: order.value.subtotal,
    deliveryFee: order.value.deliveryFee,
    total: order.value.total,
    amountPaid: amountPaid,
    paymentMethod: paymentMethod,
    paymentStatus: paymentStatus,
    paidAt: paidAt,
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
    
    // Ensure images are loaded before capturing
    const images = Array.from(receiptRef.value.querySelectorAll('img'));
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if image fails
      });
    }));
    
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
  const idFromRoute = route.params.id as string;
  
  try {
    // 1. Try to fetch as a Transaction ID first
    try {
      const tx = await paymentService.getTransaction(idFromRoute);
      if (tx) {
        transaction.value = tx;
        if (tx.order_id) {
          order.value = await orderService.getOrder(String(tx.order_id));
        }
      }
    } catch (txError) {
      console.warn('Could not load transaction by ID, trying as Order ID...', txError);
    }
    
    // 2. If transaction load failed or didn't fetch order, try to fetch as Order ID
    if (!order.value) {
       // If the previous call failed, 'idFromRoute' might be an Order ID
       order.value = await orderService.getOrder(idFromRoute);
       
       if (order.value) {
         // Optionally try to find transaction for this order (optional, for completeness)
         try {
            const allTxs = await paymentService.getTransactions();
            const foundTx = allTxs.find(t => String(t.order_id) === String(order.value!.id));
            if (foundTx) transaction.value = foundTx;
         } catch (e) { /* ignore */ }
       }
    }

    if (!order.value) {
      throw new Error('Could not load order or transaction');
    }

  } catch (err) {
    console.error('Error loading receipt:', err);
    notification.error('Error', 'Failed to load receipt details');
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
        <div class="flex items-center justify-between mb-8 print:hidden">
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
              class="flex items-center gap-2 px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
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
        <div ref="receiptRef" class="relative bg-white shadow-2xl rounded-sm overflow-hidden md:max-w-3xl mx-auto receipt-paper">
           <!-- Zigzag Top Border via CSS or SVG -->
           <div class="h-2 bg-gradient-to-r from-[#246BFD] to-[#1B4DBC]"></div>

          <div class="p-8 md:p-12">
            <!-- Branding Header -->
            <div class="flex items-center justify-between mb-10 pb-8 border-b-2 border-dashed border-gray-200">
               <!-- Left: FyndRX Info -->
               <div>
                  <img :src="fyndRxLogo" alt="FyndRX" class="h-10 mb-3" />
                  <p class="text-sm text-gray-500">The Modern Pharmacy Marketplace</p>
                  <p class="text-xs text-gray-400 mt-1">www.fyndrx.com</p>
               </div>
               
               <!-- Right: Official Receipt Label -->
               <div class="text-right">
                  <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">RECEIPT</h1>
                  <p class="text-sm text-gray-500 mt-1 font-mono">#{{ receiptData.orderNumber }}</p>
                  <div class="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    :class="receiptData.paymentStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                    {{ receiptData.paymentStatus === 'success' ? 'Paid Successfully' : receiptData.paymentStatus }}
                  </div>
               </div>
            </div>

            <!-- Pharmacy & Customer Info -->
            <div class="flex flex-col md:flex-row justify-between gap-8 mb-10">
               <!-- From: Pharmacy -->
               <div class="flex-1">
                  <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Issued By</p>
                  <div class="flex items-start gap-4">
                     <div class="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                         <LazyImage 
                          :src="receiptData.pharmacyImage || ''" 
                          alt="Pharmacy"
                          class="w-full h-full object-cover"
                          fallback="https://ui-avatars.com/api/?name=Rx&background=f3f4f6&color=6b7280"
                        />
                     </div>
                     <div>
                        <h3 class="font-bold text-gray-900 text-lg leading-tight">{{ receiptData.pharmacyName }}</h3>
                        <p v-if="receiptData.pharmacyBranch" class="text-sm text-gray-600 font-medium">{{ receiptData.pharmacyBranch }}</p>
                        <p class="text-sm text-gray-500 mt-1">{{ receiptData.pharmacyAddress }}</p>
                        <p class="text-sm text-gray-500">{{ receiptData.pharmacyPhone }}</p>
                     </div>
                  </div>
               </div>

               <!-- To: Customer -->
               <div class="flex-1 md:text-right">
                  <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Billed To</p>
                  <h3 class="font-bold text-gray-900 text-lg">{{ receiptData.customerName }}</h3>
                  <p class="text-sm text-gray-500">{{ receiptData.customerPhone }}</p>
                  <p class="text-sm text-gray-500">{{ receiptData.customerEmail }}</p>
                  
                  <div class="mt-4 pt-4 border-t border-gray-100 inline-block text-left min-w-[200px]">
                     <div class="flex justify-between text-xs mb-1">
                        <span class="text-gray-400">Date:</span>
                        <span class="font-medium text-gray-900">{{ formatDate(receiptData.paidAt || receiptData.issuedAt) }}</span>
                     </div>
                     <div class="flex justify-between text-xs">
                        <span class="text-gray-400">Ref:</span>
                        <span class="font-mono text-gray-900">{{ receiptData.transactionReference }}</span>
                     </div>
                  </div>
               </div>
            </div>

            <!-- Items Table -->
            <div class="mb-10">
               <div class="rounded-lg border border-gray-200 overflow-hidden">
                  <table class="w-full">
                     <thead class="bg-gray-50">
                        <tr>
                           <th class="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item Details</th>
                           <th class="py-3 px-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                           <th class="py-3 px-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                           <th class="py-3 px-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                     </thead>
                     <tbody class="divide-y divide-gray-100">
                        <tr v-for="(item, index) in receiptData.items" :key="index">
                           <td class="py-4 px-4 text-sm font-medium text-gray-900">{{ item.name }}</td>
                           <td class="py-4 px-4 text-sm text-gray-600 text-center">{{ item.quantity }}</td>
                           <td class="py-4 px-4 text-sm text-gray-600 text-right">GHS {{ item.unitPrice.toFixed(2) }}</td>
                           <td class="py-4 px-4 text-sm font-bold text-gray-900 text-right">GHS {{ item.total.toFixed(2) }}</td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>

            <!-- Financials -->
            <div class="flex justify-end mb-12">
               <div class="w-full md:w-1/2 lg:w-5/12 space-y-3">
                  <div class="flex justify-between text-sm text-gray-600">
                     <span>Subtotal</span>
                     <span>GHS {{ receiptData.subtotal.toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between text-sm text-gray-600">
                     <span>Delivery Fee</span>
                     <span>GHS {{ receiptData.deliveryFee.toFixed(2) }}</span>
                  </div>
                  <div class="my-3 border-b-2 border-dashed border-gray-200"></div>
                  <div class="flex justify-between items-end">
                     <span class="text-base font-bold text-gray-900">Total Amount</span>
                     <span class="text-2xl font-extrabold text-[#246BFD]">GHS {{ receiptData.total.toFixed(2) }}</span>
                  </div>
                  
                  <div class="mt-6 p-3 bg-gray-50 rounded-lg flex items-center justify-between border border-gray-100">
                     <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-green-500"></div>
                        <span class="text-xs font-bold text-gray-600 uppercase">Paid via {{ receiptData.paymentMethod.includes('Paystack') ? 'Paystack' : 'Pharmacy' }}</span>
                     </div>
                     <span class="font-mono text-sm font-bold text-gray-900">GHS {{ receiptData.amountPaid.toFixed(2) }}</span>
                  </div>
               </div>
            </div>

            <!-- Footer -->
            <div class="text-center pt-8 border-t-2 border-dashed border-gray-200">
               <svg class="w-8 h-8 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
               </svg>
               <p class="font-bold text-gray-900 mb-1">Thank you for your business!</p>
               <p class="text-sm text-gray-500 max-w-sm mx-auto">
                  If you have any questions about this receipt, please contact support@fyndrx.com
               </p>
            </div>
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

