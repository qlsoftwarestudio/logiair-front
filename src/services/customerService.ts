import api from "./api";
import { API_URLS } from "@/constants/apiUrls";
import type { Customer, PageResponse } from "@/lib/types";

interface CustomerListParams {
  search?: string;
  page?: number;
  size?: number;
}

export const customerService = {
  getCustomers: async (params?: CustomerListParams): Promise<PageResponse<Customer>> => {
    const queryParams: Record<string, any> = {};
    if (params?.page !== undefined) queryParams.page = params.page;
    if (params?.size) queryParams.size = params.size;

    if (params?.search) {
      const response = await api.get(API_URLS.CUSTOMERS.SEARCH, {
        params: { search: params.search, ...queryParams },
      });
      return response.data;
    }

    const response = await api.get(API_URLS.CUSTOMERS.BASE, { params: queryParams });
    return response.data;
  },

  // For select dropdowns - returns all customers without pagination
  getCustomerList: async (): Promise<Customer[]> => {
    const response = await api.get(API_URLS.CUSTOMERS.LIST);
    return response.data;
  },

  getCustomer: async (id: number | string): Promise<Customer> => {
    const response = await api.get(API_URLS.CUSTOMERS.BY_ID(id));
    return response.data;
  },

  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const response = await api.post(API_URLS.CUSTOMERS.BASE, data);
    return response.data;
  },

  updateCustomer: async (id: number | string, data: Partial<Customer>): Promise<Customer> => {
    const response = await api.put(API_URLS.CUSTOMERS.BY_ID(id), data);
    return response.data;
  },

  deleteCustomer: async (id: number | string): Promise<void> => {
    await api.delete(API_URLS.CUSTOMERS.BY_ID(id));
  },
};
