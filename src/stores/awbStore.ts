import { create } from "zustand";
import { awbService } from "@/services/awbService";
import type { AirWaybill, AWBStatus } from "@/lib/types";

interface AWBFilters {
  search?: string;
  status?: string;
  type?: string;
}

interface Pagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface AWBStoreState {
  awbs: AirWaybill[];
  currentAWB: AirWaybill | null;
  loading: boolean;
  error: string | null;
  filters: AWBFilters;
  pagination: Pagination;
  fetchAWBs: (params?: AWBFilters & { page?: number; size?: number }) => Promise<void>;
  fetchAWB: (id: string | number) => Promise<void>;
  createAWB: (data: any) => Promise<AirWaybill>;
  updateAWB: (id: string | number, data: any) => Promise<void>;
  updateStatus: (id: string | number, status: AWBStatus, observations?: string) => Promise<void>;
  deleteAWB: (id: string | number) => Promise<void>;
  setFilters: (filters: AWBFilters) => void;
  clearCurrent: () => void;
}

export const useAWBStore = create<AWBStoreState>((set, get) => ({
  awbs: [],
  currentAWB: null,
  loading: false,
  error: null,
  filters: {},
  pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 },

  fetchAWBs: async (params) => {
    set({ loading: true, error: null });
    try {
      const filters = params || get().filters;
      const result = await awbService.getAWBs({
        ...filters,
        page: params?.page ?? get().pagination.page,
        size: params?.size ?? get().pagination.size,
      });
      // Handle both paginated and array responses
      if (Array.isArray(result)) {
        set({ awbs: result, loading: false });
      } else {
        set({
          awbs: result.content,
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

  fetchAWB: async (id) => {
    set({ loading: true, error: null });
    try {
      const awb = await awbService.getAWB(id);
      set({ currentAWB: awb, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  createAWB: async (data) => {
    set({ loading: true, error: null });
    try {
      const newAWB = await awbService.createAWB(data);
      set((s) => ({ awbs: [newAWB, ...s.awbs], loading: false }));
      return newAWB;
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  updateAWB: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await awbService.updateAWB(id, data);
      set((s) => ({
        awbs: s.awbs.map((a) => (a.id === updated.id ? updated : a)),
        currentAWB: s.currentAWB?.id === updated.id ? updated : s.currentAWB,
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  updateStatus: async (id, status, observations) => {
    set({ loading: true, error: null });
    try {
      const updated = await awbService.updateStatus(id, status, observations);
      set((s) => ({
        awbs: s.awbs.map((a) => (a.id === updated.id ? updated : a)),
        currentAWB: s.currentAWB?.id === updated.id ? updated : s.currentAWB,
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  deleteAWB: async (id) => {
    set({ loading: true, error: null });
    try {
      await awbService.deleteAWB(id);
      set((s) => ({
        awbs: s.awbs.filter((a) => a.id !== Number(id)),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  setFilters: (filters) => set({ filters }),
  clearCurrent: () => set({ currentAWB: null }),
}));
