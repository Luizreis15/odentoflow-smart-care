import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { format, getDay, getHours } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { ReportFilters } from "./RelatorioFilters";
import { TrendingUp } from "lucide-react";

interface Props { clinicId: string; filters: ReportFilters; }

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const ComparecimentoTab = ({ clinicId, filters }: Props) => {
  const [loading, setLoading] = useState(true);
  const [generalRate, setGeneralRate] = useState(0);
  const [dayData, setDayData] = useState<any[]>([]);
  const [hourData, setHourData] = useState<any[]>([]);
  const [dentistData, setDentistData] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const startStr = format(filters.startDate, "yyyy-MM-dd");
      const endStr = format(filters.endDate, "yyyy-MM-dd");

      const { data: profs } = await supabase.from("profissionais").select("id, nome").eq("clinica_id", clinicId);
      const profIds = profs?.map((p) => p.id) || [];
      if (!profIds.length) { setLoading(false); return; }

      const { data: appts } = await supabase.from("appointments").select("dentist_id, status, appointment_date").in("dentist_id", profIds).gte("appointment_date", startStr).lte("appointment_date", endStr);
      const list = appts || [];
      const total = list.length;
      const missed = list.filter((a) => a.status === "faltou");

      setGeneralRate(total > 0 ? Math.round(((total - missed.length) / total) * 100) : 0);

      // Missed by day
      const dayCounts = Array(7).fill(0);
      missed.forEach((a) => { dayCounts[getDay(new Date(a.appointment_date))]++; });
      setDayData(DAYS.map((d, i) => ({ day: d, faltas: dayCounts[i] })));

      // Missed by hour
      const hourCounts: Record<number, number> = {};
      missed.forEach((a) => { const h = getHours(new Date(a.appointment_date)); hourCounts[h] = (hourCounts[h] || 0) + 1; });
      setHourData(Object.entries(hourCounts).map(([h, c]) => ({ hour: `${h}h`, faltas: c })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour)));

      // Missed by dentist
      const profMap = new Map<string, string>();
      profs?.forEach((p) => profMap.set(p.id, p.nome));
      const dentistCounts: Record<string, number> = {};
      missed.forEach((a) => { const name = profMap.get(a.dentist_id) || "-"; dentistCounts[name] = (dentistCounts[name] || 0) + 1; });
      setDentistData(Object.entries(dentistCounts).map(([name, faltas]) => ({ name: name.split(" ")[0], faltas })).sort((a, b) => b.faltas - a.faltas));

      setLoading(false);
    };
    fetch();
  }, [clinicId, filters]);

  if (loading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Taxa Geral de Comparecimento</p>
            <p className="text-3xl font-bold text-foreground">{generalRate}%</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Faltas por Dia da Semana</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dayData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="faltas" name="Faltas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Faltas por Horário</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hour" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="faltas" name="Faltas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Faltas por Dentista</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dentistData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="name" width={80} className="text-xs" />
                <Tooltip />
                <Bar dataKey="faltas" name="Faltas" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComparecimentoTab;
