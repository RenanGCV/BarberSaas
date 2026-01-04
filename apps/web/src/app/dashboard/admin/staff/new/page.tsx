'use client';

import TimeClockPicker from '@/components/TimeClockPicker';
import { ButtonSelect, ChipSelect, PageHeader, PercentageInput, Section } from '@/components/ui';
import api from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const SPECIALTIES = [
  { value: 'Corte Clássico', label: '✂️ Corte Clássico' },
  { value: 'Corte Moderno', label: '💇 Corte Moderno' },
  { value: 'Degradê', label: '📐 Degradê' },
  { value: 'Barba', label: '🧔 Barba' },
  { value: 'Sobrancelha', label: '👁️ Sobrancelha' },
  { value: 'Relaxamento', label: '💆 Relaxamento' },
  { value: 'Coloração', label: '🎨 Coloração' },
  { value: 'Platinado', label: '⭐ Platinado' },
];

const WORK_DAYS = [
  { value: 'Domingo', label: 'Dom' },
  { value: 'Segunda', label: 'Seg' },
  { value: 'Terça', label: 'Ter' },
  { value: 'Quarta', label: 'Qua' },
  { value: 'Quinta', label: 'Qui' },
  { value: 'Sexta', label: 'Sex' },
  { value: 'Sábado', label: 'Sáb' },
];

export default function NewStaffPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    commission: 50,
    specialties: [] as string[],
  });

  const [startTime, setStartTime] = useState({ hours: 9, minutes: 0 });
  const [endTime, setEndTime] = useState({ hours: 18, minutes: 0 });
  const [workDays, setWorkDays] = useState<string[]>(['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']);
  const [hasLunch, setHasLunch] = useState(true);
  const [lunchStart, setLunchStart] = useState({ hours: 12, minutes: 0 });
  const [lunchEnd, setLunchEnd] = useState({ hours: 13, minutes: 0 });

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
      let workingHours = `${workDays.join(', ')}: ${String(startTime.hours).padStart(2, '0')}:${String(startTime.minutes).padStart(2, '0')}-${String(endTime.hours).padStart(2, '0')}:${String(endTime.minutes).padStart(2, '0')}`;
      
      // Adicionar horário de almoço se habilitado
      if (hasLunch) {
        workingHours += ` (Almoço: ${String(lunchStart.hours).padStart(2, '0')}:${String(lunchStart.minutes).padStart(2, '0')}-${String(lunchEnd.hours).padStart(2, '0')}:${String(lunchEnd.minutes).padStart(2, '0')})`;
      }
      
      await api.post('/barbers', {
        userId,
        commission: Number(form.commission) || 0,
        specialties: form.specialties,
        workingHours,
      });
    },
    onSuccess: () => {
      toast.success('Colaborador criado com sucesso!');
      router.replace('/dashboard/admin/staff');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao criar colaborador'),
  });

  const isValid = form.name && form.email && form.phone && form.password && form.password.length >= 6;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Novo Colaborador"
        description="Cadastre um novo profissional na equipe"
        backHref="/dashboard/admin/staff"
      />

      <div className="card space-y-8">
        {/* Dados Pessoais */}
        <Section 
          title="👤 Dados do Colaborador" 
          description="Informações básicas para criar a conta"
        >
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
        </Section>

        {/* Comissão */}
        <PercentageInput
          label="💰 Comissão"
          description="Percentual que o colaborador receberá por serviço realizado"
          value={form.commission}
          onChange={(commission) => setForm((f) => ({ ...f, commission }))}
          presets={[30, 40, 50, 60, 70]}
        />

        {/* Especialidades */}
        <Section 
          title="⭐ Especialidades" 
          description="Selecione os serviços que o profissional domina"
        >
          <ChipSelect
            options={SPECIALTIES}
            selected={form.specialties}
            onChange={(specialties) => setForm((f) => ({ ...f, specialties }))}
            allowCustom
          />
        </Section>

        {/* Horário de Trabalho */}
        <Section 
          title="📅 Horário de Trabalho" 
          description="Configure os dias e horários de expediente"
        >
          <div className="space-y-6">
            {/* Dias da Semana */}
            <div>
              <p className="text-sm text-text-secondary mb-3">Dias de trabalho:</p>
              <div className="grid grid-cols-7 gap-2">
                {WORK_DAYS.map(day => {
                  const isSelected = workDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setWorkDays(workDays.filter(d => d !== day.value));
                        } else {
                          setWorkDays([...workDays, day.value]);
                        }
                      }}
                      className={`p-3 rounded-xl border-2 transition-all text-sm font-semibold ${
                        isSelected
                          ? 'border-primary bg-primary text-background'
                          : 'border-secondary hover:border-primary/50 text-text-secondary'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Horários */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-secondary/30 rounded-xl p-4">
                <p className="text-sm text-text-secondary mb-3 text-center">🌅 Horário de início</p>
                <TimeClockPicker stepMinutes={15} value={startTime} onChange={setStartTime} size={200} />
              </div>
              <div className="bg-secondary/30 rounded-xl p-4">
                <p className="text-sm text-text-secondary mb-3 text-center">🌇 Horário de término</p>
                <TimeClockPicker stepMinutes={15} value={endTime} onChange={setEndTime} size={200} />
              </div>
            </div>

            {/* Horário de Almoço */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🍽️</span>
                  <div>
                    <p className="font-medium text-text-primary">Horário de Almoço</p>
                    <p className="text-sm text-text-secondary">Bloquear horário para intervalo</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHasLunch(!hasLunch)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    hasLunch ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                      hasLunch ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {hasLunch && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <p className="text-sm text-text-secondary mb-3 text-center">🕐 Início do Almoço</p>
                    <TimeClockPicker stepMinutes={15} value={lunchStart} onChange={setLunchStart} size={200} />
                  </div>
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <p className="text-sm text-text-secondary mb-3 text-center">🕐 Fim do Almoço</p>
                    <TimeClockPicker stepMinutes={15} value={lunchEnd} onChange={setLunchEnd} size={200} />
                  </div>
                </div>
              )}
            </div>

            {/* Resumo */}
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
              <p className="text-sm">
                <span className="font-semibold text-primary">📋 Resumo:</span>{' '}
                {workDays.length > 0 ? workDays.join(', ') : 'Nenhum dia selecionado'} •{' '}
                {String(startTime.hours).padStart(2, '0')}:{String(startTime.minutes).padStart(2, '0')} às{' '}
                {String(endTime.hours).padStart(2, '0')}:{String(endTime.minutes).padStart(2, '0')}
                {hasLunch && (
                  <span className="text-text-secondary">
                    {' '}• Almoço: {String(lunchStart.hours).padStart(2, '0')}:{String(lunchStart.minutes).padStart(2, '0')}-
                    {String(lunchEnd.hours).padStart(2, '0')}:{String(lunchEnd.minutes).padStart(2, '0')}
                  </span>
                )}
              </p>
            </div>
          </div>
        </Section>

        {/* Ação */}
        <div className="border-t border-border pt-6">
          <button 
            className="btn btn-primary btn-lg w-full" 
            onClick={() => mutation.mutate()} 
            disabled={!isValid || mutation.isPending}
          >
            {mutation.isPending ? '⏳ Criando colaborador...' : '✅ Criar Colaborador'}
          </button>
          {!isValid && (
            <p className="text-sm text-text-secondary text-center mt-3">
              Preencha todos os campos obrigatórios (*)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
