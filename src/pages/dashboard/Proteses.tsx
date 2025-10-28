import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NovaProteseModal } from "@/components/proteses/NovaProteseModal";
import { DetalhesProteseModal } from "@/components/proteses/DetalhesProteseModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLUNAS = [
  { id: "moldagem", titulo: "Coleta de Moldagem", cor: "bg-blue-500" },
  { id: "enviado_lab", titulo: "Enviado ao Lab", cor: "bg-yellow-500" },
  { id: "em_execucao", titulo: "Em Execução", cor: "bg-orange-500" },
  { id: "pronto_instalacao", titulo: "Pronto p/ Instalação", cor: "bg-green-500" },
  { id: "instalado", titulo: "Instalado", cor: "bg-gray-500" },
];

export default function Proteses() {
  const [novaProteseOpen, setNovaProteseOpen] = useState(false);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [proteseSelecionada, setProteseSelecionada] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const { data: proteses, refetch } = useQuery({
    queryKey: ["proteses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proteses")
        .select(`
          *,
          paciente:patients!proteses_paciente_id_fkey(full_name),
          profissional:profissionais!proteses_profissional_id_fkey(nome),
          laboratorio:laboratorios(nome)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDragStart = (e: React.DragEvent, proteseId: string) => {
    e.dataTransfer.setData("proteseId", proteseId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, novoStatus: string) => {
    e.preventDefault();
    const proteseId = e.dataTransfer.getData("proteseId");

    const { error } = await supabase
      .from("proteses")
      .update({ 
        status: novoStatus as "moldagem" | "enviado_lab" | "em_execucao" | "pronto_instalacao" | "instalado" 
      })
      .eq("id", proteseId);

    if (!error) {
      refetch();
    }
  };

  const filtrarProteses = (status: string) => {
    return proteses?.filter((p: any) => {
      const matchStatus = p.status === status;
      const matchBusca = busca === "" || 
        p.paciente?.full_name?.toLowerCase().includes(busca.toLowerCase()) ||
        p.procedimento_nome?.toLowerCase().includes(busca.toLowerCase()) ||
        p.profissional?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        p.laboratorio?.nome?.toLowerCase().includes(busca.toLowerCase());
      
      return matchStatus && matchBusca;
    }) || [];
  };

  const abrirDetalhes = (proteseId: string) => {
    setProteseSelecionada(proteseId);
    setDetalhesOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Controle de Prótese</h1>
          <p className="text-muted-foreground">Gestão completa do fluxo protético</p>
        </div>
        <Button onClick={() => setNovaProteseOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Prótese
        </Button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar por paciente, procedimento, dentista ou laboratório..."
          className="pl-10"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {COLUNAS.map((coluna) => {
          const protesesColuna = filtrarProteses(coluna.id);
          
          return (
            <div
              key={coluna.id}
              className="min-w-[280px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, coluna.id)}
            >
              <div className={`${coluna.cor} text-white rounded-t-lg p-3`}>
                <h3 className="font-semibold text-sm">{coluna.titulo}</h3>
                <p className="text-xs opacity-90">{protesesColuna.length} itens</p>
              </div>
              
              <div className="bg-muted/30 rounded-b-lg p-2 min-h-[500px] space-y-2">
                {protesesColuna.map((protese: any) => (
                  <Card
                    key={protese.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, protese.id)}
                    className="cursor-move hover:shadow-lg transition-shadow"
                    onClick={() => abrirDetalhes(protese.id)}
                  >
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm font-semibold">
                        {protese.paciente?.full_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {protese.procedimento_nome}
                      </p>
                      
                      <div className="text-xs space-y-1">
                        <p className="text-muted-foreground">
                          <strong>Dr(a):</strong> {protese.profissional?.nome}
                        </p>
                        {protese.laboratorio && (
                          <p className="text-muted-foreground">
                            <strong>Lab:</strong> {protese.laboratorio.nome}
                          </p>
                        )}
                      </div>

                      {protese.data_entrega_prevista && (
                        <div className="flex items-center justify-between">
                          <Badge variant={protese.atrasado ? "destructive" : "outline"} className="text-xs">
                            {format(new Date(protese.data_entrega_prevista), "dd/MM/yyyy", { locale: ptBR })}
                          </Badge>
                          {protese.custo_laboratorial && (
                            <span className="text-xs font-semibold">
                              R$ {Number(protese.custo_laboratorial).toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}

                      {protese.atrasado && (
                        <Badge variant="destructive" className="text-xs w-full justify-center">
                          ⚠️ Atrasado
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <NovaProteseModal
        open={novaProteseOpen}
        onOpenChange={setNovaProteseOpen}
        onSuccess={refetch}
      />

      {proteseSelecionada && (
        <DetalhesProteseModal
          open={detalhesOpen}
          onOpenChange={setDetalhesOpen}
          proteseId={proteseSelecionada}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
