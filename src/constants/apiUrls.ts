export const API_URLS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ONBOARDING: "/auth/onboarding",
    RECOVER: "/auth/recover",
  },
  AWBS: {
    BASE: "/api/air-waybills",
    BY_ID: (id: number | string) => `/api/air-waybills/${id}`,
    STATUS: (id: number | string) => `/api/air-waybills/${id}/status`,
    SEARCH: "/api/air-waybills/search",
    BY_STATUS: (status: string) => `/api/air-waybills/status/${status}`,
    BY_CUSTOMER: (customerId: number | string) => `/api/air-waybills/customer/${customerId}`,
    PENDING: "/api/air-waybills/pending",
  },
  CUSTOMERS: {
    BASE: "/api/customers",
    BY_ID: (id: number | string) => `/api/customers/${id}`,
    SEARCH: "/api/customers/search",
    LIST: "/api/customers/list",
  },
  INVOICES: {
    BASE: "/api/invoices",
    BY_ID: (id: number | string) => `/api/invoices/${id}`,
    BY_STATUS: (status: string) => `/api/invoices/status/${status}`,
    BY_CUSTOMER: (customerId: number | string) => `/api/invoices/customer/${customerId}`,
  },
} as const;
