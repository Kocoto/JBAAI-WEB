// src/features/admin/pages/AdminRequestList.tsx

import React from "react";
import { Box, Typography, Paper, Tabs, Tab, Button } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  RequestStatus,
  useAdminRequest,
} from "@/features/admin/hooks/useAdminRequest";
import RequestDataGrid from "../../../../shared/components/data-grid/RequestDataGrid";

export default function AdminRequestList() {
  const {
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    reviewingRequests,
    acceptRequest,
    approveRequest,
  } = useAdminRequest();

  const [selectedTab, setSelectedTab] =
    React.useState<RequestStatus>("pending");

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: RequestStatus
  ) => {
    setSelectedTab(newValue);
  };

  // --- ĐỊNH NGHĨA CỘT Ở ĐÂY ---
  // Thêm cột 'Action' với các nút bấm
  const columns: GridColDef[] = [
    { field: "fullname", headerName: "Full Name", flex: 1, minWidth: 180 },
    { field: "email", headerName: "Email", flex: 1.2, minWidth: 200 },
    { field: "phone", headerName: "Phone", flex: 1, minWidth: 150 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 150,
      sortable: false,
      // Dùng renderCell để tùy biến nội dung của ô
      renderCell: (params: GridRenderCellParams) => {
        // Chỉ hiển thị nút khi ở đúng tab
        if (selectedTab === "pending") {
          return (
            <Button
              variant="contained"
              size="small"
              onClick={() => acceptRequest(params.row.id)}
            >
              Accept
            </Button>
          );
        }
        if (selectedTab === "reviewing") {
          return (
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => approveRequest(params.row.id)}
            >
              Approve
            </Button>
          );
        }
        return null; // Không hiển thị nút cho các tab khác
      },
    },
  ];

  const tabContent = {
    pending: {
      title: "Yêu cầu đang chờ",
      state: pendingRequests,
    },
    reviewing: {
      title: "Yêu cầu đang xét duyệt",
      state: reviewingRequests,
    },
    approved: {
      title: "Yêu cầu đã được chấp thuận",
      state: approvedRequests,
    },
    rejected: {
      title: "Yêu cầu đã bị từ chối",
      state: rejectedRequests,
    },
  };

  const currentContent = tabContent[selectedTab];

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Quản lý Yêu cầu Nâng cấp
      </Typography>

      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            aria-label="request status tabs"
          >
            <Tab label="Đang chờ" value="pending" />
            <Tab label="Đang xét duyệt" value="reviewing" />
            <Tab label="Đã chấp thuận" value="approved" />
            <Tab label="Đã từ chối" value="rejected" />
          </Tabs>
        </Box>

        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            {currentContent.title} ({currentContent.state.total} yêu cầu)
          </Typography>

          {/* --- SỬ DỤNG VÀ TRUYỀN PROPS Ở ĐÂY --- */}
          <RequestDataGrid
            rows={currentContent.state.data.map((item) => ({
              ...item,
              id: item._id,
            }))}
            columns={columns}
            loading={currentContent.state.loading}
          />
        </Box>
      </Paper>
    </Box>
  );
}
