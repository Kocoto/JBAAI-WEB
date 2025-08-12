// src/features/auth/types/index.ts

/**
 * Định nghĩa cấu trúc cho đối tượng User.
 * Dựa trên response từ API Get Profile và Login.
 */
export interface User {
  _id: string;
  username: string;
  email: string;
  phone: string;
  role: "user" | "admin" | "seller" | "franchise";
  status: "active" | string;
  verify: boolean;
  language: string;
  discount: boolean;
  isSubscription: boolean;
  emailNotificationsEnabled: boolean;
  isPayment: boolean;
  isHideScore: boolean;
  type: string;
  typeLogin?: {
    type: string;
  };
  isDeleted?: boolean;
  deletedAt?: string | null;
  isHideGLB1?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Định nghĩa cấu trúc dữ liệu gửi đi khi thực hiện login.
 * Dựa trên body của request Login trong Postman.
 */
export interface LoginPayload {
  email: string;
  password?: string;
  clientId: string;
  otp?: string;
}

/**
 * Login credentials từ form (không bao gồm clientId)
 */
export interface LoginCredentials {
  email: string;
  password?: string;
  otp?: string;
}

/**
 * Định nghĩa cấu trúc của cặp tokens.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Định nghĩa cấu trúc dữ liệu trả về từ API login thành công.
 * Dựa trên response của request Login trong Postman.
 */
export interface AuthResponse {
  data: {
    user: {
      _id: string;
    };
  } & AuthTokens;
}

/**
 * Định nghĩa cấu trúc dữ liệu trả về từ API Get Profile.
 */
export interface ProfileResponse {
  profile: {
    profile: {
      _id: string;
      userId: string;
      height: number;
      weight: number;
      age: number;
      gender: string;
      smokingStatus: number;
      __v?: number;
    };
    user: {
      typeLogin: {
        type: string;
      };
      discount: boolean;
      isDeleted: boolean;
      deletedAt: string | null;
      isHideGLB1: boolean;
      _id: string;
      username: string;
      email: string;
      phone: string;
      role: "user" | "admin" | "seller" | "franchise";
      status: "active" | string;
      verify: boolean;
      language: string;
      isSubscription: boolean;
      emailNotificationsEnabled: boolean;
      isPayment: boolean;
      isHideScore: boolean;
      type: string;
      createdAt: string;
      updatedAt: string;
      __v?: number;
    };
    upgradeRequest: null | unknown | unknown[];
  };
  ring?: {
    _id: string;
    userId: string;
    calories: number;
    steps: number;
    step_length: number;
    duration: number;
    createdAt: string;
    updatedAt: string;
    __v?: number;
  };
}

/**
 * Định nghĩa cấu trúc chung cho các response lỗi từ API.
 * Bạn có thể điều chỉnh lại cho khớp với backend.
 */
export interface ApiError {
  message: string;
  statusCode: number;
}
