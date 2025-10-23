import React, { Fragment, useMemo, useState } from "react";
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
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  FormControl,
  Select,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  TableSortLabel,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UpdateIcon from "@mui/icons-material/Update";
import BusinessIcon from "@mui/icons-material/Business";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useTheme } from "@mui/material";
import { useFranchise } from "../../hooks/useFranchise";
import type { InvitationCode } from "../../types/franchise.type";

/* ======================== CONFIG ======================== */
const PACKAGE_ALIASES = {
  one_month: new Set<string>([
    "683d1e58d70c0d6366e3d716",
    "68c130aeac8838b6adad4999",
  ]),
  three_months: new Set<string>([
    "68cbc381bd30e2a1315d2709",
    "68ca2c621ca7334cd3e44d15",
  ]),
  one_year: new Set<string>(["683d2295d70c0d6366e3d741"]),
} as const;

const ORDER: Array<keyof typeof PACKAGE_ALIASES> = [
  "one_month",
  "three_months",
  "one_year",
];

const GROUP_LABEL: Record<keyof typeof PACKAGE_ALIASES, string> = {
  one_month: "Dùng thử 1 tháng",
  three_months: "Dùng thử 3 tháng",
  one_year: "Dùng thử 1 năm",
};

const KIND_LABEL: Record<keyof typeof PACKAGE_ALIASES, string> = {
  one_month: "Tạo 1 tháng",
  three_months: "Tạo 3 tháng",
  one_year: "Tạo 1 năm",
};

const STATUS_MAP: Record<
  string,
  {
    color: "success" | "warning" | "error" | "default";
    icon: React.ReactElement;
  }
> = {
  active: { color: "success", icon: <CheckCircleIcon fontSize="inherit" /> },
  inactive: { color: "error", icon: <DoNotDisturbIcon fontSize="inherit" /> },
  expired: { color: "default", icon: <HourglassTopIcon fontSize="inherit" /> },
  used: { color: "default", icon: <HourglassTopIcon fontSize="inherit" /> },
  deleted: { color: "error", icon: <DeleteForeverIcon fontSize="inherit" /> },
  default: { color: "default", icon: <HourglassTopIcon fontSize="inherit" /> },
};

function CodeTypeIcon({ group }: { group: keyof typeof PACKAGE_ALIASES }) {
  const theme = useTheme();
  if (group === "one_month") {
    return (
      <CalendarTodayIcon
        sx={{ fontSize: 18, color: theme.palette.warning.main }}
      />
    );
  }
  if (group === "three_months") {
    return (
      <UpdateIcon sx={{ fontSize: 18, color: theme.palette.error.main }} />
    );
  }
  return (
    <BusinessIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
  );
}

const formatDate = (d?: string) =>
  d
    ? new Date(d).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

const resolveGroupByPackageId = (
  pkgId?: string
): keyof typeof PACKAGE_ALIASES | null => {
  if (!pkgId) return null;
  for (const key of ORDER) if (PACKAGE_ALIASES[key].has(pkgId)) return key;
  return null;
};

/* ======================== TRANSITION (không lỗi type) ======================== */
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/* ======================== MAIN ======================== */
type Kind = keyof typeof PACKAGE_ALIASES;
type KindOrAll = Kind | "all";
type StatusFilter = "all" | "active" | "deleted";
type SortField = "createdAt" | "updatedAt";
type SortDir = "asc" | "desc";

export default function InvitationCodes() {
  const theme = useTheme();
  const {
    invitationCodes,
    fetchInvitationCodes,
    createStandardOneMonth,
    createStandardThreeMonths,
    createStandardOneYear,
  } = useFranchise();

  // (Optional) BE methods if available in your hook
  const anyFranchise = useFranchise() as any;
  const updateInvitationStatus:
    | undefined
    | ((id: string, status: string) => Promise<any>) =
    anyFranchise.updateInvitationStatus;
  const deleteInvitationCode: undefined | ((id: string) => Promise<any>) =
    anyFranchise.deleteInvitationCode;

  // Filters / search
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<KindOrAll>("all");
  const handleTypeFilter = (e: SelectChangeEvent<KindOrAll>) =>
    setTypeFilter(e.target.value as KindOrAll);

  // NEW
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Loading for create
  const [loadingOne, setLoadingOne] = useState(false);
  const [loadingThree, setLoadingThree] = useState(false);
  const [loadingYear, setLoadingYear] = useState(false);

  // UX
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error" | "info";
  }>({ open: false, msg: "", sev: "success" });

  // Select rows for export
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const isSelected = (id: string) => selectedIds.has(id);
  const clearSelection = () => setSelectedIds(new Set());
  const toggleRow = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAllOnPage = (ids: string[]) =>
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });

  // Create dialog (2-step)
  const [createDlg, setCreateDlg] = useState<{
    open: boolean;
    step: "form" | "confirm";
    kind: Kind | null;
    qtyText: string;
  }>({ open: false, step: "form", kind: null, qtyText: "1" });

  const openCreate = (kind: Kind) =>
    setCreateDlg({ open: true, step: "form", kind, qtyText: "1" });
  const closeCreate = () => setCreateDlg((s) => ({ ...s, open: false }));
  const goConfirm = () => setCreateDlg((s) => ({ ...s, step: "confirm" }));
  const handleQtyInput = (v: string) => {
    if (v === "") return setCreateDlg((s) => ({ ...s, qtyText: "" }));
    if (/^\d{1,4}$/.test(v)) {
      const n = Math.min(1000, parseInt(v, 10) || 0);
      setCreateDlg((s) => ({ ...s, qtyText: String(n) }));
    }
  };
  const parsedQty = Math.min(
    1000,
    Math.max(1, parseInt(createDlg.qtyText || "0", 10) || 0)
  );
  const isQtyValid =
    createDlg.qtyText !== "" && parsedQty >= 1 && parsedQty <= 1000;

  // Confirm dialog for inline actions
  const [actDlg, setActDlg] = useState<{
    open: boolean;
    type: "activate" | "delete";
    row: InvitationCode | null;
    loading: boolean;
  }>({ open: false, type: "activate", row: null, loading: false });
  const askActivate = (row: InvitationCode) =>
    setActDlg({ open: true, type: "activate", row, loading: false });
  const askDelete = (row: InvitationCode) =>
    setActDlg({ open: true, type: "delete", row, loading: false });

  const doPerformAction = async () => {
    if (!actDlg.row) return;
    setActDlg((s) => ({ ...s, loading: true }));
    try {
      if (actDlg.type === "activate") {
        if (updateInvitationStatus) {
          await updateInvitationStatus(actDlg.row._id, "active");
          setSnack({ open: true, msg: "Đã kích hoạt mã", sev: "success" });
          await fetchInvitationCodes();
        } else {
          setSnack({
            open: true,
            msg: "UI kích hoạt (chưa nối API)",
            sev: "info",
          });
        }
      } else {
        if (deleteInvitationCode) {
          await deleteInvitationCode(actDlg.row._id);
          setSnack({ open: true, msg: "Đã xoá mã mời", sev: "success" });
          await fetchInvitationCodes();
        } else {
          setSnack({ open: true, msg: "UI xoá (chưa nối API)", sev: "info" });
        }
      }
    } catch (e: any) {
      setSnack({
        open: true,
        msg: e?.message || "Thao tác thất bại",
        sev: "error",
      });
    } finally {
      setActDlg((s) => ({ ...s, loading: false, open: false }));
    }
  };

  // Export Excel / CSV (CDN SheetJS, không cần cài package)
  const exportExcel = async (list: InvitationCode[]) => {
    const rows = list.map((r) => {
      const g = resolveGroupByPackageId(r.packageId);
      return {
        Code: r.code,
        "Loại mã": g ? GROUP_LABEL[g] : "",
        "Trạng thái": r.status || "",
        "Tạo lúc": formatDate(r.createdAt),
        "Cập nhật": formatDate(r.updatedAt),
      };
    });

    try {
      // Thay thế phần import động bằng:
      const XLSX: any = await import("xlsx");

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "InvitationCodes");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `invitation-codes_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.xlsx`;
      a.click();
      URL.revokeObjectURL(a.href);
      setSnack({ open: true, msg: "Đã xuất Excel", sev: "success" });
    } catch {
      // Fallback CSV
      const header = Object.keys(rows[0] || {}).join(",");
      const body = rows
        .map((r) =>
          Object.values(r)
            .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");
      const csv = header + "\n" + body;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `invitation-codes_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
      setSnack({ open: true, msg: "Đã xuất CSV (fallback)", sev: "info" });
    }
  };

  // Data
  const loadingTable = invitationCodes.loading;
  const allRows = (invitationCodes.data ?? []) as InvitationCode[];

  // Filter + search (thêm lọc trạng thái)
  const filteredRows = useMemo(() => {
    let out = allRows
      .map((r) => ({ r, g: resolveGroupByPackageId(r.packageId) }))
      .filter(
        (x): x is { r: InvitationCode; g: keyof typeof PACKAGE_ALIASES } =>
          x.g !== null
      );

    if (typeFilter !== "all") out = out.filter(({ g }) => g === typeFilter);

    if (statusFilter !== "all") {
      out = out.filter(({ r }) => {
        const s = (r.status || "").toLowerCase();
        if (statusFilter === "active") return s === "active";
        if (statusFilter === "deleted")
          return s === "deleted" || (r as any).isDeleted === true;
        return true;
      });
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(
        ({ r, g }) =>
          r.code.toLowerCase().includes(q) ||
          GROUP_LABEL[g].toLowerCase().includes(q) ||
          (r.status || "").toLowerCase().includes(q)
      );
    }
    return out;
  }, [allRows, search, typeFilter, statusFilter]);

  // Grouping + sort (dựa trên lựa chọn ở header)
  const groups = useMemo(() => {
    const map = new Map<keyof typeof PACKAGE_ALIASES, InvitationCode[]>();
    for (const { r, g } of filteredRows) {
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(r);
    }
    for (const [k, list] of map) {
      list.sort((a, b) => {
        const ta = new Date((a as any)[sortField] || 0).getTime();
        const tb = new Date((b as any)[sortField] || 0).getTime();
        return sortDir === "desc" ? tb - ta : ta - tb;
      });
      map.set(k, list);
    }
    return ORDER.filter((k) => map.has(k)).map(
      (k) => [k, map.get(k)!] as const
    );
  }, [filteredRows, sortField, sortDir]);

  // Helpers for header visuals
  const isDark = theme.palette.mode === "dark";
  const headerBorder = isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.08)";
  const groupHeaderBg = isDark
    ? alpha(theme.palette.primary.light, 0.12)
    : alpha(theme.palette.primary.main, 0.06);

  const flatFilteredIds = filteredRows.map(({ r }) => r._id);

  // Copy code
  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1200);
    } catch {
      setSnack({ open: true, msg: "Sao chép thất bại", sev: "error" });
    }
  };

  // Create
  const doCreate = async (
    kind: Kind,
    qty: number,
    setLoading: (v: boolean) => void
  ) => {
    const n = Math.max(1, Math.min(1000, Number(qty) || 0));
    setLoading(true);
    try {
      let created = 0;
      if (kind === "one_month") {
        const res = await createStandardOneMonth(n);
        created = Array.isArray(res?.data) ? res.data.length : 0;
      }
      if (kind === "three_months") {
        const res = await createStandardThreeMonths(n);
        created = Array.isArray(res?.data) ? res.data.length : 0;
      }
      if (kind === "one_year") {
        const res = await createStandardOneYear(n);
        created = Array.isArray(res?.data) ? res.data.length : 0;
      }
      setSnack({
        open: true,
        msg: created > 0 ? `Đã tạo ${created} mã` : "Đã tạo mã",
        sev: "success",
      });
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message || "Lỗi tạo mã", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  const mapSetLoading: Record<Kind, (v: boolean) => void> = {
    one_month: setLoadingOne,
    three_months: setLoadingThree,
    one_year: setLoadingYear,
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Paper
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          backgroundImage: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.08
          )}, ${alpha(theme.palette.primary.dark, 0.06)})`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
        elevation={0}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "14px",
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              display: "grid",
              placeItems: "center",
            }}
          >
            <LocalActivityIcon
              sx={{ color: theme.palette.primary.main, fontSize: 26 }}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
              Quản lý mã mời
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Theo thời hạn: 1 tháng • 3 tháng • 1 năm
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            {/* Export selected */}
            <Tooltip title="Xuất các mã đã chọn">
              <span>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  color="primary"
                  disabled={selectedIds.size === 0}
                  onClick={() => {
                    const map = new Map(allRows.map((r) => [r._id, r]));
                    const picked = [...selectedIds]
                      .map((id) => map.get(id)!)
                      .filter(Boolean);
                    exportExcel(picked);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  Xuất đã chọn ({selectedIds.size})
                </Button>
              </span>
            </Tooltip>

            {/* Export all (filtered) */}
            <Tooltip title="Xuất Excel (ưu tiên) / CSV (fallback)">
              <span>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => exportExcel(filteredRows.map((x) => x.r))}
                  disabled={filteredRows.length === 0}
                  sx={{ borderRadius: 2 }}
                >
                  Xuất tất cả
                </Button>
              </span>
            </Tooltip>

            {/* Refresh */}
            <Tooltip title="Làm mới danh sách">
              <span>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => fetchInvitationCodes()}
                  disabled={loadingTable}
                  sx={{ borderRadius: 2 }}
                >
                  {loadingTable ? "Đang tải..." : "Làm mới"}
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Toolbar tạo mã */}
      <Paper
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
        }}
        elevation={0}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            flexWrap: { xs: "nowrap" },
            overflowX: "auto",
            gap: 1.5,
            "& .MuiButton-root": {
              height: 38,
              borderRadius: 8,
              minWidth: 120,
              px: 1.5,
              flexShrink: 0,
            },
            "& .MuiInputBase-root": { height: 38 },
          }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã, nhóm, trạng thái…"
            sx={{ flex: 1, minWidth: 200, mr: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl
            size="small"
            sx={{
              width: 180,
              flexShrink: 0,
              "& .MuiOutlinedInput-root": { borderRadius: 8, px: 1 },
            }}
          >
            <Select
              value={typeFilter}
              onChange={handleTypeFilter}
              displayEmpty
              renderValue={(val) =>
                val === "all" ? (
                  <span style={{ opacity: 0.8 }}>Tất cả loại mã</span>
                ) : val === "one_month" ? (
                  "Dùng thử 1 tháng"
                ) : val === "three_months" ? (
                  "Dùng thử 3 tháng"
                ) : (
                  "Dùng thử 1 năm"
                )
              }
            >
              <MenuItem value="all">
                <em>Tất cả loại mã</em>
              </MenuItem>
              <MenuItem value="one_month">Dùng thử 1 tháng</MenuItem>
              <MenuItem value="three_months">Dùng thử 3 tháng</MenuItem>
              <MenuItem value="one_year">Dùng thử 1 năm</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openCreate("one_month")}
          >
            1 tháng
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => openCreate("three_months")}
          >
            3 tháng
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => openCreate("one_year")}
          >
            1 năm
          </Button>
        </Stack>
      </Paper>

      {/* === Table === */}
      <Paper
        sx={{
          position: "relative",
          borderRadius: 3,
          border: `1px solid ${headerBorder}`,
          overflow: "hidden",
          background: isDark ? alpha("#ffffff", 0.02) : undefined,
        }}
        elevation={0}
      >
        <TableContainer sx={{ maxHeight: 680 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  padding="checkbox"
                  width={48}
                  sx={{ bgcolor: "background.paper" }}
                >
                  <Checkbox
                    indeterminate={
                      selectedIds.size > 0 &&
                      selectedIds.size < flatFilteredIds.length
                    }
                    checked={
                      flatFilteredIds.length > 0 &&
                      flatFilteredIds.every((id) => selectedIds.has(id))
                    }
                    onChange={() => toggleAllOnPage(flatFilteredIds)}
                  />
                </TableCell>

                <TableCell width={260} sx={{ bgcolor: "background.paper" }}>
                  Mã
                </TableCell>
                <TableCell width={240} sx={{ bgcolor: "background.paper" }}>
                  Loại mã
                </TableCell>

                {/* Cột Trạng thái + Chip-Select cùng hàng */}
                <TableCell
                  width={220}
                  sx={{
                    bgcolor: "background.paper",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Trạng thái
                  </Typography>

                  <FormControl size="small" sx={{ minWidth: 0 }}>
                    <Select
                      value={statusFilter}
                      onChange={(e: SelectChangeEvent<StatusFilter>) =>
                        setStatusFilter(e.target.value as StatusFilter)
                      }
                      displayEmpty
                      renderValue={(val) => (
                        <Chip
                          size="small"
                          label={val === "all" ? "Tất cả" : String(val)}
                          sx={{ height: 22, borderRadius: 2 }}
                        />
                      )}
                      sx={{
                        "& .MuiSelect-select": { p: 0 },
                        minWidth: 80,
                        ".MuiOutlinedInput-notchedOutline": { display: "none" },
                        bgcolor: "transparent",
                      }}
                      IconComponent={() => null}
                    >
                      <MenuItem value="all">
                        <em>Tất cả</em>
                      </MenuItem>
                      <MenuItem value="active">active</MenuItem>
                      <MenuItem value="deleted">deleted</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>

                <TableCell width={180} sx={{ bgcolor: "background.paper" }}>
                  <TableSortLabel
                    active={sortField === "createdAt"}
                    direction={sortField === "createdAt" ? sortDir : "desc"}
                    onClick={() => {
                      setSortField("createdAt");
                      setSortDir((d) =>
                        sortField === "createdAt"
                          ? d === "desc"
                            ? "asc"
                            : "desc"
                          : "desc"
                      );
                    }}
                  >
                    Tạo lúc
                  </TableSortLabel>
                </TableCell>
                <TableCell width={180} sx={{ bgcolor: "background.paper" }}>
                  <TableSortLabel
                    active={sortField === "updatedAt"}
                    direction={sortField === "updatedAt" ? sortDir : "desc"}
                    onClick={() => {
                      setSortField("updatedAt");
                      setSortDir((d) =>
                        sortField === "updatedAt"
                          ? d === "desc"
                            ? "asc"
                            : "desc"
                          : "desc"
                      );
                    }}
                  >
                    Cập nhật
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {groups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography>Không có mã phù hợp</Typography>
                  </TableCell>
                </TableRow>
              )}

              {groups.map(([group, items]) => (
                <Fragment key={group}>
                  <TableRow
                    sx={{
                      background: groupHeaderBg,
                      "& td": { borderBottom: "none" },
                    }}
                  >
                    <TableCell colSpan={6}>
                      <Stack direction="row" alignItems="center" spacing={1.25}>
                        <CodeTypeIcon group={group} />
                        <Typography fontWeight={800}>
                          {GROUP_LABEL[group]}
                        </Typography>
                        <Chip label={items.length} size="small" />
                      </Stack>
                    </TableCell>
                  </TableRow>

                  {items.map((r) => {
                    const statusKey = (r.status || "").toLowerCase();
                    const status =
                      STATUS_MAP[statusKey] || STATUS_MAP["default"];
                    return (
                      <TableRow hover key={r._id}>
                        {/* Checkbox từng dòng */}
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected(r._id)}
                            onChange={() => toggleRow(r._id)}
                          />
                        </TableCell>

                        {/* CODE + COPY + EXPORT 1 dòng */}
                        <TableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Box
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                display: "inline-flex",
                                alignItems: "center",
                                bgcolor: isDark ? "#0b1220" : "rgba(0,0,0,.04)",
                                border: `1px solid ${
                                  isDark ? "#475569" : "rgba(0,0,0,.14)"
                                }`,
                                color: "#fff",
                                fontFamily:
                                  "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace",
                                fontWeight: 800,
                                letterSpacing: 0.25,
                                textShadow: "0 1px 0 rgba(0,0,0,.6)",
                              }}
                            >
                              {r.code}
                            </Box>

                            <Tooltip
                              title={
                                copiedCode === r.code
                                  ? "Đã sao chép"
                                  : "Sao chép"
                              }
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleCopy(r.code)}
                              >
                                <ContentCopyIcon fontSize="inherit" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Xuất mã này">
                              <IconButton
                                size="small"
                                onClick={() => exportExcel([r])}
                              >
                                <FileDownloadIcon fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>

                        {/* Nhóm */}
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <CodeTypeIcon group={group} />
                            <Typography variant="body2">
                              {GROUP_LABEL[group]}
                            </Typography>
                          </Stack>
                        </TableCell>

                        {/* Trạng thái + select hành động */}
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.25}
                            alignItems="center"
                          >
                            <Chip
                              size="small"
                              icon={status?.icon}
                              label={r.status}
                              color={status?.color}
                              variant="outlined"
                              sx={{ flexShrink: 0 }}
                            />

                            <FormControl size="small" sx={{ minWidth: 140 }}>
                              <Select
                                value=""
                                displayEmpty
                                onChange={(e) => {
                                  const val = e.target.value as
                                    | "activate"
                                    | "delete"
                                    | "";
                                  if (val === "activate") askActivate(r);
                                  if (val === "delete") askDelete(r);
                                  (e.target as HTMLInputElement).blur();
                                }}
                                renderValue={() => (
                                  <span style={{ opacity: 0.8 }}>
                                    Chọn thao tác…
                                  </span>
                                )}
                              >
                                <MenuItem value="activate">
                                  <ListItemIcon>
                                    <TaskAltIcon fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary="Kích hoạt (active)" />
                                </MenuItem>
                                <MenuItem
                                  value="delete"
                                  sx={{ color: "error.main" }}
                                >
                                  <ListItemIcon sx={{ color: "error.main" }}>
                                    <DeleteForeverIcon fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary="Xóa mã" />
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Stack>
                        </TableCell>

                        <TableCell>{formatDate(r.createdAt)}</TableCell>
                        <TableCell>{formatDate(r.updatedAt)}</TableCell>
                      </TableRow>
                    );
                  })}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog xác nhận Activate/Delete */}
      <Dialog
        open={actDlg.open}
        onClose={() => setActDlg((s) => ({ ...s, open: false }))}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Transition}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {actDlg.type === "activate" ? "Kích hoạt mã" : "Xóa mã mời"}
        </DialogTitle>
        <DialogContent dividers>
          {actDlg.type === "activate" ? (
            <Alert severity="info" variant="outlined">
              Xác nhận <b>kích hoạt</b> mã: <b>{actDlg.row?.code}</b>?
            </Alert>
          ) : (
            <Alert severity="warning" variant="outlined">
              Bạn chắc chắn muốn <b>xóa</b> mã: <b>{actDlg.row?.code}</b>?<br />
              Hành động này không thể hoàn tác.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setActDlg((s) => ({ ...s, open: false }))}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color={actDlg.type === "activate" ? "primary" : "error"}
            onClick={doPerformAction}
            disabled={actDlg.loading}
          >
            {actDlg.loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Xác nhận"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog tạo mã (Form → Confirm) */}
      <Dialog
        open={createDlg.open}
        onClose={closeCreate}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Transition}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {createDlg.step === "form"
            ? createDlg.kind
              ? KIND_LABEL[createDlg.kind]
              : "Tạo mã"
            : "Xác nhận tạo mã"}
        </DialogTitle>

        {createDlg.step === "form" ? (
          <DialogContent dividers>
            <Stack spacing={2}>
              <TextField
                autoFocus
                label="Số lượng mã"
                placeholder="Nhập số (1–1000)"
                value={createDlg.qtyText}
                inputMode="numeric"
                onChange={(e) => handleQtyInput(e.target.value)}
                error={!isQtyValid && createDlg.qtyText !== ""}
                helperText={
                  !isQtyValid && createDlg.qtyText !== ""
                    ? "Vui lòng nhập số 1–1000"
                    : "Giới hạn 1–1000"
                }
              />
              <Alert severity="info" variant="outlined">
                Bạn sắp tạo <b>{parsedQty}</b> mã cho{" "}
                <b>{createDlg.kind ? GROUP_LABEL[createDlg.kind] : "-"}</b>.
              </Alert>
            </Stack>
          </DialogContent>
        ) : (
          <DialogContent dividers>
            <Alert severity="warning" variant="outlined">
              Xác nhận tạo <b>{parsedQty}</b> mã cho{" "}
              <b>{createDlg.kind ? GROUP_LABEL[createDlg.kind] : "-"}</b>?<br />
              Hành động này không thể hoàn tác.
            </Alert>
          </DialogContent>
        )}

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeCreate}>Hủy</Button>
          {createDlg.step === "form" ? (
            <Button
              variant="contained"
              onClick={() => isQtyValid && goConfirm()}
              disabled={!isQtyValid}
            >
              Tiếp tục
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={async () => {
                if (!createDlg.kind) return;
                await doCreate(
                  createDlg.kind,
                  parsedQty,
                  mapSetLoading[createDlg.kind]
                );
                closeCreate();
              }}
            >
              Xác nhận tạo
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2400}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} variant="filled" sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
