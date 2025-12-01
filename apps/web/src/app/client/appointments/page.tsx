'use client';

import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function ClientAppointmentsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['client-appointments'],
    queryFn: async () => {
      const res = await api.get('/appointments');
      return res.data || [];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/appointments/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client-appointments'] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Meus agendamentos</h1>
      <div className="space-y-2">
        {(data || []).map((a: any) => (
          <div key={a.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <div>
              <p className="font-medium">{a?.service?.name || 'Serviço'}</p>
              <p className="text-sm text-text-secondary">{a?.barber?.name || 'Barbeiro'} • {formatDateTime(a?.scheduledAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <a href={`/client/appointments/${a.id}/reschedule`} className="btn btn-secondary">Remarcar</a>
              <button className="btn btn-danger" onClick={() => cancelMutation.mutate(a.id)}>Cancelar</button>
            </div>
          </div>
        ))}
        {(!data || data.length === 0) && (
          <p className="text-text-secondary">Você ainda não possui agendamentos.</p>
        )}
      </div>
    </div>
  );
}
