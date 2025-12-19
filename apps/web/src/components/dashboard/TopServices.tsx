'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface Service {
  id: string;
  name: string;
  totalRevenue: number;
  count: number;
}

export function TopServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await api.get('/reports/top-services', {
        params: {
          limit: 5,
        },
      });
      setServices(response.data);
    } catch (error) {
      console.error('Erro ao carregar top serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Top Serviços</CardTitle>
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
        <CardTitle className="dark:text-white">Top Serviços</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {service.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {service.count} agendamentos
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(service.totalRevenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
