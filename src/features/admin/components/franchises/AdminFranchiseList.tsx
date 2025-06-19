import React from "react";
import {
  alpha,
  Avatar,
  Box,
  Fade,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import { FranchiseService } from "../../services/franchiseService";
import { useState, useEffect } from "react";
import { useAdminFranchise } from "../../hooks/useAdminFranchise";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

export default function AdminFranchiseList() {
  const theme = useTheme();

  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: theme.palette.primary.main,
            fontSize: "0.875rem",
          }}
        >
          {params.row.fullname?.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      field: "nameFranchise",
      headerName: "Tên Franchise",
      width: 200,
    },
    {
      field: "name",
      headerName: "Chủ sỡ hữu",
      width: 200,
    },
    {
      field: "level",
      headerName: "Cấp bậc",
      width: 200,
    },
    {
      field: "createdAt",
      headerName: "Ngày tham gia",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(params.value).toLocaleDateString("vi-VN")}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Hành động",
      flex: 1,
      minWidth: 200,
      sortable: false,
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Fade in timeout={600}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: "flex",
                alignItems: "center",
              }}
            >
              <BusinessIcon
                sx={{ color: theme.palette.primary.main, fontSize: 32 }}
              />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Quản lý Franchise
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Xem xét và quản lý các franchise
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Fade>
    </Box>
  );
}
