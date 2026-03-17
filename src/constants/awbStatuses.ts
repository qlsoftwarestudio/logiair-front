import type { AWBStatus } from "@/lib/types";

export type AWBState = AWBStatus;

export const AWB_STATUSES: AWBStatus[] = [
  "PRE_ALERT",
  "AWB_REGISTERED",
  "MANIFEST_DECONSOLIDATED",
  "CUSTOMS_PRESENTED",
  "CUSTOMS_CLEARED",
  "DELIVERED",
  "CANCELLED",
];

// Ordered workflow (excluding CANCELLED which is a side-status)
export const AWB_WORKFLOW: AWBStatus[] = [
  "PRE_ALERT",
  "AWB_REGISTERED",
  "MANIFEST_DECONSOLIDATED",
  "CUSTOMS_PRESENTED",
  "CUSTOMS_CLEARED",
  "DELIVERED",
];

export const STATUS_LABELS: Record<AWBStatus, string> = {
  PRE_ALERT: "Pre Alerta",
  AWB_REGISTERED: "Guía Registrada",
  MANIFEST_DECONSOLIDATED: "Manifiesto Desconsolidado",
  CUSTOMS_PRESENTED: "Presentado en Aduana",
  CUSTOMS_CLEARED: "Despacho Liberado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PRE_ALERT: { bg: "bg-warning/15", text: "text-warning" },
  AWB_REGISTERED: { bg: "bg-primary/15", text: "text-primary" },
  MANIFEST_DECONSOLIDATED: { bg: "bg-accent/15", text: "text-accent" },
  CUSTOMS_PRESENTED: { bg: "bg-chart-4/15", text: "text-chart-4" },
  CUSTOMS_CLEARED: { bg: "bg-primary/15", text: "text-primary" },
  DELIVERED: { bg: "bg-success/15", text: "text-success" },
  CANCELLED: { bg: "bg-destructive/15", text: "text-destructive" },
};
