// src/shared/components/router/RoleRedirect.tsx

import React from "react";
// 1. Import thêm component <Navigate />
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { CircularProgress, Box } from "@mui/material";

// Định nghĩa các route mặc định cho từng role
const roleDefaultRoutes: { [key: string]: string } = {
  admin: "/admin/dashboard",
  seller: "/seller/dashboard",
  franchise: "/franchise/dashboard",
  user: "/user/dashboard",
};

export const RoleRedirect: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // 2. Xử lý logic ngay trong lúc render, không dùng useEffect
  if (isLoading) {
    // Nếu đang loading, hiển thị spinner
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 3. Nếu không đăng nhập, trả về component <Navigate /> để chuyển hướng
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 4. Nếu đã đăng nhập, tính toán route và trả về component <Navigate />
  const defaultRoute = roleDefaultRoutes[user.role] || "/unauthorized";
  return <Navigate to={defaultRoute} replace />;
};
