'use client';

import api from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewStaffPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    userId: '',
    commission: 0,
    specialties: '' as any,
    workingHours: '',
  });

  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '' });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data || [];
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post('/barbers', {
        userId: form.userId,
        commission: Number(form.commission) || 0,
        specialties: (form.specialties || '')
          .toString()
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean),
        // workingHours não é persistido no schema; ignorado
      });
    },
    onSuccess: () => {
      toast.success('Colaborador criado');
      router.replace('/dashboard/admin/staff');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao salvar'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Novo colaborador</h1>
        <a href="/dashboard/admin/staff" className="btn btn-secondary">Voltar</a>
      </div>
      <div className="card space-y-4">
        <div>
          <label className="label">Usuário</label>
          <select className="input" value={form.userId} onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}>
            <option value="">Selecione</option>
            {(users || []).map((u: any) => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
          <div className="mt-3">
            <button type="button" className="btn btn-secondary" onClick={() => setCreateUserOpen((v) => !v)}>
              {createUserOpen ? 'Cancelar novo usuário' : 'Criar novo usuário'}
            </button>
          </div>
        </div>

        {createUserOpen && (
          <div className="p-4 bg-secondary rounded-lg space-y-3 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nome</label>
                <input className="input" value={newUser.name} onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Telefone</label>
                <input className="input" value={newUser.phone} onChange={(e) => setNewUser((u) => ({ ...u, phone: e.target.value }))} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={newUser.email} onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))} />
              </div>
              <div>
                <label className="label">Senha</label>
                <input className="input" type="password" value={newUser.password} onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))} />
              </div>
            </div>
            <CreateUserInline onCreated={(u) => {
              // seleciona o usuário recém-criado
              setForm((f) => ({ ...f, userId: u.id }));
              setCreateUserOpen(false);
            }} payload={newUser} />
          </div>
        </div>
        <div>
          <label className="label">Comissão (%)</label>
          <input className="input" type="number" min={0} max={100}
                 value={form.commission}
                 onChange={(e) => setForm((f) => ({ ...f, commission: Number(e.target.value) }))} />
        </div>
        <div>
          <label className="label">Especialidades (separadas por vírgula)</label>
          <input className="input"
                 value={form.specialties}
                 onChange={(e) => setForm((f) => ({ ...f, specialties: e.target.value }))} />
        </div>
        <div>
          <label className="label">Horário de trabalho</label>
          <input className="input"
                 placeholder="Seg-Sex 09:00-18:00"
                 value={form.workingHours}
                 onChange={(e) => setForm((f) => ({ ...f, workingHours: e.target.value }))} />
        </div>
        <button className="btn btn-primary" onClick={() => mutation.mutate()} disabled={!form.userId}>
          Salvar
        </button>
      </div>
    </div>
  );
}

function CreateUserInline({ payload, onCreated }: { payload: { name: string; email: string; phone: string; password: string }; onCreated: (u: any) => void }) {
  const createUser = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/register', payload);
      return res.data?.user;
    },
    onSuccess: (user) => {
      toast.success('Usuário criado');
      onCreated(user);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao criar usuário'),
  });

  return (
    <button className="btn btn-primary" onClick={() => createUser.mutate()} disabled={!payload.name || !payload.email || !payload.password}>
      Salvar usuário e usar no colaborador
    </button>
  );
}
