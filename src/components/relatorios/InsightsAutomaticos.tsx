import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, format } from "date-fns";
import type { ReportFilters } from "./RelatorioFilters";

interface Props {
  clinicId: string;
  filters: ReportFilters;
}

const InsightsAutomaticos = ({ clinicId, filters }: Props) => {
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    const generate = async () => {
      const startStr = format(filters.startDate, "yyyy-MM-dd");
      const endStr = format(filters.endDate, "yyyy-MM-dd");
      const prevStart = format(subMonths(filters.startDate, 1), "yyyy-MM-dd");
      const prevEnd = format(subMonths(filters.endDate, 1), "yyyy-MM-dd");

      // Get dentist IDs for this clinic
      const { data: profs } = await supabase
        .from("profissionais")
        .select("id")
        .eq("clinica_id", clinicId);
      const profIds = profs?.map((p) => p.id) || [];
      if (!profIds.length) { setInsights([]); return; }

      // Current period
      const { data: currentAppts } = await supabase
        .from("appointments")
        .select("status")
        .in("dentist_id", profIds)
        .gte("appointment_date", startStr)
        .lte("appointment_date", endStr);

      // Previous period
      const { data: prevAppts } = await supabase
        .from("appointments")
        .select("status")
        .in("dentist_id", profIds)
        .gte("appointment_date", prevStart)
        .lte("appointment_date", prevEnd);

      // Patients without return 12+ months
      const twelveMonthsAgo = format(subMonths(new Date(), 12), "yyyy-MM-dd");
      const { data: allPatients } = await supabase
        .from("patients")
        .select("id")
        .eq("clinic_id", clinicId);

      const { data: recentAppts } = await supabase
        .from("appointments")
        .select("patient_id")
        .in("dentist_id", profIds)
        .gte("appointment_date", twelveMonthsAgo);

      const recentPatientIds = new Set(recentAppts?.map((a) => a.patient_id) || []);
      const noReturnCount = (allPatients || []).filter((p) => !recentPatientIds.has(p.id)).length;

      const msgs: string[] = [];
      const curr = currentAppts || [];
      const prev = prevAppts || [];

      // Cancellation rate comparison
      const currCancel = curr.filter((a) => a.status === "cancelado").length;
      const prevCancel = prev.filter((a) => a.status === "cancelado").length;
      const currTotal = curr.length;
      const prevTotal = prev.length;

      if (currTotal > 0 && prevTotal > 0) {
        const currRate = (currCancel / currTotal) * 100;
        const prevRate = (prevCancel / prevTotal) * 100;
        const diff = currRate - prevRate;
        if (Math.abs(diff) > 2) {
          msgs.push(
            diff > 0
              ? `Taxa de cancelamento subiu ${diff.toFixed(0)}% em relação ao período anterior.`
              : `Taxa de cancelamento caiu ${Math.abs(diff).toFixed(0)}% em relação ao período anterior.`
          );
        }
      }

      // Attendance
      const currFaltas = curr.filter((a) => a.status === "faltou").length;
      if (currTotal > 0 && currFaltas > 0) {
        const faltaRate = ((currFaltas / currTotal) * 100).toFixed(0);
        msgs.push(`${faltaRate}% das consultas no período resultaram em faltas (${currFaltas} total).`);
      }

      // No return patients
      if (noReturnCount > 0) {
        msgs.push(`${noReturnCount} pacientes estão há mais de 1 ano sem retorno.`);
      }

      // Volume comparison
      if (currTotal > 0 && prevTotal > 0) {
        const volumeDiff = ((currTotal - prevTotal) / prevTotal * 100).toFixed(0);
        if (Math.abs(Number(volumeDiff)) > 5) {
          msgs.push(
            Number(volumeDiff) > 0
              ? `Volume de consultas cresceu ${volumeDiff}% vs período anterior.`
              : `Volume de consultas caiu ${Math.abs(Number(volumeDiff))}% vs período anterior.`
          );
        }
      }

      if (msgs.length === 0) {
        msgs.push("Nenhuma variação significativa detectada no período selecionado.");
      }

      setInsights(msgs);
    };

    generate();
  }, [clinicId, filters.startDate, filters.endDate]);

  if (!insights.length) return null;

  return (
    <div className="bg-primary/5 border border-primary/15 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-primary">Insights Automáticos</span>
      </div>
      <ul className="space-y-1.5">
        {insights.map((msg, i) => (
          <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            {msg}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InsightsAutomaticos;
