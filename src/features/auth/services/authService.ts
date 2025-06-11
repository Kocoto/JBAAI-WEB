// src/features/auth/services/authService.ts

import apiClient from "../../../shared/services/api/apiClient";
import { AuthResponse, LoginPayload, ProfileResponse } from "../types";
import { getClientId } from "../../../shared/utils/clientIdUtils";

/**
 * Hàm gọi API đăng nhập.
 * @param payload - Dữ liệu đăng nhập bao gồm email, password.
 * @returns - Promise chứa dữ liệu trả về từ API, bao gồm user và tokens.
 */
const login = async (
  payload: Omit<LoginPayload, "clientId">
): Promise<AuthResponse> => {
  // Tự động thêm clientId từ thiết bị
  const loginData: LoginPayload = {
    ...payload,
    clientId: getClientId(),
  };

  const response = await apiClient.post<AuthResponse>(
    "/api/v1/auth/login",
    loginData
  );
  return response.data;
};

/**
 * Hàm gọi API để lấy thông tin chi tiết của người dùng đã đăng nhập.
 * @returns - Promise chứa thông tin đầy đủ của user.
 */
const getProfile = async (): Promise<ProfileResponse> => {
  const response = await apiClient.post("/api/v1/profile");
  return response.data.data;
};

/**
 * Hàm gọi API đăng xuất.
 * @param refreshToken - Refresh token hiện tại của người dùng.
 */
const logout = async (refreshToken: string): Promise<void> => {
  await apiClient.post("/api/v1/auth/logout", {
    refreshToken,
    clientId: getClientId(),
  });
};

/**
 * Hàm gọi API để refresh access token.
 * @param refreshToken - Refresh token hiện tại.
 * @returns - Promise chứa tokens mới.
 */
const refreshAccessToken = async (
  refreshToken: string
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/api/v1/auth/refresh-token",
    {
      refreshToken,
      clientId: getClientId(),
    }
  );
  return response.data;
};

export const authService = {
  login,
  getProfile,
  logout,
  refreshAccessToken,
};
