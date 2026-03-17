import type { AWBStatus } from "@/lib/types";
import { STATUS_COLORS, STATUS_LABELS } from "@/constants/awbStatuses";

interface StatusBadgeProps {
  status: AWBStatus | string;
}

const fallback = { bg: "bg-secondary", text: "text-secondary-foreground" };

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_COLORS[status] ?? fallback;
  const label = STATUS_LABELS[status as AWBStatus] ?? status;
  return (
    <span className={`status-badge ${config.bg} ${config.text}`}>
      {label}
    </span>
  );
}
