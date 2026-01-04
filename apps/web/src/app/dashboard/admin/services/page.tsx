'use client';

import { EmptyState, LoadingSpinner, PageHeader, Section } from '@/components/ui';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';

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
      toast.success('Serviço removido com sucesso!');
      qc.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao remover'),
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Serviços"
        description={`${data?.length || 0} serviços cadastrados`}
        backHref="/dashboard/admin"
        action={
          <Link href="/dashboard/admin/services/new" className="btn btn-primary">
            <span>+</span> Novo Serviço
          </Link>
        }
      />

      {(!data || data.length === 0) ? (
        <div className="card">
          <EmptyState
            icon="💇"
            title="Nenhum serviço cadastrado"
            description="Crie seu primeiro serviço para começar a receber agendamentos"
            action={
              <Link href="/dashboard/admin/services/new" className="btn btn-primary">
                Criar Primeiro Serviço
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4">
          {data.map((service: any) => (
            <ServiceCard
              key={service.id}
              service={service}
              onRemove={() => removeMutation.mutate(service.id)}
              isRemoving={removeMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceCard({ 
  service, 
  onRemove, 
  isRemoving 
}: { 
  service: any; 
  onRemove: () => void; 
  isRemoving: boolean;
}) {
  return (
    <div className="card card-hover">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
              ✂️
            </div>
            <div>
              <h3 className="font-semibold text-lg">{service.name}</h3>
              <p className="text-sm text-text-secondary">
                {service.description || 'Sem descrição'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs text-text-secondary uppercase tracking-wide">Preço</p>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(service.price || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-secondary uppercase tracking-wide">Duração</p>
            <p className="text-xl font-bold">
              {service.duration}<span className="text-sm text-text-secondary">min</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link 
            href={`/dashboard/admin/services/${service.id}/edit`} 
            className="btn btn-secondary"
          >
            ✏️ Editar
          </Link>
          <button 
            onClick={onRemove} 
            disabled={isRemoving}
            className="btn btn-danger"
          >
            🗑️ Remover
          </button>
        </div>
      </div>
    </div>
  );
}
