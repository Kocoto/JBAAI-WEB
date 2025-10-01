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
} from "@mui/material";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UpdateIcon from "@mui/icons-material/Update";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import ErrorIcon from "@mui/icons-material/Error";
import { useTheme } from "@mui/material";
import { useFranchise } from "../../hooks/useFranchise";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

/* ====== Flags / constants ====== */

// Bật nút "Kích hoạt" trong component này hay không.
// Mặc định false theo yêu cầu "API chỉ gọi cho 1/3 tháng".
const ENABLE_ACTIVATE_BUTTON = false;

// CodeType chuẩn backend cung cấp cho mã chuẩn 1/3 tháng
const STANDARD_TYPES: Record<1 | 3, string> = {
  1: "USER_TRIAL_STANDARD_ONE_MONTH",
  3: "USER_TRIAL_STANDARD_THREE_MONTHS",
};

const CARD_MIN_HEIGHT = 420;

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

/* ====== Component ====== */
export default function InvitationCodes() {
  const theme = useTheme();
  const { t } = useTranslation();

  // lấy state & action từ hook
  const {
    invitationCodes,
    fetchInvitationCodes,
    activeCode, // vẫn lấy từ hook để có thể bật lại nút Kích hoạt khi cần
  } = useFranchise();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Hàng 2 chỉ hiện sau khi bấm nút
  const [show1m, setShow1m] = useState(false);
  const [show3m, setShow3m] = useState(false);
  const [creating1m, setCreating1m] = useState(false);
  const [creating3m, setCreating3m] = useState(false);
  const [activating, setActivating] = useState(false);

  const handleCopyCode = async (code?: string) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // Hai card hàng 1: chỉ hiển thị dữ liệu đã có (API kích hoạt có thể ở nơi khác)
  const userTrialCode = useMemo(
    () =>
      invitationCodes?.data?.find?.((c: any) => c?.codeType === "USER_TRIAL"),
    [invitationCodes?.data]
  );
  const franchiseJoinCode = useMemo(
    () =>
      invitationCodes?.data?.find?.((c: any) => c?.codeType === "JOIN_SYSTEM"),
    [invitationCodes?.data]
  );

  // Hai card hàng 2: chọn theo codeType chuẩn mới
  const oneMonthCode = useMemo(
    () =>
      invitationCodes?.data?.find?.(
        (c: any) => c?.codeType === STANDARD_TYPES[1]
      ),
    [invitationCodes?.data]
  );
  const threeMonthCode = useMemo(
    () =>
      invitationCodes?.data?.find?.(
        (c: any) => c?.codeType === STANDARD_TYPES[3]
      ),
    [invitationCodes?.data]
  );

  // Optional: kích hoạt từ đây (tắt mặc định)
  const handleActivateClick = async () => {
    if (!ENABLE_ACTIVATE_BUTTON) return;
    try {
      setActivating(true);
      const result = await activeCode();
      if (result?.success) {
        await fetchInvitationCodes();
      }
    } catch (e) {
      console.error("Activate code failed", e);
    } finally {
      setActivating(false);
    }
  };

  // Gọi API chỉ cho 1/3 tháng (backend tự sinh code)
  const createDurationCode = async (months: 1 | 3) => {
    const setCreating = months === 1 ? setCreating1m : setCreating3m;
    setCreating(true);
    try {
      const res = await fetch(`/api/v1/franchise/code/create-standard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeType: STANDARD_TYPES[months] }),
      });

      if (!res.ok) {
        const err = await res.text().catch(() => "");
        throw new Error(`Create failed: ${res.status} ${err}`);
      }

      // refresh list để hiển thị code mới
      await fetchInvitationCodes();
      months === 1 ? setShow1m(true) : setShow3m(true);
    } catch (e) {
      console.error("Create standard code failed", e);
    } finally {
      setCreating(false);
    }
  };

  // Card UI – equal height & fit khung
  const InvitationCodeCard = ({ invitationCode, title, icon, color }: any) => {
    const statusActive =
      (invitationCode?.status ?? "").toString().toLowerCase() === "active";

    return (
      <Card
        variant="outlined"
        sx={{
          width: "100%",
          height: "100%",
          minHeight: CARD_MIN_HEIGHT,
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${alpha(
            color,
            0.05
          )} 0%, ${alpha(color, 0.02)} 100%)`,
          border: `1px solid ${alpha(color, 0.2)}`,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: `0 8px 25px ${alpha(color, 0.15)}`,
            border: `1px solid ${alpha(color, 0.3)}`,
          },
        }}
      >
        <CardContent sx={{ p: 3, flex: 1 }}>
          {/* Header */}
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
                {invitationCode?.codeType ?? ""}
              </Typography>
            </Box>
          </Stack>

          {/* Code + copy */}
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
                  wordBreak: "break-all",
                }}
              >
                {invitationCode?.code || "N/A"}
              </Typography>
              <Tooltip
                title={
                  copiedCode === invitationCode?.code
                    ? t("common.copied")
                    : t("common.copy")
                }
              >
                <IconButton
                  onClick={() => handleCopyCode(invitationCode?.code)}
                  sx={{
                    color:
                      copiedCode === invitationCode?.code
                        ? "success.main"
                        : color,
                    "&:hover": { bgcolor: alpha(color, 0.1) },
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

          {/* Status */}
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={statusActive ? <CheckCircleIcon /> : <ErrorIcon />}
              label={
                statusActive
                  ? t("common.status.active")
                  : t("common.status.inactive")
              }
              color={statusActive ? "success" : "error"}
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Stats */}
          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight={600} color={color}>
              {t("franchise.invitations.stats.title")}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
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
                    {t("franchise.invitations.stats.usage")}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.warning.main, 0.05),
                  }}
                >
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="warning.main"
                  >
                    {invitationCode?.statistics?.totalCumulativeUses || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("franchise.invitations.stats.total")}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Dates */}
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayIcon
                  sx={{ fontSize: 16, color: "text.secondary" }}
                />
                <Typography variant="body2" color="text.secondary">
                  {t("common.createdAt")}
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
                  {t("common.updatedAt")}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {invitationCode?.updatedAt
                    ? formatDate(invitationCode.updatedAt)
                    : "N/A"}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
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
                {t("franchise.invitations.title")}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t("franchise.invitations.subtitle")}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Fade>

      {/* Action bar – có lại nút Kích hoạt (tắt hành vi gọi API mặc định) */}
      <Grow in timeout={800}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
          sx={{ justifyContent: "flex-end", mb: 2 }}
        >
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Tooltip title={t("common.refresh")}>
              <IconButton onClick={fetchInvitationCodes}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={t("common.export")} sx={{ display: "none" }}>
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
                opacity: ENABLE_ACTIVATE_BUTTON ? 1 : 0.6,
                pointerEvents: ENABLE_ACTIVATE_BUTTON ? "auto" : "none",
              }}
              disabled={activating}
              onClick={handleActivateClick}
            >
              {activating
                ? t("franchise.invitations.activate.loading", {
                    defaultValue: "Đang kích hoạt...",
                  })
                : t("franchise.invitations.activate.btn", {
                    defaultValue: "Kích hoạt",
                  })}
            </Button>

            <Button
              variant="contained"
              color="info"
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              disabled={creating1m}
              onClick={() => createDurationCode(1)}
            >
              {creating1m
                ? t("franchise.invitations.create.oneMonthLoading", {
                    defaultValue: "Đang tạo mã 1 tháng...",
                  })
                : t("franchise.invitations.create.oneMonth", {
                    defaultValue: "Tạo mã 1 tháng (chuẩn)",
                  })}
            </Button>

            <Button
              variant="contained"
              color="secondary"
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              disabled={creating3m}
              onClick={() => createDurationCode(3)}
            >
              {creating3m
                ? t("franchise.invitations.create.threeMonthsLoading", {
                    defaultValue: "Đang tạo mã 3 tháng...",
                  })
                : t("franchise.invitations.create.threeMonths", {
                    defaultValue: "Tạo mã 3 tháng (chuẩn)",
                  })}
            </Button>
          </Stack>
        </Stack>
      </Grow>

      {/* Cards */}
      <Grow in={!invitationCodes.loading} timeout={800}>
        <Box>
          {/* HÀNG 1: 2 bảng kích hoạt – CHỈ hiển thị dữ liệu (không gọi API tạo ở đây) */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                alignItems: "stretch",
              }}
            >
              <InvitationCodeCard
                invitationCode={userTrialCode}
                title={t("franchise.invitations.cards.userTrial")}
                icon={
                  <PersonIcon
                    sx={{ color: theme.palette.info.main, fontSize: 28 }}
                  />
                }
                color={theme.palette.info.main}
              />
              <InvitationCodeCard
                invitationCode={franchiseJoinCode}
                title={t("franchise.invitations.cards.franchise")}
                icon={
                  <BusinessIcon
                    sx={{ color: theme.palette.success.main, fontSize: 28 }}
                  />
                }
                color={theme.palette.success.main}
              />
            </Box>
          </Paper>

          {/* HÀNG 2: chỉ render sau khi bấm nút – GỌI API ở đây */}
          {(show1m || show3m) && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gap: 3,
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  alignItems: "stretch",
                }}
              >
                {show1m && (
                  <InvitationCodeCard
                    invitationCode={oneMonthCode}
                    title={t("franchise.invitations.cards.oneMonth", {
                      defaultValue: "Mã mời 1 tháng",
                    })}
                    icon={
                      <CalendarTodayIcon
                        sx={{ color: theme.palette.warning.main, fontSize: 28 }}
                      />
                    }
                    color={theme.palette.warning.main}
                  />
                )}
                {show3m && (
                  <InvitationCodeCard
                    invitationCode={threeMonthCode}
                    title={t("franchise.invitations.cards.threeMonths", {
                      defaultValue: "Mã mời 3 tháng",
                    })}
                    icon={
                      <UpdateIcon
                        sx={{ color: theme.palette.error.main, fontSize: 28 }}
                      />
                    }
                    color={theme.palette.error.main}
                  />
                )}
              </Box>
            </Paper>
          )}
        </Box>
      </Grow>
    </Box>
  );
}
