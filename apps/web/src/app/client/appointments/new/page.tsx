'use client';

import api from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type TimeSlot = {
  time: string;
  available: boolean;
};

export default function NewAppointmentPage() {
  const router = useRouter();
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const { data: options, isLoading, error } = useQuery({
    queryKey: ['new-appointment-options'],
    queryFn: async () => {
      const [barbers, services] = await Promise.all([
        api.get('/barbers'), 
        api.get('/services')
      ]);
      console.log('Barbers:', barbers.data);
      console.log('Services:', services.data);
      return { 
        barbers: barbers.data || [], 
        services: services.data || [] 
      };
    },
  });

  // Filtrar serviços disponíveis para o barbeiro selecionado
  const availableServices = useMemo(() => {
    if (!selectedBarber || !options?.services) return options?.services || [];
    
    const barber = options.barbers.find((b: any) => b.id === selectedBarber);
    if (!barber?.services || barber.services.length === 0) {
      // Se o barbeiro não tem serviços específicos vinculados, mostrar todos
      return options.services;
    }
    
    // Mostrar apenas serviços vinculados ao barbeiro
    const barberServiceIds = barber.services.map((bs: any) => bs.serviceId);
    return options.services.filter((s: any) => barberServiceIds.includes(s.id));
  }, [selectedBarber, options]);

  // Buscar agendamentos do barbeiro quando selecionado
  const { data: barberSchedule } = useQuery({
    queryKey: ['barber-schedule', selectedBarber, selectedDate],
    queryFn: async () => {
      if (!selectedBarber || !selectedDate) return null;
      const res = await api.get(`/barbers/${selectedBarber}/schedule/${selectedDate}`);
      return res.data;
    },
    enabled: !!selectedBarber && !!selectedDate,
  });

  // Gerar próximos 30 dias
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        day: date.getDate(),
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      });
    }
    return dates;
  }, []);

  // Gerar horários disponíveis (9h às 18h) - De 1 em 1 hora
  const timeSlots = useMemo(() => {
    const slots: TimeSlot[] = [];
    const bookedTimes = (barberSchedule?.appointments || []).map((a: any) => 
      new Date(a.scheduledAt).toTimeString().slice(0, 5)
    );

    const now = new Date();
    const currentHour = now.getHours();
    const isToday = selectedDate === now.toISOString().split('T')[0];

    // Horários fixos de 1 em 1 hora
    for (let hour = 9; hour <= 18; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      
      // Se for hoje, não mostrar horários que já passaram
      if (isToday && hour <= currentHour) {
        continue;
      }
      
      slots.push({
        time,
        available: !bookedTimes.includes(time),
      });
    }
    return slots;
  }, [barberSchedule, selectedDate]);

  const mutation = useMutation({
    mutationFn: async () => {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
      await api.post('/appointments', {
        barberId: selectedBarber,
        serviceId: selectedService,
        scheduledAt,
      });
    },
    onSuccess: () => {
      toast.success('Agendamento criado com sucesso!');
      router.replace('/client/appointments');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Erro ao agendar'),
  });

  const selectedServiceData = options?.services.find((s: any) => s.id === selectedService);
  const selectedBarberData = options?.barbers.find((b: any) => b.id === selectedBarber);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Novo agendamento</h1>
          <p className="text-text-secondary">Escolha o profissional, serviço e horário</p>
        </div>
        <a href="/client" className="btn btn-secondary">Voltar</a>
      </div>

      {/* Etapa 1: Selecionar Profissional */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">1. Escolha o profissional</h2>
        {isLoading && <p className="text-text-secondary">Carregando profissionais...</p>}
        {error && <p className="text-error">Erro ao carregar profissionais. Verifique sua conexão.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(options?.barbers || []).map((barber: any) => (
            <button
              key={barber.id}
              onClick={() => {
                setSelectedBarber(barber.id);
                setSelectedDate('');
                setSelectedTime('');
              }}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedBarber === barber.id
                  ? 'border-primary bg-primary/10'
                  : 'border-secondary hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {barber.user?.avatar && (
                  <img 
                    src={barber.user.avatar} 
                    alt={barber.user?.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{barber.user?.name || 'Sem nome'}</p>
                  {barber.specialties?.length > 0 && (
                    <p className="text-xs text-text-secondary">
                      {barber.specialties.slice(0, 2).join(', ')}
                    </p>
                  )}
                </div>
                {selectedBarber === barber.id && (
                  <span className="text-primary text-xl">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
        {(!options?.barbers || options.barbers.length === 0) && (
          <p className="text-text-secondary text-center py-8">
            Nenhum profissional disponível no momento
          </p>
        )}
      </div>

      {/* Etapa 2: Selecionar Serviço */}
      {selectedBarber && (
        <div className="card animate-slide-up">
          <h2 className="text-lg font-semibold mb-4">2. Escolha o serviço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(availableServices || []).map((service: any) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedService === service.id
                    ? 'border-primary bg-primary/10'
                    : 'border-secondary hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-text-secondary mt-1">
                      {service.duration} min • R$ {service.price.toFixed(2)}
                    </p>
                  </div>
                  {selectedService === service.id && (
                    <span className="text-primary text-xl">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
          {(!availableServices || availableServices.length === 0) && (
            <p className="text-text-secondary text-center py-4">
              Este profissional não possui serviços cadastrados.
            </p>
          )}
        </div>
      )}

      {/* Etapa 3: Selecionar Data */}
      {selectedBarber && selectedService && (
        <div className="card animate-slide-up">
          <h2 className="text-lg font-semibold mb-4">3. Escolha a data</h2>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-3 min-w-max">
              {availableDates.map((dateInfo) => (
                <button
                  key={dateInfo.date}
                  onClick={() => {
                    setSelectedDate(dateInfo.date);
                    setSelectedTime('');
                  }}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all min-w-[80px] ${
                    selectedDate === dateInfo.date
                      ? 'border-primary bg-primary/10'
                      : 'border-secondary hover:border-primary/50'
                  }`}
                >
                  <span className="text-xs text-text-secondary uppercase">
                    {dateInfo.dayName}
                  </span>
                  <span className="text-2xl font-bold my-1">{dateInfo.day}</span>
                  <span className="text-xs text-text-secondary capitalize">
                    {dateInfo.month}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Etapa 4: Selecionar Horário */}
      {selectedBarber && selectedService && selectedDate && (
        <div className="card animate-slide-up">
          <h2 className="text-lg font-semibold mb-4">4. Escolha o horário</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => slot.available && setSelectedTime(slot.time)}
                disabled={!slot.available}
                className={`p-3 rounded-lg border-2 transition-all font-semibold ${
                  selectedTime === slot.time
                    ? 'border-primary bg-primary text-background'
                    : slot.available
                    ? 'border-secondary hover:border-primary/50'
                    : 'border-secondary/30 bg-secondary/20 text-text-secondary/50 cursor-not-allowed line-through'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
          {timeSlots.every(s => !s.available) && (
            <p className="text-text-secondary text-center py-4">
              Nenhum horário disponível nesta data
            </p>
          )}
        </div>
      )}

      {/* Resumo e Confirmação */}
      {selectedBarber && selectedService && selectedDate && selectedTime && (
        <div className="card bg-primary/10 border-2 border-primary animate-slide-up">
          <h2 className="text-lg font-semibold mb-4">Confirmar agendamento</h2>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-text-secondary">Profissional:</span>
              <span className="font-semibold">{selectedBarberData?.user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Serviço:</span>
              <span className="font-semibold">{selectedServiceData?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Data:</span>
              <span className="font-semibold">
                {new Date(selectedDate).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Horário:</span>
              <span className="font-semibold">{selectedTime}</span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-primary/30">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-primary">
                R$ {selectedServiceData?.price.toFixed(2)}
              </span>
            </div>
          </div>
          <button
            className="btn btn-primary w-full"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? '⏳ Agendando...' : '✓ Confirmar agendamento'}
          </button>
        </div>
      )}
    </div>
  );
}
