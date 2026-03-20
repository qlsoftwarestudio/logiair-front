import { vi } from "vitest";

export const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
};

vi.mock("@/services/api", () => ({ default: mockApi }));

export function mockGetSuccess(data: any) {
  mockApi.get.mockResolvedValueOnce({ data });
}

export function mockPostSuccess(data: any) {
  mockApi.post.mockResolvedValueOnce({ data });
}

export function mockPutSuccess(data: any) {
  mockApi.put.mockResolvedValueOnce({ data });
}

export function mockDeleteSuccess() {
  mockApi.delete.mockResolvedValueOnce({});
}

export function mockApiError(status: number, message: string) {
  const error = {
    response: { status, data: { message } },
    message,
  };
  return error;
}

export function resetApiMocks() {
  mockApi.get.mockReset();
  mockApi.post.mockReset();
  mockApi.put.mockReset();
  mockApi.patch.mockReset();
  mockApi.delete.mockReset();
}
