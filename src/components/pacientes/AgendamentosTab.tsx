import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Plus,
  Filter,
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isPast, isToday, isFuture, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgendamentosTabProps {
  patientId: string;
}

interface Appointment {
  id: string;
  title: string;
  description: string | null;
  appointment_date: string;
  duration_minutes: number | null;
  status: string | null;
  dentist_id: string;
  profissional?: {
    nome: string;
  };
}

export const AgendamentosTab = ({ patientId }: AgendamentosTabProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("todos");

  useEffect(() => {
    loadAppointments();
  }, [patientId]);

  const loadAppointments = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          profissional:profissionais!appointments_dentist_id_fkey(nome)
        `)
        .eq("patient_id", patientId)
        .order("appointment_date", { ascending: false });

      if (error) throw error;
      setAppointments(data || []);

    } catch (error: any) {
      console.error("Erro ao carregar agendamentos:", error);
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por tab
  const filteredAppointments = appointments.filter(apt => {
    const date = parseISO(apt.appointment_date);
    
    switch (activeTab) {
      case "proximos":
        return isFuture(date) || isToday(date);
      case "realizados":
        return apt.status === "completed" || apt.status === "confirmed";
      case "cancelados":
        return apt.status === "cancelled" || apt.status === "no_show";
      default:
        return true;
    }
  });

  // Estatísticas
  const totalAgendamentos = appointments.length;
  const agendamentosRealizados = appointments.filter(a => 
    a.status === "completed" || a.status === "confirmed"
  ).length;
  const agendamentosCancelados = appointments.filter(a => 
    a.status === "cancelled" || a.status === "no_show"
  ).length;
  const proximosAgendamentos = appointments.filter(a => {
    const date = parseISO(a.appointment_date);
    return isFuture(date) || isToday(date);
  }).length;

  const getStatusBadge = (status: string | null, date: string) => {
    const appointmentDate = parseISO(date);
    
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 text-white">Realizado</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-500 text-white">Confirmado</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      case "no_show":
        return <Badge className="bg-orange-500 text-white">Não compareceu</Badge>;
      case "scheduled":
        if (isPast(appointmentDate) && !isToday(appointmentDate)) {
          return <Badge className="bg-yellow-500 text-white">Pendente</Badge>;
        }
        return <Badge variant="secondary">Agendado</Badge>;
      default:
        return <Badge variant="secondary">{status || "Agendado"}</Badge>;
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "-";
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Carregando agendamentos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{totalAgendamentos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próximos</p>
                <p className="text-xl font-bold text-blue-600">{proximosAgendamentos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Realizados</p>
                <p className="text-xl font-bold text-green-600">{agendamentosRealizados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cancelados</p>
                <p className="text-xl font-bold text-red-600">{agendamentosCancelados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs e Lista */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Histórico de Agendamentos</CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="proximos">Próximos</TabsTrigger>
              <TabsTrigger value="realizados">Realizados</TabsTrigger>
              <TabsTrigger value="cancelados">Cancelados</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {activeTab === "todos" 
                      ? "Nenhum agendamento encontrado"
                      : `Nenhum agendamento ${activeTab === "proximos" ? "próximo" : activeTab} encontrado`
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Procedimento</TableHead>
                        <TableHead>Profissional</TableHead>
                        <TableHead>Duração</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.map((appointment) => {
                        const date = parseISO(appointment.appointment_date);
                        const isUpcoming = isFuture(date) || isToday(date);
                        
                        return (
                          <TableRow 
                            key={appointment.id}
                            className={isUpcoming ? "bg-blue-50/50" : ""}
                          >
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {format(date, "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {format(date, "HH:mm", { locale: ptBR })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{appointment.title}</span>
                                {appointment.description && (
                                  <span className="text-sm text-muted-foreground line-clamp-1">
                                    {appointment.description}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{appointment.profissional?.nome || "Não informado"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDuration(appointment.duration_minutes)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(appointment.status, appointment.appointment_date)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Próximo Agendamento Destacado */}
      {proximosAgendamentos > 0 && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-1">Próximo Agendamento</h4>
                {(() => {
                  const next = appointments.find(a => {
                    const date = parseISO(a.appointment_date);
                    return isFuture(date) || isToday(date);
                  });
                  
                  if (!next) return null;
                  
                  const date = parseISO(next.appointment_date);
                  
                  return (
                    <div className="space-y-1">
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">{next.title}</span>
                        {" com "}
                        <span className="font-medium text-foreground">
                          {next.profissional?.nome || "profissional não informado"}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold text-blue-600">
                          {isToday(date) ? "Hoje" : format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                        </span>
                        {" às "}
                        <span className="font-semibold text-blue-600">
                          {format(date, "HH:mm", { locale: ptBR })}
                        </span>
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
