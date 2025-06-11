// src/app/App.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import { ProtectedRoute } from "../shared/components/router/ProtectedRoute";
import { RoleBasedRoute } from "../shared/components/router/RoleBasedRoute";
import { RoleRedirect } from "../shared/components/router/RoleRedirect";
import { UnauthorizedPage } from "../shared/pages/UnauthorizedPage";
import { RedirectIfLoggedIn } from "@/shared/components/router/RedirectIfLoggedIn";

// Import các dashboard cho từng role
import { AdminDashboard } from "../features/admin/pages/AdminDashboard";
import { SellerDashboard } from "../features/seller/pages/SellerDashboard";
import { FranchiseDashboard } from "../features/franchise/pages/FranchiseDashboard";
import DashboardPage from "../features/dashboard/pages/DashboardPage";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <RedirectIfLoggedIn>
            <LoginPage />
          </RedirectIfLoggedIn>
        }
      />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Root route - redirect based on role */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleRedirect />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Seller routes */}
      <Route
        path="/seller/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["seller"]}>
              <SellerDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Franchise routes */}
      <Route
        path="/franchise/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["franchise"]}>
              <FranchiseDashboard />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* User routes (nếu cần) */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["user"]}>
              <DashboardPage />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
