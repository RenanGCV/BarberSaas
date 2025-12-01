'use client';

import api from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewServicePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '', price: 0, duration: 30, barberIds: [] as string[] });

  const { data: barbers } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const res = await api.get('/barbers');
      return res.data || [];
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post('/services', form);
    },
    onSuccess: () => {
      toast.success('Serviço criado');
      router.replace('/dashboard/admin/services');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao salvar'),
  });

  const toggleBarber = (id: string) => {
    setForm((f) => ({
      ...f,
      barberIds: f.barberIds.includes(id) ? f.barberIds.filter((b) => b !== id) : [...f.barberIds, id],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Novo serviço</h1>
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
