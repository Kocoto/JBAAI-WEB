import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";
import {
  Box,
  Fade,
  Stack,
  Typography,
  alpha,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  useMediaQuery,
  LinearProgress,
  Tooltip,
  Popover,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import InfoIcon from "@mui/icons-material/Info";
import BarChartIcon from "@mui/icons-material/BarChart";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useState, useEffect, useMemo, forwardRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import Slide, { SlideProps } from "@mui/material/Slide";
import { ForwardRefExoticComponent, RefAttributes } from "react";

// Transition Dialog
const Transition: ForwardRefExoticComponent<
  SlideProps & RefAttributes<unknown>
> = forwardRef(function Transition(props: SlideProps, ref: React.Ref<unknown>) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Row type
interface FranchiseRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  type: string;
  ledgerId: string;
  totalAllocated: number;
  consumedByOwnInvites: number;
  allocatedToChildren: number;
  availableQuota: number;
  status: string;
  createdAt: string;
}

export default function FranchiseChildList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [searchValue, setSearchValue] = useState("");
  const [rows, setRows] = useState<FranchiseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<FranchiseRow | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [popoverData, setPopoverData] = useState<FranchiseRow | null>(null);

  // Fetch API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODUwZTVlOTA4OGY5ZDU5ZmU2N2Y3ODkiLCJjbGllbnRJZCI6IndlYi1hcHAtdjEiLCJpYXQiOjE3NTYxOTI0MjksImV4cCI6MTc1NjE5NjAyOX0.3nj5cdI5PGAo2alH_MoagkzukTH2HRluLCk_gafYerU"; // Thay token thực tế
        const res = await axios.get(
          "https://jbaai-y7mb.onrender.com/api/v1/franchise/me/details",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data?.data || {};
        const franchiseInfo = data.franchiseInfo?.userId || {};
        const quotaData = data.quotaInfo?.activeQuotaDetails || [];

        const mappedData: FranchiseRow[] = quotaData.map(
          (item: any, index: number) => ({
            id: item.ledgerId || `${index + 1}-${Date.now()}`,
            name: franchiseInfo.franchiseName || "Chưa có tên",
            email: franchiseInfo.email || "N/A",
            phone: franchiseInfo.phone || "N/A",
            role: franchiseInfo.role || "N/A",
            type: franchiseInfo.type || "N/A",
            ledgerId: item.ledgerId || "N/A",
            totalAllocated: item.totalAllocated ?? 0,
            consumedByOwnInvites: item.consumedByOwnInvites ?? 0,
            allocatedToChildren: item.allocatedToChildren ?? 0,
            availableQuota: item.availableQuota ?? 0,
            status: item.status || "N/A",
            createdAt: item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : "N/A",
          })
        );

        setRows(mappedData);
      } catch (error: any) {
        console.error(
          "❌ Lỗi khi gọi API:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter search
  const filteredRows = useMemo(() => {
    if (!searchValue) return rows;
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        row.email.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, rows]);

  // Status Chip
  const renderStatus = (status: string) => {
    const value = status?.toLowerCase();
    let bgColor = theme.palette.grey[300];
    let color = theme.palette.text.primary;
    if (value === "active") {
      bgColor = `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main})`;
      color = "#fff";
    } else if (value === "inactive") {
      bgColor = `linear-gradient(135deg, ${theme.palette.error.light}, ${theme.palette.error.main})`;
      color = "#fff";
    } else if (value === "pending") {
      bgColor = `linear-gradient(135deg, ${theme.palette.warning.light}, ${theme.palette.warning.main})`;
      color = "#fff";
    }
    return (
      <motion.div whileHover={{ scale: 1.05 }}>
        <Chip
          label={status}
          size="small"
          sx={{ background: bgColor, color, fontWeight: 600, minWidth: 70 }}
        />
      </motion.div>
    );
  };

  // Columns DataGrid
  const columns: GridColDef[] = [
    { field: "name", headerName: "Tên Franchise", flex: 1.2, minWidth: 150 },
    { field: "email", headerName: "Email", flex: 1.5, minWidth: 180 },
    !isMobile && { field: "phone", headerName: "SĐT", flex: 1 },
    !isMobile && { field: "role", headerName: "Vai trò", flex: 1 },
    {
      field: "quotaProgress",
      headerName: "Quota đã dùng",
      flex: 1.5,
      renderCell: (params: GridRenderCellParams<FranchiseRow>) => {
        const value = params.row.consumedByOwnInvites;
        const total = params.row.totalAllocated || 1;
        const percent = Math.min((value / total) * 100, 100);
        return (
          <Tooltip title="Click để xem chi tiết quota">
            <Box
              sx={{ width: "100%", cursor: "pointer" }}
              onClick={(e) => {
                setAnchorEl(e.currentTarget);
                setPopoverData(params.row);
              }}
            >
              <LinearProgress
                variant="determinate"
                value={percent}
                sx={{ height: 8, borderRadius: 5 }}
              />
              <Typography variant="caption">{`${value}/${total}`}</Typography>
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 1,
      renderCell: (params: GridRenderCellParams<FranchiseRow, string>) =>
        renderStatus(params.value || ""),
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 220,
      renderCell: (params: GridRenderCellParams<FranchiseRow>) => (
        <Stack direction="row" spacing={1}>
          <motion.div whileHover={{ scale: 1.08 }}>
            <Button variant="contained" size="small" color="primary">
              Cấp phát
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.08 }}>
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              onClick={() => {
                setSelectedRow(params.row);
                setOpenDialog(true);
              }}
            >
              Xem chi tiết
            </Button>
          </motion.div>
        </Stack>
      ),
    },
  ].filter(Boolean) as GridColDef[];

  return (
    <BaseDashboardLayout>
      <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
        {/* Header */}
        <Fade in timeout={600}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.primary.main,
                  0.1
                )}, ${alpha(theme.palette.primary.main, 0.05)})`,
                display: "flex",
                alignItems: "center",
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                boxShadow: theme.shadows[3],
              }}
            >
              <PersonIcon
                sx={{ color: theme.palette.primary.main, fontSize: 36 }}
              />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                Danh sách Quota & Thông tin Franchise
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Dashboard trực quan với animation & biểu đồ mini
              </Typography>
            </Box>
          </Stack>
        </Fade>

        {/* Search */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Tìm kiếm..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            sx={{ width: 300 }}
          />
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              sx={{ minWidth: 120 }}
            >
              Tìm kiếm
            </Button>
          </motion.div>
        </Stack>

        {/* DataGrid */}
        <Fade in timeout={700}>
          <Box
            sx={{
              height: 600,
              width: "100%",
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
              boxShadow: theme.shadows[2],
              "& .MuiDataGrid-row:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                transform: "scale(1.01)",
                transition: "0.3s",
              },
            }}
          >
            <DataGrid
              rows={filteredRows}
              columns={columns}
              loading={loading}
              pageSizeOptions={[10, 20, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 20 } },
              }}
              checkboxSelection
              disableColumnResize
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: `2px solid ${theme.palette.divider}`,
                },
              }}
            />
          </Box>
        </Fade>

        {/* Popover PieChart mini */}
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          {popoverData && (
            <Box sx={{ width: 250, height: 200, p: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Đã dùng",
                        value: popoverData.consumedByOwnInvites,
                      },
                      { name: "Còn lại", value: popoverData.availableQuota },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={30}
                    label
                  >
                    <Cell fill={theme.palette.error.main} />
                    <Cell fill={theme.palette.success.main} />
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Popover>

        {/* Dialog chi tiết */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
          TransitionComponent={Transition}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Thông tin chi tiết Franchise
          </DialogTitle>
          <DialogContent dividers>
            {selectedRow ? (
              <Stack spacing={3}>
                {/* Thông tin cơ bản */}
                <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <InfoIcon color="primary" />
                      <Typography variant="h6">Thông tin cơ bản</Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid sx={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Tên
                        </Typography>
                        <Typography>{selectedRow.name}</Typography>
                      </Grid>
                      <Grid sx={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography>{selectedRow.email}</Typography>
                      </Grid>
                      <Grid sx={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          SĐT
                        </Typography>
                        <Typography>{selectedRow.phone}</Typography>
                      </Grid>
                      <Grid sx={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Role
                        </Typography>
                        <Typography>{selectedRow.role}</Typography>
                      </Grid>
                      <Grid sx={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Type
                        </Typography>
                        <Typography>{selectedRow.type}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Quota */}
                <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <BarChartIcon color="success" />
                      <Typography variant="h6">Quota</Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid sx={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Tổng cấp
                        </Typography>
                        <Typography>{selectedRow.totalAllocated}</Typography>
                      </Grid>
                      <Grid sx={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Đã dùng
                        </Typography>
                        <Typography>
                          {selectedRow.consumedByOwnInvites}
                        </Typography>
                      </Grid>
                      <Grid sx={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Đã phân bổ
                        </Typography>
                        <Typography>
                          {selectedRow.allocatedToChildren}
                        </Typography>
                      </Grid>
                      <Grid sx={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Còn lại
                        </Typography>
                        <Typography>{selectedRow.availableQuota}</Typography>
                      </Grid>
                      {/* <Grid sx={{ height: 200, xs: 12 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: "Đã dùng",
                                  value: selectedRow.consumedByOwnInvites,
                                },
                                {
                                  name: "Còn lại",
                                  value: selectedRow.availableQuota,
                                },
                              ]}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={70}
                              innerRadius={40}
                              label
                            >
                              <Cell fill={theme.palette.error.main} />
                              <Cell fill={theme.palette.success.main} />
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Grid> */}
                    </Grid>
                  </CardContent>
                </Card>

                {/* Thông tin khác */}
                <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ListAltIcon color="secondary" />
                      <Typography variant="h6">Thông tin khác</Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid sx={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Ledger ID
                        </Typography>
                        <Typography>{selectedRow.ledgerId}</Typography>
                      </Grid>
                      <Grid sx={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Ngày tạo
                        </Typography>
                        <Typography>{selectedRow.createdAt}</Typography>
                      </Grid>
                      <Grid sx={{ xs: 6 }}>
                        <Typography variant="body2" color="text.secondary">
                          Trạng thái
                        </Typography>
                        {renderStatus(selectedRow.status)}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Stack>
            ) : (
              <Typography>Không có dữ liệu</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Đóng</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </BaseDashboardLayout>
  );
}
