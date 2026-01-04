'use client';

import { EmptyState, LoadingSpinner, PageHeader } from '@/components/ui';
import api from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';

export default function StaffListPage() {
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const res = await api.get('/barbers');
      return res.data || [];
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/barbers/${id}`);
    },
    onSuccess: () => {
      toast.success('Colaborador removido com sucesso!');
      qc.invalidateQueries({ queryKey: ['barbers'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao remover'),
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Equipe"
        description={`${data?.length || 0} colaboradores ativos`}
        backHref="/dashboard/admin"
        action={
          <div className="flex gap-2">
            <button onClick={() => refetch()} className="btn btn-secondary">
              🔄 Atualizar
            </button>
            <Link href="/dashboard/admin/staff/new" className="btn btn-primary">
              <span>+</span> Novo Colaborador
            </Link>
          </div>
        }
      />

      {(!data || data.length === 0) ? (
        <div className="card">
          <EmptyState
            icon="👤"
            title="Nenhum colaborador cadastrado"
            description="Adicione barbeiros e profissionais para gerenciar a agenda"
            action={
              <Link href="/dashboard/admin/staff/new" className="btn btn-primary">
                Adicionar Primeiro Colaborador
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((barber: any) => (
            <BarberCard
              key={barber.id}
              barber={barber}
              onRemove={() => removeMutation.mutate(barber.id)}
              isRemoving={removeMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BarberCard({ 
  barber, 
  onRemove, 
  isRemoving 
}: { 
  barber: any; 
  onRemove: () => void; 
  isRemoving: boolean;
}) {
  const name = barber?.user?.name || barber?.name || 'Colaborador';
  const commissionRate = Math.round((barber?.commissionRate ?? 0) * 100);
  const specialties = barber?.specialties || [];
  const workingHours = barber?.workingHours || 'Horário não definido';

  return (
    <div className="card card-hover">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl border-2 border-primary/20">
          ✂️
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate">{name}</h3>
          <p className="text-sm text-text-secondary truncate">{workingHours}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <p className="text-xs text-text-secondary uppercase tracking-wide">Comissão</p>
          <p className="text-2xl font-bold text-primary">{commissionRate}%</p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <p className="text-xs text-text-secondary uppercase tracking-wide">Especialidades</p>
          <p className="text-2xl font-bold">{specialties.length}</p>
        </div>
      </div>

      {/* Specialties */}
      {specialties.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {specialties.slice(0, 3).map((spec: string, i: number) => (
            <span key={i} className="badge badge-primary">{spec}</span>
          ))}
          {specialties.length > 3 && (
            <span className="badge">+{specialties.length - 3}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <Link 
          href={`/dashboard/admin/staff/${barber.id}/edit`} 
          className="btn btn-secondary flex-1"
        >
          ✏️ Editar
        </Link>
        <button 
          onClick={onRemove} 
          disabled={isRemoving}
          className="btn btn-danger"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
