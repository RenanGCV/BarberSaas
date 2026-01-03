'use client';

import TimeClockPicker from '@/components/TimeClockPicker';
import api from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewStaffPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    commission: 50,
    specialties: '' as any,
  });

  const [startTime, setStartTime] = useState({ hours: 9, minutes: 0 });
  const [endTime, setEndTime] = useState({ hours: 18, minutes: 0 });
  const [workDays, setWorkDays] = useState<string[]>(['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']);

  const mutation = useMutation({
    mutationFn: async () => {
      // 1. Criar o usuário
      const userRes = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      const userId = userRes.data?.user?.id;

      if (!userId) {
        throw new Error('Erro ao criar usuário');
      }

      // 2. Criar o barbeiro vinculado ao usuário
      const workingHours = `${workDays.join(', ')}: ${String(startTime.hours).padStart(2, '0')}:${String(startTime.minutes).padStart(2, '0')}-${String(endTime.hours).padStart(2, '0')}:${String(endTime.minutes).padStart(2, '0')}`;
      
      await api.post('/barbers', {
        userId,
        commission: Number(form.commission) || 0,
        specialties: (form.specialties || '')
          .toString()
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean),
        workingHours,
      });
    },
    onSuccess: () => {
      toast.success('Colaborador criado com sucesso!');
      router.replace('/dashboard/admin/staff');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao criar colaborador'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Novo Colaborador</h1>
        <a href="/dashboard/admin/staff" className="btn btn-secondary">Voltar</a>
      </div>
      <div className="card space-y-4">
        <div>
          <h3 className="font-semibold text-primary mb-4">Dados do Colaborador</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nome completo *</label>
              <input 
                className="input" 
                value={form.name} 
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex: João Silva"
              />
            </div>
            <div>
              <label className="label">Telefone *</label>
              <input 
                className="input" 
                value={form.phone} 
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="(11) 98765-4321"
              />
            </div>
            <div>
              <label className="label">Email *</label>
              <input 
                className="input" 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="joao@exemplo.com"
              />
            </div>
            <div>
              <label className="label">Senha *</label>
              <input 
                className="input" 
                type="password" 
                value={form.password} 
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>
        </div>

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
          <div className="space-y-4">
            <div>
              <p className="text-sm text-text-secondary mb-2">Dias de trabalho:</p>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(day => {
                  const isSelected = workDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setWorkDays(workDays.filter(d => d !== day));
                        } else {
                          setWorkDays([...workDays, day]);
                        }
                      }}
                      className={`p-2 rounded-lg border-2 transition-all text-xs font-medium ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-secondary hover:border-primary/50 text-text-secondary'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-text-secondary mb-3">Horário de início:</p>
                <TimeClockPicker stepMinutes={15} value={startTime} onChange={setStartTime} size={240} />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-3">Horário de término:</p>
                <TimeClockPicker stepMinutes={15} value={endTime} onChange={setEndTime} size={240} />
              </div>
            </div>

            <div className="p-3 bg-surface rounded-lg border border-secondary">
              <p className="text-sm text-text-primary">
                <strong>Resumo:</strong> {workDays.length > 0 ? workDays.join(', ') : 'Nenhum dia selecionado'} • {String(startTime.hours).padStart(2, '0')}:{String(startTime.minutes).padStart(2, '0')} às {String(endTime.hours).padStart(2, '0')}:{String(endTime.minutes).padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>
        <button 
          className="btn btn-primary w-full" 
          onClick={() => mutation.mutate()} 
          disabled={!form.name || !form.email || !form.phone || !form.password || mutation.isPending}
        >
          {mutation.isPending ? '⏳ Criando colaborador...' : '✓ Criar Colaborador'}
        </button>
      </div>
    </div>
  );
}
