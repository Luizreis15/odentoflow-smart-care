import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import MobileMetrics from "@/components/mobile/MobileMetrics";
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

  // Fetch today's receivables
  const { data: receivablesData, refetch: refetchReceivables } = useQuery({
    queryKey: ["mobile-receivables-today", clinicId],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("receivable_titles")
        .select("amount, balance")
        .eq("clinic_id", clinicId)
        .eq("due_date", today);

      if (error) throw error;
      const total = data?.reduce((sum, r) => sum + (r.balance || 0), 0) || 0;
      return total;
    },
  });

  // Fetch new patients this month
  const { data: newPatientsData, refetch: refetchPatients } = useQuery({
    queryKey: ["mobile-new-patients", clinicId],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from("patients")
        .select("id", { count: "exact", head: true })
        .eq("clinic_id", clinicId)
        .gte("created_at", startOfMonth.toISOString());

      if (error) throw error;
      return count || 0;
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchAppointments(),
      refetchReceivables(),
      refetchPatients(),
    ]);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const metrics = [
    {
      label: "Consultas Hoje",
      value: appointmentsData?.total || 0,
      color: "bg-primary",
    },
    {
      label: "A Receber Hoje",
      value: formatCurrency(receivablesData || 0),
      color: "bg-green-500",
    },
    {
      label: "Novos Pacientes",
      value: newPatientsData || 0,
      color: "bg-blue-500",
    },
    {
      label: "Pendentes",
      value: appointmentsData?.pending || 0,
      color: "bg-amber-500",
    },
  ];

  return (
    <div
      className="min-h-screen bg-background pb-24 overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {isRefreshing && (
        <div className="flex justify-center py-2">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm text-muted-foreground">{getGreeting()},</p>
            <h1 className="text-xl font-bold">{firstName}!</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 py-4">
        {/* Metrics Cards */}
        <MobileMetrics metrics={metrics} />

        {/* Quick Actions */}
        <MobileQuickActions clinicId={clinicId} />

        {/* Upcoming Appointments with Swipe Actions */}
        <MobileAgendaList clinicId={clinicId} />
      </div>
    </div>
  );
};

export default MobileHome;
