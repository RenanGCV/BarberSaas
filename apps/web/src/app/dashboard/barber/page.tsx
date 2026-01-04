'use client';

import { EmptyState, LoadingSpinner, PageHeader, Section, StatCard } from '@/components/ui';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

export default function BarberDashboardPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
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

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  const today = new Date().toISOString().split('T')[0];
  const todays = (data?.appointments || []).filter((a: any) => (a?.scheduledAt || '').slice(0,10) === today);
  const upcoming = (data?.appointments || []).slice(0, 8);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title={`Olá, ${user?.name?.split(' ')[0] || 'Barbeiro'}! 👋`}
        description="Seu painel de agendamentos e desempenho"
      />

      {/* Stats do Dia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Cortes Hoje" 
          value={todays.length.toString()} 
          icon="✂️"
          color="primary"
        />
        <StatCard 
          label="Próximo Atendimento" 
          value={todays[0] ? formatDateTime(todays[0].scheduledAt).split(' ')[1] || '—' : '—'} 
          icon="⏰"
          color="info"
        />
        <StatCard 
          label="Comissão Estimada" 
          value={formatCurrency((todays.length * 25) || 0)} 
          icon="💰"
          color="success"
        />
      </div>

      {/* Próximos Agendamentos */}
      <Section 
        title="📅 Próximos Agendamentos" 
        description={`${upcoming.length} agendamentos na fila`}
      >
        {upcoming.length === 0 ? (
          <EmptyState
            icon="📭"
            title="Sem agendamentos"
            description="Você não tem agendamentos próximos no momento"
          />
        ) : (
          <div className="space-y-3">
            {upcoming.map((a: any) => (
              <AppointmentCard key={a.id} appointment={a} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: any }) {
  const statusColors: Record<string, string> = {
    CONFIRMED: 'badge-success',
    PENDING: 'badge-warning',
    CANCELLED: 'badge-error',
    COMPLETED: 'badge-info',
  };

  const statusLabels: Record<string, string> = {
    CONFIRMED: '✅ Confirmado',
    PENDING: '⏳ Pendente',
    CANCELLED: '❌ Cancelado',
    COMPLETED: '✔️ Concluído',
  };

  return (
    <div className="card card-hover p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
            👤
          </div>
          <div>
            <p className="font-semibold">{appointment?.customer?.name || 'Cliente Anônimo'}</p>
            <p className="text-sm text-text-secondary">
              {appointment?.service?.name || 'Serviço'} • {formatDateTime(appointment?.scheduledAt)}
            </p>
          </div>
        </div>
        <span className={`badge ${statusColors[appointment?.status] || 'badge-info'}`}>
          {statusLabels[appointment?.status] || appointment?.status}
        </span>
      </div>
    </div>
  );
}
