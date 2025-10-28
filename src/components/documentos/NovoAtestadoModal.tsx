import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { cidsOdontologicos } from "@/data/cids";

interface NovoAtestadoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  tipo: "impresso" | "digital" | null;
}

export const NovoAtestadoModal = ({
  open,
  onOpenChange,
  patientId,
  tipo,
}: NovoAtestadoModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [selectedProfissional, setSelectedProfissional] = useState<string>("");
  const [professionalData, setProfessionalData] = useState<any>(null);
  const [clinicData, setClinicData] = useState<any>(null);
  
  const [tipoAtestado, setTipoAtestado] = useState<"dias" | "presenca">("dias");
  const [dataAtestado, setDataAtestado] = useState(format(new Date(), "yyyy-MM-dd"));
  const [quantidadeDias, setQuantidadeDias] = useState("");
  const [cid, setCid] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [openCidCombobox, setOpenCidCombobox] = useState(false);

  useEffect(() => {
    if (open && patientId) {
      loadData();
    }
  }, [open, patientId]);

  const loadData = async () => {
    try {
      // Load patient data
      const { data: patient } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single();
      
      setPatientData(patient);

      // Load clinic data and professionals
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: usuario } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", user.id)
          .single();

        if (usuario) {
          // Load clinic data
          const { data: clinica } = await supabase
            .from("clinicas")
            .select("*")
            .eq("id", usuario.clinica_id)
            .single();
          
          setClinicData(clinica);

          // Load all professionals from the clinic
          const { data: profissionaisList } = await supabase
            .from("profissionais")
            .select("*")
            .eq("clinica_id", usuario.clinica_id)
            .eq("ativo", true)
            .order("nome");

          setProfissionais(profissionaisList || []);

          // Try to find current user as professional and set as default
          const currentProfissional = profissionaisList?.find(p => p.email === usuario.email);
          if (currentProfissional) {
            setSelectedProfissional(currentProfissional.id);
            setProfessionalData({
              nome: currentProfissional.nome,
              cro: currentProfissional.cro || "Não cadastrado",
              especialidade: currentProfissional.especialidade || "Odontologia",
            });
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados necessários",
        variant: "destructive",
      });
    }
  };

  // Update professional data when selection changes
  useEffect(() => {
    if (selectedProfissional) {
      const profissional = profissionais.find(p => p.id === selectedProfissional);
      if (profissional) {
        setProfessionalData({
          nome: profissional.nome,
          cro: profissional.cro || "Não cadastrado",
          especialidade: profissional.especialidade || "Odontologia",
        });
      }
    }
  }, [selectedProfissional, profissionais]);

  const gerarConteudoAtestado = () => {
    if (!patientData || !professionalData || !clinicData) return "";

    const dataFormatada = format(new Date(dataAtestado), "dd/MM/yyyy");
    const hoje = format(new Date(), "dd/MM/yyyy");
    
    let conteudo = `ATESTADO MÉDICO ODONTOLÓGICO\n\n`;
    conteudo += `${clinicData.nome}\n`;
    if (clinicData.address?.rua) {
      conteudo += `${clinicData.address.rua}, ${clinicData.address.numero || "S/N"}\n`;
      conteudo += `${clinicData.address.cidade || ""} - ${clinicData.address.estado || ""}\n`;
    }
    if (clinicData.telefone) {
      conteudo += `Tel: ${clinicData.telefone}\n`;
    }
    conteudo += `\n${"=".repeat(60)}\n\n`;

    conteudo += `Paciente: ${patientData.full_name}\n`;
    if (patientData.cpf) {
      conteudo += `CPF: ${patientData.cpf}\n`;
    }
    if (patientData.birth_date) {
      conteudo += `Data de Nascimento: ${format(new Date(patientData.birth_date), "dd/MM/yyyy")}\n`;
    }
    if (patientData.address) {
      conteudo += `Endereço: ${patientData.address}\n`;
    }
    conteudo += `\n`;

    if (tipoAtestado === "dias") {
      conteudo += `Atesto para os devidos fins que o(a) paciente acima identificado(a) `;
      conteudo += `esteve sob meus cuidados profissionais na data de ${dataFormatada}, `;
      conteudo += `necessitando de afastamento de suas atividades por ${quantidadeDias} dia(s).\n\n`;
    } else {
      conteudo += `Atesto para os devidos fins que o(a) paciente acima identificado(a) `;
      conteudo += `compareceu à consulta odontológica nesta data (${dataFormatada}).\n\n`;
    }

    if (cid) {
      conteudo += `CID: ${cid}\n\n`;
    }

    if (observacoes) {
      conteudo += `Observações: ${observacoes}\n\n`;
    }

    conteudo += `\n`;
    conteudo += `${clinicData.address?.cidade || "São Paulo"}, ${hoje}\n\n`;
    conteudo += `\n\n`;
    conteudo += `${"_".repeat(50)}\n`;
    conteudo += `${professionalData.nome}\n`;
    conteudo += `${professionalData.especialidade}\n`;
    conteudo += `CRO: ${professionalData.cro}\n`;

    return conteudo;
  };

  const handleSalvar = async () => {
    if (!patientData || !professionalData || !selectedProfissional) {
      toast({
        title: "Erro",
        description: "Dados do paciente ou profissional não encontrados",
        variant: "destructive",
      });
      return;
    }

    if (tipoAtestado === "dias" && !quantidadeDias) {
      toast({
        title: "Atenção",
        description: "Por favor, informe a quantidade de dias",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const content = gerarConteudoAtestado();
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("patient_documents").insert({
        patient_id: patientId,
        clinic_id: patientData.clinic_id,
        document_type: "atestado",
        title: `Atestado - ${format(new Date(), "dd/MM/yyyy")}`,
        content: content,
        created_by: user?.id,
        professional_id: selectedProfissional,
        status: "finalizado",
        signed_at: new Date().toISOString(),
        metadata: {
          tipo: tipo,
          tipo_atestado: tipoAtestado,
          data_atestado: dataAtestado,
          quantidade_dias: tipoAtestado === "dias" ? quantidadeDias : null,
          cid: cid || null,
          observacoes: observacoes || null,
        },
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Atestado criado com sucesso",
      });

      onOpenChange(false);
      
      // Reset form
      setTipoAtestado("dias");
      setDataAtestado(format(new Date(), "yyyy-MM-dd"));
      setQuantidadeDias("");
      setCid("");
      setObservacoes("");
    } catch (error) {
      console.error("Erro ao salvar atestado:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar atestado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!tipo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Novo Atestado {tipo === "impresso" ? "Impresso" : "Digital"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Professional Selection */}
          <div className="space-y-2">
            <Label htmlFor="profissional">Profissional*</Label>
            <Select value={selectedProfissional} onValueChange={setSelectedProfissional}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                {profissionais.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    {prof.nome} - CRO: {prof.cro || "Não cadastrado"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Professional Info Display */}
          {professionalData && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-sm text-muted-foreground">Profissional</Label>
                <p className="font-medium">{professionalData.nome}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Inscrição no Conselho</Label>
                <p className="font-medium">{professionalData.cro}</p>
              </div>
            </div>
          )}

          {/* Certificate Type */}
          <div className="space-y-3">
            <Label>Tipo de atestado</Label>
            <RadioGroup value={tipoAtestado} onValueChange={(value: any) => setTipoAtestado(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dias" id="dias" />
                <Label htmlFor="dias" className="cursor-pointer">Atestado de dias</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="presenca" id="presenca" />
                <Label htmlFor="presenca" className="cursor-pointer">Presença na consulta</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date and Days */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data do atestado*</Label>
              <Input
                id="data"
                type="date"
                value={dataAtestado}
                onChange={(e) => setDataAtestado(e.target.value)}
              />
            </div>
            
            {tipoAtestado === "dias" && (
              <div className="space-y-2">
                <Label htmlFor="dias">Quantidade de dias*</Label>
                <Input
                  id="dias"
                  type="number"
                  min="1"
                  value={quantidadeDias}
                  onChange={(e) => setQuantidadeDias(e.target.value)}
                  placeholder="Ex: 3"
                />
              </div>
            )}
          </div>

          {/* CID */}
          <div className="space-y-2">
            <Label htmlFor="cid">CID (Classificação Internacional de Doenças)</Label>
            <Popover open={openCidCombobox} onOpenChange={setOpenCidCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCidCombobox}
                  className="w-full justify-between"
                >
                  {cid
                    ? cidsOdontologicos.find((c) => c.code === cid)?.code + " - " + cidsOdontologicos.find((c) => c.code === cid)?.description
                    : "Selecione o CID (opcional)"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Pesquisar CID..." />
                  <CommandList>
                    <CommandEmpty>Nenhum CID encontrado.</CommandEmpty>
                    <CommandGroup>
                      {cidsOdontologicos.map((cidItem) => (
                        <CommandItem
                          key={cidItem.code}
                          value={`${cidItem.code} ${cidItem.description}`}
                          onSelect={() => {
                            setCid(cidItem.code);
                            setOpenCidCombobox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              cid === cidItem.code ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{cidItem.code}</span>
                            <span className="text-sm text-muted-foreground">{cidItem.description}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {cid && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCid("")}
                className="h-8 text-xs"
              >
                Limpar seleção
              </Button>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais (opcional)"
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {observacoes.length}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              FECHAR
            </Button>
            <Button onClick={handleSalvar} disabled={loading}>
              {loading ? "SALVANDO..." : "SALVAR ATESTADO"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
