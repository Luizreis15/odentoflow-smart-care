import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Calendar, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";
import SwipeableAppointmentCard from "./SwipeableAppointmentCard";

interface MobileAgendaListProps {
  clinicId: string;
}

const MobileAgendaList = ({ clinicId }: MobileAgendaListProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ["mobile-upcoming-appointments", clinicId],
    queryFn: async () => {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();

      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          id,
          appointment_date,
          title,
          status,
          patient_id,
          patients (
            full_name
          ),
          profissionais (
            nome
          )
        `
        )
        .gte("appointment_date", startOfDay)
        .lte("appointment_date", endOfDay)
        .order("appointment_date", { ascending: true })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  // Mutation to update appointment status
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: string;
    }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mobile-upcoming-appointments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["mobile-appointments-today"],
      });
    },
  });

  const handleConfirm = useCallback(
    (id: string) => {
      updateStatusMutation.mutate(
        { id, status: "confirmed" },
        {
          onSuccess: () => {
            toast({
              title: "Agendamento confirmado",
              description: "O paciente será notificado.",
            });
          },
          onError: () => {
            toast({
              variant: "destructive",
              title: "Erro ao confirmar",
              description: "Tente novamente.",
            });
          },
        }
      );
    },
    [updateStatusMutation]
  );

  const handleCancel = useCallback(
    (id: string) => {
      updateStatusMutation.mutate(
        { id, status: "cancelled" },
        {
          onSuccess: () => {
            toast({
              title: "Agendamento cancelado",
              description: "O paciente será notificado.",
            });
          },
          onError: () => {
            toast({
              variant: "destructive",
              title: "Erro ao cancelar",
              description: "Tente novamente.",
            });
          },
        }
      );
    },
    [updateStatusMutation]
  );

  const handleSendMessage = useCallback(
    (id: string, patientId: string) => {
      navigate(`/dashboard/crm?patient=${patientId}`);
    },
    [navigate]
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Pull-to-refresh handler
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
      const scrollTop = e.currentTarget.scrollTop;

      // If at top and pulled down more than 80px
      if (scrollTop === 0 && touchEndY - touchStartY > 80) {
        await handleRefresh();
      }
    },
    [handleRefresh]
  );

  if (isLoading) {
    return (
      <div className="px-4 space-y-3">
        <Skeleton className="h-6 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[76px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="px-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Próximos Atendimentos
        </h2>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              Nenhum agendamento para hoje
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="px-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Próximos Atendimentos
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-full hover:bg-accent transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 text-muted-foreground ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {/* Swipe instructions */}
      <p className="text-xs text-muted-foreground mb-3 text-center">
        ← Deslize para cancelar | Deslize para confirmar →
      </p>

      <div className="space-y-2">
        {appointments.map((apt) => (
          <SwipeableAppointmentCard
            key={apt.id}
            appointment={{
              ...apt,
              patients: apt.patients as { full_name: string } | null,
              profissionais: apt.profissionais as { nome: string } | null,
            }}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onSendMessage={handleSendMessage}
            onClick={() => navigate(`/dashboard/prontuario/${apt.patient_id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default MobileAgendaList;
