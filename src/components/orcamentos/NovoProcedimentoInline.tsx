import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ESPECIALIDADES = [
  "Dentística",
  "Endodontia",
  "Periodontia",
  "Ortodontia",
  "Implantodontia",
  "Prótese",
  "Cirurgia",
  "Odontopediatria",
  "Radiologia",
  "Clínico Geral"
];

interface NovoProcedimentoInlineProps {
  planoId: string;
  planos: any[];
  onProcedimentoCriado: (novoProcedimento: any) => void;
  onCancelar: () => void;
}

export const NovoProcedimentoInline = ({
  planoId,
  planos,
  onProcedimentoCriado,
  onCancelar,
}: NovoProcedimentoInlineProps) => {
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState(`CUSTOM-${Date.now()}`);
  const [especialidade, setEspecialidade] = useState("");
  const [valor, setValor] = useState("");
  const [planoSelecionado, setPlanoSelecionado] = useState(planoId);
  const [criando, setCriando] = useState(false);

  const handleCriar = async () => {
    if (!nome || !especialidade || !valor || !planoSelecionado) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setCriando(true);

    try {
      // 1. Criar o procedimento
      const { data: novoProcedimento, error: errorProcedimento } = await supabase
        .from("procedimentos")
        .insert({
          codigo_sistema: codigo,
          descricao: nome,
          especialidade,
          valor: parseFloat(valor),
        })
        .select()
        .single();

      if (errorProcedimento) throw errorProcedimento;

      // 2. Vincular ao plano
      const { data: itemPlano, error: errorItem } = await supabase
        .from("planos_procedimentos_itens")
        .insert({
          plano_id: planoSelecionado,
          procedimento_id: novoProcedimento.id,
          valor_customizado: parseFloat(valor),
        })
        .select(`
          *,
          procedimentos!planos_procedimentos_itens_procedimento_id_fkey (*)
        `)
        .single();

      if (errorItem) throw errorItem;

      toast.success("Procedimento criado com sucesso");
      onProcedimentoCriado(itemPlano);
    } catch (error: any) {
      console.error("Erro ao criar procedimento:", error);
      toast.error(error.message || "Erro ao criar procedimento");
    } finally {
      setCriando(false);
    }
  };

  return (
    <div className="border-t bg-muted/20 p-4 space-y-3">
      <h4 className="font-semibold text-sm">Incluir novo procedimento</h4>
      
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="nome" className="text-xs">Nome do procedimento*</Label>
          <Input
            id="nome"
            placeholder="Ex: Clareamento caseiro"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="especialidade" className="text-xs">Especialidade*</Label>
            <Select value={especialidade} onValueChange={setEspecialidade}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {ESPECIALIDADES.map((esp) => (
                  <SelectItem key={esp} value={esp}>
                    {esp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="valor" className="text-xs">Valor*</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="plano" className="text-xs">Plano para vincular*</Label>
          <Select value={planoSelecionado} onValueChange={setPlanoSelecionado}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {planos.map((plano) => (
                <SelectItem key={plano.id} value={plano.id}>
                  {plano.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancelar}
            disabled={criando}
            className="flex-1 h-9"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleCriar}
            disabled={criando}
            className="flex-1 h-9"
          >
            {criando ? "Criando..." : "Criar e Selecionar"}
          </Button>
        </div>
      </div>
    </div>
  );
};
