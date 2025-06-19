import React, { useState, useMemo } from "react";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  Fade,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  InputAdornment,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
// Assuming these imports are correct for your project structure
// import { useAdminFranchise } from "../../hooks/useAdminFranchise";
// import { Franchise } from "../../types/franchise.types";

// Mock data and hooks for demonstration since the originals are not provided.
// You should replace this with your actual hooks and types.
interface User {
  _id: string;
  franchiseName?: string;
  username: string;
  email: string;
  phone: string;
}

interface Franchise {
  _id: string;
  userId: User;
  franchiseLevel: number;
  totalActiveQuota: number;
  createdAt: string;
}

const useAdminFranchise = () => {
  const [franchiseList, setFranchiseList] = useState<{
    data: Franchise[];
    total: number;
    loading: boolean;
    error: any;
  }>({ data: [], total: 0, loading: true, error: null });

  const fetchFranchiseList = () => {
    setFranchiseList((prev) => ({ ...prev, loading: true }));
    setTimeout(() => {
      // Mock API call
      const mockData: Franchise[] = [
        {
          _id: "franchise001",
          userId: {
            _id: "user01",
            franchiseName: "HCM Branch",
            username: "Nguyen Van A",
            email: "a@example.com",
            phone: "0901234567",
          },
          franchiseLevel: 1,
          totalActiveQuota: 10,
          createdAt: new Date().toISOString(),
        },
        {
          _id: "franchise002",
          userId: {
            _id: "user02",
            franchiseName: "Hanoi Capital",
            username: "Tran Thi B",
            email: "b@example.com",
            phone: "0901234568",
          },
          franchiseLevel: 0,
          totalActiveQuota: 5,
          createdAt: new Date().toISOString(),
        },
        {
          _id: "franchise003",
          userId: {
            _id: "user03",
            franchiseName: "Da Nang Hub",
            username: "Le Van C",
            email: "c@example.com",
            phone: "0901234569",
          },
          franchiseLevel: 2,
          totalActiveQuota: 0,
          createdAt: new Date().toISOString(),
        },
      ];
      setFranchiseList({
        data: mockData,
        total: mockData.length,
        loading: false,
        error: null,
      });
    }, 1500);
  };

  React.useEffect(() => {
    fetchFranchiseList();
  }, []);

  return { franchiseList, fetchFranchiseList };
};

const FranchiseStatusChip = ({ level }: { level: number }) => {
  const getLevelConfig = (level: number) => {
    switch (level) {
      case 0:
        return { label: "Cấp 0", color: "default" as const };
      case 1:
        return { label: "Cấp 1", color: "primary" as const };
      case 2:
        return { label: "Cấp 2", color: "secondary" as const };
      case 3:
        return { label: "Cấp 3", color: "error" as const };
      default:
        return { label: `Cấp ${level}`, color: "default" as const };
    }
  };

  const config = getLevelConfig(level);
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      sx={{ fontWeight: 500 }}
    />
  );
};

// Dialog hiển thị hierarchy
interface HierarchyDialogProps {
  open: boolean;
  onClose: () => void;
  franchiseId: string | null;
}

const HierarchyDialog: React.FC<HierarchyDialogProps> = ({
  open,
  onClose,
  franchiseId,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AccountTreeIcon color="primary" />
          <Typography variant="h6">Cây phân cấp Franchise</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ minHeight: 400, p: 2 }}>
          <Typography color="text.secondary">
            Đang tải thông tin cây phân cấp cho Franchise ID: {franchiseId}
          </Typography>
          {/* TODO: Implement hierarchy tree visualization */}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function AdminFranchiseList() {
  const theme = useTheme();
  const { franchiseList, fetchFranchiseList } = useAdminFranchise();
  const [searchText, setSearchText] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedFranchise, setSelectedFranchise] = useState<string | null>(
    null
  );
  const [hierarchyDialogOpen, setHierarchyDialogOpen] = useState(false);

  const filteredRows = useMemo(() => {
    // FIX: Ensure franchiseList.data is an array before filtering.
    // If franchiseList.data is undefined or null, default to an empty array.
    let filtered = franchiseList.data || []; // Search filter

    if (searchText) {
      filtered = filtered.filter(
        (franchise: Franchise) =>
          franchise.userId &&
          (franchise.userId.franchiseName
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
            franchise.userId.username
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            franchise.userId.email
              .toLowerCase()
              .includes(searchText.toLowerCase()))
      );
    } // Level filter

    if (selectedLevel !== "all") {
      filtered = filtered.filter(
        (franchise: Franchise) =>
          franchise.franchiseLevel === parseInt(selectedLevel)
      );
    }
    return filtered;
  }, [franchiseList.data, searchText, selectedLevel]);

  const rows = useMemo(() => {
    // Since filteredRows is now guaranteed to be an array, .map will work.
    return filteredRows.map((franchise: Franchise) => ({
      id: franchise._id,
      franchiseName: franchise.userId?.franchiseName || "N/A",
      ownerName: franchise.userId?.username || "N/A",
      email: franchise.userId?.email || "N/A",
      phone: franchise.userId?.phone || "N/A",
      level: franchise.franchiseLevel,
      activeQuota: franchise.totalActiveQuota,
      createdAt: franchise.createdAt,
      userId: franchise.userId?._id,
    }));
  }, [filteredRows]);

  const handleViewHierarchy = (franchiseId: string) => {
    setSelectedFranchise(franchiseId);
    setHierarchyDialogOpen(true);
  };

  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: theme.palette.primary.light,
            color: theme.palette.primary.dark,
            fontSize: "1rem",
            fontWeight: 600,
          }}
        >
          {params.row.ownerName?.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      field: "franchiseName",
      headerName: "Tên Franchise",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ userSelect: "all" }}
          >
            ID: {params.row.id}
          </Typography>
        </Box>
      ),
    },
    {
      field: "ownerName",
      headerName: "Chủ sở hữu",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2">{params.value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: "phone",
      headerName: "Số điện thoại",
      width: 130,
    },
    {
      field: "level",
      headerName: "Cấp bậc",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <FranchiseStatusChip level={params.value} />
      ),
    },
    {
      field: "activeQuota",
      headerName: "Quota",
      width: 130,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value > 0 ? "success" : "default"}
          variant="outlined"
          sx={{ fontWeight: 600, width: 60 }}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Ngày tham gia",
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(params.value).toLocaleDateString("vi-VN")}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Hành động",
      width: 140,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small" color="primary">
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xem cây phân cấp">
            <IconButton
              size="small"
              color="secondary"
              onClick={() => handleViewHierarchy(params.row.id)}
            >
              <AccountTreeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const handleRefresh = () => {
    fetchFranchiseList();
  };

  if (franchiseList.error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems="center"
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 99,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: "flex",
                alignItems: "center",
              }}
            >
              <BusinessIcon
                sx={{ color: theme.palette.primary.main, fontSize: 32 }}
              />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" fontWeight={700}>
                Quản lý Franchise
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Xem và quản lý danh sách các franchise trong hệ thống
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={franchiseList.loading}
            >
              {franchiseList.loading ? "Đang tải..." : "Làm mới"}
            </Button>
          </Stack>
          {/* Filters & Summary */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mb: 3 }}
            alignItems={{ md: "center" }}
          >
            <TextField
              placeholder="Tìm kiếm theo tên, email..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="small"
              sx={{ flexGrow: 1, minWidth: { sm: 300, md: 400 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Tabs
              value={selectedLevel}
              onChange={(e, newValue) => setSelectedLevel(newValue)}
              sx={{
                borderRadius: 2,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
              }}
            >
              <Tab label="Tất cả" value="all" />
              <Tab label="Cấp 0" value="0" />
              <Tab label="Cấp 1" value="1" />
              <Tab label="Cấp 2" value="2" />
            </Tabs>
          </Stack>
          {/* Data Grid */}
          <Box
            sx={{
              height: 650,
              width: "100%",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              "& .MuiDataGrid-root": {
                border: 0,
              },
            }}
          >
            <DataGrid
              rows={rows}
              columns={columns}
              loading={franchiseList.loading}
              checkboxSelection
              disableRowSelectionOnClick
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: alpha(theme.palette.grey[500], 0.04),
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
                "& .MuiDataGrid-row": {
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.action.hover, 0.5),
                  },
                },
                "--DataGrid-overlayHeight": "300px",
              }}
            />
          </Box>
        </Box>
      </Fade>
      {/* Hierarchy Dialog */}
      <HierarchyDialog
        open={hierarchyDialogOpen}
        onClose={() => setHierarchyDialogOpen(false)}
        franchiseId={selectedFranchise}
      />
    </Box>
  );
}
