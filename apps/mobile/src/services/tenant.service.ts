import type { Tenant } from '@/types';
import api from './api';

export const tenantService = {
  async getAll(): Promise<Tenant[]> {
    const response = await api.get<{ tenants: Tenant[] }>('/tenants');
    return response.data.tenants;
  },

  async getById(id: string): Promise<Tenant> {
    const response = await api.get<Tenant>(`/tenants/${id}`);
    return response.data;
  },

  async getBySlug(slug: string): Promise<Tenant> {
    const response = await api.get<Tenant>(`/tenants/slug/${slug}`);
    return response.data;
  },

  async search(query: string): Promise<Tenant[]> {
    const response = await api.get<{ tenants: Tenant[] }>('/tenants', {
      params: { search: query },
    });
    return response.data.tenants;
  },
};
