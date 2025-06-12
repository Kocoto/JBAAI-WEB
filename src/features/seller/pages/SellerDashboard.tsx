import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";
import { Box } from "@mui/material";
import MainGrid from "@/features/dashboard/components/MainGrid";

export default function SellerDashboard() {
  return (
    <BaseDashboardLayout>
      <Box>
        <MainGrid />
      </Box>
    </BaseDashboardLayout>
  );
}
