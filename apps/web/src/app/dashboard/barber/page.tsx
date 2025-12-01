'use client';

import api from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store';

export default function BarberDashboardPage() {
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['barber-dashboard'],
    queryFn: async () => {
      const [appointments] = await Promise.all([
        api.get('/appointments/upcoming'),
      ]);
      return {
        appointments: (appointments.data || []).filter((a: any) => a?.barberId === user?.id || a?.barber?.id === user?.id),
      };
    },
  });

  const today = new Date().toISOString().split('T')[0];
  const todays = (data?.appointments || []).filter((a: any) => (a?.scheduledAt || '').slice(0,10) === today);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Seu dia</h1>
        <p className="text-text-secondary">Agendamentos e desempenho</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardStat label="Cortes Hoje" value={todays.length} />
        <CardStat label="Próximo Atendimento" value={todays[0] ? formatDateTime(todays[0].scheduledAt) : '—'} />
        <CardStat label="Comissão (estimada)" value={formatCurrency((todays.length * 10) || 0)} />
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Próximos agendamentos</h2>
        <div className="space-y-2">
          {(data?.appointments || []).slice(0,8).map((a: any) => (
            <div key={a.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <p className="font-medium">{a?.customer?.name || 'Cliente'}</p>
                <p className="text-sm text-text-secondary">{a?.service?.name || 'Serviço'} • {formatDateTime(a?.scheduledAt)}</p>
              </div>
              <span className="text-xs text-text-secondary uppercase">{a?.status}</span>
            </div>
          ))}
          {(!data?.appointments || data.appointments.length === 0) && (
            <p className="text-text-secondary">Sem agendamentos no momento.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CardStat({ label, value }: { label: string; value: any }) {
  return (
    <div className="card">
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
