import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAWBStore } from "@/stores/awbStore";

const mockGetAWBs = vi.fn();
const mockGetAWB = vi.fn();
const mockCreateAWB = vi.fn();
const mockDeleteAWB = vi.fn();

vi.mock("@/services/awbService", () => ({
  awbService: {
    getAWBs: (...args: any[]) => mockGetAWBs(...args),
    getAWB: (...args: any[]) => mockGetAWB(...args),
    createAWB: (...args: any[]) => mockCreateAWB(...args),
    updateAWB: vi.fn(),
    updateStatus: vi.fn(),
    deleteAWB: (...args: any[]) => mockDeleteAWB(...args),
    getPendingAWBs: vi.fn(),
    getAWBsByCustomer: vi.fn(),
  },
}));

describe("awbStore", () => {
  beforeEach(() => {
    useAWBStore.setState({
      awbs: [],
      currentAWB: null,
      loading: false,
      error: null,
      filters: {},
      pagination: { page: 0, size: 20, totalElements: 0, totalPages: 0 },
    });
    vi.clearAllMocks();
  });

  it("fetchAWBs sets awbs and pagination from paginated response", async () => {
    const page = { content: [{ id: 1 }], totalElements: 1, totalPages: 1, number: 0, size: 20 };
    mockGetAWBs.mockResolvedValue(page);

    await useAWBStore.getState().fetchAWBs({ page: 0 });

    const state = useAWBStore.getState();
    expect(state.awbs).toEqual([{ id: 1 }]);
    expect(state.pagination.totalElements).toBe(1);
    expect(state.loading).toBe(false);
  });

  it("fetchAWBs handles array response", async () => {
    mockGetAWBs.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    await useAWBStore.getState().fetchAWBs();

    expect(useAWBStore.getState().awbs).toHaveLength(2);
  });

  it("fetchAWBs sets error on failure", async () => {
    mockGetAWBs.mockRejectedValue({ message: "Network error" });

    await useAWBStore.getState().fetchAWBs();

    expect(useAWBStore.getState().error).toBe("Network error");
  });

  it("createAWB adds to beginning of list", async () => {
    useAWBStore.setState({ awbs: [{ id: 1 }] as any });
    mockCreateAWB.mockResolvedValue({ id: 2, awbNumber: "AWB-002" });

    const result = await useAWBStore.getState().createAWB({ awbNumber: "AWB-002" });

    expect(result.id).toBe(2);
    expect(useAWBStore.getState().awbs[0].id).toBe(2);
  });

  it("deleteAWB removes from list", async () => {
    useAWBStore.setState({ awbs: [{ id: 1 }, { id: 2 }] as any });
    mockDeleteAWB.mockResolvedValue(undefined);

    await useAWBStore.getState().deleteAWB(1);

    expect(useAWBStore.getState().awbs).toHaveLength(1);
    expect(useAWBStore.getState().awbs[0].id).toBe(2);
  });

  it("setFilters updates filters", () => {
    useAWBStore.getState().setFilters({ search: "test", status: "DELIVERED" });
    expect(useAWBStore.getState().filters).toEqual({ search: "test", status: "DELIVERED" });
  });

  it("clearCurrent resets currentAWB", () => {
    useAWBStore.setState({ currentAWB: { id: 1 } as any });
    useAWBStore.getState().clearCurrent();
    expect(useAWBStore.getState().currentAWB).toBeNull();
  });
});
