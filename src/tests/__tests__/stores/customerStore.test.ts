import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCustomerStore } from "@/stores/customerStore";

const mockGetCustomers = vi.fn();
const mockGetCustomerList = vi.fn();
const mockCreateCustomer = vi.fn();
const mockDeleteCustomer = vi.fn();

vi.mock("@/services/customerService", () => ({
  customerService: {
    getCustomers: (...args: any[]) => mockGetCustomers(...args),
    getCustomerList: (...args: any[]) => mockGetCustomerList(...args),
    getCustomer: vi.fn(),
    createCustomer: (...args: any[]) => mockCreateCustomer(...args),
    updateCustomer: vi.fn(),
    deleteCustomer: (...args: any[]) => mockDeleteCustomer(...args),
  },
}));

describe("customerStore", () => {
  beforeEach(() => {
    useCustomerStore.setState({
      customers: [],
      customerList: [],
      currentCustomer: null,
      loading: false,
      error: null,
      pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 },
    });
    vi.clearAllMocks();
  });

  it("fetchCustomers sets customers from paginated response", async () => {
    mockGetCustomers.mockResolvedValue({ content: [{ id: 1 }], number: 0, size: 20, totalElements: 1, totalPages: 1 });
    await useCustomerStore.getState().fetchCustomers({ page: 0 });
    expect(useCustomerStore.getState().customers).toEqual([{ id: 1 }]);
  });

  it("fetchCustomers handles array response", async () => {
    mockGetCustomers.mockResolvedValue([{ id: 1 }]);
    await useCustomerStore.getState().fetchCustomers();
    expect(useCustomerStore.getState().customers).toEqual([{ id: 1 }]);
  });

  it("fetchCustomerList sets customerList", async () => {
    mockGetCustomerList.mockResolvedValue([{ id: 1, companyName: "Test" }]);
    await useCustomerStore.getState().fetchCustomerList();
    expect(useCustomerStore.getState().customerList).toHaveLength(1);
  });

  it("createCustomer adds to beginning", async () => {
    useCustomerStore.setState({ customers: [{ id: 1 }] as any });
    mockCreateCustomer.mockResolvedValue({ id: 2, companyName: "New" });
    const result = await useCustomerStore.getState().createCustomer({ companyName: "New" });
    expect(result.id).toBe(2);
    expect(useCustomerStore.getState().customers[0].id).toBe(2);
  });

  it("deleteCustomer removes from list", async () => {
    useCustomerStore.setState({ customers: [{ id: 1 }, { id: 2 }] as any });
    mockDeleteCustomer.mockResolvedValue(undefined);
    await useCustomerStore.getState().deleteCustomer(1);
    expect(useCustomerStore.getState().customers).toHaveLength(1);
  });

  it("sets error on fetch failure", async () => {
    mockGetCustomers.mockRejectedValue({ message: "Error" });
    await useCustomerStore.getState().fetchCustomers();
    expect(useCustomerStore.getState().error).toBe("Error");
  });
});
