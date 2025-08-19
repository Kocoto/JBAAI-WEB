import {
  Typography,
  useTheme,
  alpha,
  Box,
  Fade,
  Stack,
  TextField,
  Grid,
  Paper,
  Button,
  LinearProgress,
} from "@mui/material";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useFranchise } from "../../hooks/useFranchise";
import { useState } from "react";
import { AllocateQuotaPayload } from "../../types/franchise.type";

export default function AllocateQuota() {
  const theme = useTheme();
  const { allocateQuota } = useFranchise();

  const [formData, setFormData] = useState<AllocateQuotaPayload>({
    childFranchiseUserId: "",
    amountToAllocate: 0,
    sourceLedgerEntryId: "",
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock data
  const rows = [
    { id: 1, name: "Nguyễn Văn A", email: "a@example.com", phone: "0123456789" },
    { id: 2, name: "Trần Thị B", email: "b@example.com", phone: "0987654321" },
    { id: 3, name: "Lê Văn C", email: "c@example.com", phone: "0111222333" },
  ];

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Tên", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "phone", headerName: "SĐT", flex: 1 },
    {
      field: "actions",
      headerName: "Thao tác",
      flex: 1,
      renderCell: () => (
        <Button variant="outlined" color="primary" size="small">
          Câp phát
        </Button>
      ),
    },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    allocateQuota(formData);
  };

  const CustomLoadingOverlay = () => (
    <Stack alignItems="center" justifyContent="center" height="100%" spacing={2}>
      <Box sx={{ width: "60%" }}>
        <LinearProgress color="primary" />
      </Box>
      <Typography variant="body2" color="text.secondary">
        Đang tải dữ liệu...
      </Typography>
    </Stack>
  );

  const CustomNoRowsOverlay = () => (
    <Stack alignItems="center" justifyContent="center" height="100%" spacing={2}>
      <Box
        component="img"
        src="/empty-state.svg"
        alt="No data"
        sx={{ width: 120, height: 120, opacity: 0.5, filter: "grayscale(100%)" }}
      />
      <Typography variant="h6" color="text.secondary">
        Không có dữ liệu
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Dữ liệu sẽ xuất hiện ở đây khi có
      </Typography>
    </Stack>
  );

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Fade in timeout={600}>
        <Box>
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
              <CardGiftcardIcon sx={{ color: theme.palette.primary.main, fontSize: 36 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                Cấp phát Quota
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Cấp phát Quota cho các Franchise con
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Fade>



      {/* Search box */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          display: "flex",
          gap: 2,
          alignItems: "center",
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Tìm kiếm..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button variant="contained" color="primary" startIcon={<SearchIcon />}>
          Tìm kiếm
        </Button>
      </Paper>

      {/* DataGrid */}
      <Fade in={!loading} timeout={700}>
        <Paper
          elevation={3}
          sx={{
            height: 600,
            width: "100%",
            borderRadius: 2,
            overflow: "hidden",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <DataGrid
            checkboxSelection
            rows={rows}
            columns={columns}
            getRowClassName={(params) =>
              params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
            }
            initialState={{
              pagination: { paginationModel: { pageSize: 20 } },
            }}
            pageSizeOptions={[10, 20, 50]}
            disableColumnResize
            density="comfortable"
            slots={{
              loadingOverlay: CustomLoadingOverlay,
              noRowsOverlay: CustomNoRowsOverlay,
            }}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                borderBottom: `2px solid ${theme.palette.divider}`,
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 600,
                fontSize: "0.875rem",
                textTransform: "uppercase",
              },
              "& .MuiDataGrid-row": {
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  transform: "translateY(-1px)",
                },
                "&.even": {
                  backgroundColor: alpha(theme.palette.grey[100], 0.5),
                },
              },
              "& .MuiTablePagination-root": {
                borderTop: `1px solid ${theme.palette.divider}`,
              },
              "& .MuiDataGrid-virtualScroller": {
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": {
                  width: 6,
                  height: 6,
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: 3,
                },
              },
            }}
          />
        </Paper>
      </Fade>
    </Box>
  );
}
