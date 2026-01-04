"use client";

import TimeClockPicker from "@/components/TimeClockPicker";
import { ChipSelect, LoadingSpinner, PageHeader, Section } from "@/components/ui";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// Gera os próximos 14 dias para seleção
function getNextDays(count: number) {
  const days = [];
  const today = new Date();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      value: date.toISOString().slice(0, 10),
      label: `${weekDays[date.getDay()]} ${date.getDate()}/${months[date.getMonth()]}`,
      isToday: i === 0,
    });
  }
  return days;
}

export default function NewSchedulePage() {
  const router = useRouter();
  const [time, setTime] = useState<{ hours: number; minutes: number }>({ hours: 9, minutes: 0 });
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [barberId, setBarberId] = useState<string>("");

  const { data: barbers, isLoading } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const res = await api.get('/barbers');
      return res.data || [];
    },
  });

  const nextDays = getNextDays(14);
  const barberOptions = (barbers || []).map((b: any) => ({
    value: b.id,
    label: b?.user?.name || b.name || 'Barbeiro',
  }));

  const handleSave = async () => {
    if (!barberId) {
      toast.error('Selecione um colaborador');
      return;
    }

    const scheduledAt = new Date(date);
    scheduledAt.setHours(time.hours, time.minutes, 0, 0);

    try {
      // TODO: Integrar com endpoint real de agenda
      console.log({ barberId, scheduledAt });
      toast.success('Horário criado com sucesso!');
      router.push("/dashboard/admin");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao salvar');
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  const selectedDay = nextDays.find(d => d.value === date);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Novo Horário"
        description="Configure um horário disponível para agendamentos"
        backHref="/dashboard/admin"
      />

      <div className="card space-y-8">
        {/* Colaborador */}
        <Section 
          title="👤 Colaborador" 
          description="Selecione para quem é este horário"
        >
          {barberOptions.length > 0 ? (
            <ChipSelect
              options={barberOptions}
              selected={barberId ? [barberId] : []}
              onChange={(ids) => setBarberId(ids[0] || '')}
            />
          ) : (
            <div className="bg-secondary/50 rounded-xl p-4 text-center text-text-secondary">
              <p>Nenhum colaborador cadastrado</p>
              <a href="/dashboard/admin/staff/new" className="text-primary hover:underline text-sm">
                + Adicionar colaborador
              </a>
            </div>
          )}
        </Section>

        {/* Data */}
        <Section 
          title="📅 Data" 
          description="Selecione o dia para o horário"
        >
          <div className="grid grid-cols-7 gap-2">
            {nextDays.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => setDate(day.value)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  date === day.value
                    ? 'border-primary bg-primary text-background font-bold'
                    : day.isToday
                    ? 'border-primary/50 bg-primary/10 hover:border-primary'
                    : 'border-secondary hover:border-primary/50'
                }`}
              >
                <div className="text-xs opacity-70">{day.label.split(' ')[0]}</div>
                <div className="text-lg font-semibold">{day.label.split(' ')[1]}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* Horário */}
        <Section 
          title="⏰ Horário" 
          description="Selecione o horário de início"
        >
          <div className="flex justify-center">
            <div className="bg-secondary/30 rounded-2xl p-6">
              <TimeClockPicker stepMinutes={15} value={time} onChange={setTime} size={220} />
            </div>
          </div>
        </Section>

        {/* Resumo */}
        <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
          <p className="text-center">
            <span className="font-semibold text-primary">📋 Resumo:</span>{' '}
            {barberId ? barberOptions.find(b => b.value === barberId)?.label : 'Nenhum colaborador'} •{' '}
            {selectedDay?.label || date} •{' '}
            {String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}
          </p>
        </div>

        {/* Ações */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <button 
            className="btn btn-secondary flex-1"
            onClick={() => router.back()}
          >
            Cancelar
          </button>
          <button 
            className="btn btn-primary btn-lg flex-1"
            onClick={handleSave}
            disabled={!barberId}
          >
            ✅ Salvar Horário
          </button>
        </div>
      </div>
    </div>
  );
}
