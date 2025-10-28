import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle } from "lucide-react";

interface Anamnese {
  id: string;
  data: string;
  status: string;
  alerta_clinico: boolean;
  alerta_descricao: string | null;
  finalizada_em: string | null;
  anamnese_modelos: {
    nome: string;
    descricao: string | null;
  };
  profissionais: {
    nome: string;
  };
  patients: {
    full_name: string;
  };
}

interface Resposta {
  pergunta_id: string;
  resposta: string;
  observacoes: string | null;
  anamnese_perguntas: {
    texto: string;
    ordem: number;
  };
}

interface VisualizarAnamneseModalProps {
  open: boolean;
  onClose: () => void;
  anamneseId: string;
}

export default function VisualizarAnamneseModal({
  open,
  onClose,
  anamneseId,
}: VisualizarAnamneseModalProps) {
  const [anamnese, setAnamnese] = useState<Anamnese | null>(null);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && anamneseId) {
      loadAnamnese();
    }
  }, [open, anamneseId]);

  const loadAnamnese = async () => {
    try {
      const { data: anamneseData, error: anamneseError } = await supabase
        .from("anamneses")
        .select(`
          *,
          anamnese_modelos(nome, descricao),
          profissionais(nome),
          patients(full_name)
        `)
        .eq("id", anamneseId)
        .single();

      if (anamneseError) throw anamneseError;

      const { data: respostasData, error: respostasError } = await supabase
        .from("anamnese_respostas")
        .select(`
          *,
          anamnese_perguntas(texto, ordem)
        `)
        .eq("anamnese_id", anamneseId)
        .order("anamnese_perguntas(ordem)");

      if (respostasError) throw respostasError;

      setAnamnese(anamneseData);
      setRespostas(respostasData || []);
    } catch (error) {
      console.error("Erro ao carregar anamnese:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="p-8 text-center">Carregando...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!anamnese) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Visualizar Anamnese</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Cabeçalho */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {anamnese.anamnese_modelos.nome}
                </h3>
                <div className="flex gap-2">
                  <Badge
                    variant={
                      anamnese.status === "finalizada" ? "default" : "secondary"
                    }
                  >
                    {anamnese.status === "finalizada" ? "Finalizada" : "Rascunho"}
                  </Badge>
                  {anamnese.alerta_clinico && (
                    <Badge variant="destructive">Alerta Clínico</Badge>
                  )}
                </div>
              </div>
              {anamnese.anamnese_modelos.descricao && (
                <p className="text-sm text-muted-foreground">
                  {anamnese.anamnese_modelos.descricao}
                </p>
              )}
              <div className="grid grid-cols-3 gap-4 text-sm mt-4">
                <div>
                  <span className="font-medium">Paciente:</span>{" "}
                  {anamnese.patients.full_name}
                </div>
                <div>
                  <span className="font-medium">Data:</span>{" "}
                  {format(new Date(anamnese.data), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </div>
                <div>
                  <span className="font-medium">Responsável:</span>{" "}
                  {anamnese.profissionais.nome}
                </div>
              </div>
              {anamnese.finalizada_em && (
                <div className="text-sm">
                  <span className="font-medium">Finalizada em:</span>{" "}
                  {format(
                    new Date(anamnese.finalizada_em),
                    "dd/MM/yyyy 'às' HH:mm",
                    { locale: ptBR }
                  )}
                </div>
              )}
            </div>

            {/* Alertas */}
            {anamnese.alerta_clinico && anamnese.alerta_descricao && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-destructive mb-1">
                    Alerta Clínico
                  </h4>
                  <p className="text-sm">{anamnese.alerta_descricao}</p>
                </div>
              </div>
            )}

            {/* Perguntas e Respostas */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Respostas</h4>
              {respostas.map((resposta, index) => (
                <div key={resposta.pergunta_id} className="border rounded-lg p-4">
                  <p className="font-medium mb-2">
                    {index + 1}. {resposta.anamnese_perguntas.texto}
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Resposta:</span>{" "}
                      <Badge variant="outline" className="ml-2">
                        {resposta.resposta === "sim"
                          ? "Sim"
                          : resposta.resposta === "nao"
                          ? "Não"
                          : "Não se aplica"}
                      </Badge>
                    </p>
                    {resposta.observacoes && (
                      <div className="bg-muted p-3 rounded text-sm">
                        <span className="font-medium">Observações:</span>
                        <p className="mt-1">{resposta.observacoes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
