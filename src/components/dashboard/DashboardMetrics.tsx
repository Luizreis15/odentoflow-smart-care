import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Users, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { startOfMonth, startOfDay, endOfDay } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";

interface DashboardMetricsProps {
  clinicId: string;
}

const metricConfigs = [
  {
    key: "appointments",
    title: "Consultas do Dia",
    icon: Calendar,
    gradientClass: "bg-gradient-to-br from-[hsl(205,84%,96%)] to-[hsl(192,100%,94%)]",
    iconBgClass: "bg-[hsl(205,84%,29%)]/10",
    iconClass: "text-[hsl(var(--flowdent-blue))]",
    valueClass: "text-[hsl(var(--flowdent-blue))]",
    borderClass: "border-l-4 border-l-[hsl(var(--flowdent-blue))]",
  },
  {
    key: "revenue",
    title: "Faturamento",
    icon: DollarSign,
    gradientClass: "bg-gradient-to-br from-[hsl(145,63%,96%)] to-[hsl(169,61%,94%)]",
    iconBgClass: "bg-[hsl(145,63%,42%)]/10",
    iconClass: "text-[hsl(var(--success-green))]",
    valueClass: "text-[hsl(var(--success-green))]",
    borderClass: "border-l-4 border-l-[hsl(var(--success-green))]",
  },
  {
    key: "patients",
    title: "Novos Pacientes",
    icon: Users,
    gradientClass: "bg-gradient-to-br from-[hsl(192,100%,96%)] to-[hsl(192,100%,92%)]",
    iconBgClass: "bg-[hsl(192,100%,42%)]/10",
    iconClass: "text-[hsl(var(--flow-turquoise))]",
    valueClass: "text-[hsl(var(--flow-turquoise))]",
    borderClass: "border-l-4 border-l-[hsl(var(--flow-turquoise))]",
  },
  {
    key: "occupation",
    title: "Ocupação",
    icon: PieChart,
    gradientClass: "bg-gradient-to-br from-[hsl(169,61%,96%)] to-[hsl(169,61%,92%)]",
    iconBgClass: "bg-[hsl(169,61%,54%)]/10",
    iconClass: "text-[hsl(var(--health-mint))]",
    valueClass: "text-[hsl(var(--health-mint))]",
    borderClass: "border-l-4 border-l-[hsl(var(--health-mint))]",
  },
];

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

  const formatCurrencyCompact = (value: number) => {
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

  const metricsData = [
    {
      ...metricConfigs[0],
      value: totalAppointments,
      subValue: totalAppointments > 0 ? `${confirmedAppointments} confirmadas` : null,
      progress: totalAppointments > 0 ? (confirmedAppointments / totalAppointments) * 100 : 0,
    },
    {
      ...metricConfigs[1],
      value: formatCurrency(paymentsMonth?.total || 0),
      subValue: `${formatCurrency(paymentsMonth?.received || 0)} recebido`,
    },
    {
      ...metricConfigs[2],
      value: newPatients,
      subValue: "Este mês",
    },
    {
      ...metricConfigs[3],
      value: `${occupationRate}%`,
      progress: occupationRate,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {metricsData.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card 
            key={metric.key} 
            className={cn(
              "hover:shadow-lg transition-all border-none",
              metric.gradientClass,
              metric.borderClass
            )}
          >
            <CardHeader className="p-3 pb-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-foreground/70">
                  {metric.title}
                </CardTitle>
                <div className={cn("p-1.5 rounded-lg", metric.iconBgClass)}>
                  <Icon className={cn("h-3.5 w-3.5", metric.iconClass)} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-1">
              <div className={cn("text-xl font-bold", metric.valueClass)}>
                {metric.value}
              </div>
              {'progress' in metric && metric.progress !== undefined && metric.progress > 0 && (
                <Progress value={metric.progress} className="h-1" />
              )}
              {'subValue' in metric && metric.subValue && (
                <p className="text-xs text-foreground/60">{metric.subValue}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
