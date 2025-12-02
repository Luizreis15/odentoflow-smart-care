import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { X, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Odontograma } from "./Odontograma";
import { toast } from "sonner";
import { NovoProcedimentoInline } from "./NovoProcedimentoInline";

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
  const [mostrarFormNovo, setMostrarFormNovo] = useState(false);

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
    setValor(proc.valor_customizado.toString());
    setTratamentoAberto(false);
  };

  const handleProcedimentoCriado = (novoProcedimento: any) => {
    // Adicionar o novo procedimento à lista
    setProcedimentos([...procedimentos, novoProcedimento]);
    
    // Selecionar automaticamente
    setProcedimentoSelecionado(novoProcedimento);
    setValor(novoProcedimento.valor_customizado.toString());
    
    // Fechar form e popover
    setMostrarFormNovo(false);
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
          <div className="flex gap-2">
            <Popover 
              open={tratamentoAberto} 
              onOpenChange={(open) => {
                // Só permite fechar se não estiver no form de novo procedimento
                if (open || !mostrarFormNovo) {
                  setTratamentoAberto(open);
                }
              }} 
              modal={false}
            >
              <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="flex-1 justify-between"
              >
                {procedimentoSelecionado
                  ? procedimentoSelecionado.procedimentos.descricao
                  : "Buscar procedimento..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-0">
              {mostrarFormNovo ? (
                <NovoProcedimentoInline
                  planoId={planoSelecionado}
                  planos={planos}
                  onProcedimentoCriado={handleProcedimentoCriado}
                  onCancelar={() => setMostrarFormNovo(false)}
                />
              ) : (
                <Command>
                  <CommandInput placeholder="Buscar procedimento..." />
                  <CommandList className="max-h-[300px] overflow-auto">
                    <CommandEmpty>
                      <div className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          Nenhum procedimento encontrado.
                        </p>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {procedimentos.map((proc) => (
                        <CommandItem
                          key={proc.id}
                          value={proc.procedimentos.descricao}
                          onSelect={() => handleSelecionarProcedimento(proc)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              procedimentoSelecionado?.id === proc.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{proc.procedimentos.descricao}</span>
                            <span className="text-xs text-muted-foreground">
                              {proc.procedimentos.especialidade} • R$ {proc.valor_customizado.toFixed(2)}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              )}
            </PopoverContent>
          </Popover>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setMostrarFormNovo(true);
              setTratamentoAberto(true);
            }}
            title="Incluir novo procedimento"
          >
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </Button>
          </div>
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
