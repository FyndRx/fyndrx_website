import { apiService } from './api';

export const newsletterService = {
  async subscribe(email: string): Promise<{ message: string }> {
    return await apiService.post<{ message: string }>('/newsletter/subscribe', { email });
  },

  async unsubscribe(email: string): Promise<{ message: string }> {
    return await apiService.post<{ message: string }>('/newsletter/unsubscribe', { email });
  }
}; 