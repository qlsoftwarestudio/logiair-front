import { describe, it, expect, beforeEach } from "vitest";
import { mockApi, mockGetSuccess, resetApiMocks } from "@/test/helpers/mocks/api";
import { reportService } from "@/services/reportService";

describe("reportService", () => {
  beforeEach(() => resetApiMocks());

  it("getDashboard calls dashboard endpoint", async () => {
    const data = { totalAirWaybills: 10, pendingAirWaybills: 2, totalCustomers: 5, totalInvoices: 3 };
    mockGetSuccess(data);
    const result = await reportService.getDashboard();
    expect(mockApi.get).toHaveBeenCalledWith("/api/reports/dashboard");
    expect(result.totalAirWaybills).toBe(10);
  });

  it("getOperations calls with date params", async () => {
    mockGetSuccess([]);
    await reportService.getOperations({ startDate: "2024-01-01", endDate: "2024-03-31" });
    expect(mockApi.get).toHaveBeenCalledWith("/api/reports/operations", {
      params: { startDate: "2024-01-01", endDate: "2024-03-31" },
    });
  });

  it("getCustomerReport calls customers endpoint", async () => {
    mockGetSuccess([]);
    await reportService.getCustomerReport();
    expect(mockApi.get).toHaveBeenCalledWith("/api/reports/customers");
  });

  it("exportReport calls export with type and format", async () => {
    const blob = new Blob(["data"]);
    mockGetSuccess(blob);
    await reportService.exportReport("operations", "csv", { startDate: "2024-01-01", endDate: "2024-12-31" });
    expect(mockApi.get).toHaveBeenCalledWith("/api/reports/export/operations", {
      params: { format: "csv", startDate: "2024-01-01", endDate: "2024-12-31" },
      responseType: "blob",
    });
  });

  it("getInvoicingReport calls invoicing endpoint", async () => {
    mockGetSuccess({});
    await reportService.getInvoicingReport({ startDate: "2024-01-01", endDate: "2024-12-31" });
    expect(mockApi.get).toHaveBeenCalledWith("/api/reports/invoicing", {
      params: { startDate: "2024-01-01", endDate: "2024-12-31" },
    });
  });

  it("getCommissions calls commissions endpoint", async () => {
    mockGetSuccess({});
    await reportService.getCommissions({ startDate: "2024-01-01", endDate: "2024-06-30" });
    expect(mockApi.get).toHaveBeenCalledWith("/api/reports/commissions", {
      params: { startDate: "2024-01-01", endDate: "2024-06-30" },
    });
  });
});
