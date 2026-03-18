import api from "./api";
import { API_URLS } from "@/constants/apiUrls";
import type { PageResponse } from "@/lib/types";

export interface UserResponseDTO {
  id: number;
  name: string;
  lastname: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface UserRequestDTO {
  name: string;
  lastname: string;
  email: string;
  role: string;
  password?: string;
}

interface UserListParams {
  page?: number;
  size?: number;
  sortBy?: string;
}

export const userService = {
  getUsers: async (params?: UserListParams): Promise<PageResponse<UserResponseDTO>> => {
    const queryParams: Record<string, any> = {};
    if (params?.page !== undefined) queryParams.page = params.page;
    if (params?.size) queryParams.size = params.size;
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    const response = await api.get(API_URLS.USERS.BASE, { params: queryParams });
    return response.data;
  },

  getUser: async (id: number | string): Promise<UserResponseDTO> => {
    const response = await api.get(API_URLS.USERS.BY_ID(id));
    return response.data;
  },

  createUser: async (data: UserRequestDTO): Promise<UserResponseDTO> => {
    const response = await api.post(API_URLS.USERS.BASE, data);
    return response.data;
  },

  deleteUser: async (id: number | string): Promise<void> => {
    await api.delete(API_URLS.USERS.BY_ID(id));
  },
};
