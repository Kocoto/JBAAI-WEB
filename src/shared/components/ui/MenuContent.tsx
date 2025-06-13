import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Badge from "@mui/material/Badge";
import { NavLink } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import {
  useDashboardNavigation,
  NavigationItem,
} from "@/shared/hooks/useDashboardNavigation";

export default function MenuContentExample() {
  const theme = useTheme();
  const { navigationItems, currentPath } = useDashboardNavigation();

  // State để quản lý menu con mở/đóng
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  // Hàm toggle menu con
  const handleToggle = (itemId: string) => {
    setOpenItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Hàm render một navigation item
  const renderNavItem = (item: NavigationItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems.includes(item.id);
    const isActive = currentPath === item.path;

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ display: "block" }}>
          {hasChildren ? (
            // Item có children - chỉ toggle, không navigate
            <ListItemButton
              onClick={() => handleToggle(item.id)}
              disabled={item.disabled}
              sx={{
                pl: depth * 2 + 2,
                borderRadius: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} secondary={item.description} />
              {item.badge && (
                <Badge badgeContent={item.badge} color="error" sx={{ mr: 1 }} />
              )}
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          ) : (
            // Item không có children - navigate khi click
            <NavLink to={item.path} style={{ textDecoration: "none" }}>
              <ListItemButton
                selected={isActive}
                disabled={item.disabled}
                sx={{
                  pl: depth * 2 + 2,
                  borderRadius: 1,
                  mb: 0.5,
                  ...(isActive && {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    "& .MuiListItemIcon-root": {
                      color: theme.palette.primary.contrastText,
                    },
                  }),
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={!isActive ? item.description : undefined}
                />
                {item.badge && (
                  <Badge badgeContent={item.badge} color="error" />
                )}
              </ListItemButton>
            </NavLink>
          )}
        </ListItem>

        {/* Render children nếu có và đang mở */}
        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderNavItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <List dense>{navigationItems.map((item) => renderNavItem(item))}</List>
  );
}
