// src/features/auth/hooks/useAuth.ts

import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider"; // Import context từ file AuthProvider

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
