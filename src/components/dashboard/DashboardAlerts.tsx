import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardAlertsProps {
  clinicId: string;
}

export const DashboardAlerts = ({ clinicId }: DashboardAlertsProps) => {
  // Pagamentos atrasados
  const { data: overduePayments, isLoading: loadingPayments } = useQuery({
    queryKey: ["dashboard-overdue-payments", clinicId],
    queryFn: async () => {
      const { data: patients } = await supabase
        .from("patients")
        .select("id")
        .eq("clinic_id", clinicId);

      if (!patients?.length) return 0;

      const { count, error } = await supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .in("patient_id", patients.map((p) => p.id))
        .eq("status", "pending")
        .lt("due_date", new Date().toISOString().split("T")[0]);

      if (error) return 0;
      return count || 0;
    },
  });

  // Tratamentos não finalizados (budget items com status in_progress)
  const { data: pendingTreatments, isLoading: loadingTreatments } = useQuery({
    queryKey: ["dashboard-pending-treatments", clinicId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("budgets")
        .select("id", { count: "exact", head: true })
        .eq("clinic_id", clinicId)
        .eq("status", "approved");

      if (error) return 0;
      return count || 0;
    },
  });

  // Orçamentos pendentes
  const { data: pendingBudgets, isLoading: loadingBudgets } = useQuery({
    queryKey: ["dashboard-pending-budgets", clinicId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("budgets")
        .select("id", { count: "exact", head: true })
        .eq("clinic_id", clinicId)
        .eq("status", "pending");

      if (error) return 0;
      return count || 0;
    },
  });

  const isLoading = loadingPayments || loadingTreatments || loadingBudgets;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  const alerts = [
    {
      key: "overdue",
      icon: AlertTriangle,
      title: "Pagamentos atrasados",
      count: overduePayments || 0,
      colorClass: "text-destructive",
      bgClass: "bg-destructive/10",
    },
    {
      key: "treatments",
      icon: Clock,
      title: "Tratamentos em andamento",
      count: pendingTreatments || 0,
      colorClass: "text-[hsl(var(--warning-amber))]",
      bgClass: "bg-[hsl(var(--warning-amber))]/10",
    },
    {
      key: "budgets",
      icon: FileText,
      title: "Orçamentos pendentes",
      count: pendingBudgets || 0,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {alerts.map((alert) => (
        <Card key={alert.key} className="border hover:shadow-sm transition-shadow">
          <CardContent className="flex items-center gap-4 p-4">
            <div className={cn("p-2.5 rounded-lg", alert.bgClass)}>
              <alert.icon className={cn("h-5 w-5", alert.colorClass)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{alert.title}</p>
              <p className={cn("text-2xl font-bold", alert.count > 0 ? alert.colorClass : "text-foreground")}>
                {alert.count}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
