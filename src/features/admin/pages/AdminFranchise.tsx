// src/features/admin/pages/AdminFranchise.tsx

import React, { useState, useMemo, useCallback, JSX } from "react";
import {
  Box,
  Paper,
  Typography,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Button,
  Tooltip,
  Skeleton,
  Grow,
  Avatar,
  alpha,
  useTheme,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  AccountTree as AccountTreeIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { viVN } from "@mui/x-data-grid/locales";
import BaseDashboardLayout from "../../../shared/components/layout/BaseDashboardLayout";
import { useAdminFranchise } from "../hooks/useAdminFranchise";
import FranchiseHierarchyDialog from "../components/franchises/FranchiseHierarchyDialog";
import FranchiseStatusChip from "../components/franchises/FranchiseStatusChip";

// Tab configuration
interface TabConfig {
  id: string;
  label: string;
  icon: JSX.Element;
  count?: number;
  color: string;
}

// Custom toolbar component
function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1 }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

export default function AdminFranchise() {
  const theme = useTheme();
  const {
    franchiseList,
    franchiseStatistics,
    pagination,
    filters,
    isLoading,
    isLoadingStatistics,
    error,
    fetchFranchiseList,
    fetchFranchiseHierarchy,
    searchFranchises,
    filterByLevel,
    filterByStatus,
    updateFranchiseStatus,
    goToPage,
    changePageSize,
    navigateToFranchiseDetail,
    refreshData,
  } = useAdminFranchise();

  // Local state
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFranchise, setSelectedFranchise] = useState<string | null>(
    null
  );
  const [hierarchyDialogOpen, setHierarchyDialogOpen] = useState(false);
  const [hierarchyUserId, setHierarchyUserId] = useState<string | null>(null);

  // Tab configurations
  const tabConfigs: TabConfig[] = [
    {
      id: "all",
      label: "Tất cả",
      icon: <BusinessIcon />,
      count: pagination.total,
      color: theme.palette.primary.main,
    },
    {
      id: "level-0",
      label: "Cấp 0",
      icon: <PeopleIcon />,
      count: franchiseStatistics?.franchisesByLevel?.[0],
      color: theme.palette.info.main,
    },
    {
      id: "level-1",
      label: "Cấp 1",
      icon: <TrendingUpIcon />,
      count: franchiseStatistics?.franchisesByLevel?.[1],
      color: theme.palette.success.main,
    },
    {
      id: "level-2",
      label: "Cấp 2+",
      icon: <AccountTreeIcon />,
      count: franchiseStatistics?.franchisesByLevel?.[2],
      color: theme.palette.warning.main,
    },
  ];

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    setSearchTerm("");

    switch (newValue) {
      case 0: // All
        filterByLevel(undefined);
        break;
      case 1: // Level 0
        filterByLevel(0);
        break;
      case 2: // Level 1
        filterByLevel(1);
        break;
      case 3: // Level 2+
        filterByLevel(2);
        break;
    }
  };

  // Handle search
  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      if (value.trim()) {
        searchFranchises(value);
      } else {
        fetchFranchiseList();
      }
    },
    [searchFranchises, fetchFranchiseList]
  );

  // Handle menu actions
  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    franchiseId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedFranchise(franchiseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFranchise(null);
  };

  const handleViewHierarchy = (userId: string) => {
    setHierarchyUserId(userId);
    setHierarchyDialogOpen(true);
    handleMenuClose();
  };

  const handleStatusToggle = async (
    franchiseId: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await updateFranchiseStatus(franchiseId, newStatus);
    handleMenuClose();
  };

  // DataGrid columns
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
          {params.row.franchiseName?.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      field: "franchiseName",
      headerName: "Tên Franchise",
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {params.row.id.substring(0, 8)}...
          </Typography>
        </Box>
      ),
    },
    {
      field: "ownerInfo",
      headerName: "Chủ sở hữu",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2">{params.row.ownerName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: "phone",
      headerName: "Số điện thoại",
      width: 130,
    },
    {
      field: "level",
      headerName: "Cấp bậc",
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <FranchiseStatusChip level={params.value} />
      ),
    },
    {
      field: "activeQuota",
      headerName: "Quota hoạt động",
      width: 130,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value > 0 ? "success" : "default"}
          variant={params.value > 0 ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value === "active" ? "Hoạt động" : "Tạm ngưng"}
          size="small"
          color={params.value === "active" ? "success" : "error"}
          variant="outlined"
          icon={params.value === "active" ? <CheckCircleIcon /> : <BlockIcon />}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Ngày tạo",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(params.value).toLocaleDateString("vi-VN")}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 100,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton
            size="small"
            onClick={(e) => handleMenuClick(e, params.row.id)}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl) && selectedFranchise === params.row.id}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={() => navigateToFranchiseDetail(params.row.id)}>
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
              Xem chi tiết
            </MenuItem>
            <MenuItem onClick={() => handleViewHierarchy(params.row.userId)}>
              <AccountTreeIcon fontSize="small" sx={{ mr: 1 }} />
              Xem cây phân cấp
            </MenuItem>
            <MenuItem
              onClick={() =>
                handleStatusToggle(params.row.id, params.row.status)
              }
            >
              {params.row.status === "active" ? (
                <>
                  <BlockIcon fontSize="small" sx={{ mr: 1 }} />
                  Tạm ngưng
                </>
              ) : (
                <>
                  <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                  Kích hoạt
                </>
              )}
            </MenuItem>
          </Menu>
        </>
      ),
    },
  ];

  // Transform franchise data for DataGrid
  const rows = useMemo(() => {
    if (!franchiseList || !Array.isArray(franchiseList)) {
      return [];
    }
    return franchiseList.map((franchise) => ({
      id: franchise._id,
      franchiseName: franchise.userId.franchiseName,
      ownerName: franchise.userId.username,
      email: franchise.userId.email,
      phone: franchise.userId.phone,
      userId: franchise.userId._id,
      level: franchise.franchiseLevel,
      activeQuota: franchise.totalActiveQuota,
      status: franchise.userId.status,
      createdAt: franchise.createdAt,
    }));
  }, [franchiseList]);

  return (
    <BaseDashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Quản lý Franchise
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý và theo dõi hệ thống franchise
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          {isLoadingStatistics ? (
            [1, 2, 3, 4].map((item) => (
              <Skeleton
                key={item}
                variant="rectangular"
                height={100}
                sx={{ flex: 1, borderRadius: 2 }}
              />
            ))
          ) : (
            <>
              <Paper
                sx={{
                  p: 2.5,
                  flex: 1,
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.1
                  )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Tổng số Franchise
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="primary">
                    {franchiseStatistics?.totalFranchises || 0}
                  </Typography>
                </Stack>
              </Paper>

              <Paper
                sx={{
                  p: 2.5,
                  flex: 1,
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.success.main,
                    0.1
                  )} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Đang hoạt động
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="success.main"
                  >
                    {franchiseStatistics?.activeFranchises || 0}
                  </Typography>
                </Stack>
              </Paper>

              <Paper
                sx={{
                  p: 2.5,
                  flex: 1,
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.info.main,
                    0.1
                  )} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Tổng Quota phân phối
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    {franchiseStatistics?.totalQuotaDistributed || 0}
                  </Typography>
                </Stack>
              </Paper>

              <Paper
                sx={{
                  p: 2.5,
                  flex: 1,
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.warning.main,
                    0.1
                  )} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Tăng trưởng tháng
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="warning.main"
                  >
                    +{franchiseStatistics?.growthRate?.monthly || 0}%
                  </Typography>
                </Stack>
              </Paper>
            </>
          )}
        </Stack>

        {/* Main Content */}
        <Grow in timeout={300}>
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  px: 2,
                  "& .MuiTab-root": {
                    minHeight: 64,
                    textTransform: "none",
                    fontWeight: 600,
                  },
                }}
              >
                {tabConfigs.map((tab) => (
                  <Tab
                    key={tab.id}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        {React.cloneElement(tab.icon, {
                          sx: { fontSize: 20, color: tab.color },
                        })}
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                          <Chip
                            label={tab.count}
                            size="small"
                            sx={{
                              height: 20,
                              bgcolor: alpha(tab.color, 0.1),
                              color: tab.color,
                              fontWeight: 700,
                            }}
                          />
                        )}
                      </Stack>
                    }
                  />
                ))}
              </Tabs>
            </Box>

            {/* Toolbar */}
            <Box
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <TextField
                size="small"
                placeholder="Tìm kiếm franchise..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{ flex: 1, maxWidth: 400 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction="row" spacing={1}>
                <Tooltip title="Lọc">
                  <IconButton>
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Xuất Excel">
                  <IconButton>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Làm mới">
                  <IconButton onClick={refreshData}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            {/* DataGrid */}
            <Box sx={{ height: 600, width: "100%" }}>
              {isLoading ? (
                <Stack spacing={2} sx={{ p: 2 }}>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Skeleton
                      key={item}
                      variant="rectangular"
                      height={60}
                      sx={{ borderRadius: 1 }}
                    />
                  ))}
                </Stack>
              ) : error ? (
                <Box
                  sx={{
                    py: 8,
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Có lỗi xảy ra
                  </Typography>
                  <Typography variant="body2">{error.message}</Typography>
                  <Button
                    variant="outlined"
                    onClick={refreshData}
                    sx={{ mt: 2 }}
                  >
                    Thử lại
                  </Button>
                </Box>
              ) : rows.length === 0 ? (
                <Box
                  sx={{
                    py: 8,
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                    }}
                  >
                    <BusinessIcon
                      sx={{ fontSize: 48, color: "primary.main" }}
                    />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {searchTerm
                      ? "Không tìm thấy kết quả phù hợp"
                      : "Chưa có franchise nào"}
                  </Typography>
                  <Typography variant="body2">
                    {searchTerm
                      ? "Thử tìm kiếm với từ khóa khác"
                      : "Các franchise mới sẽ xuất hiện ở đây"}
                  </Typography>
                </Box>
              ) : (
                <DataGrid
                  rows={rows}
                  columns={columns}
                  // pageSize={pagination.limit}
                  // page={pagination.page - 1}
                  rowCount={pagination.total}
                  paginationMode="server"
                  // onPageChange={(newPage) => goToPage(newPage + 1)}
                  // onPageSizeChange={changePageSize}
                  pageSizeOptions={[5, 10, 20, 50]}
                  disableRowSelectionOnClick
                  loading={isLoading}
                  localeText={
                    viVN.components.MuiDataGrid.defaultProps.localeText
                  }
                  // components={{
                  //   Toolbar: CustomToolbar,
                  // }}
                  sx={{
                    border: 0,
                    "& .MuiDataGrid-cell": {
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.5
                      )}`,
                    },
                    "& .MuiDataGrid-columnHeaders": {
                      bgcolor: "background.default",
                      borderBottom: `2px solid ${theme.palette.divider}`,
                    },
                    "& .MuiDataGrid-row:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                />
              )}
            </Box>
          </Paper>
        </Grow>

        {/* Franchise Hierarchy Dialog */}
        {hierarchyUserId && (
          <FranchiseHierarchyDialog
            open={hierarchyDialogOpen}
            onClose={() => {
              setHierarchyDialogOpen(false);
              setHierarchyUserId(null);
            }}
            userId={hierarchyUserId}
          />
        )}
      </Box>
    </BaseDashboardLayout>
  );
}
