import SuperAdminLayout from "@/components/SuperAdminLayout";
import SuperAdminDashboard from "./Dashboard";

export default function SuperAdminDashboardWrapper() {
  return (
    <SuperAdminLayout>
      <SuperAdminDashboard />
    </SuperAdminLayout>
  );
}
