// src/shared/components/layout/DashboardLayout.tsx

import React, { useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/AuthProvider";
import { usePermissions } from "../../../features/auth/hooks/usePermissions";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import StorefrontIcon from "@mui/icons-material/Storefront";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import StoreIcon from "@mui/icons-material/Store";
import GroupIcon from "@mui/icons-material/Group";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 240;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Menu items cho từng role
const getMenuItems = (role: string) => {
  switch (role) {
    case "admin":
      return [
        {
          text: "Dashboard",
          icon: <DashboardIcon />,
          path: "/admin/dashboard",
        },
        { text: "Users", icon: <PeopleIcon />, path: "/admin/users" },
        { text: "Sellers", icon: <StorefrontIcon />, path: "/admin/sellers" },
        { text: "Franchises", icon: <StoreIcon />, path: "/admin/franchises" },
        { text: "Reports", icon: <AssessmentIcon />, path: "/admin/reports" },
        { text: "Settings", icon: <SettingsIcon />, path: "/admin/settings" },
      ];
    case "seller":
      return [
        {
          text: "Dashboard",
          icon: <DashboardIcon />,
          path: "/seller/dashboard",
        },
        { text: "Products", icon: <InventoryIcon />, path: "/seller/products" },
        { text: "Orders", icon: <ShoppingCartIcon />, path: "/seller/orders" },
        { text: "Reports", icon: <AssessmentIcon />, path: "/seller/reports" },
        { text: "Settings", icon: <SettingsIcon />, path: "/seller/settings" },
      ];
    case "franchise":
      return [
        {
          text: "Dashboard",
          icon: <DashboardIcon />,
          path: "/franchise/dashboard",
        },
        {
          text: "Branches",
          icon: <LocationOnIcon />,
          path: "/franchise/branches",
        },
        {
          text: "Employees",
          icon: <GroupIcon />,
          path: "/franchise/employees",
        },
        {
          text: "Inventory",
          icon: <InventoryIcon />,
          path: "/franchise/inventory",
        },
        {
          text: "Reports",
          icon: <AssessmentIcon />,
          path: "/franchise/reports",
        },
        {
          text: "Settings",
          icon: <SettingsIcon />,
          path: "/franchise/settings",
        },
      ];
    default:
      return [
        { text: "Dashboard", icon: <DashboardIcon />, path: "/user/dashboard" },
        { text: "Profile", icon: <AccountCircleIcon />, path: "/user/profile" },
      ];
  }
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { hasRole } = usePermissions();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = user ? getMenuItems(user.role) : [];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "#1976d2";
      case "seller":
        return "#388e3c";
      case "franchise":
        return "#f57c00";
      default:
        return "#757575";
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${open ? drawerWidth : 60}px)`,
          ml: `${open ? drawerWidth : 60}px`,
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.role
              ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(
                  1
                )} Dashboard`
              : "Dashboard"}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user?.username || user?.email}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: open ? drawerWidth : 60,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : 60,
            boxSizing: "border-box",
            transition: (theme) =>
              theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: [1],
          }}
        >
          <Typography variant="h6" noWrap>
            JBAAI
          </Typography>
        </Toolbar>
        <Divider />

        {open && user && (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Avatar sx={{ width: 56, height: 56, margin: "0 auto", mb: 1 }}>
              {user.username?.charAt(0).toUpperCase() ||
                user.email.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2">
              {user.username || user.email}
            </Typography>
            <Box
              sx={{
                mt: 1,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: getRoleBadgeColor(user.role),
                color: "white",
                fontSize: "0.75rem",
                display: "inline-block",
              }}
            >
              {user.role.toUpperCase()}
            </Box>
          </Box>
        )}

        <Divider />

        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />

        <List>
          <ListItem disablePadding sx={{ display: "block" }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
              onClick={handleLogout}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          width: `calc(100% - ${open ? drawerWidth : 60}px)`,
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
