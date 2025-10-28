import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, Building2, Calendar, DollarSign } from "lucide-react";

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
}: DetalhesProteseModalProps) {
  const { data: protese } = useQuery({
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

  if (!protese) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Detalhes da Prótese
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

          {/* Procedimento */}
          <div>
            <h3 className="font-semibold mb-3">Procedimento</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Tipo:</strong> {protese.procedimento_tipo}</p>
              <p><strong>Descrição:</strong> {protese.procedimento_nome}</p>
              <p><strong>Profissional:</strong> {protese.profissional?.nome}</p>
            </div>
          </div>

          <Separator />

          {/* Laboratório */}
          {protese.laboratorio && (
            <>
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4" />
                  Laboratório
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

          {/* Prazos */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4" />
              Prazos
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
                    <strong>Custo Laboratorial:</strong> R${" "}
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

          {/* Histórico */}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
