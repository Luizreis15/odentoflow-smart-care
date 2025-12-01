import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UpcomingAppointmentsProps {
  clinicId: string;
}

export const UpcomingAppointments = ({ clinicId }: UpcomingAppointmentsProps) => {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["upcoming-appointments", clinicId],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          status,
          patient_id!inner(
            id,
            full_name,
            clinic_id
          )
        `)
        .eq("patient_id.clinic_id", clinicId)
        .gte("appointment_date", now)
        .order("appointment_date", { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-primary";
      case "confirmed": return "bg-primary";
      case "waiting": return "bg-yellow-500";
      case "completed": return "bg-accent";
      default: return "bg-muted";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-1.5 pb-0.5">
          <CardTitle className="text-xs font-medium">Próximas Consultas</CardTitle>
        </CardHeader>
        <CardContent className="p-1.5">
          <div className="space-y-1">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-1.5 pb-0.5">
        <CardTitle className="text-xs font-medium">Próximas Consultas</CardTitle>
      </CardHeader>
      <CardContent className="p-1.5">
        {appointments && appointments.length > 0 ? (
          <div className="space-y-1">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-2 p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className={`w-0.5 h-8 rounded-full ${getStatusColor(apt.status || "scheduled")}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs truncate">
                    {apt.patient_id && typeof apt.patient_id === 'object' && 'full_name' in apt.patient_id 
                      ? apt.patient_id.full_name 
                      : "Paciente"}
                  </p>
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{format(new Date(apt.appointment_date), "HH:mm", { locale: ptBR })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Nenhuma consulta agendada
          </div>
        )}
      </CardContent>
    </Card>
  );
};