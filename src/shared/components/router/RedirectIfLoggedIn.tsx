// src/shared/components/router/RedirectIfLoggedIn.tsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/AuthProvider";
import { CircularProgress, Box } from "@mui/material";

// Định nghĩa các route mặc định cho từng role
const roleDefaultRoutes = {
  admin: "/admin/dashboard",
  seller: "/seller/dashboard",
  franchise: "/franchise/dashboard",
  user: "/user/dashboard",
};

interface RedirectIfLoggedInProps {
  children: React.ReactElement;
}

export const RedirectIfLoggedIn: React.FC<RedirectIfLoggedInProps> = ({
  children,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth(); // Lấy thêm thông tin `user`

  // Hiển thị loading trong lúc chờ xác thực
  if (isLoading) {
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

  // Nếu đã đăng nhập và có thông tin user
  if (isAuthenticated && user) {
    // Lấy route mặc định dựa trên vai trò của user
    const defaultRoute = roleDefaultRoutes[user.role] || "/";
    // Điều hướng thẳng đến trang dashboard, phá vỡ vòng lặp!
    return <Navigate to={defaultRoute} replace />;
  }

  // Nếu chưa đăng nhập, hiển thị trang con (chính là trang Login)
  return children;
};
