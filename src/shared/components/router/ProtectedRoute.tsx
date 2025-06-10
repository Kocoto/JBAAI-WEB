// src/shared/components/router/ProtectedRoute.tsx

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/AuthProvider";
import { CircularProgress, Box } from "@mui/material";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Nếu AuthProvider vẫn đang trong quá trình kiểm tra token (lần đầu tải trang)
  // thì hiển thị một spinner loading.
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

  // Nếu đã kiểm tra xong và người dùng chưa đăng nhập
  // thì chuyển hướng họ về trang login.
  // state: { from: location } để sau khi đăng nhập thành công, ta có thể đưa họ trở lại trang họ muốn vào.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập, cho phép hiển thị component con (trang được bảo vệ).
  return children;
};
