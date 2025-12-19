import { authService } from '@/services/auth.service';
import type { User } from '@/types';
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  register: async (name, email, password, phone) => {
    try {
      const response = await authService.register({ name, email, password, phone });
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getStoredUser();
      const isAuthenticated = await authService.isAuthenticated();
      set({ user, isAuthenticated, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
