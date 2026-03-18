import { describe, it, expect, beforeEach } from "vitest";
import { mockApi, mockGetSuccess, mockPostSuccess, mockDeleteSuccess, resetApiMocks } from "@/test/helpers/mocks/api";
import { userService } from "@/services/userService";

describe("userService", () => {
  beforeEach(() => resetApiMocks());

  it("getUsers calls /users with params", async () => {
    mockGetSuccess({ content: [], totalElements: 0 });
    await userService.getUsers({ page: 0, size: 10 });
    expect(mockApi.get).toHaveBeenCalledWith("/users", { params: { page: 0, size: 10 } });
  });

  it("getUsers passes sortBy", async () => {
    mockGetSuccess({ content: [] });
    await userService.getUsers({ page: 0, sortBy: "name" });
    expect(mockApi.get).toHaveBeenCalledWith("/users", { params: { page: 0, sortBy: "name" } });
  });

  it("getUser fetches by id", async () => {
    mockGetSuccess({ id: 1, name: "Test" });
    const result = await userService.getUser(1);
    expect(mockApi.get).toHaveBeenCalledWith("/users/1");
    expect(result.name).toBe("Test");
  });

  it("createUser posts data", async () => {
    mockPostSuccess({ id: 1 });
    await userService.createUser({ name: "A", lastname: "B", email: "a@b.com", role: "ADMIN" });
    expect(mockApi.post).toHaveBeenCalledWith("/users", { name: "A", lastname: "B", email: "a@b.com", role: "ADMIN" });
  });

  it("deleteUser calls delete", async () => {
    mockDeleteSuccess();
    await userService.deleteUser(1);
    expect(mockApi.delete).toHaveBeenCalledWith("/users/1");
  });
});
