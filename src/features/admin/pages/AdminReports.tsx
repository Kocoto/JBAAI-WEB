import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";
import AdminRequestList from "@/features/admin/components/requests/AdminRequestList";

export default function AdminReports() {
  return (
    <BaseDashboardLayout>
      <AdminRequestList />
    </BaseDashboardLayout>
  );
}
