import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths } from "date-fns";
import { Download, Users, UserCheck, UserX, AlertTriangle } from "lucide-react";
import type { ReportFilters } from "./RelatorioFilters";
import { useRelatorioExport } from "@/hooks/useRelatorioExport";

interface Props { clinicId: string; filters: ReportFilters; }

interface PatientRow {
  name: string;
  lastAppt: string;
  dentist: string;
  status: string;
  totalAppts: number;
}

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

const PacientesTab = ({ clinicId, filters }: Props) => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ total: 0, active: 0, inactive: 0, noReturn: 0 });
  const [rows, setRows] = useState<PatientRow[]>([]);
  const { exportToCSV, exportToExcel, exportToPDF } = useRelatorioExport();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const sixMonthsAgo = format(subMonths(new Date(), 6), "yyyy-MM-dd");
      const twelveMonthsAgo = format(subMonths(new Date(), 12), "yyyy-MM-dd");

      const { data: patients } = await supabase.from("patients").select("id, full_name, created_at").eq("clinic_id", clinicId);
      const { data: profs } = await supabase.from("profissionais").select("id, nome").eq("clinica_id", clinicId);
      const profMap = new Map((profs || []).map((p) => [p.id, p.nome]));
      const profIds = profs?.map((p) => p.id) || [];

      let appts: any[] = [];
      if (profIds.length > 0) {
        const { data } = await supabase.from("appointments").select("patient_id, appointment_date, dentist_id, status").in("dentist_id", profIds);
        appts = data || [];
      }

      const patientList = patients || [];
      const total = patientList.length;

      const patientAppts = new Map<string, typeof appts>();
      appts.forEach((a) => {
        if (!patientAppts.has(a.patient_id)) patientAppts.set(a.patient_id, []);
        patientAppts.get(a.patient_id)!.push(a);
      });

      let activeCount = 0;
      let noReturnCount = 0;
      const tableRows: PatientRow[] = [];

      patientList.forEach((p) => {
        const pAppts = patientAppts.get(p.id) || [];
        const sorted = [...pAppts].sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));
        const lastAppt = sorted[0];
        const isActive = lastAppt && lastAppt.appointment_date >= sixMonthsAgo;
        const hasNoReturn = !lastAppt || lastAppt.appointment_date < twelveMonthsAgo;

        if (isActive) activeCount++;
        if (hasNoReturn) noReturnCount++;

        tableRows.push({
          name: p.full_name,
          lastAppt: lastAppt ? format(new Date(lastAppt.appointment_date), "dd/MM/yyyy") : "Sem consultas",
          dentist: lastAppt ? (profMap.get(lastAppt.dentist_id) || "-") : "-",
          status: isActive ? "Ativo" : "Inativo",
          totalAppts: pAppts.filter((a) => a.status === "realizado").length,
        });
      });

      tableRows.sort((a, b) => b.totalAppts - a.totalAppts);

      setKpis({ total, active: activeCount, inactive: total - activeCount, noReturn: noReturnCount });
      setRows(tableRows.slice(0, 50));
      setLoading(false);
    };
    fetch();
  }, [clinicId, filters]);

  const columns = [
    { header: "Nome", key: "name" },
    { header: "Última Consulta", key: "lastAppt" },
    { header: "Dentista", key: "dentist" },
    { header: "Status", key: "status" },
    { header: "Total Consultas", key: "totalAppts" },
  ];

  if (loading) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total" value={kpis.total} icon={Users} color="bg-blue-100 text-blue-600" />
        <KpiCard title="Ativos" value={kpis.active} icon={UserCheck} color="bg-green-100 text-green-600" />
        <KpiCard title="Inativos" value={kpis.inactive} icon={UserX} color="bg-gray-100 text-gray-600" />
        <KpiCard title="Sem retorno 12+ meses" value={kpis.noReturn} icon={AlertTriangle} color="bg-red-100 text-red-600" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Pacientes</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => exportToCSV(rows, columns, "pacientes")}>
              <Download className="h-3.5 w-3.5 mr-1" /> CSV
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => exportToExcel(rows, columns, "pacientes")}>
              <Download className="h-3.5 w-3.5 mr-1" /> Excel
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => exportToPDF(rows, columns, "pacientes", "Relatório de Pacientes")}>
              <Download className="h-3.5 w-3.5 mr-1" /> PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[500px]">
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
                    <TableCell className="text-sm">{row.lastAppt}</TableCell>
                    <TableCell className="text-sm">{row.dentist}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${row.status === "Ativo" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-center">{row.totalAppts}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PacientesTab;
