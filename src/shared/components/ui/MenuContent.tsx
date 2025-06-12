import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useAuth } from "../../../features/auth/context/AuthProvider";
import CampaignIcon from "@mui/icons-material/Campaign";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
// import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
// import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
// import HelpRoundedIcon from "@mui/icons-material/HelpRounded";

const getMainListItems = (role: string) => {
  switch (role) {
    case "admin":
      return [
        {
          text: "Dashboard",
          icon: <DashboardIcon />,
          path: "/admin/dashboard",
        },
        {
          text: "Campaigns",
          icon: <CampaignIcon />,
          path: "/admin/campaigns",
        },
      ];
    case "seller":
      return [
        {
          text: "Dashboard",
          icon: <DashboardIcon />,
          path: "/seller/dashboard",
        },
      ];
    case "franchise":
      return [
        {
          text: "Dashboard",
          icon: <DashboardIcon />,
          path: "/franchise/dashboard",
        },
      ];
    default:
      return [
        { text: "Dashboard", icon: <DashboardIcon />, path: "/user/dashboard" },
        {
          text: "Campaigns",
          icon: <CampaignIcon />,
          path: "/user/campaigns",
        },
      ];
  }
};

// const secondaryListItems = [
//   { text: "Settings", icon: <SettingsRoundedIcon /> },
//   { text: "About", icon: <InfoRoundedIcon /> },
//   { text: "Feedback", icon: <HelpRoundedIcon /> },
// ];

export default function MenuContent() {
  const { user } = useAuth();
  const theme = useTheme();
  const mainListItems = getMainListItems(user?.role || "");
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {mainListItems.map((item, index) => {
          return (
            <ListItem key={item.path} disablePadding sx={{ display: "block" }}>
              <NavLink to={item.path} style={{ textDecoration: "none" }}>
                {({ isActive }) => (
                  <ListItemButton
                    selected={isActive}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      // Styling cho trạng thái selected/active
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
                    <ListItemIcon
                      sx={{
                        color: isActive
                          ? "inherit"
                          : theme.palette.text.secondary,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontWeight: isActive ? 600 : 400,
                        },
                      }}
                    />
                  </ListItemButton>
                )}
              </NavLink>
            </ListItem>
          );
        })}
      </List>
    </Stack>
  );
}
