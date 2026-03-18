import type { AWBStatus } from "@/lib/types";

export type AWBState = AWBStatus;

export const AWB_STATUSES: AWBStatus[] = [
  "PRE_ALERT",
  "AWB_REGISTERED",
  "MANIFEST_DECONSOLIDATED",
  "CUSTOMS_PRESENTED",
  "CUSTOMS_CLEARED",
  "MANIFEST_REGISTERED",
  "PROCESS_COMPLETED",
  "INVOICED",
];

/**
 * Allowed transitions map – mirrors the backend enum logic.
 * CUSTOMS_PRESENTED has two possible next states (bifurcation).
 */
export const AWB_TRANSITIONS: Record<AWBStatus, AWBStatus[]> = {
  PRE_ALERT: ["AWB_REGISTERED"],
  AWB_REGISTERED: ["MANIFEST_DECONSOLIDATED"],
  MANIFEST_DECONSOLIDATED: ["CUSTOMS_PRESENTED"],
  CUSTOMS_PRESENTED: ["CUSTOMS_CLEARED", "MANIFEST_REGISTERED"],
  CUSTOMS_CLEARED: [],
  MANIFEST_REGISTERED: ["PROCESS_COMPLETED"],
  PROCESS_COMPLETED: ["INVOICED"],
  INVOICED: [],
};

/** Linear workflow for timeline display (main path) */
export const AWB_WORKFLOW: AWBStatus[] = [
  "PRE_ALERT",
  "AWB_REGISTERED",
  "MANIFEST_DECONSOLIDATED",
  "CUSTOMS_PRESENTED",
  "MANIFEST_REGISTERED",
  "PROCESS_COMPLETED",
  "INVOICED",
];

/** Side-branch status that forks from CUSTOMS_PRESENTED */
export const AWB_BRANCH_STATUS: AWBStatus = "CUSTOMS_CLEARED";

export const STATUS_LABELS: Record<AWBStatus, string> = {
  PRE_ALERT: "Pre Alerta",
  AWB_REGISTERED: "Guía Registrada",
  MANIFEST_DECONSOLIDATED: "Manifiesto Desconsolidado",
  CUSTOMS_PRESENTED: "Presentado en Aduana",
  CUSTOMS_CLEARED: "Despacho Liberado",
  MANIFEST_REGISTERED: "Manifiesto Registrado",
  PROCESS_COMPLETED: "Proceso Completado",
  INVOICED: "Facturado",
};

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PRE_ALERT: { bg: "bg-warning/15", text: "text-warning" },
  AWB_REGISTERED: { bg: "bg-primary/15", text: "text-primary" },
  MANIFEST_DECONSOLIDATED: { bg: "bg-accent/15", text: "text-accent" },
  CUSTOMS_PRESENTED: { bg: "bg-chart-4/15", text: "text-chart-4" },
  CUSTOMS_CLEARED: { bg: "bg-success/15", text: "text-success" },
  MANIFEST_REGISTERED: { bg: "bg-primary/15", text: "text-primary" },
  PROCESS_COMPLETED: { bg: "bg-chart-4/15", text: "text-chart-4" },
  INVOICED: { bg: "bg-success/15", text: "text-success" },
};
