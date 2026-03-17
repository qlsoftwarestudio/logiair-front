import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService, type AuthUser, type LoginCredentials, type RegisterData } from "@/services/authService";
import { ROLE_PERMISSIONS, type UserRole } from "@/constants/roles";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const { user, token } = await authService.login(credentials);
          set({ user, token, isAuthenticated: true, loading: false });
        } catch (err: any) {
          const message = err.response?.data?.message || err.message || "Error al iniciar sesión";
          set({ loading: false, error: message });
          throw err;
        }
      },

      register: async (data) => {
        set({ loading: true, error: null });
        try {
          await authService.register(data);
          set({ loading: false });
        } catch (err: any) {
          const message = err.response?.data?.message || err.message || "Error al registrar";
          set({ loading: false, error: message });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      clearError: () => set({ error: null }),

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        return ROLE_PERMISSIONS[user.role as UserRole]?.includes(permission) ?? false;
      },
    }),
    {
      name: "logiair-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
