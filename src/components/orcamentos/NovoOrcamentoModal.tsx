import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Camera, Info } from "lucide-react";
import { AdicionarTratamentoSection } from "./AdicionarTratamentoSection";
import { ListaTratamentosSection } from "./ListaTratamentosSection";
import { format } from "date-fns";

interface NovoOrcamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  clinicaId: string;
  onSuccess: () => void;
}

interface TratamentoItem {
  id: string;
  procedimento_id: string;
  nome: string;
  valor: number;
  dentista_id?: string;
  dentista_nome?: string;
  dente_regiao?: string;
  checked?: boolean;
}

export const NovoOrcamentoModal = ({
  open,
  onOpenChange,
  patientId,
  clinicaId,
  onSuccess,
}: NovoOrcamentoModalProps) => {
  const [step, setStep] = useState<"adicionar" | "listar">("adicionar");
  const [descricao, setDescricao] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [data, setData] = useState(format(new Date(), "yyyy-MM-dd"));
  const [planoSelecionado, setPlanoSelecionado] = useState("");
  const [tratamentos, setTratamentos] = useState<TratamentoItem[]>([]);
  const [desconto, setDesconto] = useState(0);
  const [parcelar, setParcelar] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [emitirContrato, setEmitirContrato] = useState(false);
  const [configImpressao, setConfigImpressao] = useState({
    valorTotal: true,
    valorPorTratamento: true,
    parcelas: false,
    dentista: true,
    odontograma: true,
  });
  const [loading, setLoading] = useState(false);
  const [planos, setPlanos] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      loadPlanos();
      loadUserInfo();
    }
  }, [open, clinicaId]);

  const loadPlanos = async () => {
    try {
      const { data, error } = await supabase
        .from("planos_procedimentos")
        .select("*")
        .eq("clinica_id", clinicaId)
        .eq("ativo", true)
        .order("is_padrao", { ascending: false });

      if (error) throw error;

      setPlanos(data || []);
      
      // Selecionar plano padrão automaticamente
      const planoPadrao = data?.find(p => p.is_padrao);
      if (planoPadrao) {
        setPlanoSelecionado(planoPadrao.id);
      }
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
    }
  };

  const loadUserInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (profile) {
          setResponsavel(profile.full_name);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const handleAdicionarTratamento = (tratamento: TratamentoItem) => {
    setTratamentos([...tratamentos, { ...tratamento, id: crypto.randomUUID(), checked: false }]);
  };

  const handleRemoverTratamento = (id: string) => {
    setTratamentos(tratamentos.filter(t => t.id !== id));
  };

  const handleToggleTratamento = (id: string) => {
    setTratamentos(tratamentos.map(t => 
      t.id === id ? { ...t, checked: !t.checked } : t
    ));
  };

  const calcularValorTotal = () => {
    return tratamentos.reduce((sum, t) => sum + t.valor, 0);
  };

  const calcularValorSelecionado = () => {
    return tratamentos.filter(t => t.checked).reduce((sum, t) => sum + t.valor, 0);
  };

  const calcularTotal = () => {
    return calcularValorTotal() - desconto;
  };

  const handleSalvar = async () => {
    if (!descricao.trim()) {
      toast.error("Digite a descrição do orçamento");
      return;
    }

    if (tratamentos.length === 0) {
      toast.error("Adicione pelo menos um tratamento");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Criar orçamento
      const { data: orcamento, error: orcamentoError } = await supabase
        .from("budgets")
        .insert({
          patient_id: patientId,
          clinic_id: clinicaId,
          created_by: user.id,
          title: descricao,
          description: observacao,
          total_value: calcularValorTotal(),
          discount_value: desconto,
          final_value: calcularTotal(),
          status: "draft",
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        })
        .select()
        .single();

      if (orcamentoError) throw orcamentoError;

      // Criar itens do orçamento
      const itens = tratamentos.map(t => ({
        budget_id: orcamento.id,
        procedure_name: t.nome,
        unit_price: t.valor,
        quantity: 1,
        total_price: t.valor,
        discount: 0,
        tooth_number: t.dente_regiao,
        status: "pending",
      }));

      const { error: itensError } = await supabase
        .from("budget_items")
        .insert(itens);

      if (itensError) throw itensError;

      toast.success("Orçamento criado com sucesso");
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Erro ao salvar orçamento:", error);
      toast.error("Erro ao salvar orçamento: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("adicionar");
    setDescricao("");
    setData(format(new Date(), "yyyy-MM-dd"));
    setTratamentos([]);
    setDesconto(0);
    setParcelar(false);
    setObservacao("");
    setEmitirContrato(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">NOVO ORÇAMENTO</DialogTitle>
        </DialogHeader>

        {step === "adicionar" ? (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="descricao">Descrição*</Label>
                <Input
                  id="descricao"
                  placeholder="Ex: Plano tratamento de Maria Luiza"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável pelo orçamento</Label>
                <div className="relative">
                  <Input
                    id="responsavel"
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                  />
                  {responsavel && (
                    <button
                      onClick={() => setResponsavel("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
              <div className="col-span-3 space-y-2">
                <Label htmlFor="data">Data*</Label>
                <Input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>
            </div>

            <AdicionarTratamentoSection
              planos={planos}
              planoSelecionado={planoSelecionado}
              onPlanoChange={setPlanoSelecionado}
              clinicaId={clinicaId}
              onAdicionarTratamento={handleAdicionarTratamento}
            />

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleClose}>
                FECHAR
              </Button>
              <Button 
                onClick={() => setStep("listar")}
                disabled={tratamentos.length === 0}
              >
                CONTINUAR
              </Button>
            </div>
          </>
        ) : (
          <>
            <ListaTratamentosSection
              tratamentos={tratamentos}
              onToggle={handleToggleTratamento}
              onRemove={handleRemoverTratamento}
              valorTotal={calcularValorTotal()}
              valorSelecionado={calcularValorSelecionado()}
              desconto={desconto}
              onDescontoChange={setDesconto}
              total={calcularTotal()}
            />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="parcelar"
                  checked={parcelar}
                  onCheckedChange={(checked) => setParcelar(checked as boolean)}
                />
                <Label htmlFor="parcelar" className="cursor-pointer">
                  Parcelar orçamento
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacao">Observação</Label>
                <Textarea
                  id="observacao"
                  placeholder="Observações sobre o orçamento..."
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  maxLength={5000}
                  rows={4}
                />
                <p className="text-xs text-right text-muted-foreground">
                  {observacao.length} / 5000
                </p>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Camera className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  Lembre-se de <strong>tirar fotos</strong> no início do tratamento e utilizar o nosso recurso de imagens. 
                  Ao finalizar, você poderá fazer a comparação de <strong>antes e depois</strong> pela própria ferramenta de comparar imagens.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Switch
                    id="contrato"
                    checked={emitirContrato}
                    onCheckedChange={setEmitirContrato}
                  />
                  <Label htmlFor="contrato" className="cursor-pointer">
                    Emitir <strong>contrato</strong> ao aprovar orçamento
                  </Label>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Configurações de impressão do orçamento</h3>
                <p className="text-sm text-muted-foreground">
                  Abaixo estão as opções para configurar a impressão do seu orçamento. 
                  Ao ativá-las, você decide mostrar as informações
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries({
                    valorTotal: "Valor total",
                    valorPorTratamento: "Valor por tratamento",
                    parcelas: "Parcelas",
                    dentista: "Dentista",
                    odontograma: "Odontograma/HOF"
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        id={key}
                        checked={configImpressao[key as keyof typeof configImpressao]}
                        onCheckedChange={(checked) =>
                          setConfigImpressao({ ...configImpressao, [key]: checked })
                        }
                      />
                      <Label htmlFor={key} className="cursor-pointer">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep("adicionar")}>
                VOLTAR
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  FECHAR
                </Button>
                <Button onClick={handleSalvar} disabled={loading}>
                  {loading ? "SALVANDO..." : "SALVAR ORÇAMENTO"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
