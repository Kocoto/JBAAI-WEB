// src/shared/components/ui/QuickNavigation.tsx

import React from "react";
import { Box, Button, Typography, Grid, Paper, Chip } from "@mui/material";
import { useDashboardNavigation } from "@/shared/hooks/useDashboardNavigation";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export function QuickNavigationExample() {
  const { flatNavigationItems, navigateTo, currentPath } =
    useDashboardNavigation();

  // Lọc ra các item quan trọng (có badge hoặc là trang chính)
  const importantItems = flatNavigationItems.filter(
    (item) =>
      item.badge || // Có badge
      item.path.endsWith("/dashboard") || // Là dashboard
      item.id === "reports" // Hoặc là reports
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Truy cập nhanh
      </Typography>
      <Grid container spacing={2}>
        {importantItems.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
            <Paper
              sx={{
                p: 2,
                cursor: "pointer",
                transition: "all 0.3s",
                border: currentPath === item.path ? 2 : 0,
                borderColor: "primary.main",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
              onClick={() => navigateTo(item.path)}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ color: "primary.main" }}>{item.icon}</Box>
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {item.label}
                  </Typography>
                  {item.description && (
                    <Typography variant="caption" color="text.secondary">
                      {item.description}
                    </Typography>
                  )}
                </Box>
                {item.badge && (
                  <Chip
                    label={item.badge}
                    color="error"
                    size="small"
                    sx={{ minWidth: 24 }}
                  />
                )}
                <ArrowForwardIcon fontSize="small" color="action" />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
