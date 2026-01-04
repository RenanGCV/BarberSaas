'use client';

import { ButtonSelect, ChipSelect, DurationInput, PageHeader, PriceInput, Section } from '@/components/ui';
import api from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const SERVICE_NAMES = [
  { value: 'Corte Simples', label: '✂️ Corte Simples' },
  { value: 'Corte + Barba', label: '✂️🧔 Corte + Barba' },
  { value: 'Barba', label: '🧔 Barba' },
  { value: 'Degradê', label: '💇 Degradê' },
  { value: 'Sobrancelha', label: '👁️ Sobrancelha' },
  { value: 'Relaxamento', label: '💆 Relaxamento' },
  { value: 'Corte Premium', label: '⭐ Corte Premium' },
  { value: 'Pacote Completo', label: '🎁 Pacote Completo' },
];

export default function NewServicePage() {
  const router = useRouter();
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    price: 45, 
    duration: 30, 
    barberIds: [] as string[] 
  });

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
      toast.success('Serviço criado com sucesso!');
      router.replace('/dashboard/admin/services');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao salvar'),
  });

  const barberOptions = (barbers || []).map((b: any) => ({
    value: b.id,
    label: b?.user?.name || b.name || 'Barbeiro',
  }));

  const isValid = form.name.trim() && form.duration > 0 && form.price >= 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Novo Serviço"
        description="Configure os detalhes do serviço oferecido"
        backHref="/dashboard/admin/services"
      />

      <div className="card space-y-8">
        {/* Nome do Serviço */}
        <Section 
          title="Nome do Serviço" 
          description="Escolha um nome padrão ou crie o seu"
        >
          <ButtonSelect
            options={SERVICE_NAMES}
            value={form.name}
            onChange={(name) => setForm((f) => ({ ...f, name }))}
            columns={4}
          />
          <input 
            className="input mt-3" 
            value={form.name} 
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="✏️ Ou digite um nome personalizado..."
          />
        </Section>

        {/* Descrição */}
        <Section title="Descrição" description="Opcional - descreva o que inclui o serviço">
          <textarea 
            className="input min-h-[80px] resize-none" 
            value={form.description} 
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Ex: Corte de cabelo tradicional com acabamento e finalização"
          />
        </Section>

        {/* Preço e Duração */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PriceInput
            label="💰 Preço"
            value={form.price}
            onChange={(price) => setForm((f) => ({ ...f, price }))}
            presets={[30, 45, 60, 80, 100, 150]}
          />
          <DurationInput
            label="⏱️ Duração"
            value={form.duration}
            onChange={(duration) => setForm((f) => ({ ...f, duration }))}
            presets={[15, 30, 45, 60, 90, 120]}
          />
        </div>

        {/* Barbeiros */}
        <Section 
          title="👥 Profissionais Habilitados" 
          description="Selecione quem pode realizar este serviço"
        >
          {barberOptions.length > 0 ? (
            <ChipSelect
              options={barberOptions}
              selected={form.barberIds}
              onChange={(barberIds) => setForm((f) => ({ ...f, barberIds }))}
            />
          ) : (
            <div className="bg-secondary/50 rounded-xl p-4 text-center text-text-secondary">
              <p>Nenhum profissional cadastrado ainda</p>
              <a href="/dashboard/admin/staff/new" className="text-primary hover:underline text-sm">
                + Adicionar profissional
              </a>
            </div>
          )}
        </Section>

        {/* Resumo e Ação */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              {form.name && (
                <p className="text-text-secondary">
                  <span className="font-semibold text-text">{form.name}</span> — R$ {form.price.toFixed(2)} — {form.duration} min
                  {form.barberIds.length > 0 && ` — ${form.barberIds.length} profissional(is)`}
                </p>
              )}
            </div>
            <button 
              className="btn btn-primary btn-lg w-full md:w-auto" 
              onClick={() => mutation.mutate()} 
              disabled={!isValid || mutation.isPending}
            >
              {mutation.isPending ? '⏳ Salvando...' : '✅ Criar Serviço'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
