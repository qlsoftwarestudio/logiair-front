import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OpTypeBadge } from "@/components/awb/OpTypeBadge";

describe("OpTypeBadge", () => {
  it("renders IMPO for IMPORT", () => {
    render(<OpTypeBadge type="IMPORT" />);
    expect(screen.getByText("IMPO")).toBeInTheDocument();
  });

  it("renders EXPO for EXPORT", () => {
    render(<OpTypeBadge type="EXPORT" />);
    expect(screen.getByText("EXPO")).toBeInTheDocument();
  });
});
