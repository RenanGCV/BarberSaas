'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface Barber {
  id: string;
  name: string;
  totalRevenue: number;
  appointmentsCount: number;
  avatar?: string;
}

export function TopBarbers() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await api.get('/reports/top-barbers', {
        params: {
          limit: 5,
        },
      });
      setBarbers(response.data);
    } catch (error) {
      console.error('Erro ao carregar top barbeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Top Barbeiros</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-400">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Top Barbeiros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {barbers.map((barber, index) => (
            <div
              key={barber.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold">
                  {index + 1}
                </div>
                {barber.avatar ? (
                  <img
                    src={barber.avatar}
                    alt={barber.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      {barber.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {barber.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {barber.appointmentsCount} atendimentos
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(barber.totalRevenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
