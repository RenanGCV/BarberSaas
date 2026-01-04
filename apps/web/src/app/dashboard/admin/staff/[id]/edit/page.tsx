'use client';

import TimeClockPicker from '@/components/TimeClockPicker';
import { ChipSelect, LoadingSpinner, PageHeader, PercentageInput, Section } from '@/components/ui';
import api from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

function parseWorkingHours(workingHours: string) {
  // Formato esperado: "Segunda, Terça, Quarta: 09:00-18:00" ou similar
  const defaultResult = {
    workDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    startTime: { hours: 9, minutes: 0 },
    endTime: { hours: 18, minutes: 0 },
    hasLunch: false,
    lunchStart: { hours: 12, minutes: 0 },
    lunchEnd: { hours: 13, minutes: 0 },
  };

  if (!workingHours) return defaultResult;

  try {
    // Tenta extrair dias e horários
    const colonIndex = workingHours.lastIndexOf(':');
    if (colonIndex > 0) {
      const daysPart = workingHours.substring(0, colonIndex - 2).trim();
      const hoursPart = workingHours.substring(colonIndex - 2).trim();
      
      // Parse days
      const days = daysPart.split(',').map(d => d.trim()).filter(Boolean);
      if (days.length > 0) {
        defaultResult.workDays = days;
      }

      // Parse hours (formato: "09:00-18:00")
      const hoursMatch = hoursPart.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/);
      if (hoursMatch) {
        defaultResult.startTime = { hours: parseInt(hoursMatch[1]), minutes: parseInt(hoursMatch[2]) };
        defaultResult.endTime = { hours: parseInt(hoursMatch[3]), minutes: parseInt(hoursMatch[4]) };
      }
    }
  } catch (e) {
    console.error('Error parsing working hours:', e);
  }

  return defaultResult;
}

export default function EditStaffPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const [commission, setCommission] = useState(0);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [workDays, setWorkDays] = useState<string[]>(['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']);
  const [startTime, setStartTime] = useState({ hours: 9, minutes: 0 });
  const [endTime, setEndTime] = useState({ hours: 18, minutes: 0 });
  const [hasLunch, setHasLunch] = useState(false);
  const [lunchStart, setLunchStart] = useState({ hours: 12, minutes: 0 });
  const [lunchEnd, setLunchEnd] = useState({ hours: 13, minutes: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ['barber', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/barbers/${id}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (data) {
      // Comissão - converter de decimal (0.5) para percentual (50)
      const commissionValue = data.commissionRate ?? data.commission ?? 0;
      setCommission(commissionValue <= 1 ? commissionValue * 100 : commissionValue);
      
      // Especialidades
      setSpecialties(data.specialties || []);
      
      // Horário de trabalho
      const parsed = parseWorkingHours(data.workingHours || '');
      setWorkDays(parsed.workDays);
      setStartTime(parsed.startTime);
      setEndTime(parsed.endTime);
      setHasLunch(parsed.hasLunch);
      setLunchStart(parsed.lunchStart);
      setLunchEnd(parsed.lunchEnd);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async () => {
      // Formatar horário de trabalho
      const workingHours = `${workDays.join(', ')}: ${String(startTime.hours).padStart(2, '0')}:${String(startTime.minutes).padStart(2, '0')}-${String(endTime.hours).padStart(2, '0')}:${String(endTime.minutes).padStart(2, '0')}${hasLunch ? ` (Almoço: ${String(lunchStart.hours).padStart(2, '0')}:${String(lunchStart.minutes).padStart(2, '0')}-${String(lunchEnd.hours).padStart(2, '0')}:${String(lunchEnd.minutes).padStart(2, '0')})` : ''}`;

      await api.put(`/barbers/${id}`, {
        commissionRate: commission / 100, // Enviar como decimal
        specialties,
        workingHours,
      });
    },
    onSuccess: () => {
      toast.success('Colaborador atualizado com sucesso!');
      router.replace('/dashboard/admin/staff');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao salvar'),
  });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  const barberName = data?.user?.name || data?.name || 'Colaborador';

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`Editar ${barberName}`}
        description="Atualize as informações do colaborador"
        backHref="/dashboard/admin/staff"
      />

      <div className="card space-y-8">
        {/* Comissão */}
        <PercentageInput
          label="💰 Comissão"
          description="Percentual que o colaborador receberá por serviço realizado"
          value={commission}
          onChange={setCommission}
          presets={[30, 40, 50, 60, 70]}
        />

        {/* Especialidades */}
        <Section 
          title="⭐ Especialidades" 
          description="Selecione os serviços que o profissional domina"
        >
          <ChipSelect
            options={SPECIALTIES}
            selected={specialties}
            onChange={setSpecialties}
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

            {/* Horários de Entrada e Saída */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-secondary/30 rounded-xl p-4">
                <p className="text-sm text-text-secondary mb-3 text-center">🌅 Horário de Entrada</p>
                <TimeClockPicker stepMinutes={15} value={startTime} onChange={setStartTime} size={180} />
              </div>
              <div className="bg-secondary/30 rounded-xl p-4">
                <p className="text-sm text-text-secondary mb-3 text-center">🌇 Horário de Saída</p>
                <TimeClockPicker stepMinutes={15} value={endTime} onChange={setEndTime} size={180} />
              </div>
            </div>

            {/* Opção de Almoço */}
            <div className="border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setHasLunch(!hasLunch)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all w-full ${
                  hasLunch 
                    ? 'border-primary bg-primary/10' 
                    : 'border-secondary hover:border-primary/50'
                }`}
              >
                <span className="text-2xl">🍽️</span>
                <div className="text-left flex-1">
                  <p className="font-semibold">Intervalo para Almoço</p>
                  <p className="text-sm text-text-secondary">Opcional - defina horário de pausa</p>
                </div>
                <span className={`w-12 h-6 rounded-full transition-all relative ${hasLunch ? 'bg-primary' : 'bg-secondary'}`}>
                  <span className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all ${hasLunch ? 'right-0.5' : 'left-0.5'}`} />
                </span>
              </button>

              {hasLunch && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 animate-fade-in">
                  <div className="bg-warning/10 rounded-xl p-4 border border-warning/20">
                    <p className="text-sm text-warning mb-3 text-center">🍴 Início do Almoço</p>
                    <TimeClockPicker stepMinutes={15} value={lunchStart} onChange={setLunchStart} size={160} />
                  </div>
                  <div className="bg-warning/10 rounded-xl p-4 border border-warning/20">
                    <p className="text-sm text-warning mb-3 text-center">☕ Fim do Almoço</p>
                    <TimeClockPicker stepMinutes={15} value={lunchEnd} onChange={setLunchEnd} size={160} />
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
                  <span className="text-warning">
                    {' '}• Almoço: {String(lunchStart.hours).padStart(2, '0')}:{String(lunchStart.minutes).padStart(2, '0')}-{String(lunchEnd.hours).padStart(2, '0')}:{String(lunchEnd.minutes).padStart(2, '0')}
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
            disabled={mutation.isPending}
          >
            {mutation.isPending ? '⏳ Salvando...' : '✅ Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
