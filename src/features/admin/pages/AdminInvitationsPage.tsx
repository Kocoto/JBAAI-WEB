// src/features/admin/pages/AdminInvitationsPage.tsx

import React, { useEffect, useMemo, useState } from "react";
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
  Checkbox,
  FormControl,
  Select,
  MenuItem,
  TablePagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import { useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";

import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";
import apiClient from "@/shared/services/api/apiClient";

/* ======================== TYPES + CONFIG ======================== */
type Kind = "one_month" | "three_months" | "one_year";
type KindOrAll = Kind | "all";
type StatusFilter = "all" | "active" | "deleted";

type AdminInvitationCode = {
  id: string;
  code: string;
  packageKey: Kind;
  createdAt: string;
  updatedAt: string;
  status: "active" | "deleted";
};

type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  nextPage?: number;
  prevPage?: number;
};

type ApiInvitationCode = {
  _id: string;
  code: string;
  userId: string;
  status: string;
  codeType: string;
  totalCumulativeUses: number;
  packageId: string;
  createdAt: string;
  updatedAt: string;
};

type ApiListResponse = {
  success: boolean;
  message: string;
  data: {
    data: ApiInvitationCode[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage?: number;
    prevPage?: number;
  };
};

const GROUP_LABEL: Record<Kind, string> = {
  one_month: "Dùng thử 1 tháng",
  three_months: "Dùng thử 3 tháng",
  one_year: "Dùng thử 1 năm",
};

const ORDER: Kind[] = ["one_month", "three_months", "one_year"];

const STATUS_COLOR: Record<
  string,
  { color: "success" | "error" | "default"; label?: string }
> = {
  active: { color: "success", label: "active" },
  deleted: { color: "error", label: "deleted" },
  default: { color: "default" },
};

// map packageKey -> packageId từ BE
const PACKAGE_ID_MAP: Record<Kind, string> = {
  one_month: "683d1e58d70c0d6366e3d716",
  three_months: "68cbc381bd30e2a1315d2709",
  one_year: "683d2295d70c0d6366e3d741",
};

// reverse: packageId -> packageKey
const PACKAGE_ID_TO_KIND: Record<string, Kind> = Object.entries(
  PACKAGE_ID_MAP
).reduce((acc, [key, value]) => {
  acc[value] = key as Kind;
  return acc;
}, {} as Record<string, Kind>);

const formatDate = (d: string) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour12: false,
    });
  } catch {
    return d;
  }
};

/* ======================== COMPONENT ======================== */
const AdminInvitationsPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [rows, setRows] = useState<AdminInvitationCode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // phân trang server-side (giống InvitationCodes)
  const [page, setPage] = useState<number>(1); // 1-based
  const [limit, setLimit] = useState<number>(10);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<KindOrAll>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const isDark = theme.palette.mode === "dark";
  const headerBorder = isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.08)";
  const headerBg = alpha(theme.palette.primary.main, 0.06);

  /* ----------- CALL API (headers: page, limit) ----------- */
  const fetchInvitationCodes = async (pageParam = 1, limitParam = 10) => {
    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.get<ApiListResponse>(
        "/api/v1/admin/invitation-codes",
        {
          headers: {
            page: pageParam.toString(),
            limit: limitParam.toString(),
          },
        }
      );

      const payload = res.data.data;

      const mapped: AdminInvitationCode[] = payload.data
        .map((item) => {
          const kind = PACKAGE_ID_TO_KIND[item.packageId];
          if (!kind) return null; // bỏ package không thuộc 1/3/12 tháng

          const status: "active" | "deleted" =
            item.status === "deleted" ? "deleted" : "active";

          return {
            id: item._id,
            code: item.code,
            packageKey: kind,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            status,
          };
        })
        .filter(Boolean) as AdminInvitationCode[];

      setRows(mapped);
      setPagination({
        total: Number(payload.total) || 0,
        page: Number(payload.page) || pageParam,
        limit: Number(payload.limit) || limitParam,
        totalPages: Number(payload.totalPages) || 0,
        hasNextPage: payload.hasNextPage,
        hasPrevPage: payload.hasPrevPage,
        nextPage: payload.nextPage,
        prevPage: payload.prevPage,
      });
      setPage(Number(payload.page) || pageParam);
      setLimit(Number(payload.limit) || limitParam);
      setSelected(new Set());
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách mã mời"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitationCodes(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----------- FILTER (client trên trang hiện tại) ----------- */
  const filtered = useMemo(() => {
    let out = [...rows];

    if (typeFilter !== "all") {
      out = out.filter((r) => r.packageKey === typeFilter);
    }

    if (statusFilter !== "all") {
      out = out.filter((r) => r.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter((r) => {
        const code = r.code.toLowerCase();
        const status = r.status.toLowerCase();
        return code.includes(q) || status.includes(q);
      });
    }

    return out;
  }, [rows, search, typeFilter, statusFilter]);

  /* ----------- GROUP ----------- */
  const groups = useMemo(() => {
    const map = new Map<Kind, AdminInvitationCode[]>();
    for (const r of filtered) {
      const g = r.packageKey;
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(r);
    }
    return ORDER.filter((k) => map.has(k)).map(
      (k) => [k, map.get(k)!] as const
    );
  }, [filtered]);

  /* ----------- SELECTION ----------- */
  const allIds = rows.map((r) => r.id);
  const isAllChecked =
    allIds.length > 0 && allIds.every((id) => selected.has(id));
  const isIndeterminate =
    selected.size > 0 && !isAllChecked && allIds.some((id) => selected.has(id));

  const toggleAll = () =>
    setSelected((prev) => {
      const allSelected = allIds.every((id) => prev.has(id));
      const next = new Set(prev);
      allIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  /* ----------- EXPORT (dummy) ----------- */
  const handleExportSelected = () => {
    const idSet = new Set(selected);
    const list = rows.filter((r) => idSet.has(r.id));
    console.log("Export selected", list);
  };

  const handleExportAll = () => {
    console.log("Export all", filtered);
  };

  const handleRefresh = () => {
    fetchInvitationCodes(page, limit);
  };

  const totalAll = pagination.total || rows.length;

  /* ======================== RENDER ======================== */
  return (
    <BaseDashboardLayout>
      <Box sx={{ width: "100%" }}>
        {/* HEADER */}
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
                Quản lý tất cả mã mời trong hệ thống • Tổng: <b>{totalAll}</b>{" "}
                mã • Trang {pagination.page}/
                {Math.max(1, pagination.totalPages || 1)}
                {loading && " (đang tải...)"}
              </Typography>
              {error && (
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              )}
            </Box>

            <Stack direction="row" spacing={1}>
              <Tooltip title="Xuất các mã đã chọn">
                <span>
                  <Button
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    color="primary"
                    disabled={selected.size === 0}
                    onClick={handleExportSelected}
                    sx={{ borderRadius: 2 }}
                  >
                    Xuất đã chọn ({selected.size})
                  </Button>
                </span>
              </Tooltip>

              <Tooltip title="Xuất tất cả">
                <span>
                  <Button
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportAll}
                    disabled={filtered.length === 0}
                    sx={{ borderRadius: 2 }}
                  >
                    Xuất tất cả
                  </Button>
                </span>
              </Tooltip>

              <Tooltip title={t("common.refresh")}>
                <span>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    sx={{ borderRadius: 2 }}
                    disabled={loading}
                  >
                    Làm mới
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>

        {/* TOOLBAR */}
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
              placeholder="Tìm mã, trạng thái…"
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
                onChange={(e) => setTypeFilter(e.target.value as KindOrAll)}
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
                onChange={(e) =>
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
          </Stack>
        </Paper>

        {/* TABLE + PAGINATION */}
        <Paper
          sx={{
            position: "relative",
            borderRadius: 3,
            border: `1px solid ${headerBorder}`,
            overflow: "hidden",
            background: isDark ? alpha("#ffffff", 0.02) : undefined,
            width: "100%",
            maxWidth: "100%",
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
                    Tạo lúc
                  </TableCell>
                  <TableCell width={180} sx={{ bgcolor: "background.paper" }}>
                    Cập nhật
                  </TableCell>
                  <TableCell width={160} sx={{ bgcolor: "background.paper" }}>
                    Trạng thái
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {groups.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography>Không có mã phù hợp</Typography>
                    </TableCell>
                  </TableRow>
                )}

                {groups.map(([group, list]) => (
                  <React.Fragment key={group}>
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
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.25}
                        >
                          <Typography fontWeight={800}>
                            {GROUP_LABEL[group]}
                          </Typography>
                          <Chip label={list.length} size="small" />
                        </Stack>
                      </TableCell>
                    </TableRow>

                    {list.map((r) => {
                      const sKey = r.status.toLowerCase();
                      const sc = STATUS_COLOR[sKey] || STATUS_COLOR.default;
                      const label = sc.label ?? r.status;

                      return (
                        <TableRow hover key={r.id}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selected.has(r.id)}
                              onChange={() => toggleOne(r.id)}
                            />
                          </TableCell>

                          {/* CODE + ACTION ICONS */}
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
                                  bgcolor: isDark
                                    ? "#0b1220"
                                    : "rgba(0,0,0,.04)",
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

                              <Tooltip title={t("common.copy")}>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    navigator.clipboard.writeText(r.code)
                                  }
                                >
                                  <ContentCopyIcon fontSize="inherit" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Tải xuống">
                                <IconButton size="small">
                                  <DownloadIcon fontSize="inherit" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>

                          <TableCell>{GROUP_LABEL[r.packageKey]}</TableCell>
                          <TableCell>{formatDate(r.createdAt)}</TableCell>
                          <TableCell>{formatDate(r.updatedAt)}</TableCell>

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
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* PHÂN TRANG GIỐNG InvitationCodes */}
          <TablePagination
            component="div"
            count={pagination.total}
            page={page - 1} // MUI 0-based
            onPageChange={(_, newPage) => {
              const targetPage = newPage + 1; // convert 1-based
              setPage(targetPage);
              fetchInvitationCodes(targetPage, limit);
            }}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => {
              const newLimit = parseInt(e.target.value, 10) || 10;
              setLimit(newLimit);
              setPage(1);
              fetchInvitationCodes(1, newLimit);
            }}
            rowsPerPageOptions={[10, 20, 50]}
            labelDisplayedRows={({ from, to, page }) =>
              `Trang ${page + 1}/${Math.max(
                1,
                pagination.totalPages || 1
              )} • ${from}–${to} / ${pagination.total}`
            }
          />
        </Paper>
      </Box>
    </BaseDashboardLayout>
  );
};

export default AdminInvitationsPage;
