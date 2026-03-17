// Mock data removed - app now consumes real backend API
// This file is kept for backward compatibility but exports empty arrays

import type { AirWaybill, Customer, Invoice } from "./types";

export const mockAWBs: AirWaybill[] = [];
export const mockServices: any[] = [];
export const mockClients: Customer[] = [];
export const mockInvoices: Invoice[] = [];

export const currentUser = {
  id: 0,
  name: "Usuario",
  email: "",
  role: "ADMIN" as const,
  avatar: "",
};
