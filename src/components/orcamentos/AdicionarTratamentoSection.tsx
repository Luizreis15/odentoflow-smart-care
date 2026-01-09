import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { X, Plus, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Odontograma } from "./Odontograma";
import { toast } from "sonner";

interface AdicionarTratamentoSectionProps {
  planos: any[];
  planoSelecionado: string;
  onPlanoChange: (plano: string) => void;
  clinicaId: string;
  onAdicionarTratamento: (tratamento: any) => void;
}

export const AdicionarTratamentoSection = ({
  planos,
  planoSelecionado,
  onPlanoChange,
  clinicaId,
  onAdicionarTratamento,
}: AdicionarTratamentoSectionProps) => {
  const [tratamentoAberto, setTratamentoAberto] = useState(false);
  const [procedimentos, setProcedimentos] = useState<any[]>([]);
  const [procedimentoSelecionado, setProcedimentoSelecionado] = useState<any>(null);
  const [valor, setValor] = useState("");
  const [dentistas, setDentistas] = useState<any[]>([]);
  const [dentistaSelecionado, setDentistaSelecionado] = useState("");
  const [dentesSelecionados, setDentesSelecionados] = useState<string[]>([]);
  const [buscaProcedimento, setBuscaProcedimento] = useState("");

  const procedimentosFiltrados = procedimentos.filter((proc) => {
    const termo = buscaProcedimento.toLowerCase();
    const descricao = (proc.procedimentos?.descricao || '').toLowerCase();
    const especialidade = (proc.procedimentos?.especialidade || '').toLowerCase();
    return descricao.includes(termo) || especialidade.includes(termo);
  });

  useEffect(() => {
    if (planoSelecionado) {
      loadProcedimentosDoPlano();
    }
  }, [planoSelecionado]);

  useEffect(() => {
    loadDentistas();
  }, [clinicaId]);

  const loadProcedimentosDoPlano = async () => {
    try {
      const { data, error } = await supabase
        .from("planos_procedimentos_itens")
        .select(`
          *,
          procedimentos!planos_procedimentos_itens_procedimento_id_fkey (*)
        `)
        .eq("plano_id", planoSelecionado);

      if (error) throw error;

      setProcedimentos(data || []);
    } catch (error) {
      console.error("Erro ao carregar procedimentos:", error);
      toast.error("Erro ao carregar procedimentos do plano");
    }
  };

  const loadDentistas = async () => {
    try {
      const { data, error } = await supabase
        .from("profissionais")
        .select("*")
        .eq("clinica_id", clinicaId)
        .eq("ativo", true);

      if (error) throw error;

      setDentistas(data || []);
    } catch (error) {
      console.error("Erro ao carregar dentistas:", error);
    }
  };

  const handleSelecionarProcedimento = (proc: any) => {
    setProcedimentoSelecionado(proc);
    setValor((proc.valor_customizado ?? proc.procedimentos?.valor ?? 0).toString());
    setTratamentoAberto(false);
  };


  const handleAdicionar = () => {
    if (!procedimentoSelecionado || !valor) {
      toast.error("Selecione um procedimento e informe o valor");
      return;
    }

    if (!dentistaSelecionado) {
      toast.error("Selecione um dentista");
      return;
    }

    if (dentesSelecionados.length === 0) {
      toast.error("Selecione pelo menos um dente ou região");
      return;
    }

    const dentista = dentistas.find(d => d.id === dentistaSelecionado);

    onAdicionarTratamento({
      procedimento_id: procedimentoSelecionado.procedimentos.id,
      nome: procedimentoSelecionado.procedimentos.descricao,
      valor: parseFloat(valor),
      dentista_id: dentistaSelecionado,
      dentista_nome: dentista?.nome,
      dente_regiao: dentesSelecionados.sort((a, b) => parseInt(a) - parseInt(b)).join(", "),
    });

    // Limpar campos
    setProcedimentoSelecionado(null);
    setValor("");
    setDentistaSelecionado("");
    setDentesSelecionados([]);
    toast.success("Tratamento adicionado");
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-lg font-semibold">Adicionar tratamento</h3>

      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plano">Plano*</Label>
          <Select value={planoSelecionado} onValueChange={onPlanoChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um plano" />
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

        <div className="col-span-2 space-y-2">
          <Label>Tratamento*</Label>
          <Popover open={tratamentoAberto} onOpenChange={setTratamentoAberto}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                {procedimentoSelecionado
                  ? procedimentoSelecionado.procedimentos.descricao
                  : "Buscar procedimento..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-0">
              <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                  placeholder="Buscar procedimento..."
                  value={buscaProcedimento}
                  onChange={(e) => setBuscaProcedimento(e.target.value)}
                  className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="max-h-[300px] overflow-auto p-1">
                {procedimentosFiltrados.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Nenhum procedimento encontrado.
                  </div>
                ) : (
                  procedimentosFiltrados.map((proc) => (
                    <div
                      key={proc.id}
                      onClick={() => handleSelecionarProcedimento(proc)}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          procedimentoSelecionado?.id === proc.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{proc.procedimentos?.descricao}</span>
                        <span className="text-xs text-muted-foreground">
                          {proc.procedimentos?.especialidade} • R$ {(proc.valor_customizado ?? 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor">Valor*</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </div>

        <div className="col-span-3 space-y-2">
          <Label htmlFor="dentista">Dentista*</Label>
          <div className="relative">
            <Select value={dentistaSelecionado} onValueChange={setDentistaSelecionado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um dentista" />
              </SelectTrigger>
              <SelectContent>
                {dentistas.map((dentista) => (
                  <SelectItem key={dentista.id} value={dentista.id}>
                    {dentista.nome} - {dentista.cro}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {dentistaSelecionado && (
              <button
                onClick={() => setDentistaSelecionado("")}
                className="absolute right-10 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            onClick={handleAdicionar}
            disabled={!procedimentoSelecionado || !valor || !dentistaSelecionado || dentesSelecionados.length === 0}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      <Odontograma
        dentesSelecionados={dentesSelecionados}
        onDentesChange={setDentesSelecionados}
      />
    </div>
  );
};
