import type { Service } from '@/types';
import api from './api';

export const serviceService = {
  async getAll(tenantId: string): Promise<Service[]> {
    const response = await api.get<{ services: Service[] }>('/services', {
      params: { tenantId },
    });
    return response.data.services;
  },

  async getById(id: string): Promise<Service> {
    const response = await api.get<Service>(`/services/${id}`);
    return response.data;
  },
};
