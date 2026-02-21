import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClinicContext } from "@/hooks/useClinicContext";
import { Skeleton } from "@/components/ui/skeleton";
import RelatorioFilters, { type ReportFilters } from "@/components/relatorios/RelatorioFilters";
import InsightsAutomaticos from "@/components/relatorios/InsightsAutomaticos";
import VisaoGeralTab from "@/components/relatorios/VisaoGeralTab";
import PacientesTab from "@/components/relatorios/PacientesTab";
import ConsultasTab from "@/components/relatorios/ConsultasTab";
import EspecialidadesTab from "@/components/relatorios/EspecialidadesTab";
import DentistasTab from "@/components/relatorios/DentistasTab";
import ComparecimentoTab from "@/components/relatorios/ComparecimentoTab";
import RetencaoTab from "@/components/relatorios/RetencaoTab";
import { subDays } from "date-fns";

const Relatorios = () => {
  const { clinicId, isLoading } = useClinicContext();
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
    dentistId: null,
    especialidade: null,
    status: null,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!clinicId) {
    return <p className="text-muted-foreground">Nenhuma clínica encontrada.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios Operacionais</h1>
        <p className="text-sm text-muted-foreground mt-1">Análise estratégica do fluxo clínico</p>
      </div>

      <RelatorioFilters clinicId={clinicId} filters={filters} onFiltersChange={setFilters} />

      <InsightsAutomaticos clinicId={clinicId} filters={filters} />

      <Tabs defaultValue="visao-geral" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="visao-geral" className="text-xs">Visão Geral</TabsTrigger>
          <TabsTrigger value="pacientes" className="text-xs">Pacientes</TabsTrigger>
          <TabsTrigger value="consultas" className="text-xs">Consultas</TabsTrigger>
          <TabsTrigger value="especialidades" className="text-xs">Especialidades</TabsTrigger>
          <TabsTrigger value="dentistas" className="text-xs">Dentistas</TabsTrigger>
          <TabsTrigger value="comparecimento" className="text-xs">Comparecimento</TabsTrigger>
          <TabsTrigger value="retencao" className="text-xs">Retenção</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral">
          <VisaoGeralTab clinicId={clinicId} filters={filters} />
        </TabsContent>
        <TabsContent value="pacientes">
          <PacientesTab clinicId={clinicId} filters={filters} />
        </TabsContent>
        <TabsContent value="consultas">
          <ConsultasTab clinicId={clinicId} filters={filters} />
        </TabsContent>
        <TabsContent value="especialidades">
          <EspecialidadesTab clinicId={clinicId} filters={filters} />
        </TabsContent>
        <TabsContent value="dentistas">
          <DentistasTab clinicId={clinicId} filters={filters} />
        </TabsContent>
        <TabsContent value="comparecimento">
          <ComparecimentoTab clinicId={clinicId} filters={filters} />
        </TabsContent>
        <TabsContent value="retencao">
          <RetencaoTab clinicId={clinicId} filters={filters} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
