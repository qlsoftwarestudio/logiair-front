import api from "./api";
import { API_URLS } from "@/constants/apiUrls";
import type { AirWaybill, AWBStatus, PageResponse } from "@/lib/types";

interface AWBListParams {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export const awbService = {
  getAWBs: async (params?: AWBListParams): Promise<PageResponse<AirWaybill>> => {
    const queryParams: Record<string, any> = {};
    if (params?.page !== undefined) queryParams.page = params.page;
    if (params?.size) queryParams.size = params.size;
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.sortDir) queryParams.sortDir = params.sortDir;

    if (params?.search) {
      const response = await api.get(API_URLS.AWBS.SEARCH, {
        params: { search: params.search, ...queryParams },
      });
      return response.data;
    }

    if (params?.status) {
      const response = await api.get(API_URLS.AWBS.BY_STATUS(params.status), {
        params: queryParams,
      });
      return response.data;
    }

    const response = await api.get(API_URLS.AWBS.BASE, { params: queryParams });
    return response.data;
  },

  getAWB: async (id: number | string): Promise<AirWaybill> => {
    const response = await api.get(API_URLS.AWBS.BY_ID(id));
    return response.data;
  },

  createAWB: async (data: Partial<AirWaybill> & { customerId?: number }): Promise<AirWaybill> => {
    const response = await api.post(API_URLS.AWBS.BASE, data);
    return response.data;
  },

  updateAWB: async (id: number | string, data: Partial<AirWaybill> & { customerId?: number }): Promise<AirWaybill> => {
    const response = await api.put(API_URLS.AWBS.BY_ID(id), data);
    return response.data;
  },

  updateStatus: async (id: number | string, status: AWBStatus, observations?: string): Promise<AirWaybill> => {
    const response = await api.put(API_URLS.AWBS.STATUS(id), { status, observations });
    return response.data;
  },

  deleteAWB: async (id: number | string): Promise<void> => {
    await api.delete(API_URLS.AWBS.BY_ID(id));
  },

  getPendingAWBs: async (): Promise<AirWaybill[]> => {
    const response = await api.get(API_URLS.AWBS.PENDING);
    return response.data;
  },

  getAWBsByCustomer: async (customerId: number | string): Promise<AirWaybill[]> => {
    const response = await api.get(API_URLS.AWBS.BY_CUSTOMER(customerId));
    return Array.isArray(response.data) ? response.data : response.data.content || [];
  },
};
