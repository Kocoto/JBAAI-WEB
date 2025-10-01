import {
  alpha,
  Box,
  Card,
  CardContent,
  Fade,
  Grow,
  Paper,
  Stack,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Button,
  Grid,
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
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useFranchise } from "../../hooks/useFranchise";
import type { InvitationCode } from "../../types/franchise.type";

const CARD_MIN_HEIGHT = 420;

export default function InvitationCodes() {
  const theme = useTheme();
  const { t } = useTranslation();

  const { invitationCodes, fetchInvitationCodes, fetchFranchiseDetails, activeCode } =
    useFranchise();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const res = await fetchInvitationCodes();
      await fetchFranchiseDetails();

      // 🔎 Debug log response từ hook
      console.groupCollapsed("🎯 InvitationCodes.tsx useEffect");
      console.log("invitationCodes state:", invitationCodes);
      console.log("Raw API data:", res);
      console.groupEnd();
    };
    loadData();
  }, [fetchInvitationCodes, fetchFranchiseDetails]);

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

  const handleActiveCode = async () => {
    const result = await activeCode();
    if (result?.success) fetchInvitationCodes();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pickNewestPrefActive = (
    arr: InvitationCode[] | undefined,
    pred: (c: InvitationCode) => boolean
  ) => {
    if (!arr?.length) return undefined;
    return arr
      .filter(pred)
      .sort((a, b) => {
        if (a.status === "active" && b.status !== "active") return -1;
        if (a.status !== "active" && b.status === "active") return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })[0];
  };

  const code1m = useMemo(
    () =>
      pickNewestPrefActive(
        invitationCodes?.data,
        (c) => c.codeType === "USER_TRIAL_STANDARD_ONE_MONTH"
      ),
    [invitationCodes?.data]
  );

  const code3m = useMemo(
    () =>
      pickNewestPrefActive(
        invitationCodes?.data,
        (c) => c.codeType === "USER_TRIAL_STANDARD_THREE_MONTHS"
      ),
    [invitationCodes?.data]
  );

  const codeLegacy = useMemo(
    () => pickNewestPrefActive(invitationCodes?.data, (c) => c.codeType === "USER_TRIAL"),
    [invitationCodes?.data]
  );

  const codeFranchise = useMemo(
    () =>
      pickNewestPrefActive(invitationCodes?.data, (c) => c.codeType === "FRANCHISE_HIERARCHY"),
    [invitationCodes?.data]
  );

  const codeTypeLabel = (ct?: InvitationCode["codeType"]) => {
    switch (ct) {
      case "USER_TRIAL_STANDARD_ONE_MONTH":
        return t("franchise.invitations.codeType.userTrial1m", { defaultValue: "Dùng thử 1 tháng" });
      case "USER_TRIAL_STANDARD_THREE_MONTHS":
        return t("franchise.invitations.codeType.userTrial3m", { defaultValue: "Dùng thử 3 tháng" });
      case "USER_TRIAL":
        return t("franchise.invitations.codeType.userTrial", { defaultValue: "Dùng thử (cũ)" });
      case "FRANCHISE_HIERARCHY":
        return t("franchise.invitations.codeType.franchiseHierarchy", { defaultValue: "Mã nhánh hệ thống" });
      default:
        return "—";
    }
  };

  const InvitationCodeCard = ({
    invitationCode,
    title,
    icon,
    color,
  }: {
    invitationCode?: InvitationCode;
    title: string;
    icon: React.ReactNode;
    color: string;
  }) => {
    const code = invitationCode?.code ?? "N/A";
    const status = (invitationCode?.status as string) ?? "inactive";

    // 🔎 Debug mỗi card
    console.log("📌 Rendering card:", title, invitationCode);

    return (
      <Card
        variant="outlined"
        sx={{
          width: "100%",
          height: "100%",
          minHeight: CARD_MIN_HEIGHT,
          display: "flex",
          flexDirection: "column",
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
              <Typography variant="h6" fontWeight={700} sx={{ color: color }}>
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
                  color: color,
                  flex: 1,
                  wordBreak: "break-all",
                }}
              >
                {code}
              </Typography>
              <Tooltip title={copiedCode === code ? t("common.copied") : t("common.copy")}>
                <IconButton
                  onClick={() => handleCopyCode(invitationCode?.code)}
                  sx={{
                    color: copiedCode === code ? "success.main" : color,
                    "&:hover": { bgcolor: alpha(color, 0.1) },
                  }}
                >
                  {copiedCode === code ? <CheckCircleIcon /> : <ContentCopyIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Chip
              icon={status === "active" ? <CheckCircleIcon /> : <ErrorIcon />}
              label={status === "active" ? t("common.status.active") : t("common.status.inactive")}
              color={status === "active" ? "success" : "error"}
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

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
                    {invitationCode?.statistics?.actualUsageCount ?? 0}
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
                  <Typography variant="h4" fontWeight={700} color="warning.main">
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
                <CalendarTodayIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {t("common.createdAt")}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatDate(invitationCode?.createdAt)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <UpdateIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {t("common.updatedAt")}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatDate(invitationCode?.updatedAt)}
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
              <LocalActivityIcon sx={{ color: theme.palette.primary.main, fontSize: 36 }} />
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
              }}
              onClick={handleActiveCode}
            >
              {t("franchise.invitations.activate.btn")}
            </Button>
          </Stack>
        </Stack>
      </Grow>

      <Grow in={!invitationCodes.loading} timeout={800}>
        <Box>
          <Paper
            elevation={0}
            sx={{ p: 3, mb: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}
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
                invitationCode={code1m}
                title={t("franchise.invitations.cards.oneMonth", { defaultValue: "Mã mời 1 tháng" })}
                icon={<CalendarTodayIcon sx={{ color: theme.palette.warning.main, fontSize: 28 }} />}
                color={theme.palette.warning.main}
              />
              <InvitationCodeCard
                invitationCode={code3m}
                title={t("franchise.invitations.cards.threeMonths", {
                  defaultValue: "Mã mời 3 tháng",
                })}
                icon={<UpdateIcon sx={{ color: theme.palette.error.main, fontSize: 28 }} />}
                color={theme.palette.error.main}
              />
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{ p: 3, mb: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}
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
                invitationCode={codeLegacy}
                title={t("franchise.invitations.cards.userTrialLegacy", {
                  defaultValue: "Mã dùng thử (cũ)",
                })}
                icon={<PersonIcon sx={{ color: theme.palette.info.main, fontSize: 28 }} />}
                color={theme.palette.info.main}
              />
              <InvitationCodeCard
                invitationCode={codeFranchise}
                title={t("franchise.invitations.cards.franchise", {
                  defaultValue: "Mã nhánh hệ thống",
                })}
                icon={<BusinessIcon sx={{ color: theme.palette.success.main, fontSize: 28 }} />}
                color={theme.palette.success.main}
              />
            </Box>
          </Paper>
        </Box>
      </Grow>
    </Box>
  );
}
