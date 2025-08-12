// src/shared/components/router/RoleRedirect.tsx

import React, { useEffect } from "react";
// 1. Import thêm useLocation
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/AuthProvider";
import { CircularProgress, Box } from "@mui/material";

// Định nghĩa các route mặc định cho từng role
const roleDefaultRoutes = {
  admin: "/admin/dashboard",
  seller: "/seller/dashboard",
  franchise: "/franchise/dashboard",
  user: "/user/dashboard",
};

export const RoleRedirect: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // 2. Lấy thông tin về đường dẫn hiện tại
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      console.log("aaaaaaaaaaaaaaa1: ", isAuthenticated, "  aa ", user);

      if (!isAuthenticated || !user) {
        console.log("aaaaaaaaaaaaaaa2");

        navigate("/login", { replace: true });
      } else {
        console.log("aaaaaaaaaaaaaaa3");

        const defaultRoute = roleDefaultRoutes[user.role] || "/unauthorized";

        // 3. THÊM ĐIỀU KIỆN QUAN TRỌNG:
        // Chỉ điều hướng nếu người dùng đang ở trang chủ ('/')
        if (location.pathname === "/") {
          navigate(defaultRoute, { replace: true });
        }
      }
    }
    // 4. Thêm location.pathname vào dependency array
  }, [user, isLoading, isAuthenticated, navigate, location.pathname]);

  // Hiển thị loading trong lúc chờ redirect
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
};
