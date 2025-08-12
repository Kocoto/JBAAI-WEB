import * as React from "react";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SelectContent from "@/shared/components/ui/SelectContent";
import MenuContent from "@/shared/components/ui/MenuContent";
import CardAlert from "@/shared/components/feedback/CardAlert";
import OptionsMenu from "@/shared/components/ui/OptionsMenu";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({
  open,
  toggleDrawer,
}: SideMenuMobileProps) {
  const { user } = useAuth();

  return (
    <MuiDrawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: "none",
          backgroundColor: "background.paper",
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: "70dvw",
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            p: 1.5,
          }}
        >
          <SelectContent />
        </Box>
        <Divider />
        <Box
          sx={{
            overflow: "auto",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <MenuContent />
          {/* <CardAlert /> */}
        </Box>
        <Stack
          direction="row"
          sx={{
            p: 2,
            gap: 1,
            alignItems: "center",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Avatar
            sizes="small"
            alt={user?.username}
            src="/static/images/avatar/7.jpg"
            sx={{ width: 36, height: 36 }}
          />
          <Box sx={{ mr: "auto" }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, lineHeight: "16px" }}
            >
              {user?.username || "Guest"}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {user?.email || "guest@example.com"}
            </Typography>
          </Box>
          <OptionsMenu />
        </Stack>
      </Stack>
    </MuiDrawer>
  );
}
