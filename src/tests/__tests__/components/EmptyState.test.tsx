import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "@/components/molecules/EmptyState";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="No hay datos" />);
    expect(screen.getByText("No hay datos")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<EmptyState title="Vacío" description="Agrega algo" />);
    expect(screen.getByText("Agrega algo")).toBeInTheDocument();
  });

  it("renders action button and fires callback", () => {
    const onClick = vi.fn();
    render(<EmptyState title="Vacío" actionLabel="Crear" onAction={onClick} />);
    fireEvent.click(screen.getByText("Crear"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not render button without actionLabel", () => {
    render(<EmptyState title="Vacío" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
