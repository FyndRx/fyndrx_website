import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const newsletterService = {
  async subscribe(email: string) {
    try {
      const response = await axios.post(`${API_URL}/newsletter/subscribe`, { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async unsubscribe(email: string) {
    try {
      const response = await axios.post(`${API_URL}/newsletter/unsubscribe`, { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 