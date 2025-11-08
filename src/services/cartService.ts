import type { CartItem } from '@/models/Cart';
import type { Order, OrderItem } from '@/models/Order';
import ordersData from '@/data/orders.json';
import { dataService } from './dataService';

interface CreateOrderPayload {
  pharmacyId: number;
  items: {
    medicationId: number;
    brandId?: number;
    formId: number;
    strengthId: number;
    uomId: number;
    quantity: number;
    price: number;
  }[];
  paymentMethod: 'platform' | 'direct';
  deliveryMethod: 'pickup' | 'delivery';
  deliveryAddress?: string;
  prescriptionFile?: File;
}

const mockOrders = [...(ordersData as Order[])];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateOrderNumber = (): string => {
  const randomNum = Math.floor(Math.random() * 999999) + 1;
  return `#FRX-${randomNum.toString().padStart(6, '0')}`;
};

export const cartService = {
  async syncCart(items: CartItem[]): Promise<void> {
    await delay(300);
    console.log('Cart synced (mock):', items);
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    await delay(1000);
    
    const pharmacy = await dataService.getPharmacyById(payload.pharmacyId);
    if (!pharmacy) {
      throw new Error('Pharmacy not found');
    }

    const orderItems: OrderItem[] = await Promise.all(
      payload.items.map(async (item) => {
        const medication = await dataService.getMedicationById(item.medicationId);
        const form = medication?.forms.find(f => f.id === item.formId);
        const strength = form?.strengths.find(s => s.id === item.strengthId);
        const brand = medication?.brands?.find(b => b.id === item.brandId);
        
        return {
          id: `item-${Date.now()}-${Math.random()}`,
          medicationId: item.medicationId,
          medicationName: medication?.name || 'Unknown',
          brandId: item.brandId,
          brandName: brand?.name,
          formId: item.formId,
          formName: form?.name || 'Unknown',
          strengthId: item.strengthId,
          strength: strength?.strength || 'Unknown',
          uomId: item.uomId,
          uom: medication?.uom || 'UNIT(S)',
          quantity: item.quantity,
          price: item.price,
          image: medication?.image
        };
      })
    );

    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = payload.deliveryMethod === 'delivery' ? 5 : 0;
    const total = subtotal + deliveryFee;

    const hasPrescriptionItems = orderItems.some(item => {
      const medication = dataService.getAllMedications().find(m => m.id === item.medicationId);
      return medication?.requiresPrescription;
    });

    const newOrder: Order = {
      id: `ORD-2024-${mockOrders.length + 1}`,
      orderNumber: generateOrderNumber(),
      userId: 1,
      pharmacyId: payload.pharmacyId,
      pharmacyName: pharmacy.name,
      pharmacyPhone: pharmacy.phone,
      pharmacyAddress: pharmacy.address,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.paymentMethod === 'platform' ? 'pending' : 'pending',
      deliveryMethod: payload.deliveryMethod,
      deliveryAddress: payload.deliveryAddress,
      phoneNumber: '+233 24 555 1234',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      prescriptionRequired: hasPrescriptionItems,
      prescriptionUploaded: !!payload.prescriptionFile,
      prescriptionUrl: payload.prescriptionFile ? `/prescriptions/prescription-${Date.now()}.pdf` : undefined
    };

    mockOrders.unshift(newOrder);
    
    return newOrder;
  },

  async getOrders(): Promise<Order[]> {
    await delay(500);
    return mockOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getOrder(orderId: string): Promise<Order> {
    await delay(300);
    const order = mockOrders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  },

  async cancelOrder(orderId: string): Promise<void> {
    await delay(500);
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      mockOrders[orderIndex].status = 'cancelled';
      mockOrders[orderIndex].cancelledAt = new Date().toISOString();
    }
  },

  async initiatePayment(orderId: string): Promise<{paymentUrl: string}> {
    await delay(800);
    
    const mockReference = `PST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const callbackUrl = `${window.location.origin}/payment/callback?reference=${mockReference}&status=success&orderId=${orderId}`;
    
    console.log('Mock payment initiated for order:', orderId);
    console.log('Callback URL:', callbackUrl);
    
    return {
      paymentUrl: callbackUrl
    };
  }
};

