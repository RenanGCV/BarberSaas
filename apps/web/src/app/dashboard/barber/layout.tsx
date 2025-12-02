'use client';

import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BarberLayout({ children }: { children: React.ReactNode }) {
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
    if (!isAuthenticated || role !== 'BARBER') {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated) return null;
  const role = (user?.role || '').toUpperCase();
  if (!isAuthenticated || role !== 'BARBER') return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-surface border-b border-secondary">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gradient">BarberSaas — Barbeiro</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">{user?.name}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
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
    <button onClick={handleLogout} className="btn btn-secondary text-sm">
      Sair
    </button>
  );
}
