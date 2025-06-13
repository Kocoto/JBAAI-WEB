import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";
import { Box } from "@mui/material";
import AdminCampaignList from "@/features/admin/components/campaigns/AdminCampaignList";

export default function AdminCampaign() {
  return (
    <BaseDashboardLayout>
      <Box>
        <AdminCampaignList />
      </Box>
    </BaseDashboardLayout>
  );
}
