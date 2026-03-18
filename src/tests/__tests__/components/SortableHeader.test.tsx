import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SortableHeader, toggleSort } from "@/components/molecules/SortableHeader";

describe("SortableHeader", () => {
  it("renders label", () => {
    render(
      <table><thead><tr>
        <SortableHeader label="Nombre" field="name" currentField={null} currentDir={null} onSort={vi.fn()} />
      </tr></thead></table>
    );
    expect(screen.getByText("Nombre")).toBeInTheDocument();
  });

  it("calls onSort with field when clicked", () => {
    const onSort = vi.fn();
    render(
      <table><thead><tr>
        <SortableHeader label="Nombre" field="name" currentField={null} currentDir={null} onSort={onSort} />
      </tr></thead></table>
    );
    fireEvent.click(screen.getByText("Nombre"));
    expect(onSort).toHaveBeenCalledWith("name");
  });
});

describe("toggleSort", () => {
  it("returns asc for new field", () => {
    expect(toggleSort("name", null, null)).toEqual({ field: "name", dir: "asc" });
  });

  it("returns desc when currently asc", () => {
    expect(toggleSort("name", "name", "asc")).toEqual({ field: "name", dir: "desc" });
  });

  it("returns null dir when currently desc", () => {
    expect(toggleSort("name", "name", "desc")).toEqual({ field: "name", dir: null });
  });

  it("returns asc when switching fields", () => {
    expect(toggleSort("email", "name", "desc")).toEqual({ field: "email", dir: "asc" });
  });
});
