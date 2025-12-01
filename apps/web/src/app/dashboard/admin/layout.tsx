'use client';

import { useAuthStore } from '@/lib/store';
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

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-surface border-b border-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gradient">BarberSaas — Gestão</h1>
          <span className="text-sm text-text-secondary">{user?.name}</span>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
