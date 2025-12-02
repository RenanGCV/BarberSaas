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

  // Buscar apenas usuários disponíveis (que não são barbeiros ainda)
  const { data: users, refetch: refetchUsers } = useQuery({
    queryKey: ['users', 'availableForBarber'],
    queryFn: async () => {
      const res = await api.get('/users?availableForBarber=true');
      return res.data || [];
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (payload: typeof newUser) => {
      const res = await api.post('/auth/register', payload);
      return res.data?.user;
    },
    onSuccess: (user) => {
      toast.success('Usuário criado com sucesso!');
      // Atualizar lista de usuários disponíveis
      refetchUsers();
      // Selecionar o usuário recém-criado
      setForm((f) => ({ ...f, userId: user.id }));
      // Fechar formulário de criação
      setCreateUserOpen(false);
      setNewUser({ name: '', email: '', phone: '', password: '' });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao criar usuário'),
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
      });
    },
    onSuccess: () => {
      toast.success('Colaborador criado com sucesso!');
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
          <select 
            className="input" 
            value={form.userId} 
            onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
            disabled={createUserOpen}
          >
            <option value="">Selecione um usuário existente</option>
            {(users || []).map((u: any) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email}) {u.role !== 'CUSTOMER' && `- ${u.role}`}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-400 mt-1">
            Apenas usuários que ainda não são colaboradores aparecem nesta lista
          </p>
          <div className="mt-3">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => {
                setCreateUserOpen((v) => !v);
                if (!createUserOpen) {
                  setForm((f) => ({ ...f, userId: '' }));
                }
              }}
            >
              {createUserOpen ? '✕ Cancelar novo usuário' : '+ Criar novo usuário'}
            </button>
          </div>
        </div>

        {createUserOpen && (
          <div className="p-4 bg-secondary rounded-lg space-y-3 animate-slide-up border-2 border-primary/20">
            <h3 className="font-semibold text-primary">Criar novo usuário</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nome completo *</label>
                <input 
                  className="input" 
                  value={newUser.name} 
                  onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))}
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <label className="label">Telefone</label>
                <input 
                  className="input" 
                  value={newUser.phone} 
                  onChange={(e) => setNewUser((u) => ({ ...u, phone: e.target.value }))}
                  placeholder="(11) 98765-4321"
                />
              </div>
              <div>
                <label className="label">Email *</label>
                <input 
                  className="input" 
                  type="email" 
                  value={newUser.email} 
                  onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
                  placeholder="joao@exemplo.com"
                />
              </div>
              <div>
                <label className="label">Senha *</label>
                <input 
                  className="input" 
                  type="password" 
                  value={newUser.password} 
                  onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>
            <button 
              className="btn btn-primary w-full" 
              onClick={() => createUserMutation.mutate(newUser)} 
              disabled={!newUser.name || !newUser.email || !newUser.password || createUserMutation.isPending}
            >
              {createUserMutation.isPending ? '⏳ Criando...' : '✓ Criar e usar este usuário'}
            </button>
          </div>
        )}

        <div>
          <label className="label">Comissão (%)</label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[30, 40, 50, 60].map(value => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, commission: value }))}
                className={`p-2 rounded-lg border-2 transition-all ${
                  form.commission === value
                    ? 'border-primary bg-primary text-background font-bold'
                    : 'border-secondary hover:border-primary/50'
                }`}
              >
                {value}%
              </button>
            ))}
          </div>
          <input className="input" type="number" min={0} max={100}
                 value={form.commission}
                 onChange={(e) => setForm((f) => ({ ...f, commission: Number(e.target.value) }))} 
                 placeholder="Ou insira um valor personalizado"
          />
          <p className="text-sm text-gray-400 mt-1">
            Percentual que o colaborador receberá por serviço realizado
          </p>
        </div>
        <div>
          <label className="label">Especialidades</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            {['Corte Clássico', 'Corte Moderno', 'Degradê', 'Barba', 'Sobrancelha', 'Relaxamento'].map(spec => {
              const isSelected = form.specialties.toString().split(',').map((s: string) => s.trim()).includes(spec);
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => {
                    const current = form.specialties.toString().split(',').map((s: string) => s.trim()).filter(Boolean);
                    if (isSelected) {
                      setForm((f) => ({ ...f, specialties: current.filter(s => s !== spec).join(', ') }));
                    } else {
                      setForm((f) => ({ ...f, specialties: [...current, spec].join(', ') }));
                    }
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-sm ${
                    isSelected
                      ? 'border-primary bg-primary/10 font-semibold'
                      : 'border-secondary hover:border-primary/50'
                  }`}
                >
                  {isSelected && '✓ '}{spec}
                </button>
              );
            })}
          </div>
          <input className="input"
                 value={form.specialties}
                 onChange={(e) => setForm((f) => ({ ...f, specialties: e.target.value }))}
                 placeholder="Ou adicione manualmente (separadas por vírgula)" 
          />
        </div>
        <div>
          <label className="label">Horário de trabalho</label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              { label: 'Seg-Sex 9h-18h', value: 'Segunda a Sexta: 09:00-18:00' },
              { label: 'Seg-Sáb 9h-18h', value: 'Segunda a Sábado: 09:00-18:00' },
              { label: 'Seg-Sex 10h-20h', value: 'Segunda a Sexta: 10:00-20:00' },
              { label: 'Seg-Sáb 10h-20h', value: 'Segunda a Sábado: 10:00-20:00' },
            ].map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, workingHours: option.value }))}
                className={`p-3 rounded-lg border-2 transition-all text-sm ${
                  form.workingHours === option.value
                    ? 'border-primary bg-primary/10 font-semibold'
                    : 'border-secondary hover:border-primary/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <input className="input"
                 placeholder="Ou insira um horário personalizado"
                 value={form.workingHours}
                 onChange={(e) => setForm((f) => ({ ...f, workingHours: e.target.value }))} />
          <p className="text-sm text-gray-400 mt-1">
            Informação ilustrativa (não afeta o sistema de agendamentos)
          </p>
        </div>
        <button 
          className="btn btn-primary w-full" 
          onClick={() => mutation.mutate()} 
          disabled={!form.userId || mutation.isPending}
        >
          {mutation.isPending ? '⏳ Salvando...' : '✓ Salvar colaborador'}
        </button>
      </div>
    </div>
  );
}
