// Material UI Core Components
import {
  alpha,
  Box,
  Card,
  CardContent,
  Fade,
  Grid,
  Grow,
  Paper,
  Stack,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Button,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormHelperText,
  CircularProgress,
} from "@mui/material";

// Material UI Icons
import {
  LocalActivity as LocalActivityIcon,
  ContentCopy as ContentCopyIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarTodayIcon,
  Update as UpdateIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Star as StarIcon,
  AllInclusive as AllInclusiveIcon,
  WorkspacePremium as PremiumIcon,
} from "@mui/icons-material";

// Custom Hooks
import { useFranchise } from "../../hooks/useFranchise";

// React Hooks
import { useEffect, useState } from "react";

// Định nghĩa các loại quota
const QUOTA_OPTIONS = [
  {
    value: "basic",
    label: "Basic",
    description: "100 lượt sử dụng",
    icon: <StarIcon />,
    color: "#2196f3",
    features: ["100 lượt sử dụng/tháng", "Hỗ trợ cơ bản", "Báo cáo hàng tháng"],
  },
  {
    value: "premium",
    label: "Premium",
    description: "500 lượt sử dụng",
    icon: <PremiumIcon />,
    color: "#ff9800",
    features: [
      "500 lượt sử dụng/tháng",
      "Hỗ trợ ưu tiên 24/7",
      "Báo cáo chi tiết hàng tuần",
      "Tùy chỉnh giao diện",
    ],
  },
  {
    value: "enterprise",
    label: "Enterprise",
    description: "Không giới hạn",
    icon: <AllInclusiveIcon />,
    color: "#4caf50",
    features: [
      "Không giới hạn sử dụng",
      "Hỗ trợ chuyên biệt",
      "API tích hợp",
      "Báo cáo tùy chỉnh",
      "Quản lý đa chi nhánh",
    ],
  },
];

/**
 * Component quản lý và hiển thị thông tin mã mời
 * Bao gồm chức năng xem, sao chép và kích hoạt mã mời
 */
export default function InvitationCodes() {
  const theme = useTheme();
  const { invitationCodes, fetchInvitationCodes } = useFranchise();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);

  // State quản lý dialog kích hoạt mã
  const [activationDialog, setActivationDialog] = useState({
    open: false,
    codeId: null as string | null,
    codeType: null as string | null,
    code: null as string | null,
  });
  const [selectedQuota, setSelectedQuota] = useState("");

  /**
   * Xử lý mở dialog kích hoạt mã mời
   * @param codeId - ID của mã mời
   * @param codeType - Loại mã mời
   * @param code - Mã mời
   */
  const handleActivateCode = (
    codeId: string,
    codeType: string,
    code: string
  ) => {
    setActivationDialog({ open: true, codeId, codeType, code });
    setActivationError(null);
  };

  /**
   * Xử lý xác nhận kích hoạt mã mời
   */
  const handleConfirmActivation = async () => {
    try {
      setIsActivating(true);
      setActivationError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // API call để kích hoạt mã với quota đã chọn
      // await activateInvitationCode(activationDialog.codeId, selectedQuota);
      console.log(
        "Kích hoạt mã:",
        activationDialog.codeId,
        "với quota:",
        selectedQuota
      );

      // Reset dialog state
      setActivationDialog({
        open: false,
        codeId: null,
        codeType: null,
        code: null,
      });
      setSelectedQuota("");
      setIsActivating(false);

      // Refresh data
      fetchInvitationCodes();
    } catch (error) {
      console.error("Lỗi kích hoạt mã:", error);
      setActivationError("Có lỗi xảy ra khi kích hoạt mã. Vui lòng thử lại.");
      setIsActivating(false);
    }
  };

  /**
   * Xử lý đóng dialog kích hoạt
   */
  const handleCloseActivationDialog = () => {
    if (!isActivating) {
      setActivationDialog({
        open: false,
        codeId: null,
        codeType: null,
        code: null,
      });
      setSelectedQuota("");
      setActivationError(null);
    }
  };

  useEffect(() => {
    fetchInvitationCodes();
  }, [fetchInvitationCodes]);

  /**
   * Hàm sao chép mã mời vào clipboard
   * @param code - Mã mời cần sao chép
   */
  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Không thể sao chép mã:", err);
    }
  };

  /**
   * Hàm định dạng ngày tháng
   * @param dateString - Chuỗi ngày tháng
   * @returns Ngày tháng đã định dạng
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * Component hiển thị thông tin chi tiết của mã mời
   * @param props - Props của component
   * @param props.invitationCode - Dữ liệu mã mời
   * @param props.title - Tiêu đề của card
   * @param props.icon - Icon hiển thị
   * @param props.color - Màu chủ đạo
   */
  const InvitationCodeCard = ({
    invitationCode,
    title,
    icon,
    color,
  }: {
    invitationCode: any;
    title: string;
    icon: React.ReactNode;
    color: string;
  }) => (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        flexGrow: 1,
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(
          color,
          0.02
        )} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 25px ${alpha(color, 0.15)}`,
          border: `1px solid ${alpha(color, 0.3)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header với icon và tiêu đề */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(color, 0.1),
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: color }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {invitationCode?.codeType === "USER_TRIAL"
                ? "Dùng thử miễn phí"
                : "Tham gia hệ thống"}
            </Typography>
          </Box>
        </Stack>

        {/* Mã mời với nút sao chép */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(color, 0.08),
            border: `1px solid ${alpha(color, 0.2)}`,
            mb: 3,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 700,
                fontFamily: "monospace",
                color: color,
                flex: 1,
              }}
            >
              {invitationCode?.code || "N/A"}
            </Typography>
            <Tooltip
              title={
                copiedCode === invitationCode?.code
                  ? "Đã sao chép!"
                  : "Sao chép mã"
              }
            >
              <IconButton
                onClick={() => handleCopyCode(invitationCode?.code)}
                sx={{
                  color:
                    copiedCode === invitationCode?.code
                      ? "success.main"
                      : color,
                  "&:hover": {
                    bgcolor: alpha(color, 0.1),
                  },
                }}
              >
                {copiedCode === invitationCode?.code ? (
                  <CheckCircleIcon />
                ) : (
                  <ContentCopyIcon />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Trạng thái */}
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={
              invitationCode?.status === "active" ? (
                <CheckCircleIcon />
              ) : (
                <ErrorIcon />
              )
            }
            label={
              invitationCode?.status === "active"
                ? "Hoạt động"
                : "Không hoạt động"
            }
            color={invitationCode?.status === "active" ? "success" : "error"}
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* Nút kích hoạt mã mời - chỉ hiển thị khi mã chưa được kích hoạt */}
        {invitationCode?.status !== "active" && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() =>
                handleActivateCode(
                  invitationCode?.id,
                  invitationCode?.codeType,
                  invitationCode?.code
                )
              }
              sx={{
                background: `linear-gradient(135deg, ${color} 0%, ${alpha(
                  color,
                  0.8
                )} 100%)`,
                color: "white",
                fontWeight: 600,
                borderRadius: 2,
                textTransform: "none",
                "&:hover": {
                  background: `linear-gradient(135deg, ${alpha(
                    color,
                    0.9
                  )} 0%, ${alpha(color, 0.7)} 100%)`,
                },
              }}
            >
              Kích hoạt mã mời
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Thống kê sử dụng */}
        <Stack spacing={2}>
          <Typography variant="subtitle2" fontWeight={600} color={color}>
            📊 Thống kê sử dụng
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                }}
              >
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {invitationCode?.statistics?.actualUsageCount || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Lần sử dụng
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                }}
              >
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {invitationCode?.statistics?.totalCumulativeUses || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tổng tích lũy
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Thông tin chi tiết */}
          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayIcon
                sx={{ fontSize: 16, color: "text.secondary" }}
              />
              <Typography variant="body2" color="text.secondary">
                Ngày tạo:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {invitationCode?.createdAt
                  ? formatDate(invitationCode.createdAt)
                  : "N/A"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <UpdateIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Cập nhật:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {invitationCode?.updatedAt
                  ? formatDate(invitationCode.updatedAt)
                  : "N/A"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <VisibilityIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Lần cuối sử dụng:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {invitationCode?.statistics?.lastUsedDate
                  ? formatDate(invitationCode.statistics.lastUsedDate)
                  : "Chưa sử dụng"}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  // Lấy quota option đã chọn
  const selectedQuotaOption = QUOTA_OPTIONS.find(
    (opt) => opt.value === selectedQuota
  );

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header Section */}
      <Fade in timeout={600}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.primary.main,
                  0.1
                )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                display: "flex",
                alignItems: "center",
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <LocalActivityIcon
                sx={{ color: theme.palette.primary.main, fontSize: 36 }}
              />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                Quản lý Mã Mời
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Quản lý và theo dõi các mã mời của hệ thống
              </Typography>
            </Box>
          </Stack>

          {/* Action Bar */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() =>
                setActivationDialog({
                  open: true,
                  codeId: null,
                  codeType: null,
                  code: null,
                })
              }
              sx={{ textTransform: "none" }}
            >
              Quản lý kích hoạt mã
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => fetchInvitationCodes()}
              sx={{ textTransform: "none" }}
            >
              Làm mới
            </Button>
          </Stack>
        </Box>
      </Fade>

      {/* Main Content */}
      <Grow in={!invitationCodes.loading} timeout={800}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <InvitationCodeCard
                invitationCode={invitationCodes?.data?.[0]}
                title="Mã Mời Dùng Thử"
                icon={
                  <PersonIcon
                    sx={{ color: theme.palette.info.main, fontSize: 28 }}
                  />
                }
                color={theme.palette.info.main}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InvitationCodeCard
                invitationCode={invitationCodes?.data?.[1]}
                title="Mã Mời Franchise"
                icon={
                  <BusinessIcon
                    sx={{ color: theme.palette.success.main, fontSize: 28 }}
                  />
                }
                color={theme.palette.success.main}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grow>

      {/* Dialog kích hoạt mã mời - Đã tối ưu */}
      <Dialog
        open={activationDialog.open}
        onClose={handleCloseActivationDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundImage: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.02
            )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <PlayArrowIcon sx={{ color: theme.palette.primary.main }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Kích hoạt mã mời
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chọn gói phù hợp với nhu cầu của bạn
                </Typography>
              </Box>
            </Stack>
            <IconButton
              onClick={handleCloseActivationDialog}
              disabled={isActivating}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          {/* Hiển thị mã đang kích hoạt */}
          {activationDialog.code && (
            <Alert
              severity="info"
              icon={<InfoIcon />}
              sx={{
                mb: 3,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <Typography variant="body2">
                Mã kích hoạt:{" "}
                <strong style={{ fontFamily: "monospace" }}>
                  {activationDialog.code}
                </strong>
              </Typography>
            </Alert>
          )}

          {/* Progress bar khi đang xử lý */}
          {isActivating && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, textAlign: "center" }}
              >
                Đang xử lý kích hoạt...
              </Typography>
            </Box>
          )}

          {/* Error message */}
          {activationError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {activationError}
            </Alert>
          )}

          <Stack spacing={3}>
            {/* Quota Selection */}
            <FormControl fullWidth variant="outlined">
              <InputLabel>Chọn gói dịch vụ</InputLabel>
              <Select
                value={selectedQuota}
                onChange={(e) => setSelectedQuota(e.target.value)}
                label="Chọn gói dịch vụ"
                disabled={isActivating}
              >
                {QUOTA_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{ width: "100%" }}
                    >
                      <Box sx={{ color: option.color }}>{option.icon}</Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {option.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Mỗi gói có các tính năng và giới hạn khác nhau
              </FormHelperText>
            </FormControl>

            {/* Hiển thị chi tiết gói đã chọn */}
            {selectedQuotaOption && (
              <Fade in={true}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `2px solid ${selectedQuotaOption.color}`,
                    background: alpha(selectedQuotaOption.color, 0.05),
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: alpha(selectedQuotaOption.color, 0.2),
                          color: selectedQuotaOption.color,
                        }}
                      >
                        {selectedQuotaOption.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          Gói {selectedQuotaOption.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedQuotaOption.description}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider />

                    <Box>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        sx={{ mb: 1 }}
                      >
                        Tính năng nổi bật:
                      </Typography>
                      <List dense sx={{ py: 0 }}>
                        {selectedQuotaOption.features.map((feature, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircleIcon
                                sx={{
                                  fontSize: 18,
                                  color: selectedQuotaOption.color,
                                }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={feature}
                              primaryTypographyProps={{
                                variant: "body2",
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Stack>
                </Paper>
              </Fade>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleCloseActivationDialog}
            disabled={isActivating}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmActivation}
            disabled={!selectedQuota || isActivating}
            startIcon={
              isActivating ? (
                <CircularProgress size={20} />
              ) : (
                <CheckCircleIcon />
              )
            }
            sx={{
              borderRadius: 2,
              minWidth: 120,
              background: selectedQuota
                ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                : undefined,
              "&:hover": {
                background: selectedQuota
                  ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                  : undefined,
              },
            }}
          >
            {isActivating ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
