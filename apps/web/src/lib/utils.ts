import { type ClassValue, clsx } from 'clsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string | Date, pattern = 'PPP'): string {
  return format(new Date(date), pattern, { locale: ptBR });
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm', { locale: ptBR });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-warning/20 text-warning',
    CONFIRMED: 'bg-info/20 text-info',
    IN_PROGRESS: 'bg-primary/20 text-primary',
    COMPLETED: 'bg-success/20 text-success',
    CANCELED: 'bg-error/20 text-error',
    NO_SHOW: 'bg-text-muted/20 text-text-muted',
  };
  return colors[status] || 'bg-secondary text-text-secondary';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendente',
    CONFIRMED: 'Confirmado',
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluído',
    CANCELED: 'Cancelado',
    NO_SHOW: 'Não Compareceu',
  };
  return labels[status] || status;
}
