'use client';

import api from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export default function ServicesListPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await api.get('/services');
      return res.data || [];
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/services/${id}`);
    },
    onSuccess: () => {
      toast.success('Serviço removido');
      qc.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao remover'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Serviços</h1>
        <Link href="/dashboard/admin/services/new" className="btn btn-primary">Novo serviço</Link>
      </div>

      <div className="card">
        {isLoading ? (
          <p className="text-text-secondary">Carregando...</p>
        ) : (
          <div className="space-y-2">
            {(data || []).map((s: any) => (
              <div key={s.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center p-3 bg-secondary rounded-lg">
                <div className="md:col-span-2">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-text-secondary">{s.description || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Preço</p>
                  <p className="font-semibold">{formatCurrency(s.price || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Duração</p>
                  <p className="font-semibold">{s.duration} min</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Link href={`/dashboard/admin/services/${s.id}/edit`} className="btn btn-secondary">Editar</Link>
                  <button onClick={() => removeMutation.mutate(s.id)} className="btn btn-danger">Remover</button>
                </div>
              </div>
            ))}
            {(!data || data.length === 0) && (
              <p className="text-text-secondary">Nenhum serviço cadastrado.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
