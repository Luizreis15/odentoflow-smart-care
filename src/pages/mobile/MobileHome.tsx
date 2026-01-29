import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, RefreshCw, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import MobileQuickActions from "@/components/mobile/MobileQuickActions";
import MobileAgendaList from "@/components/mobile/MobileAgendaList";

interface MobileHomeProps {
  user?: {
    full_name?: string;
    email?: string;
  } | null;
  clinicId: string;
}

const MobileHome = ({ user, clinicId }: MobileHomeProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const firstName = user?.full_name?.split(" ")[0] || "usuário";

  // Fetch today's appointments count
  const { data: appointmentsData, refetch: refetchAppointments } = useQuery({
    queryKey: ["mobile-appointments-today", clinicId],
    queryFn: async () => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data, error } = await supabase
        .from("appointments")
        .select("id, status")
        .gte("appointment_date", startOfDay)
        .lte("appointment_date", endOfDay);

      if (error) throw error;
      return {
        total: data?.length || 0,
        confirmed: data?.filter((a) => a.status === "confirmado").length || 0,
        pending: data?.filter((a) => a.status === "agendado").length || 0,
      };
    },
  });


  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchAppointments();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Pull-to-refresh on the main container
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    (e.currentTarget as HTMLElement).dataset.touchStartY = String(touch.clientY);
  }, []);

  const handleTouchEnd = useCallback(
    async (e: React.TouchEvent) => {
      const touchStartY = Number(
        (e.currentTarget as HTMLElement).dataset.touchStartY || 0
      );
      const touchEndY = e.changedTouches[0].clientY;
      const scrollTop = (e.currentTarget as HTMLElement).scrollTop;

      // If at top and pulled down more than 100px
      if (scrollTop <= 0 && touchEndY - touchStartY > 100) {
        await handleRefresh();
      }
    },
    [handleRefresh]
  );

  const todayFormatted = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div
      className="min-h-screen pb-24 overflow-y-auto overflow-x-hidden -mt-16 touch-pan-y"
      style={{ width: '100vw', maxWidth: '100vw', touchAction: 'pan-y', background: 'linear-gradient(to bottom, hsl(var(--flowdent-blue)) 0%, hsl(var(--flowdent-blue)) 200px, hsl(var(--background)) 200px)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {isRefreshing && (
        <div className="flex justify-center py-2">
          <RefreshCw className="h-5 w-5 animate-spin text-white" />
        </div>
      )}

      {/* Hero Header with Gradient */}
      <div className="bg-gradient-to-br from-[hsl(var(--flowdent-blue))] via-[hsl(var(--flow-turquoise))] to-[hsl(var(--health-mint))] text-white">
        <div className="px-4 py-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm capitalize">{todayFormatted}</p>
              <h1 className="text-2xl font-bold mt-1">
                {getGreeting()}, {firstName}!
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw
                  className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Stats in Header */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">
                {appointmentsData?.total || 0} consultas hoje
              </span>
            </div>
            {appointmentsData && appointmentsData.pending > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm">
                  {appointmentsData.pending} pendentes
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content - directly touching hero */}
      <div className="w-full max-w-full space-y-6 bg-background rounded-t-3xl pt-4">
        {/* Quick Actions */}
        <MobileQuickActions clinicId={clinicId} />

        {/* Upcoming Appointments with Swipe Actions */}
        <MobileAgendaList clinicId={clinicId} />
      </div>
    </div>
  );
};

export default MobileHome;
