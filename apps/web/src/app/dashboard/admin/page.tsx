'use client';

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
    refetchInterval: 30000, // Atualiza a cada 30s
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Painel do Gestor</h1>
        <p className="text-text-secondary mt-2">Resumo e atalhos rápidos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardStat label="Barbeiros" value={data?.barbers.length || 0} />
        <CardStat label="Serviços" value={data?.services.length || 0} />
        <CardStat label="Saldo do dia" value={`${formatCurrency((data?.income||0)-(data?.expense||0))}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLink href="/dashboard/appointments/new" title="Novo Agendamento" desc="Criar um agendamento" />
        <QuickLink href="/dashboard/transactions/new" title="Registrar Transação" desc="Entrada/Saída de caixa" />
        <QuickLink href="/dashboard/reports" title="Relatórios" desc="Visão financeira" />
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Gestão</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-secondary rounded-lg">
            <h3 className="font-semibold mb-2">Colaboradores</h3>
            <p className="text-sm text-text-secondary mb-4">Cadastrar, ajustar comissão e inativar/ativar</p>
            <Link className="btn btn-primary" href="/dashboard/admin/staff">Gerenciar colaboradores</Link>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <h3 className="font-semibold mb-2">Serviços</h3>
            <p className="text-sm text-text-secondary mb-4">Criar/editar preços e durações</p>
            <Link className="btn btn-primary" href="/dashboard/admin/services">Gerenciar serviços</Link>
          </div>
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

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="card hover:bg-surface-hover transition-colors">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-text-secondary mt-1">{desc}</p>
    </Link>
  );
}
