'use client';

import { PageHeader, Section } from '@/components/ui';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    tenantName: user?.tenantName || 'Barbearia Carioca',
  });

  // Buscar dados do tenant
  const { data: tenant } = useQuery({
    queryKey: ['tenant-profile'],
    queryFn: async () => {
      const res = await api.get('/tenants/me');
      return res.data;
    },
  });

  // Atualizar perfil do usuário
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      const res = await api.patch('/users/me', data);
      return res.data;
    },
    onSuccess: (data) => {
      updateUser({ name: data.name });
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Erro ao atualizar perfil');
    },
  });

  // Atualizar nome da barbearia
  const updateTenantMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await api.patch('/tenants/me', data);
      return res.data;
    },
    onSuccess: (data) => {
      updateUser({ tenantName: data.name });
      toast.success('Nome da barbearia atualizado!');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Erro ao atualizar barbearia');
    },
  });

  const handleSave = () => {
    if (form.name !== user?.name) {
      updateProfileMutation.mutate({ name: form.name, phone: form.phone });
    }
    if (form.tenantName !== user?.tenantName) {
      updateTenantMutation.mutate({ name: form.tenantName });
    }
    if (form.name === user?.name && form.tenantName === user?.tenantName) {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Meu Perfil"
        description="Gerencie suas informações pessoais e da barbearia"
        backHref="/dashboard/admin"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados Pessoais */}
        <div className="card">
          <Section title="👤 Dados Pessoais" description="Suas informações de conta">
            <div className="space-y-4">
              <div>
                <label className="label">Nome</label>
                {isEditing ? (
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                ) : (
                  <p className="text-lg font-medium text-text-primary">{user?.name}</p>
                )}
              </div>

              <div>
                <label className="label">Email</label>
                <p className="text-text-secondary">{user?.email}</p>
                <p className="text-xs text-text-muted mt-1">O email não pode ser alterado</p>
              </div>

              <div>
                <label className="label">Função</label>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  👑 {user?.role === 'OWNER' ? 'Proprietário' : user?.role}
                </span>
              </div>
            </div>
          </Section>
        </div>

        {/* Dados da Barbearia */}
        <div className="card">
          <Section title="✂️ Minha Barbearia" description="Informações do estabelecimento">
            <div className="space-y-4">
              <div>
                <label className="label">Nome da Barbearia</label>
                {isEditing ? (
                  <input
                    className="input"
                    value={form.tenantName}
                    onChange={(e) => setForm({ ...form, tenantName: e.target.value })}
                    placeholder="Nome da sua barbearia"
                  />
                ) : (
                  <p className="text-lg font-medium text-text-primary">
                    {user?.tenantName || tenant?.name || 'Barbearia Carioca'}
                  </p>
                )}
              </div>

              {tenant && (
                <>
                  <div>
                    <label className="label">Endereço</label>
                    <p className="text-text-secondary">{tenant.address || 'Não informado'}</p>
                  </div>

                  <div>
                    <label className="label">Telefone</label>
                    <p className="text-text-secondary">{tenant.phone || 'Não informado'}</p>
                  </div>

                  <div>
                    <label className="label">Horário de Funcionamento</label>
                    <p className="text-text-secondary">
                      {tenant.openTime || '09:00'} - {tenant.closeTime || '20:00'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Section>
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-end gap-4">
        {isEditing ? (
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={updateProfileMutation.isPending || updateTenantMutation.isPending}
            >
              {updateProfileMutation.isPending || updateTenantMutation.isPending
                ? 'Salvando...'
                : 'Salvar Alterações'}
            </button>
          </>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => setIsEditing(true)}
          >
            ✏️ Editar Perfil
          </button>
        )}
      </div>
    </div>
  );
}
