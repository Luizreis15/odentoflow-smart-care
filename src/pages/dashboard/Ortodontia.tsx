import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, User, Clock, AlertTriangle } from "lucide-react";
import { NovoCasoModal } from "@/components/ortodontia/NovoCasoModal";
import { DetalhesCasoModal } from "@/components/ortodontia/DetalhesCasoModal";
import { format, differenceInMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  planejamento: { label: "Planejamento", variant: "secondary" },
  ativo: { label: "Ativo", variant: "default" },
  contencao: { label: "Contenção", variant: "outline" },
  finalizado: { label: "Finalizado", variant: "secondary" },
  abandonado: { label: "Abandonado", variant: "destructive" },
};

const TIPO_MAP: Record<string, string> = {
  aparelho_fixo: "Aparelho Fixo",
  alinhadores: "Alinhadores",
  movel: "Móvel",
  contencao: "Contenção",
  ortopedia: "Ortopedia",
};

export default function Ortodontia() {
  const [novoCasoOpen, setNovoCasoOpen] = useState(false);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [selectedCasoId, setSelectedCasoId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  const { data: casos, refetch } = useQuery({
    queryKey: ["ortho-cases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ortho_cases")
        .select(`
          *,
          patient:patients!ortho_cases_patient_id_fkey(full_name),
          professional:profissionais!ortho_cases_professional_id_fkey(nome),
          responsible:patient_contacts!ortho_cases_responsible_contact_id_fkey(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const casosFiltrados = casos?.filter((c: any) => {
    const matchBusca =
      busca === "" ||
      c.patient?.full_name?.toLowerCase().includes(busca.toLowerCase()) ||
      c.professional?.nome?.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || c.status === filtroStatus;
    const matchTipo = filtroTipo === "todos" || c.tipo_tratamento === filtroTipo;
    return matchBusca && matchStatus && matchTipo;
  }) || [];

  const getProgresso = (caso: any) => {
    if (!caso.total_meses || !caso.data_inicio) return null;
    const mesesDecorridos = differenceInMonths(new Date(), parseISO(caso.data_inicio));
    return { atual: Math.min(mesesDecorridos, caso.total_meses), total: caso.total_meses };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Ortodontia</h1>
          <p className="text-muted-foreground text-sm">Acompanhamento de casos ortodônticos</p>
        </div>
        <Button onClick={() => setNovoCasoOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Caso
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por paciente ou profissional..."
            className="pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="planejamento">Planejamento</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="contencao">Contenção</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
            <SelectItem value="abandonado">Abandonado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="aparelho_fixo">Aparelho Fixo</SelectItem>
            <SelectItem value="alinhadores">Alinhadores</SelectItem>
            <SelectItem value="movel">Móvel</SelectItem>
            <SelectItem value="contencao">Contenção</SelectItem>
            <SelectItem value="ortopedia">Ortopedia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Casos */}
      {casosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">Nenhum caso encontrado</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">Crie um novo caso ortodôntico para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {casosFiltrados.map((caso: any) => {
            const progresso = getProgresso(caso);
            const statusInfo = STATUS_MAP[caso.status] || { label: caso.status, variant: "outline" as const };

            return (
              <Card key={caso.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedCasoId(caso.id); setDetalhesOpen(true); }}>
                <CardContent className="p-5 space-y-3">
                  {/* Header do card */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {caso.patient?.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {TIPO_MAP[caso.tipo_tratamento] || caso.tipo_tratamento}
                      </p>
                    </div>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>

                  {/* Profissional */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                    <span>Dr(a). {caso.professional?.nome}</span>
                  </div>

                  {/* Responsável financeiro */}
                  {caso.responsible?.name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Resp.: {caso.responsible.name}</span>
                    </div>
                  )}

                  {/* Progresso */}
                  {progresso && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progresso</span>
                        <span>{progresso.atual}/{progresso.total} meses</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${Math.min((progresso.atual / progresso.total) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Datas */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Início: {format(parseISO(caso.data_inicio), "dd/MM/yyyy", { locale: ptBR })}</span>
                    {caso.previsao_termino && (
                      <span>• Prev.: {format(parseISO(caso.previsao_termino), "dd/MM/yyyy", { locale: ptBR })}</span>
                    )}
                  </div>

                  {/* Valor */}
                  {caso.valor_mensalidade && (
                    <div className="text-sm font-medium text-foreground">
                      R$ {Number(caso.valor_mensalidade).toFixed(2)}/mês
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <NovoCasoModal
        open={novoCasoOpen}
        onOpenChange={setNovoCasoOpen}
        onSuccess={refetch}
      />
      <DetalhesCasoModal
        open={detalhesOpen}
        onOpenChange={setDetalhesOpen}
        casoId={selectedCasoId}
        onRefresh={refetch}
      />
    </div>
  );
}
