// src/shared/components/ui/AdvancedSideMenu.tsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  TextField,
  InputAdornment,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Divider,
  alpha,
  Badge,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import HistoryIcon from "@mui/icons-material/History";
import { NavLink } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import {
  useDashboardNavigation,
  NavigationItem,
} from "@/shared/hooks/useDashboardNavigation";

// Component Sidebar nâng cao với Search, Favorites, Recent
export function AdvancedSideMenu() {
  const theme = useTheme();
  const { navigationItems, flatNavigationItems, currentPath, navigateTo } =
    useDashboardNavigation();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);

  // Load favorites và recent từ localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("navigationFavorites");
    const savedRecent = localStorage.getItem("navigationRecent");

    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedRecent) setRecentItems(JSON.parse(savedRecent));
  }, []);

  // Update recent items khi navigate
  useEffect(() => {
    if (currentPath && !recentItems.includes(currentPath)) {
      const newRecent = [currentPath, ...recentItems.slice(0, 4)];
      setRecentItems(newRecent);
      localStorage.setItem("navigationRecent", JSON.stringify(newRecent));
    }
  }, [currentPath]);

  // Toggle menu con
  const handleToggle = (itemId: string) => {
    setOpenItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Toggle favorite
  const toggleFavorite = (itemId: string) => {
    const newFavorites = favorites.includes(itemId)
      ? favorites.filter((id) => id !== itemId)
      : [...favorites, itemId];

    setFavorites(newFavorites);
    localStorage.setItem("navigationFavorites", JSON.stringify(newFavorites));
  };

  // Filter items theo search
  const filteredItems = flatNavigationItems.filter((item) => {
    if (!searchTerm) return false;
    const term = searchTerm.toLowerCase();
    return (
      item.label.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
    );
  });

  // Get favorite items
  const favoriteItems = flatNavigationItems.filter((item) =>
    favorites.includes(item.id)
  );

  // Get recent navigation items
  const recentNavigationItems = recentItems
    .map((path) => flatNavigationItems.find((item) => item.path === path))
    .filter(Boolean) as NavigationItem[];

  // Render navigation item
  const renderNavItem = (
    item: NavigationItem,
    depth = 0,
    showFavoriteButton = true
  ) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems.includes(item.id);
    const isActive = currentPath === item.path;
    const isFavorite = favorites.includes(item.id);

    return (
      <React.Fragment key={item.id}>
        <ListItem
          disablePadding
          sx={{ display: "block" }}
          secondaryAction={
            showFavoriteButton &&
            !hasChildren && (
              <IconButton
                edge="end"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
                sx={{
                  opacity: isFavorite ? 1 : 0,
                  transition: "opacity 0.2s",
                  ".MuiListItem-root:hover &": {
                    opacity: 1,
                  },
                }}
              >
                {isFavorite ? (
                  <StarIcon fontSize="small" color="warning" />
                ) : (
                  <StarBorderIcon fontSize="small" />
                )}
              </IconButton>
            )
          }
        >
          {hasChildren ? (
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
              <ListItemText
                primary={item.label}
                secondary={item.description}
                primaryTypographyProps={{
                  fontSize: depth > 0 ? "0.875rem" : "1rem",
                }}
              />
              {item.badge && (
                <Badge badgeContent={item.badge} color="error" sx={{ mr: 3 }} />
              )}
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          ) : (
            <NavLink
              to={item.path}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <ListItemButton
                selected={isActive}
                disabled={item.disabled}
                sx={{
                  pl: depth * 2 + 2,
                  borderRadius: 1,
                  mb: 0.5,
                  ...(isActive && {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.25),
                    },
                  }),
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? theme.palette.primary.main : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={!isActive ? item.description : undefined}
                  primaryTypographyProps={{
                    fontSize: depth > 0 ? "0.875rem" : "1rem",
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
                {item.badge && (
                  <Badge badgeContent={item.badge} color="error" />
                )}
              </ListItemButton>
            </NavLink>
          )}
        </ListItem>

        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) =>
                renderNavItem(child, depth + 1, showFavoriteButton)
              )}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 280,
          boxSizing: "border-box",
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
        },
      }}
    >
      <Box sx={{ overflow: "auto", height: "100%" }}>
        {/* Search Bar */}
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Search Results */}
        {searchTerm && (
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                KẾT QUẢ TÌM KIẾM ({filteredItems.length})
              </Typography>
              <List dense sx={{ mt: 1 }}>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => renderNavItem(item, 0, false))
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ p: 2, textAlign: "center" }}
                  >
                    Không tìm thấy kết quả
                  </Typography>
                )}
              </List>
            </Box>
          </>
        )}

        {/* Favorites Section */}
        {!searchTerm && favoriteItems.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <StarIcon fontSize="small" color="warning" />
                YÊU THÍCH
              </Typography>
              <List dense sx={{ mt: 1 }}>
                {favoriteItems.map((item) => renderNavItem(item, 0, true))}
              </List>
            </Box>
          </>
        )}

        {/* Recent Section */}
        {!searchTerm && recentNavigationItems.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <HistoryIcon fontSize="small" />
                  GẦN ĐÂY
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setShowRecent(!showRecent)}
                >
                  {showRecent ? (
                    <ExpandLess fontSize="small" />
                  ) : (
                    <ExpandMore fontSize="small" />
                  )}
                </IconButton>
              </Box>
              <Collapse in={showRecent}>
                <List dense sx={{ mt: 1 }}>
                  {recentNavigationItems.map((item) =>
                    renderNavItem(item, 0, false)
                  )}
                </List>
              </Collapse>
            </Box>
          </>
        )}

        {/* Main Navigation */}
        {!searchTerm && (
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                MENU CHÍNH
              </Typography>
              <List dense sx={{ mt: 1 }}>
                {navigationItems.map((item) => renderNavItem(item))}
              </List>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}

// ===================================================================

// Component hiển thị Navigation Path
export function NavigationPath() {
  const { breadcrumbs, navigateTo } = useDashboardNavigation();
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 2,
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
        borderRadius: 1,
        mb: 2,
      }}
    >
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <Typography variant="caption" color="text.secondary">
              /
            </Typography>
          )}
          {item.path ? (
            <Chip
              label={item.label}
              size="small"
              // icon={item.icon}
              onClick={() => navigateTo(item.path!)}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                },
              }}
            />
          ) : (
            <Chip
              label={item.label}
              size="small"
              // icon={item.icon}
              color="primary"
              sx={{ fontWeight: 600 }}
            />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
}

// ===================================================================

// Component Command Palette (Ctrl+K)
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { flatNavigationItems, navigateTo } = useDashboardNavigation();

  // Listen for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredItems = flatNavigationItems.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigateTo(path);
    setOpen(false);
    setSearch("");
  };

  // Component UI cho Command Palette...
  return null; // Implement UI here
}
