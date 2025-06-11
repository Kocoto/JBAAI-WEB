// src/shared/components/router/RoleBasedRoute.tsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/AuthProvider";
import { CircularProgress, Box } from "@mui/material";

type UserRole = "user" | "admin" | "seller" | "franchise";

interface RoleBasedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[]; // Nếu không định nghĩa, cho phép tất cả các role
  redirectTo?: string; // Trang redirect nếu không có quyền
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = "/unauthorized",
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Nếu đang loading
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

  // Nếu chưa đăng nhập
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu không có allowedRoles, cho phép tất cả người dùng đã đăng nhập
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  // Kiểm tra role của user
  if (allowedRoles.includes(user.role)) {
    return children;
  }

  // Nếu không có quyền, redirect
  return <Navigate to={redirectTo} replace />;
};
