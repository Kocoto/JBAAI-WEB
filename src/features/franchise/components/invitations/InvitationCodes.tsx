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
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UpdateIcon from "@mui/icons-material/Update";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";

import ErrorIcon from "@mui/icons-material/Error";
import { useTheme } from "@mui/material";
import { useFranchise } from "../../hooks/useFranchise";
import { useEffect, useMemo, useState } from "react";

export default function InvitationCodes() {
  const theme = useTheme();
  const {
    invitationCodes,
    fetchInvitationCodes,
    franchiseDetails,
    fetchFranchiseDetails,

    activeCode,
  } = useFranchise();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Effect chỉ để fetch dữ liệu
  useEffect(() => {
    fetchInvitationCodes();
    fetchFranchiseDetails();
  }, [fetchInvitationCodes, fetchFranchiseDetails]);

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

  const handleActiveCode = async () => {
    const result = await activeCode();
    if (result.success) {
      fetchInvitationCodes();
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
   * @param invitationCode - Dữ liệu mã mời
   * @param title - Tiêu đề của card
   * @param icon - Icon hiển thị
   * @param color - Màu chủ đạo
   */
  const InvitationCodeCard = ({ invitationCode, title, icon, color }: any) => (
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

            {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <VisibilityIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Lần cuối sử dụng:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {invitationCode?.statistics?.lastUsedDate
                  ? formatDate(invitationCode.statistics.lastUsedDate)
                  : "Chưa sử dụng"}
              </Typography>
            </Box> */}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
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
        </Box>
      </Fade>

      <Grow in timeout={800}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
          sx={{ justifyContent: "flex-end", mb: 2 }}
        >
          <Stack direction="row" spacing={1}>
            <Tooltip title="Làm mới">
              <IconButton onClick={fetchInvitationCodes}>
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
              onClick={handleActiveCode}
            >
              Kích hoạt mã mời
            </Button>
          </Stack>
        </Stack>
      </Grow>

      <Grow in={!invitationCodes.loading} timeout={800}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            // background: `linear-gradient(135deg, ${alpha(
            //   theme.palette.background.paper,
            //   0.8
            // )} 0%, ${alpha(theme.palette.background.default, 0.4)} 100%)`,
          }}
        >
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <InvitationCodeCard
                invitationCode={invitationCodes?.data[0]}
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
                invitationCode={invitationCodes?.data[1]}
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
    </Box>
  );
}
