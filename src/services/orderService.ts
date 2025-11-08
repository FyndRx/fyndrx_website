import type { Order, OrderTracking, OrderStatusHistory } from '@/models/Order';
import ordersData from '@/data/orders.json';

const mockOrders = [...(ordersData as Order[])];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const orderService = {
  async getOrders(): Promise<Order[]> {
    try {
      await delay(500);
      return mockOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  async getOrder(orderId: string): Promise<Order> {
    try {
      await delay(300);
      const order = mockOrders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  async getOrderTracking(orderId: string): Promise<OrderTracking> {
    try {
      await delay(300);
      const order = mockOrders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const statusHistory: OrderStatusHistory[] = [
        { status: 'pending', timestamp: order.createdAt, note: 'Order placed' }
      ];

      const statusOrder: Order['status'][] = ['pending', 'confirmed', 'processing', 'ready', 'out_for_delivery', 'completed'];
      const currentIndex = statusOrder.indexOf(order.status);
      
      for (let i = 1; i <= currentIndex; i++) {
        statusHistory.push({
          status: statusOrder[i],
          timestamp: new Date(new Date(order.createdAt).getTime() + i * 3600000).toISOString()
        });
      }

      return {
        order,
        statusHistory,
        currentStep: currentIndex,
        estimatedDelivery: order.estimatedReadyTime
      };
    } catch (error) {
      console.error('Error fetching order tracking:', error);
      throw error;
    }
  },

  async cancelOrder(orderId: string, reason?: string): Promise<void> {
    try {
      await delay(500);
      const orderIndex = mockOrders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        mockOrders[orderIndex].status = 'cancelled';
        mockOrders[orderIndex].cancelledAt = new Date().toISOString();
        mockOrders[orderIndex].cancellationReason = reason;
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  async reorder(orderId: string): Promise<void> {
    try {
      await delay(500);
      const order = mockOrders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      console.log('Reorder functionality will be implemented');
    } catch (error) {
      console.error('Error reordering:', error);
      throw error;
    }
  }
};

