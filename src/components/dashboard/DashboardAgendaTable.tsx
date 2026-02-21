import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface DashboardAgendaTableProps {
  clinicId: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  scheduled: { label: "Agendado", variant: "outline" },
  confirmed: { label: "Confirmado", variant: "default" },
  waiting: { label: "Aguardando", variant: "secondary" },
  in_progress: { label: "Em atendimento", variant: "default" },
  completed: { label: "Finalizado", variant: "secondary" },
  cancelled: { label: "Cancelado", variant: "destructive" },
  no_show: { label: "Faltou", variant: "destructive" },
};

export const DashboardAgendaTable = ({ clinicId }: DashboardAgendaTableProps) => {
  const today = new Date();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["dashboard-agenda-table", clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          title,
          status,
          patient_id!inner(id, full_name, clinic_id),
          dentist_id(id, nome)
        `)
        .eq("patient_id.clinic_id", clinicId)
        .gte("appointment_date", startOfDay(today).toISOString())
        .lte("appointment_date", endOfDay(today).toISOString())
        .order("appointment_date", { ascending: true })
        .limit(15);

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Agenda do Dia
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Agenda do Dia
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {format(today, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {appointments && appointments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium w-[80px]">Hora</TableHead>
                <TableHead className="text-xs font-medium">Paciente</TableHead>
                <TableHead className="text-xs font-medium">Procedimento</TableHead>
                <TableHead className="text-xs font-medium w-[120px]">Status</TableHead>
                <TableHead className="text-xs font-medium">Dentista</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((apt) => {
                const status = statusConfig[apt.status || "scheduled"] || statusConfig.scheduled;
                const patientName =
                  apt.patient_id && typeof apt.patient_id === "object" && "full_name" in apt.patient_id
                    ? (apt.patient_id as any).full_name
                    : "—";
                const dentistName =
                  apt.dentist_id && typeof apt.dentist_id === "object" && "nome" in apt.dentist_id
                    ? (apt.dentist_id as any).nome
                    : "—";

                return (
                  <TableRow key={apt.id} className="cursor-pointer">
                    <TableCell className="text-sm font-medium py-2.5">
                      {format(new Date(apt.appointment_date), "HH:mm")}
                    </TableCell>
                    <TableCell className="text-sm py-2.5">{patientName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2.5">
                      {apt.title || "—"}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Badge variant={status.variant} className="text-[11px] font-medium">
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2.5">
                      {dentistName}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10 text-sm text-muted-foreground">
            Nenhuma consulta agendada para hoje.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
