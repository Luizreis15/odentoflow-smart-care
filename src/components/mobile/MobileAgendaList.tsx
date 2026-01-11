import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Clock, ChevronRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MobileAgendaListProps {
  clinicId: string;
}

const MobileAgendaList = ({ clinicId }: MobileAgendaListProps) => {
  const navigate = useNavigate();

  const { data: appointments, isLoading } = useQuery({
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
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const getStatusVariant = (status: string | null) => {
    switch (status) {
      case "confirmado":
        return "default";
      case "cancelado":
        return "destructive";
      case "concluido":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "confirmado":
        return "Confirmado";
      case "cancelado":
        return "Cancelado";
      case "concluido":
        return "Concluído";
      case "agendado":
        return "Agendado";
      default:
        return status || "Pendente";
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 space-y-3">
        <Skeleton className="h-6 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
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
    <div className="px-4">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
        Próximos Atendimentos
      </h2>
      <div className="space-y-2">
        {appointments.map((apt) => {
          const patient = apt.patients as { full_name: string } | null;
          const professional = apt.profissionais as { nome: string } | null;

          return (
            <Card
              key={apt.id}
              className="cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => navigate(`/dashboard/prontuario/${apt.patient_id}`)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {patient?.full_name || "Paciente"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {apt.title} {professional ? `- ${professional.nome}` : ""}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-medium text-sm">
                    {format(parseISO(apt.appointment_date), "HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                  <Badge
                    variant={getStatusVariant(apt.status)}
                    className="text-xs mt-1"
                  >
                    {getStatusLabel(apt.status)}
                  </Badge>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MobileAgendaList;
