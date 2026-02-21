import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { ReportFilters } from "./RelatorioFilters";
import { useRelatorioExport } from "@/hooks/useRelatorioExport";

interface Props { clinicId: string; filters: ReportFilters; }

interface DentistRow {
  name: string;
  total: number;
  realized: number;
  attendanceRate: string;
  canceled: number;
  patients: number;
}

const DentistasTab = ({ clinicId, filters }: Props) => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<DentistRow[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const { exportToCSV, exportToExcel, exportToPDF } = useRelatorioExport();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const startStr = format(filters.startDate, "yyyy-MM-dd");
      const endStr = format(filters.endDate, "yyyy-MM-dd");

      const { data: profs } = await supabase.from("profissionais").select("id, nome").eq("clinica_id", clinicId).eq("ativo", true);
      const profIds = profs?.map((p) => p.id) || [];
      if (!profIds.length) { setLoading(false); return; }

      const { data: appts } = await supabase.from("appointments").select("dentist_id, patient_id, status").in("dentist_id", profIds).gte("appointment_date", startStr).lte("appointment_date", endStr);

      const profMap = new Map<string, string>();
      profs?.forEach((p) => profMap.set(p.id, p.nome));

      const dentistData: Record<string, { total: number; realized: number; canceled: number; patients: Set<string> }> = {};
      profIds.forEach((id) => { dentistData[id] = { total: 0, realized: 0, canceled: 0, patients: new Set() }; });

      (appts || []).forEach((a) => {
        const d = dentistData[a.dentist_id];
        if (d) {
          d.total++;
          if (a.status === "realizado") d.realized++;
          if (a.status === "cancelado") d.canceled++;
          d.patients.add(a.patient_id);
        }
      });

      const result: DentistRow[] = Object.entries(dentistData).map(([id, d]) => ({
        name: profMap.get(id) || "-",
        total: d.total,
        realized: d.realized,
        attendanceRate: d.total > 0 ? `${Math.round((d.realized / d.total) * 100)}%` : "0%",
        canceled: d.canceled,
        patients: d.patients.size,
      })).sort((a, b) => b.total - a.total);

      setRows(result);
      setChartData(result.map((r) => ({ name: r.name.split(" ")[0], realizadas: r.realized, canceladas: r.canceled })));
      setLoading(false);
    };
    fetch();
  }, [clinicId, filters]);

  const columns = [
    { header: "Dentista", key: "name" },
    { header: "Atendimentos", key: "total" },
    { header: "Realizados", key: "realized" },
    { header: "Comparecimento", key: "attendanceRate" },
    { header: "Cancelamentos", key: "canceled" },
    { header: "Pacientes", key: "patients" },
  ];

  if (loading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-sm">Comparativo por Dentista</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Bar dataKey="realizadas" name="Realizadas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="canceladas" name="Canceladas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Detalhamento por Dentista</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => exportToCSV(rows, columns, "dentistas")}>
              <Download className="h-3.5 w-3.5 mr-1" /> CSV
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => exportToExcel(rows, columns, "dentistas")}>
              <Download className="h-3.5 w-3.5 mr-1" /> Excel
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => exportToPDF(rows, columns, "dentistas", "Relatório por Dentista")}>
              <Download className="h-3.5 w-3.5 mr-1" /> PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => <TableHead key={c.key} className="text-xs">{c.header}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="text-sm font-medium">{row.name}</TableCell>
                  <TableCell className="text-sm text-center">{row.total}</TableCell>
                  <TableCell className="text-sm text-center">{row.realized}</TableCell>
                  <TableCell className="text-sm text-center">{row.attendanceRate}</TableCell>
                  <TableCell className="text-sm text-center">{row.canceled}</TableCell>
                  <TableCell className="text-sm text-center">{row.patients}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DentistasTab;
