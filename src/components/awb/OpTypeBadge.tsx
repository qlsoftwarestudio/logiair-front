import { OperationType } from "@/lib/types";

interface OpTypeBadgeProps {
  type: OperationType;
}

export function OpTypeBadge({ type }: OpTypeBadgeProps) {
  const isImport = type === "IMPORT";
  return (
    <span
      className={`status-badge ${
        isImport
          ? "bg-primary/15 text-primary"
          : "bg-success/15 text-success"
      }`}
    >
      {isImport ? "IMPO" : "EXPO"}
    </span>
  );
}
