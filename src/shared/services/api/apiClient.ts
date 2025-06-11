// src/shared/services/api/apiClient.ts

import axios from "axios";
import type { AxiosRequestConfig, AxiosError } from "axios";

// Lấy accessToken và refreshToken từ localStorage
const getAccessToken = () => localStorage.getItem("accessToken");
const getRefreshToken = () => localStorage.getItem("refreshToken");

// Lưu accessToken và refreshToken vào localStorage
const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

// Xóa tokens khỏi localStorage (khi logout hoặc refresh token thất bại)
const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Interceptor để đính kèm Access Token vào mỗi request ---
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Interceptor để xử lý Refresh Token khi Access Token hết hạn ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Nếu lỗi là 401 và không phải từ request refresh-token
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== "/api/v1/auth/refresh-token"
    ) {
      if (isRefreshing) {
        // Nếu đang có một tiến trình refresh-token khác chạy, thêm request này vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = "Bearer " + token;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // Nếu không có refresh token, xóa tokens và chuyển về trang login
        isRefreshing = false;
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Import getClientId ở đầu file
        const { getClientId } = await import("../../utils/clientIdUtils");

        const response = await axios.post(
          `${apiClient.defaults.baseURL}/api/v1/auth/refresh-token`,
          {
            refreshToken: refreshToken,
            clientId: getClientId(),
          }
        );

        // Giả sử API trả về cấu trúc: { data: { accessToken, refreshToken } }
        // Điều chỉnh nếu cấu trúc thực tế khác
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data.token;

        setTokens(newAccessToken, newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        }

        // Thực thi lại các request trong hàng đợi
        processQueue(null, newAccessToken);

        // Thử lại request ban đầu với token mới
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token thất bại
        processQueue(refreshError as AxiosError, null);
        clearTokens();
        // Chuyển hướng về trang đăng nhập
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
