// src/features/auth/hooks/usePermissions.ts

import { useAuth } from "../context/AuthProvider";

// Định nghĩa các permissions cho từng role
const rolePermissions = {
  admin: [
    "view_all_users",
    "manage_users",
    "view_all_sellers",
    "manage_sellers",
    "view_all_franchises",
    "manage_franchises",
    "view_system_settings",
    "manage_system_settings",
    "view_all_reports",
    "view_revenue",
    "manage_products",
    "manage_orders",
  ],
  seller: [
    "view_own_products",
    "manage_own_products",
    "view_own_orders",
    "manage_own_orders",
    "view_own_revenue",
    "view_own_reports",
    "manage_inventory",
    "view_customer_info",
  ],
  franchise: [
    "view_franchise_data",
    "manage_franchise_stores",
    "view_franchise_employees",
    "manage_franchise_employees",
    "view_franchise_revenue",
    "view_franchise_reports",
    "manage_franchise_inventory",
    "view_branch_performance",
  ],
  user: [
    "view_own_profile",
    "edit_own_profile",
    "view_products",
    "create_orders",
    "view_own_orders",
  ],
};

export const usePermissions = () => {
  const { user } = useAuth();

  // Kiểm tra user có permission cụ thể không
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  // Kiểm tra user có bất kỳ permission nào trong danh sách không
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;

    const userPermissions = rolePermissions[user.role] || [];
    return permissions.some((permission) =>
      userPermissions.includes(permission)
    );
  };

  // Kiểm tra user có tất cả permissions trong danh sách không
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false;

    const userPermissions = rolePermissions[user.role] || [];
    return permissions.every((permission) =>
      userPermissions.includes(permission)
    );
  };

  // Lấy tất cả permissions của user
  const getUserPermissions = (): string[] => {
    if (!user) return [];
    return rolePermissions[user.role] || [];
  };

  // Kiểm tra role
  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }

    return user.role === role;
  };

  // Kiểm tra có phải admin không
  const isAdmin = (): boolean => {
    return hasRole("admin");
  };

  // Kiểm tra có phải seller không
  const isSeller = (): boolean => {
    return hasRole("seller");
  };

  // Kiểm tra có phải franchise không
  const isFranchise = (): boolean => {
    return hasRole("franchise");
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    hasRole,
    isAdmin,
    isSeller,
    isFranchise,
  };
};
