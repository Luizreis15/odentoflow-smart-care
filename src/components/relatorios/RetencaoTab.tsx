import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, differenceInDays } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { ReportFilters } from "./RelatorioFilters";
import { Users, RotateCcw, Clock, AlertTriangle } from "lucide-react";

interface Props { clinicId: string; filters: ReportFilters; }

const KpiCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string }) => (
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

const RetencaoTab = ({ clinicId, filters }: Props) => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ returned: 0, avgInterval: 0, noReturn6: 0, retentionRate: 0 });
  const [cohortData, setCohortData] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const startStr = format(filters.startDate, "yyyy-MM-dd");
      const endStr = format(filters.endDate, "yyyy-MM-dd");
      const sixMonthsAgo = format(subMonths(new Date(), 6), "yyyy-MM-dd");

      const { data: profs } = await supabase.from("profissionais").select("id").eq("clinica_id", clinicId);
      const profIds = profs?.map((p) => p.id) || [];
      if (!profIds.length) { setLoading(false); return; }

      const { data: appts } = await supabase.from("appointments").select("patient_id, appointment_date, status")
        .in("dentist_id", profIds).eq("status", "realizado").order("appointment_date");

      const { data: patients } = await supabase.from("patients").select("id, created_at").eq("clinic_id", clinicId);

      const patientAppts = new Map<string, string[]>();
      (appts || []).forEach((a) => {
        if (!patientAppts.has(a.patient_id)) patientAppts.set(a.patient_id, []);
        patientAppts.get(a.patient_id)!.push(a.appointment_date);
      });

      // Patients who returned (2+ appointments in period)
      let returnedCount = 0;
      let totalIntervals = 0;
      let intervalCount = 0;

      patientAppts.forEach((dates) => {
        const inPeriod = dates.filter((d) => d >= startStr && d <= endStr);
        if (inPeriod.length >= 2) returnedCount++;
        
        const sorted = [...dates].sort();
        for (let i = 1; i < sorted.length; i++) {
          const diff = differenceInDays(new Date(sorted[i]), new Date(sorted[i - 1]));
          if (diff > 0) { totalIntervals += diff; intervalCount++; }
        }
      });

      // No return 6+ months
      let noReturn6 = 0;
      (patients || []).forEach((p) => {
        const pDates = patientAppts.get(p.id);
        if (!pDates || pDates.length === 0) { noReturn6++; return; }
        const lastDate = [...pDates].sort().pop()!;
        if (lastDate < sixMonthsAgo) noReturn6++;
      });

      const totalWithAppts = patientAppts.size;
      const retentionRate = totalWithAppts > 0 ? Math.round((returnedCount / totalWithAppts) * 100) : 0;
      const avgInterval = intervalCount > 0 ? Math.round(totalIntervals / intervalCount) : 0;

      setKpis({ returned: returnedCount, avgInterval, noReturn6, retentionRate });

      // Simple cohort: last 6 months - new patients vs returned
      const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));
      const cData = months.map((m) => {
        const mStr = format(m, "yyyy-MM");
        const newInMonth = (patients || []).filter((p) => p.created_at.startsWith(mStr));
        const returnedInMonth = newInMonth.filter((p) => {
          const pDates = patientAppts.get(p.id) || [];
          return pDates.filter((d) => d > format(m, "yyyy-MM-dd")).length >= 2;
        });
        return {
          month: format(m, "MMM/yy"),
          novos: newInMonth.length,
          retornaram: returnedInMonth.length,
        };
      });
      setCohortData(cData);

      setLoading(false);
    };
    fetch();
  }, [clinicId, filters]);

  if (loading) return <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Retornaram no Período" value={kpis.returned} icon={RotateCcw} color="bg-green-100 text-green-600" />
        <KpiCard title="Intervalo Médio (dias)" value={kpis.avgInterval} icon={Clock} color="bg-blue-100 text-blue-600" />
        <KpiCard title="Sem Retorno 6+ meses" value={kpis.noReturn6} icon={AlertTriangle} color="bg-red-100 text-red-600" />
        <KpiCard title="Taxa de Retenção" value={`${kpis.retentionRate}%`} icon={Users} color="bg-purple-100 text-purple-600" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Coorte: Novos Pacientes vs Retornos</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cohortData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar dataKey="novos" name="Novos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="retornaram" name="Retornaram" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default RetencaoTab;
