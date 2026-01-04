'use client';

import { ReactNode } from 'react';

// ============================================
// BUTTON SELECT - Botões de seleção estilizados
// ============================================
interface ButtonSelectOption<T> {
  value: T;
  label: string;
  icon?: string;
  description?: string;
}

interface ButtonSelectProps<T> {
  options: ButtonSelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
}

export function ButtonSelect<T extends string | number>({
  options,
  value,
  onChange,
  columns = 4,
  size = 'md',
}: ButtonSelectProps<T>) {
  const colsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  }[columns];

  const sizeClass = {
    sm: 'p-2 text-sm',
    md: 'p-3',
    lg: 'p-4',
  }[size];

  return (
    <div className={`grid ${colsClass} gap-2`}>
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`${sizeClass} rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
            value === opt.value
              ? 'border-primary bg-primary/10 shadow-glow'
              : 'border-secondary hover:border-primary/50 bg-surface'
          }`}
        >
          {opt.icon && <div className="text-2xl mb-1">{opt.icon}</div>}
          <div className={`font-medium ${value === opt.value ? 'text-primary' : ''}`}>
            {opt.label}
          </div>
          {opt.description && (
            <div className="text-xs text-text-secondary mt-1">{opt.description}</div>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================
// CHIP SELECT - Chips de seleção múltipla
// ============================================
interface ChipOption {
  value: string;
  label: string;
}

interface ChipSelectProps {
  options: (string | ChipOption)[];
  selected: string[];
  onChange: (selected: string[]) => void;
  allowCustom?: boolean;
  customPlaceholder?: string;
}

export function ChipSelect({
  options,
  selected,
  onChange,
  allowCustom = false,
  customPlaceholder = 'Adicionar personalizado...',
}: ChipSelectProps) {
  // Normaliza options para sempre ter {value, label}
  const normalizedOptions: ChipOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {normalizedOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => toggle(option.value)}
            className={`px-4 py-2 rounded-full border-2 transition-all duration-200 text-sm font-medium ${
              selected.includes(option.value)
                ? 'border-primary bg-primary text-background'
                : 'border-secondary hover:border-primary/50 bg-surface'
            }`}
          >
            {selected.includes(option.value) && <span className="mr-1">✓</span>}
            {option.label}
          </button>
        ))}
      </div>
      {allowCustom && (
        <input
          type="text"
          className="input"
          placeholder={customPlaceholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const input = e.currentTarget;
              const value = input.value.trim();
              if (value && !selected.includes(value)) {
                onChange([...selected, value]);
                input.value = '';
              }
            }
          }}
        />
      )}
    </div>
  );
}

// ============================================
// PRICE INPUT - Input de preço com presets
// ============================================
interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  presets?: number[];
  label?: string;
  currency?: string;
}

export function PriceInput({
  value,
  onChange,
  presets = [30, 50, 70, 100],
  label = 'Valor',
  currency = 'R$',
}: PriceInputProps) {
  return (
    <div className="space-y-3">
      {label && <label className="label">{label}</label>}
      <div className="grid grid-cols-4 gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`p-3 rounded-xl border-2 transition-all duration-200 font-bold ${
              value === preset
                ? 'border-primary bg-primary text-background shadow-glow'
                : 'border-secondary hover:border-primary/50 bg-surface'
            }`}
          >
            {currency}{preset}
          </button>
        ))}
      </div>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
          {currency}
        </span>
        <input
          type="number"
          className="input pl-10"
          min={0}
          step={0.01}
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="Valor personalizado"
        />
      </div>
    </div>
  );
}

// ============================================
// DURATION INPUT - Input de duração com presets
// ============================================
interface DurationInputProps {
  value: number;
  onChange: (value: number) => void;
  presets?: number[];
  label?: string;
}

export function DurationInput({
  value,
  onChange,
  presets = [15, 30, 45, 60],
  label = 'Duração',
}: DurationInputProps) {
  return (
    <div className="space-y-3">
      {label && <label className="label">{label}</label>}
      <div className="grid grid-cols-4 gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`p-3 rounded-xl border-2 transition-all duration-200 font-bold ${
              value === preset
                ? 'border-primary bg-primary text-background shadow-glow'
                : 'border-secondary hover:border-primary/50 bg-surface'
            }`}
          >
            {preset}min
          </button>
        ))}
      </div>
      <div className="relative">
        <input
          type="number"
          className="input pr-16"
          min={5}
          step={5}
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="Duração personalizada"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
          minutos
        </span>
      </div>
    </div>
  );
}

// ============================================
// PERCENTAGE INPUT - Input de porcentagem
// ============================================
interface PercentageInputProps {
  value: number;
  onChange: (value: number) => void;
  presets?: number[];
  label?: string;
  description?: string;
}

export function PercentageInput({
  value,
  onChange,
  presets = [30, 40, 50, 60],
  label = 'Porcentagem',
  description,
}: PercentageInputProps) {
  return (
    <div className="space-y-3">
      {label && <label className="label">{label}</label>}
      <div className="grid grid-cols-4 gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`p-3 rounded-xl border-2 transition-all duration-200 font-bold ${
              value === preset
                ? 'border-primary bg-primary text-background shadow-glow'
                : 'border-secondary hover:border-primary/50 bg-surface'
            }`}
          >
            {preset}%
          </button>
        ))}
      </div>
      <div className="relative">
        <input
          type="number"
          className="input pr-10"
          min={0}
          max={100}
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="Porcentagem personalizada"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
          %
        </span>
      </div>
      {description && (
        <p className="text-sm text-text-secondary">{description}</p>
      )}
    </div>
  );
}

// ============================================
// STAT CARD - Card de estatística
// ============================================
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: { value: number; label: string };
  color?: 'default' | 'success' | 'warning' | 'error';
}

export function StatCard({ label, value, icon, trend, color = 'default' }: StatCardProps) {
  const colorClasses = {
    default: 'border-secondary',
    success: 'border-success/30 bg-success/5',
    warning: 'border-warning/30 bg-warning/5',
    error: 'border-error/30 bg-error/5',
  }[color];

  return (
    <div className={`card ${colorClasses} hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.value >= 0 ? 'text-success' : 'text-error'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        {icon && <span className="text-3xl opacity-50">{icon}</span>}
      </div>
    </div>
  );
}

// ============================================
// ACTION CARD - Card de ação rápida
// ============================================
interface ActionCardProps {
  title: string;
  description: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
}

export function ActionCard({ title, description, icon, href, onClick }: ActionCardProps) {
  const content = (
    <div className="card group hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>
        <div className="text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all">
          →
        </div>
      </div>
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }
  return <button onClick={onClick} className="w-full text-left">{content}</button>;
}

// ============================================
// SECTION - Seção com título
// ============================================
interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function Section({ title, description, children, action }: SectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && <p className="text-text-secondary text-sm mt-1">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ============================================
// EMPTY STATE - Estado vazio
// ============================================
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-text-secondary mb-6">{description}</p>}
      {action}
    </div>
  );
}

// ============================================
// LOADING SPINNER
// ============================================
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  }[size];

  return (
    <div className="flex items-center justify-center py-8">
      <div className={`animate-spin rounded-full ${sizeClass} border-2 border-secondary border-t-primary`}></div>
    </div>
  );
}

// ============================================
// PAGE HEADER
// ============================================
interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, backHref, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-4">
        {backHref && (
          <a
            href={backHref}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-surface-hover transition-colors"
          >
            ←
          </a>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          {description && <p className="text-text-secondary mt-1">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
