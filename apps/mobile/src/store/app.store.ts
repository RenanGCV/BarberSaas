import type { Barber, Service, Tenant } from '@/types';
import { create } from 'zustand';

interface AppState {
  selectedTenant: Tenant | null;
  selectedBarber: Barber | null;
  selectedService: Service | null;
  selectedDateTime: Date | null;
  setSelectedTenant: (tenant: Tenant | null) => void;
  setSelectedBarber: (barber: Barber | null) => void;
  setSelectedService: (service: Service | null) => void;
  setSelectedDateTime: (dateTime: Date | null) => void;
  clearBookingData: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedTenant: null,
  selectedBarber: null,
  selectedService: null,
  selectedDateTime: null,
  setSelectedTenant: (tenant) => set({ selectedTenant: tenant }),
  setSelectedBarber: (barber) => set({ selectedBarber: barber }),
  setSelectedService: (service) => set({ selectedService: service }),
  setSelectedDateTime: (dateTime) => set({ selectedDateTime: dateTime }),
  clearBookingData: () =>
    set({
      selectedBarber: null,
      selectedService: null,
      selectedDateTime: null,
    }),
}));
