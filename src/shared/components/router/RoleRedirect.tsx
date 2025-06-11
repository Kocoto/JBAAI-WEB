// src/shared/components/router/RoleRedirect.tsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        navigate("/login", { replace: true });
      } else {
        // Redirect đến dashboard tương ứng với role
        const defaultRoute = roleDefaultRoutes[user.role] || "/unauthorized";
        navigate(defaultRoute, { replace: true });
      }
    }
  }, [user, isLoading, isAuthenticated, navigate]);

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
