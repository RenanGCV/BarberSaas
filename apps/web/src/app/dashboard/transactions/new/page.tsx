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
          <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            <option value="INCOME">Entrada</option>
            <option value="EXPENSE">Saída</option>
          </select>
        </div>
        <div>
          <label className="label">Valor</label>
          <input className="input" type="number" min={0} step={0.01}
                 value={form.amount}
                 onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))} />
        </div>
        <div>
          <label className="label">Categoria</label>
          <input className="input" value={form.category}
                 onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
        </div>
        <div>
          <label className="label">Descrição</label>
          <input className="input" value={form.description}
                 onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div>
          <label className="label">Pagamento</label>
          <select className="input" value={form.paymentMethod}
                  onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}>
            <option value="CASH">Dinheiro</option>
            <option value="PIX">Pix</option>
            <option value="CARD">Cartão</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => mutation.mutate()} disabled={!form.amount || !form.category}>
          Salvar
        </button>
      </div>
    </div>
  );
}
