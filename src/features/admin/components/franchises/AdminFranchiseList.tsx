import { JSX, useCallback, useMemo, useState } from "react";
import { useAdminFranchise } from "@/features/admin/hooks/useAdminFranchise";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  Fade,
  FormControl,
  Grow,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import FranchiseStatusChip from "./FranchiseStatusChip";
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
  Add as AddIcon,
} from "@mui/icons-material";
import React from "react";
import { viVN } from "@mui/x-data-grid/locales";
import { useNavigate } from "react-router-dom";

interface TabConfig {
  id: string;
  label: string;
  icon: JSX.Element;
  count?: number;
  color: string;
}

export default function AdminFranchiseList() {
  const theme = useTheme();
  const navigate = useNavigate();
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

  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFranchise, setSelectedFranchise] = useState<string | null>(
    null
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [hierarchyDialogOpen, setHierarchyDialogOpen] = useState(false);
  const [hierarchyUserId, setHierarchyUserId] = useState<string | null>(null);

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

  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

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

  // Custom No Rows Component
  const CustomNoRowsOverlay = () => {
    const theme = useTheme();
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        height="100%"
        spacing={2}
      >
        <Box
          component="img"
          src="/empty-state.svg" // Thêm SVG illustration nếu có
          alt="No data"
          sx={{
            width: 120,
            height: 120,
            opacity: 0.5,
            filter: "grayscale(100%)",
          }}
        />
        <Typography variant="h6" color="text.secondary">
          Không có dữ liệu
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dữ liệu sẽ xuất hiện ở đây khi có
        </Typography>
      </Stack>
    );
  };

  const CustomLoadingOverlay = () => (
    <Stack
      alignItems="center"
      justifyContent="center"
      height="100%"
      spacing={2}
    >
      <Box sx={{ width: "60%" }}>
        <LinearProgress color="primary" />
      </Box>
      <Typography variant="body2" color="text.secondary">
        Đang tải dữ liệu...
      </Typography>
    </Stack>
  );

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
      flex: 1.5, // Tăng flex để ưu tiên không gian cho cột quan trọng này
      minWidth: 220, // Tăng minWidth để không bị quá chật
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
      flex: 1.5, // Tăng flex
      minWidth: 250, // Tăng minWidth để chứa được email dài
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
      width: 140,
    },
    {
      field: "level",
      flex: 1,
      headerName: "Cấp bậc",
      renderCell: (params: GridRenderCellParams) => (
        <FranchiseStatusChip level={params.value} />
      ),
    },
    {
      field: "activeQuota",
      headerName: "Quota hoạt động",
      width: 160,
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
      flex: 0.5,
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
            <MenuItem onClick={() => navigate("/admin/campaigns/new")}>
              <AddIcon fontSize="small" sx={{ mr: 1 }} />
              Thêm chiến dịch
            </MenuItem>
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
                Xem xét và quản lý thông tin Franchise
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Fade>

      <Grow in timeout={800}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ md: "center" }}
          >
            <TextField
              size="small"
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />

            {/* <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Lọc theo level</InputLabel>
              <Select
                value={filterByLevel}
                onChange={(e) => setFilterByLevel(e.target.value)}
                label="Lọc theo level"
              >
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
              </Select>
            </FormControl> */}

            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" spacing={1}>
              <Tooltip title="Làm mới">
                <IconButton onClick={handleRefresh} disabled={isLoading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Xuất báo cáo" sx={{ display: "none" }}>
                <IconButton>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>
      </Grow>
      <Grow in timeout={1000}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant="fullWidth"
              scrollButtons="auto"
              aria-label="franchise status tabs"
              sx={{
                px: 2,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  minHeight: 56,
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
          <Box p={2}>
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
                <Button variant="outlined" onClick={refreshData} sx={{ mt: 2 }}>
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
                  <BusinessIcon sx={{ fontSize: 48, color: "primary.main" }} />
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
              <Fade in timeout={800}>
                <Paper
                  elevation={3}
                  sx={{
                    height: 600,
                    width: "100%",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <DataGrid
                    rows={rows}
                    columns={columns}
                    // pageSize={pagination.limit}
                    // page={pagination.page - 1}
                    rowCount={pagination.total}
                    paginationMode="server"
                    // onPageChange={(newPage) => goToPage(newPage + 1)}
                    // onPageSizeChange={changePageSize}
                    pageSizeOptions={[10, 20, 50]}
                    disableRowSelectionOnClick
                    disableColumnResize
                    loading={isLoading}
                    localeText={
                      viVN.components.MuiDataGrid.defaultProps.localeText
                    }
                    // components={{
                    //   Toolbar: CustomToolbar,
                    // }}
                    density="comfortable"
                    slots={{
                      loadingOverlay: CustomLoadingOverlay,
                      noRowsOverlay: CustomNoRowsOverlay,
                    }}
                    slotProps={{
                      filterPanel: {
                        filterFormProps: {
                          logicOperatorInputProps: {
                            variant: "outlined",
                            size: "small",
                          },
                          columnInputProps: {
                            variant: "outlined",
                            size: "small",
                            sx: { mt: "auto" },
                          },
                          operatorInputProps: {
                            variant: "outlined",
                            size: "small",
                            sx: { mt: "auto" },
                          },
                          valueInputProps: {
                            InputComponentProps: {
                              variant: "outlined",
                              size: "small",
                            },
                          },
                        },
                      },
                    }}
                    sx={{
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.04
                        ),
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        "& .MuiDataGrid-columnHeader": {
                          "&:focus": {
                            outline: "none",
                          },
                          "&:focus-within": {
                            outline: `2px solid ${theme.palette.primary.main}`,
                            outlineOffset: -2,
                          },
                        },
                        "& .MuiDataGrid-columnHeaderTitleContainer": {
                          justifyContent: "center",
                        },
                      },
                      "& .MuiDataGrid-columnHeaderTitle": {
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        // color: theme.palette.text.primary,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      },
                      "& .MuiDataGrid-columnSeparator": {
                        color: theme.palette.divider,
                        "&:hover": {
                          color: theme.palette.primary.main,
                        },
                      },

                      "& .MuiDataGrid-cell": {
                        borderBottom: `1px solid ${alpha(
                          theme.palette.divider,
                          0.5
                        )}`,
                        fontSize: "0.875rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "12px 16px",
                        "&:focus": {
                          outline: "none",
                        },
                        "&:focus-within": {
                          outline: `2px solid ${theme.palette.primary.main}`,
                          outlineOffset: -2,
                        },
                      },
                      "& .MuiDataGrid-row": {
                        transition: "all 0.2s ease-in-out",
                        minHeight: "60px !important",
                        maxHeight: "none !important",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.04
                          ),
                          transform: "translateY(-1px)",
                          boxShadow: `0 2px 8px ${alpha(
                            theme.palette.common.black,
                            0.08
                          )}`,
                        },
                        "&.Mui-selected": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.08
                          ),
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.12
                            ),
                          },
                        },
                        // Alternating row colors
                        "&:nth-of-type(even)": {
                          backgroundColor: alpha(theme.palette.grey[100], 0.5),
                          ...theme.applyStyles("dark", {
                            backgroundColor: alpha(
                              theme.palette.grey[900],
                              0.5
                            ),
                          }),
                        },
                        "& .MuiDataGrid-cell": {
                          whiteSpace: "normal",
                          overflow: "visible",
                          lineHeight: "1.5",
                        },
                      }, // Footer styling
                      "& .MuiDataGrid-footerContainer": {
                        borderTop: `2px solid ${theme.palette.divider}`,
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.02
                        ),
                      },
                      "& .MuiTablePagination-root": {
                        "& .MuiTablePagination-selectLabel": {
                          fontWeight: 500,
                        },
                        "& .MuiTablePagination-displayedRows": {
                          fontWeight: 500,
                          color: theme.palette.text.secondary,
                        },
                      }, // Scrollbar styling
                      "& .MuiDataGrid-virtualScroller": {
                        "&::-webkit-scrollbar": {
                          width: 8,
                          height: 8,
                        },
                        "&::-webkit-scrollbar-track": {
                          background: alpha(theme.palette.grey[300], 0.3),
                          borderRadius: 4,
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: theme.palette.grey[400],
                          borderRadius: 4,
                          "&:hover": {
                            background: theme.palette.grey[500],
                          },
                        },
                      },
                      // Loading overlay
                      "& .MuiDataGrid-overlay": {
                        backgroundColor: alpha(
                          theme.palette.background.default,
                          0.9
                        ),
                        backdropFilter: "blur(4px)",
                      },
                      // Sort icon
                      "& .MuiDataGrid-sortIcon": {
                        color: theme.palette.primary.main,
                      }, // Menu icon
                      "& .MuiDataGrid-menuIcon": {
                        "& .MuiSvgIcon-root": {
                          color: theme.palette.text.secondary,
                        },
                      },
                      // Checkbox styling
                      "& .MuiCheckbox-root": {
                        color: theme.palette.text.secondary,
                        "&.Mui-checked": {
                          color: theme.palette.primary.main,
                        },
                      },
                      // Density
                      "&.MuiDataGrid-root--densityCompact": {
                        "& .MuiDataGrid-cell": {
                          paddingTop: 4,
                          paddingBottom: 4,
                        },
                      },
                      "&.MuiDataGrid-root--densityStandard": {
                        "& .MuiDataGrid-cell": {
                          paddingTop: 8,
                          paddingBottom: 8,
                        },
                      },
                    }}
                  />
                </Paper>
              </Fade>
            )}
          </Box>
        </Paper>
      </Grow>
    </Box>
  );
}
