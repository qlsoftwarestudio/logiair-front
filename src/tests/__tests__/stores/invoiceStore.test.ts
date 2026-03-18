import { describe, it, expect, beforeEach, vi } from "vitest";
import { useInvoiceStore } from "@/stores/invoiceStore";

const mockGetInvoices = vi.fn();
const mockCreateInvoice = vi.fn();
const mockUpdateStatus = vi.fn();
const mockDeleteInvoice = vi.fn();

vi.mock("@/services/invoiceService", () => ({
  invoiceService: {
    getInvoices: (...args: any[]) => mockGetInvoices(...args),
    getInvoice: vi.fn(),
    createInvoice: (...args: any[]) => mockCreateInvoice(...args),
    updateInvoice: vi.fn(),
    updateStatus: (...args: any[]) => mockUpdateStatus(...args),
    deleteInvoice: (...args: any[]) => mockDeleteInvoice(...args),
    getByCustomerMonthly: vi.fn(),
    generateMonthly: vi.fn(),
    exportPDF: vi.fn(),
  },
}));

describe("invoiceStore", () => {
  beforeEach(() => {
    useInvoiceStore.setState({
      invoices: [],
      currentInvoice: null,
      loading: false,
      error: null,
      pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 },
    });
    vi.clearAllMocks();
  });

  it("fetchInvoices sets invoices from paginated response", async () => {
    mockGetInvoices.mockResolvedValue({ content: [{ id: 1 }], number: 0, size: 20, totalElements: 1, totalPages: 1 });
    await useInvoiceStore.getState().fetchInvoices({ page: 0 });
    expect(useInvoiceStore.getState().invoices).toEqual([{ id: 1 }]);
  });

  it("fetchInvoices handles array response", async () => {
    mockGetInvoices.mockResolvedValue([{ id: 1 }]);
    await useInvoiceStore.getState().fetchInvoices();
    expect(useInvoiceStore.getState().invoices).toEqual([{ id: 1 }]);
  });

  it("createInvoice adds to beginning", async () => {
    useInvoiceStore.setState({ invoices: [{ id: 1 }] as any });
    mockCreateInvoice.mockResolvedValue({ id: 2 });
    const result = await useInvoiceStore.getState().createInvoice({ totalAmount: 100 });
    expect(result.id).toBe(2);
    expect(useInvoiceStore.getState().invoices[0].id).toBe(2);
  });

  it("updateStatus updates invoice in list", async () => {
    useInvoiceStore.setState({ invoices: [{ id: 1, status: "DRAFT" }] as any });
    mockUpdateStatus.mockResolvedValue({ id: 1, status: "PAID" });
    await useInvoiceStore.getState().updateStatus(1, "PAID");
    expect(useInvoiceStore.getState().invoices[0].status).toBe("PAID");
  });

  it("deleteInvoice removes from list", async () => {
    useInvoiceStore.setState({ invoices: [{ id: 1 }, { id: 2 }] as any });
    mockDeleteInvoice.mockResolvedValue(undefined);
    await useInvoiceStore.getState().deleteInvoice(1);
    expect(useInvoiceStore.getState().invoices).toHaveLength(1);
  });

  it("sets error on failure", async () => {
    mockGetInvoices.mockRejectedValue({ message: "Server error" });
    await useInvoiceStore.getState().fetchInvoices();
    expect(useInvoiceStore.getState().error).toBe("Server error");
  });
});
