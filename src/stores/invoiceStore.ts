import { create } from "zustand";
import { invoiceService } from "@/services/invoiceService";
import type { Invoice, InvoiceStatus } from "@/lib/types";

interface Pagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  fetchInvoices: (params?: { search?: string; status?: string; page?: number; size?: number }) => Promise<void>;
  fetchInvoice: (id: string | number) => Promise<void>;
  createInvoice: (data: any) => Promise<Invoice>;
  updateInvoice: (id: string | number, data: any) => Promise<void>;
  updateStatus: (id: string | number, status: InvoiceStatus) => Promise<void>;
  deleteInvoice: (id: string | number) => Promise<void>;
  clearCurrent: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  currentInvoice: null,
  loading: false,
  error: null,
  pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 },

  fetchInvoices: async (params) => {
    set({ loading: true, error: null });
    try {
      const result = await invoiceService.getInvoices({
        ...params,
        page: params?.page ?? get().pagination.page,
        size: params?.size ?? get().pagination.size,
      });
      if (Array.isArray(result)) {
        set({ invoices: result, loading: false });
      } else {
        set({
          invoices: result.content,
          pagination: {
            page: result.number,
            size: result.size,
            totalElements: result.totalElements,
            totalPages: result.totalPages,
          },
          loading: false,
        });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  fetchInvoice: async (id) => {
    set({ loading: true, error: null });
    try {
      const invoice = await invoiceService.getInvoice(id);
      set({ currentInvoice: invoice, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  createInvoice: async (data) => {
    set({ loading: true, error: null });
    try {
      const newInvoice = await invoiceService.createInvoice(data);
      set((s) => ({ invoices: [newInvoice, ...s.invoices], loading: false }));
      return newInvoice;
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  updateInvoice: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await invoiceService.updateInvoice(id, data);
      set((s) => ({
        invoices: s.invoices.map((i) => (i.id === updated.id ? updated : i)),
        currentInvoice: s.currentInvoice?.id === updated.id ? updated : s.currentInvoice,
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  updateStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const updated = await invoiceService.updateStatus(id, status);
      set((s) => ({
        invoices: s.invoices.map((i) => (i.id === updated.id ? updated : i)),
        currentInvoice: s.currentInvoice?.id === updated.id ? updated : s.currentInvoice,
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  deleteInvoice: async (id) => {
    set({ loading: true, error: null });
    try {
      await invoiceService.deleteInvoice(id);
      set((s) => ({
        invoices: s.invoices.filter((i) => i.id !== Number(id)),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  clearCurrent: () => set({ currentInvoice: null }),
}));
