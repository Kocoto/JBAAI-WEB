import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";
import AdminFranchiseList from "@/features/admin/components/franchises/AdminFranchiseList";

export default function AdminFranchise() {
  return (
    <BaseDashboardLayout>
      <AdminFranchiseList />
    </BaseDashboardLayout>
  );
}
