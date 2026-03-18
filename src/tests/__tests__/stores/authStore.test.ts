import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "@/stores/authStore";

const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock("@/services/authService", () => ({
  authService: {
    login: (...args: any[]) => mockLogin(...args),
    register: (...args: any[]) => mockRegister(...args),
  },
}));

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
    mockLogin.mockReset();
    mockRegister.mockReset();
  });

  it("login sets user and token on success", async () => {
    const user = { id: 1, name: "Test", email: "t@t.com", role: "ADMIN" as const };
    mockLogin.mockResolvedValue({ user, token: "jwt123" });

    await useAuthStore.getState().login({ email: "t@t.com", password: "p" });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.token).toBe("jwt123");
    expect(state.loading).toBe(false);
  });

  it("login sets error on failure", async () => {
    mockLogin.mockRejectedValue({ response: { data: { message: "Bad credentials" } } });

    await expect(useAuthStore.getState().login({ email: "a", password: "b" })).rejects.toBeTruthy();

    expect(useAuthStore.getState().error).toBe("Bad credentials");
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("logout clears state", () => {
    useAuthStore.setState({ user: { id: 1, name: "T", email: "t@t.com", role: "ADMIN" }, token: "t", isAuthenticated: true });
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("hasPermission returns true for valid permission", () => {
    useAuthStore.setState({ user: { id: 1, name: "T", email: "t@t.com", role: "ADMIN" } });
    expect(useAuthStore.getState().hasPermission("users.create")).toBe(true);
  });

  it("hasPermission returns false for invalid permission", () => {
    useAuthStore.setState({ user: { id: 1, name: "T", email: "t@t.com", role: "CUSTOMER" } });
    expect(useAuthStore.getState().hasPermission("users.create")).toBe(false);
  });

  it("hasPermission returns false when no user", () => {
    expect(useAuthStore.getState().hasPermission("dashboard.view")).toBe(false);
  });

  it("clearError clears error", () => {
    useAuthStore.setState({ error: "some error" });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});
