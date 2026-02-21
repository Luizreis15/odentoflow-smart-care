import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { ReportFilters } from "./RelatorioFilters";
import { Users, UserCheck, UserPlus, CalendarCheck, TrendingUp, TrendingDown, RotateCcw } from "lucide-react";

interface Props { clinicId: string; filters: ReportFilters; }

const KpiCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string }) => (
  <Card>
    <CardContent className="p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const VisaoGeralTab = ({ clinicId, filters }: Props) => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ totalPatients: 0, activePatients: 0, newPatients: 0, totalAppts: 0, attendanceRate: 0, cancelRate: 0, rescheduleRate: 0 });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [newPatientsData, setNewPatientsData] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const startStr = format(filters.startDate, "yyyy-MM-dd");
      const endStr = format(filters.endDate, "yyyy-MM-dd");
      const sixMonthsAgo = format(subMonths(new Date(), 6), "yyyy-MM-dd");

      const { data: profs } = await supabase.from("profissionais").select("id, especialidade").eq("clinica_id", clinicId);
      let profIds = profs?.map((p) => p.id) || [];
      if (filters.dentistId) profIds = profIds.filter((id) => id === filters.dentistId);
      if (filters.especialidade) {
        const filtered = profs?.filter((p) => p.especialidade === filters.especialidade).map((p) => p.id) || [];
        profIds = profIds.filter((id) => filtered.includes(id));
      }

      // Patients
      const { count: totalPatients } = await supabase.from("patients").select("*", { count: "exact", head: true }).eq("clinic_id", clinicId);
      const { count: newPatients } = await supabase.from("patients").select("*", { count: "exact", head: true }).eq("clinic_id", clinicId).gte("created_at", startStr).lte("created_at", endStr);

      // Active patients (had appointment in last 6 months)
      let activeCount = 0;
      if (profIds.length > 0) {
        const { data: activeAppts } = await supabase.from("appointments").select("patient_id").in("dentist_id", profIds).gte("appointment_date", sixMonthsAgo).eq("status", "realizado");
        activeCount = new Set(activeAppts?.map((a) => a.patient_id) || []).size;
      }

      // Appointments in period
      let apptQuery = supabase.from("appointments").select("status, appointment_date");
      if (profIds.length > 0) apptQuery = apptQuery.in("dentist_id", profIds);
      else apptQuery = apptQuery.eq("dentist_id", "none");
      apptQuery = apptQuery.gte("appointment_date", startStr).lte("appointment_date", endStr);
      if (filters.status) apptQuery = apptQuery.eq("status", filters.status);
      const { data: appts } = await apptQuery;
      const total = appts?.length || 0;
      const realized = appts?.filter((a) => a.status === "realizado").length || 0;
      const canceled = appts?.filter((a) => a.status === "cancelado").length || 0;
      const rescheduled = appts?.filter((a) => a.status === "remarcado").length || 0;

      setKpis({
        totalPatients: totalPatients || 0,
        activePatients: activeCount,
        newPatients: newPatients || 0,
        totalAppts: total,
        attendanceRate: total > 0 ? Math.round((realized / total) * 100) : 0,
        cancelRate: total > 0 ? Math.round((canceled / total) * 100) : 0,
        rescheduleRate: total > 0 ? Math.round((rescheduled / total) * 100) : 0,
      });

      // Monthly chart data
      const months = eachMonthOfInterval({ start: subMonths(filters.endDate, 5), end: filters.endDate });
      const mData = months.map((m) => {
        const mStr = format(m, "yyyy-MM");
        const mAppts = appts?.filter((a) => a.appointment_date.startsWith(mStr)) || [];
        return {
          month: format(m, "MMM", { locale: ptBR }),
          total: mAppts.length,
          realizadas: mAppts.filter((a) => a.status === "realizado").length,
          faltas: mAppts.filter((a) => a.status === "faltou").length,
        };
      });
      setMonthlyData(mData);

      // New patients monthly
      const { data: patientsAll } = await supabase.from("patients").select("created_at").eq("clinic_id", clinicId)
        .gte("created_at", format(subMonths(filters.endDate, 5), "yyyy-MM-dd"));
      const npData = months.map((m) => {
        const mStr = format(m, "yyyy-MM");
        return {
          month: format(m, "MMM", { locale: ptBR }),
          novos: (patientsAll || []).filter((p) => p.created_at.startsWith(mStr)).length,
        };
      });
      setNewPatientsData(npData);

      setLoading(false);
    };
    fetch();
  }, [clinicId, filters]);

  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Pacientes" value={kpis.totalPatients} icon={Users} color="bg-blue-100 text-blue-600" />
        <KpiCard title="Pacientes Ativos" value={kpis.activePatients} icon={UserCheck} color="bg-green-100 text-green-600" />
        <KpiCard title="Novos no Período" value={kpis.newPatients} icon={UserPlus} color="bg-purple-100 text-purple-600" />
        <KpiCard title="Total Consultas" value={kpis.totalAppts} icon={CalendarCheck} color="bg-orange-100 text-orange-600" />
        <KpiCard title="Comparecimento" value={`${kpis.attendanceRate}%`} icon={TrendingUp} color="bg-emerald-100 text-emerald-600" />
        <KpiCard title="Cancelamento" value={`${kpis.cancelRate}%`} icon={TrendingDown} color="bg-red-100 text-red-600" />
        <KpiCard title="Remarcação" value={`${kpis.rescheduleRate}%`} icon={RotateCcw} color="bg-amber-100 text-amber-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Evolução Mensal de Consultas</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="realizadas" name="Realizadas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="faltas" name="Faltas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Pacientes Novos por Mês</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={newPatientsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="novos" name="Novos" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisaoGeralTab;
