// User roles
export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  BARBER = 'BARBER',
  CUSTOMER = 'CUSTOMER',
}

// Appointment status
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

// Payment methods
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  PIX = 'PIX',
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  tenantId: string;
  createdAt: string;
}

// Tenant (Barbershop)
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
}

// Barber
export interface Barber {
  id: string;
  userId: string;
  tenantId: string;
  commissionRate: number;
  isActive: boolean;
  workingHours?: any;
  user: User;
  createdAt: string;
}

// Service
export interface Service {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
}

// Appointment
export interface Appointment {
  id: string;
  tenantId: string;
  customerId?: string;
  barberId: string;
  serviceId: string;
  scheduledAt: string;
  status: AppointmentStatus;
  totalPrice?: number;
  paymentMethod?: PaymentMethod;
  notes?: string;
  customer?: User;
  barber: Barber;
  service: Service;
  createdAt: string;
}

// Promotion
export interface Promotion {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SERVICE';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxUses?: number;
  currentUses: number;
  services?: Service[];
}

// Coupon
export interface Coupon {
  id: string;
  promotionId: string;
  code: string;
  isActive: boolean;
  usageCount: number;
  promotion: Promotion;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Slot type (for scheduling)
export interface TimeSlot {
  time: string;
  available: boolean;
  barberId: string;
}
