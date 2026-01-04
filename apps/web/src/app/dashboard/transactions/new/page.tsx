'use client';

import { ButtonSelect, PageHeader, PriceInput, Section } from '@/components/ui';
import api from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const INCOME_CATEGORIES = [
  { value: 'Serviços', label: '✂️ Serviços' },
  { value: 'Produtos', label: '🧴 Produtos' },
  { value: 'Comissões', label: '💵 Comissões' },
  { value: 'Gorjetas', label: '💰 Gorjetas' },
  { value: 'Outros', label: '📦 Outros' },
];

const EXPENSE_CATEGORIES = [
  { value: 'Produtos', label: '🧴 Produtos' },
  { value: 'Energia', label: '💡 Energia' },
  { value: 'Água', label: '💧 Água' },
  { value: 'Internet', label: '📶 Internet' },
  { value: 'Aluguel', label: '🏠 Aluguel' },
  { value: 'Salários', label: '👥 Salários' },
  { value: 'Manutenção', label: '🔧 Manutenção' },
  { value: 'Marketing', label: '📣 Marketing' },
  { value: 'Outros', label: '📦 Outros' },
];

const PAYMENT_METHODS = [
  { value: 'CASH', label: '💵 Dinheiro' },
  { value: 'PIX', label: '📱 Pix' },
  { value: 'CREDIT_CARD', label: '💳 Crédito' },
  { value: 'DEBIT_CARD', label: '🏦 Débito' },
];

export default function NewTransactionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    type: 'INCOME',
    amount: 50,
    category: '',
    description: '',
    paymentMethod: 'CASH',
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post('/transactions', form);
    },
    onSuccess: () => {
      toast.success('Transação registrada com sucesso!');
      router.replace('/dashboard/admin');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao registrar'),
  });

  const categories = form.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const isValid = form.amount > 0 && form.category;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Nova Transação"
        description="Registre uma entrada ou saída no caixa"
        backHref="/dashboard/admin"
      />

      <div className="card space-y-8">
        {/* Tipo de Transação */}
        <Section title="Tipo de Transação" description="Escolha se é uma entrada ou saída">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: 'INCOME', category: '' }))}
              className={`p-6 rounded-xl border-2 transition-all text-center ${
                form.type === 'INCOME'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-secondary hover:border-green-500/50'
              }`}
            >
              <div className="text-4xl mb-2">💰</div>
              <div className="font-bold text-lg">Entrada</div>
              <div className="text-sm text-text-secondary">Receita / Ganho</div>
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: 'EXPENSE', category: '' }))}
              className={`p-6 rounded-xl border-2 transition-all text-center ${
                form.type === 'EXPENSE'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-secondary hover:border-red-500/50'
              }`}
            >
              <div className="text-4xl mb-2">💸</div>
              <div className="font-bold text-lg">Saída</div>
              <div className="text-sm text-text-secondary">Despesa / Custo</div>
            </button>
          </div>
        </Section>

        {/* Valor */}
        <PriceInput
          label={form.type === 'INCOME' ? '💰 Valor Recebido' : '💸 Valor Gasto'}
          value={form.amount}
          onChange={(amount) => setForm((f) => ({ ...f, amount }))}
          presets={form.type === 'INCOME' ? [30, 50, 80, 100, 150, 200] : [50, 100, 200, 500, 1000, 2000]}
        />

        {/* Categoria */}
        <Section 
          title="📂 Categoria" 
          description="Classifique a transação para relatórios"
        >
          <ButtonSelect
            options={categories}
            value={form.category}
            onChange={(category) => setForm((f) => ({ ...f, category }))}
            columns={3}
          />
          <input 
            className="input mt-3" 
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="✏️ Ou digite uma categoria personalizada..."
          />
        </Section>

        {/* Descrição */}
        <Section title="📝 Descrição" description="Opcional - detalhes da transação">
          <textarea 
            className="input min-h-[80px] resize-none" 
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder={form.type === 'INCOME' 
              ? "Ex: Corte de cabelo do cliente João" 
              : "Ex: Compra de produtos para barbearia"
            }
          />
        </Section>

        {/* Forma de Pagamento */}
        <Section 
          title="💳 Forma de Pagamento" 
          description="Como foi feito o pagamento"
        >
          <ButtonSelect
            options={PAYMENT_METHODS}
            value={form.paymentMethod}
            onChange={(paymentMethod) => setForm((f) => ({ ...f, paymentMethod }))}
            columns={4}
          />
        </Section>

        {/* Resumo e Ação */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className={`text-center md:text-left p-4 rounded-xl ${
              form.type === 'INCOME' ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}>
              <p className="text-sm text-text-secondary">Resumo</p>
              <p className={`text-2xl font-bold ${
                form.type === 'INCOME' ? 'text-green-500' : 'text-red-500'
              }`}>
                {form.type === 'INCOME' ? '+' : '-'} R$ {form.amount.toFixed(2)}
              </p>
              {form.category && (
                <p className="text-sm text-text-secondary">{form.category}</p>
              )}
            </div>
          </div>
          
          <button 
            className={`btn btn-lg w-full ${
              form.type === 'INCOME' 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            onClick={() => mutation.mutate()} 
            disabled={!isValid || mutation.isPending}
          >
            {mutation.isPending 
              ? '⏳ Salvando...' 
              : form.type === 'INCOME' 
                ? '✅ Registrar Entrada' 
                : '✅ Registrar Saída'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
