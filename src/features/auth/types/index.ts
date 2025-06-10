// src/features/auth/types/index.ts

/**
 * Định nghĩa cấu trúc cho đối tượng User.
 * Dựa trên response từ API Get Profile và Login.
 */
export interface User {
  _id: string;
  email: string;
  username: string;
  phone: string;
  role: "user" | "admin" | "seller" | "franchise";
  // Thêm các thuộc tính khác của user nếu cần
  // Ví dụ: name, avatar, createdAt,...
}

/**
 * Định nghĩa cấu trúc dữ liệu gửi đi khi thực hiện login.
 * Dựa trên body của request Login trong Postman.
 */
export interface LoginPayload {
  email: string;
  password?: string; // Mật khẩu có thể không bắt buộc nếu đăng nhập bằng OTP
  clientId: string;
  otp?: string; // Dành cho đăng nhập bằng OTP
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
      // API login chỉ trả về _id, chúng ta sẽ cần gọi API /profile để lấy đủ thông tin
    };
  } & AuthTokens; // Sử dụng AuthTokens trực tiếp ở đây
}

/**
 * Định nghĩa cấu trúc dữ liệu trả về từ API Get Profile.
 */
export interface ProfileResponse {
  data: User;
}

/**
 * Định nghĩa cấu trúc chung cho các response lỗi từ API.
 * Bạn có thể điều chỉnh lại cho khớp với backend.
 */
export interface ApiError {
  message: string;
  statusCode: number;
}
