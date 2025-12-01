import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Users, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { startOfMonth, startOfDay, endOfDay } from "date-fns";

interface DashboardMetricsProps {
  clinicId: string;
}

export const DashboardMetrics = ({ clinicId }: DashboardMetricsProps) => {
  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);
  const startOfCurrentMonth = startOfMonth(today);
  
  // Data de início de produção - contar novos pacientes apenas a partir desta data
  const productionStartDate = new Date("2024-12-01T00:00:00");

  // Consultas do dia
  const { data: appointmentsToday, isLoading: loadingAppointments } = useQuery({
    queryKey: ["appointments-today", clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, status, patient_id!inner(clinic_id)")
        .eq("patient_id.clinic_id", clinicId)
        .gte("appointment_date", startOfToday.toISOString())
        .lte("appointment_date", endOfToday.toISOString());
      
      if (error) throw error;
      return data || [];
    },
  });

  // Faturamento do mês
  const { data: paymentsMonth, isLoading: loadingPayments } = useQuery({
    queryKey: ["payments-month", clinicId],
    queryFn: async () => {
      const { data: patients } = await supabase
        .from("patients")
        .select("id")
        .eq("clinic_id", clinicId);
      
      if (!patients) return { total: 0, received: 0 };

      const patientIds = patients.map(p => p.id);
      
      const { data, error } = await supabase
        .from("payments")
        .select("value, status")
        .in("patient_id", patientIds)
        .gte("payment_date", startOfCurrentMonth.toISOString().split('T')[0]);
      
      if (error) throw error;
      
      const total = data?.reduce((sum, p) => sum + Number(p.value || 0), 0) || 0;
      const received = data?.filter(p => p.status === "paid").reduce((sum, p) => sum + Number(p.value || 0), 0) || 0;
      
      return { total, received };
    },
  });

  // Novos pacientes do mês (a partir da data de início de produção)
  const { data: newPatients, isLoading: loadingPatients } = useQuery({
    queryKey: ["new-patients-month", clinicId],
    queryFn: async () => {
      // Usa a data mais recente entre início do mês ou início de produção
      const countFromDate = startOfCurrentMonth > productionStartDate 
        ? startOfCurrentMonth 
        : productionStartDate;
      
      const { data, error } = await supabase
        .from("patients")
        .select("id")
        .eq("clinic_id", clinicId)
        .gte("created_at", countFromDate.toISOString());
      
      if (error) throw error;
      return data?.length || 0;
    },
  });

  const totalAppointments = appointmentsToday?.length || 0;
  const confirmedAppointments = appointmentsToday?.filter(a => a.status === "scheduled").length || 0;
  const occupationRate = totalAppointments > 0 ? Math.round((confirmedAppointments / totalAppointments) * 100) : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loadingAppointments || loadingPayments || loadingPatients) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-3 pb-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">Consultas do Dia</CardTitle>
            <Calendar className="h-3.5 w-3.5 text-[hsl(var(--flowdent-blue))]" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1 space-y-1">
          <div className="text-xl font-bold">{totalAppointments}</div>
          {totalAppointments > 0 && (
            <>
              <Progress value={(confirmedAppointments / totalAppointments) * 100} className="h-1" />
              <p className="text-xs text-muted-foreground">{confirmedAppointments} confirmadas</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-3 pb-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">Faturamento</CardTitle>
            <DollarSign className="h-3.5 w-3.5 text-[hsl(var(--flow-turquoise))]" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1 space-y-1">
          <div className="text-xl font-bold">{formatCurrency(paymentsMonth?.total || 0)}</div>
          <p className="text-xs text-muted-foreground">{formatCurrency(paymentsMonth?.received || 0)} recebido</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-3 pb-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">Novos Pacientes</CardTitle>
            <Users className="h-3.5 w-3.5 text-[hsl(var(--flowdent-blue))]" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          <div className="text-xl font-bold">{newPatients}</div>
          <p className="text-xs text-muted-foreground">Este mês</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-3 pb-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">Ocupação</CardTitle>
            <PieChart className="h-3.5 w-3.5 text-[hsl(var(--flowdent-blue))]" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1 space-y-1">
          <div className="text-xl font-bold">{occupationRate}%</div>
          {totalAppointments > 0 && <Progress value={occupationRate} className="h-1" />}
        </CardContent>
      </Card>
    </div>
  );
};