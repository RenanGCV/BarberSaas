import type { Barber } from '@/types';
import api from './api';

export const barberService = {
  async getAll(tenantId: string): Promise<Barber[]> {
    const response = await api.get<{ barbers: Barber[] }>('/barbers', {
      params: { tenantId },
    });
    return response.data.barbers;
  },

  async getById(id: string): Promise<Barber> {
    const response = await api.get<Barber>(`/barbers/${id}`);
    return response.data;
  },
};
