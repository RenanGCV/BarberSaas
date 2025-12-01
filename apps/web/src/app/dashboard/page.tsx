'use client';

import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatCurrency, formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Calendar, DollarSign, Scissors, Users } from 'lucide-react';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [appointments, transactions] = await Promise.all([
        api.get('/appointments/upcoming'),
        api.get('/transactions', {
          params: {
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
          },
        }),
      ]);
      return {
        appointments: appointments.data,
        transactions: transactions.data,
      };
    },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">
          Bem-vindo, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-text-secondary mt-2">
          Aqui está o resumo do seu dia
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          label="Agendamentos Hoje"
          value={stats?.appointments?.length || 0}
          color="primary"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Receita Hoje"
          value={formatCurrency(stats?.transactions?.totals?.income || 0)}
          color="success"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Clientes Atendidos"
          value={stats?.appointments?.filter((a: any) => a.status === 'COMPLETED').length || 0}
          color="info"
        />
        <StatCard
          icon={<Scissors className="w-6 h-6" />}
          label="Em Andamento"
          value={stats?.appointments?.filter((a: any) => a.status === 'IN_PROGRESS').length || 0}
          color="warning"
        />
      </div>

      {/* Próximos Agendamentos */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Próximos Agendamentos</h2>
        <div className="space-y-3">
          {stats?.appointments?.slice(0, 5).map((appointment: any) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-surface-hover transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">{appointment.customer?.name}</p>
                <p className="text-sm text-text-secondary">
                  {appointment.service?.name} • {formatDateTime(appointment.scheduledDate)}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                {getStatusLabel(appointment.status)}
              </span>
            </div>
          )) || (
            <p className="text-text-secondary text-center py-8">
              Nenhum agendamento próximo
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction
          title="Novo Agendamento"
          description="Criar um novo agendamento"
          href="/dashboard/appointments/new"
        />
        <QuickAction
          title="Registrar Transação"
          description="Adicionar entrada ou saída"
          href="/dashboard/transactions/new"
        />
        <QuickAction
          title="Ver Relatórios"
          description="Análise e relatórios"
          href="/dashboard/reports"
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colorClasses = {
    primary: 'text-primary',
    success: 'text-success',
    info: 'text-info',
    warning: 'text-warning',
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm">{label}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={colorClasses[color as keyof typeof colorClasses]}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ title, description, href }: any) {
  return (
    <a
      href={href}
      className="card hover:bg-surface-hover transition-colors cursor-pointer group"
    >
      <h3 className="font-semibold group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-text-secondary mt-1">{description}</p>
    </a>
  );
}
