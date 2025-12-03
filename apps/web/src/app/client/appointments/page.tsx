'use client';

import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export default function ClientAppointmentsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Meus agendamentos</h1>
      <div className="space-y-2">
        {(data || []).map((a: any) => (
          <div key={a.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <div>
              <p className="font-medium">{a?.service?.name || 'Serviço'}</p>
              <p className="text-sm text-text-secondary">
                {a?.barber?.user?.name || a?.barber?.name || 'Barbeiro'} • {formatDateTime(a?.scheduledAt)}
              </p>
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
