import { JSX, useCallback, useState } from "react";
import { useAdminFranchise } from "@/features/admin/hooks/useAdminFranchise";
import { Avatar, Box, Chip, IconButton, Menu, MenuItem, Typography, useTheme } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import FranchiseStatusChip from "./FranchiseStatusChip";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  AccountTree as AccountTreeIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

interface TabConfig {
  id: string;
  label: string;
  icon: JSX.Element;
  count?: number;
  color: string;
}

export default function AdminFranchiseList() {
  const theme = useTheme();
  const {
    franchiseList,
    franchiseStatistics,
    pagination,
    filters,
    isLoading,
    isLoadingStatistics,
    error,
    fetchFranchiseList,
    fetchFranchiseHierarchy,
    searchFranchises,
    filterByLevel,
    filterByStatus,
    updateFranchiseStatus,
    goToPage,
    changePageSize,
    navigateToFranchiseDetail,
    refreshData,
  } = useAdminFranchise();

  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFranchise, setSelectedFranchise] = useState<string | null>(
    null
  );

  const tabConfigs: TabConfig[] = [
    {
      id: "all",
      label: "Tất cả",
      icon: <BusinessIcon />,
      count: pagination.total,
      color: theme.palette.primary.main,
    },
    {
      id: "level-0",
      label: "Cấp 0",
      icon: <PeopleIcon />,
      count: franchiseStatistics?.franchisesByLevel?.[0],
      color: theme.palette.info.main,
    },
    {
      id: "level-1",
      label: "Cấp 1",
      icon: <TrendingUpIcon />,
      count: franchiseStatistics?.franchisesByLevel?.[1],
      color: theme.palette.success.main,
    },
    {
      id: "level-2",
      label: "Cấp 2+",
      icon: <AccountTreeIcon />,
      count: franchiseStatistics?.franchisesByLevel?.[2],
      color: theme.palette.warning.main,
    },
  ];

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    setSearchTerm("");

    switch (newValue) {
      case 0: // All
        filterByLevel(undefined);
        break;
      case 1: // Level 0
        filterByLevel(0);
        break;
      case 2: // Level 1
        filterByLevel(1);
        break;
      case 3: // Level 2+
        filterByLevel(2);
        break;
    }
  };

  // Handle search
  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      if (value.trim()) {
        searchFranchises(value);
      } else {
        fetchFranchiseList();
      }
    },
    [searchFranchises, fetchFranchiseList]
  );

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
            bgcolor: theme.palette.primary.main,
            fontSize: "0.875rem",
          }}
        >
          {params.row.franchiseName?.charAt(0).toUpperCase()}
        </Avatar>
      ),
    },
    {
      field: "franchiseName",
      headerName: "Tên Franchise",
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {params.row.id.substring(0, 8)}...
          </Typography>
        </Box>
      ),
    },
    {
      field: "ownerInfo",
      headerName: "Chủ sở hữu",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2">{params.row.ownerName}</Typography>
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
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <FranchiseStatusChip level={params.value} />
      ),
    },
    {
      field: "activeQuota",
      headerName: "Quota hoạt động",
      width: 130,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value > 0 ? "success" : "default"}
          variant={params.value > 0 ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value === "active" ? "Hoạt động" : "Tạm ngưng"}
          size="small"
          color={params.value === "active" ? "success" : "error"}
          variant="outlined"
          icon={params.value === "active" ? <CheckCircleIcon /> : <BlockIcon />}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Ngày tạo",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(params.value).toLocaleDateString("vi-VN")}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 100,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton
            size="small"
            onClick={(e) => handleMenuClick(e, params.row.id)}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl) && selectedFranchise === params.row.id}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={() => navigateToFranchiseDetail(params.row.id)}>
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
              Xem chi tiết
            </MenuItem>
            <MenuItem onClick={() => handleViewHierarchy(params.row.userId)}>
              <AccountTreeIcon fontSize="small" sx={{ mr: 1 }} />
              Xem cây phân cấp
            </MenuItem>
            <MenuItem
              onClick={() =>
                handleStatusToggle(params.row.id, params.row.status)
              }
            >
              {params.row.status === "active" ? (
                <>
                  <BlockIcon fontSize="small" sx={{ mr: 1 }} />
                  Tạm ngưng
                </>
              ) : (
                <>
                  <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                  Kích hoạt
                </>
              )}
            </MenuItem>
          </Menu>
        </>
      ),
    },
  ];
}
