// ============= ENUMS =============

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  BARBER = 'BARBER',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum PaymentMethod {
  CASH = 'CASH',
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PromotionType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SERVICE = 'FREE_SERVICE',
}

// ============= USER TYPES =============

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: UserRole;
  tenantId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  avatar?: string;
}

// ============= AUTH TYPES =============

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ============= TENANT TYPES =============

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;
  openTime: string;
  closeTime: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTenantDto {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  openTime: string;
  closeTime: string;
}

export interface UpdateTenantDto {
  name?: string;
  logo?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  openTime?: string;
  closeTime?: string;
  isActive?: boolean;
}

// ============= BARBER TYPES =============

export interface Barber {
  id: string;
  userId: string;
  tenantId: string;
  specialties: string[];
  commissionRate: number;
  isActive: boolean;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBarberDto {
  userId: string;
  specialties?: string[];
  commissionRate: number;
}

export interface UpdateBarberDto {
  specialties?: string[];
  commissionRate?: number;
  isActive?: boolean;
}

// ============= SERVICE TYPES =============

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  price: number;
  duration: number; // em minutos
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  price: number;
  duration: number;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  isActive?: boolean;
}

// ============= APPOINTMENT TYPES =============

export interface Appointment {
  id: string;
  tenantId: string;
  customerId: string;
  barberId: string;
  serviceId: string;
  scheduledAt: Date;
  status: AppointmentStatus;
  notes: string | null;
  customer: User;
  barber: Barber;
  service: Service;
  payment: Payment | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentDto {
  barberId: string;
  serviceId: string;
  scheduledAt: Date;
  notes?: string;
}

export interface UpdateAppointmentDto {
  status?: AppointmentStatus;
  scheduledAt?: Date;
  notes?: string;
}

// ============= PAYMENT TYPES =============

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentDto {
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
}

// ============= TRANSACTION TYPES =============

export interface Transaction {
  id: string;
  tenantId: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string | null;
  paymentMethod: PaymentMethod | null;
  appointmentId: string | null;
  cashFlowId: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTransactionDto {
  type: TransactionType;
  category: string;
  amount: number;
  description?: string;
  paymentMethod?: PaymentMethod;
  appointmentId?: string;
}

// ============= CASH FLOW TYPES =============

export interface CashFlow {
  id: string;
  tenantId: string;
  date: Date;
  openingBalance: number;
  closingBalance: number;
  totalIncome: number;
  totalExpense: number;
  openedBy: string;
  closedBy: string | null;
  openedAt: Date;
  closedAt: Date | null;
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OpenCashFlowDto {
  openingBalance: number;
}

export interface CloseCashFlowDto {
  closingBalance: number;
}

// ============= PROMOTION TYPES =============

export interface Promotion {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string | null;
  type: PromotionType;
  value: number;
  startDate: Date;
  endDate: Date;
  maxUses: number | null;
  currentUses: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePromotionDto {
  code: string;
  name: string;
  description?: string;
  type: PromotionType;
  value: number;
  startDate: Date;
  endDate: Date;
  maxUses?: number;
}

// ============= REPORT TYPES =============

export interface FinancialReport {
  period: {
    start: Date;
    end: Date;
  };
  income: {
    total: number;
    byMethod: Record<PaymentMethod, number>;
    byCategory: Record<string, number>;
  };
  expenses: {
    total: number;
    byCategory: Record<string, number>;
  };
  balance: number;
  commissions: {
    total: number;
    byBarber: Array<{
      barberId: string;
      barberName: string;
      amount: number;
    }>;
  };
}

export interface AppointmentReport {
  period: {
    start: Date;
    end: Date;
  };
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
  byBarber: Array<{
    barberId: string;
    barberName: string;
    total: number;
    completed: number;
  }>;
  byService: Array<{
    serviceId: string;
    serviceName: string;
    total: number;
  }>;
}

// ============= NOTIFICATION TYPES =============

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface SendNotificationDto {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

// ============= PAGINATION TYPES =============

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============= API RESPONSE TYPES =============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}
