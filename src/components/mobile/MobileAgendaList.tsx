import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Calendar, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useState, useCallback, memo } from "react";
import SwipeableAppointmentCard from "./SwipeableAppointmentCard";
import MobileEmptyState from "./MobileEmptyState";

interface MobileAgendaListProps {
  clinicId: string;
}

const MobileAgendaList = memo(({ clinicId }: MobileAgendaListProps) => {
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
        .select(`
          id, appointment_date, title, status, patient_id,
          patients (full_name),
          profissionais (nome)
        `)
        .gte("appointment_date", startOfDay)
        .lte("appointment_date", endOfDay)
        .order("appointment_date", { ascending: true })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-upcoming-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-appointments-today"] });
    },
  });

  const handleConfirm = useCallback((id: string) => {
    updateStatusMutation.mutate(
      { id, status: "confirmed" },
      {
        onSuccess: () => toast({ title: "Agendamento confirmado", description: "O paciente será notificado." }),
        onError: () => toast({ variant: "destructive", title: "Erro ao confirmar", description: "Tente novamente." }),
      }
    );
  }, [updateStatusMutation]);

  const handleCancel = useCallback((id: string) => {
    updateStatusMutation.mutate(
      { id, status: "cancelled" },
      {
        onSuccess: () => toast({ title: "Agendamento cancelado", description: "O paciente será notificado." }),
        onError: () => toast({ variant: "destructive", title: "Erro ao cancelar", description: "Tente novamente." }),
      }
    );
  }, [updateStatusMutation]);

  const handleSendMessage = useCallback((id: string, patientId: string) => {
    navigate(`/dashboard/crm?patient=${patientId}`);
  }, [navigate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <div className="px-4 space-y-3">
        <Skeleton className="h-5 w-40" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[72px] w-full rounded-card" />
        ))}
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="px-4">
        <h2 className="text-label text-muted-foreground mb-3">
          Próximos Atendimentos
        </h2>
        <MobileEmptyState
          icon={Calendar}
          title="Sem atendimentos hoje"
          description="Nenhum agendamento encontrado para hoje."
          actionLabel="Agendar agora"
          onAction={() => navigate("/dashboard/agenda")}
        />
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-label text-muted-foreground">
          Próximos Atendimentos
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <p className="text-xs text-muted-foreground/60 mb-3 text-center">
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
});

MobileAgendaList.displayName = "MobileAgendaList";

export default MobileAgendaList;
