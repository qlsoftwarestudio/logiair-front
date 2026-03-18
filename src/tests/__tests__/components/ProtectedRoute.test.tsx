import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProtectedRoute } from "@/components/templates/ProtectedRoute";
import { useAuthStore } from "@/stores/authStore";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  });

  it("redirects when not authenticated", () => {
    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute><span>Protected</span></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByText("Protected")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: 1, name: "T", email: "t@t.com", role: "ADMIN" } });
    render(
      <MemoryRouter>
        <ProtectedRoute><span>Protected</span></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText("Protected")).toBeInTheDocument();
  });

  it("shows access denied when missing permission", () => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: 1, name: "T", email: "t@t.com", role: "CUSTOMER" } });
    render(
      <MemoryRouter>
        <ProtectedRoute permission="users.create"><span>Admin Only</span></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText("Acceso denegado")).toBeInTheDocument();
    expect(screen.queryByText("Admin Only")).not.toBeInTheDocument();
  });

  it("renders children when has permission", () => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: 1, name: "T", email: "t@t.com", role: "ADMIN" } });
    render(
      <MemoryRouter>
        <ProtectedRoute permission="users.create"><span>Admin Only</span></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText("Admin Only")).toBeInTheDocument();
  });
});
