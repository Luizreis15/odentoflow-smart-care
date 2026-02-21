import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { format, getDay, getHours } from "date-fns";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { ReportFilters } from "./RelatorioFilters";
import { CalendarCheck, CheckCircle, XCircle, RotateCcw, UserX } from "lucide-react";

interface Props { clinicId: string; filters: ReportFilters; }

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "#f59e0b", "#6366f1"];
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const KpiCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) => (
  <Card>
    <CardContent className="p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}><Icon className="h-5 w-5" /></div>
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const ConsultasTab = ({ clinicId, filters }: Props) => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ total: 0, realized: 0, canceled: 0, rescheduled: 0, missed: 0 });
  const [statusData, setStatusData] = useState<any[]>([]);
  const [dayData, setDayData] = useState<any[]>([]);
  const [hourData, setHourData] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const startStr = format(filters.startDate, "yyyy-MM-dd");
      const endStr = format(filters.endDate, "yyyy-MM-dd");

      const { data: profs } = await supabase.from("profissionais").select("id, especialidade").eq("clinica_id", clinicId);
      let profIds = profs?.map((p) => p.id) || [];
      if (filters.dentistId) profIds = profIds.filter((id) => id === filters.dentistId);
      if (filters.especialidade) {
        const filtered = profs?.filter((p) => p.especialidade === filters.especialidade).map((p) => p.id) || [];
        profIds = profIds.filter((id) => filtered.includes(id));
      }

      if (profIds.length === 0) { setLoading(false); return; }

      let query = supabase.from("appointments").select("status, appointment_date").in("dentist_id", profIds).gte("appointment_date", startStr).lte("appointment_date", endStr);
      if (filters.status) query = query.eq("status", filters.status);
      const { data: appts } = await query;
      const list = appts || [];

      const realized = list.filter((a) => a.status === "realizado").length;
      const canceled = list.filter((a) => a.status === "cancelado").length;
      const rescheduled = list.filter((a) => a.status === "remarcado").length;
      const missed = list.filter((a) => a.status === "faltou").length;

      setKpis({ total: list.length, realized, canceled, rescheduled, missed });

      // Status pie
      setStatusData([
        { name: "Realizadas", value: realized },
        { name: "Canceladas", value: canceled },
        { name: "Remarcadas", value: rescheduled },
        { name: "Faltas", value: missed },
      ].filter((d) => d.value > 0));

      // By day of week
      const dayCounts = Array(7).fill(0);
      list.forEach((a) => { dayCounts[getDay(new Date(a.appointment_date))]++; });
      setDayData(DAYS.map((d, i) => ({ day: d, consultas: dayCounts[i] })));

      // By hour
      const hourCounts: Record<number, number> = {};
      list.forEach((a) => {
        const h = getHours(new Date(a.appointment_date));
        hourCounts[h] = (hourCounts[h] || 0) + 1;
      });
      const hrs = Object.entries(hourCounts).map(([h, c]) => ({ hour: `${h}h`, consultas: c })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
      setHourData(hrs);

      setLoading(false);
    };
    fetch();
  }, [clinicId, filters]);

  if (loading) return <div className="grid grid-cols-2 gap-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Total" value={kpis.total} icon={CalendarCheck} color="bg-blue-100 text-blue-600" />
        <KpiCard title="Realizadas" value={kpis.realized} icon={CheckCircle} color="bg-green-100 text-green-600" />
        <KpiCard title="Canceladas" value={kpis.canceled} icon={XCircle} color="bg-red-100 text-red-600" />
        <KpiCard title="Remarcadas" value={kpis.rescheduled} icon={RotateCcw} color="bg-amber-100 text-amber-600" />
        <KpiCard title="Faltas" value={kpis.missed} icon={UserX} color="bg-purple-100 text-purple-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Distribuição por Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Por Dia da Semana</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="consultas" name="Consultas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Por Horário</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hour" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="consultas" name="Consultas" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsultasTab;
