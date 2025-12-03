"use client";
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    const role = (user?.role || '').toUpperCase();
    if (role === 'OWNER' || role === 'ADMIN') {
      router.replace('/dashboard/admin');
    } else if (role === 'BARBER') {
      router.replace('/dashboard/barber');
    } else {
      router.replace('/client');
    }
  }, [isAuthenticated, user, router]);

  return null;
}
