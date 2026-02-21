import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { ReportFilters } from "./RelatorioFilters";

interface Props { clinicId: string; filters: ReportFilters; }

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#6366f1", "#ef4444", "#8b5cf6", "#ec4899"];

const EspecialidadesTab = ({ clinicId, filters }: Props) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ name: string; total: number; pct: number }[]>([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const startStr = format(filters.startDate, "yyyy-MM-dd");
      const endStr = format(filters.endDate, "yyyy-MM-dd");

      const { data: profs } = await supabase.from("profissionais").select("id, especialidade").eq("clinica_id", clinicId);
      const profIds = profs?.map((p) => p.id) || [];
      if (!profIds.length) { setLoading(false); return; }

      const { data: appts } = await supabase.from("appointments").select("dentist_id").in("dentist_id", profIds).gte("appointment_date", startStr).lte("appointment_date", endStr);

      const espMap = new Map<string, string>();
      profs?.forEach((p) => espMap.set(p.id, p.especialidade || "Geral"));

      const counts: Record<string, number> = {};
      (appts || []).forEach((a) => {
        const esp = espMap.get(a.dentist_id) || "Geral";
        counts[esp] = (counts[esp] || 0) + 1;
      });

      const total = Object.values(counts).reduce((s, v) => s + v, 0);
      const result = Object.entries(counts)
        .map(([name, count]) => ({ name, total: count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
        .sort((a, b) => b.total - a.total);

      setData(result);
      setLoading(false);
    };
    fetch();
  }, [clinicId, filters]);

  if (loading) return <Skeleton className="h-96" />;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle className="text-sm">Distribuição por Especialidade</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                label={({ name, pct }) => `${name} ${pct}%`}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Atendimentos por Especialidade</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" className="text-xs" />
              <YAxis type="category" dataKey="name" width={120} className="text-xs" />
              <Tooltip />
              <Bar dataKey="total" name="Atendimentos" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default EspecialidadesTab;
