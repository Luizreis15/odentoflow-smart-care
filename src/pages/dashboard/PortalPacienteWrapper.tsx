import DashboardLayout from "@/components/DashboardLayout";
import PortalPaciente from "./PortalPaciente";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const PortalPacienteWrapper = () => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <DashboardLayout user={profile}>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[400px]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={profile}>
      <PortalPaciente />
    </DashboardLayout>
  );
};

export default PortalPacienteWrapper;
