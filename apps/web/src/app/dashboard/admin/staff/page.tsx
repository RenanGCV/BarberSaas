'use client';

import api from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';

export default function StaffListPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const res = await api.get('/barbers');
      return res.data || [];
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/barbers/${id}`);
    },
    onSuccess: () => {
      toast.success('Barbeiro removido');
      qc.invalidateQueries({ queryKey: ['barbers'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao remover'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Colaboradores</h1>
        <Link href="/dashboard/admin/staff/new" className="btn btn-primary">Novo colaborador</Link>
      </div>

      <div className="card">
        {isLoading ? (
          <p className="text-text-secondary">Carregando...</p>
        ) : (
          <div className="space-y-2">
            {(data || []).map((b: any) => (
              <div key={b.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center p-3 bg-secondary rounded-lg">
                <div className="md:col-span-2">
                  <p className="font-medium">{b?.user?.name || b?.name || 'Colaborador'}</p>
                  <p className="text-xs text-text-secondary">{b?.workingHours || 'Horário não definido'}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Comissão</p>
                  <p className="font-semibold">{Math.round(((b?.commissionRate ?? 0) * 100))}%</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Especialidades</p>
                  <p className="text-sm">{(b?.specialties || []).join(', ') || '—'}</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Link href={`/dashboard/admin/staff/${b.id}/edit`} className="btn btn-secondary">Editar</Link>
                  <button onClick={() => removeMutation.mutate(b.id)} className="btn btn-danger">Remover</button>
                </div>
              </div>
            ))}
            {(!data || data.length === 0) && (
              <p className="text-text-secondary">Nenhum colaborador cadastrado.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
