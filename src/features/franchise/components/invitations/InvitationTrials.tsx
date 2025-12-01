// src/features/franchise/components/invitations/InvitationTrials.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  alpha,
  Box,
  Card,
  CardContent,
  Paper,
  Stack,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UpdateIcon from "@mui/icons-material/Update";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorIcon from "@mui/icons-material/Error";
import { useTranslation } from "react-i18next";

import { useFranchise } from "../../hooks/useFranchise";
import type { InvitationCode } from "../../types/franchise.type";

const CARD_MIN_HEIGHT = 420;

// Chuẩn hoá codeType
function getTypeKey(code?: InvitationCode["codeType"]) {
  if (!code) return undefined;
  if (typeof code === "string") return code;
  return (
    code.key ||
    code._id ||
    (typeof code.name === "string" ? code.name : undefined)
  );
}

export default function InvitationTrials() {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    invitationCodes,
    fetchInvitationCodes,
    fetchFranchiseDetails,
    activeCode,
  } = useFranchise();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const [isSlowLoading, setIsSlowLoading] = useState(false);

  // ❗ KHÔNG fetch khi mount nữa – chỉ cleanup timer
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  // Nếu đang loading lần đầu (chưa có data) > 5s thì báo server chậm
  useEffect(() => {
    const hasData = (invitationCodes.data?.length || 0) > 0;

    if (!invitationCodes.loading || hasData) {
      setIsSlowLoading(false);
      return;
    }

    const id = window.setTimeout(() => {
      setIsSlowLoading(true);
    }, 5000);

    return () => window.clearTimeout(id);
  }, [invitationCodes.loading, invitationCodes.data]);

  const handleCopyCode = async (code?: string) => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleActiveCode = async () => {
    try {
      const result = await activeCode();
      if (result?.success) {
        await fetchInvitationCodes(1, 10);
      }
    } catch (e) {
      console.error("[InvitationTrials] activeCode error:", e);
    }
  };

  const fmt = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  // Chỉ duyệt mảng 1 lần để lấy 2 mã cần thiết
  const { newestLegacy, newestFranchise } = useMemo(() => {
    const initial = {
      newestLegacy: undefined as InvitationCode | undefined,
      newestFranchise: undefined as InvitationCode | undefined,
    };

    const arr = invitationCodes.data;
    if (!arr || arr.length === 0) return initial;

    const updateNewest = (
      current: InvitationCode | undefined,
      next: InvitationCode
    ) => {
      if (!current) return next;

      const curActive = current.status === "active";
      const nextActive = next.status === "active";

      if (!curActive && nextActive) return next;
      if (curActive && !nextActive) return current;

      const curTime = new Date(current.createdAt).getTime();
      const nextTime = new Date(next.createdAt).getTime();
      return nextTime > curTime ? next : current;
    };

    return arr.reduce((acc, c) => {
      const typeKey = getTypeKey(c.codeType);
      if (typeKey === "USER_TRIAL") {
        acc.newestLegacy = updateNewest(acc.newestLegacy, c);
      } else if (typeKey === "FRANCHISE_HIERARCHY") {
        acc.newestFranchise = updateNewest(acc.newestFranchise, c);
      }
      return acc;
    }, initial);
  }, [invitationCodes.data]);

  const codeLegacy = newestLegacy;
  const codeFranchise = newestFranchise;

  const codeTypeLabel = (ct?: InvitationCode["codeType"]) => {
    const k = getTypeKey(ct);
    switch (k) {
      case "USER_TRIAL":
        return t("franchise.invitations.codeType.userTrial", {
          defaultValue: "Dùng thử (cũ)",
        });
      case "FRANCHISE_HIERARCHY":
        return t("franchise.invitations.codeType.franchiseHierarchy", {
          defaultValue: "Mã nhánh hệ thống",
        });
      default:
        return "—";
    }
  };

  const InvitationCodeCard = React.memo(function InvitationCodeCard({
    invitationCode,
    title,
    icon,
    color,
  }: {
    invitationCode?: InvitationCode;
    title: string;
    icon: React.ReactNode;
    color: string;
  }) {
    const code = invitationCode?.code ?? "N/A";
    const status = invitationCode?.status ?? "inactive";

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
          transition: "all 0.25s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: `0 8px 24px ${alpha(color, 0.15)}`,
            border: `1px solid ${alpha(color, 0.3)}`,
          },
        }}
      >
        <CardContent sx={{ p: 3, flex: 1 }}>
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
              <Typography variant="h6" fontWeight={700} sx={{ color }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {codeTypeLabel(invitationCode?.codeType)}
              </Typography>
            </Box>
          </Stack>

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
                  color,
                  flex: 1,
                  wordBreak: "break-all",
                }}
              >
                {code}
              </Typography>
              <Tooltip
                title={
                  copiedCode === code ? t("common.copied") : t("common.copy")
                }
              >
                <IconButton
                  onClick={() => handleCopyCode(invitationCode?.code)}
                  sx={{ color }}
                >
                  {copiedCode === code ? (
                    <CheckCircleIcon />
                  ) : (
                    <ContentCopyIcon />
                  )}
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <Chip
            icon={status === "active" ? <CheckCircleIcon /> : <ErrorIcon />}
            label={
              status === "active"
                ? t("common.status.active")
                : t("common.status.inactive")
            }
            color={status === "active" ? "success" : "error"}
            variant="filled"
            sx={{ fontWeight: 600, mb: 2 }}
          />

          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight={600} color={color}>
              {t("franchise.invitations.stats.title")}
            </Typography>

            <Grid container spacing={2}>
              <Grid sx={{ xs: 6 }}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.info.main, 0.05),
                  }}
                >
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    {invitationCode?.statistics?.actualUsageCount ??
                      invitationCode?.totalCumulativeUses ??
                      0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("franchise.invitations.stats.usage")}
                  </Typography>
                </Box>
              </Grid>
              <Grid sx={{ xs: 6 }}>
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
                    {invitationCode?.statistics?.totalCumulativeUses ??
                      invitationCode?.totalCumulativeUses ??
                      0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("franchise.invitations.stats.total")}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayIcon
                  sx={{ fontSize: 16, color: "text.secondary" }}
                />
                <Typography variant="body2" color="text.secondary">
                  {t("common.createdAt")}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {fmt(invitationCode?.createdAt)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <UpdateIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {t("common.updatedAt")}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {fmt(invitationCode?.updatedAt)}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  });

  const hasData = (invitationCodes.data?.length || 0) > 0;
  const isLoading = invitationCodes.loading;
  const isRefreshing = invitationCodes.refreshing;
  const hasError = !!invitationCodes.error;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
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

        <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
          <Tooltip title={t("common.refresh")}>
            <IconButton onClick={() => fetchInvitationCodes(1, 10)}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: 2,
            }}
            onClick={handleActiveCode}
          >
            {t("franchise.invitations.activate.btn")}
          </Button>
        </Stack>
      </Stack>

      {/* Body */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Chưa có dữ liệu & không loading */}
        {!hasData && !isLoading && !isRefreshing && !hasError && (
          <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Chưa có dữ liệu mã mời.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => fetchInvitationCodes(1, 10)}
            >
              Tải mã mời
            </Button>
          </Stack>
        )}

        {/* Loading lần đầu (khi user bấm Tải mà chưa có data) */}
        {isLoading && !hasData && (
          <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              {t("common.loading", { defaultValue: "Đang tải..." })}
            </Typography>
            {isSlowLoading && (
              <Typography variant="caption" color="text.secondary">
                Máy chủ có thể đang khởi động lần đầu nên sẽ mất khoảng 10–20
                giây. Vui lòng chờ thêm một chút nhé.
              </Typography>
            )}
          </Stack>
        )}

        {/* Lỗi & chưa có data */}
        {hasError && !hasData && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {invitationCodes.error?.message || "Lỗi tải dữ liệu"}
          </Alert>
        )}

        {/* Có data rồi: luôn hiện card ngay */}
        {hasData && (
          <>
            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                alignItems: "stretch",
              }}
            >
              <InvitationCodeCard
                invitationCode={codeLegacy}
                title={t("franchise.invitations.cards.userTrialLegacy", {
                  defaultValue: "Mã dùng thử (cũ)",
                })}
                icon={
                  <PersonIcon
                    sx={{ color: theme.palette.info.main, fontSize: 28 }}
                  />
                }
                color={theme.palette.info.main}
              />
              <InvitationCodeCard
                invitationCode={codeFranchise}
                title={t("franchise.invitations.cards.franchise", {
                  defaultValue: "Mã nhánh hệ thống",
                })}
                icon={
                  <BusinessIcon
                    sx={{ color: theme.palette.success.main, fontSize: 28 }}
                  />
                }
                color={theme.palette.success.main}
              />
            </Box>

            {/* Đang refresh nền */}
            {isRefreshing && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", textAlign: "right", mt: 1 }}
              >
                Đang cập nhật dữ liệu mới...
              </Typography>
            )}

            {/* Có lỗi khi refresh nhưng vẫn có data cache */}
            {hasError && hasData && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Không cập nhật được dữ liệu mới, đang hiển thị dữ liệu cũ.
              </Alert>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
