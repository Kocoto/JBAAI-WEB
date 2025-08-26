// src/shared/hooks/useDashboardNavigation.tsx

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

// Định nghĩa kiểu cho navigation item
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  description?: string;
  children?: NavigationItem[];
  badge?: number;
  disabled?: boolean;
}

// Định nghĩa kiểu cho breadcrumb
export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

/**
 * Hook quản lý navigation cho dashboard
 *
 * Hook này giúp:
 * - Lấy danh sách menu items dựa trên role của user
 * - Cung cấp các hàm navigate tiện ích
 * - Theo dõi route hiện tại
 * - Tạo breadcrumbs tự động
 */
export const useDashboardNavigation = () => {
  // 1. Lấy thông tin từ các hooks cần thiết
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // 2. Tạo danh sách navigation items dựa trên role
  const navigationItems = useMemo<NavigationItem[]>(() => {
    if (!user) return [];

    // Định nghĩa menu cho từng role
    switch (user.role) {
      case "admin":
        return [
          {
            id: "dashboard",
            label: "Dashboard",
            path: "/admin/dashboard",
            icon: <DashboardIcon />,
            description: "Tổng quan hệ thống",
          },
          {
            id: "requests",
            label: "Quản lý Request",
            path: "/admin/requests",
            icon: <RequestPageIcon />,
            description: "Quản lý các yêu cầu nâng cấp",
          },
          {
            id: "users",
            label: "Quản lý Users",
            path: "/admin/users",
            icon: <PeopleIcon />,
            description: "Quản lý người dùng",
            children: [
              {
                id: "all-users",
                label: "Tất cả Users",
                path: "/admin/users/all",
                icon: <PeopleIcon fontSize="small" />,
              },
              {
                id: "add-user",
                label: "Thêm User mới",
                path: "/admin/users/add",
                icon: <PeopleIcon fontSize="small" />,
              },
            ],
          },
          {
            id: "sellers",
            label: "Quản lý Sellers",
            path: "/admin/sellers",
            icon: <StoreIcon />,
            description: "Quản lý nhà bán hàng",
          },
          {
            id: "franchises",
            label: "Quản lý Franchises",
            path: "/admin/franchises",
            icon: <BusinessIcon />,
            description: "Quản lý chi nhánh",
          },
          {
            id: "campaigns",
            label: "Chiến dịch",
            path: "/admin/campaigns",
            icon: <CampaignIcon />,
            description: "Quản lý chiến dịch marketing",
          },
          {
            id: "reports",
            label: "Báo cáo",
            path: "/admin/reports",
            icon: <AssessmentIcon />,
            description: "Báo cáo và thống kê",
          },
          {
            id: "settings",
            label: "Cài đặt",
            path: "/admin/settings",
            icon: <SettingsIcon />,
            description: "Cài đặt hệ thống",
          },
        ];

      case "seller":
        return [
          {
            id: "dashboard",
            label: "Dashboard",
            path: "/seller/dashboard",
            icon: <DashboardIcon />,
            description: "Tổng quan cửa hàng",
          },
          {
            id: "products",
            label: "Sản phẩm",
            path: "/seller/products",
            icon: <InventoryIcon />,
            description: "Quản lý sản phẩm",
            children: [
              {
                id: "all-products",
                label: "Tất cả sản phẩm",
                path: "/seller/products/all",
                icon: <InventoryIcon fontSize="small" />,
              },
              {
                id: "add-product",
                label: "Thêm sản phẩm",
                path: "/seller/products/add",
                icon: <InventoryIcon fontSize="small" />,
              },
            ],
          },
          {
            id: "orders",
            label: "Đơn hàng",
            path: "/seller/orders",
            icon: <AssessmentIcon />,
            description: "Quản lý đơn hàng",
            badge: 5,
          },
          {
            id: "campaigns",
            label: "Chiến dịch",
            path: "/seller/campaigns",
            icon: <CampaignIcon />,
            description: "Chiến dịch khuyến mãi",
          },
          {
            id: "profile",
            label: "Hồ sơ",
            path: "/seller/profile",
            icon: <AccountCircleIcon />,
            description: "Thông tin cá nhân",
          },
        ];

      case "franchise":
        return [
          {
            id: "dashboard",
            label: "Dashboard",
            path: "/franchise/dashboard",
            icon: <DashboardIcon />,
            description: "Tổng quan franchise",
          },
          {
            id: "quota",
            label: "Quản lý Quota",
            path: "/franchise/quota",
            icon: <AccountBalanceWalletIcon />,
            description: "Quản lý hạn mức mời dùng thử",
            children: [
              {
                id: "my-quota",
                label: "Quota của tôi",
                path: "/franchise/quota/my-quota",
                icon: <AccountBalanceWalletIcon fontSize="small" />,
              },
              {
                id: "allocate-quota",
                label: "Cấp phát Quota",
                path: "/franchise/quota/allocate",
                icon: <CardGiftcardIcon fontSize="small" />,
              },
              {
                id: "quota-history",
                label: "Lịch sử cấp phát",
                path: "/franchise/quota/history",
                icon: <AssessmentIcon fontSize="small" />,
              },
            ],
          },
          {
            id: "franchises",
            label: "Franchise con",
            path: "/franchise/children",
            icon: <GroupIcon />,
            description: "Quản lý franchise con",
            children: [
              {
                id: "child-list",
                label: "Danh sách Franchise con",
                path: "/franchise/children/list",
                icon: <GroupIcon fontSize="small" />,
              },
              {
                id: "hierarchy",
                label: "Cây phân cấp",
                path: "/franchise/children/hierarchy",
                icon: <AccountTreeIcon fontSize="small" />,
              },
            ],
          },
          {
            id: "invitations",
            label: "Mã mời",
            path: "/franchise/invitations",
            icon: <LocalActivityIcon />,
            description: "Quản lý mã mời dùng thử",
            children: [
              {
                id: "invitation-codes",
                label: "Danh sách mã mời",
                path: "/franchise/invitations/codes",
                icon: <LocalActivityIcon fontSize="small" />,
              },
              // {
              //   id: "generate-code",
              //   label: "Tạo mã mời",
              //   path: "/franchise/invitations/generate",
              //   icon: <CardGiftcardIcon fontSize="small" />,
              // },
            ],
          },
          {
            id: "performance",
            label: "Hiệu suất",
            path: "/franchise/performance",
            icon: <TrendingUpIcon />,
            description: "Báo cáo hiệu suất",
            children: [
              {
                id: "my-performance",
                label: "Hiệu suất của tôi",
                path: "/franchise/performance/my-performance",
                icon: <BarChartIcon fontSize="small" />,
              },
              {
                id: "children-performance",
                label: "Hiệu suất Franchise con",
                path: "/franchise/performance/children",
                icon: <AssessmentIcon fontSize="small" />,
              },
              {
                id: "hierarchy-performance",
                label: "Hiệu suất toàn bộ",
                path: "/franchise/performance/hierarchy",
                icon: <AccountTreeIcon fontSize="small" />,
              },
            ],
          },
          {
            id: "reports",
            label: "Báo cáo",
            path: "/franchise/reports",
            icon: <AssessmentIcon />,
            description: "Báo cáo tổng hợp",
            children: [
              {
                id: "quota-utilization",
                label: "Sử dụng Quota",
                path: "/franchise/reports/quota-utilization",
                icon: <AccountBalanceWalletIcon fontSize="small" />,
              },
              {
                id: "export-reports",
                label: "Xuất báo cáo",
                path: "/franchise/reports/export",
                icon: <AssessmentIcon fontSize="small" />,
              },
            ],
          },
          {
            id: "profile",
            label: "Thông tin",
            path: "/franchise/profile",
            icon: <AccountCircleIcon />,
            description: "Thông tin franchise",
          },
        ];

      case "user":
      default:
        return [
          {
            id: "dashboard",
            label: "Dashboard",
            path: "/user/dashboard",
            icon: <DashboardIcon />,
            description: "Trang chính",
          },
          {
            id: "campaigns",
            label: "Chiến dịch",
            path: "/user/campaigns",
            icon: <CampaignIcon />,
            description: "Xem chiến dịch",
          },
          {
            id: "profile",
            label: "Hồ sơ",
            path: "/user/profile",
            icon: <AccountCircleIcon />,
            description: "Thông tin cá nhân",
          },
        ];
    }
  }, [user]);

  // 3. Tìm navigation item hiện tại dựa trên path
  const currentNavItem = useMemo(() => {
    const currentPath = location.pathname;

    // Hàm đệ quy để tìm item trong tree
    const findItem = (items: NavigationItem[]): NavigationItem | null => {
      for (const item of items) {
        if (item.path === currentPath) {
          return item;
        }
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findItem(navigationItems);
  }, [location.pathname, navigationItems]);

  // 4. Tạo breadcrumbs
  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [];

    // Luôn có Home
    items.push({
      label: "Home",
      path: `/${user?.role || "user"}/dashboard`,
      icon: <DashboardIcon fontSize="small" />,
    });

    // Nếu có current item, thêm vào breadcrumb
    if (currentNavItem) {
      // Tìm parent nếu có
      const findParent = (
        items: NavigationItem[],
        targetId: string
      ): NavigationItem | null => {
        for (const item of items) {
          if (item.children?.some((child) => child.id === targetId)) {
            return item;
          }
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
          path: parent.path,
        });
      }

      items.push({
        label: currentNavItem.label,
        // Không có path cho item cuối cùng (trang hiện tại)
      });
    }

    return items;
  }, [currentNavItem, navigationItems, user]);

  // 5. Các hàm navigate tiện ích
  const navigateTo = (path: string) => {
    navigate(path);
  };

  const navigateToHome = () => {
    navigate(`/${user?.role || "user"}/dashboard`);
  };

  const navigateBack = () => {
    navigate(-1);
  };

  const navigateToLogin = () => {
    navigate("/login");
  };

  // 6. Kiểm tra xem path hiện tại có phải là trang chủ không
  const isHome = location.pathname === `/${user?.role || "user"}/dashboard`;

  // 7. Lấy navigation items "phẳng" (flatten) để dễ search
  const flatNavigationItems = useMemo(() => {
    const flatten = (items: NavigationItem[]): NavigationItem[] => {
      return items.reduce<NavigationItem[]>((acc, item) => {
        acc.push(item);
        if (item.children) {
          acc.push(...flatten(item.children));
        }
        return acc;
      }, []);
    };

    return flatten(navigationItems);
  }, [navigationItems]);

  // Return tất cả các giá trị và hàm cần thiết
  return {
    // Navigation items
    navigationItems,
    flatNavigationItems,
    currentNavItem,

    // Breadcrumbs
    breadcrumbs,

    // Navigation functions
    navigateTo,
    navigateToHome,
    navigateBack,
    navigateToLogin,

    // State checks
    isHome,
    currentPath: location.pathname,

    // User info
    userRole: user?.role,
  };
};
