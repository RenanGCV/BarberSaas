"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    const role = (user?.role || '').toUpperCase();
    if (role === 'OWNER' || role === 'ADMIN') {
      router.replace('/dashboard/admin');
    } else if (role === 'BARBER') {
      router.replace('/dashboard/barber');
    } else {
      router.replace('/client');
    }
  }, [user, router]);

  return null;
}
