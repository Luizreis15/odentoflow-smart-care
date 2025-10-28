import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Percent, Plus } from "lucide-react";

interface NovoPlanoProcedimentosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicaId: string;
  onSuccess: () => void;
}

export const NovoPlanoProcedimentosModal = ({
  open,
  onOpenChange,
  clinicaId,
  onSuccess,
}: NovoPlanoProcedimentosModalProps) => {
  const [nome, setNome] = useState("");
  const [percentualAjuste, setPercentualAjuste] = useState("0");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!nome.trim()) {
      toast.error("Digite o nome do plano");
      return;
    }

    setLoading(true);

    try {
      // Criar o plano
      const { data: novoPlano, error: planoError } = await supabase
        .from("planos_procedimentos")
        .insert({
          clinica_id: clinicaId,
          nome: nome.trim(),
          percentual_ajuste: parseFloat(percentualAjuste),
        })
        .select()
        .single();

      if (planoError) throw planoError;

      // Carregar todos os procedimentos da base
      const { data: procedimentos, error: procError } = await supabase
        .from("procedimentos")
        .select("*");

      if (procError) throw procError;

      // Calcular valores ajustados e criar itens do plano
      const ajuste = parseFloat(percentualAjuste) / 100;
      const itens = procedimentos.map(proc => ({
        plano_id: novoPlano.id,
        procedimento_id: proc.id,
        valor_customizado: proc.valor * (1 + ajuste),
      }));

      const { error: itensError } = await supabase
        .from("planos_procedimentos_itens")
        .insert(itens);

      if (itensError) throw itensError;

      toast.success(`Plano "${nome}" criado com sucesso com ${procedimentos.length} procedimentos`);
      onSuccess();
      onOpenChange(false);
      setNome("");
      setPercentualAjuste("0");
    } catch (error: any) {
      console.error("Erro ao criar plano:", error);
      if (error.message?.includes("duplicate")) {
        toast.error("Já existe um plano com este nome");
      } else {
        toast.error("Erro ao criar plano");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Plano Personalizado</DialogTitle>
          <DialogDescription>
            Crie um plano baseado na tabela de procedimentos base
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertDescription className="text-sm">
              O plano será criado com todos os procedimentos da tabela base.
              Você pode aplicar um ajuste percentual nos valores.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Plano *</Label>
            <Input
              id="nome"
              placeholder="Ex: Plano Particular, Convênio XYZ"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ajuste">Ajuste Percentual (%)</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="ajuste"
                type="number"
                step="0.01"
                placeholder="0"
                value={percentualAjuste}
                onChange={(e) => setPercentualAjuste(e.target.value)}
                disabled={loading}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Use valores positivos para aumentar (+20) ou negativos para diminuir (-10)
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {loading ? "Criando..." : "Criar Plano"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
