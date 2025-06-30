// FranchiseInvitationCodes.tsx

import React, { useState, useMemo, useCallback, useEffect } from "react";
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
  FormControl,
  Select,
  SelectChangeEvent,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  LocalActivity as LocalActivityIcon,
  CardGiftcard as CardGiftcardIcon,
  ContentCopy as ContentCopyIcon,
  QrCode2 as QrCodeIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
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
import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";
import { useFranchise } from "@/features/franchise/hooks/useFranchise";
import { InvitationCode } from "@/features/franchise/types/franchise.type";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Tab configuration
interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactElement;
  count?: number;
}

// Custom toolbar component
function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

// Generate invitation dialog component
interface GenerateInvitationDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (campaignId: string) => void;
  campaigns: Array<{ id: string; name: string }>;
}

function GenerateInvitationDialog({
  open,
  onClose,
  onGenerate,
  campaigns,
}: GenerateInvitationDialogProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState("");

  const handleGenerate = () => {
    if (selectedCampaignId) {
      onGenerate(selectedCampaignId);
      setSelectedCampaignId("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tạo mã mời mới</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Chọn chiến dịch để tạo mã mời dùng thử
          </Typography>
          <FormControl fullWidth>
            <Select
              value={selectedCampaignId}
              onChange={(e: SelectChangeEvent) =>
                setSelectedCampaignId(e.target.value)
              }
              displayEmpty
            >
              <MenuItem value="" disabled>
                Chọn chiến dịch
              </MenuItem>
              {campaigns.map((campaign) => (
                <MenuItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={!selectedCampaignId}
          startIcon={<CardGiftcardIcon />}
        >
          Tạo mã mời
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function FranchiseInvitationCodes() {
  const theme = useTheme();
  const {
    invitationCodes,
    fetchInvitationCodes,
    generateInvitationCode,
    quota,
    fetchQuota,
  } = useFranchise();

  // State
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCode, setSelectedCode] = useState<InvitationCode | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // Mock campaigns data - replace with actual data from API
  const campaigns = useMemo(
    () =>
      quota.data?.quotaByLedger.map((ledger) => ({
        id: ledger.campaignId,
        name: ledger.campaignName,
      })) || [],
    [quota.data]
  );

  // Load initial data
  useEffect(() => {
    fetchInvitationCodes();
    fetchQuota();
  }, [fetchInvitationCodes, fetchQuota]);

  // Tab configurations
  const tabConfigs: TabConfig[] = useMemo(() => {
    const codes = invitationCodes.data || [];
    return [
      {
        id: "all",
        label: "Tất cả",
        icon: <LocalActivityIcon />,
        count: codes.length,
      },
      {
        id: "active",
        label: "Còn hiệu lực",
        icon: <CheckCircleIcon />,
        count: codes.filter((c) => c.status === "active").length,
      },
      {
        id: "used",
        label: "Đã sử dụng",
        icon: <CancelIcon />,
        count: codes.filter((c) => c.status === "used").length,
      },
      {
        id: "expired",
        label: "Hết hạn",
        icon: <ScheduleIcon />,
        count: codes.filter((c) => c.status === "expired").length,
      },
    ];
  }, [invitationCodes.data]);

  // Filter data based on tab and search
  const filteredData = useMemo(() => {
    let filtered = invitationCodes.data || [];

    // Filter by tab
    if (selectedTab !== "all") {
      filtered = filtered.filter((code) => code.status === selectedTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((code) =>
        code.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [invitationCodes.data, selectedTab, searchTerm]);

  // Handle copy code
  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setSnackbar({
      open: true,
      message: "Đã sao chép mã mời!",
      severity: "success",
    });
  }, []);

  // Handle generate invitation
  const handleGenerateInvitation = useCallback(
    async (campaignId: string) => {
      const result = await generateInvitationCode(campaignId);
      if (result.success) {
        setSnackbar({
          open: true,
          message: "Tạo mã mời thành công!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: result.error?.message || "Có lỗi xảy ra khi tạo mã mời",
          severity: "error",
        });
      }
    },
    [generateInvitationCode]
  );

  // Handle menu actions
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    code: InvitationCode
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedCode(code);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCode(null);
  };

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "Mã mời",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              px: 2,
              py: 0.5,
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {params.value}
          </Box>
          <Tooltip title="Sao chép mã">
            <IconButton
              size="small"
              onClick={() => handleCopyCode(params.value)}
              sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const statusConfig = {
          active: {
            label: "Còn hiệu lực",
            color: "success" as const,
            icon: <CheckCircleIcon fontSize="small" />,
          },
          used: {
            label: "Đã sử dụng",
            color: "default" as const,
            icon: <CancelIcon fontSize="small" />,
          },
          expired: {
            label: "Hết hạn",
            color: "error" as const,
            icon: <ScheduleIcon fontSize="small" />,
          },
        };

        const config = statusConfig[params.value as keyof typeof statusConfig];
        return (
          <Chip
            label={config.label}
            size="small"
            color={config.color}
            variant="outlined"
            icon={config.icon}
          />
        );
      },
    },
    {
      field: "campaignId",
      headerName: "Chiến dịch",
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => {
        const campaign = campaigns.find((c) => c.id === params.value);
        return (
          <Typography variant="body2">{campaign?.name || "N/A"}</Typography>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Ngày tạo",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">
          {format(new Date(params.value), "dd/MM/yyyy", { locale: vi })}
        </Typography>
      ),
    },
    {
      field: "usedAt",
      headerName: "Ngày sử dụng",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">
          {params.value
            ? format(new Date(params.value), "dd/MM/yyyy", { locale: vi })
            : "-"}
        </Typography>
      ),
    },
    {
      field: "expiresAt",
      headerName: "Ngày hết hạn",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">
          {params.value
            ? format(new Date(params.value), "dd/MM/yyyy", { locale: vi })
            : "Không giới hạn"}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, params.row as InvitationCode)}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl) && selectedCode?._id === params.row._id}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem
              onClick={() => {
                handleCopyCode(params.row.code);
                handleMenuClose();
              }}
            >
              <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
              Sao chép mã
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <QrCodeIcon fontSize="small" sx={{ mr: 1 }} />
              Tạo QR Code
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ShareIcon fontSize="small" sx={{ mr: 1 }} />
              Chia sẻ
            </MenuItem>
          </Menu>
        </>
      ),
    },
  ];

  // Transform data for DataGrid
  const rows = useMemo(() => {
    return filteredData.map((code) => ({
      id: code._id,
      ...code,
    }));
  }, [filteredData]);

  return (
    <BaseDashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Quản lý Mã mời
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý và theo dõi các mã mời dùng thử
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          {[
            {
              label: "Tổng mã mời",
              value: invitationCodes.data?.length || 0,
              icon: <LocalActivityIcon />,
              color: theme.palette.primary.main,
            },
            {
              label: "Còn hiệu lực",
              value:
                invitationCodes.data?.filter((c) => c.status === "active")
                  .length || 0,
              icon: <CheckCircleIcon />,
              color: theme.palette.success.main,
            },
            {
              label: "Đã sử dụng",
              value:
                invitationCodes.data?.filter((c) => c.status === "used")
                  .length || 0,
              icon: <CancelIcon />,
              color: theme.palette.info.main,
            },
            {
              label: "Hết hạn",
              value:
                invitationCodes.data?.filter((c) => c.status === "expired")
                  .length || 0,
              icon: <ScheduleIcon />,
              color: theme.palette.error.main,
            },
          ].map((stat, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                flex: 1,
                p: 3,
                bgcolor: alpha(stat.color, 0.08),
                border: `1px solid ${alpha(stat.color, 0.2)}`,
                borderRadius: 2,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: alpha(stat.color, 0.2),
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {stat.value}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>

        {/* Main Content */}
        <Grow in={true} timeout={500}>
          <Paper elevation={3} sx={{ overflow: "hidden" }}>
            {/* Toolbar */}
            <Box
              sx={{
                p: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
              >
                {/* Search */}
                <TextField
                  size="small"
                  placeholder="Tìm kiếm mã mời..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ minWidth: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Actions */}
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowGenerateDialog(true)}
                    disabled={!campaigns.length}
                  >
                    Tạo mã mời
                  </Button>
                  <Tooltip title="Làm mới">
                    <IconButton onClick={() => fetchInvitationCodes()}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xuất Excel">
                    <IconButton>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={selectedTab}
                onChange={(_, value) => setSelectedTab(value)}
                sx={{ px: 2 }}
              >
                {tabConfigs.map((tab) => (
                  <Tab
                    key={tab.id}
                    value={tab.id}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        {tab.icon}
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                          <Chip
                            label={tab.count}
                            size="small"
                            sx={{
                              height: 20,
                              minWidth: 20,
                              fontSize: "0.75rem",
                            }}
                          />
                        )}
                      </Stack>
                    }
                  />
                ))}
              </Tabs>
            </Box>

            {/* Data Grid */}
            <Box sx={{ height: 600 }}>
              {invitationCodes.loading ? (
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
                    <LocalActivityIcon sx={{ fontSize: 48 }} />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {searchTerm
                      ? "Không tìm thấy mã mời phù hợp"
                      : selectedTab === "all"
                      ? "Chưa có mã mời nào"
                      : `Không có mã mời ${tabConfigs
                          .find((t) => t.id === selectedTab)
                          ?.label.toLowerCase()}`}
                  </Typography>
                  <Typography variant="body2">
                    {searchTerm
                      ? "Thử tìm kiếm với từ khóa khác"
                      : "Tạo mã mời mới để bắt đầu"}
                  </Typography>
                  {!searchTerm &&
                    selectedTab === "all" &&
                    campaigns.length > 0 && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{ mt: 2 }}
                        onClick={() => setShowGenerateDialog(true)}
                      >
                        Tạo mã mời đầu tiên
                      </Button>
                    )}
                </Box>
              ) : (
                <DataGrid
                  rows={rows}
                  columns={columns}
                  loading={invitationCodes.loading}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 20 } },
                  }}
                  pageSizeOptions={[10, 20, 50]}
                  checkboxSelection
                  disableRowSelectionOnClick
                  slots={{
                    toolbar: CustomToolbar,
                  }}
                  localeText={
                    viVN.components.MuiDataGrid.defaultProps.localeText
                  }
                  sx={{
                    border: "none",
                    "& .MuiDataGrid-cell": {
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.5
                      )}`,
                    },
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      borderBottom: `2px solid ${theme.palette.divider}`,
                    },
                    "& .MuiDataGrid-row": {
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.04
                        ),
                      },
                    },
                  }}
                />
              )}
            </Box>
          </Paper>
        </Grow>

        {/* Generate Invitation Dialog */}
        <GenerateInvitationDialog
          open={showGenerateDialog}
          onClose={() => setShowGenerateDialog(false)}
          onGenerate={handleGenerateInvitation}
          campaigns={campaigns}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </BaseDashboardLayout>
  );
}
