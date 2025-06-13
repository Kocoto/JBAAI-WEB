import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";
import { Box } from "@mui/material";
import AdminRequestList from "@/features/admin/components/requests/AdminRequestList";

export default function AdminRequest() {
  return (
    <BaseDashboardLayout>
      <Box>
        <AdminRequestList />
      </Box>
    </BaseDashboardLayout>
  );
}
