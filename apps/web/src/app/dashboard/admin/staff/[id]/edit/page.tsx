'use client';

import api from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditStaffPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ commission: 0, specialties: '', workingHours: '' });

  const { data } = useQuery({
    queryKey: ['barber', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/barbers/${id}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (data) {
      setForm({
        commission: data.commission ?? 0,
        specialties: (data.specialties || []).join(', '),
        workingHours: data.workingHours || '',
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async () => {
      await api.put(`/barbers/${id}`, {
        commission: Number(form.commission) || 0,
        specialties: (form.specialties || '').split(',').map((s) => s.trim()).filter(Boolean),
        workingHours: form.workingHours || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Colaborador atualizado');
      router.replace('/dashboard/admin/staff');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao salvar'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar colaborador</h1>
        <a href="/dashboard/admin/staff" className="btn btn-secondary">Voltar</a>
      </div>
      <div className="card space-y-4">
        <div>
          <label className="label">Comissão (%)</label>
          <input className="input" type="number" min={0} max={100}
                 value={form.commission}
                 onChange={(e) => setForm((f) => ({ ...f, commission: Number(e.target.value) }))} />
        </div>
        <div>
          <label className="label">Especialidades (separadas por vírgula)</label>
          <input className="input" value={form.specialties} onChange={(e) => setForm((f) => ({ ...f, specialties: e.target.value }))} />
        </div>
        <div>
          <label className="label">Horário de trabalho</label>
          <input className="input" value={form.workingHours} onChange={(e) => setForm((f) => ({ ...f, workingHours: e.target.value }))} />
        </div>
        <button className="btn btn-primary" onClick={() => mutation.mutate()}>Salvar</button>
      </div>
    </div>
  );
}
