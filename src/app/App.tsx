// src/app/App.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import { ProtectedRoute } from "../shared/components/router/ProtectedRoute";
import { RoleBasedRoute } from "../shared/components/router/RoleBasedRoute";
import { RoleRedirect } from "../shared/components/router/RoleRedirect";
import { UnauthorizedPage } from "../shared/pages/UnauthorizedPage";
import { RedirectIfLoggedIn } from "@/shared/components/router/RedirectIfLoggedIn";

// Import các dashboard cho từng role
import AdminDashboard from "../features/admin/pages/AdminDashboard";
import AdminCampaign from "../features/admin/pages/AdminCampaign";
import AdminRequest from "../features/admin/pages/AdminRequest";
import SellerDashboard from "../features/seller/pages/SellerDashboard";
import FranchiseDashboard from "../features/franchise/pages/FranchiseDashboard";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import AdminFranchise from "@/features/admin/pages/AdminFranchise";
import AdminCreateCampaign from "@/features/admin/pages/AdminCreateCampaign";
import FranchiseInvitationCodes from "@/features/franchise/pages/FranchiseInvitationCodes";
import FranchiseAllocateQuota from "@/features/franchise/pages/FranchiseAllocateQuota";
import FranchiseMyQuota from "@/features/franchise/pages/FranchiseMyQuota";
import FranchiseHistoriesOfQuota from "@/features/franchise/pages/FranchiseHistoriesOfQuota";
import FranchiseChildList from "@/features/franchise/pages/FranchiseChildList";
import FranchiseHierachy from "@/features/franchise/pages/FranchiseHierachy";
import FranchiseMyPerformance from "@/features/franchise/pages/FranchiseMyPerformance";
import FranchiseChildrenPerformance from "@/features/franchise/pages/FranchiseChildrenPerformance";
import FranchiseHierarchyPerformance from "@/features/franchise/pages/FranchiseHierarchyPerformance";
import FranchiseQuotaUtilization from "@/features/franchise/pages/FranchiseQuotaUtiliztion";
import FranchiseExportReports from "@/features/franchise/pages/FranchiseExportReports";
import FranchiseProfile from "@/features/franchise/pages/FranchiseProfile";
import AdminAllUsers from "@/features/admin/pages/AdminAllUsers";
import AdminAddUser from "@/features/admin/pages/AdminAddUser";
import AdminReports from "@/features/admin/pages/AdminReports";

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
      <Route
        path="/admin/campaigns"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminCampaign />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/campaigns/new"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminCreateCampaign />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/franchises"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminFranchise />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/requests"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminRequest />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/all"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminAllUsers />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/add"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminAddUser />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminReports />
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
      />{" "}
      <Route
        path="/franchise/invitations/codes"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["franchise"]}>
              <FranchiseInvitationCodes />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/franchise/quota/allocate"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["franchise"]}>
              <FranchiseAllocateQuota />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/franchise/quota/my-quota"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["franchise"]}>
              <FranchiseMyQuota />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/franchise/quota/history"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["franchise"]}>
              <FranchiseHistoriesOfQuota />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/franchise/children/list"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["franchise"]}>
              <FranchiseChildList />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/franchise/children/hierarchy"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["franchise"]}>
              <FranchiseHierachy />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/franchise/performance/my-performance"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["franchise"]}>
              <FranchiseMyPerformance />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/franchise/performance/children"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["franchise"]}>
              <FranchiseChildrenPerformance />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/franchise/performance/hierarchy"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["franchise"]}>
              <FranchiseHierarchyPerformance />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/franchise/reports/quota-utilization"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["franchise"]}>
              <FranchiseQuotaUtilization />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/franchise/reports/export"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["franchise"]}>
              <FranchiseExportReports />
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/franchise/profile"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["franchise"]}>
              <FranchiseProfile />
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
