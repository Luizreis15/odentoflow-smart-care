import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Agenda from "./Agenda";
import MobileAgenda from "@/pages/mobile/MobileAgenda";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "react-router-dom";

const AgendaWrapper = () => {
  const isMobile = useIsMobile();
  const { profile, clinicId, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const isNewAppointment = searchParams.get("new") === "true";
  const [forceDesktopAgenda, setForceDesktopAgenda] = useState(false);

  useEffect(() => {
    if (isNewAppointment) {
      setForceDesktopAgenda(true);
    }
  }, [isNewAppointment]);

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

  if (isMobile && clinicId && !isNewAppointment && !forceDesktopAgenda) {
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
