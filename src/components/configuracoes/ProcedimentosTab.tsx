import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Upload, Download, Search } from "lucide-react";
import { ImportProcedimentosModal } from "./ImportProcedimentosModal";
import { NovoPlanoProcedimentosModal } from "./NovoPlanoProcedimentosModal";
import { PlanosTable } from "./PlanosTable";

interface ProcedimentosTabProps {
  clinicaId: string;
}

export const ProcedimentosTab = ({ clinicaId }: ProcedimentosTabProps) => {
  const [planos, setPlanos] = useState<any[]>([]);
  const [totalProcedimentos, setTotalProcedimentos] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showNovoPlanoModal, setShowNovoPlanoModal] = useState(false);
  const [planoPadrao, setPlanoPadrao] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [clinicaId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar total de procedimentos base
      const { count: totalProc } = await supabase
        .from("procedimentos")
        .select("*", { count: "exact", head: true });

      setTotalProcedimentos(totalProc || 0);

      // Carregar planos da clínica
      const { data: planosData, error } = await supabase
        .from("planos_procedimentos")
        .select("*")
        .eq("clinica_id", clinicaId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPlanos(planosData || []);
      
      const padrao = planosData?.find(p => p.is_padrao);
      setPlanoPadrao(padrao);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar procedimentos");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPadrao = async (planoId: string) => {
    try {
      const { error } = await supabase
        .from("planos_procedimentos")
        .update({ is_padrao: true })
        .eq("id", planoId);

      if (error) throw error;

      toast.success("Plano definido como padrão");
      loadData();
    } catch (error) {
      console.error("Erro ao definir plano padrão:", error);
      toast.error("Erro ao definir plano padrão");
    }
  };

  const handleDeletePlano = async (planoId: string) => {
    try {
      const { error } = await supabase
        .from("planos_procedimentos")
        .delete()
        .eq("id", planoId);

      if (error) {
        console.error("Erro detalhado ao excluir plano:", error);
        throw error;
      }

      toast.success("Plano excluído com sucesso");
      loadData();
    } catch (error: any) {
      console.error("Erro ao excluir plano:", error);
      toast.error(`Erro ao excluir plano: ${error?.message || 'Erro desconhecido'}`);
    }
  };

  const handleExportBase = async () => {
    try {
      const { data, error } = await supabase
        .from("procedimentos")
        .select("codigo_sistema, especialidade, descricao, valor")
        .order("especialidade", { ascending: true })
        .order("codigo_sistema", { ascending: true });

      if (error) throw error;

      // Converter para CSV
      const headers = ["Código", "Especialidade", "Descrição", "Valor"];
      const csvContent = [
        headers.join(","),
        ...data.map(row => 
          [row.codigo_sistema, row.especialidade, row.descricao, row.valor].join(",")
        )
      ].join("\n");

      // Download
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "procedimentos-base.csv";
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Tabela exportada com sucesso");
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast.error("Erro ao exportar tabela");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Procedimentos Odontológicos</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie tabelas de procedimentos e planos personalizados
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={handleExportBase}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar Base
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowImportModal(true)}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Importar Tabela
          </Button>
          <Button
            onClick={() => setShowNovoPlanoModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Plano
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total de Procedimentos</p>
            <p className="text-3xl font-bold">{totalProcedimentos}</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Planos Cadastrados</p>
            <p className="text-3xl font-bold">{planos.length}</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Plano Ativo</p>
            <div className="flex items-center gap-2">
              {planoPadrao ? (
                <>
                  <p className="text-lg font-semibold truncate">
                    {planoPadrao.nome}
                  </p>
                  <Badge variant="default">Padrão</Badge>
                </>
              ) : (
                <p className="text-lg text-muted-foreground">Nenhum</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar planos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <PlanosTable
            planos={planos.filter(p => 
              p.nome.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            onSetPadrao={handleSetPadrao}
            onDelete={handleDeletePlano}
            onEdit={loadData}
          />
        </div>
      </Card>

      <ImportProcedimentosModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onSuccess={loadData}
      />

      <NovoPlanoProcedimentosModal
        open={showNovoPlanoModal}
        onOpenChange={setShowNovoPlanoModal}
        clinicaId={clinicaId}
        onSuccess={loadData}
      />
    </div>
  );
};
