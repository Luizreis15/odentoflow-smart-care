import DashboardLayout from "@/components/DashboardLayout";
import Agenda from "./Agenda";
import MobileAgenda from "@/pages/mobile/MobileAgenda";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const AgendaWrapper = () => {
  const isMobile = useIsMobile();
  const { profile, clinicId, isLoading } = useAuth();

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

  if (isMobile && clinicId) {
    return (
      <DashboardLayout user={profile}>
        <MobileAgenda clinicId={clinicId} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={profile}>
      <Agenda />
    </DashboardLayout>
  );
};

export default AgendaWrapper;
