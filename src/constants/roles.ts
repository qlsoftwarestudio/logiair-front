export const ROLES = {
  ADMIN: "ADMIN",
  OPERATOR_LOGISTICS: "OPERATOR_LOGISTICS",
  ADMINISTRATION: "ADMINISTRATION",
  CUSTOMER: "CUSTOMER",
} as const;

export type UserRole = keyof typeof ROLES;

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  OPERATOR_LOGISTICS: "Operador Logístico",
  ADMINISTRATION: "Administración",
  CUSTOMER: "Cliente",
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: [
    "dashboard.view",
    "awbs.view", "awbs.create", "awbs.edit", "awbs.delete", "awbs.status",
    "customers.view", "customers.create", "customers.edit", "customers.delete",
    "invoices.view", "invoices.create", "invoices.edit", "invoices.delete",
    "reports.view", "reports.export",
    "users.view", "users.create", "users.edit", "users.delete",
    "config.view", "config.edit",
  ],
  OPERATOR_LOGISTICS: [
    "dashboard.view",
    "awbs.view", "awbs.create", "awbs.edit", "awbs.status",
    "customers.view", "customers.create", "customers.edit",
    "reports.view",
  ],
  ADMINISTRATION: [
    "dashboard.view",
    "awbs.view",
    "customers.view",
    "invoices.view", "invoices.create", "invoices.edit", "invoices.delete",
    "reports.view", "reports.export",
  ],
  CUSTOMER: [
    "dashboard.view",
    "awbs.view",
    "invoices.view",
  ],
};
