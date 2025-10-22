import React from "react";
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
import { useTheme } from "@mui/material";
import { Fragment, useMemo, useState } from "react";
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

/* ======================== TRANSITION FIX ======================== */
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/* ======================== MAIN ======================== */
type Kind = keyof typeof PACKAGE_ALIASES;
type KindOrAll = Kind | "all";

export default function InvitationCodes() {
  const theme = useTheme();
  const {
    invitationCodes,
    fetchInvitationCodes,
    createStandardOneMonth,
    createStandardThreeMonths,
    createStandardOneYear,
  } = useFranchise();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<KindOrAll>("all");
  const handleTypeFilter = (e: SelectChangeEvent<KindOrAll>) =>
    setTypeFilter(e.target.value as KindOrAll);

  const [loadingOne, setLoadingOne] = useState(false);
  const [loadingThree, setLoadingThree] = useState(false);
  const [loadingYear, setLoadingYear] = useState(false);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error" | "info";
  }>({
    open: false,
    msg: "",
    sev: "success",
  });

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

  const loadingTable = invitationCodes.loading;
  const rows = (invitationCodes.data ?? []) as InvitationCode[];

  const filteredRows = useMemo(() => {
    let out = rows
      .map((r) => ({ r, g: resolveGroupByPackageId(r.packageId) }))
      .filter(
        (x): x is { r: InvitationCode; g: keyof typeof PACKAGE_ALIASES } =>
          x.g !== null
      );

    if (typeFilter !== "all") out = out.filter(({ g }) => g === typeFilter);
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
  }, [rows, search, typeFilter]);

  const groups = useMemo(() => {
    const map = new Map<keyof typeof PACKAGE_ALIASES, InvitationCode[]>();
    for (const { r, g } of filteredRows) {
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(r);
    }
    for (const [k, list] of map) {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    }
    return ORDER.filter((k) => map.has(k)).map(
      (k) => [k, map.get(k)!] as const
    );
  }, [filteredRows]);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1200);
    } catch {
      setSnack({ open: true, msg: "Sao chép thất bại", sev: "error" });
    }
  };

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

  const isDark = theme.palette.mode === "dark";
  const headerBg = isDark ? "#0f172a" : "#f8fafc";
  const headerBorder = isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.08)";
  const groupHeaderBg = isDark
    ? alpha(theme.palette.primary.light, 0.12)
    : alpha(theme.palette.primary.main, 0.06);

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
              Theo thời hạn : 1 tháng • 3 tháng • 1 năm
            </Typography>
          </Box>

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
      </Paper>

      {/* === Toolbar === */}
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
                <TableCell width={260}>Mã</TableCell>
                <TableCell width={240}>Loại mã</TableCell>
                <TableCell width={150}>Trạng thái</TableCell>
                <TableCell width={180}>Tạo lúc</TableCell>
                <TableCell width={180}>Cập nhật</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map(([group, items]) => (
                <Fragment key={group}>
                  <TableRow
                    sx={{
                      background: groupHeaderBg,
                      "& td": { borderBottom: "none" },
                    }}
                  >
                    <TableCell colSpan={5}>
                      <Stack direction="row" alignItems="center" spacing={1.25}>
                        <CodeTypeIcon group={group} />
                        <Typography fontWeight={800}>
                          {GROUP_LABEL[group]}
                        </Typography>
                        <Chip
                          label={items.length}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: alpha(
                              theme.palette.primary.main,
                              isDark ? 0.2 : 0.12
                            ),
                          }}
                        />
                      </Stack>
                    </TableCell>
                  </TableRow>
                  {items.map((r) => (
                    <TableRow hover key={r._id}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
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
                              copiedCode === r.code ? "Đã sao chép" : "Sao chép"
                            }
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleCopy(r.code)}
                            >
                              <ContentCopyIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CodeTypeIcon group={group} />
                          <Typography variant="body2">
                            {GROUP_LABEL[group]}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          icon={STATUS_MAP[r.status]?.icon}
                          label={r.status}
                          color={STATUS_MAP[r.status]?.color}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{formatDate(r.createdAt)}</TableCell>
                      <TableCell>{formatDate(r.updatedAt)}</TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* === Dialog tạo mã (Form → Confirm) === */}
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
                helperText={!isQtyValid && createDlg.qtyText !== ""}
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

      {/* === Snackbar === */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2200}
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
