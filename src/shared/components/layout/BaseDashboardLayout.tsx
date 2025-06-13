// src/shared/components/layout/BaseDashboardLayout.tsx

import * as React from "react";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-charts/themeAugmentation";
import type {} from "@mui/x-data-grid-pro/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AppNavbar from "@/shared/components/layout/AppNavbar";
import Header from "@/shared/components/layout/Header";
import SideMenu from "@/shared/components/layout/SideMenu";
// import { AdvancedSideMenu } from "@/shared/components/layout/AdvancedSideMenu";
import AppTheme from "@/shared/theme/AppTheme";
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from "@/shared/theme/customizations";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

interface BaseDashboardLayoutProps {
  children: React.ReactNode;
  disableCustomTheme?: boolean;
  hideHeader?: boolean;
}

export default function BaseDashboardLayout({
  children,
  disableCustomTheme,
  hideHeader = false,
}: BaseDashboardLayoutProps) {
  return (
    <AppTheme
      disableCustomTheme={disableCustomTheme}
      themeComponents={xThemeComponents}
    >
      <CssBaseline enableColorScheme />
      <Box sx={{ display: "flex" }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: "auto",
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            {!hideHeader && <Header />}
            {children}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
