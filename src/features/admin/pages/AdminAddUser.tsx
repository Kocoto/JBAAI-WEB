// src/features/admin/pages/AdminAddUser.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Button,
  Grid,
  Paper,
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
import { motion } from "framer-motion"; // 👈 thêm animation
import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";

// ------------------ Validation schema ------------------
const schema = yup.object({
  fullName: yup
    .string()
    .matches(/^\S+$/, "Tên viết liền không được cách nhau")
    .required("Họ và tên là bắt buộc"),
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  phone: yup
    .string()
    .matches(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ")
    .required("Số điện thoại là bắt buộc"),
  password: yup
    .string()
    .min(6, "Tối thiểu 6 ký tự")
    .required("Mật khẩu là bắt buộc"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu không khớp")
    .required("Xác nhận mật khẩu là bắt buộc"),
  role: yup.string().required("Vai trò là bắt buộc"),
});

type FormData = yup.InferType<typeof schema>;

type User = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string; // ISO or localized
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

  // loading simulation
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
      createdAt: new Date().toLocaleString("vi-VN"),
    };
    setUsers((prev) => [newUser, ...prev]);
    setLoading(false);
    reset();
    setSnackbarMsg("Tạo user thành công");
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
    { field: "fullName", headerName: "Họ tên", flex: 1, minWidth: 180 },
    { field: "email", headerName: "Email", flex: 1.2, minWidth: 200 },
    { field: "phone", headerName: "Số điện thoại", flex: 1, minWidth: 140 },
    {
      field: "role",
      headerName: "Vai trò",
      width: 140,
      renderCell: (params: GridRenderCellParams<User, User["role"]>) => (
        <Chip
          label={params.value ?? ""}
          size="small"
          color={roleColor(params.value ?? "")}
        />
      ),
    },

    { field: "createdAt", headerName: "Ngày tạo", width: 180 },
    {
      field: "actions",
      headerName: "Hành động",
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
    setSnackbarMsg("Cập nhật user thành công");
    setSnackbarOpen(true);
  };

  // Delete
  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    setDeleteOpen(false);
    setSnackbarMsg("Xóa user thành công");
    setSnackbarOpen(true);
  };

  return (
    <BaseDashboardLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: "1400px", // hoặc tùy kích thước bạn muốn
          mx: "auto", // căn giữa
          p: 3,
          borderRadius: 3,
          bgcolor: "background.paper",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            width: "100%",
            mx: "auto",
          }}
        >
          {/* Header */}
          <Stack direction="row" spacing={2} alignItems="center" mb={3}>
            <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
              {avatarLetter}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                ➕ Thêm người dùng mới
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Điền thông tin để tạo tài khoản người dùng mới.
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
                  label: "Họ và tên",
                  icon: <PersonIcon />,
                  type: "text",
                },
                {
                  name: "email",
                  label: "Email",
                  icon: <EmailIcon />,
                  type: "email",
                },
                {
                  name: "phone",
                  label: "Số điện thoại",
                  icon: <PhoneIcon />,
                  type: "text",
                },
                {
                  name: "password",
                  label: "Mật khẩu",
                  icon: <LockIcon />,
                  type: showPassword ? "text" : "password",
                  toggle: "password",
                },
                {
                  name: "confirmPassword",
                  label: "Xác nhận mật khẩu",
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
                          type={field.type}
                          error={!!errors[field.name as keyof FormData]}
                          helperText={
                            errors[field.name as keyof FormData]?.message
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
                        label="Vai trò"
                        fullWidth
                        error={!!errors.role}
                        helperText={errors.role?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <WorkIcon />
                            </InputAdornment>
                          ),
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
                    disabled={isSubmitting || loading}
                  >
                    Làm mới
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<AddUserIcon />}
                    disabled={isSubmitting || loading}
                  >
                    {loading ? <CircularProgress size={22} /> : "Tạo tài khoản"}
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
              placeholder="Tìm theo tên, email hoặc SĐT..."
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
              <InputLabel> Lọc theo vai trò</InputLabel>
              <Select
                value={filterRole}
                label=" Lọc theo vai trò"
                onChange={(e) => setFilterRole(String(e.target.value))}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="franchise">Franchise</MenuItem>
                <MenuItem value="user">User</MenuItem>
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
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa user <strong>{deletingUser?.fullName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Hủy</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            Xóa
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
  const [form, setForm] = useState<User | null>(user);

  useEffect(() => {
    setForm(user ? { ...user } : null);
  }, [user]);

  if (!form) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
      <DialogContent>
        <Box mt={1}>
          <Grid container spacing={2}>
            <Grid sx={{ xs: 12 }}>
              <TextField
                label="Họ và tên"
                fullWidth
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </Grid>
            <Grid sx={{ xs: 12, md: 6 }}>
              <TextField
                label="Email"
                fullWidth
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Grid>
            <Grid sx={{ xs: 12, md: 6 }}>
              <TextField
                label="Số điện thoại"
                fullWidth
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Grid>
            <Grid sx={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Vai trò</InputLabel>
                <Select
                  value={form.role}
                  label="Vai trò"
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="franchise">Franchise</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={() => {
            if (form) onSave(form);
          }}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
