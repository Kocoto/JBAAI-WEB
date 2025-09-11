// src/features/admin/components/requests/AdminRequestList.tsx

// Core React import
import React from "react";

// i18n
import { useTranslation } from "react-i18next";

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
} from "@mui/material";

// Material UI Data Grid
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

// Custom Hooks & Components
import {
  RequestStatus,
  useAdminRequest,
} from "@/features/admin/hooks/useAdminRequest";
import RequestDataGrid from "./RequestDataGrid";

// Material UI Icons
import SearchIcon from "@mui/icons-material/Search";
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

// Status visual config (màu & icon)
const statusVisual = {
  pending: {
    color: "warning" as const,
    icon: <PendingIcon />,
    bgColor: "#fff8e1",
    textColor: "#f57c00",
  },
  reviewing: {
    color: "info" as const,
    icon: <RateReviewIcon />,
    bgColor: "#e3f2fd",
    textColor: "#1976d2",
  },
  approved: {
    color: "success" as const,
    icon: <CheckCircleIcon />,
    bgColor: "#e8f5e9",
    textColor: "#388e3c",
  },
  rejected: {
    color: "error" as const,
    icon: <CancelIcon />,
    bgColor: "#ffebee",
    textColor: "#d32f2f",
  },
};

// Status chip đọc label từ i18n
const StatusChip: React.FC<{ status: RequestStatus }> = ({ status }) => {
  const { t } = useTranslation();
  const visual = statusVisual[status];
  return (
    <Chip
      size="small"
      label={t(`adminRequests.status.${status}`)}
      icon={visual.icon}
      sx={{
        bgcolor: visual.bgColor,
        color: visual.textColor,
        "& .MuiChip-icon": { color: visual.textColor },
        fontWeight: 600,
        borderRadius: "8px",
      }}
    />
  );
};

export default function AdminRequestList() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith("vi") ? "vi-VN" : "en-US";

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
    _event: React.SyntheticEvent,
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
      headerName: t("adminRequests.columns.fullname"),
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("adminRequests.columns.id")}: {params.row.id.slice(0, 8)}...
          </Typography>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: t("adminRequests.columns.email"),
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
      headerName: t("adminRequests.columns.phone"),
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
      headerName: t("adminRequests.columns.requestedRole"),
      flex: 0.8,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={
            params.value === "franchise"
              ? t("adminRequests.roles.franchise")
              : t("adminRequests.roles.user")
          }
          size="small"
          variant="outlined"
          color={params.value === "franchise" ? "primary" : "default"}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: t("adminRequests.columns.createdAt"),
      flex: 0.8,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(params.value).toLocaleDateString(locale)}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: t("adminRequests.columns.actions"),
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        if (selectedTab === "pending") {
          return (
            <Tooltip title={t("adminRequests.tooltips.acceptRequest")}>
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
                {t("adminRequests.buttons.accept")}
              </Button>
            </Tooltip>
          );
        }
        if (selectedTab === "reviewing") {
          return (
            <Stack direction="row" spacing={1}>
              <Tooltip title={t("adminRequests.tooltips.approve")}>
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
                  {t("adminRequests.buttons.approve")}
                </Button>
              </Tooltip>
              <Tooltip title={t("adminRequests.tooltips.reject")}>
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
      title: t("adminRequests.tabs.pending.title"),
      state: pendingRequests,
      emptyMessage: t("adminRequests.empty.pending"),
    },
    reviewing: {
      title: t("adminRequests.tabs.reviewing.title"),
      state: reviewingRequests,
      emptyMessage: t("adminRequests.empty.reviewing"),
    },
    approved: {
      title: t("adminRequests.tabs.approved.title"),
      state: approvedRequests,
      emptyMessage: t("adminRequests.empty.approved"),
    },
    rejected: {
      title: t("adminRequests.tabs.rejected.title"),
      state: rejectedRequests,
      emptyMessage: t("adminRequests.empty.rejected"),
    },
  } as const;

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
                {t("adminRequests.header.title")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("adminRequests.header.subtitle")}
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
              placeholder={t("adminRequests.filters.searchPlaceholder")}
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
              <InputLabel>
                {t("adminRequests.filters.roleFilterLabel")}
              </InputLabel>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                label={t("adminRequests.filters.roleFilterLabel")}
              >
                <MenuItem value="all">
                  {t("adminRequests.filters.roles.all")}
                </MenuItem>
                <MenuItem value="user">
                  {t("adminRequests.roles.user")}
                </MenuItem>
                <MenuItem value="franchise">
                  {t("adminRequests.roles.franchise")}
                </MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ flexGrow: 1 }} />

            <Stack direction="row" spacing={1}>
              <Tooltip title={t("adminRequests.actions.refresh")}>
                <IconButton onClick={handleRefresh} disabled={isLoadingAny}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={t("adminRequests.actions.export")}
                sx={{ display: "none" }}
              >
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
              {(
                [
                  "pending",
                  "reviewing",
                  "approved",
                  "rejected",
                ] as RequestStatus[]
              ).map((status) => {
                const visual = statusVisual[status];
                return (
                  <Tab
                    key={status}
                    label={
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        {visual.icon}
                        <span>{t(`adminRequests.status.${status}`)}</span>
                        <Badge
                          badgeContent={
                            (
                              {
                                pending: pendingRequests.total,
                                reviewing: reviewingRequests.total,
                                approved: approvedRequests.total,
                                rejected: rejectedRequests.total,
                              } as Record<RequestStatus, number>
                            )[status]
                          }
                          color={visual.color}
                          max={99}
                          sx={{ paddingLeft: 1 }}
                        />
                      </Stack>
                    }
                    value={status}
                  />
                );
              })}
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
                  {statusVisual[selectedTab].icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {searchTerm
                    ? t("adminRequests.empty.noResultsTitle")
                    : currentContent.emptyMessage}
                </Typography>
                <Typography variant="body2">
                  {searchTerm
                    ? t("adminRequests.empty.noResultsHint")
                    : t("adminRequests.empty.placeholderHint")}
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
