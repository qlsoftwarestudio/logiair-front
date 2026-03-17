import api from "./api";
import { API_URLS } from "@/constants/apiUrls";
import type { UserRole } from "@/constants/roles";

export interface AuthUser {
  id: number;
  name: string;
  lastname?: string;
  email: string;
  role: UserRole;
  avatar?: string;
  tenantId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface OnboardingData {
  businessName: string;
  taxId: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

/**
 * Decode JWT payload without external libraries.
 * Returns the parsed JSON payload or null on failure.
 */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // base64url → base64
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Extract AuthUser from a JWT token payload.
 * Adapts common Spring Security JWT claim names.
 */
function extractUserFromToken(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return {
    id: payload.userId ?? payload.id ?? 0,
    name: payload.name ?? payload.sub?.split("@")[0] ?? "",
    lastname: payload.lastname ?? "",
    email: payload.sub ?? payload.email ?? "",
    role: payload.role ?? payload.authorities?.[0] ?? "OPERATOR_LOGISTICS",
    tenantId: payload.tenantId ?? undefined,
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> => {
    const response = await api.post(API_URLS.AUTH.LOGIN, credentials);
    const { token } = response.data;
    const user = extractUserFromToken(token);
    if (!user) throw new Error("No se pudo decodificar el token de sesión");
    return { user, token };
  },

  register: async (data: RegisterData): Promise<{ token: string; message: string }> => {
    const response = await api.post(API_URLS.AUTH.REGISTER, data);
    return response.data;
  },

  onboarding: async (data: OnboardingData): Promise<{ token: string; message: string }> => {
    const response = await api.post(API_URLS.AUTH.ONBOARDING, data);
    return response.data;
  },

  recoverPassword: async (email: string): Promise<void> => {
    await api.post(API_URLS.AUTH.RECOVER, { email });
  },

  getCurrentUser: (): AuthUser | null => {
    const stored = localStorage.getItem("logiair-auth");
    if (!stored) return null;
    try {
      const { state } = JSON.parse(stored);
      return state?.user || null;
    } catch {
      return null;
    }
  },
};
