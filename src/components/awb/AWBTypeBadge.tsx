import type { AWBType } from "@/lib/types";

interface AWBTypeBadgeProps {
  type?: AWBType;
}

export function AWBTypeBadge({ type }: AWBTypeBadgeProps) {
  if (!type) return <span className="text-xs text-muted-foreground">—</span>;

  const styles = {
    MASTER: "bg-chart-2/15 text-chart-2 font-bold",
    HOUSE: "bg-chart-5/15 text-chart-5 font-bold",
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded ${styles[type]}`}>
      {type}
    </span>
  );
}
