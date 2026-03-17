import api from "./api";
import { API_URLS } from "@/constants/apiUrls";
import type { Invoice, InvoiceStatus, PageResponse } from "@/lib/types";

interface InvoiceListParams {
  search?: string;
  status?: string;
  page?: number;
  size?: number;
}

export const invoiceService = {
  getInvoices: async (params?: InvoiceListParams): Promise<PageResponse<Invoice>> => {
    const queryParams: Record<string, any> = {};
    if (params?.page !== undefined) queryParams.page = params.page;
    if (params?.size) queryParams.size = params.size;

    if (params?.status) {
      const response = await api.get(API_URLS.INVOICES.BY_STATUS(params.status), {
        params: queryParams,
      });
      return response.data;
    }

    const response = await api.get(API_URLS.INVOICES.BASE, { params: queryParams });
    return response.data;
  },

  getInvoice: async (id: number | string): Promise<Invoice> => {
    const response = await api.get(API_URLS.INVOICES.BY_ID(id));
    return response.data;
  },

  createInvoice: async (data: Partial<Invoice> & { customerId?: number }): Promise<Invoice> => {
    const response = await api.post(API_URLS.INVOICES.BASE, data);
    return response.data;
  },

  updateInvoice: async (id: number | string, data: Partial<Invoice> & { customerId?: number }): Promise<Invoice> => {
    const response = await api.put(API_URLS.INVOICES.BY_ID(id), data);
    return response.data;
  },

  updateStatus: async (id: number | string, status: InvoiceStatus): Promise<Invoice> => {
    const response = await api.put(API_URLS.INVOICES.BY_ID(id), { status });
    return response.data;
  },

  deleteInvoice: async (id: number | string): Promise<void> => {
    await api.delete(API_URLS.INVOICES.BY_ID(id));
  },
};
