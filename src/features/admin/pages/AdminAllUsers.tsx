import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";
import AdminRequestList from "@/features/admin/components/requests/AdminRequestList";

export default function AdminAllUsers() {
  return (
    <BaseDashboardLayout>
      <AdminRequestList />
    </BaseDashboardLayout>
  );
}
