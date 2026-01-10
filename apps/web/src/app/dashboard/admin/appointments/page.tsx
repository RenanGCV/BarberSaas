'use client';

import { LoadingSpinner, PageHeader, Section } from '@/components/ui';
import api from '@/lib/api';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500', icon: '⏳' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-500/10 text-blue-500', icon: '✅' },
  COMPLETED: { label: 'Concluído', color: 'bg-green-500/10 text-green-500', icon: '✔️' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500/10 text-red-500', icon: '❌' },
  NO_SHOW: { label: 'Não compareceu', color: 'bg-gray-500/10 text-gray-500', icon: '👻' },
};

export default function AppointmentsPage() {
  const [filter, setFilter] = useState<'today' | 'week' | 'all'>('today');

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params.set('startDate', today);
        params.set('endDate', today);
      } else if (filter === 'week') {
        const today = new Date();
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        params.set('startDate', today.toISOString().split('T')[0]);
        params.set('endDate', weekEnd.toISOString().split('T')[0]);
      }

      const res = await api.get(`/appointments?${params.toString()}`);
      return res.data;
    },
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="📅 Agenda"
        description="Gerencie os agendamentos da barbearia"
        action={
          <Link href="/dashboard/admin/appointments/new" className="btn btn-primary">
            + Novo Agendamento
          </Link>
        }
      />

      {/* Filtros */}
      <div className="flex gap-2">
        {[
          { key: 'today', label: 'Hoje' },
          { key: 'week', label: 'Próximos 7 dias' },
          { key: 'all', label: 'Todos' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-primary text-background'
                : 'bg-secondary text-text-secondary hover:text-text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de Agendamentos */}
      <Section title="Agendamentos" description={`${appointments?.length || 0} encontrados`}>
        {!appointments?.length ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-text-secondary">Nenhum agendamento encontrado</p>
            <Link href="/dashboard/admin/appointments/new" className="btn btn-primary mt-4">
              Criar Primeiro Agendamento
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt: any) => {
              const status = STATUS_LABELS[apt.status] || STATUS_LABELS.PENDING;
              return (
                <div key={apt.id} className="card card-hover">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="text-xl">{status.icon}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">
                          {apt.customer?.name || apt.guestName || 'Cliente não identificado'}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {apt.service?.name} • {formatCurrency(apt.service?.price || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-text-primary">
                        {formatDate(apt.scheduledAt)}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {formatTime(apt.scheduledAt)} • {apt.barber?.user?.name || 'Barbeiro'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
