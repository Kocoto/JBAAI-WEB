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

  // ✅ Gọi API CHẮC CHẮN 1 lần khi mount (không phụ thuộc tối ưu ở hook)
  useEffect(() => {
    let mounted = true;
    console.time?.("InvitationTrials:initial-load");

    (async () => {
      try {
        // gọi danh sách code trước để UI có dữ liệu sớm
        await fetchInvitationCodes(1, 10);
        // gọi details sau (không chặn hiển thị code)
        fetchFranchiseDetails?.();
      } catch (e) {
        console.error("[InvitationTrials] initial fetch error:", e);
      } finally {
        if (mounted) console.timeEnd?.("InvitationTrials:initial-load");
      }
    })();

    return () => {
      mounted = false;
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    };
    // CHÚ Ý: không đưa fetchFranchiseDetails vào deps để tránh gọi lại khi ref thay đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchInvitationCodes]);

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

  const pickNewestPrefActive = (
    arr: InvitationCode[] | undefined,
    pred: (c: InvitationCode) => boolean
  ) =>
    arr?.filter(pred).sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })?.[0];

  // ✅ nhận dạng codeType an toàn (string hoặc object)
  const codeLegacy = useMemo(
    () =>
      pickNewestPrefActive(
        invitationCodes?.data,
        (c) => getTypeKey(c.codeType) === "USER_TRIAL"
      ),
    [invitationCodes?.data]
  );

  const codeFranchise = useMemo(
    () =>
      pickNewestPrefActive(
        invitationCodes?.data,
        (c) => getTypeKey(c.codeType) === "FRANCHISE_HIERARCHY"
      ),
    [invitationCodes?.data]
  );

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
                    {invitationCode?.statistics?.actualUsageCount ?? 0}
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
                    {invitationCode?.statistics?.totalCumulativeUses ?? 0}
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

  // ======= UI =======
  const isLoading = invitationCodes.loading;
  const hasError = !!invitationCodes.error;
  const hasData = (invitationCodes.data?.length || 0) > 0;

  return (
    <Box sx={{ width: "100%" }}>
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

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {isLoading && !hasData ? (
          <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              {t("common.loading", { defaultValue: "Đang tải..." })}
            </Typography>
          </Stack>
        ) : hasError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {invitationCodes.error?.message || "Lỗi tải dữ liệu"}
          </Alert>
        ) : (
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
        )}
      </Paper>
    </Box>
  );
}
