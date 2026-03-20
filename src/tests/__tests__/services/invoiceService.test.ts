import { describe, it, expect, beforeEach } from "vitest";
import { mockApi, mockGetSuccess, mockPostSuccess, mockPutSuccess, mockDeleteSuccess, resetApiMocks } from "@/test/helpers/mocks/api";
import { invoiceService } from "@/services/invoiceService";

describe("invoiceService", () => {
  beforeEach(() => resetApiMocks());

  it("getInvoices calls base URL", async () => {
    mockGetSuccess({ content: [], totalElements: 0 });
    await invoiceService.getInvoices({ page: 0, size: 10 });
    expect(mockApi.get).toHaveBeenCalledWith("/api/invoices", { params: { page: 0, size: 10 } });
  });

  it("getInvoices uses status endpoint when status provided", async () => {
    mockGetSuccess({ content: [] });
    await invoiceService.getInvoices({ status: "PAID", page: 0 });
    expect(mockApi.get).toHaveBeenCalledWith("/api/invoices/status/PAID", expect.any(Object));
  });

  it("getInvoice fetches by id", async () => {
    mockGetSuccess({ id: 1 });
    await invoiceService.getInvoice(1);
    expect(mockApi.get).toHaveBeenCalledWith("/api/invoices/1");
  });

  it("createInvoice posts data", async () => {
    mockPostSuccess({ id: 1 });
    await invoiceService.createInvoice({ totalAmount: 100 });
    expect(mockApi.post).toHaveBeenCalledWith("/api/invoices", { totalAmount: 100 });
  });

  it("updateStatus patches new status", async () => {
    mockApi.patch.mockResolvedValueOnce({ data: { id: 1, status: "PAID" } });
    await invoiceService.updateStatus(1, "PAID");
    expect(mockApi.patch).toHaveBeenCalledWith("/api/invoices/1/status", { status: "PAID" });
  });

  it("deleteInvoice calls delete", async () => {
    mockDeleteSuccess();
    await invoiceService.deleteInvoice(1);
    expect(mockApi.delete).toHaveBeenCalledWith("/api/invoices/1");
  });

  it("generateMonthly posts with params", async () => {
    mockPostSuccess({ id: 1 });
    await invoiceService.generateMonthly(3, 2024);
    expect(mockApi.post).toHaveBeenCalledWith("/api/invoices/generate-monthly", null, {
      params: { month: 3, year: 2024 },
    });
  });

  it("generateMonthly includes customerId when provided", async () => {
    mockPostSuccess({ id: 1 });
    await invoiceService.generateMonthly(3, 2024, 5);
    expect(mockApi.post).toHaveBeenCalledWith("/api/invoices/generate-monthly", null, {
      params: { month: 3, year: 2024, customerId: 5 },
    });
  });

  it("exportPDF fetches blob", async () => {
    const blob = new Blob(["pdf"]);
    mockGetSuccess(blob);
    const result = await invoiceService.exportPDF(1);
    expect(mockApi.get).toHaveBeenCalledWith("/api/invoices/export/1", {
      params: { format: "pdf" },
      responseType: "blob",
    });
    expect(result).toBe(blob);
  });

  it("getByCustomerMonthly fetches with month/year", async () => {
    mockGetSuccess([]);
    await invoiceService.getByCustomerMonthly(5, 3, 2024);
    expect(mockApi.get).toHaveBeenCalledWith("/api/invoices/customer/5/monthly", {
      params: { month: 3, year: 2024 },
    });
  });
});
