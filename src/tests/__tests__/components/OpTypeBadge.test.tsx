import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OpTypeBadge } from "@/components/awb/OpTypeBadge";

describe("OpTypeBadge", () => {
  it("renders IMPO for IMPO", () => {
    render(<OpTypeBadge type="IMPO" />);
    expect(screen.getByText("IMPO")).toBeInTheDocument();
  });

  it("renders EXPO for EXPO", () => {
    render(<OpTypeBadge type="EXPO" />);
    expect(screen.getByText("EXPO")).toBeInTheDocument();
  });
});
