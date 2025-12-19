import type { Tenant } from '@/types';
import { create } from 'zustand';

interface AppState {
  selectedTenant: Tenant | null;
  setSelectedTenant: (tenant: Tenant | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedTenant: null,
  setSelectedTenant: (tenant) => set({ selectedTenant: tenant }),
}));
