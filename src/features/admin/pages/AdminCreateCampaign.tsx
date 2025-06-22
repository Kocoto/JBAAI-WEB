// File: src/features/admin/pages/AdminCreateCampaign.tsx

import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";
import AdminCampaignForm from "@/features/admin/components/campaigns/AdminCampaignForm";

export default function AdminCreateCampaign() {
  return (
    <BaseDashboardLayout>
      <AdminCampaignForm />
    </BaseDashboardLayout>
  );
}
