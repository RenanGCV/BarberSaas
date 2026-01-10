'use client';

import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const role = (user?.role || '').toUpperCase();
    if (!isAuthenticated || !(role === 'OWNER' || role === 'ADMIN')) {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated) return null;
  const role = (user?.role || '').toUpperCase();
  if (!isAuthenticated || !(role === 'OWNER' || role === 'ADMIN')) return null;

  const tenantName = user?.tenantName || 'Barbearia Carioca';

  return (
    <div className="min-h-screen bg-background">
      {/* Header único */}
      <nav className="bg-surface border-b border-secondary sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Logo / Nome da Barbearia */}
            <Link href="/dashboard/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-xl">✂️</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-text-primary">{tenantName}</h1>
                <p className="text-xs text-text-secondary">Painel de Gestão</p>
              </div>
            </Link>

            {/* Navegação Central */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/dashboard/admin" icon="🏠" label="Início" />
              <NavLink href="/dashboard/admin/staff" icon="👥" label="Equipe" />
              <NavLink href="/dashboard/admin/services" icon="✂️" label="Serviços" />
              <NavLink href="/dashboard/admin/appointments" icon="📅" label="Agenda" />
              <NavLink href="/dashboard/reports" icon="📊" label="Relatórios" />
            </div>

            {/* Usuário */}
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard/admin/profile" 
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm">👤</span>
                </div>
                <span className="text-sm font-medium text-text-primary hidden sm:block">
                  {user?.name}
                </span>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Navegação Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-secondary z-50">
        <div className="flex items-center justify-around h-16">
          <MobileNavLink href="/dashboard/admin" icon="🏠" label="Início" />
          <MobileNavLink href="/dashboard/admin/staff" icon="👥" label="Equipe" />
          <MobileNavLink href="/dashboard/admin/services" icon="✂️" label="Serviços" />
          <MobileNavLink href="/dashboard/admin/appointments" icon="📅" label="Agenda" />
          <MobileNavLink href="/dashboard/reports" icon="📊" label="Relatórios" />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-secondary transition-colors"
    >
      <span>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

function MobileNavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 px-3 py-2 text-text-secondary hover:text-primary transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

function LogoutButton() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <button 
      onClick={handleLogout} 
      className="p-2 rounded-xl text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-colors"
      title="Sair"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    </button>
  );
}
