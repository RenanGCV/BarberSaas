'use client';

import api from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '', price: 0, duration: 30, barberIds: [] as string[] });

  const { data: service } = useQuery({
    queryKey: ['service', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/services/${id}`);
      return res.data;
    },
  });
  const { data: barbers } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const res = await api.get('/barbers');
      return res.data || [];
    },
  });

  useEffect(() => {
    if (service) {
      setForm({
        name: service.name || '',
        description: service.description || '',
        price: service.price || 0,
        duration: service.duration || 30,
        barberIds: (service.barbers || []).map((x: any) => x?.barberId || x?.id).filter(Boolean),
      });
    }
  }, [service]);

  const toggleBarber = (bid: string) => {
    setForm((f) => ({
      ...f,
      barberIds: f.barberIds.includes(bid) ? f.barberIds.filter((b) => b !== bid) : [...f.barberIds, bid],
    }));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      await api.put(`/services/${id}`, form);
    },
    onSuccess: () => {
      toast.success('Serviço atualizado');
      router.replace('/dashboard/admin/services');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao salvar'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar serviço</h1>
        <a href="/dashboard/admin/services" className="btn btn-secondary">Voltar</a>
      </div>
      <div className="card space-y-4">
        <div>
          <label className="label">Nome</label>
          <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className="label">Descrição</label>
          <input className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Preço</label>
            <input className="input" type="number" min={0} step={0.01}
                   value={form.price}
                   onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="label">Duração (min)</label>
            <input className="input" type="number" min={5} step={5}
                   value={form.duration}
                   onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))} />
          </div>
        </div>
        <div>
          <label className="label">Barbeiros habilitados</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {(barbers || []).map((b: any) => (
              <button type="button" key={b.id}
                      onClick={() => toggleBarber(b.id)}
                      className={`px-3 py-2 rounded-lg border ${form.barberIds.includes(b.id) ? 'bg-primary text-black' : 'bg-secondary'}`}>
                {b?.user?.name || b.name}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => mutation.mutate()} disabled={!form.name || !form.duration}>
          Salvar
        </button>
      </div>
    </div>
  );
}
