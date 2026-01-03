'use client';

import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', {
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
      });

      toast.success('Conta criada com sucesso! Faça login para continuar.');
      
      // Preencher formulário de login com o email cadastrado
      setFormData({ email: registerData.email, password: registerData.password });
      setShowRegister(false);
      setRegisterData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
      
      // Auto-login após cadastro
      setTimeout(() => {
        handleSubmit(e);
      }, 500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface to-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">BarberSaas</h1>
          <p className="text-text-secondary">
            {showRegister ? 'Crie sua conta' : 'Gestão completa para sua barbearia'}
          </p>
        </div>

        <div className="card animate-slide-up">
          {!showRegister ? (
            // Formulário de Login
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

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  Não tem uma conta? <span className="font-medium text-primary">Criar agora</span>
                </button>
              </div>
            </form>
          ) : (
            // Formulário de Cadastro
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="label">Nome Completo</label>
                <input
                  type="text"
                  className="input"
                  placeholder="João Silva"
                  value={registerData.name}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="seu@email.com"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="label">Telefone</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="(11) 99999-9999"
                  value={registerData.phone}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="label">Senha</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Mínimo 6 caracteres"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, password: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="label">Confirmar Senha</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Digite a senha novamente"
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegister(false);
                    setRegisterData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
                  }}
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  Já tem uma conta? <span className="font-medium text-primary">Entrar</span>
                </button>
              </div>
            </form>
          )}


        </div>
      </div>
    </div>
  );
}
