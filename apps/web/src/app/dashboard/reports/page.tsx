'use client';

import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

export default function ReportsPage() {
  const { data } = useQuery({
    queryKey: ['reports'],
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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Relatórios</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card label="Receitas" value={formatCurrency(totalInc)} />
        <Card label="Despesas" value={formatCurrency(totalExp)} />
        <Card label="Resultado" value={formatCurrency(totalInc - totalExp)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Receitas por categoria</h2>
          <List data={data?.inc?.byCategory || []} />
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Despesas por categoria</h2>
          <List data={data?.exp?.byCategory || []} />
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function List({ data }: { data: any[] }) {
  return (
    <div className="space-y-2">
      {data.map((row: any, i: number) => (
        <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
          <span>{row.category || 'Outros'}</span>
          <span className="font-medium">{formatCurrency(row.total || 0)}</span>
        </div>
      ))}
      {(!data || data.length === 0) && (
        <p className="text-text-secondary">Sem dados para o período.</p>
      )}
    </div>
  );
}
