import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";
import { Box } from "@mui/material";
import MainGrid from "@/features/dashboard/components/MainGrid";

export default function FranchiseDashboard() {
  return (
    <BaseDashboardLayout>
      <Box>
        <MainGrid />
      </Box>
    </BaseDashboardLayout>
  );
}
