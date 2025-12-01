'use client';

import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) return null;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-surface border-b border-secondary">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gradient">BarberSaas — Cliente</h1>
          <span className="text-sm text-text-secondary">{user?.name}</span>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
