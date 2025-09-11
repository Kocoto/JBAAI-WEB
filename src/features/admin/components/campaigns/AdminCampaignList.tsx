// src/features/admin/components/campaigns/AdminCampaignList.tsx
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
} from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useAdminCampaign } from "@/features/admin/hooks/useAdminCampaign";
import CampaignDataGrid from "./CampaignDataGrid";
import {
  CAMPAIGN_STATUS,
  CampaignStatus,
} from "@/features/admin/types/campaign.types";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import CampaignIcon from "@mui/icons-material/Campaign";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTranslation } from "react-i18next";

// status UI config (màu & icon)
const statusUI = {
  [CAMPAIGN_STATUS.ACTIVE]: {
    color: "success" as const,
    icon: <CheckCircleIcon />,
    bgColor: "#e8f5e9",
    textColor: "#388e3c",
  },
  [CAMPAIGN_STATUS.INACTIVE]: {
    color: "warning" as const,
    icon: <PauseCircleIcon />,
    bgColor: "#fff8e1",
    textColor: "#f57c00",
  },
  [CAMPAIGN_STATUS.EXPIRED]: {
    color: "error" as const,
    icon: <CancelIcon />,
    bgColor: "#ffebee",
    textColor: "#d32f2f",
  },
};

function StatusChip({
  status,
  label,
}: {
  status: CampaignStatus;
  label: string;
}) {
  const cfg = statusUI[status as keyof typeof statusUI];
  return (
    <Chip
      size="small"
      label={label}
      icon={cfg.icon}
      sx={{
        bgcolor: cfg.bgColor,
        color: cfg.textColor,
        "& .MuiChip-icon": { color: cfg.textColor },
        fontWeight: 600,
        borderRadius: "8px",
      }}
    />
  );
}

export default function AdminCampaignList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith("vi") ? "vi-VN" : "en-US";

  const {
    campaignList,
    fetchCampaignList,
    isLoading,
    searchCampaigns,
    filterByStatus,
    clearFilters,
  } = useAdminCampaign();

  const [selectedTab, setSelectedTab] = React.useState<CampaignStatus | "all">(
    "all"
  );
  const [searchTerm, setSearchTerm] = React.useState("");
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [selectedCampaign, setSelectedCampaign] = React.useState<any>(null);

  const getStatusLabel = (s: CampaignStatus) => {
    if (s === CAMPAIGN_STATUS.ACTIVE)
      return t("adminCampaignList.status.active");
    if (s === CAMPAIGN_STATUS.INACTIVE)
      return t("adminCampaignList.status.inactive");
    return t("adminCampaignList.status.expired");
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const formatNumber = (num: number) =>
    new Intl.NumberFormat(locale).format(num ?? 0);

  // Tabs change
  const handleTabChange = async (
    _e: React.SyntheticEvent,
    newValue: CampaignStatus | "all"
  ) => {
    setSelectedTab(newValue);
    if (newValue === "all") await clearFilters();
    else await filterByStatus(newValue);
  };

  // Search
  const handleSearch = React.useCallback(
    async (value: string) => {
      setSearchTerm(value);
      if (value.trim()) await searchCampaigns(value);
      else await fetchCampaignList();
    },
    [searchCampaigns, fetchCampaignList]
  );

  // Refresh
  const handleRefresh = async () => {
    setSearchTerm("");
    setSelectedTab("all");
    await clearFilters();
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
          {params.row.franchiseOwnerId?.franchiseName?.charAt(0)?.toUpperCase()}
        </Avatar>
      ),
    },
    {
      field: "campaignName",
      headerName: t("adminCampaignList.columns.campaignName"),
      flex: 0.6,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("adminCampaignList.common.id")}: {params.row.id.substring(0, 8)}
            ...
          </Typography>
        </Box>
      ),
    },
    {
      field: "franchiseOwner",
      headerName: t("adminCampaignList.columns.franchise"),
      width: 200,
      flex: 0.6,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2">
            {params.row.franchiseOwnerId?.franchiseName || "N/A"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("adminCampaignList.franchise.level", {
              level: params.row.franchiseOwnerId?.franchiseLevel || 0,
            })}
          </Typography>
        </Box>
      ),
    },
    {
      field: "totalAllocated",
      headerName: t("adminCampaignList.columns.totalAllocated"),
      width: 170,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" fontWeight={600} color="primary">
            {formatNumber(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("adminCampaignList.stats.remaining")}:{" "}
            {formatNumber(
              (params.row.totalAllocated ?? 0) - (params.row.consumedUses ?? 0)
            )}
          </Typography>
        </Box>
      ),
    },
    {
      field: "renewalRequirementPercentage",
      headerName: t("adminCampaignList.columns.requiredRate"),
      width: 180,
      renderCell: (params: GridRenderCellParams) => {
        const achieved =
          ((params.row.consumedUses ?? 0) /
            Math.max(params.row.totalAllocated ?? 1, 1)) *
          100;
        return (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" fontWeight={600} color="primary">
              {formatNumber(params.value)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("adminCampaignList.stats.achieved")}: {formatNumber(achieved)}%
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "dateRange",
      headerName: t("adminCampaignList.columns.period"),
      width: 220,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="body2" fontWeight={600}>
            {t("adminCampaignList.common.from")}:{" "}
            {formatDate(params.row.startDate)}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {t("adminCampaignList.common.to")}: {formatDate(params.row.endDate)}
          </Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: t("adminCampaignList.columns.status"),
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <StatusChip
          status={params.value}
          label={getStatusLabel(params.value)}
        />
      ),
    },
    {
      field: "actions",
      headerName: t("adminCampaignList.columns.actions"),
      width: 110,
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
                  // view details
                }}
              >
                <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                {t("adminCampaignList.menu.viewDetail")}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  // edit
                }}
              >
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                {t("adminCampaignList.menu.edit")}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  // delete
                }}
              >
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                {t("adminCampaignList.menu.delete")}
              </MenuItem>
            </Menu>
          </>
        );
      },
    },
  ];

  const filteredData =
    selectedTab === "all"
      ? campaignList
      : campaignList.filter((c) => c.status === selectedTab);

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
      {/* Header */}
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
                {t("adminCampaignList.header.title")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("adminCampaignList.header.subtitle")}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Fade>

      {/* Filters & Actions */}
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
              placeholder={t("adminCampaignList.filters.searchPlaceholder")}
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
              <InputLabel>
                {t("adminCampaignList.filters.filterLabel")}
              </InputLabel>
              <Select
                value="all"
                label={t("adminCampaignList.filters.filterLabel")}
              >
                <MenuItem value="all">
                  {t("adminCampaignList.common.all")}
                </MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ flexGrow: 1 }} />

            <Stack direction="row" spacing={1}>
              <Tooltip title={t("adminCampaignList.actions.refresh")}>
                <IconButton onClick={handleRefresh} disabled={isLoading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={t("adminCampaignList.actions.export")}
                sx={{ display: "none" }}
              >
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
                {t("adminCampaignList.actions.create")}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Grow>

      {/* Main */}
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
                    <span>{t("adminCampaignList.tabs.all")}</span>
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
              {[
                CAMPAIGN_STATUS.ACTIVE,
                CAMPAIGN_STATUS.INACTIVE,
                CAMPAIGN_STATUS.EXPIRED,
              ].map((status) => {
                const cfg = statusUI[status];
                return (
                  <Tab
                    key={status}
                    value={status}
                    label={
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        {cfg.icon}
                        <span>{getStatusLabel(status)}</span>
                        <Badge
                          badgeContent={
                            tabCounts[status as keyof typeof tabCounts]
                          }
                          color={cfg.color}
                          max={99}
                          sx={{ paddingLeft: 1 }}
                        />
                      </Stack>
                    }
                  />
                );
              })}
            </Tabs>
          </Box>

          <Box p={3}>
            {isLoading ? (
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
              <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
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
                    ? t("adminCampaignList.empty.noResultsTitle")
                    : t("adminCampaignList.empty.noItems")}
                </Typography>
                <Typography variant="body2">
                  {searchTerm
                    ? t("adminCampaignList.empty.noResultsHint")
                    : t("adminCampaignList.empty.placeholderHint")}
                </Typography>
              </Box>
            ) : (
              <CampaignDataGrid
                rows={filteredData.map((item) => ({ ...item, id: item._id }))}
                columns={columns}
                loading={isLoading}
              />
            )}
          </Box>
        </Paper>
      </Grow>

      {/* Create Campaign Dialog (placeholder) */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t("adminCampaignList.dialog.createTitle")}</DialogTitle>
        <DialogContent>
          <Typography>{t("adminCampaignList.dialog.placeholder")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>
            {t("adminCampaignList.dialog.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={() => setShowCreateDialog(false)}
          >
            {t("adminCampaignList.dialog.create")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
