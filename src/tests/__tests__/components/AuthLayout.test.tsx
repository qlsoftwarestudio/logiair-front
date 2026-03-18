import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthLayout } from "@/components/templates/AuthLayout";

describe("AuthLayout", () => {
  it("renders title", () => {
    render(<AuthLayout title="Login">content</AuthLayout>);
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<AuthLayout title="Login" subtitle="Enter creds">content</AuthLayout>);
    expect(screen.getByText("Enter creds")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<AuthLayout title="Login"><span>child</span></AuthLayout>);
    expect(screen.getByText("child")).toBeInTheDocument();
  });
});
