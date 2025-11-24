// src/features/admin/pages/AdminAddUser.tsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Stack,
  InputAdornment,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Avatar,
  OutlinedInput,
  FormHelperText,
} from "@mui/material";

import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Work as WorkIcon,
  RestartAlt as ResetIcon,
  PersonAdd as AddUserIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility,
  VisibilityOff,
  Refresh as RefreshIcon,
  Star as UpgradeIcon,
} from "@mui/icons-material";

import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
} from "@mui/x-data-grid";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";
import apiClient from "@/shared/services/api/apiClient";

/** =================== API PATHS =================== */
const baseHasV1 = String(apiClient?.defaults?.baseURL ?? "").includes(
  "/api/v1"
);
const API_PREFIX = baseHasV1 ? "" : "/api/v1";

const USERS_LIST_PATH = `${API_PREFIX}/admin/users`; // GET list users
const USERS_CREATE_PATH = `${API_PREFIX}/admin/users/create`; // POST create user
const UPGRADE_USER_SUBSCRIPTION_PATH = `${API_PREFIX}/admin/users/subscription/activate`; // POST upgrade
const userPath = (id: string) => `${USERS_LIST_PATH}/${id}`;

/** =================== Types =================== */
type FormData = {
  fullName: string; // -> username
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: string;
  optionEmail?: string;
};

type ApiUser = {
  _id: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  status?: string;
  type?: string;
  createdAt: string;
};

type ApiUsersResponse = {
  success?: boolean;
  message?: string;
  data?: ApiUser[] | ApiUser;
};

type UserRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status?: string;
  type?: string;
  createdAt: string;
};

/** =================== Helpers =================== */
const roleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "error";
    case "manager":
      return "primary";
    case "staff":
      return "success";
    case "franchise":
      return "secondary";
    default:
      return "default";
  }
};

const statusColor = (status?: string) =>
  !status
    ? "default"
    : status === "active"
    ? "success"
    : status === "inactive"
    ? "default"
    : "warning";

const typeColor = (type?: string) => {
  if (!type) return "default";
  const t = String(type).toLowerCase();
  if (t === "premium") return "warning";
  if (t === "standard") return "info";
  if (t === "normal" || t === "basic") return "default";
  return "secondary";
};

const pickList = (payload: any): ApiUser[] =>
  (Array.isArray(payload?.data) && payload.data) ||
  (Array.isArray(payload) && payload) ||
  [];

/** =================== Component =================== */
export default function AdminAddUser() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith("vi") ? "vi-VN" : "en-US";

  /** ---------- Validation ---------- */
  const schema: yup.ObjectSchema<FormData> = useMemo(
    () =>
      yup
        .object({
          fullName: yup
            .string()
            .matches(/^\S+$/, t("adminAddUser.validation.fullNameNoSpaces"))
            .required(t("adminAddUser.validation.fullNameRequired")),
          email: yup
            .string()
            .email(t("adminAddUser.validation.emailInvalid"))
            .required(t("adminAddUser.validation.emailRequired")),
          phone: yup
            .string()
            .required(t("adminAddUser.validation.phoneRequired")),
          password: yup
            .string()
            .min(6, t("adminAddUser.validation.passwordMin"))
            .required(t("adminAddUser.validation.passwordRequired")),
          confirmPassword: yup
            .string()
            .oneOf(
              [yup.ref("password")],
              t("adminAddUser.validation.passwordMismatch")
            )
            .required(t("adminAddUser.validation.confirmPasswordRequired")),
          role: yup
            .string()
            .required(t("adminAddUser.validation.roleRequired")),
          optionEmail: yup
            .string()
            .email(t("adminAddUser.validation.emailInvalid"))
            .transform((v) => (v === "" ? undefined : v))
            .optional(),
        })
        .required(),
    [t, i18n.language]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "",
      optionEmail: "",
    },
  });

  // Preview card
  const previewFullName = watch("fullName") || "New User";
  const previewEmail = watch("email") || "email@example.com";
  const previewPhone = watch("phone") || "—";
  const previewOptionEmail = watch("optionEmail") || "—";
  const previewRole = watch("role") || "user";

  /** ---------- Users (client-side pagination + global search) ---------- */
  const [allRows, setAllRows] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const mapApiToRow = useCallback(
    (u: ApiUser): UserRow => ({
      id: u._id,
      fullName: u.username,
      email: u.email,
      phone: u.phone ?? "",
      role: u.role ?? "user",
      status: u.status,
      type: u.type,
      createdAt: new Date(u.createdAt).toLocaleString(locale),
    }),
    [locale]
  );

  const fetchAllUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      // lấy TẤT CẢ users: page=1, limit rất lớn
      const page = 1;
      const limit = 9999;

      const res = await apiClient.get<ApiUsersResponse>(USERS_LIST_PATH, {
        headers: {
          page: String(page),
          limit: String(limit),
          "x-page": String(page),
          "x-limit": String(limit),
          "X-Page": String(page),
          "X-Limit": String(limit),
        },
        params: { page, limit },
      });

      const payload = res?.data ?? {};
      let list = pickList(payload);

      // newest first
      list = list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setAllRows(list.map(mapApiToRow));
      setPaginationModel((p) => ({ ...p, page: 0 }));
    } catch (e: any) {
      console.error(e);
      setUsersError(
        e?.response?.data?.message || e?.message || "Fetch users failed"
      );
      setAllRows([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [mapApiToRow]);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // reset page khi filter/search đổi
  useEffect(() => {
    setPaginationModel((p) => ({ ...p, page: 0 }));
  }, [searchTerm, filterRole, filterStatus]);

  /** ---------- Create user ---------- */
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [createOpen, setCreateOpen] = useState(false);

  async function createUser(payload: any): Promise<ApiUser | null> {
    const res = await apiClient.post<ApiUsersResponse>(
      USERS_CREATE_PATH,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const raw = res?.data;
    let user: any = null;
    if (raw?.data) {
      if (Array.isArray(raw.data)) {
        user = raw.data[0];
      } else {
        user = raw.data;
      }
    }

    if (!user || !user._id) return null;
    return user as ApiUser;
  }

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const payload = {
        email: data.email,
        password: data.password,
        username: data.fullName,
        phone: data.phone,
        role: data.role || "user",
        optionEmail: data.optionEmail?.trim() ? data.optionEmail : undefined,
      };

      const created = await createUser(payload);

      if (created && created._id) {
        const newRow = mapApiToRow(created);
        setAllRows((prev) => [newRow, ...prev]); // user mới luôn nằm trên cùng
      }

      setSnackbarSeverity("success");
      setSnackbarMsg(
        t("adminAddUser.snackbar.createSuccess", "Tạo người dùng thành công")
      );
      setSnackbarOpen(true);
      reset();
      setShowPassword(false);
      setShowConfirmPassword(false);
      setCreateOpen(false);
    } catch (e: any) {
      console.error(e);
      setSnackbarSeverity("error");
      setSnackbarMsg(
        e?.response?.data?.message || e?.message || "Create user failed"
      );
      setSnackbarOpen(true);
    }
  };

  /** ---------- Filter + search trên allRows ---------- */
  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return allRows.filter((u) => {
      const matchSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q);
      const matchRole = filterRole === "all" || u.role === filterRole;
      const matchStatus =
        filterStatus === "all" || (u.status ?? "") === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }, [allRows, searchTerm, filterRole, filterStatus]);

  /** ---------- Edit/Delete/Upgrade ---------- */
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);

  // Upgrade dialog state
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradingUser, setUpgradingUser] = useState<UserRow | null>(null);
  const [upgradeCode, setUpgradeCode] = useState("");
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const handleOpenUpgrade = (row: UserRow) => {
    setUpgradingUser(row);
    setUpgradeCode("");
    setUpgradeOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!upgradingUser) return;
    if (!upgradeCode.trim()) {
      setSnackbarSeverity("error");
      setSnackbarMsg("Vui lòng nhập mã nâng cấp (codeRandom)");
      setSnackbarOpen(true);
      return;
    }

    setUpgradeLoading(true);
    try {
      await apiClient.post(
        UPGRADE_USER_SUBSCRIPTION_PATH,
        {
          userId: upgradingUser.id,
          codeRandom: upgradeCode.trim(),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setSnackbarSeverity("success");
      setSnackbarMsg("Nâng cấp tài khoản thành công");
      setSnackbarOpen(true);

      setUpgradeOpen(false);
      setUpgradingUser(null);
      setUpgradeCode("");

      await fetchAllUsers();
    } catch (e: any) {
      console.error(e);
      setSnackbarSeverity("error");
      setSnackbarMsg(
        e?.response?.data?.message ||
          e?.message ||
          "Upgrade user subscription failed"
      );
      setSnackbarOpen(true);
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handlePatchUser = async (updated: UserRow) => {
    try {
      const payload: Partial<ApiUser> = {
        username: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        status: updated.status,
        type: updated.type,
      };
      await apiClient.patch(userPath(updated.id), payload);
      setSnackbarSeverity("success");
      setSnackbarMsg(
        t("adminAddUser.snackbar.updateSuccess", "Cập nhật thành công")
      );
      setSnackbarOpen(true);
      setEditOpen(false);
      setEditingUser(null);

      setAllRows((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    } catch (e: any) {
      console.error(e);
      setSnackbarSeverity("error");
      setSnackbarMsg(
        e?.response?.data?.message || e?.message || "Update user failed"
      );
      setSnackbarOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      await apiClient.delete(userPath(deletingUser.id));
      setSnackbarSeverity("success");
      setSnackbarMsg(
        t("adminAddUser.snackbar.deleteSuccess", "Xóa thành công")
      );
      setSnackbarOpen(true);
      setDeleteOpen(false);
      setDeletingUser(null);

      setAllRows((prev) => prev.filter((r) => r.id !== deletingUser.id));
    } catch (e: any) {
      console.error(e);
      setSnackbarSeverity("error");
      setSnackbarMsg(
        e?.response?.data?.message || e?.message || "Delete user failed"
      );
      setSnackbarOpen(true);
    }
  };

  /** ---------- Columns ---------- */
  const columns: GridColDef[] = [
    {
      field: "fullName",
      headerName: t("adminAddUser.table.columns.fullName", "Họ tên"),
      flex: 1,
      minWidth: 180,
    },
    {
      field: "email",
      headerName: t("adminAddUser.table.columns.email", "Email"),
      flex: 1.2,
      minWidth: 200,
    },
    {
      field: "phone",
      headerName: t("adminAddUser.table.columns.phone", "Số điện thoại"),
      flex: 1,
      minWidth: 140,
    },
    {
      field: "role",
      headerName: t("adminAddUser.table.columns.role", "Vai trò"),
      width: 140,
      renderCell: (p: GridRenderCellParams<UserRow, string>) => (
        <Chip
          size="small"
          label={p.value ?? "—"}
          color={roleColor(p.value ?? "")}
        />
      ),
    },
    {
      field: "status",
      headerName: t("adminAddUser.table.columns.status", "Trạng thái"),
      width: 120,
      renderCell: (p) =>
        p.value ? (
          <Chip
            size="small"
            label={String(p.value)}
            color={statusColor(p.value)}
          />
        ) : (
          <Chip size="small" label="—" variant="outlined" />
        ),
    },
    {
      field: "type",
      headerName: t("adminAddUser.table.columns.type", "Loại TK"),
      width: 130,
      renderCell: (p) =>
        p.value ? (
          <Chip
            size="small"
            label={String(p.value)}
            color={typeColor(p.value)}
          />
        ) : (
          <Chip size="small" label="—" variant="outlined" />
        ),
    },
    {
      field: "createdAt",
      headerName: t("adminAddUser.table.columns.createdAt", "Ngày tạo"),
      width: 180,
    },
    {
      field: "actions",
      headerName: t("adminAddUser.table.columns.actions", "Hành động"),
      width: 190,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<any, UserRow>) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title={t("common.upgrade", "Nâng hạng")}>
            <IconButton
              size="small"
              onClick={() => handleOpenUpgrade(params.row as UserRow)}
            >
              <UpgradeIcon />
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={() => {
              setEditingUser(params.row);
              setEditOpen(true);
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setDeletingUser(params.row);
              setDeleteOpen(true);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  /** ---------- Render ---------- */
  return (
    <BaseDashboardLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: "1400px",
          mx: "auto",
          p: 0,
          borderRadius: 3,
          border: "2px solid #61666f",
          overflow: "hidden",
        }}
      >
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: 0, bgcolor: "background.paper" }}
        >
          {/* Header */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                👤 {t("adminAddUser.header.title", "Quản lý người dùng")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("adminAddUser.header.subtitle", "Tạo, sửa, xoá tài khoản")}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setSearchTerm("");
                  setFilterRole("all");
                  setFilterStatus("all");
                  fetchAllUsers();
                }}
                disabled={loadingUsers}
              >
                {t("common.refresh", "Tải lại Users")}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddUserIcon />}
                onClick={() => {
                  reset();
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                  setCreateOpen(true);
                }}
              >
                {t("adminAddUser.buttons.openCreate", "Thêm user mới")}
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Filters */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <TextField
              size="small"
              placeholder={t(
                "adminAddUser.search.placeholder",
                "Tìm kiếm theo tên, email, SĐT..."
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", sm: 420 } }}
            />

            <Stack
              direction="row"
              spacing={2}
              sx={{ width: "100%", maxWidth: 500 }}
            >
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>
                  {t("adminAddUser.filters.roleFilterLabel", "Vai trò")}
                </InputLabel>
                <Select
                  value={filterRole}
                  label={t("adminAddUser.filters.roleFilterLabel", "Vai trò")}
                  onChange={(e) => setFilterRole(String(e.target.value))}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterListIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">{t("common.all", "Tất cả")}</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="franchise">Franchise</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>{t("common.status", "Trạng thái")}</InputLabel>
                <Select
                  value={filterStatus}
                  label={t("common.status", "Trạng thái")}
                  onChange={(e) => setFilterStatus(String(e.target.value))}
                >
                  <MenuItem value="all">{t("common.all", "Tất cả")}</MenuItem>
                  <MenuItem value="active">
                    {t("common.active", "Active")}
                  </MenuItem>
                  <MenuItem value="inactive">
                    {t("common.inactive", "Inactive")}
                  </MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          {/* DataGrid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ height: 560, width: "100%" }}>
              <DataGrid
                rows={filteredRows}
                columns={columns}
                getRowId={(row) => row.id}
                paginationMode="client"
                paginationModel={paginationModel}
                onPaginationModelChange={(m) => setPaginationModel(m)}
                pageSizeOptions={[5, 10, 20, 50]}
                disableRowSelectionOnClick
                density="standard"
                sx={{
                  border: "2px solid #61666f",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  "& .MuiDataGrid-columnHeaders": {
                    bgcolor: (theme) =>
                      theme.palette.mode === "light" ? "grey.100" : "grey.900",
                    fontWeight: 700,
                  },
                }}
              />
            </Box>
          </motion.div>

          {usersError && (
            <Box mt={2}>
              <Alert severity="error">{usersError}</Alert>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Create User Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => {
          if (!isSubmitting) setCreateOpen(false);
        }}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: "1px solid rgba(209,213,219,0.6)",
            overflow: "visible",
            background:
              "linear-gradient(135deg, #f9fafb 0%, #ffffff 40%, #eef4ff 100%)",
            boxShadow: "0 18px 50px rgba(15,23,42,0.18)",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            pt: 2.2,
            pb: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#93c5fd,#a5b4fc)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 8px 18px rgba(147,197,253,0.4)",
            }}
          >
            <AddUserIcon fontSize="small" />
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ color: "#111827" }}
            >
              Thêm người dùng mới
            </Typography>
            <Typography variant="body2" sx={{ color: "#6b7280" }}>
              Nhập nhanh thông tin & kiểm tra trước khi tạo.
            </Typography>
          </Box>
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent sx={{ px: 3, pt: 0.5, pb: 0.5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(226,232,240,0.9)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 2.5,
                }}
              >
                {/* Card preview */}
                <Box sx={{ flex: 1 }}>
                  <Paper
                    sx={{
                      p: 2.2,
                      borderRadius: 2.5,
                      minHeight: 230,
                      background:
                        "linear-gradient(135deg, #e0f2fe 0%, #e5e7ff 40%, #eef2ff 100%)",
                      border: "1px solid rgba(148,163,184,0.35)",
                      boxShadow: "0 10px 24px rgba(148,163,184,0.35)",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      mb={1.5}
                      alignItems="center"
                    >
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: "#bfdbfe",
                          color: "#1d4ed8",
                          fontWeight: 700,
                        }}
                      >
                        {previewFullName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {previewFullName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          {previewEmail}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} mb={1.5}>
                      <Chip
                        size="small"
                        label={previewRole || "user"}
                        sx={{
                          bgcolor: "#e2e8f0",
                          color: "#334155",
                          borderRadius: "999px",
                          "& .MuiChip-label": { px: 1.4 },
                        }}
                      />
                      <Chip
                        size="small"
                        label="normal"
                        sx={{
                          bgcolor: "#e2e8f0",
                          color: "#334155",
                          borderRadius: "999px",
                          "& .MuiChip-label": { px: 1.4 },
                        }}
                      />
                    </Stack>

                    <Divider
                      sx={{ mb: 1.5, borderColor: "rgba(148,163,184,0.5)" }}
                    />

                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Số điện thoại
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {previewPhone}
                    </Typography>

                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Option email
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {previewOptionEmail}
                    </Typography>

                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Loại TK
                    </Typography>
                    <Typography variant="body2">normal</Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        mt: 2.5,
                        display: "block",
                        color: "#94a3b8",
                      }}
                    >
                      Bạn có thể chỉnh sửa thông tin sau khi tạo tài khoản.
                    </Typography>
                  </Paper>
                </Box>

                {/* Form bên phải */}
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={1.8}>
                    {/* Họ tên */}
                    <Controller
                      name="fullName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Họ và tên"
                          error={!!errors.fullName}
                          helperText={
                            (errors.fullName?.message as string) ?? " "
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon fontSize="small" />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 2 },
                          }}
                        />
                      )}
                    />

                    {/* Email */}
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Email"
                          error={!!errors.email}
                          helperText={(errors.email?.message as string) ?? " "}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon fontSize="small" />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 2 },
                          }}
                        />
                      )}
                    />

                    {/* Phone */}
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Số điện thoại"
                          error={!!errors.phone}
                          helperText={(errors.phone?.message as string) ?? " "}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon fontSize="small" />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 2 },
                          }}
                        />
                      )}
                    />

                    {/* Option email */}
                    <Controller
                      name="optionEmail"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Option email"
                          error={!!errors.optionEmail}
                          helperText={
                            (errors.optionEmail?.message as string) ?? " "
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon fontSize="small" />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 2 },
                          }}
                        />
                      )}
                    />

                    {/* Mật khẩu */}
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <FormControl
                          fullWidth
                          variant="outlined"
                          size="small"
                          sx={{ mb: 1 }}
                        >
                          <InputLabel error={!!errors.password}>
                            Mật khẩu
                          </InputLabel>
                          <OutlinedInput
                            {...field}
                            type={showPassword ? "text" : "password"}
                            label="Mật khẩu"
                            startAdornment={
                              <InputAdornment position="start">
                                <LockIcon
                                  sx={{ color: "#4b5563" }}
                                  fontSize="small"
                                />
                              </InputAdornment>
                            }
                            endAdornment={
                              <InputAdornment
                                position="end"
                                sx={{ cursor: "pointer" }}
                                onClick={() => setShowPassword((v) => !v)}
                              >
                                {showPassword ? (
                                  <VisibilityOff
                                    sx={{ color: "#111827" }}
                                    fontSize="small"
                                  />
                                ) : (
                                  <Visibility
                                    sx={{ color: "#111827" }}
                                    fontSize="small"
                                  />
                                )}
                              </InputAdornment>
                            }
                            sx={{
                              borderRadius: "999px",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderWidth: 1.5,
                              },
                            }}
                          />
                          <FormHelperText error={!!errors.password}>
                            {(errors.password?.message as string) ?? " "}
                          </FormHelperText>
                        </FormControl>
                      )}
                    />

                    {/* Xác nhận mật khẩu */}
                    <Controller
                      name="confirmPassword"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel error={!!errors.confirmPassword}>
                            Xác nhận mật khẩu
                          </InputLabel>
                          <OutlinedInput
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            label="Xác nhận mật khẩu"
                            startAdornment={
                              <InputAdornment position="start">
                                <LockIcon
                                  sx={{ color: "#4b5563" }}
                                  fontSize="small"
                                />
                              </InputAdornment>
                            }
                            endAdornment={
                              <InputAdornment
                                position="end"
                                sx={{ cursor: "pointer" }}
                                onClick={() =>
                                  setShowConfirmPassword((v) => !v)
                                }
                              >
                                {showConfirmPassword ? (
                                  <VisibilityOff
                                    sx={{ color: "#111827" }}
                                    fontSize="small"
                                  />
                                ) : (
                                  <Visibility
                                    sx={{ color: "#111827" }}
                                    fontSize="small"
                                  />
                                )}
                              </InputAdornment>
                            }
                            sx={{
                              borderRadius: "999px",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderWidth: 1.5,
                              },
                            }}
                          />
                          <FormHelperText error={!!errors.confirmPassword}>
                            {(errors.confirmPassword?.message as string) ?? " "}
                          </FormHelperText>
                        </FormControl>
                      )}
                    />

                    {/* Role */}
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          select
                          fullWidth
                          size="small"
                          label="Vai trò"
                          error={!!errors.role}
                          helperText={(errors.role?.message as string) ?? " "}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <WorkIcon fontSize="small" />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 2 },
                          }}
                        >
                          <MenuItem value="user">User</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                          <MenuItem value="manager">Manager</MenuItem>
                          <MenuItem value="staff">Staff</MenuItem>
                          <MenuItem value="franchise">Franchise</MenuItem>
                        </TextField>
                      )}
                    />
                  </Stack>
                </Box>
              </Box>
            </Paper>
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              pt: 1,
              pb: 2.4,
              justifyContent: "flex-end",
              bgcolor: "transparent",
              gap: 1,
            }}
          >
            <Button
              startIcon={<ResetIcon />}
              onClick={() => {
                reset();
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              disabled={isSubmitting}
            >
              Làm mới
            </Button>

            <Button
              onClick={() => {
                if (!isSubmitting) setCreateOpen(false);
              }}
            >
              Hủy
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={!isSubmitting && <AddUserIcon />}
              disabled={isSubmitting}
              sx={{
                borderRadius: 999,
                px: 2.6,
                py: 0.7,
                background:
                  "linear-gradient(135deg, #60a5fa 0%, #818cf8 60%, #a5b4fc 100%)",
                boxShadow: "0 10px 26px rgba(129,140,248,0.45)",
              }}
            >
              {isSubmitting ? <CircularProgress size={20} /> : "Tạo tài khoản"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Edit Dialog */}
      <EditUserDialog
        open={editOpen}
        user={editingUser}
        onClose={() => {
          setEditOpen(false);
          setEditingUser(null);
        }}
        onSave={handlePatchUser}
      />

      {/* Delete Confirm */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>
          {t("adminAddUser.dialogs.deleteTitle", "Xác nhận xóa")}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t("adminAddUser.dialogs.deleteConfirm", "Bạn có chắc muốn xóa")}{" "}
            <strong>{deletingUser?.fullName ?? ""}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>
            {t("adminAddUser.buttons.cancel", "Hủy")}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            {t("adminAddUser.buttons.delete", "Xóa")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog
        open={upgradeOpen}
        onClose={() => {
          if (!upgradeLoading) {
            setUpgradeOpen(false);
            setUpgradingUser(null);
            setUpgradeCode("");
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Nâng hạng tài khoản</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            User: <strong>{upgradingUser?.fullName}</strong>
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Mã nâng cấp (codeRandom)"
            value={upgradeCode}
            onChange={(e) => setUpgradeCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (!upgradeLoading) {
                setUpgradeOpen(false);
                setUpgradingUser(null);
                setUpgradeCode("");
              }
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmUpgrade}
            disabled={upgradeLoading}
          >
            {upgradeLoading ? (
              <CircularProgress size={20} />
            ) : (
              "Xác nhận nâng hạng"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </BaseDashboardLayout>
  );
}

/** =================== EditUserDialog =================== */
function EditUserDialog({
  open,
  user,
  onClose,
  onSave,
}: {
  open: boolean;
  user: UserRow | null;
  onClose: () => void;
  onSave: (u: UserRow) => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<UserRow | null>(user);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(user ? { ...user } : null);
  }, [user]);

  if (!form) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {t("adminAddUser.dialogs.editTitle", "Chỉnh sửa người dùng")}
      </DialogTitle>
      <DialogContent>
        <Box mt={1}>
          <Stack spacing={2}>
            <TextField
              label={t("adminAddUser.form.labels.fullName", "Họ tên")}
              fullWidth
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label={t("adminAddUser.form.labels.email", "Email")}
                fullWidth
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <TextField
                label={t("adminAddUser.form.labels.phone", "Số điện thoại")}
                fullWidth
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>
                  {t("adminAddUser.form.labels.role", "Vai trò")}
                </InputLabel>
                <Select
                  value={form.role}
                  label={t("adminAddUser.form.labels.role", "Vai trò")}
                  onChange={(e) =>
                    setForm({ ...form, role: String(e.target.value) })
                  }
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="franchise">Franchise</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>{t("common.status", "Trạng thái")}</InputLabel>
                <Select
                  value={form.status ?? ""}
                  label={t("common.status", "Trạng thái")}
                  onChange={(e) =>
                    setForm({ ...form, status: String(e.target.value) })
                  }
                >
                  <MenuItem value="active">
                    {t("common.active", "Active")}
                  </MenuItem>
                  <MenuItem value="inactive">
                    {t("common.inactive", "Inactive")}
                  </MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <FormControl fullWidth size="small">
              <InputLabel>
                {t("adminAddUser.table.columns.type", "Loại TK")}
              </InputLabel>
              <Select
                value={form.type ?? ""}
                label={t("adminAddUser.table.columns.type", "Loại TK")}
                onChange={(e) =>
                  setForm({ ...form, type: String(e.target.value) })
                }
              >
                <MenuItem value="">
                  <em>—</em>
                </MenuItem>
                <MenuItem value="normal">normal</MenuItem>
                <MenuItem value="standard">standard</MenuItem>
                <MenuItem value="premium">premium</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          {t("adminAddUser.buttons.cancel", "Hủy")}
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? (
            <CircularProgress size={22} />
          ) : (
            t("adminAddUser.buttons.save", "Lưu")
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
