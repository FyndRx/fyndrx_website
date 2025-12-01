import { apiService } from './api';

export interface Form {
  id: number;
  name: string;
  description?: string;
}

export const formsService = {
  async getAllForms(): Promise<Form[]> {
    return await apiService.get<Form[]>('/forms');
  }
};


