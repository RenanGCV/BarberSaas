'use client';

import api from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NewTransactionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    type: 'INCOME',
    amount: 0,
    category: '',
    description: '',
    paymentMethod: 'CASH',
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post('/transactions', form);
    },
    onSuccess: () => {
      toast.success('Transação registrada!');
      router.replace('/dashboard/admin');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao registrar'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Registrar Transação</h1>
        <a href="/dashboard/admin" className="btn btn-secondary">Voltar</a>
      </div>
      <div className="card space-y-4">
        <div>
          <label className="label">Tipo</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: 'INCOME' }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                form.type === 'INCOME'
                  ? 'border-primary bg-primary/10 font-semibold'
                  : 'border-secondary hover:border-primary/50'
              }`}
            >
              <div className="text-2xl mb-1">💰</div>
              <div className="font-semibold">Entrada</div>
              <div className="text-xs text-text-secondary">Receita / Ganho</div>
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: 'EXPENSE' }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                form.type === 'EXPENSE'
                  ? 'border-primary bg-primary/10 font-semibold'
                  : 'border-secondary hover:border-primary/50'
              }`}
            >
              <div className="text-2xl mb-1">💸</div>
              <div className="font-semibold">Saída</div>
              <div className="text-xs text-text-secondary">Despesa / Custo</div>
            </button>
          </div>
        </div>
        <div>
          <label className="label">Valor (R$)</label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[50, 100, 200, 500].map(value => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, amount: value }))}
                className={`p-2 rounded-lg border-2 transition-all ${
                  form.amount === value
                    ? 'border-primary bg-primary text-background font-bold'
                    : 'border-secondary hover:border-primary/50'
                }`}
              >
                R${value}
              </button>
            ))}
          </div>
          <input className="input" type="number" min={0} step={0.01}
                 value={form.amount}
                 onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                 placeholder="Ou insira um valor personalizado" />
        </div>
        <div>
          <label className="label">Categoria</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {(form.type === 'INCOME' 
              ? ['Serviços', 'Produtos', 'Comissões', 'Outros']
              : ['Produtos', 'Energia', 'Água', 'Internet', 'Aluguel', 'Salários', 'Outros']
            ).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm((f) => ({ ...f, category: cat }))}
                className={`p-3 rounded-lg border-2 transition-all text-sm ${
                  form.category === cat
                    ? 'border-primary bg-primary/10 font-semibold'
                    : 'border-secondary hover:border-primary/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <input className="input" value={form.category}
                 onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                 placeholder="Ou insira uma categoria personalizada" />
        </div>
        <div>
          <label className="label">Descrição</label>
          <input className="input" value={form.description}
                 onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                 placeholder="Ex: Compra de produtos para barbearia" />
        </div>
        <div>
          <label className="label">Forma de Pagamento</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'CASH', label: '💵 Dinheiro', icon: '💵' },
              { value: 'PIX', label: '📱 Pix', icon: '📱' },
              { value: 'CREDIT_CARD', label: '💳 Crédito', icon: '💳' },
              { value: 'DEBIT_CARD', label: '💳 Débito', icon: '💳' },
            ].map(method => (
              <button
                key={method.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, paymentMethod: method.value }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  form.paymentMethod === method.value
                    ? 'border-primary bg-primary/10 font-semibold'
                    : 'border-secondary hover:border-primary/50'
                }`}
              >
                <div className="text-xl mb-1">{method.icon}</div>
                <div className="text-xs">{method.label.split(' ')[1]}</div>
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => mutation.mutate()} disabled={!form.amount || !form.category}>
          Salvar
        </button>
      </div>
    </div>
  );
}
