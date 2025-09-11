import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { useMemo } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CampaignIcon from "@mui/icons-material/Campaign";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import AssessmentIcon from "@mui/icons-material/Assessment";
import StoreIcon from "@mui/icons-material/Store";
import BusinessIcon from "@mui/icons-material/Business";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import RequestPageIcon from "@mui/icons-material/RequestPage";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import GroupIcon from "@mui/icons-material/Group";
import BarChartIcon from "@mui/icons-material/BarChart";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import React from "react";
import { useTranslation } from "react-i18next";

// ---- Types ----
export interface NavigationItem {
  id: string;
  label: string; // Fallback text
  labelKey?: string; // i18n key
  path: string;
  icon: React.ReactNode;
  description?: string; // Fallback text
  descriptionKey?: string; // i18n key for description
  children?: NavigationItem[];
  badge?: number;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string; // Fallback text
  labelKey?: string; // i18n key (NavbarBreadcrumbs sẽ ưu tiên key này)
  path?: string;
  icon?: React.ReactNode;
}

/**
 * Hook quản lý navigation cho dashboard (auto i18n)
 */
export const useDashboardNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  // 1) Khai báo raw tree, gắn labelKey/descriptionKey
  const rawNavigationItems = useMemo<NavigationItem[]>(() => {
    if (!user) return [];

    switch (user.role) {
      case "admin":
        return [
          {
            id: "dashboard",
            label: "Dashboard",
            labelKey: "nav.admin.dashboard",
            path: "/admin/dashboard",
            icon: <DashboardIcon />,
            description: "Tổng quan hệ thống",
            descriptionKey: "navDesc.admin.dashboard",
          },
          {
            id: "requests",
            label: "Quản lý Request",
            labelKey: "nav.admin.requests",
            path: "/admin/requests",
            icon: <RequestPageIcon />,
            description: "Quản lý các yêu cầu nâng cấp",
            descriptionKey: "navDesc.admin.requests",
          },
          {
            id: "users",
            label: "Quản lý Users",
            labelKey: "nav.admin.users",
            path: "/admin/users",
            icon: <PeopleIcon />,
            description: "Quản lý người dùng",
            descriptionKey: "navDesc.admin.users",
            children: [
              {
                id: "all-users",
                label: "Tất cả Users",
                labelKey: "nav.admin.users.all",
                path: "/admin/users/all",
                icon: <PeopleIcon fontSize="small" />,
              },
              {
                id: "add-user",
                label: "Thêm User mới",
                labelKey: "nav.admin.users.add",
                path: "/admin/users/add",
                icon: <PeopleIcon fontSize="small" />,
              },
            ],
          },
          {
            id: "franchises",
            label: "Quản lý Franchises",
            labelKey: "nav.admin.franchises",
            path: "/admin/franchises",
            icon: <BusinessIcon />,
            description: "Quản lý chi nhánh",
            descriptionKey: "navDesc.admin.franchises",
          },
          {
            id: "campaigns",
            label: "Chiến dịch",
            labelKey: "nav.admin.campaigns",
            path: "/admin/campaigns",
            icon: <CampaignIcon />,
            description: "Quản lý chiến dịch marketing",
            descriptionKey: "navDesc.admin.campaigns",
          },
          {
            id: "reports",
            label: "Báo cáo",
            labelKey: "nav.admin.reports",
            path: "/admin/reports",
            icon: <AssessmentIcon />,
            description: "Báo cáo và thống kê",
            descriptionKey: "navDesc.admin.reports",
          },
          {
            id: "settings",
            label: "Cài đặt",
            labelKey: "nav.admin.settings",
            path: "/admin/settings",
            icon: <SettingsIcon />,
            description: "Cài đặt hệ thống",
            descriptionKey: "navDesc.admin.settings",
          },
        ];

      case "seller":
        return [
          {
            id: "dashboard",
            label: "Dashboard",
            labelKey: "nav.seller.dashboard",
            path: "/seller/dashboard",
            icon: <DashboardIcon />,
            description: "Tổng quan cửa hàng",
            descriptionKey: "navDesc.seller.dashboard",
          },
          {
            id: "products",
            label: "Sản phẩm",
            labelKey: "nav.seller.products",
            path: "/seller/products",
            icon: <InventoryIcon />,
            description: "Quản lý sản phẩm",
            descriptionKey: "navDesc.seller.products",
            children: [
              {
                id: "all-products",
                label: "Tất cả sản phẩm",
                labelKey: "nav.seller.products.all",
                path: "/seller/products/all",
                icon: <InventoryIcon fontSize="small" />,
              },
              {
                id: "add-product",
                label: "Thêm sản phẩm",
                labelKey: "nav.seller.products.add",
                path: "/seller/products/add",
                icon: <InventoryIcon fontSize="small" />,
              },
            ],
          },
          {
            id: "orders",
            label: "Đơn hàng",
            labelKey: "nav.seller.orders",
            path: "/seller/orders",
            icon: <AssessmentIcon />,
            description: "Quản lý đơn hàng",
            descriptionKey: "navDesc.seller.orders",
            badge: 5,
          },
          {
            id: "campaigns",
            label: "Chiến dịch",
            labelKey: "nav.seller.campaigns",
            path: "/seller/campaigns",
            icon: <CampaignIcon />,
            description: "Chiến dịch khuyến mãi",
            descriptionKey: "navDesc.seller.campaigns",
          },
          {
            id: "profile",
            label: "Hồ sơ",
            labelKey: "nav.seller.profile",
            path: "/seller/profile",
            icon: <AccountCircleIcon />,
            description: "Thông tin cá nhân",
            descriptionKey: "navDesc.seller.profile",
          },
        ];

      case "franchise":
        return [
          {
            id: "dashboard",
            label: "Dashboard",
            labelKey: "nav.franchise.dashboard",
            path: "/franchise/dashboard",
            icon: <DashboardIcon />,
            description: "Tổng quan franchise",
            descriptionKey: "navDesc.franchise.dashboard",
          },
          {
            id: "quota",
            label: "Quản lý Quota",
            labelKey: "nav.franchise.quota",
            path: "/franchise/quota",
            icon: <AccountBalanceWalletIcon />,
            description: "Quản lý hạn mức mời dùng thử",
            descriptionKey: "navDesc.franchise.quota",
            children: [
              {
                id: "my-quota",
                label: "Quota của tôi",
                labelKey: "nav.franchise.quota.my",
                path: "/franchise/quota/my-quota",
                icon: <AccountBalanceWalletIcon fontSize="small" />,
              },
              {
                id: "allocate-quota",
                label: "Cấp phát Quota",
                labelKey: "nav.franchise.quota.allocate",
                path: "/franchise/quota/allocate",
                icon: <CardGiftcardIcon fontSize="small" />,
              },
              {
                id: "quota-history",
                label: "Lịch sử cấp phát",
                labelKey: "nav.franchise.quota.history",
                path: "/franchise/quota/history",
                icon: <AssessmentIcon fontSize="small" />,
              },
            ],
          },
          {
            id: "franchises",
            label: "Franchise con",
            labelKey: "nav.franchise.children",
            path: "/franchise/children",
            icon: <GroupIcon />,
            description: "Quản lý franchise con",
            descriptionKey: "navDesc.franchise.children",
            children: [
              {
                id: "child-list",
                label: "Danh sách Franchise con",
                labelKey: "nav.franchise.children.list",
                path: "/franchise/children/list",
                icon: <GroupIcon fontSize="small" />,
              },
              {
                id: "hierarchy",
                label: "Cây phân cấp",
                labelKey: "nav.franchise.children.hierarchy",
                path: "/franchise/children/hierarchy",
                icon: <AccountTreeIcon fontSize="small" />,
              },
            ],
          },
          {
            id: "invitations",
            label: "Mã mời",
            labelKey: "nav.franchise.invitations",
            path: "/franchise/invitations",
            icon: <LocalActivityIcon />,
            description: "Quản lý mã mời dùng thử",
            descriptionKey: "navDesc.franchise.invitations",
            children: [
              {
                id: "invitation-codes",
                label: "Danh sách mã mời",
                labelKey: "nav.franchise.invitations.codes",
                path: "/franchise/invitations/codes",
                icon: <LocalActivityIcon fontSize="small" />,
              },
            ],
          },
          {
            id: "performance",
            label: "Hiệu suất",
            labelKey: "nav.franchise.performance",
            path: "/franchise/performance",
            icon: <TrendingUpIcon />,
            description: "Báo cáo hiệu suất",
            descriptionKey: "navDesc.franchise.performance",
            children: [
              {
                id: "my-performance",
                label: "Hiệu suất của tôi",
                labelKey: "nav.franchise.performance.my",
                path: "/franchise/performance/my-performance",
                icon: <BarChartIcon fontSize="small" />,
              },
              {
                id: "children-performance",
                label: "Hiệu suất Franchise con",
                labelKey: "nav.franchise.performance.children",
                path: "/franchise/performance/children",
                icon: <AssessmentIcon fontSize="small" />,
              },
              {
                id: "hierarchy-performance",
                label: "Hiệu suất toàn bộ",
                labelKey: "nav.franchise.performance.hierarchy",
                path: "/franchise/performance/hierarchy",
                icon: <AccountTreeIcon fontSize="small" />,
              },
            ],
          },
          {
            id: "reports",
            label: "Báo cáo",
            labelKey: "nav.franchise.reports",
            path: "/franchise/reports",
            icon: <AssessmentIcon />,
            description: "Báo cáo tổng hợp",
            descriptionKey: "navDesc.franchise.reports",
            children: [
              {
                id: "quota-utilization",
                label: "Sử dụng Quota",
                labelKey: "nav.franchise.reports.quota",
                path: "/franchise/reports/quota-utilization",
                icon: <AccountBalanceWalletIcon fontSize="small" />,
              },
              {
                id: "export-reports",
                label: "Xuất báo cáo",
                labelKey: "nav.franchise.reports.export",
                path: "/franchise/reports/export",
                icon: <AssessmentIcon fontSize="small" />,
              },
            ],
          },
          {
            id: "profile",
            label: "Thông tin",
            labelKey: "nav.franchise.profile",
            path: "/franchise/profile",
            icon: <AccountCircleIcon />,
            description: "Thông tin franchise",
            descriptionKey: "navDesc.franchise.profile",
          },
        ];

      case "user":
      default:
        return [
          {
            id: "dashboard",
            label: "Dashboard",
            labelKey: "nav.user.dashboard",
            path: "/user/dashboard",
            icon: <DashboardIcon />,
            description: "Trang chính",
            descriptionKey: "navDesc.user.dashboard",
          },
          {
            id: "campaigns",
            label: "Chiến dịch",
            labelKey: "nav.user.campaigns",
            path: "/user/campaigns",
            icon: <CampaignIcon />,
            description: "Xem chiến dịch",
            descriptionKey: "navDesc.user.campaigns",
          },
          {
            id: "profile",
            label: "Hồ sơ",
            labelKey: "nav.user.profile",
            path: "/user/profile",
            icon: <AccountCircleIcon />,
            description: "Thông tin cá nhân",
            descriptionKey: "navDesc.user.profile",
          },
        ];
    }
  }, [user]);

  // 2) Map sang BẢN ĐÃ DỊCH dựa trên key
  const translateTree = (items: NavigationItem[]): NavigationItem[] =>
    items.map((it) => ({
      ...it,
      label: it.labelKey ? t(it.labelKey) : it.label,
      description: it.descriptionKey ? t(it.descriptionKey) : it.description,
      children: it.children ? translateTree(it.children) : undefined,
    }));

  const navigationItems = useMemo(
    () => translateTree(rawNavigationItems),
    [rawNavigationItems, i18n.language] // đổi ngôn ngữ => re-map
  );

  // 3) Item hiện tại (đã dịch)
  const currentNavItem = useMemo(() => {
    const currentPath = location.pathname;
    const findItem = (items: NavigationItem[]): NavigationItem | null => {
      for (const item of items) {
        if (item.path === currentPath) return item;
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findItem(navigationItems);
  }, [location.pathname, navigationItems]);

  // 4) Breadcrumbs (label đã dịch, kèm labelKey để component khác dùng nếu muốn)
  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [];

    items.push({
      label: t("nav.home"),
      labelKey: "nav.home",
      path: `/${user?.role || "user"}/dashboard`,
      icon: <DashboardIcon fontSize="small" />,
    });

    if (currentNavItem) {
      const findParent = (
        items: NavigationItem[],
        targetId: string
      ): NavigationItem | null => {
        for (const item of items) {
          if (item.children?.some((child) => child.id === targetId))
            return item;
          if (item.children) {
            const found = findParent(item.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      const parent = findParent(navigationItems, currentNavItem.id);
      if (parent) {
        items.push({
          label: parent.label,
          labelKey: parent.labelKey,
          path: parent.path,
        });
      }

      items.push({
        label: currentNavItem.label,
        labelKey: currentNavItem.labelKey,
      });
    }

    return items;
  }, [currentNavItem, navigationItems, user, t]);

  // 5) Helpers
  const navigateTo = (path: string) => navigate(path);
  const navigateToHome = () => navigate(`/${user?.role || "user"}/dashboard`);
  const navigateBack = () => navigate(-1);
  const navigateToLogin = () => navigate("/login");

  const isHome = location.pathname === `/${user?.role || "user"}/dashboard`;

  // 6) Flatten (đÃ DỊCH)
  const flatNavigationItems = useMemo(() => {
    const flatten = (items: NavigationItem[]): NavigationItem[] =>
      items.reduce<NavigationItem[]>((acc, item) => {
        acc.push(item);
        if (item.children) acc.push(...flatten(item.children));
        return acc;
      }, []);
    return flatten(navigationItems);
  }, [navigationItems]);

  return {
    // ĐÃ DỊCH:
    navigationItems,
    flatNavigationItems,
    currentNavItem,

    // Bản gốc (nếu nơi khác cần):
    rawNavigationItems,

    // Breadcrumbs
    breadcrumbs,

    // Navigation utils
    navigateTo,
    navigateToHome,
    navigateBack,
    navigateToLogin,

    // State
    isHome,
    currentPath: location.pathname,
    userRole: user?.role,
  };
};
