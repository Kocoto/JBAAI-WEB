// src/features/auth/context/AuthProvider.tsx

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { authService } from "../services/authService";
import { User, LoginCredentials } from "../types";

// 1. Định nghĩa kiểu cho Context
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

// 2. Tạo Context
const AuthContext = createContext<AuthContextType>(undefined!);

// 3. Tạo custom Hook để sử dụng Context dễ dàng hơn
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// 4. Tạo component AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // 5. Sử dụng State để lưu trữ dữ liệu
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 6. useEffect để kiểm tra phiên đăng nhập khi ứng dụng khởi động
  useEffect(() => {
    const checkLoggedIn = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Token tồn tại, gọi API để xác thực và lấy thông tin user
        const response = await authService.getProfile();
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        // Lỗi xảy ra (token không hợp lệ), coi như chưa đăng nhập
        console.error("Failed to fetch profile on load:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setIsLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // 7. Định nghĩa hàm login
  const login = async (credentials: LoginCredentials) => {
    try {
      // Gọi API login từ service (clientId sẽ được tự động thêm)
      const authResponse = await authService.login(credentials);

      // Lưu token vào localStorage
      localStorage.setItem("accessToken", authResponse.data.accessToken);
      localStorage.setItem("refreshToken", authResponse.data.refreshToken);

      // Sau khi login, gọi API getProfile để lấy đầy đủ thông tin user
      const profileResponse = await authService.getProfile();

      // Cập nhật state
      setUser(profileResponse.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
      // Ném lỗi ra ngoài để component Login có thể bắt và hiển thị thông báo
      throw error;
    }
  };

  // 8. Định nghĩa hàm logout
  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (error) {
        console.error(
          "Logout API call failed, clearing tokens locally anyway.",
          error
        );
      }
    }

    // Xóa tokens và reset state
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  // 9. Cung cấp các giá trị cho các component con
  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
  };

  // Chỉ render children khi đã hết loading
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
