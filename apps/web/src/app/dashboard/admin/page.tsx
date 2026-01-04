'use client';

import { ActionCard, LoadingSpinner, Section, StatCard } from '@/components/ui';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const [barbers, services, incomeSummary, expenseSummary] = await Promise.all([
        api.get('/barbers'),
        api.get('/services'),
        api.get('/transactions/summary/INCOME'),
        api.get('/transactions/summary/EXPENSE'),
      ]);
      return {
        barbers: barbers.data || [],
        services: services.data || [],
        income: incomeSummary.data?.total || 0,
        expense: expenseSummary.data?.total || 0,
      };
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  const saldo = (data?.income || 0) - (data?.expense || 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Bem-vindo de volta! <span className="text-gradient">👋</span>
        </h1>
        <p className="text-text-secondary mt-2">
          Aqui está o resumo do seu negócio
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Barbeiros Ativos" 
          value={data?.barbers.length || 0} 
          icon="✂️"
        />
        <StatCard 
          label="Serviços Cadastrados" 
          value={data?.services.length || 0} 
          icon="📋"
        />
        <StatCard 
          label="Saldo do Dia" 
          value={formatCurrency(saldo)}
          icon={saldo >= 0 ? "📈" : "📉"}
          color={saldo >= 0 ? 'success' : 'error'}
        />
      </div>

      {/* Ações Rápidas */}
      <Section title="Ações Rápidas" description="Acesse as funções mais usadas">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard
            icon="📅"
            title="Novo Agendamento"
            description="Agendar um cliente"
            href="/dashboard/appointments/new"
          />
          <ActionCard
            icon="💰"
            title="Registrar Transação"
            description="Entrada ou saída de caixa"
            href="/dashboard/transactions/new"
          />
          <ActionCard
            icon="📊"
            title="Ver Relatórios"
            description="Análise financeira"
            href="/dashboard/reports"
          />
        </div>
      </Section>

      {/* Gestão */}
      <Section title="Gestão" description="Administre sua barbearia">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card card-hover">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
                👥
              </div>
              <div>
                <h3 className="text-lg font-semibold">Colaboradores</h3>
                <p className="text-text-secondary text-sm">
                  {data?.barbers.length || 0} cadastrados
                </p>
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Cadastrar novos barbeiros, ajustar comissões e gerenciar horários
            </p>
            <Link href="/dashboard/admin/staff" className="btn btn-primary w-full">
              Gerenciar Colaboradores
            </Link>
          </div>

          <div className="card card-hover">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
                💇
              </div>
              <div>
                <h3 className="text-lg font-semibold">Serviços</h3>
                <p className="text-text-secondary text-sm">
                  {data?.services.length || 0} cadastrados
                </p>
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Criar e editar serviços, definir preços e durações
            </p>
            <Link href="/dashboard/admin/services" className="btn btn-primary w-full">
              Gerenciar Serviços
            </Link>
          </div>
        </div>
      </Section>

      {/* Financeiro Resumido */}
      <Section title="Resumo Financeiro">
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-xl bg-success/10">
              <p className="text-sm text-success font-medium">Entradas</p>
              <p className="text-2xl font-bold text-success mt-1">
                {formatCurrency(data?.income || 0)}
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-error/10">
              <p className="text-sm text-error font-medium">Saídas</p>
              <p className="text-2xl font-bold text-error mt-1">
                {formatCurrency(data?.expense || 0)}
              </p>
            </div>
            <div className={`text-center p-4 rounded-xl ${saldo >= 0 ? 'bg-primary/10' : 'bg-error/10'}`}>
              <p className={`text-sm font-medium ${saldo >= 0 ? 'text-primary' : 'text-error'}`}>Saldo</p>
              <p className={`text-2xl font-bold mt-1 ${saldo >= 0 ? 'text-primary' : 'text-error'}`}>
                {formatCurrency(saldo)}
              </p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
