import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";
import AdminCampaignList from "@/features/admin/components/campaigns/AdminCampaignList";

export default function AdminCampaign() {
  return (
    <BaseDashboardLayout>
      <AdminCampaignList />
    </BaseDashboardLayout>
  );
}
