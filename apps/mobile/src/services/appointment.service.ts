import type { Appointment, TimeSlot } from '@/types';
import api from './api';

export interface CreateAppointmentRequest {
  barberId: string;
  serviceId: string;
  scheduledAt: string;
  notes?: string;
  // Campos para agendamento sem login
  guestName?: string;
  guestPhone?: string;
}

export const appointmentService = {
  async create(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await api.post<{ appointment: Appointment }>(
      '/appointments',
      data
    );
    return response.data.appointment;
  },

  // Criar agendamento sem autenticação (público)
  async createAsGuest(data: CreateAppointmentRequest): Promise<Appointment> {
    // Remove token de autenticação temporariamente
    const token = api.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['Authorization'];

    try {
      const response = await api.post<{ appointment: Appointment }>(
        '/appointments',
        data
      );
      return response.data.appointment;
    } finally {
      // Restaura token se existia
      if (token) {
        api.defaults.headers.common['Authorization'] = token;
      }
    }
  },

  async getMyAppointments(): Promise<Appointment[]> {
    const response = await api.get<{ appointments: Appointment[] }>(
      '/appointments/my-appointments'
    );
    return response.data.appointments;
  },

  async getById(id: string): Promise<Appointment> {
    const response = await api.get<{ appointment: Appointment }>(
      `/appointments/${id}`
    );
    return response.data.appointment;
  },

  async cancel(id: string, reason?: string): Promise<void> {
    await api.patch(`/appointments/${id}/cancel`, { reason });
  },

  async getAvailableSlots(
    barberId: string,
    serviceId: string,
    date: string
  ): Promise<TimeSlot[]> {
    // Remove autenticação para chamada pública
    const token = api.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['Authorization'];

    try {
      const response = await api.get<{ slots: TimeSlot[] }>(
        '/schedules/available-slots',
        {
          params: { barberId, serviceId, date },
        }
      );
      return response.data.slots;
    } finally {
      if (token) {
        api.defaults.headers.common['Authorization'] = token;
      }
    }
  },
};
