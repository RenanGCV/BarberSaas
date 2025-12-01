'use client';

import api from '@/lib/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NewAppointmentPage() {
  const router = useRouter();
  const [form, setForm] = useState({ barberId: '', serviceId: '', scheduledAt: '' });

  const { data: options } = useQuery({
    queryKey: ['new-appointment-options'],
    queryFn: async () => {
      const [barbers, services] = await Promise.all([api.get('/barbers'), api.get('/services')]);
      return { barbers: barbers.data || [], services: services.data || [] };
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post('/appointments', form);
    },
    onSuccess: () => {
      toast.success('Agendamento criado!');
      router.replace('/client/appointments');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao agendar'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Novo agendamento</h1>
        <a href="/client" className="btn btn-secondary">Voltar</a>
      </div>
      <div className="card space-y-4">
        <div>
          <label className="label">Profissional</label>
          <select className="input" value={form.barberId} onChange={(e) => setForm((f) => ({ ...f, barberId: e.target.value }))}>
            <option value="">Selecione</option>
            {(options?.barbers || []).map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Serviço</label>
          <select className="input" value={form.serviceId} onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value }))}>
            <option value="">Selecione</option>
            {(options?.services || []).map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Data e hora</label>
          <input type="datetime-local" className="input" value={form.scheduledAt}
                 onChange={(e) => setForm((f) => ({ ...f, scheduledAt: new Date(e.target.value).toISOString() }))} />
        </div>
        <button className="btn btn-primary" onClick={() => mutation.mutate()} disabled={!form.barberId || !form.serviceId || !form.scheduledAt}>
          Confirmar
        </button>
      </div>
    </div>
  );
}
