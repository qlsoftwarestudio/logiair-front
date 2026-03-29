import api from "./api";
import { API_URLS } from "@/constants/apiUrls";
import type { Invoice, InvoiceStatus, PageResponse } from "@/lib/types";

interface InvoiceListParams {
  search?: string;
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export const invoiceService = {
  getInvoices: async (params?: InvoiceListParams): Promise<PageResponse<Invoice>> => {
    const queryParams: Record<string, any> = {};
    if (params?.page !== undefined) queryParams.page = params.page;
    if (params?.size) queryParams.size = params.size;
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.sortDir) queryParams.sortDir = params.sortDir;

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
    const response = await api.patch(API_URLS.INVOICES.STATUS(id), { status });
    return response.data;
  },

  deleteInvoice: async (id: number | string): Promise<void> => {
    await api.delete(API_URLS.INVOICES.BY_ID(id));
  },

  getByCustomerMonthly: async (customerId: number | string, month: number, year: number): Promise<Invoice[]> => {
    const response = await api.get(API_URLS.INVOICES.BY_CUSTOMER_MONTHLY(customerId), {
      params: { month, year },
    });
    return response.data;
  },

  generateMonthly: async (month: number, year: number, customerId?: number): Promise<Invoice> => {
    const params: Record<string, any> = { month, year };
    if (customerId) params.customerId = customerId;
    const response = await api.post(API_URLS.INVOICES.GENERATE_MONTHLY, null, { params });
    return response.data;
  },

  exportInvoice: async (id: number | string, format: "pdf" | "excel" = "pdf"): Promise<Blob> => {
    const response = await api.get(API_URLS.INVOICES.EXPORT(id), {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  },

  exportDateRange: async (params: {
    startDate: string;
    endDate: string;
    companyName?: string;
    includeCharts?: boolean;
    format?: "excel" | "pdf";
  }): Promise<Blob> => {
    const queryParams: Record<string, any> = {
      startDate: params.startDate,
      endDate: params.endDate,
      format: params.format || "excel",
    };
    if (params.companyName) queryParams.companyName = params.companyName;
    if (params.includeCharts) queryParams.includeCharts = params.includeCharts;

    const response = await api.get(API_URLS.INVOICES.EXPORT_DATERANGE, {
      params: queryParams,
      responseType: "blob",
    });
    return response.data;
  },

  /** @deprecated Usar exportInvoice(id, "pdf") */
  exportPDF: async (id: number | string): Promise<Blob> => {
    return invoiceService.exportInvoice(id, "pdf");
  },
};
