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
  Menu,
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
import { useNavigate } from "react-router-dom";

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
import MoreVertIcon from "@mui/icons-material/MoreVert";

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
  const navigate = useNavigate();

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
          {params.row.franchiseOwnerId?.franchiseName.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      field: "campaignName",
      headerName: "Tên chiến dịch",
      flex: 0.6,
      minWidth: 200,
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
      field: "franchiseOwner",
      headerName: "Franchise",
      width: 200,
      flex: 0.6,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2">
            {params.row.franchiseOwnerId?.franchiseName || "N/A"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Level {params.row.franchiseOwnerId?.franchiseLevel || 0}
          </Typography>
        </Box>
      ),
    },
    {
      field: "totalAllocated",
      headerName: "Tổng lượt sử dụng",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" fontWeight={600} color="primary">
            {formatNumber(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Còn lại:{" "}
            {formatNumber(
              params.row.totalAllocated - params.row.consumedUses
            ) || "N/A"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "renewalRequirementPercentage",
      headerName: "Tỉ lệ yêu cầu (%)",
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" fontWeight={600} color="primary">
            {formatNumber(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Đã đạt được:{" "}
            {formatNumber(
              (params.row.consumedUses / params.row.totalAllocated) * 100
            )}
            %
          </Typography>
        </Box>
      ),
    },
    {
      field: "dateRange",
      headerName: "Thời gian",
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="body2" fontWeight={600}>
            Từ: {formatDate(params.row.startDate)}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            Đến: {formatDate(params.row.endDate)}
          </Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <StatusChip status={params.value} />
      ),
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 100,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => {
        const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(
          null
        );
        const [selectedCampaignId, setSelectedCampaignId] = React.useState<
          string | null
        >(null);

        const handleMenuClick = (
          event: React.MouseEvent<HTMLElement>,
          id: string
        ) => {
          setAnchorEl(event.currentTarget);
          setSelectedCampaignId(id);
          setSelectedCampaign(params.row);
        };

        const handleMenuClose = () => {
          setAnchorEl(null);
          setSelectedCampaignId(null);
        };

        return (
          <>
            <IconButton
              size="small"
              onClick={(e) => handleMenuClick(e, params.row.id)}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl) && selectedCampaignId === params.row.id}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  // Handle view details
                }}
              >
                <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                Xem chi tiết
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  // Handle edit
                }}
              >
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                Chỉnh sửa
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  // Handle delete
                }}
              >
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Xóa
              </MenuItem>
            </Menu>
          </>
        );
      },
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
              <CampaignIcon
                sx={{ color: theme.palette.primary.main, fontSize: 32 }}
              />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Quản lý Chiến dịch
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quản lý và theo dõi các chiến dịch marketing
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
              placeholder="Tìm kiếm chiến dịch..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />

            <FormControl size="small" sx={{ minWidth: 150, display: "none" }}>
              <InputLabel>Bộ lọc</InputLabel>
              <Select value="all" label="Bộ lọc">
                <MenuItem value="all">Tất cả</MenuItem>
              </Select>
            </FormControl>

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
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/admin/campaigns/new")}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: 2,
                  "&.Mui-disabled": {
                    backgroundColor: theme.palette.grey[300],
                    color: theme.palette.grey[500],
                  },
                }}
              >
                Tạo chiến dịch mới
              </Button>
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
              aria-label="campaign status tabs"
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  minHeight: 56,
                },
              }}
            >
              <Tab
                label={
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CampaignIcon />
                    <span>Tất cả</span>
                    <Badge
                      badgeContent={tabCounts.all}
                      color="primary"
                      max={99}
                      sx={{ paddingLeft: 1 }}
                    />
                  </Stack>
                }
                value="all"
              />
              {Object.entries(statusConfig).map(([status, config]) => (
                <Tab
                  key={status}
                  label={
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {config.icon}
                      <span>{config.label}</span>
                      <Badge
                        badgeContent={
                          tabCounts[status as keyof typeof tabCounts]
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
            {isLoading ? (
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
                  <CampaignIcon sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h6" gutterBottom>
                  {searchTerm
                    ? "Không tìm thấy kết quả phù hợp"
                    : "Chưa có chiến dịch nào"}
                </Typography>
                <Typography variant="body2">
                  {searchTerm
                    ? "Thử tìm kiếm với từ khóa khác"
                    : "Các chiến dịch mới sẽ xuất hiện ở đây"}
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
