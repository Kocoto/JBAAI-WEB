// // InvitationCodes copy.tsx
// import {
//   alpha,
//   Box,
//   Card,
//   CardContent,
//   Fade,
//   Paper,
//   Stack,
//   Typography,
//   Chip,
//   IconButton,
//   Tooltip,
//   Divider,
//   Button,
//   useTheme,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   DialogActions,
//   Alert,
//   LinearProgress,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   FormHelperText,
//   CircularProgress,
//   Grid,
// } from "@mui/material";

// import {
//   LocalActivity as LocalActivityIcon,
//   ContentCopy as ContentCopyIcon,
//   Person as PersonIcon,
//   Business as BusinessIcon,
//   CalendarToday as CalendarTodayIcon,
//   Update as UpdateIcon,
//   Visibility as VisibilityIcon,
//   CheckCircle as CheckCircleIcon,
//   Error as ErrorIcon,
//   Settings as SettingsIcon,
//   Refresh as RefreshIcon,
//   PlayArrow as PlayArrowIcon,
//   Close as CloseIcon,
//   Info as InfoIcon,
//   Star as StarIcon,
//   AllInclusive as AllInclusiveIcon,
//   WorkspacePremium as PremiumIcon,
// } from "@mui/icons-material";

// import { useEffect, useMemo, useState } from "react";
// import { useTranslation } from "react-i18next";
// import { useFranchise } from "../../hooks/useFranchise";

// /* ======================= QUOTA PRESETS ======================= */
// const QUOTA_PRESETS = [
//   {
//     value: "basic",
//     icon: <StarIcon />,
//     color: "#2196f3",
//     labelKey: "franchise.invitations.quota.basic.title",
//     labelDefault: "Basic",
//     descKey: "franchise.invitations.quota.basic.desc",
//     descDefault: "100 uses",
//     featureKeys: [
//       {
//         key: "franchise.invitations.quota.basic.features.0",
//         defaultValue: "100 uses / month",
//       },
//       {
//         key: "franchise.invitations.quota.basic.features.1",
//         defaultValue: "Basic support",
//       },
//       {
//         key: "franchise.invitations.quota.basic.features.2",
//         defaultValue: "Monthly report",
//       },
//     ],
//   },
//   {
//     value: "premium",
//     icon: <PremiumIcon />,
//     color: "#ff9800",
//     labelKey: "franchise.invitations.quota.premium.title",
//     labelDefault: "Premium",
//     descKey: "franchise.invitations.quota.premium.desc",
//     descDefault: "500 uses",
//     featureKeys: [
//       {
//         key: "franchise.invitations.quota.premium.features.0",
//         defaultValue: "500 uses / month",
//       },
//       {
//         key: "franchise.invitations.quota.premium.features.1",
//         defaultValue: "Priority support 24/7",
//       },
//       {
//         key: "franchise.invitations.quota.premium.features.2",
//         defaultValue: "Weekly detailed reports",
//       },
//       {
//         key: "franchise.invitations.quota.premium.features.3",
//         defaultValue: "UI customization",
//       },
//     ],
//   },
//   {
//     value: "enterprise",
//     icon: <AllInclusiveIcon />,
//     color: "#4caf50",
//     labelKey: "franchise.invitations.quota.enterprise.title",
//     labelDefault: "Enterprise",
//     descKey: "franchise.invitations.quota.enterprise.desc",
//     descDefault: "Unlimited",
//     featureKeys: [
//       {
//         key: "franchise.invitations.quota.enterprise.features.0",
//         defaultValue: "Unlimited usage",
//       },
//       {
//         key: "franchise.invitations.quota.enterprise.features.1",
//         defaultValue: "Dedicated support",
//       },
//       {
//         key: "franchise.invitations.quota.enterprise.features.2",
//         defaultValue: "API integration",
//       },
//       {
//         key: "franchise.invitations.quota.enterprise.features.3",
//         defaultValue: "Custom reports",
//       },
//       {
//         key: "franchise.invitations.quota.enterprise.features.4",
//         defaultValue: "Multi-branch management",
//       },
//     ],
//   },
// ] as const;

// /* =========================== helpers =========================== */
// const randomCode = (length = 10) => {
//   const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
//   let out = "";
//   for (let i = 0; i < length; i++)
//     out += chars[Math.floor(Math.random() * chars.length)];
//   return out;
// };

// const BASE_URL =
//   (typeof import.meta !== "undefined" &&
//     (import.meta as any)?.env?.VITE_BASE_URL) ||
//   (typeof process !== "undefined" &&
//     (process as any)?.env?.REACT_APP_BASE_URL) ||
//   "";

// /* ======================== Component chính ======================== */
// export default function InvitationCodesCopy() {
//   const theme = useTheme();
//   const { t, i18n } = useTranslation();

//   const { invitationCodes, fetchInvitationCodes, activeCode } = useFranchise();

//   const [copiedCode, setCopiedCode] = useState<string | null>(null);

//   const [isActivating, setIsActivating] = useState(false);
//   const [activationError, setActivationError] = useState<string | null>(null);

//   const [creating1m, setCreating1m] = useState(false);
//   const [creating3m, setCreating3m] = useState(false);
//   const [createError, setCreateError] = useState<string | null>(null);

//   const [activationDialog, setActivationDialog] = useState({
//     open: false,
//     codeId: null as string | null,
//     codeType: null as string | null,
//     code: null as string | null,
//   });
//   const [selectedQuota, setSelectedQuota] = useState("");

//   const QUOTA_OPTIONS = useMemo(
//     () =>
//       QUOTA_PRESETS.map((p) => ({
//         value: p.value,
//         icon: p.icon,
//         color: p.color,
//         label: t(p.labelKey, { defaultValue: p.labelDefault }),
//         description: t(p.descKey, { defaultValue: p.descDefault }),
//         features: p.featureKeys.map((f) =>
//           t(f.key, { defaultValue: f.defaultValue })
//         ),
//       })),
//     [t, i18n.language]
//   );

//   useEffect(() => {
//     fetchInvitationCodes();
//   }, [fetchInvitationCodes]);

//   /* ---------- map dữ liệu về 4 ô: 2 hàng, mỗi hàng 2 ô ---------- */
//   const list = invitationCodes?.data || [];
//   const permanentJoinSystem: any = list.find(
//     (it: any) =>
//       (it.codeType === "JOIN_SYSTEM" || it.codeType === "FRANCHISE") &&
//       !it?.durationMonths
//   );
//   const userTrial: any = list.find(
//     (it: any) => it.codeType === "USER_TRIAL" && !it?.durationMonths
//   );
//   const oneMonth: any = list.find(
//     (it: any) => Number(it?.durationMonths) === 1
//   );
//   const threeMonths: any = list.find(
//     (it: any) => Number(it?.durationMonths) === 3
//   );

//   /* ----------------- actions ----------------- */
//   const handleCopyCode = async (code?: string) => {
//     if (!code) return;
//     try {
//       await navigator.clipboard.writeText(code);
//       setCopiedCode(code);
//       setTimeout(() => setCopiedCode(null), 2000);
//     } catch (err) {
//       console.error("Clipboard copy failed:", err);
//     }
//   };

//   const handleActivateCode = (
//     codeId: string,
//     codeType: string,
//     code: string
//   ) => {
//     setActivationDialog({ open: true, codeId, codeType, code });
//     setActivationError(null);
//   };

//   const handleConfirmActivation = async () => {
//     try {
//       setIsActivating(true);
//       setActivationError(null);

//       const res = await activeCode();
//       if (!res?.success)
//         throw new Error(res?.error?.message || "Active code failed");

//       setActivationDialog({
//         open: false,
//         codeId: null,
//         codeType: null,
//         code: null,
//       });
//       setSelectedQuota("");
//       setIsActivating(false);
//       fetchInvitationCodes();
//     } catch (error: any) {
//       console.error("Activate code error:", error);
//       setActivationError(
//         t("franchise.invitations.activate.error", {
//           defaultValue: "Có lỗi xảy ra khi kích hoạt mã. Vui lòng thử lại.",
//         })
//       );
//       setIsActivating(false);
//     }
//   };

//   const handleCloseActivationDialog = () => {
//     if (!isActivating) {
//       setActivationDialog({
//         open: false,
//         codeId: null,
//         codeType: null,
//         code: null,
//       });
//       setSelectedQuota("");
//       setActivationError(null);
//     }
//   };

//   const createDurationCode = async (months: 1 | 3) => {
//     setCreateError(null);
//     months === 1 ? setCreating1m(true) : setCreating3m(true);
//     try {
//       const payload = {
//         code: randomCode(10),
//         durationMonths: months,
//         codeType: "JOIN_SYSTEM",
//       };

//       await fetch(`${BASE_URL}/api/v1/admin/invitation-code/create`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       await fetchInvitationCodes();
//     } catch (err: any) {
//       console.error("Create code error:", err);
//       setCreateError(
//         t("franchise.invitations.create.error", {
//           defaultValue: "Tạo mã mời thất bại. Vui lòng thử lại.",
//         })
//       );
//     } finally {
//       months === 1 ? setCreating1m(false) : setCreating3m(false);
//     }
//   };

//   /* ----------------- date helpers ----------------- */
//   const formatDate = (dateString?: string | number | Date) => {
//     if (!dateString) return "N/A";
//     try {
//       return new Date(dateString).toLocaleString(i18n.language || "vi-VN", {
//         year: "numeric",
//         month: "2-digit",
//         day: "2-digit",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } catch {
//       return "N/A";
//     }
//   };
//   const addMonths = (d: Date, m: number) => {
//     const r = new Date(d);
//     r.setMonth(r.getMonth() + m);
//     return r;
//   };
//   const pickStart = (it?: any) =>
//     it?.startsAt || it?.startDate || it?.createdAt;
//   const pickEnd = (it?: any) =>
//     it?.expiresAt ||
//     it?.endDate ||
//     (pickStart(it) &&
//       it?.durationMonths &&
//       addMonths(new Date(pickStart(it)), Number(it.durationMonths)));

//   /* ----------------- Card ----------------- */
//   const InvitationCodeCard = ({
//     invitationCode,
//     title,
//     icon,
//     color,
//     placeholderAction,
//   }: {
//     invitationCode?: any;
//     title: string;
//     icon: React.ReactNode;
//     color: string;
//     placeholderAction?: {
//       label: string;
//       onClick: () => void;
//       loading?: boolean;
//     };
//   }) => {
//     const code = invitationCode?.code;
//     const status = invitationCode?.status;
//     const start = pickStart(invitationCode);
//     const end = pickEnd(invitationCode);

//     return (
//       <Card
//         variant="outlined"
//         sx={{
//           height: "100%",
//           flexGrow: 1,
//           background: `linear-gradient(135deg, ${alpha(
//             color,
//             0.05
//           )} 0%, ${alpha(color, 0.02)} 100%)`,
//           border: `1px solid ${alpha(color, 0.2)}`,
//           transition: "all 0.3s ease",
//           "&:hover": {
//             transform: "translateY(-4px)",
//             boxShadow: `0 8px 25px ${alpha(color, 0.15)}`,
//             border: `1px solid ${alpha(color, 0.3)}`,
//           },
//         }}
//       >
//         <CardContent sx={{ p: 3 }}>
//           {/* Header */}
//           <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
//             <Box
//               sx={{
//                 p: 1.5,
//                 borderRadius: 2,
//                 bgcolor: alpha(color, 0.1),
//                 display: "flex",
//                 alignItems: "center",
//               }}
//             >
//               {icon}
//             </Box>
//             <Box sx={{ flex: 1 }}>
//               <Typography variant="h6" fontWeight={700} sx={{ color }}>
//                 {title}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 {invitationCode?.codeType === "USER_TRIAL"
//                   ? t("franchise.invitations.codeType.userTrial", {
//                       defaultValue: "Dùng thử miễn phí",
//                     })
//                   : t("franchise.invitations.codeType.joinSystem", {
//                       defaultValue: "Tham gia hệ thống",
//                     })}
//               </Typography>
//             </Box>
//           </Stack>

//           {/* Code + copy OR placeholder create */}
//           {code ? (
//             <Box
//               sx={{
//                 p: 2,
//                 borderRadius: 2,
//                 bgcolor: alpha(color, 0.08),
//                 border: `1px solid ${alpha(color, 0.2)}`,
//                 mb: 3,
//               }}
//             >
//               <Stack direction="row" alignItems="center" spacing={2}>
//                 <Typography
//                   variant="h5"
//                   sx={{
//                     fontWeight: 700,
//                     fontFamily: "monospace",
//                     color,
//                     flex: 1,
//                   }}
//                 >
//                   {code}
//                 </Typography>
//                 <Tooltip
//                   title={
//                     copiedCode === code
//                       ? t("common.copied", { defaultValue: "Đã sao chép!" })
//                       : t("common.copy", { defaultValue: "Sao chép mã" })
//                   }
//                 >
//                   <IconButton
//                     onClick={() => handleCopyCode(code)}
//                     sx={{
//                       color: copiedCode === code ? "success.main" : color,
//                       "&:hover": { bgcolor: alpha(color, 0.1) },
//                     }}
//                   >
//                     {copiedCode === code ? (
//                       <CheckCircleIcon />
//                     ) : (
//                       <ContentCopyIcon />
//                     )}
//                   </IconButton>
//                 </Tooltip>
//               </Stack>
//             </Box>
//           ) : (
//             <Box
//               sx={{
//                 p: 2,
//                 borderRadius: 2,
//                 bgcolor: alpha(color, 0.04),
//                 border: `1px dashed ${alpha(color, 0.4)}`,
//                 mb: 2,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 gap: 2,
//               }}
//             >
//               <Typography variant="body2" color="text.secondary">
//                 {t("franchise.invitations.empty", {
//                   defaultValue: "Chưa có mã cho mục này.",
//                 })}
//               </Typography>
//               {placeholderAction && (
//                 <Button
//                   variant="contained"
//                   onClick={placeholderAction.onClick}
//                   disabled={placeholderAction.loading}
//                   sx={{ textTransform: "none" }}
//                 >
//                   {placeholderAction.loading ? (
//                     <Stack direction="row" alignItems="center" spacing={1}>
//                       <CircularProgress size={18} />
//                       <span>
//                         {t("common.processing", {
//                           defaultValue: "Đang xử lý...",
//                         })}
//                       </span>
//                     </Stack>
//                   ) : (
//                     placeholderAction.label
//                   )}
//                 </Button>
//               )}
//             </Box>
//           )}

//           {/* Status */}
//           <Box sx={{ mb: 2 }}>
//             <Chip
//               icon={status === "active" ? <CheckCircleIcon /> : <ErrorIcon />}
//               label={
//                 status === "active"
//                   ? t("common.status.active", { defaultValue: "Hoạt động" })
//                   : t("common.status.inactive", {
//                       defaultValue: "Không hoạt động",
//                     })
//               }
//               color={status === "active" ? "success" : "error"}
//               variant="filled"
//               sx={{ fontWeight: 600 }}
//             />
//           </Box>

//           {/* Activate button if inactive */}
//           {code && status !== "active" && (
//             <Box sx={{ mb: 2 }}>
//               <Button
//                 variant="contained"
//                 startIcon={<PlayArrowIcon />}
//                 onClick={() =>
//                   handleActivateCode(
//                     invitationCode?.id,
//                     invitationCode?.codeType,
//                     code
//                   )
//                 }
//                 sx={{
//                   background: `linear-gradient(135deg, ${color} 0%, ${alpha(
//                     color,
//                     0.8
//                   )} 100%)`,
//                   color: "white",
//                   fontWeight: 600,
//                   borderRadius: 2,
//                   textTransform: "none",
//                   "&:hover": {
//                     background: `linear-gradient(135deg, ${alpha(
//                       color,
//                       0.9
//                     )} 0%, ${alpha(color, 0.7)} 100%)`,
//                   },
//                 }}
//               >
//                 {t("franchise.invitations.activate.btn", {
//                   defaultValue: "Kích hoạt mã mời",
//                 })}
//               </Button>
//             </Box>
//           )}

//           <Divider sx={{ my: 2 }} />

//           {/* Stats + Dates */}
//           <Stack spacing={2}>
//             <Typography variant="subtitle2" fontWeight={600} color={color}>
//               {t("franchise.invitations.stats.title", {
//                 defaultValue: "Thống kê sử dụng",
//               })}
//             </Typography>

//             <Grid container spacing={2}>
//               <Grid item xs={6}>
//                 <Box
//                   sx={{
//                     textAlign: "center",
//                     p: 1.5,
//                     borderRadius: 1,
//                     bgcolor: alpha(theme.palette.info.main, 0.05),
//                   }}
//                 >
//                   <Typography variant="h4" fontWeight={700} color="info.main">
//                     {invitationCode?.statistics?.actualUsageCount || 0}
//                   </Typography>
//                   <Typography variant="caption" color="text.secondary">
//                     {t("franchise.invitations.stats.usage", {
//                       defaultValue: "Lần sử dụng",
//                     })}
//                   </Typography>
//                 </Box>
//               </Grid>
//               <Grid item xs={6}>
//                 <Box
//                   sx={{
//                     textAlign: "center",
//                     p: 1.5,
//                     borderRadius: 1,
//                     bgcolor: alpha(theme.palette.warning.main, 0.05),
//                   }}
//                 >
//                   <Typography
//                     variant="h4"
//                     fontWeight={700}
//                     color="warning.main"
//                   >
//                     {invitationCode?.statistics?.totalCumulativeUses || 0}
//                   </Typography>
//                   <Typography variant="caption" color="text.secondary">
//                     {t("franchise.invitations.stats.total", {
//                       defaultValue: "Tổng tích lũy",
//                     })}
//                   </Typography>
//                 </Box>
//               </Grid>
//             </Grid>

//             <Stack spacing={1.5}>
//               <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                 <CalendarTodayIcon
//                   sx={{ fontSize: 16, color: "text.secondary" }}
//                 />
//                 <Typography variant="body2" color="text.secondary">
//                   {t("common.createdAt", { defaultValue: "Ngày tạo:" })}
//                 </Typography>
//                 <Typography variant="body2" fontWeight={500}>
//                   {formatDate(start)}
//                 </Typography>
//               </Box>

//               <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                 <UpdateIcon sx={{ fontSize: 16, color: "text.secondary" }} />
//                 <Typography variant="body2" color="text.secondary">
//                   {t("franchise.invitations.endsAt", {
//                     defaultValue: "Ngày hết hạn:",
//                   })}
//                 </Typography>
//                 <Typography variant="body2" fontWeight={500}>
//                   {formatDate(end)}
//                 </Typography>
//               </Box>

//               <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                 <VisibilityIcon
//                   sx={{ fontSize: 16, color: "text.secondary" }}
//                 />
//                 <Typography variant="body2" color="text.secondary">
//                   {t("franchise.invitations.stats.lastUsed", {
//                     defaultValue: "Lần cuối sử dụng:",
//                   })}
//                 </Typography>
//                 <Typography variant="body2" fontWeight={500}>
//                   {invitationCode?.statistics?.lastUsedDate
//                     ? formatDate(invitationCode.statistics.lastUsedDate)
//                     : t("common.never", { defaultValue: "Chưa sử dụng" })}
//                 </Typography>
//               </Box>
//             </Stack>
//           </Stack>
//         </CardContent>
//       </Card>
//     );
//   };

//   const selectedQuotaOption = QUOTA_OPTIONS.find(
//     (opt) => opt.value === selectedQuota
//   );

//   return (
//     <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
//       {/* Header */}
//       <Fade in timeout={600}>
//         <Box>
//           <Stack
//             direction="row"
//             alignItems="center"
//             spacing={2}
//             sx={{ mb: 1.5 }}
//           >
//             <Box
//               sx={{
//                 p: 2,
//                 borderRadius: 3,
//                 background: `linear-gradient(135deg, ${alpha(
//                   theme.palette.primary.main,
//                   0.1
//                 )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
//                 display: "flex",
//                 alignItems: "center",
//                 border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
//               }}
//             >
//               <LocalActivityIcon
//                 sx={{ color: theme.palette.primary.main, fontSize: 36 }}
//               />
//             </Box>
//             <Box>
//               <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
//                 {t("franchise.invitations.title", {
//                   defaultValue: "Quản lý Mã Mời",
//                 })}
//               </Typography>
//               <Typography variant="body1" color="text.secondary">
//                 {t("franchise.invitations.subtitle", {
//                   defaultValue: "Quản lý và theo dõi các mã mời của hệ thống",
//                 })}
//               </Typography>
//             </Box>
//           </Stack>

//           {/* ACTION BAR — 3 nút cùng 1 hàng bên phải */}
//           <Box
//             sx={{
//               mb: 3,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               gap: 2,
//               flexWrap: "nowrap",
//             }}
//           >
//             {/* Trái: Refresh */}
//             <Stack direction="row" spacing={1} alignItems="center">
//               <Tooltip title={t("common.refresh", { defaultValue: "Làm mới" })}>
//                 <IconButton onClick={() => fetchInvitationCodes()}>
//                   <RefreshIcon />
//                 </IconButton>
//               </Tooltip>
//             </Stack>

//             {/* Phải: 3 nút */}
//             <Box
//               sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 1,
//                 whiteSpace: "nowrap",
//                 overflowX: "auto",
//               }}
//             >
//               <Button
//                 variant="outlined"
//                 startIcon={<SettingsIcon />}
//                 onClick={() =>
//                   setActivationDialog({
//                     open: true,
//                     codeId: null,
//                     codeType: null,
//                     code: null,
//                   })
//                 }
//                 sx={{ textTransform: "none", flexShrink: 0 }}
//               >
//                 {t("franchise.invitations.activate.manage", {
//                   defaultValue: "Kích hoạt mã mời",
//                 })}
//               </Button>
//             </Box>
//           </Box>

//           {createError && (
//             <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
//               {createError}
//             </Alert>
//           )}
//         </Box>
//       </Fade>

//       {/* 2 hàng × 2 thẻ */}
//       <Fade in={!invitationCodes.loading} timeout={600}>
//         <Paper
//           elevation={0}
//           sx={{
//             p: 3,
//             mb: 3,
//             borderRadius: 3,
//             border: `1px solid ${theme.palette.divider}`,
//           }}
//         >
//           <Grid container spacing={3}>
//             {/* Row 1 */}
//             <Grid item xs={12} md={6}>
//               <InvitationCodeCard
//                 invitationCode={userTrial}
//                 title={t("franchise.invitations.cards.userTrial", {
//                   defaultValue: "Mã Mời Dùng Thử",
//                 })}
//                 icon={
//                   <PersonIcon
//                     sx={{ color: theme.palette.info.main, fontSize: 28 }}
//                   />
//                 }
//                 color={theme.palette.info.main}
//               />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <InvitationCodeCard
//                 invitationCode={permanentJoinSystem}
//                 title={t("franchise.invitations.cards.franchise", {
//                   defaultValue: "Mã Mời Franchise",
//                 })}
//                 icon={
//                   <BusinessIcon
//                     sx={{ color: theme.palette.success.main, fontSize: 28 }}
//                   />
//                 }
//                 color={theme.palette.success.main}
//               />
//             </Grid>
//           </Grid>
//         </Paper>
//       </Fade>

//       {/* Dialog kích hoạt mã mời */}
//       <Dialog
//         open={activationDialog.open}
//         onClose={handleCloseActivationDialog}
//         maxWidth="md"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 3,
//             backgroundImage: `linear-gradient(135deg, ${alpha(
//               theme.palette.primary.main,
//               0.02
//             )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
//           },
//         }}
//       >
//         <DialogTitle sx={{ pb: 1 }}>
//           <Stack
//             direction="row"
//             alignItems="center"
//             justifyContent="space-between"
//           >
//             <Stack direction="row" alignItems="center" spacing={2}>
//               <Box
//                 sx={{
//                   p: 1.5,
//                   borderRadius: 2,
//                   bgcolor: alpha(theme.palette.primary.main, 0.1),
//                   display: "flex",
//                   alignItems: "center",
//                 }}
//               >
//                 <PlayArrowIcon sx={{ color: theme.palette.primary.main }} />
//               </Box>
//               <Box>
//                 <Typography variant="h5" fontWeight={700}>
//                   {t("franchise.invitations.activate.title", {
//                     defaultValue: "Kích hoạt mã mời",
//                   })}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   {t("franchise.invitations.activate.subtitle", {
//                     defaultValue: "Chọn gói phù hợp với nhu cầu của bạn",
//                   })}
//                 </Typography>
//               </Box>
//             </Stack>
//             <IconButton
//               onClick={handleCloseActivationDialog}
//               disabled={isActivating}
//               sx={{
//                 color: "text.secondary",
//                 "&:hover": {
//                   bgcolor: alpha(theme.palette.error.main, 0.1),
//                   color: theme.palette.error.main,
//                 },
//               }}
//             >
//               <CloseIcon />
//             </IconButton>
//           </Stack>
//         </DialogTitle>

//         <DialogContent sx={{ mt: 2 }}>
//           {activationDialog.code && (
//             <Alert
//               severity="info"
//               icon={<InfoIcon />}
//               sx={{
//                 mb: 3,
//                 borderRadius: 2,
//                 backgroundColor: alpha(theme.palette.info.main, 0.05),
//                 border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
//               }}
//             >
//               <Typography variant="body2">
//                 {t("franchise.invitations.activate.code", {
//                   defaultValue: "Mã kích hoạt:",
//                 })}{" "}
//                 <strong style={{ fontFamily: "monospace" }}>
//                   {activationDialog.code}
//                 </strong>
//               </Typography>
//             </Alert>
//           )}

//           {isActivating && (
//             <Box sx={{ mb: 3 }}>
//               <LinearProgress />
//               <Typography
//                 variant="body2"
//                 color="text.secondary"
//                 sx={{ mt: 1, textAlign: "center" }}
//               >
//                 {t("franchise.invitations.activate.processing", {
//                   defaultValue: "Đang xử lý kích hoạt...",
//                 })}
//               </Typography>
//             </Box>
//           )}

//           {activationError && (
//             <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
//               {activationError}
//             </Alert>
//           )}

//           <Stack spacing={3}>
//             <FormControl fullWidth variant="outlined">
//               <InputLabel>
//                 {t("franchise.invitations.quota.selectLabel", {
//                   defaultValue: "Chọn gói dịch vụ",
//                 })}
//               </InputLabel>
//               <Select
//                 value={selectedQuota}
//                 onChange={(e) => setSelectedQuota(e.target.value)}
//                 label={t("franchise.invitations.quota.selectLabel", {
//                   defaultValue: "Chọn gói dịch vụ",
//                 })}
//                 disabled={isActivating}
//               >
//                 {QUOTA_OPTIONS.map((option) => (
//                   <MenuItem key={option.value} value={option.value}>
//                     <Stack
//                       direction="row"
//                       alignItems="center"
//                       spacing={2}
//                       sx={{ width: "100%" }}
//                     >
//                       <Box sx={{ color: option.color }}>{option.icon}</Box>
//                       <Box sx={{ flex: 1 }}>
//                         <Typography variant="subtitle2" fontWeight={600}>
//                           {option.label}
//                         </Typography>
//                         <Typography variant="caption" color="text.secondary">
//                           {option.description}
//                         </Typography>
//                       </Box>
//                     </Stack>
//                   </MenuItem>
//                 ))}
//               </Select>
//               <FormHelperText>
//                 {t("franchise.invitations.quota.helper", {
//                   defaultValue:
//                     "Mỗi gói có các tính năng và giới hạn khác nhau",
//                 })}
//               </FormHelperText>
//             </FormControl>

//             {QUOTA_OPTIONS.find((o) => o.value === selectedQuota) && (
//               <Fade in>
//                 <Paper
//                   variant="outlined"
//                   sx={{
//                     p: 3,
//                     borderRadius: 2,
//                     border: `2px solid ${
//                       QUOTA_OPTIONS.find((o) => o.value === selectedQuota)!
//                         .color
//                     }`,
//                     background: alpha(
//                       QUOTA_OPTIONS.find((o) => o.value === selectedQuota)!
//                         .color,
//                       0.05
//                     ),
//                   }}
//                 >
//                   <Stack spacing={2}>
//                     <Stack direction="row" alignItems="center" spacing={2}>
//                       <Box
//                         sx={{
//                           p: 1.5,
//                           borderRadius: 2,
//                           bgcolor: alpha(
//                             QUOTA_OPTIONS.find(
//                               (o) => o.value === selectedQuota
//                             )!.color,
//                             0.2
//                           ),
//                           color: QUOTA_OPTIONS.find(
//                             (o) => o.value === selectedQuota
//                           )!.color,
//                         }}
//                       >
//                         {
//                           QUOTA_OPTIONS.find((o) => o.value === selectedQuota)!
//                             .icon
//                         }
//                       </Box>
//                       <Box>
//                         <Typography variant="h6" fontWeight={700}>
//                           {t("franchise.invitations.quota.packageTitle", {
//                             defaultValue: "Gói {{name}}",
//                             name: QUOTA_OPTIONS.find(
//                               (o) => o.value === selectedQuota
//                             )!.label,
//                           })}
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           {
//                             QUOTA_OPTIONS.find(
//                               (o) => o.value === selectedQuota
//                             )!.description
//                           }
//                         </Typography>
//                       </Box>
//                     </Stack>

//                     <Divider />

//                     <Box>
//                       <Typography
//                         variant="subtitle2"
//                         fontWeight={600}
//                         sx={{ mb: 1 }}
//                       >
//                         {t("franchise.invitations.quota.featuresTitle", {
//                           defaultValue: "Tính năng nổi bật:",
//                         })}
//                       </Typography>
//                       <List dense sx={{ py: 0 }}>
//                         {QUOTA_OPTIONS.find(
//                           (o) => o.value === selectedQuota
//                         )!.features.map((feature, idx) => (
//                           <ListItem key={idx} sx={{ px: 0 }}>
//                             <ListItemIcon sx={{ minWidth: 32 }}>
//                               <CheckCircleIcon
//                                 sx={{
//                                   fontSize: 18,
//                                   color: QUOTA_OPTIONS.find(
//                                     (o) => o.value === selectedQuota
//                                   )!.color,
//                                 }}
//                               />
//                             </ListItemIcon>
//                             <ListItemText
//                               primary={feature}
//                               primaryTypographyProps={{ variant: "body2" }}
//                             />
//                           </ListItem>
//                         ))}
//                       </List>
//                     </Box>
//                   </Stack>
//                 </Paper>
//               </Fade>
//             )}
//           </Stack>
//         </DialogContent>

//         <DialogActions sx={{ p: 3, pt: 0 }}>
//           <Button
//             onClick={handleCloseActivationDialog}
//             disabled={isActivating}
//             variant="outlined"
//             sx={{ borderRadius: 2 }}
//           >
//             {t("common.cancel", { defaultValue: "Hủy" })}
//           </Button>
//           <Button
//             variant="contained"
//             onClick={handleConfirmActivation}
//             disabled={!selectedQuota || isActivating}
//             startIcon={
//               isActivating ? (
//                 <CircularProgress size={20} />
//               ) : (
//                 <CheckCircleIcon />
//               )
//             }
//             sx={{
//               borderRadius: 2,
//               minWidth: 120,
//               background: selectedQuota
//                 ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
//                 : undefined,
//               "&:hover": {
//                 background: selectedQuota
//                   ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
//                   : undefined,
//               },
//             }}
//           >
//             {isActivating
//               ? t("common.processing", { defaultValue: "Đang xử lý..." })
//               : t("common.confirm", { defaultValue: "Xác nhận" })}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }
