import { create } from "zustand";
import { customerService } from "@/services/customerService";
import type { Customer } from "@/lib/types";

interface Pagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface CustomerState {
  customers: Customer[];
  customerList: Customer[]; // for select dropdowns
  currentCustomer: Customer | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  fetchCustomers: (params?: { search?: string; page?: number; size?: number }) => Promise<void>;
  fetchCustomerList: () => Promise<void>;
  fetchCustomer: (id: string | number) => Promise<void>;
  createCustomer: (data: Partial<Customer>) => Promise<Customer>;
  updateCustomer: (id: string | number, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string | number) => Promise<void>;
  clearCurrent: () => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  customerList: [],
  currentCustomer: null,
  loading: false,
  error: null,
  pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 },

  fetchCustomers: async (params) => {
    set({ loading: true, error: null });
    try {
      const result = await customerService.getCustomers({
        ...params,
        page: params?.page ?? get().pagination.page,
        size: params?.size ?? get().pagination.size,
      });
      if (Array.isArray(result)) {
        set({ customers: result, loading: false });
      } else {
        set({
          customers: result.content,
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

  fetchCustomerList: async () => {
    try {
      const list = await customerService.getCustomerList();
      set({ customerList: list });
    } catch (err: any) {
      // Fallback: use customers already loaded
      console.warn("Could not fetch customer list:", err.message);
    }
  },

  fetchCustomer: async (id) => {
    set({ loading: true, error: null });
    try {
      const customer = await customerService.getCustomer(id);
      set({ currentCustomer: customer, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  createCustomer: async (data) => {
    set({ loading: true, error: null });
    try {
      const newCustomer = await customerService.createCustomer(data);
      set((s) => ({ customers: [newCustomer, ...s.customers], loading: false }));
      return newCustomer;
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  updateCustomer: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await customerService.updateCustomer(id, data);
      set((s) => ({
        customers: s.customers.map((c) => (c.id === updated.id ? updated : c)),
        currentCustomer: s.currentCustomer?.id === updated.id ? updated : s.currentCustomer,
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  deleteCustomer: async (id) => {
    set({ loading: true, error: null });
    try {
      await customerService.deleteCustomer(id);
      set((s) => ({
        customers: s.customers.filter((c) => c.id !== Number(id)),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  clearCurrent: () => set({ currentCustomer: null }),
}));
