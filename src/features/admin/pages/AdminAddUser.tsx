// src/features/admin/pages/AdminAddUser.tsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import {
  Box,
  Paper,
  Grid,
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

/** =================== API PATHS (lock theo Postman) =================== */
const baseHasV1 = String(apiClient?.defaults?.baseURL ?? "").includes(
  "/api/v1"
);
const API_PREFIX = baseHasV1 ? "" : "/api/v1";

const USERS_LIST_PATH = `${API_PREFIX}/admin/users`; // GET list
const USERS_CREATE_PATH = `${API_PREFIX}/admin/users/create`; // POST create
const userPath = (id: string) => `${USERS_LIST_PATH}/${id}`;

/** =================== Types =================== */
type FormData = {
  fullName: string; // -> username
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: string;
  optionEmail?: string; // optional để khớp schema
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
  data?: ApiUser[];
  total?: number;
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalDocs?: number;
  };
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

const formVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.4 },
  }),
};

const pickList = (payload: any): ApiUser[] =>
  (Array.isArray(payload?.data) && payload.data) ||
  (Array.isArray(payload) && payload) ||
  [];

const pickTotal = (payload: any, headers: any): number | undefined => {
  const p = payload?.pagination || {};
  const headerTotal = Number(headers?.["x-total-count"]);
  return (
    (typeof payload?.total === "number" && payload.total) ||
    (typeof p?.total === "number" && p.total) ||
    (typeof p?.totalDocs === "number" && p.totalDocs) ||
    (!Number.isNaN(headerTotal) && headerTotal) ||
    undefined
  );
};

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
  } = useForm<FormData>({
    resolver: yupResolver(schema), // ✅ KHÔNG truyền generics để tránh xung đột
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "",
      optionEmail: "", // UI nhận string, schema transform -> undefined
    },
  });

  /** ---------- Users (server pagination) ---------- */
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState<number>(0);

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

  const fetchUsers = useCallback(
    async (page0 = paginationModel.page, size = paginationModel.pageSize) => {
      setLoadingUsers(true);
      setUsersError(null);
      try {
        const page1 = page0 + 1; // API 1-based

        const res = await apiClient.get<ApiUsersResponse>(USERS_LIST_PATH, {
          headers: {
            page: String(page1),
            limit: String(size),
            "x-page": String(page1),
            "x-limit": String(size),
            "X-Page": String(page1),
            "X-Limit": String(size),
          },
          params: { page: page1, limit: size },
        });

        const payload = res?.data ?? {};
        const list = pickList(payload);
        setRows(list.map(mapApiToRow));

        const total = pickTotal(payload, (res as any)?.headers);
        if (typeof total === "number") {
          setRowCount(total);
        } else {
          const hasNext = list.length === size;
          const estimated = hasNext
            ? page1 * size + 1
            : (page1 - 1) * size + list.length;
          setRowCount(estimated);
        }
      } catch (e: any) {
        console.error(e);
        setUsersError(
          e?.response?.data?.message || e?.message || "Fetch users failed"
        );
        setRows([]);
        setRowCount(0);
      } finally {
        setLoadingUsers(false);
      }
    },
    [paginationModel.page, paginationModel.pageSize, mapApiToRow]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, paginationModel.page, paginationModel.pageSize]);

  /** ---------- Create user (POST /admin/users/create) ---------- */
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  async function createUser(payload: any) {
    const res = await apiClient.post(USERS_CREATE_PATH, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res?.data?.data ?? res?.data;
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

      // Optimistic prepend nếu đang ở trang đầu
      if (created && paginationModel.page === 0) {
        const newRow = mapApiToRow(created as ApiUser);
        setRows((prev) =>
          [newRow, ...prev.filter((r) => r.id !== newRow.id)].slice(
            0,
            paginationModel.pageSize
          )
        );
        setRowCount((rc) => (typeof rc === "number" ? rc + 1 : rc));
      }

      // Reset về trang 1 & refetch để sync
      await fetchUsers(0, paginationModel.pageSize);
      setPaginationModel((p) => ({ ...p, page: 0 }));

      setSnackbarSeverity("success");
      setSnackbarMsg(
        t("adminAddUser.snackbar.createSuccess", "Tạo người dùng thành công")
      );
      setSnackbarOpen(true);
      reset();
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (e: any) {
      console.error(e);
      setSnackbarSeverity("error");
      setSnackbarMsg(
        e?.response?.data?.message || e?.message || "Create user failed"
      );
      setSnackbarOpen(true);
    }
  };

  /** ---------- Filter UI ---------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return rows.filter((u) => {
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
  }, [rows, searchTerm, filterRole, filterStatus]);

  const activeFilters =
    searchTerm.trim() !== "" || filterRole !== "all" || filterStatus !== "all";

  /** ---------- Edit/Delete ---------- */
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);

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
      await fetchUsers();
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
      if (rows.length === 1 && paginationModel.page > 0) {
        setPaginationModel((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        await fetchUsers();
      }
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
      width: 168,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<any, UserRow>) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title={t("common.upgrade", "Nâng hạng")}>
            <IconButton
              size="small"
              onClick={() => {
                /* UI nâng hạng nếu cần */
              }}
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
                onClick={() => fetchUsers()}
                disabled={loadingUsers}
              >
                {t("common.refresh", "Tải lại Users")}
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Create form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              {[
                {
                  name: "fullName",
                  label: t("adminAddUser.form.labels.fullName", "Họ tên"),
                  icon: <PersonIcon />,
                  type: "text",
                },
                {
                  name: "email",
                  label: t("adminAddUser.form.labels.email", "Email"),
                  icon: <EmailIcon />,
                  type: "email",
                },
                {
                  name: "phone",
                  label: t("adminAddUser.form.labels.phone", "Số điện thoại"),
                  icon: <PhoneIcon />,
                  type: "text",
                },
                {
                  name: "optionEmail",
                  label: "Option Email",
                  icon: <EmailIcon />,
                  type: "email",
                },
                {
                  name: "password",
                  label: t("adminAddUser.form.labels.password", "Mật khẩu"),
                  icon: <LockIcon />,
                  type: showPassword ? "text" : "password",
                  toggle: "password",
                },
                {
                  name: "confirmPassword",
                  label: t(
                    "adminAddUser.form.labels.confirmPassword",
                    "Xác nhận mật khẩu"
                  ),
                  icon: <LockIcon />,
                  type: showConfirmPassword ? "text" : "password",
                  toggle: "confirm",
                },
              ].map((field, i) => (
                <Grid key={field.name} sx={{ xs: 12, md: 6 }}>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    variants={formVariants}
                  >
                    <Controller
                      name={field.name as keyof FormData}
                      control={control}
                      render={({ field: f }) => (
                        <TextField
                          {...f}
                          fullWidth
                          label={field.label}
                          type={field.type as string}
                          error={!!errors[field.name as keyof FormData]}
                          helperText={
                            (errors[field.name as keyof FormData]?.message as
                              | string
                              | undefined) ?? " "
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {field.icon}
                              </InputAdornment>
                            ),
                            endAdornment: field.toggle ? (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  edge="end"
                                  onClick={() =>
                                    field.toggle === "password"
                                      ? setShowPassword((s) => !s)
                                      : setShowConfirmPassword((s) => !s)
                                  }
                                >
                                  {(
                                    field.toggle === "password"
                                      ? showPassword
                                      : showConfirmPassword
                                  ) ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ) : undefined,
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": { border: "2px solid #61666f" },
                              "&:hover fieldset": {
                                border: "2px solid #42464d",
                              },
                              "&.Mui-focused fieldset": {
                                border: "2px solid #1976d2",
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </motion.div>
                </Grid>
              ))}

              {/* Role */}
              <Grid sx={{ xs: 12 }}>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  custom={6}
                  variants={formVariants}
                >
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label={t("adminAddUser.form.labels.role", "Vai trò")}
                        fullWidth
                        error={!!errors.role}
                        helperText={(errors.role?.message as string) ?? " "}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <WorkIcon />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": { border: "2px solid #61666f" },
                            "&:hover fieldset": { border: "2px solid #42464d" },
                            "&.Mui-focused fieldset": {
                              border: "2px solid #1976d2",
                            },
                          },
                        }}
                      >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="manager">Manager</MenuItem>
                        <MenuItem value="staff">Staff</MenuItem>
                        <MenuItem value="franchise">Franchise</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                      </TextField>
                    )}
                  />
                </motion.div>
              </Grid>

              {/* Buttons */}
              <Grid sx={{ xs: 12, md: 6 }}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<ResetIcon />}
                    onClick={() => {
                      reset();
                      setShowPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    disabled={isSubmitting}
                  >
                    {t("adminAddUser.buttons.reset", "Làm mới")}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<AddUserIcon />}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={22} />
                    ) : (
                      t("adminAddUser.buttons.create", "Tạo mới")
                    )}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>

          {/* Filters */}
          <Divider sx={{ my: 3 }} />
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
                rows={activeFilters ? filteredRows : rows}
                columns={columns}
                getRowId={(row) => row.id}
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={(m) => setPaginationModel(m)}
                rowCount={rowCount}
                loading={loadingUsers}
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
          <Grid container spacing={2}>
            <Grid sx={{ xs: 12 }}>
              <TextField
                label={t("adminAddUser.form.labels.fullName", "Họ tên")}
                fullWidth
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </Grid>
            <Grid sx={{ xs: 12, md: 6 }}>
              <TextField
                label={t("adminAddUser.form.labels.email", "Email")}
                fullWidth
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Grid>
            <Grid sx={{ xs: 12, md: 6 }}>
              <TextField
                label={t("adminAddUser.form.labels.phone", "Số điện thoại")}
                fullWidth
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Grid>
            <Grid sx={{ xs: 12, md: 6 }}>
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
            </Grid>
            <Grid sx={{ xs: 12, md: 6 }}>
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
            </Grid>
            <Grid sx={{ xs: 12, md: 6 }}>
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
            </Grid>
          </Grid>
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
