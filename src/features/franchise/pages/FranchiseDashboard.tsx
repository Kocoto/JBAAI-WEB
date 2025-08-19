import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";
import {
  Box,
  Fade,
  Stack,
  Typography,
  alpha,
  Button,
  TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import axios from "axios";

export default function FranchiseDashboard() {
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState("");
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("Không tìm thấy token trong localStorage");
          return;
        }

        // Gọi song song 2 API
        const [quotaRes, meRes] = await Promise.all([
          axios.get("http://localhost:3000/api/v1/franchise/me/quota", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/api/v1/franchise/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log("Quota API:", quotaRes.data);
        console.log("Me API:", meRes.data);

        const quotaData = quotaRes.data?.data?.activeQuotaDetails || [];
        const meData = meRes.data?.data || {};

        if (quotaData.length === 0) {
          console.warn("Quota API không có dữ liệu");
        }

        const mappedData = quotaData.map((item: any, index: number) => ({
          id: item.ledgerId || `${index + 1}-${Date.now()}`,
          name: meData.name || "Chưa có tên",
          email: meData.email || "N/A",
          phone: meData.phone || "N/A",
          role: meData.role || "N/A",
          type: meData.type || "N/A",
          ledgerId: item.ledgerId || "N/A",
          totalAllocated: item.totalAllocated ?? 0,
          consumedByOwnInvites: item.consumedByOwnInvites ?? 0,
          allocatedToChildren: item.allocatedToChildren ?? 0,
          availableQuota: item.availableQuota ?? 0,
          status: item.status || "N/A",
          createdAt: item.createdAt
            ? new Date(item.createdAt).toLocaleDateString()
            : "N/A",
        }));

        console.log("Mapped rows:", mappedData);

        setRows(mappedData);

      } catch (error: any) {
        console.error(
          "Lỗi khi gọi API:",
          error.response?.data || error.message
        );
      }
    };

    fetchData();
  }, []);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "name", headerName: "Tên", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "phone", headerName: "Số điện thoại", flex: 1 },
    { field: "role", headerName: "Vai trò", flex: 1 },
    { field: "type", headerName: "Loại", flex: 1 },
    { field: "ledgerId", headerName: "Ledger ID", flex: 1 },
    { field: "totalAllocated", headerName: "Tổng cấp", flex: 1 },
    { field: "consumedByOwnInvites", headerName: "Đã dùng", flex: 1 },
    { field: "allocatedToChildren", headerName: "Cấp cho con", flex: 1 },
    { field: "availableQuota", headerName: "Còn lại", flex: 1 },
    { field: "status", headerName: "Trạng thái", flex: 1 },
    { field: "createdAt", headerName: "Ngày tạo", flex: 1 },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 150,
      renderCell: () => (
        <Button variant="contained" size="small" color="primary">
          Cấp phát
        </Button>
      ),
    },
  ];

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
                )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                display: "flex",
                alignItems: "center",
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
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
                Dữ liệu kết hợp từ 2 API
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
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            sx={{ minWidth: 120 }}
          >
            Tìm kiếm
          </Button>
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
            }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
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
      </Box>
    </BaseDashboardLayout>
  );
}
