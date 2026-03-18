import api from "./api";
import { API_URLS } from "@/constants/apiUrls";

export interface DashboardResponse {
  totalAirWaybills: number;
  pendingAirWaybills: number;
  totalCustomers: number;
  totalInvoices: number;
  recentAirWaybills: any[];
  chartData: Array<{ date: string; imports: number; exports: number }>;
}

interface DateRangeParams {
  startDate: string;
  endDate: string;
}

export const reportService = {
  getDashboard: async (): Promise<DashboardResponse> => {
    const response = await api.get(API_URLS.REPORTS.DASHBOARD);
    return response.data;
  },

  getOperations: async (params: DateRangeParams): Promise<any> => {
    const response = await api.get(API_URLS.REPORTS.OPERATIONS, { params });
    return response.data;
  },

  getCustomerReport: async (): Promise<any> => {
    const response = await api.get(API_URLS.REPORTS.CUSTOMERS);
    return response.data;
  },

  getInvoicingReport: async (params: DateRangeParams): Promise<any> => {
    const response = await api.get(API_URLS.REPORTS.INVOICING, { params });
    return response.data;
  },

  getCommissions: async (params: DateRangeParams): Promise<any> => {
    const response = await api.get(API_URLS.REPORTS.COMMISSIONS, { params });
    return response.data;
  },

  exportReport: async (reportType: string, format: string, params?: DateRangeParams): Promise<Blob> => {
    const response = await api.get(API_URLS.REPORTS.EXPORT(reportType), {
      params: { format, ...params },
      responseType: "blob",
    });
    return response.data;
  },
};
