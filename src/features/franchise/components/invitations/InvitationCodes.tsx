// src/pages/InvitationCodes.tsx
import {
  alpha,
  Box,
  Paper,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UpdateIcon from "@mui/icons-material/Update";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useTheme } from "@mui/material";
import { useEffect, useMemo, useState, Fragment } from "react";
import { useTranslation } from "react-i18next";

import { useFranchise } from "../../hooks/useFranchise";
import type { InvitationCode } from "../../types/franchise.type";

// --- BE mới: packageId mapping ---
const STANDARD_IDS = {
  one_month: "683d1e58d70c0d6366e3d716",
  three_months: "68cbc381bd30e2a1315d2709",
  one_year: "683d2295d70c0d6366e3d741",
} as const;

// --- BE cũ: codeType keys ---
const LEGACY_KEYS = {
  user_trial: "USER_TRIAL",
  franchise_hierarchy: "FRANCHISE_HIERARCHY",
} as const;

// Nhãn hiển thị cho nhóm
const LABEL_BY_KEY: Record<string, string> = {
  [STANDARD_IDS.one_month]: "Dùng thử 1 tháng",
  [STANDARD_IDS.three_months]: "Dùng thử 3 tháng",
  [STANDARD_IDS.one_year]: "Dùng thử 1 năm",
  [LEGACY_KEYS.user_trial]: "Dùng thử (cũ)",
  [LEGACY_KEYS.franchise_hierarchy]: "Mã nhánh hệ thống",
  UNKNOWN: "Không xác định",
};

// ---- helpers: đọc packageId đa biến thể & codeType legacy ----
const extractPackageId = (row: any): string | undefined => {
  return (
    row?.packageId ||
    row?.packageID ||
    row?.package_id ||
    row?.package?._id ||
    row?.package?.id ||
    row?.codePackageId ||
    row?.standardPackageId ||
    row?.planId ||
    row?.pricingPackageId ||
    undefined
  );
};

const extractLegacyCodeType = (row: any): string | undefined => {
  const ct = row?.codeType;
  if (!ct) return undefined;
  if (typeof ct === "string") return ct;
  return ct?.key || ct?.name || undefined;
};

// ✅ key phân loại hiệu dụng: ưu tiên packageId (1/3/12m), sau đó codeType legacy (userTrial / franchiseHierarchy)
const getEffectiveTypeKey = (row?: InvitationCode | string): string => {
  if (!row) return "UNKNOWN";
  if (typeof row === "string") return row;

  const pid = extractPackageId(row);
  if (pid === STANDARD_IDS.one_month) return STANDARD_IDS.one_month;
  if (pid === STANDARD_IDS.three_months) return STANDARD_IDS.three_months;
  if (pid === STANDARD_IDS.one_year) return STANDARD_IDS.one_year;

  const legacy = extractLegacyCodeType(row);
  if (legacy === LEGACY_KEYS.user_trial) return LEGACY_KEYS.user_trial;
  if (legacy === LEGACY_KEYS.franchise_hierarchy)
    return LEGACY_KEYS.franchise_hierarchy;

  return "UNKNOWN";
};

const STATUS_COLORS: Record<string, "success" | "error" | "default"> = {
  active: "success",
  inactive: "error",
  expired: "default",
  used: "default",
};

export default function InvitationCodes() {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    invitationCodes,
    fetchInvitationCodes,
    fetchFranchiseDetails,
    activeCode,
    createStandardOneMonth,
    createStandardThreeMonths,
    createStandardOneYear,
  } = useFranchise();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [sortBy, setSortBy] = useState<keyof InvitationCode>("createdAt");
  const [sortDesc, setSortDesc] = useState(true);

  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);

  useEffect(() => {
    (async () => {
      await fetchInvitationCodes();
      await fetchFranchiseDetails();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔎 DEBUG: in ra các dòng "UNKNOWN" để dò field từ BE
  useEffect(() => {
    const unknowns = (invitationCodes?.data || []).filter(
      (r: any) => getEffectiveTypeKey(r) === "UNKNOWN"
    );
    if (unknowns.length) {
      console.groupCollapsed("🔎 UNKNOWN type items (showing up to 5)");
      unknowns.slice(0, 5).forEach((r: any) => {
        console.log({
          _id: r._id,
          code: r.code,
          // các biến thể packageId
          packageId: r.packageId,
          packageID: r.packageID,
          package_id: r.package_id,
          "package._id": r?.package?._id,
          "package.id": r?.package?.id,
          codePackageId: r.codePackageId,
          standardPackageId: r.standardPackageId,
          planId: r.planId,
          pricingPackageId: r.pricingPackageId,
          // legacy
          codeType: r.codeType,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        });
      });
      console.groupEnd();
    }
  }, [invitationCodes?.data]);

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

  const codeTypeIcon = (key?: string) => {
    switch (key) {
      case STANDARD_IDS.one_month:
        return (
          <CalendarTodayIcon
            sx={{ fontSize: 18, color: theme.palette.warning.main }}
          />
        );
      case STANDARD_IDS.three_months:
        return (
          <UpdateIcon sx={{ fontSize: 18, color: theme.palette.error.main }} />
        );
      case STANDARD_IDS.one_year:
        return (
          <BusinessIcon
            sx={{ fontSize: 18, color: theme.palette.success.main }}
          />
        );
      case LEGACY_KEYS.user_trial:
        return (
          <PersonIcon sx={{ fontSize: 18, color: theme.palette.info.main }} />
        );
      case LEGACY_KEYS.franchise_hierarchy:
        return (
          <BusinessIcon
            sx={{ fontSize: 18, color: theme.palette.success.main }}
          />
        );
      default:
        return <LocalActivityIcon sx={{ fontSize: 18 }} />;
    }
  };

  // ---- Derived data / filters ----
  const rows = useMemo(() => invitationCodes?.data ?? [], [invitationCodes]);

  const typeCounts = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => {
      const key = getEffectiveTypeKey(r);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [rows]);

  const allTypesForFilter = useMemo(() => {
    const keys = Array.from(typeCounts.keys());
    const priority = [
      STANDARD_IDS.one_month,
      STANDARD_IDS.three_months,
      STANDARD_IDS.one_year,
      LEGACY_KEYS.user_trial,
      LEGACY_KEYS.franchise_hierarchy,
    ];
    const prSet = new Set(priority);
    const pr = keys.filter((k) => prSet.has(k));
    const rest = keys
      .filter((k) => !prSet.has(k))
      .sort((a, b) => {
        const la = LABEL_BY_KEY[a] ?? "Không xác định";
        const lb = LABEL_BY_KEY[b] ?? "Không xác định";
        return la.localeCompare(lb, "vi");
      });
    return [...pr, ...rest];
  }, [typeCounts]);

  const filteredSortedRows = useMemo(() => {
    let out = rows.slice();

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter((r) => {
        const typeLabel =
          LABEL_BY_KEY[getEffectiveTypeKey(r)] ?? "Không xác định";
        return (
          r.code?.toLowerCase().includes(q) ||
          typeLabel.toLowerCase().includes(q) ||
          (r.status || "").toLowerCase().includes(q)
        );
      });
    }

    if (statusFilter !== "all") {
      out = out.filter((r) => (r.status || "").toLowerCase() === statusFilter);
    }

    if (typeFilter !== "all") {
      out = out.filter((r) => getEffectiveTypeKey(r) === typeFilter);
    }

    out.sort((a: any, b: any) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      let cmp = 0;

      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        cmp = new Date(av || 0).getTime() - new Date(bv || 0).getTime();
      } else if (sortBy === "status" || sortBy === "code") {
        cmp = String(av || "").localeCompare(String(bv || ""), "vi");
      } else {
        const na = Number(av ?? 0);
        const nb = Number(bv ?? 0);
        cmp = na - nb;
      }

      return sortDesc ? -cmp : cmp;
    });

    return out;
  }, [rows, search, statusFilter, typeFilter, sortBy, sortDesc]);

  // --------- Group by type (header phụ) ----------
  type Group = { key: string; label: string; items: InvitationCode[] };

  const allGroups = useMemo<Group[]>(() => {
    const map = new Map<string, InvitationCode[]>();
    filteredSortedRows.forEach((r) => {
      const k = getEffectiveTypeKey(r);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    });

    const orderIndex = new Map<string, number>();
    filteredSortedRows.forEach((r, i) => orderIndex.set(r._id as string, i));

    const groups: Group[] = Array.from(map.entries()).map(([key, items]) => ({
      key,
      label: LABEL_BY_KEY[key] ?? "Không xác định",
      items: items.sort(
        (a, b) => orderIndex.get(a._id!)! - orderIndex.get(b._id!)!
      ),
    }));

    const order: Record<string, number> = {
      [STANDARD_IDS.one_month]: 1,
      [STANDARD_IDS.three_months]: 2,
      [STANDARD_IDS.one_year]: 3,
      [LEGACY_KEYS.user_trial]: 4,
      [LEGACY_KEYS.franchise_hierarchy]: 5,
      UNKNOWN: 999,
    };
    groups.sort((a, b) => {
      const oa = order[a.key] ?? 998;
      const ob = order[b.key] ?? 998;
      if (oa !== ob) return oa - ob;
      return a.label.localeCompare(b.label, "vi");
    });

    return groups;
  }, [filteredSortedRows]);

  // --------- Pagination theo groups (không xé lẻ) ----------
  const groupPages = useMemo(() => {
    const pages: Group[][] = [];
    let current: Group[] = [];
    let budget = rowsPerPage;

    const flush = () => {
      if (current.length) {
        pages.push(current);
        current = [];
        budget = rowsPerPage;
      }
    };

    for (const g of allGroups) {
      const size = g.items.length;

      if (size <= budget) {
        current.push(g);
        budget -= size;
      } else {
        if (size <= rowsPerPage) {
          flush();
          current.push(g);
          budget = rowsPerPage - size;
        } else {
          flush();
          pages.push([g]); // group lớn đứng 1 trang riêng
        }
      }
    }
    flush();
    return pages;
  }, [allGroups, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter, typeFilter, rowsPerPage, sortBy, sortDesc]);

  const currentPageGroups = groupPages[page] || [];

  const handleSort = (key: keyof InvitationCode) => {
    if (sortBy === key) setSortDesc((s) => !s);
    else {
      setSortBy(key);
      setSortDesc(true);
    }
  };

  const toggleGroup = (key: string) =>
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const codeTypeLabelByRow = (row?: InvitationCode) => {
    if (!row) return "—";
    const key = getEffectiveTypeKey(row);
    return LABEL_BY_KEY[key] ?? "Không xác định";
  };

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
            {t("franchise.invitations.title", { defaultValue: "Mã mời" })}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("franchise.invitations.subtitle", {
              defaultValue:
                "Nhóm theo packageId (1/3/12 tháng) & codeType (cũ)",
            })}
          </Typography>
        </Box>
      </Stack>

      {/* Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <TextField
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("common.search", { defaultValue: "Tìm kiếm..." })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>
                {t("common.status.label", { defaultValue: "Trạng thái" })}
              </InputLabel>
              <Select
                label={t("common.status.label", { defaultValue: "Trạng thái" })}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">
                  {t("common.all", { defaultValue: "Tất cả" })}
                </MenuItem>
                <MenuItem value="active">
                  {t("common.status.active", {
                    defaultValue: "Đang hoạt động",
                  })}
                </MenuItem>
                <MenuItem value="inactive">
                  {t("common.status.inactive", {
                    defaultValue: "Không hoạt động",
                  })}
                </MenuItem>
                <MenuItem value="expired">
                  {t("common.status.expired", { defaultValue: "Hết hạn" })}
                </MenuItem>
                <MenuItem value="used">
                  {t("common.status.used", { defaultValue: "Đã dùng" })}
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>
                {t("franchise.invitations.type", { defaultValue: "Loại mã" })}
              </InputLabel>
              <Select
                label={t("franchise.invitations.type", {
                  defaultValue: "Loại mã",
                })}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="all">
                  {t("common.all", { defaultValue: "Tất cả" })}
                </MenuItem>
                {Array.from(typeCounts.keys()).map((tp) => (
                  <MenuItem key={tp} value={tp}>
                    {LABEL_BY_KEY[tp] ?? "Không xác định"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Tooltip title={t("common.refresh", { defaultValue: "Làm mới" })}>
              <IconButton onClick={fetchInvitationCodes}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            {/* Tạo nhanh 1m/3m/1y */}
            <Button
              variant="outlined"
              sx={{ textTransform: "none" }}
              onClick={createStandardOneMonth}
            >
              Tạo 1 tháng
            </Button>
            <Button
              variant="outlined"
              sx={{ textTransform: "none" }}
              onClick={createStandardThreeMonths}
            >
              Tạo 3 tháng
            </Button>
            <Button
              variant="outlined"
              sx={{ textTransform: "none" }}
              onClick={createStandardOneYear}
            >
              Tạo 1 năm
            </Button>

            <Tooltip
              title={t("common.export", { defaultValue: "Xuất dữ liệu" })}
            >
              <span>
                <IconButton disabled>
                  <DownloadIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              variant="contained"
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              onClick={handleActiveCode}
            >
              {t("franchise.invitations.activate.btn", {
                defaultValue: "Kích hoạt mã mới",
              })}
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {Array.from(typeCounts.keys()).map((tp) => (
            <Chip
              key={tp}
              icon={codeTypeIcon(tp)}
              label={`${LABEL_BY_KEY[tp] ?? "Không xác định"} • ${
                typeCounts.get(tp) ?? 0
              }`}
              onClick={() => setTypeFilter(tp)}
              variant={typeFilter === tp ? "filled" : "outlined"}
              color={typeFilter === tp ? "primary" : "default"}
              sx={{ mr: 0.5 }}
            />
          ))}
          {!!rows.length && (
            <Chip
              label={`${t("common.all", { defaultValue: "Tất cả" })} • ${
                rows.length
              }`}
              onClick={() => setTypeFilter("all")}
              variant={typeFilter === "all" ? "filled" : "outlined"}
              color={typeFilter === "all" ? "primary" : "default"}
            />
          )}
        </Stack>
      </Paper>

      {/* Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
        }}
      >
        {invitationCodes?.loading ? (
          <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 680 }}>
              <Table
                stickyHeader
                size="small"
                aria-label="invitation-codes-table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      onClick={() => handleSort("code")}
                      sx={{ cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      {t("franchise.invitations.table.code", {
                        defaultValue: "Mã",
                      })}
                      {sortBy === "code" ? (sortDesc ? " ↓" : " ↑") : ""}
                    </TableCell>
                    <TableCell sx={{ minWidth: 220 }}>
                      {t("franchise.invitations.table.type", {
                        defaultValue: "Loại mã",
                      })}
                    </TableCell>
                    <TableCell
                      onClick={() => handleSort("status")}
                      sx={{ cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      {t("franchise.invitations.table.status", {
                        defaultValue: "Trạng thái",
                      })}
                      {sortBy === "status" ? (sortDesc ? " ↓" : " ↑") : ""}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      {t("franchise.invitations.stats.usage", {
                        defaultValue: "Lượt dùng thực tế",
                      })}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      {t("franchise.invitations.stats.total", {
                        defaultValue: "Tổng tích luỹ",
                      })}
                    </TableCell>
                    <TableCell
                      onClick={() => handleSort("createdAt")}
                      sx={{ cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      {t("common.createdAt", { defaultValue: "Tạo lúc" })}
                      {sortBy === "createdAt" ? (sortDesc ? " ↓" : " ↑") : ""}
                    </TableCell>
                    <TableCell
                      onClick={() => handleSort("updatedAt")}
                      sx={{ cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      {t("common.updatedAt", { defaultValue: "Cập nhật" })}
                      {sortBy === "updatedAt" ? (sortDesc ? " ↓" : " ↑") : ""}
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      {t("common.actions", { defaultValue: "Thao tác" })}
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredSortedRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">
                          {t("common.noData", {
                            defaultValue: "Không có dữ liệu",
                          })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {filteredSortedRows.length > 0 &&
                    (() => {
                      const pageGroups = groupPages[page] || [];
                      return pageGroups.map((g) => {
                        const isCollapsed = !!collapsedGroups[g.key];
                        return (
                          <Fragment key={`grp-${g.key}`}>
                            {/* Group header */}
                            <TableRow
                              sx={{
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.06
                                ),
                                position: "sticky",
                                top: 56,
                                zIndex: 1,
                              }}
                            >
                              <TableCell colSpan={8} sx={{ py: 1 }}>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1.5}
                                  justifyContent="space-between"
                                >
                                  <Stack
                                    direction="row"
                                    spacing={1.5}
                                    alignItems="center"
                                  >
                                    {codeTypeIcon(g.key)}
                                    <Typography fontWeight={700}>
                                      {g.label} • {g.items.length}
                                    </Typography>
                                  </Stack>
                                  <IconButton
                                    size="small"
                                    onClick={() => toggleGroup(g.key)}
                                  >
                                    {isCollapsed ? (
                                      <ExpandMoreIcon />
                                    ) : (
                                      <ExpandLessIcon />
                                    )}
                                  </IconButton>
                                </Stack>
                              </TableCell>
                            </TableRow>

                            {!isCollapsed &&
                              g.items.map((r) => {
                                const status = (r.status || "").toLowerCase();
                                const color =
                                  STATUS_COLORS[status] || "default";
                                const usage =
                                  r.statistics?.actualUsageCount ?? 0;
                                const total =
                                  r.totalCumulativeUses ??
                                  r.statistics?.totalCumulativeUses ??
                                  0;

                                return (
                                  <TableRow hover key={r._id}>
                                    <TableCell
                                      sx={{
                                        fontFamily: "monospace",
                                        fontWeight: 700,
                                      }}
                                    >
                                      <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                      >
                                        <Typography component="span">
                                          {r.code}
                                        </Typography>
                                        <Tooltip
                                          title={
                                            copiedCode === r.code
                                              ? t("common.copied", {
                                                  defaultValue: "Đã sao chép",
                                                })
                                              : t("common.copy", {
                                                  defaultValue: "Sao chép",
                                                })
                                          }
                                        >
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              handleCopyCode(r.code)
                                            }
                                            sx={{
                                              color:
                                                copiedCode === r.code
                                                  ? theme.palette.success.main
                                                  : theme.palette.text
                                                      .secondary,
                                            }}
                                          >
                                            <ContentCopyIcon fontSize="inherit" />
                                          </IconButton>
                                        </Tooltip>
                                      </Stack>
                                    </TableCell>

                                    <TableCell>
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                      >
                                        {codeTypeIcon(getEffectiveTypeKey(r))}
                                        <Typography>
                                          {codeTypeLabelByRow(r)}
                                        </Typography>
                                      </Stack>
                                    </TableCell>

                                    <TableCell>
                                      <Chip
                                        size="small"
                                        icon={
                                          status === "active" ? (
                                            <CheckCircleIcon />
                                          ) : (
                                            <ErrorIcon />
                                          )
                                        }
                                        label={
                                          status === "active"
                                            ? t("common.status.active", {
                                                defaultValue: "Đang hoạt động",
                                              })
                                            : status === "inactive"
                                            ? t("common.status.inactive", {
                                                defaultValue: "Không hoạt động",
                                              })
                                            : status === "expired"
                                            ? t("common.status.expired", {
                                                defaultValue: "Hết hạn",
                                              })
                                            : t("common.status.used", {
                                                defaultValue: "Đã dùng",
                                              })
                                        }
                                        color={color}
                                        variant={
                                          color === "default"
                                            ? "outlined"
                                            : "filled"
                                        }
                                      />
                                    </TableCell>

                                    <TableCell align="right">{usage}</TableCell>
                                    <TableCell align="right">{total}</TableCell>
                                    <TableCell>
                                      {formatDate(r.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                      {formatDate(r.updatedAt)}
                                    </TableCell>

                                    <TableCell>
                                      <Tooltip
                                        title={t("common.copy", {
                                          defaultValue: "Sao chép",
                                        })}
                                      >
                                        <IconButton
                                          size="small"
                                          onClick={() => handleCopyCode(r.code)}
                                        >
                                          <ContentCopyIcon fontSize="inherit" />
                                        </IconButton>
                                      </Tooltip>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                          </Fragment>
                        );
                      });
                    })()}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Footer */}
            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {t("common.total", { defaultValue: "Tổng" })}:{" "}
                  <b>{filteredSortedRows.length}</b>
                </Typography>
                <FormControl size="small">
                  <InputLabel id="rpp-label">
                    {t("common.rowsPerPage", { defaultValue: "Số dòng/trang" })}
                  </InputLabel>
                  <Select
                    labelId="rpp-label"
                    label={t("common.rowsPerPage", {
                      defaultValue: "Số dòng/trang",
                    })}
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    sx={{ minWidth: 140 }}
                  >
                    {[10, 25, 50, 100].map((n) => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Pagination
                count={Math.max(groupPages.length, 1)}
                page={Math.min(page + 1, Math.max(groupPages.length, 1))}
                onChange={(_, p1) => setPage(p1 - 1)}
                color="primary"
                shape="rounded"
                siblingCount={1}
                boundaryCount={1}
              />
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
