'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔍 Tentando login com:', formData.email);
      console.log('🌐 URL base da API:', api.defaults.baseURL);
      console.log('📡 URL completa:', `${api.defaults.baseURL}/auth/login`);
      
      const response = await api.post('/auth/login', formData);
      console.log('✅ Resposta recebida:', response.data);
      
      const { user, accessToken, refreshToken } = response.data;

      login(user, accessToken, refreshToken);
      toast.success('Login realizado com sucesso!');
      
      // Redireciona por papel
      setTimeout(() => {
        const role = (user?.role || '').toUpperCase();
        if (role === 'OWNER' || role === 'ADMIN') {
          router.replace('/dashboard/admin');
        } else if (role === 'BARBER') {
          router.replace('/dashboard/barber');
        } else {
          router.replace('/client');
        }
      }, 120);
    } catch (error: any) {
      console.error('❌ Erro completo:', error);
      console.error('📍 URL chamada:', error.config?.url);
      console.error('🔗 Base URL:', error.config?.baseURL);
      console.error('📊 Status:', error.response?.status);
      console.error('💬 Mensagem:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface to-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">BarberSaas</h1>
          <p className="text-text-secondary">Gestão completa para sua barbearia</p>
        </div>

        <div className="card animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="label">Senha</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-secondary">
            <p>Credenciais de teste:</p>
            <p className="mt-2 font-mono text-xs">
              owner@barbearia.com / 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
