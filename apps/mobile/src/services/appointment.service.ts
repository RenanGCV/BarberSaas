import type { Appointment, TimeSlot } from '@/types';
import api from './api';

export interface CreateAppointmentRequest {
  barberId: string;
  serviceId: string;
  scheduledAt: string;
  notes?: string;
}

export const appointmentService = {
  async create(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await api.post<{ appointment: Appointment }>(
      '/appointments',
      data
    );
    return response.data.appointment;
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
    const response = await api.get<{ slots: TimeSlot[] }>(
      '/schedules/available-slots',
      {
        params: { barberId, serviceId, date },
      }
    );
    return response.data.slots;
  },
};
