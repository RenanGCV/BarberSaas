'use client';

import { EmptyState, LoadingSpinner, PageHeader, Section, StatCard } from '@/components/ui';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta Semana' },
  { value: 'month', label: 'Este Mês' },
  { value: 'year', label: 'Este Ano' },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState('month');

  const { data, isLoading } = useQuery({
    queryKey: ['reports', period],
    queryFn: async () => {
      const [inc, exp] = await Promise.all([
        api.get('/transactions/summary/INCOME'),
        api.get('/transactions/summary/EXPENSE'),
      ]);
      return { inc: inc.data, exp: exp.data };
    },
  });

  const totalInc = data?.inc?.total || 0;
  const totalExp = data?.exp?.total || 0;
  const result = totalInc - totalExp;

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="📊 Relatórios"
        description="Acompanhe o desempenho financeiro da sua barbearia"
        backHref="/dashboard/admin"
      />

      {/* Filtro de Período */}
      <div className="flex gap-2 flex-wrap">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className={`px-4 py-2 rounded-xl transition-all ${
              period === opt.value
                ? 'bg-primary text-background font-semibold'
                : 'bg-secondary hover:bg-surface-hover text-text-secondary'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Receitas"
          value={formatCurrency(totalInc)}
          icon="💰"
          color="success"
          trend={totalInc > 0 ? { value: 100, isPositive: true } : undefined}
        />
        <StatCard
          label="Despesas"
          value={formatCurrency(totalExp)}
          icon="💸"
          color="error"
        />
        <StatCard
          label="Resultado"
          value={formatCurrency(result)}
          icon={result >= 0 ? '📈' : '📉'}
          color={result >= 0 ? 'success' : 'error'}
        />
      </div>

      {/* Detalhes por Categoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="💰 Receitas por Categoria">
          <CategoryList data={data?.inc?.byCategory || []} type="income" />
        </Section>
        <Section title="💸 Despesas por Categoria">
          <CategoryList data={data?.exp?.byCategory || []} type="expense" />
        </Section>
      </div>

      {/* Gráfico Visual (simulado com barras) */}
      <Section title="📊 Comparativo">
        <div className="space-y-4">
          <BarItem 
            label="Receitas" 
            value={totalInc} 
            maxValue={Math.max(totalInc, totalExp) || 1} 
            color="success" 
          />
          <BarItem 
            label="Despesas" 
            value={totalExp} 
            maxValue={Math.max(totalInc, totalExp) || 1} 
            color="error" 
          />
        </div>
      </Section>
    </div>
  );
}

function CategoryList({ data, type }: { data: any[]; type: 'income' | 'expense' }) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={type === 'income' ? '💰' : '💸'}
        title={type === 'income' ? 'Sem receitas' : 'Sem despesas'}
        description="Nenhum registro encontrado para o período"
      />
    );
  }

  const colorClass = type === 'income' ? 'text-success' : 'text-error';
  const bgClass = type === 'income' ? 'bg-success/10' : 'bg-error/10';

  return (
    <div className="space-y-2">
      {data.map((row: any, i: number) => (
        <div 
          key={i} 
          className={`flex items-center justify-between p-4 ${bgClass} rounded-xl transition-all hover:scale-[1.01]`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{getCategoryIcon(row.category)}</span>
            <span className="font-medium">{row.category || 'Outros'}</span>
          </div>
          <span className={`font-bold ${colorClass}`}>
            {formatCurrency(row.total || 0)}
          </span>
        </div>
      ))}
    </div>
  );
}

function BarItem({ 
  label, 
  value, 
  maxValue, 
  color 
}: { 
  label: string; 
  value: number; 
  maxValue: number; 
  color: 'success' | 'error';
}) {
  const percentage = (value / maxValue) * 100;
  const bgColor = color === 'success' ? 'bg-success' : 'bg-error';
  const textColor = color === 'success' ? 'text-success' : 'text-error';

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className={`font-bold ${textColor}`}>{formatCurrency(value)}</span>
      </div>
      <div className="h-4 bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full ${bgColor} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Serviços': '✂️',
    'Produtos': '🧴',
    'Comissões': '💵',
    'Gorjetas': '💰',
    'Energia': '💡',
    'Água': '💧',
    'Internet': '📶',
    'Aluguel': '🏠',
    'Salários': '👥',
    'Manutenção': '🔧',
    'Marketing': '📣',
  };
  return icons[category] || '📦';
}
