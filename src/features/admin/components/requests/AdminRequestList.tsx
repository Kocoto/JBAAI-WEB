// src/features/admin/components/requests/AdminRequestList.tsx

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Badge,
  Fade,
  Grow,
  Avatar,
  useTheme,
  alpha,
  Skeleton,
} from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  RequestStatus,
  useAdminRequest,
} from "@/features/admin/hooks/useAdminRequest";
import RequestDataGrid from "../../../../shared/components/data-grid/RequestDataGrid";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";
import RateReviewIcon from "@mui/icons-material/RateReview";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import VerifiedIcon from "@mui/icons-material/Verified";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import RequestPageIcon from "@mui/icons-material/RequestPage";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";

// Status configuration với màu sắc và icon
const statusConfig = {
  pending: {
    color: "warning" as const,
    icon: <PendingIcon />,
    label: "Đang chờ",
    bgColor: "#fff8e1",
    textColor: "#f57c00",
  },
  reviewing: {
    color: "info" as const,
    icon: <RateReviewIcon />,
    label: "Đang xét duyệt",
    bgColor: "#e3f2fd",
    textColor: "#1976d2",
  },
  approved: {
    color: "success" as const,
    icon: <CheckCircleIcon />,
    label: "Đã chấp thuận",
    bgColor: "#e8f5e9",
    textColor: "#388e3c",
  },
  rejected: {
    color: "error" as const,
    icon: <CancelIcon />,
    label: "Đã từ chối",
    bgColor: "#ffebee",
    textColor: "#d32f2f",
  },
};

// Component cho status chip
const StatusChip: React.FC<{ status: RequestStatus }> = ({ status }) => {
  const config = statusConfig[status];
  return (
    <Chip
      size="small"
      label={config.label}
      icon={config.icon}
      sx={{
        bgcolor: config.bgColor,
        color: config.textColor,
        "& .MuiChip-icon": {
          color: config.textColor,
        },
        fontWeight: 600,
        borderRadius: "8px",
      }}
    />
  );
};

export default function AdminRequestList() {
  const theme = useTheme();
  const {
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    reviewingRequests,
    acceptRequest,
    approveRequest,
    fetchAllRequests,
    isLoadingAny,
  } = useAdminRequest();

  const [selectedTab, setSelectedTab] =
    React.useState<RequestStatus>("pending");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterRole, setFilterRole] = React.useState("all");

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: RequestStatus
  ) => {
    setSelectedTab(newValue);
  };

  const handleRefresh = async () => {
    await fetchAllRequests();
  };

  // Định nghĩa cột với styling nâng cao
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
      field: "fullname",
      headerName: "Họ và tên",
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {params.row.id.slice(0, 8)}...
          </Typography>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <EmailIcon fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Stack>
      ),
    },
    {
      field: "phone",
      headerName: "Số điện thoại",
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <PhoneIcon fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Stack>
      ),
    },
    {
      field: "role",
      headerName: "Vai trò yêu cầu",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value === "franchise" ? "Franchise" : "User"}
          size="small"
          variant="outlined"
          color={params.value === "franchise" ? "primary" : "default"}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Ngày tạo",
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
      headerName: "Thao tác",
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        if (selectedTab === "pending") {
          return (
            <Tooltip title="Chấp nhận yêu cầu">
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => acceptRequest(params.row.id)}
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                }}
              >
                Chấp nhận
              </Button>
            </Tooltip>
          );
        }
        if (selectedTab === "reviewing") {
          return (
            <Stack direction="row" spacing={1}>
              <Tooltip title="Phê duyệt">
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<VerifiedIcon />}
                  onClick={() => approveRequest(params.row.id)}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                  }}
                >
                  Phê duyệt
                </Button>
              </Tooltip>
              <Tooltip title="Từ chối">
                <IconButton
                  color="error"
                  size="small"
                  sx={{
                    border: `1px solid ${alpha(theme.palette.error.main, 0.5)}`,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                    },
                  }}
                >
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
        return <StatusChip status={selectedTab} />;
      },
    },
  ];

  const tabContent = {
    pending: {
      title: "Yêu cầu đang chờ",
      state: pendingRequests,
      emptyMessage: "Không có yêu cầu nào đang chờ xử lý",
    },
    reviewing: {
      title: "Yêu cầu đang xét duyệt",
      state: reviewingRequests,
      emptyMessage: "Không có yêu cầu nào đang xét duyệt",
    },
    approved: {
      title: "Yêu cầu đã được chấp thuận",
      state: approvedRequests,
      emptyMessage: "Chưa có yêu cầu nào được chấp thuận",
    },
    rejected: {
      title: "Yêu cầu đã bị từ chối",
      state: rejectedRequests,
      emptyMessage: "Chưa có yêu cầu nào bị từ chối",
    },
  };

  const currentContent = tabContent[selectedTab];

  // Filter data based on search term and role
  const filteredData = currentContent.state.data.filter((item) => {
    const matchesSearch =
      item.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone?.includes(searchTerm);

    const matchesRole = filterRole === "all" || item.role === filterRole;

    return matchesSearch && matchesRole;
  });

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header Section */}
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
              <RequestPageIcon
                sx={{ color: theme.palette.primary.main, fontSize: 32 }}
              />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Quản lý Yêu cầu Nâng cấp
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Xem xét và phê duyệt các yêu cầu nâng cấp tài khoản
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Fade>

      {/* Filters and Actions */}
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

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Lọc theo vai trò</InputLabel>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                label="Lọc theo vai trò"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="franchise">Franchise</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ flexGrow: 1 }} />

            <Stack direction="row" spacing={1}>
              <Tooltip title="Làm mới">
                <IconButton onClick={handleRefresh} disabled={isLoadingAny}>
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

      {/* Main Content */}
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
              aria-label="request status tabs"
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  minHeight: 56,
                },
              }}
            >
              {Object.entries(statusConfig).map(([status, config]) => (
                <Tab
                  key={status}
                  label={
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {config.icon}
                      <span>{config.label}</span>
                      <Badge
                        badgeContent={
                          tabContent[status as RequestStatus].state.total
                        }
                        color={config.color}
                        max={99}
                        sx={{ paddingLeft: 1 }}
                      />
                    </Stack>
                  }
                  value={status}
                />
              ))}
            </Tabs>
          </Box>

          <Box p={3}>
            {currentContent.state.loading ? (
              // Loading skeleton
              <Stack spacing={2}>
                {[1, 2, 3, 4, 5].map((item) => (
                  <Skeleton
                    key={item}
                    variant="rectangular"
                    height={60}
                    sx={{ borderRadius: 1 }}
                  />
                ))}
              </Stack>
            ) : filteredData.length === 0 ? (
              // Empty state
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
                  {statusConfig[selectedTab].icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {searchTerm
                    ? "Không tìm thấy kết quả phù hợp"
                    : currentContent.emptyMessage}
                </Typography>
                <Typography variant="body2">
                  {searchTerm
                    ? "Thử tìm kiếm với từ khóa khác"
                    : "Các yêu cầu mới sẽ xuất hiện ở đây"}
                </Typography>
              </Box>
            ) : (
              // Data grid
              <RequestDataGrid
                rows={filteredData.map((item) => ({
                  ...item,
                  id: item._id,
                }))}
                columns={columns}
                loading={currentContent.state.loading}
              />
            )}
          </Box>
        </Paper>
      </Grow>
    </Box>
  );
}
