export type UserRole = "ADMIN" | "OPERATOR_LOGISTICS" | "ADMINISTRATION" | "CUSTOMER";

export interface User {
  id: number;
  name: string;
  lastname?: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type OperationType = "IMPORT" | "EXPORT";

export type AWBStatus =
  | "PRE_ALERT"
  | "AWB_REGISTERED"
  | "MANIFEST_DECONSOLIDATED"
  | "CUSTOMS_PRESENTED"
  | "CUSTOMS_CLEARED"
  | "MANIFEST_REGISTERED"
  | "PROCESS_COMPLETED"
  | "INVOICED";

export interface Customer {
  id: number;
  companyName: string;
  taxId: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AirWaybill {
  id: number;
  awbNumber: string;
  operationType: OperationType;
  airline: string;
  origin: string;
  destination: string;
  arrivalOrDepartureDate: string;
  status: AWBStatus;
  manifestNumber?: string;
  observations?: string;
  customer: Customer;
  createdBy?: User;
  createdAt: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  serviceDescription: string;
  amount: number;
  agencyCommission?: number;
  airWaybillId?: number;
}

/** Frontend-only shape used in create/edit forms */
export interface InvoiceItemFormData {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  airWaybillId?: number;
}

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customer: Customer;
  invoiceDate: string;
  totalAmount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt?: string;
}

// Spring Boot Page response
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
