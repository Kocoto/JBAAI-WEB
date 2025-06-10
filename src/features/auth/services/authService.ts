// src/features/auth/services/authService.ts

import apiClient from "../../../shared/services/api/apiClient";
import { AuthResponse, LoginPayload, ProfileResponse } from "../types";

/**
 * Hàm gọi API đăng nhập.
 * @param payload - Dữ liệu đăng nhập bao gồm email, password, clientId.
 * @returns - Promise chứa dữ liệu trả về từ API, bao gồm user và tokens.
 */
const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  // Sử dụng apiClient đã được cấu hình ở Bước 1.
  // Kiểu dữ liệu <AuthResponse> giúp TypeScript biết được `response.data` sẽ có cấu trúc như thế nào.
  const response = await apiClient.post<AuthResponse>(
    "/api/v1/auth/login",
    payload
  );
  return response.data; // Trả về phần data của response
};

/**
 * Hàm gọi API để lấy thông tin chi tiết của người dùng đã đăng nhập.
 * @returns - Promise chứa thông tin đầy đủ của user.
 */
const getProfile = async (): Promise<ProfileResponse> => {
  // apiClient sẽ tự động đính kèm token vào header của request này.
  const response = await apiClient.post<ProfileResponse>("/api/v1/profile");
  return response.data;
};

/**
 * Hàm gọi API đăng xuất.
 * Backend sẽ dùng refreshToken để hủy bỏ phiên làm việc.
 * @param refreshToken - Refresh token hiện tại của người dùng.
 */
const logout = async (refreshToken: string): Promise<void> => {
  await apiClient.post("/api/v1/auth/logout", {
    refreshToken,
    clientId: "web-app-v1",
  });
  // Việc xóa token khỏi localStorage sẽ được thực hiện trong AuthProvider sau khi gọi hàm này.
};

// Chúng ta nhóm các hàm này vào một object để export ra ngoài.
// Đây là một pattern phổ biến giúp việc import và sử dụng được gọn gàng hơn.
export const authService = {
  login,
  getProfile,
  logout,
  // Thêm các hàm khác như forgotPassword, resetPassword ở đây trong tương lai.
};
