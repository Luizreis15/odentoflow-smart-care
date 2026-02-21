import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Users, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { startOfMonth, startOfDay, endOfDay } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { HorarioFuncionamento } from "@/components/configuracoes/HorarioFuncionamentoCard";

interface DashboardMetricsProps {
  clinicId: string;
}

const metricConfigs = [
  {
    key: "appointments",
    title: "Consultas Hoje",
    icon: Calendar,
  },
  {
    key: "revenue",
    title: "Faturamento do Mês",
    icon: DollarSign,
  },
  {
    key: "patients",
    title: "Novos Pacientes",
    icon: Users,
  },
  {
    key: "occupation",
    title: "Ocupação",
    icon: PieChart,
  },
];

export const DashboardMetrics = ({ clinicId }: DashboardMetricsProps) => {
  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);
  const startOfCurrentMonth = startOfMonth(today);
  
  // Data de início de produção - contar novos pacientes apenas a partir desta data
  const productionStartDate = new Date("2024-12-01T00:00:00");

  // Mapeamento de dia da semana para chave do horário
  const dayMap: Record<number, keyof HorarioFuncionamento['dias']> = {
    0: 'domingo', 1: 'segunda', 2: 'terca', 3: 'quarta',
    4: 'quinta', 5: 'sexta', 6: 'sabado'
  };

  // Função para calcular slots disponíveis no dia
  const calculateDailySlots = (config: HorarioFuncionamento | null): number => {
    if (!config) return 16; // Fallback: 8h de atendimento com 30min = 16 slots

    const todayKey = dayMap[today.getDay()];
    const diaConfig = config.dias?.[todayKey];
    
    if (!diaConfig?.ativo) return 0; // Dia não ativo

    const intervalo = config.intervalo_padrao || 30;
    
    // Calcular minutos de trabalho
    const [inicioH, inicioM] = diaConfig.inicio.split(':').map(Number);
    const [fimH, fimM] = diaConfig.fim.split(':').map(Number);
    
    let minutosTrabalho = (fimH * 60 + fimM) - (inicioH * 60 + inicioM);
    
    // Subtrair horário de almoço se existir
    if (diaConfig.almoco_inicio && diaConfig.almoco_fim) {
      const [almocoInicioH, almocoInicioM] = diaConfig.almoco_inicio.split(':').map(Number);
      const [almocoFimH, almocoFimM] = diaConfig.almoco_fim.split(':').map(Number);
      const minutosAlmoco = (almocoFimH * 60 + almocoFimM) - (almocoInicioH * 60 + almocoInicioM);
      minutosTrabalho -= minutosAlmoco;
    }
    
    return Math.floor(minutosTrabalho / intervalo);
  };

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

  // Profissionais ativos da clínica
  const { data: activeDentists, isLoading: loadingDentists } = useQuery({
    queryKey: ["active-dentists", clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profissionais")
        .select("id")
        .eq("clinica_id", clinicId)
        .eq("ativo", true);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Configurações da clínica (horário de funcionamento)
  const { data: clinicConfig, isLoading: loadingConfig } = useQuery({
    queryKey: ["clinic-config", clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracoes_clinica")
        .select("horario_funcionamento")
        .eq("clinica_id", clinicId)
        .maybeSingle();
      
      if (error) throw error;
      return data?.horario_funcionamento as unknown as HorarioFuncionamento | null;
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
  
  // Cálculo correto da taxa de ocupação
  // Capacidade total = slots por dentista × número de dentistas ativos
  const slotsPerDentist = calculateDailySlots(clinicConfig);
  const totalDentists = activeDentists?.length || 1;
  const totalCapacity = slotsPerDentist * totalDentists;
  
  // Taxa de ocupação = agendamentos do dia / capacidade total
  const occupationRate = totalCapacity > 0 
    ? Math.min(Math.round((totalAppointments / totalCapacity) * 100), 100) 
    : 0;

  const formatCurrencyCompact = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loadingAppointments || loadingPayments || loadingPatients || loadingDentists || loadingConfig) {
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
      subValue: `${totalAppointments} de ${totalCapacity} slots`,
      progress: occupationRate,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metricsData.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.key} className="bg-card border hover:shadow-sm transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {metric.title}
                </span>
                <div className="p-1.5 rounded-md bg-muted">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {metric.value}
              </div>
              {'subValue' in metric && metric.subValue && (
                <p className="text-xs text-muted-foreground mt-1">{metric.subValue}</p>
              )}
              {'progress' in metric && metric.progress !== undefined && metric.progress > 0 && (
                <Progress value={metric.progress} className="h-1 mt-2" />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
