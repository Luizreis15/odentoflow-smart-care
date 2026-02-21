import DashboardLayout from "@/components/DashboardLayout";
import Relatorios from "./Relatorios";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const RelatoriosWrapper = () => {
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
      <Relatorios />
    </DashboardLayout>
  );
};

export default RelatoriosWrapper;
