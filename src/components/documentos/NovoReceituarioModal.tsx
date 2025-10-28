import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ChevronDown, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { medicamentos, categorias, Medicamento } from "@/data/medicamentos";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface NovoReceituarioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  tipo: "impresso" | "digital" | null;
}

interface MedicamentoSelecionado {
  id: string;
  medicamento: Medicamento;
  posologia: string;
  observacoes: string;
}

export const NovoReceituarioModal = ({
  open,
  onOpenChange,
  patientId,
  tipo,
}: NovoReceituarioModalProps) => {
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [professionalData, setProfessionalData] = useState<any>(null);
  const [clinicData, setClinicData] = useState<any>(null);
  const [data, setData] = useState(format(new Date(), "yyyy-MM-dd"));
  const [medicamentosSelecionados, setMedicamentosSelecionados] = useState<MedicamentoSelecionado[]>([]);
  const [searchOpen, setSearchOpen] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);

  useEffect(() => {
    if (open && tipo) {
      loadData();
      setData(format(new Date(), "yyyy-MM-dd"));
      setMedicamentosSelecionados([]);
      setSearchTerm("");
      setCategoriaFiltro(null);
    }
  }, [open, tipo]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Usuário não autenticado");
        return;
      }

      // Buscar dados do paciente
      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .maybeSingle();

      if (patientError) {
        console.error("Erro ao buscar paciente:", patientError);
      } else if (patient) {
        setPatientData(patient);
      }

      // Buscar dados do profissional
      const { data: professional, error: professionalError } = await supabase
        .from("profissionais")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (professionalError) {
        console.error("Erro ao buscar profissional:", professionalError);
      } else if (professional) {
        setProfessionalData(professional);
      }

      // Buscar dados da clínica
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Erro ao buscar profile:", profileError);
      } else if (profile?.clinic_id) {
        const { data: clinic, error: clinicError } = await supabase
          .from("clinicas")
          .select("*")
          .eq("id", profile.clinic_id)
          .maybeSingle();

        if (clinicError) {
          console.error("Erro ao buscar clínica:", clinicError);
        } else if (clinic) {
          setClinicData(clinic);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados para o receituário");
    }
  };

  const adicionarMedicamento = () => {
    setMedicamentosSelecionados([
      ...medicamentosSelecionados,
      {
        id: Date.now().toString(),
        medicamento: medicamentos[0],
        posologia: medicamentos[0].posologia_adulto,
        observacoes: "",
      },
    ]);
  };

  const removerMedicamento = (id: string) => {
    setMedicamentosSelecionados(medicamentosSelecionados.filter(m => m.id !== id));
  };

  const atualizarMedicamento = (id: string, medicamento: Medicamento) => {
    setMedicamentosSelecionados(
      medicamentosSelecionados.map(m =>
        m.id === id
          ? { ...m, medicamento, posologia: medicamento.posologia_adulto }
          : m
      )
    );
    setSearchOpen(null);
  };

  const atualizarPosologia = (id: string, posologia: string) => {
    setMedicamentosSelecionados(
      medicamentosSelecionados.map(m =>
        m.id === id ? { ...m, posologia } : m
      )
    );
  };

  const atualizarObservacoes = (id: string, observacoes: string) => {
    setMedicamentosSelecionados(
      medicamentosSelecionados.map(m =>
        m.id === id ? { ...m, observacoes } : m
      )
    );
  };

  const usarPosologiaPadrao = (id: string, tipoPaciente: "adulto" | "crianca") => {
    setMedicamentosSelecionados(
      medicamentosSelecionados.map(m => {
        if (m.id === id) {
          const posologia = tipoPaciente === "adulto"
            ? m.medicamento.posologia_adulto
            : m.medicamento.posologia_crianca;
          return { ...m, posologia };
        }
        return m;
      })
    );
  };

  const gerarConteudoReceituario = (): string => {
    const dataFormatada = format(new Date(data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

    let conteudo = `RECEITUÁRIO ${tipo?.toUpperCase()}\n\n`;
    conteudo += `${clinicData?.nome || "[Nome da Clínica]"}\n`;
    if (clinicData?.cnpj) conteudo += `CNPJ: ${clinicData.cnpj}\n`;
    conteudo += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    conteudo += `Paciente: ${patientData?.full_name || "[Nome do Paciente]"}\n`;
    conteudo += `Data: ${dataFormatada}\n\n`;

    conteudo += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    medicamentosSelecionados.forEach((med, index) => {
      conteudo += `${index + 1}. ${med.medicamento.nome} ${med.medicamento.concentracao}\n`;
      conteudo += `   ${med.posologia}\n`;
      if (med.observacoes) {
        conteudo += `   Obs: ${med.observacoes}\n`;
      }
      conteudo += `\n`;
    });

    conteudo += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    conteudo += `${professionalData?.nome || "[Nome do Profissional]"}\n`;
    conteudo += `CRO: ${professionalData?.cro || "[CRO]"}\n`;

    return conteudo;
  };

  const handleSalvar = async () => {
    if (medicamentosSelecionados.length === 0) {
      toast.error("Adicione pelo menos um medicamento");
      return;
    }

    if (!patientData || !professionalData || !clinicData) {
      toast.error("Dados incompletos. Reabra o formulário.");
      return;
    }

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.clinic_id) throw new Error("Clínica não encontrada");

      const conteudo = gerarConteudoReceituario();

      const { error } = await supabase
        .from("patient_documents")
        .insert({
          patient_id: patientId,
          clinic_id: profile.clinic_id,
          document_type: "receituario",
          title: `Receituário ${tipo === "impresso" ? "Impresso" : "Digital"} - ${format(new Date(data), "dd/MM/yyyy")}`,
          content: conteudo,
          created_by: user.id,
          status: "finalizado",
          metadata: {
            tipo,
            medicamentos: medicamentosSelecionados.map(m => ({
              nome: m.medicamento.nome,
              concentracao: m.medicamento.concentracao,
              posologia: m.posologia,
              observacoes: m.observacoes,
            })),
          },
        });

      if (error) throw error;

      toast.success("Receituário salvo com sucesso");
      onOpenChange(false);
      setMedicamentosSelecionados([]);
    } catch (error: any) {
      console.error("Erro ao salvar receituário:", error);
      toast.error("Erro ao salvar receituário");
    } finally {
      setLoading(false);
    }
  };

  const medicamentosFiltrados = medicamentos.filter(med => {
    const matchesSearch = med.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.indicacao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !categoriaFiltro || med.categoria === categoriaFiltro;
    return matchesSearch && matchesCategoria;
  });

  if (!tipo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Receituário {tipo === "impresso" ? "Impresso" : "Digital"}
          </DialogTitle>
          <DialogDescription>
            Adicione os medicamentos e suas posologias
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 px-1">
          {/* Informações do Profissional e Paciente */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b">
            <div>
              <Label className="text-xs text-muted-foreground">Profissional</Label>
              <p className="font-medium">{professionalData?.nome || "Carregando..."}</p>
              <p className="text-sm text-muted-foreground">CRO: {professionalData?.cro || "-"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Paciente</Label>
              <p className="font-medium">{patientData?.full_name || "Carregando..."}</p>
              <p className="text-sm text-muted-foreground">{patientData?.address || "-"}</p>
            </div>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          {/* Lista de Medicamentos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Medicamentos</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={adicionarMedicamento}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Medicamento
              </Button>
            </div>

            {medicamentosSelecionados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>Clique para adicionar medicamentos</p>
                <p className="text-sm mt-2">0 / 255</p>
              </div>
            ) : (
              <div className="space-y-4">
                {medicamentosSelecionados.map((medSel, index) => (
                  <div key={medSel.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Seleção do Medicamento */}
                        <div className="space-y-2">
                          <Label>Medicamento {index + 1}</Label>
                          <Popover open={searchOpen === medSel.id} onOpenChange={(open) => setSearchOpen(open ? medSel.id : null)}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                              >
                                <span className="truncate">
                                  {medSel.medicamento.nome} {medSel.medicamento.concentracao}
                                </span>
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[600px] p-0" align="start">
                              <Command>
                                <CommandInput
                                  placeholder="Buscar medicamento..."
                                  value={searchTerm}
                                  onValueChange={setSearchTerm}
                                />
                                <div className="flex gap-2 p-2 border-b flex-wrap">
                                  <Badge
                                    variant={categoriaFiltro === null ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => setCategoriaFiltro(null)}
                                  >
                                    Todos
                                  </Badge>
                                  {categorias.map((cat) => (
                                    <Badge
                                      key={cat}
                                      variant={categoriaFiltro === cat ? "default" : "outline"}
                                      className="cursor-pointer"
                                      onClick={() => setCategoriaFiltro(cat)}
                                    >
                                      {cat}
                                    </Badge>
                                  ))}
                                </div>
                                <CommandList className="max-h-[300px]">
                                  <CommandEmpty>Nenhum medicamento encontrado.</CommandEmpty>
                                  <CommandGroup>
                                    {medicamentosFiltrados.map((med) => (
                                      <CommandItem
                                        key={`${med.nome}-${med.concentracao}`}
                                        onSelect={() => atualizarMedicamento(medSel.id, med)}
                                        className="cursor-pointer"
                                      >
                                        <div className="flex flex-col gap-1 w-full">
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                              {med.nome} {med.concentracao}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                              {med.categoria}
                                            </Badge>
                                          </div>
                                          <span className="text-xs text-muted-foreground">
                                            {med.indicacao}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <div className="text-xs text-muted-foreground">
                            <p><strong>Indicação:</strong> {medSel.medicamento.indicacao}</p>
                          </div>
                        </div>

                        {/* Posologia */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Posologia</Label>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => usarPosologiaPadrao(medSel.id, "adulto")}
                              >
                                Adulto
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => usarPosologiaPadrao(medSel.id, "crianca")}
                              >
                                Criança
                              </Button>
                            </div>
                          </div>
                          <Textarea
                            value={medSel.posologia}
                            onChange={(e) => atualizarPosologia(medSel.id, e.target.value)}
                            placeholder="Ex: Tomar 1 comprimido a cada 8 horas por 7 dias"
                            className="min-h-[60px]"
                          />
                        </div>

                        {/* Observações */}
                        <div className="space-y-2">
                          <Label>Observações (opcional)</Label>
                          <Input
                            value={medSel.observacoes}
                            onChange={(e) => atualizarObservacoes(medSel.id, e.target.value)}
                            placeholder="Ex: Tomar após as refeições"
                          />
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removerMedicamento(medSel.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Fechar
          </Button>
          <Button onClick={handleSalvar} disabled={loading || medicamentosSelecionados.length === 0}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Receita"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};