import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, Building2, Calendar, DollarSign, Plus, Palette, Layers } from "lucide-react";
import { EtapaTimeline, Etapa } from "./EtapaTimeline";
import { AdicionarEtapaModal } from "./AdicionarEtapaModal";

interface DetalhesProteseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proteseId: string;
  onSuccess: () => void;
}

export function DetalhesProteseModal({
  open,
  onOpenChange,
  proteseId,
  onSuccess,
}: DetalhesProteseModalProps) {
  const [adicionarEtapaOpen, setAdicionarEtapaOpen] = useState(false);

  const { data: protese, refetch: refetchProtese } = useQuery({
    queryKey: ["protese-detalhes", proteseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proteses")
        .select(`
          *,
          paciente:patients(full_name, phone),
          profissional:profissionais(nome, telefone),
          laboratorio:laboratorios(nome, telefone, whatsapp, responsavel)
        `)
        .eq("id", proteseId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: etapas, refetch: refetchEtapas } = useQuery({
    queryKey: ["protese-etapas", proteseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("protese_etapas")
        .select(`
          *,
          laboratorio:laboratorios(nome)
        `)
        .eq("protese_id", proteseId)
        .order("ordem", { ascending: true });

      if (error) throw error;
      return data as Etapa[];
    },
    enabled: open,
  });

  const { data: movimentacoes } = useQuery({
    queryKey: ["protese-movimentacoes", proteseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("protese_movimentacoes")
        .select(`
          *,
          usuario:usuarios!protese_movimentacoes_usuario_id_fkey(nome)
        `)
        .eq("protese_id", proteseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const statusLabels: Record<string, string> = {
    moldagem: "Coleta de Moldagem",
    enviado_lab: "Enviado ao Laboratório",
    em_execucao: "Em Execução",
    pronto_instalacao: "Pronto para Instalação",
    instalado: "Instalado",
  };

  const handleEtapaSuccess = () => {
    refetchEtapas();
    refetchProtese();
    onSuccess();
  };

  const proximaOrdem = (etapas?.length || 0) + 1;

  // Calcular custo total das etapas
  const custoTotalEtapas = etapas?.reduce((acc, etapa) => acc + (Number(etapa.custo) || 0), 0) || 0;

  if (!protese) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalhes da Prótese</span>
              <Badge variant={protese.atrasado ? "destructive" : "default"}>
                {statusLabels[protese.status]}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações do Paciente */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <User className="w-4 h-4" />
                Paciente
              </h3>
              <div className="space-y-1 text-sm">
                <p><strong>Nome:</strong> {protese.paciente?.full_name}</p>
                <p><strong>Telefone:</strong> {protese.paciente?.phone}</p>
              </div>
            </div>

            <Separator />

            {/* Procedimento / Trabalho */}
            <div>
              <h3 className="font-semibold mb-3">Trabalho</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p><strong>Tipo:</strong> {protese.procedimento_tipo}</p>
                  <p><strong>Descrição:</strong> {protese.procedimento_nome}</p>
                  <p><strong>Profissional:</strong> {protese.profissional?.nome}</p>
                </div>
                <div className="space-y-1">
                  {protese.dente_elemento && (
                    <p><strong>Dente/Elemento:</strong> {protese.dente_elemento}</p>
                  )}
                  {protese.material && (
                    <p className="flex items-center gap-1">
                      <strong>Material:</strong> {protese.material}
                    </p>
                  )}
                  {protese.cor_final && (
                    <p className="flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      <strong>Cor Final:</strong> {protese.cor_final}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Laboratório Principal */}
            {protese.laboratorio && (
              <>
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4" />
                    Laboratório Principal
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Nome:</strong> {protese.laboratorio.nome}</p>
                    {protese.laboratorio.responsavel && (
                      <p><strong>Responsável:</strong> {protese.laboratorio.responsavel}</p>
                    )}
                    {protese.laboratorio.telefone && (
                      <p><strong>Telefone:</strong> {protese.laboratorio.telefone}</p>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* TIMELINE DE ETAPAS */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Etapas do Trabalho ({etapas?.length || 0})
                </h3>
                <Button
                  size="sm"
                  onClick={() => setAdicionarEtapaOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Etapa
                </Button>
              </div>
              
              <EtapaTimeline 
                etapas={etapas || []} 
                etapaAtualId={protese.etapa_atual_id} 
              />

              {custoTotalEtapas > 0 && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">
                    Custo Total das Etapas: <span className="text-primary">R$ {custoTotalEtapas.toFixed(2)}</span>
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Prazos */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4" />
                Prazos Gerais
              </h3>
              <div className="space-y-1 text-sm">
                {protese.data_envio_prevista && (
                  <p>
                    <strong>Envio Previsto:</strong>{" "}
                    {format(new Date(protese.data_envio_prevista), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
                {protese.data_entrega_prevista && (
                  <p>
                    <strong>Entrega Prevista:</strong>{" "}
                    {format(new Date(protese.data_entrega_prevista), "dd/MM/yyyy", { locale: ptBR })}
                    {protese.atrasado && <Badge variant="destructive" className="ml-2">Atrasado</Badge>}
                  </p>
                )}
                {protese.data_instalacao_prevista && (
                  <p>
                    <strong>Instalação Prevista:</strong>{" "}
                    {format(new Date(protese.data_instalacao_prevista), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Financeiro */}
            {protese.custo_laboratorial && (
              <>
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4" />
                    Financeiro
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Custo Total Estimado:</strong> R${" "}
                      {Number(protese.custo_laboratorial).toFixed(2)}
                    </p>
                    {protese.forma_pagamento && (
                      <p><strong>Forma de Pagamento:</strong> {protese.forma_pagamento}</p>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Observações */}
            {protese.observacoes && (
              <>
                <div>
                  <h3 className="font-semibold mb-3">Observações</h3>
                  <p className="text-sm text-muted-foreground">{protese.observacoes}</p>
                </div>
                <Separator />
              </>
            )}

            {/* Histórico de Movimentações */}
            {movimentacoes && movimentacoes.length > 0 && (
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4" />
                  Histórico de Movimentações
                </h3>
                <div className="space-y-2">
                  {movimentacoes?.map((mov: any) => (
                    <div key={mov.id} className="text-sm border-l-2 border-primary pl-3 py-1">
                      <p className="font-medium">
                        {mov.status_anterior && `${statusLabels[mov.status_anterior]} → `}
                        {statusLabels[mov.status_novo]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(mov.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        {mov.usuario?.nome && ` • ${mov.usuario.nome}`}
                      </p>
                      {mov.observacao && (
                        <p className="text-xs text-muted-foreground italic mt-1">{mov.observacao}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AdicionarEtapaModal
        open={adicionarEtapaOpen}
        onOpenChange={setAdicionarEtapaOpen}
        proteseId={proteseId}
        proximaOrdem={proximaOrdem}
        onSuccess={handleEtapaSuccess}
      />
    </>
  );
}
