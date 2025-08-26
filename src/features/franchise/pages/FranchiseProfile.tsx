import BaseDashboardLayout from "@/shared/components/layout/BaseDashboardLayout";
import InvitationCodes from "@/features/franchise/components/invitations/InvitationCodes";

export default function FranchiseProfile() {
  return (
    <BaseDashboardLayout>
      <InvitationCodes />
    </BaseDashboardLayout>
  );
}
