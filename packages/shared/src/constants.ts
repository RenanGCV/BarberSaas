// ============= COLORS =============

export const COLORS = {
  primary: '#F5A027',
  primaryDark: '#D68A1F',
  primaryLight: '#FFB84D',
  
  background: '#0F0F0F',
  backgroundSecondary: '#1A1A1A',
  backgroundTertiary: '#242424',
  
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textTertiary: '#666666',
  
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  border: '#333333',
  borderLight: '#404040',
} as const;

// ============= REGEX =============

export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\([1-9]{2}\) (?:[2-8]|9[1-9])[0-9]{3}-[0-9]{4}$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  zipCode: /^\d{5}-\d{3}$/,
  time: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
} as const;

// ============= API ROUTES =============

export const API_ROUTES = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  
  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  
  // Tenants (Barbershops)
  TENANTS: '/tenants',
  TENANT_BY_ID: (id: string) => `/tenants/${id}`,
  NEARBY_TENANTS: '/tenants/nearby',
  
  // Barbers
  BARBERS: '/barbers',
  BARBER_BY_ID: (id: string) => `/barbers/${id}`,
  BARBER_SCHEDULE: (id: string) => `/barbers/${id}/schedule`,
  
  // Services
  SERVICES: '/services',
  SERVICE_BY_ID: (id: string) => `/services/${id}`,
  
  // Appointments
  APPOINTMENTS: '/appointments',
  APPOINTMENT_BY_ID: (id: string) => `/appointments/${id}`,
  MY_APPOINTMENTS: '/appointments/my',
  CANCEL_APPOINTMENT: (id: string) => `/appointments/${id}/cancel`,
  CONFIRM_APPOINTMENT: (id: string) => `/appointments/${id}/confirm`,
  
  // Payments
  PAYMENTS: '/payments',
  PAYMENT_BY_ID: (id: string) => `/payments/${id}`,
  
  // Transactions
  TRANSACTIONS: '/transactions',
  TRANSACTION_BY_ID: (id: string) => `/transactions/${id}`,
  
  // Cash Flow
  CASH_FLOW: '/cash-flow',
  OPEN_CASH_FLOW: '/cash-flow/open',
  CLOSE_CASH_FLOW: (id: string) => `/cash-flow/${id}/close`,
  CURRENT_CASH_FLOW: '/cash-flow/current',
  
  // Promotions
  PROMOTIONS: '/promotions',
  PROMOTION_BY_ID: (id: string) => `/promotions/${id}`,
  VALIDATE_PROMOTION: '/promotions/validate',
  
  // Reports
  FINANCIAL_REPORT: '/reports/financial',
  APPOINTMENT_REPORT: '/reports/appointments',
  COMMISSION_REPORT: '/reports/commissions',
  
  // Notifications
  SEND_NOTIFICATION: '/notifications/send',
  MY_NOTIFICATIONS: '/notifications/my',
} as const;

// ============= ERROR MESSAGES =============

export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Email ou senha inválidos',
  EMAIL_ALREADY_EXISTS: 'Este email já está cadastrado',
  UNAUTHORIZED: 'Não autorizado',
  TOKEN_EXPIRED: 'Sessão expirada',
  
  // Validation
  REQUIRED_FIELD: (field: string) => `${field} é obrigatório`,
  INVALID_EMAIL: 'Email inválido',
  INVALID_PHONE: 'Telefone inválido',
  MIN_LENGTH: (field: string, min: number) => `${field} deve ter no mínimo ${min} caracteres`,
  MAX_LENGTH: (field: string, max: number) => `${field} deve ter no máximo ${max} caracteres`,
  
  // Business Logic
  APPOINTMENT_CONFLICT: 'Já existe um agendamento neste horário',
  BARBER_NOT_AVAILABLE: 'Barbeiro não disponível neste horário',
  INVALID_TIME_SLOT: 'Horário inválido',
  PAST_DATE: 'Não é possível agendar em datas passadas',
  CASH_FLOW_ALREADY_OPEN: 'Já existe um caixa aberto',
  CASH_FLOW_CLOSED: 'Caixa já foi fechado',
  PROMOTION_EXPIRED: 'Promoção expirada',
  PROMOTION_LIMIT_REACHED: 'Limite de usos da promoção atingido',
  
  // Generic
  NOT_FOUND: 'Não encontrado',
  INTERNAL_ERROR: 'Erro interno do servidor',
} as const;

// ============= SUCCESS MESSAGES =============

export const SUCCESS_MESSAGES = {
  CREATED: 'Criado com sucesso',
  UPDATED: 'Atualizado com sucesso',
  DELETED: 'Excluído com sucesso',
  APPOINTMENT_CREATED: 'Agendamento realizado com sucesso',
  APPOINTMENT_CANCELLED: 'Agendamento cancelado',
  PAYMENT_PROCESSED: 'Pagamento processado',
  CASH_FLOW_OPENED: 'Caixa aberto',
  CASH_FLOW_CLOSED: 'Caixa fechado',
} as const;

// ============= TRANSACTION CATEGORIES =============

export const INCOME_CATEGORIES = [
  'Serviços',
  'Produtos',
  'Gorjetas',
  'Outros',
] as const;

export const EXPENSE_CATEGORIES = [
  'Salários',
  'Comissões',
  'Aluguel',
  'Água',
  'Energia',
  'Internet',
  'Produtos',
  'Equipamentos',
  'Marketing',
  'Impostos',
  'Outros',
] as const;

// ============= TIME CONSTANTS =============

export const TIME = {
  SLOT_DURATION: 30, // minutos
  BUSINESS_START: '09:00',
  BUSINESS_END: '20:00',
  CANCELLATION_HOURS: 2, // horas mínimas para cancelamento
} as const;

// ============= PAGINATION =============

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
