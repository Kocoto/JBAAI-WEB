// src/features/admin/components/campaigns/AdminCampaignList.tsx

// Core React import
import React from "react";

// Material UI Components
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

// Material UI Data Grid
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

// Custom Hooks & Components
import { useAdminCampaign } from "@/features/admin/hooks/useAdminCampaign";
import CampaignDataGrid from "./CampaignDataGrid";
import {
  CAMPAIGN_STATUS,
  CampaignStatus,
} from "@/features/admin/types/campaign.types";

// Material UI Icons
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import CampaignIcon from "@mui/icons-material/Campaign";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EventIcon from "@mui/icons-material/Event";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

// Status configuration với màu sắc và icon
const statusConfig = {
  [CAMPAIGN_STATUS.ACTIVE]: {
    color: "success" as const,
    icon: <CheckCircleIcon />,
    label: "Đang hoạt động",
    bgColor: "#e8f5e9",
    textColor: "#388e3c",
  },
  [CAMPAIGN_STATUS.INACTIVE]: {
    color: "warning" as const,
    icon: <PauseCircleIcon />,
    label: "Tạm dừng",
    bgColor: "#fff8e1",
    textColor: "#f57c00",
  },
  [CAMPAIGN_STATUS.EXPIRED]: {
    color: "error" as const,
    icon: <CancelIcon />,
    label: "Đã hết hạn",
    bgColor: "#ffebee",
    textColor: "#d32f2f",
  },
};

// Component cho status chip
const StatusChip: React.FC<{ status: CampaignStatus }> = ({ status }) => {
  const config = statusConfig[status as keyof typeof statusConfig];
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

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Format number helper
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("vi-VN").format(num);
};

export default function AdminCampaignList() {
  const theme = useTheme();
  const {
    campaignList,
    filters,
    isCreating,
    isUpdating,
    isDeleting,
    fetchCampaignList,
    isLoading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    changeCampaignStatus,
    searchCampaigns,
    filterByStatus,
    // filterByFranchise,
    filterByDateRange,
    goToPage,
    goToNextPage,
    goToPrevPage,
    changePageSize,
    clearFilters,
  } = useAdminCampaign();

  const [selectedTab, setSelectedTab] = React.useState<CampaignStatus | "all">(
    "all"
  );
  const [searchTerm, setSearchTerm] = React.useState("");
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [selectedCampaign, setSelectedCampaign] = React.useState<any>(null);

  // Handle tab change
  const handleTabChange = async (
    event: React.SyntheticEvent,
    newValue: CampaignStatus | "all"
  ) => {
    setSelectedTab(newValue);
    if (newValue === "all") {
      await clearFilters();
    } else {
      await filterByStatus(newValue);
    }
  };

  // Handle search
  const handleSearch = React.useCallback(
    async (value: string) => {
      setSearchTerm(value);
      if (value.trim()) {
        await searchCampaigns(value);
      } else {
        await fetchCampaignList();
      }
    },
    [searchCampaigns, fetchCampaignList]
  );

  // Handle refresh
  const handleRefresh = async () => {
    setSearchTerm("");
    setSelectedTab("all");
    await clearFilters();
  };

  // Định nghĩa columns cho DataGrid
  const columns: GridColDef[] = [
    {
      field: "icon",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: () => (
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            width: 40,
            height: 40,
          }}
        >
          <CampaignIcon />
        </Avatar>
      ),
    },
    {
      field: "campaignName",
      headerName: "Tên chiến dịch",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {params.row._id}
          </Typography>
        </Box>
      ),
    },
    {
      field: "franchiseOwner",
      headerName: "Franchise",
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon fontSize="small" color="action" />
          <Box>
            <Typography variant="body2">
              {params.row.franchiseOwnerId?.userId?.franchiseName || "N/A"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Level {params.row.franchiseOwnerId?.franchiseLevel || 0}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "totalAllocated",
      headerName: "Quota phân bổ",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" fontWeight={600} color="primary">
            {formatNumber(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Còn lại: {formatNumber(params.row.remainingQuota || 0)}
          </Typography>
        </Box>
      ),
    },
    {
      field: "dateRange",
      headerName: "Thời gian",
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarTodayIcon fontSize="small" color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Từ: {formatDate(params.row.startDate)}
            </Typography>
            <br />
            <Typography variant="caption" color="text.secondary">
              Đến: {formatDate(params.row.endDate)}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <StatusChip status={params.value} />
      ),
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Xem chi tiết">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedCampaign(params.row);
                // Handle view details
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setSelectedCampaign(params.row);
                // Handle edit
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setSelectedCampaign(params.row);
                // Handle delete
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  // Get filtered data based on selected tab
  const getFilteredData = () => {
    if (selectedTab === "all") {
      return campaignList;
    }
    return campaignList.filter((campaign) => campaign.status === selectedTab);
  };

  const filteredData = getFilteredData();

  // Tab counts
  const tabCounts = {
    all: campaignList.length,
    [CAMPAIGN_STATUS.ACTIVE]: campaignList.filter(
      (c) => c.status === CAMPAIGN_STATUS.ACTIVE
    ).length,
    [CAMPAIGN_STATUS.INACTIVE]: campaignList.filter(
      (c) => c.status === CAMPAIGN_STATUS.INACTIVE
    ).length,
    [CAMPAIGN_STATUS.EXPIRED]: campaignList.filter(
      (c) => c.status === CAMPAIGN_STATUS.EXPIRED
    ).length,
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Quản lý chiến dịch
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý và theo dõi các chiến dịch marketing
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Tooltip title="Tải xuống báo cáo">
            <IconButton
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Làm mới">
            <IconButton
              onClick={handleRefresh}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: 2,
            }}
          >
            Tạo chiến dịch mới
          </Button>
        </Stack>
      </Stack>

      {/* Main Content */}
      <Grow in timeout={500}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          }}
        >
          {/* Tabs */}
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
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  minHeight: 48,
                },
              }}
            >
              <Tab
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Tất cả</span>
                    <Badge badgeContent={tabCounts.all} color="primary" />
                  </Stack>
                }
                value="all"
              />
              <Tab
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Đang hoạt động</span>
                    <Badge
                      badgeContent={tabCounts[CAMPAIGN_STATUS.ACTIVE]}
                      color="success"
                    />
                  </Stack>
                }
                value={CAMPAIGN_STATUS.ACTIVE}
              />
              <Tab
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Tạm dừng</span>
                    <Badge
                      badgeContent={tabCounts[CAMPAIGN_STATUS.INACTIVE]}
                      color="warning"
                    />
                  </Stack>
                }
                value={CAMPAIGN_STATUS.INACTIVE}
              />
              <Tab
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Đã hết hạn</span>
                    <Badge
                      badgeContent={tabCounts[CAMPAIGN_STATUS.EXPIRED]}
                      color="error"
                    />
                  </Stack>
                }
                value={CAMPAIGN_STATUS.EXPIRED}
              />
            </Tabs>
          </Box>

          {/* Filters and Search */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                placeholder="Tìm kiếm chiến dịch..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{ flex: 1, maxWidth: 400 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                Bộ lọc
              </Button>
            </Stack>
          </Box>

          {/* Data Grid */}
          <Box sx={{ height: 600 }}>
            {isLoading ? (
              // Loading skeleton
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
                  <CampaignIcon sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h6" gutterBottom>
                  {searchTerm
                    ? "Không tìm thấy chiến dịch phù hợp"
                    : "Chưa có chiến dịch nào"}
                </Typography>
                <Typography variant="body2">
                  {searchTerm
                    ? "Thử tìm kiếm với từ khóa khác"
                    : "Bắt đầu bằng cách tạo chiến dịch mới"}
                </Typography>
              </Box>
            ) : (
              // Data grid
              <CampaignDataGrid
                rows={filteredData.map((item) => ({
                  ...item,
                  id: item._id,
                }))}
                columns={columns}
                loading={isLoading}
              />
            )}
          </Box>
        </Paper>
      </Grow>

      {/* Create Campaign Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Tạo chiến dịch mới</DialogTitle>
        <DialogContent>
          {/* Add form fields here */}
          <Typography>Form tạo chiến dịch sẽ được thêm vào đây</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={() => setShowCreateDialog(false)}
          >
            Tạo chiến dịch
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
