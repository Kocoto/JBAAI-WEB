// src/app/App.tsx

import { Routes, Route } from "react-router-dom";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import LoginPage from "../features/auth/pages/LoginPage";
import { ProtectedRoute } from "../shared/components/router/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          // 1. Bọc trang Dashboard bằng ProtectedRoute
          // Chỉ người dùng đã đăng nhập mới vào được trang này.
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      {/* Thêm các route khác ở đây, ví dụ:
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      /> 
      */}
    </Routes>
  );
}

export default App;
