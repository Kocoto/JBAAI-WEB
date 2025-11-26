import React, { Fragment, useEffect, useMemo, useState } from "react";
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
  TableSortLabel,
  Checkbox,
  TablePagination,
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
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useTheme } from "@mui/material";
import type { InvitationCode } from "../../types/franchise.type";
import apiClient from "@/shared/services/api/apiClient";
import { franchiseService } from "../../services/franchiseService";

/* ======================== CONFIG ======================== */
const PACKAGE_ALIASES = {
  one_month: new Set<string>(["683d1e58d70c0d6366e3d716"]),
  three_months: new Set<string>(["68cbc381bd30e2a1315d2709"]),
  one_year: new Set<string>(["683d2295d70c0d6366e3d741"]),
} as const;

const ORDER = ["one_month", "three_months", "one_year"] as const;

const GROUP_LABEL: Record<(typeof ORDER)[number], string> = {
  one_month: "Dùng thử 1 tháng",
  three_months: "Dùng thử 3 tháng",
  one_year: "Dùng thử 1 năm",
};

const KIND_LABEL: Record<(typeof ORDER)[number], string> = {
  one_month: "Tạo 1 tháng",
  three_months: "Tạo 3 tháng",
  one_year: "Tạo 1 năm",
};

const STATUS_COLOR: Record<
  string,
  { color: "success" | "error" | "default"; label?: string }
> = {
  active: { color: "success", label: "active" },
  deleted: { color: "error", label: "deleted" },
  default: { color: "default" },
};

/* ======================== HELPERS ======================== */
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
): (typeof ORDER)[number] | null => {
  if (!pkgId) return null;
  for (const key of ORDER) if (PACKAGE_ALIASES[key].has(pkgId)) return key;
  return null;
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/* ======================== TYPES ======================== */
type Kind = (typeof ORDER)[number];
type KindOrAll = Kind | "all";
type StatusFilter = "all" | "active" | "deleted";
type SortField = "createdAt" | "updatedAt";
type SortDir = "asc" | "desc";

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  nextPage?: number;
  prevPage?: number;
}

/* ======================== MAIN ======================== */
export default function InvitationCodes() {
  const theme = useTheme();

  // server data
  const [rows, setRows] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(false);

  // pagination (server-side)
  const [page, setPage] = useState(1); // 1-based (MUI uses 0-based when render)
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // selection (for export selected)
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<KindOrAll>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // sort (client-side on fetched page)
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // create dialog (thêm prefixText – KHÔNG đổi logic khác)
  const [createDlg, setCreateDlg] = useState<{
    open: boolean;
    kind: Kind | null;
    qtyText: string;
    prefixText: string;
    loading: boolean;
  }>({ open: false, kind: null, qtyText: "1", prefixText: "", loading: false });

  // snackbar
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error" | "info";
  }>({ open: false, msg: "", sev: "success" });

  const isDark = theme.palette.mode === "dark";
  const headerBorder = isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.08)";
  const headerBg = alpha(theme.palette.primary.main, 0.06);

  /* ---------------------- FETCH (headers: page, limit) ---------------------- */
  const fetchList = async (p = page, l = limit) => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("franchise_token") ||
        "";
      const res = await apiClient.get("/api/v1/invitation-code", {
        headers: {
          Authorization: `Bearer ${token}`,
          page: String(p),
          limit: String(l),
          "Cache-Control": "no-cache",
        },
      });

      // Flexible parser
      const body = res.data ?? {};
      const list: InvitationCode[] = Array.isArray(body?.data?.data)
        ? body.data.data
        : Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body)
        ? body
        : Array.isArray(body?.results)
        ? body.results
        : [];

      const pag: PaginationMeta = body?.data?.pagination ??
        body?.pagination ?? {
          total: body?.total ?? list.length ?? 0,
          page: body?.page ?? p,
          limit: body?.limit ?? l,
          totalPages:
            body?.totalPages ??
            Math.max(1, Math.ceil((body?.total ?? list.length ?? 0) / l)),
          hasNextPage: body?.hasNextPage,
          hasPrevPage: body?.hasPrevPage,
          nextPage: body?.nextPage,
          prevPage: body?.prevPage,
        };

      setRows(list);
      setPagination({
        total: Number(pag.total) || 0,
        page: Number(pag.page) || p,
        limit: Number(pag.limit) || l,
        totalPages: Number(pag.totalPages) || 0,
        hasNextPage: !!pag.hasNextPage,
        hasPrevPage: !!pag.hasPrevPage,
        nextPage: pag.nextPage,
        prevPage: pag.prevPage,
      });
      setLimit(Number(pag.limit) || l);
      setPage(Number(pag.page) || p);
      setSelected(new Set());
    } catch (e: any) {
      console.error(e);
      setSnack({
        open: true,
        msg: e?.message || "Không thể tải dữ liệu",
        sev: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------- CREATE ---------------------- */
  const openCreate = (kind: Kind) =>
    setCreateDlg({
      open: true,
      kind,
      qtyText: "1",
      prefixText: "",
      loading: false,
    });

  const closeCreate = () =>
    setCreateDlg((s) => ({ ...s, open: false, loading: false }));

  const handleCreate = async () => {
    if (!createDlg.kind) return;
    const qty = Math.max(1, Math.min(1000, Number(createDlg.qtyText) || 0));
    const prefix = createDlg.prefixText.trim() || undefined;
    setCreateDlg((s) => ({ ...s, loading: true }));
    try {
      if (createDlg.kind === "one_month")
        await franchiseService.createStandardCode(
          "one_month",
          qty,
          undefined,
          prefix
        );
      if (createDlg.kind === "three_months")
        await franchiseService.createStandardCode(
          "three_months",
          qty,
          undefined,
          prefix
        );
      if (createDlg.kind === "one_year")
        await franchiseService.createStandardCode(
          "one_year",
          qty,
          undefined,
          prefix
        );
      setSnack({ open: true, msg: `Đã tạo ${qty} mã`, sev: "success" });
      await fetchList(1, limit);
    } catch (e: any) {
      setSnack({
        open: true,
        msg: e?.message || "Tạo mã thất bại",
        sev: "error",
      });
    } finally {
      closeCreate();
    }
  };

  /* ---------------------- FILTER + SORT (client on current page) ---------------------- */
  const filtered = useMemo(() => {
    let out = [...rows];

    if (typeFilter !== "all")
      out = out.filter(
        (r) => resolveGroupByPackageId(r.packageId) === typeFilter
      );

    if (statusFilter !== "all")
      out = out.filter((r) => (r.status || "").toLowerCase() === statusFilter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      // ✅ THÊM: cho phép tìm theo prefixCode (không đụng logic khác)
      out = out.filter((r: any) => {
        const code = (r.code || "").toLowerCase();
        const status = ((r.status as string) || "").toLowerCase();
        const prefix = ((r.prefixCode as string) || "").toLowerCase(); // <— NEW
        return code.includes(q) || status.includes(q) || prefix.includes(q); // <— NEW
      });
    }

    out.sort((a, b) => {
      const ta = new Date((a as any)[sortField] || 0).getTime();
      const tb = new Date((b as any)[sortField] || 0).getTime();
      return sortDir === "desc" ? tb - ta : ta - tb;
    });

    return out;
  }, [rows, search, typeFilter, statusFilter, sortField, sortDir]);

  const groups = useMemo(() => {
    const map = new Map<Kind, InvitationCode[]>();
    for (const row of filtered) {
      const g = resolveGroupByPackageId(row.packageId);
      if (!g) continue;
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(row);
    }
    return ORDER.filter((k) => map.has(k)).map(
      (k) => [k, map.get(k)!] as const
    );
  }, [filtered]);

  /* ---------------------- SELECTION ---------------------- */
  const currentPageIds = rows.map((r) => r._id);
  const toggleAll = () =>
    setSelected((prev) => {
      const allSelected = currentPageIds.every((id) => prev.has(id));
      const next = new Set(prev);
      currentPageIds.forEach((id) =>
        allSelected ? next.delete(id) : next.add(id)
      );
      return next;
    });

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  /* ---------------------- EXPORT ---------------------- */
  const exportExcel = async (list: InvitationCode[]) => {
    if (list.length === 0) return;
    const rowsData = list.map((r) => {
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
      const XLSX: any = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(rowsData);
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
      setSnack({ open: true, msg: "Xuất Excel thất bại", sev: "error" });
    }
  };

  /* ---------------------- RENDER ---------------------- */
  const totalAll = pagination.total; // tổng số mã từ BE
  const isAllChecked =
    currentPageIds.length > 0 && currentPageIds.every((id) => selected.has(id));
  const isIndeterminate =
    selected.size > 0 &&
    !isAllChecked &&
    currentPageIds.some((id) => selected.has(id));

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Paper
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: 3,
          bgcolor: headerBg,
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
              Tổng: <b>{totalAll}</b> mã • Trang {pagination.page}/
              {pagination.totalPages}
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
                  disabled={selected.size === 0}
                  onClick={() => {
                    const idSet = new Set(selected);
                    exportExcel(rows.filter((r) => idSet.has(r._id)));
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  Xuất đã chọn ({selected.size})
                </Button>
              </span>
            </Tooltip>

            {/* Export all */}
            <Tooltip title="Xuất tất cả (theo lọc hiện tại)">
              <span>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => exportExcel(filtered)}
                  disabled={filtered.length === 0}
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
                  onClick={() => fetchList(page, limit)}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  {loading ? "Đang tải..." : "Làm mới"}
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Toolbar tạo + filter */}
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
            placeholder="Tìm mã, prefix, trạng thái…"
            sx={{ flex: 1, minWidth: 220, mr: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ width: 180, flexShrink: 0 }}>
            <Select
              value={typeFilter}
              onChange={(e: SelectChangeEvent<KindOrAll>) =>
                setTypeFilter(e.target.value as KindOrAll)
              }
              displayEmpty
              renderValue={(val) =>
                val === "all" ? "Tất cả loại mã" : GROUP_LABEL[val as Kind]
              }
            >
              <MenuItem value="all">Tất cả loại mã</MenuItem>
              <MenuItem value="one_month">Dùng thử 1 tháng</MenuItem>
              <MenuItem value="three_months">Dùng thử 3 tháng</MenuItem>
              <MenuItem value="one_year">Dùng thử 1 năm</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ width: 160, flexShrink: 0 }}>
            <Select
              value={statusFilter}
              onChange={(e: SelectChangeEvent<StatusFilter>) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              displayEmpty
              renderValue={(val) =>
                val === "all" ? "Tất cả trạng thái" : (val as string)
              }
            >
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value="active">active</MenuItem>
              <MenuItem value="deleted">deleted</MenuItem>
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1}>
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
        </Stack>
      </Paper>

      {/* Table */}
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
                    indeterminate={isIndeterminate}
                    checked={isAllChecked}
                    onChange={toggleAll}
                  />
                </TableCell>
                <TableCell width={260} sx={{ bgcolor: "background.paper" }}>
                  Mã
                </TableCell>
                <TableCell width={220} sx={{ bgcolor: "background.paper" }}>
                  Loại mã
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
                <TableCell width={160} sx={{ bgcolor: "background.paper" }}>
                  Trạng thái
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

              {groups.map(([group, list]) => (
                <Fragment key={group}>
                  {/* Group header */}
                  <TableRow
                    sx={{
                      background: isDark
                        ? alpha(theme.palette.primary.light, 0.12)
                        : alpha(theme.palette.primary.main, 0.06),
                      "& td": { borderBottom: "none" },
                    }}
                  >
                    <TableCell padding="checkbox" />
                    <TableCell colSpan={5}>
                      <Stack direction="row" alignItems="center" spacing={1.25}>
                        <Typography fontWeight={800}>
                          {GROUP_LABEL[group]}
                        </Typography>
                        <Chip label={list.length} size="small" />
                      </Stack>
                    </TableCell>
                  </TableRow>

                  {list.map((r) => {
                    const sKey = (r.status || "").toLowerCase();
                    const sc = STATUS_COLOR[sKey] || STATUS_COLOR.default;
                    const label = sc.label ?? r.status ?? "";
                    return (
                      <TableRow hover key={r._id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selected.has(r._id)}
                            onChange={() => toggleOne(r._id)}
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
                                fontFamily:
                                  "ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace",
                                fontWeight: 800,
                                letterSpacing: 0.25,
                              }}
                            >
                              {r.code}
                            </Box>

                            <Tooltip title="Sao chép">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  navigator.clipboard.writeText(r.code)
                                }
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
                          <Typography variant="body2">
                            {GROUP_LABEL[group]}
                          </Typography>
                        </TableCell>

                        <TableCell>{formatDate(r.createdAt)}</TableCell>
                        <TableCell>{formatDate(r.updatedAt)}</TableCell>

                        {/* Trạng thái — green for active, red for deleted */}
                        <TableCell>
                          <Chip
                            size="small"
                            label={label}
                            color={sc.color}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination — lấy total/page/limit từ BE */}
        <TablePagination
          component="div"
          count={pagination.total}
          page={page - 1}
          onPageChange={(_, newPage) => {
            const targetPage = newPage + 1; // convert to 1-based
            setPage(targetPage);
            fetchList(targetPage, limit);
          }}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => {
            const newLimit = parseInt(e.target.value, 10) || 10;
            setLimit(newLimit);
            // quay về trang 1 khi đổi page size
            setPage(1);
            fetchList(1, newLimit);
          }}
          rowsPerPageOptions={[10, 20, 50, 1200]}
          labelDisplayedRows={({ from, to, page }) =>
            `Trang ${page + 1}/${Math.max(
              1,
              pagination.totalPages
            )} • ${from}–${to} / ${pagination.total}`
          }
        />
      </Paper>

      {/* Dialog tạo mã — thêm ô prefixCode */}
      <Dialog
        open={createDlg.open}
        onClose={closeCreate}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Transition}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {createDlg.kind ? KIND_LABEL[createDlg.kind] : "Tạo mã"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              autoFocus
              label="Số lượng mã"
              placeholder="Nhập số (1–1000)"
              value={createDlg.qtyText}
              onChange={(e) =>
                setCreateDlg((s) => ({ ...s, qtyText: e.target.value }))
              }
              type="number"
              inputProps={{ min: 1, max: 1000 }}
              fullWidth
            />
            <TextField
              label="Tiền tố mã (prefixCode)"
              placeholder="Ví dụ: lan 2"
              value={createDlg.prefixText}
              onChange={(e) =>
                setCreateDlg((s) => ({ ...s, prefixText: e.target.value }))
              }
              helperText="Không bắt buộc — nếu điền, BE sẽ tạo mã với tiền tố này."
              fullWidth
            />
            <Alert severity="info" variant="outlined">
              Sẽ tạo{" "}
              <b>
                {Math.max(1, Math.min(1000, Number(createDlg.qtyText) || 0))}
              </b>{" "}
              mã cho <b>{createDlg.kind ? GROUP_LABEL[createDlg.kind] : "-"}</b>
              {createDlg.prefixText.trim() ? (
                <>
                  {" "}
                  với tiền tố <b>{createDlg.prefixText.trim()}</b>
                </>
              ) : null}
              .
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeCreate}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={createDlg.loading}
          >
            {createDlg.loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Xác nhận tạo"
            )}
          </Button>
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
