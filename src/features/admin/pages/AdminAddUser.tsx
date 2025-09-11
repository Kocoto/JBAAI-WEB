// src/features/admin/pages/AdminAddUser.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Paper } from "@mui/material";

import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
  Stack,
  Avatar,
  InputAdornment,
  Chip,
  Divider,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
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
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { motion } from "framer-motion";
import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";
import { useTranslation } from "react-i18next";

// ------------------ Types ------------------
type FormData = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: string;
};

type User = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
};

// ------------------ Helper ------------------
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

// Animation variants
const formVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.4 },
  }),
};

// ------------------ Component ------------------
export default function AdminAddUser() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith("vi") ? "vi-VN" : "en-US";

  // Validation schema (i18n)
  const schema = useMemo(
    () =>
      yup.object({
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
          .matches(
            /^(0|\+84)[0-9]{9,10}$/,
            t("adminAddUser.validation.phoneInvalid")
          )
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
        role: yup.string().required(t("adminAddUser.validation.roleRequired")),
      }),
    [t, i18n.language]
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "",
    },
  });

  // users state
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("users");
    return saved ? JSON.parse(saved) : [];
  });

  // sync users with localStorage
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  const [loading, setLoading] = useState(false);

  // search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  // snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string>("");

  // edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const nameWatch = watch("fullName");
  const avatarLetter = nameWatch ? nameWatch.charAt(0).toUpperCase() : "?";

  // Add user handler
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const newUser: User = {
      id: Date.now(),
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      createdAt: new Date().toLocaleString(locale),
    };
    setUsers((prev) => [newUser, ...prev]);
    setLoading(false);
    reset();
    setSnackbarMsg(t("adminAddUser.snackbar.createSuccess"));
    setSnackbarOpen(true);
  };

  // Filtered rows
  const filteredRows = useMemo(() => {
    return users.filter((u) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q);

      const matchesRole = filterRole === "all" || u.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 80,
      renderCell: (params: GridRenderCellParams<any, User>) => (
        <Avatar sx={{ bgcolor: "primary.main" }}>
          {params.row.fullName?.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      field: "fullName",
      headerName: t("adminAddUser.table.columns.fullName"),
      flex: 1,
      minWidth: 180,
    },
    {
      field: "email",
      headerName: t("adminAddUser.table.columns.email"),
      flex: 1.2,
      minWidth: 200,
    },
    {
      field: "phone",
      headerName: t("adminAddUser.table.columns.phone"),
      flex: 1,
      minWidth: 140,
    },
    {
      field: "role",
      headerName: t("adminAddUser.table.columns.role"),
      width: 140,
      renderCell: (params: GridRenderCellParams<User, User["role"]>) => (
        <Chip
          label={params.value ? t(`adminAddUser.roles.${params.value}`) : ""}
          size="small"
          color={roleColor(params.value ?? "")}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: t("adminAddUser.table.columns.createdAt"),
      width: 180,
    },
    {
      field: "actions",
      headerName: t("adminAddUser.table.columns.actions"),
      width: 140,
      renderCell: (params: GridRenderCellParams<any, User>) => (
        <Stack direction="row" spacing={1}>
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

  // Edit save
  const handleEditSave = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setEditOpen(false);
    setSnackbarMsg(t("adminAddUser.snackbar.updateSuccess"));
    setSnackbarOpen(true);
  };

  // Delete
  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    setDeleteOpen(false);
    setSnackbarMsg(t("adminAddUser.snackbar.deleteSuccess"));
    setSnackbarOpen(true);
  };

  return (
    <BaseDashboardLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: "1400px",
          mx: "auto",
          p: 3,
          borderRadius: 3,
          bgcolor: "background.paper",
          border: "2px solid #61666f",
        }}
      >
        <Paper
          elevation={6}
          style={{
            padding: "24px",
            borderRadius: 12,
            width: "100%",
            background: "inherit",
          }}
        >
          {/* Header */}
          <Stack direction="row" spacing={2} alignItems="center" mb={3}>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                ➕ {t("adminAddUser.header.title")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("adminAddUser.header.subtitle")}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              {[
                {
                  name: "fullName",
                  label: t("adminAddUser.form.labels.fullName"),
                  icon: <PersonIcon />,
                  type: "text",
                },
                {
                  name: "email",
                  label: t("adminAddUser.form.labels.email"),
                  icon: <EmailIcon />,
                  type: "email",
                },
                {
                  name: "phone",
                  label: t("adminAddUser.form.labels.phone"),
                  icon: <PhoneIcon />,
                  type: "text",
                },
                {
                  name: "password",
                  label: t("adminAddUser.form.labels.password"),
                  icon: <LockIcon />,
                  type: showPassword ? "text" : "password",
                  toggle: "password",
                },
                {
                  name: "confirmPassword",
                  label: t("adminAddUser.form.labels.confirmPassword"),
                  icon: <LockIcon />,
                  type: showConfirmPassword ? "text" : "password",
                  toggle: "confirm",
                },
              ].map((field, i) => (
                <Grid sx={{ xs: 12, md: 6 }} key={field.name}>
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
                          label={field.label}
                          fullWidth
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
                            endAdornment:
                              field.toggle === "password" ? (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowPassword((s) => !s)}
                                    edge="end"
                                    size="small"
                                  >
                                    {showPassword ? (
                                      <VisibilityOff />
                                    ) : (
                                      <Visibility />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ) : field.toggle === "confirm" ? (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() =>
                                      setShowConfirmPassword((s) => !s)
                                    }
                                    edge="end"
                                    size="small"
                                  >
                                    {showConfirmPassword ? (
                                      <VisibilityOff />
                                    ) : (
                                      <Visibility />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ) : null,
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

              {/* Role select */}
              <Grid sx={{ xs: 12 }}>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  custom={5}
                  variants={formVariants}
                >
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label={t("adminAddUser.form.labels.role")}
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
                            "&:hover fieldset": {
                              border: "2px solid #42464d",
                            },
                            "&.Mui-focused fieldset": {
                              border: "2px solid #1976d2",
                            },
                          },
                        }}
                      >
                        <MenuItem value="admin">
                          {t("adminAddUser.roles.admin")}
                        </MenuItem>
                        <MenuItem value="manager">
                          {t("adminAddUser.roles.manager")}
                        </MenuItem>
                        <MenuItem value="staff">
                          {t("adminAddUser.roles.staff")}
                        </MenuItem>
                        <MenuItem value="franchise">
                          {t("adminAddUser.roles.franchise")}
                        </MenuItem>
                        <MenuItem value="user">
                          {t("adminAddUser.roles.user")}
                        </MenuItem>
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
                    disabled={isSubmitting || loading}
                  >
                    {t("adminAddUser.buttons.reset")}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<AddUserIcon />}
                    disabled={isSubmitting || loading}
                  >
                    {loading ? (
                      <CircularProgress size={22} />
                    ) : (
                      t("adminAddUser.buttons.create")
                    )}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>

          {/* Search & Filters */}
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
              placeholder={t("adminAddUser.search.placeholder")}
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

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>
                {t("adminAddUser.filters.roleFilterLabel")}
              </InputLabel>
              <Select
                value={filterRole}
                label={t("adminAddUser.filters.roleFilterLabel")}
                onChange={(e) => setFilterRole(String(e.target.value))}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">
                  {t("adminAddUser.filters.roles.all")}
                </MenuItem>
                <MenuItem value="admin">
                  {t("adminAddUser.roles.admin")}
                </MenuItem>
                <MenuItem value="manager">
                  {t("adminAddUser.roles.manager")}
                </MenuItem>
                <MenuItem value="staff">
                  {t("adminAddUser.roles.staff")}
                </MenuItem>
                <MenuItem value="franchise">
                  {t("adminAddUser.roles.franchise")}
                </MenuItem>
                <MenuItem value="user">{t("adminAddUser.roles.user")}</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* DataGrid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ height: 420, maxWidth: "1400px" }}>
              <DataGrid
                rows={filteredRows}
                columns={columns}
                getRowId={(row) => row.id}
                pageSizeOptions={[5, 10]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 5 } },
                }}
                disableRowSelectionOnClick
                sx={{
                  bgcolor: "background.paper",
                  border: "2px solid #61666f",
                  borderRadius: 2,
                  "& .MuiDataGrid-columnHeaders": {
                    bgcolor: (theme) =>
                      theme.palette.mode === "light" ? "grey.100" : "grey.900",
                    fontWeight: 700,
                  },
                }}
              />
            </Box>
          </motion.div>
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
        onSave={(updated) => handleEditSave(updated)}
      />

      {/* Delete Confirm */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>{t("adminAddUser.dialogs.deleteTitle")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("adminAddUser.dialogs.deleteConfirm", {
              name: deletingUser?.fullName ?? "",
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>
            {t("adminAddUser.buttons.cancel")}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            {t("adminAddUser.buttons.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </BaseDashboardLayout>
  );
}

// ------------------ EditUserDialog ------------------
function EditUserDialog({
  open,
  user,
  onClose,
  onSave,
}: {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (u: User) => void;
}) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState<User | null>(user);

  useEffect(() => {
    setForm(user ? { ...user } : null);
  }, [user]);

  if (!form) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t("adminAddUser.dialogs.editTitle")}</DialogTitle>
      <DialogContent>
        <Box mt={1}>
          <Grid container spacing={2}>
            <Grid sx={{ xs: 12 }}>
              <TextField
                label={t("adminAddUser.form.labels.fullName")}
                fullWidth
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </Grid>
            <Grid sx={{ xs: 12, md: 6 }}>
              <TextField
                label={t("adminAddUser.form.labels.email")}
                fullWidth
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Grid>
            <Grid sx={{ xs: 12, md: 6 }}>
              <TextField
                label={t("adminAddUser.form.labels.phone")}
                fullWidth
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Grid>
            <Grid sx={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("adminAddUser.form.labels.role")}</InputLabel>
                <Select
                  value={form.role}
                  label={t("adminAddUser.form.labels.role")}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <MenuItem value="admin">
                    {t("adminAddUser.roles.admin")}
                  </MenuItem>
                  <MenuItem value="manager">
                    {t("adminAddUser.roles.manager")}
                  </MenuItem>
                  <MenuItem value="staff">
                    {t("adminAddUser.roles.staff")}
                  </MenuItem>
                  <MenuItem value="franchise">
                    {t("adminAddUser.roles.franchise")}
                  </MenuItem>
                  <MenuItem value="user">
                    {t("adminAddUser.roles.user")}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t("adminAddUser.buttons.cancel")}</Button>
        <Button
          variant="contained"
          onClick={() => {
            if (form) onSave(form);
          }}
        >
          {t("adminAddUser.buttons.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
