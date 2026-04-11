import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, X, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { generateContractTemplate, generateContractNumber, type ContractTemplateData } from "@/utils/generateContractTemplate";

interface NovoContratoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
}

export const NovoContratoModal = ({ open, onOpenChange, patientId }: NovoContratoModalProps) => {
  const [loading, setLoading] = useState(false);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [clinicId, setClinicId] = useState("");

  // Sections open state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    clinica: true, paciente: true, profissional: true, responsavel: false,
    tratamento: true, financeiro: true, fechamento: false,
  });

  // Form fields
  const [patientName, setPatientName] = useState("");
  const [patientRg, setPatientRg] = useState("");
  const [patientCpf, setPatientCpf] = useState("");
  const [patientBirthDate, setPatientBirthDate] = useState("");
  const [patientAddress, setPatientAddress] = useState("");
  const [patientCity, setPatientCity] = useState("");
  const [patientUf, setPatientUf] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");

  const [clinicName, setClinicName] = useState("");
  const [clinicCnpj, setClinicCnpj] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [clinicCity, setClinicCity] = useState("");
  const [clinicUf, setClinicUf] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  const [clinicEmail, setClinicEmail] = useState("");

  const [selectedProfessional, setSelectedProfessional] = useState("");
  const [professionalName, setProfessionalName] = useState("");
  const [professionalCro, setProfessionalCro] = useState("");
  const [professionalSpecialty, setProfessionalSpecialty] = useState("");

  const [hasResponsible, setHasResponsible] = useState(false);
  const [responsibleName, setResponsibleName] = useState("");
  const [responsibleCpf, setResponsibleCpf] = useState("");
  const [responsibleRelation, setResponsibleRelation] = useState("");

  const [mainProcedure, setMainProcedure] = useState("");
  const [dentalArea, setDentalArea] = useState("");
  const [treatmentPlanSummary, setTreatmentPlanSummary] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [expectedStartDate, setExpectedStartDate] = useState("");

  const [totalValue, setTotalValue] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [installmentsCount, setInstallmentsCount] = useState("");
  const [installmentValue, setInstallmentValue] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [noShowFee, setNoShowFee] = useState("");

  const [selectedBudget, setSelectedBudget] = useState("");
  const [isRemoteContract, setIsRemoteContract] = useState(false);
  const [contractContent, setContractContent] = useState("");

  useEffect(() => {
    if (open) {
      loadPatientData();
      loadClinicData();
      loadProfissionais();
      loadOrcamentos();
    } else {
      resetForm();
    }
  }, [open, patientId]);

  const resetForm = () => {
    setSelectedProfessional("");
    setProfessionalName("");
    setProfessionalCro("");
    setProfessionalSpecialty("");
    setSelectedBudget("");
    setHasResponsible(false);
    setResponsibleName("");
    setResponsibleCpf("");
    setResponsibleRelation("");
    setIsRemoteContract(false);
  };

  const loadClinicData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("clinic_id").eq("id", user.id).single();
      if (!profile?.clinic_id) return;
      setClinicId(profile.clinic_id);

      const [clinicRes, configRes] = await Promise.all([
        supabase.from("clinicas").select("nome, cnpj, telefone, address").eq("id", profile.clinic_id).single(),
        supabase.from("configuracoes_clinica").select("email_contato").eq("clinica_id", profile.clinic_id).maybeSingle(),
      ]);

      const clinic = clinicRes.data;
      if (clinic) {
        setClinicName(clinic.nome || "");
        setClinicCnpj(clinic.cnpj || "");
        setClinicPhone(clinic.telefone || "");
        const addr = clinic.address as any;
        if (addr && typeof addr === "object") {
          setClinicAddress([addr.street, addr.number, addr.neighborhood].filter(Boolean).join(", "));
          setClinicCity(addr.city || "");
          setClinicUf(addr.state || "");
        }
      }
      if (configRes.data) {
        setClinicEmail((configRes.data as any).email_contato || "");
      }
    } catch (error) {
      console.error("Erro ao carregar dados da clinica:", error);
    }
  };

  const loadPatientData = async () => {
    try {
      const { data: patient } = await supabase
        .from("patients")
        .select("full_name, birth_date, cpf, address, phone, email, responsible_name, responsible_cpf")
        .eq("id", patientId)
        .single();

      if (patient) {
        setPatientName(patient.full_name || "");
        setPatientBirthDate(patient.birth_date || "");
        setPatientCpf(patient.cpf || "");
        setPatientAddress(patient.address || "");
        setPatientPhone(patient.phone || "");
        setPatientEmail(patient.email || "");
        if ((patient as any).responsible_name) {
          setHasResponsible(true);
          setResponsibleName((patient as any).responsible_name || "");
          setResponsibleCpf((patient as any).responsible_cpf || "");
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do paciente:", error);
    }
  };

  const loadProfissionais = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("clinic_id").eq("id", user.id).single();
      if (!profile?.clinic_id) return;

      const { data } = await supabase
        .from("profissionais")
        .select("id, nome, cro, especialidade")
        .eq("clinica_id", profile.clinic_id)
        .eq("ativo", true)
        .order("nome");

      setProfissionais(data || []);
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
    }
  };

  const loadOrcamentos = async () => {
    try {
      const { data } = await supabase
        .from("budgets")
        .select("id, title, total_value, final_value, budget_items(procedure_name, tooth_region, unit_price)")
        .eq("patient_id", patientId)
        .eq("status", "approved");

      setOrcamentos(data || []);
    } catch (error) {
      console.error("Erro ao carregar orcamentos:", error);
    }
  };

  const handleProfessionalChange = (id: string) => {
    setSelectedProfessional(id);
    const prof = profissionais.find((p) => p.id === id);
    if (prof) {
      setProfessionalName(prof.nome || "");
      setProfessionalCro(prof.cro || "");
      setProfessionalSpecialty(prof.especialidade || "");
    }
  };

  const handleBudgetChange = (budgetId: string) => {
    setSelectedBudget(budgetId);
    const budget = orcamentos.find((o) => o.id === budgetId);
    if (budget) {
      const value = budget.final_value || budget.total_value || 0;
      setTotalValue(value.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
      const procedures = budget.budget_items
        ?.map((item: any) => `${item.procedure_name}${item.tooth_region ? ` (${item.tooth_region})` : ""}`)
        .join(", ");
      setMainProcedure(procedures || "");
      setTreatmentPlanSummary(procedures || "");
    }
  };

  // Build template data from form
  const templateData: ContractTemplateData = useMemo(() => ({
    clinicName, clinicCnpj, clinicAddress, clinicCity, clinicUf, clinicPhone, clinicEmail,
    professionalName, professionalCro, professionalSpecialty,
    patientName, patientRg, patientCpf, patientBirthDate, patientAddress, patientCity, patientUf, patientPhone, patientEmail,
    responsibleName: hasResponsible ? responsibleName : undefined,
    responsibleCpf: hasResponsible ? responsibleCpf : undefined,
    responsibleRelation: hasResponsible ? responsibleRelation : undefined,
    mainProcedure, dentalArea, treatmentPlanSummary, estimatedDuration, expectedStartDate,
    totalValue, downPayment, installmentsCount, installmentValue, dueDay, paymentMethod, noShowFee,
    signingCity: clinicCity,
    signingDate: format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
    courtDistrict: clinicCity,
    contractVersion: "1",
    isRemoteContract,
  }), [
    clinicName, clinicCnpj, clinicAddress, clinicCity, clinicUf, clinicPhone, clinicEmail,
    professionalName, professionalCro, professionalSpecialty,
    patientName, patientRg, patientCpf, patientBirthDate, patientAddress, patientCity, patientUf, patientPhone, patientEmail,
    hasResponsible, responsibleName, responsibleCpf, responsibleRelation,
    mainProcedure, dentalArea, treatmentPlanSummary, estimatedDuration, expectedStartDate,
    totalValue, downPayment, installmentsCount, installmentValue, dueDay, paymentMethod, noShowFee, isRemoteContract,
  ]);

  // Auto-update preview
  useEffect(() => {
    const content = generateContractTemplate(templateData);
    setContractContent(content);
  }, [templateData]);

  const canEmit = patientName && patientCpf && selectedProfessional && mainProcedure && totalValue;

  const handleSave = async (status: "rascunho" | "finalizado") => {
    if (status === "finalizado" && !canEmit) {
      toast.error("Preencha: paciente, CPF, profissional executor, procedimento e valor");
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario nao autenticado");

      const contractNum = generateContractNumber();
      const finalContent = generateContractTemplate({ ...templateData, contractNumber: contractNum });

      const { error } = await supabase.from("patient_documents").insert({
        patient_id: patientId,
        clinic_id: clinicId,
        document_type: "contrato",
        title: `Contrato de Prestacao de Servicos - ${patientName}`,
        content: finalContent,
        created_by: user.id,
        status,
        patient_birth_date: patientBirthDate || null,
        patient_cpf: patientCpf,
        patient_address: patientAddress,
        professional_id: selectedProfessional || null,
        contract_value: parseFloat(totalValue.replace(/\./g, "").replace(",", ".")) || 0,
        procedures_list: mainProcedure,
        budget_id: selectedBudget || null,
        contract_number: contractNum,
        contract_version: 1,
      });

      if (error) throw error;
      toast.success(status === "rascunho" ? "Contrato salvo como rascunho" : "Contrato emitido com sucesso");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar contrato:", error);
      toast.error("Erro ao salvar contrato");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (key: string) => setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const SectionHeader = ({ sectionKey, title }: { sectionKey: string; title: string }) => (
    <CollapsibleTrigger asChild onClick={() => toggleSection(sectionKey)}>
      <button className="flex items-center justify-between w-full py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors">
        {title}
        {openSections[sectionKey] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
    </CollapsibleTrigger>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
        <div className="flex h-[95vh]">
          {/* Sidebar Form */}
          <div className="w-[420px] border-r bg-muted/30 p-5 overflow-y-auto space-y-1">
            <DialogHeader className="mb-4">
              <DialogTitle>Novo Contrato Institucional</DialogTitle>
            </DialogHeader>

            {/* Clinica */}
            <Collapsible open={openSections.clinica}>
              <SectionHeader sectionKey="clinica" title="Dados da Clinica" />
              <CollapsibleContent className="space-y-2 pb-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2"><Label>Nome</Label><Input value={clinicName} disabled className="bg-muted h-9" /></div>
                  <div><Label>CNPJ</Label><Input value={clinicCnpj} disabled className="bg-muted h-9" /></div>
                  <div><Label>Telefone</Label><Input value={clinicPhone} disabled className="bg-muted h-9" /></div>
                  <div className="col-span-2"><Label>Endereco</Label><Input value={clinicAddress} disabled className="bg-muted h-9" /></div>
                  <div><Label>Cidade</Label><Input value={clinicCity} disabled className="bg-muted h-9" /></div>
                  <div><Label>UF</Label><Input value={clinicUf} disabled className="bg-muted h-9" /></div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Paciente */}
            <Collapsible open={openSections.paciente}>
              <SectionHeader sectionKey="paciente" title="Dados do Paciente" />
              <CollapsibleContent className="space-y-2 pb-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2"><Label>Nome*</Label><Input value={patientName} onChange={(e) => setPatientName(e.target.value)} className="h-9" /></div>
                  <div><Label>CPF*</Label><Input value={patientCpf} onChange={(e) => setPatientCpf(e.target.value)} className="h-9" /></div>
                  <div><Label>RG</Label><Input value={patientRg} onChange={(e) => setPatientRg(e.target.value)} className="h-9" /></div>
                  <div><Label>Nascimento</Label><Input type="date" value={patientBirthDate} onChange={(e) => setPatientBirthDate(e.target.value)} className="h-9" /></div>
                  <div><Label>Telefone</Label><Input value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} className="h-9" /></div>
                  <div className="col-span-2"><Label>Endereco*</Label><Input value={patientAddress} onChange={(e) => setPatientAddress(e.target.value)} className="h-9" /></div>
                  <div><Label>Cidade</Label><Input value={patientCity} onChange={(e) => setPatientCity(e.target.value)} className="h-9" /></div>
                  <div><Label>UF</Label><Input value={patientUf} onChange={(e) => setPatientUf(e.target.value)} className="h-9" /></div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Responsavel Legal */}
            <Collapsible open={openSections.responsavel}>
              <SectionHeader sectionKey="responsavel" title="Responsavel Legal" />
              <CollapsibleContent className="space-y-2 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Switch checked={hasResponsible} onCheckedChange={setHasResponsible} />
                  <Label className="text-xs">Paciente possui responsavel legal</Label>
                </div>
                {hasResponsible && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2"><Label>Nome</Label><Input value={responsibleName} onChange={(e) => setResponsibleName(e.target.value)} className="h-9" /></div>
                    <div><Label>CPF</Label><Input value={responsibleCpf} onChange={(e) => setResponsibleCpf(e.target.value)} className="h-9" /></div>
                    <div><Label>Parentesco</Label><Input value={responsibleRelation} onChange={(e) => setResponsibleRelation(e.target.value)} placeholder="Mae, Pai, Tutor" className="h-9" /></div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Profissional Executor */}
            <Collapsible open={openSections.profissional}>
              <SectionHeader sectionKey="profissional" title="Profissional Executor" />
              <CollapsibleContent className="space-y-2 pb-3">
                <div>
                  <Label>Dentista Responsavel*</Label>
                  <Select value={selectedProfessional} onValueChange={handleProfessionalChange}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Selecione o dentista" /></SelectTrigger>
                    <SelectContent>
                      {profissionais.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.nome} {p.cro ? `- CRO: ${p.cro}` : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>CRO</Label><Input value={professionalCro} disabled className="bg-muted h-9" /></div>
                  <div><Label>Especialidade</Label><Input value={professionalSpecialty} disabled className="bg-muted h-9" /></div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Tratamento */}
            <Collapsible open={openSections.tratamento}>
              <SectionHeader sectionKey="tratamento" title="Dados do Tratamento" />
              <CollapsibleContent className="space-y-2 pb-3">
                {orcamentos.length > 0 && (
                  <div>
                    <Label>Vincular Orcamento Aprovado</Label>
                    <Select value={selectedBudget} onValueChange={handleBudgetChange}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                      <SelectContent>
                        {orcamentos.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.title} - R$ {(o.final_value || o.total_value)?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div><Label>Procedimento Principal*</Label><Textarea value={mainProcedure} onChange={(e) => setMainProcedure(e.target.value)} className="min-h-[60px]" placeholder="Ex: Implante dentario unitario" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Area Odontologica</Label><Input value={dentalArea} onChange={(e) => setDentalArea(e.target.value)} placeholder="Ex: Implantodontia" className="h-9" /></div>
                  <div><Label>Prazo Estimado</Label><Input value={estimatedDuration} onChange={(e) => setEstimatedDuration(e.target.value)} placeholder="Ex: 6 meses" className="h-9" /></div>
                </div>
                <div><Label>Inicio Previsto</Label><Input type="date" value={expectedStartDate} onChange={(e) => setExpectedStartDate(e.target.value)} className="h-9" /></div>
              </CollapsibleContent>
            </Collapsible>

            {/* Financeiro */}
            <Collapsible open={openSections.financeiro}>
              <SectionHeader sectionKey="financeiro" title="Dados Financeiros" />
              <CollapsibleContent className="space-y-2 pb-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Valor Total (R$)*</Label><Input value={totalValue} onChange={(e) => setTotalValue(e.target.value)} placeholder="0,00" className="h-9" /></div>
                  <div><Label>Entrada (R$)</Label><Input value={downPayment} onChange={(e) => setDownPayment(e.target.value)} placeholder="0,00" className="h-9" /></div>
                  <div><Label>Qtd Parcelas</Label><Input value={installmentsCount} onChange={(e) => setInstallmentsCount(e.target.value)} placeholder="1" className="h-9" /></div>
                  <div><Label>Valor Parcela</Label><Input value={installmentValue} onChange={(e) => setInstallmentValue(e.target.value)} placeholder="0,00" className="h-9" /></div>
                  <div><Label>Dia Vencimento</Label><Input value={dueDay} onChange={(e) => setDueDay(e.target.value)} placeholder="10" className="h-9" /></div>
                  <div><Label>Forma Pagamento</Label><Input value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} placeholder="PIX, Boleto..." className="h-9" /></div>
                </div>
                <div><Label>Valor Falta sem Aviso (R$)</Label><Input value={noShowFee} onChange={(e) => setNoShowFee(e.target.value)} placeholder="Opcional" className="h-9" /></div>
              </CollapsibleContent>
            </Collapsible>

            {/* Fechamento */}
            <Collapsible open={openSections.fechamento}>
              <SectionHeader sectionKey="fechamento" title="Opcoes Adicionais" />
              <CollapsibleContent className="space-y-2 pb-3">
                <div className="flex items-center gap-2">
                  <Switch checked={isRemoteContract} onCheckedChange={setIsRemoteContract} />
                  <Label className="text-xs">Contratacao remota/digital (inclui clausula de arrependimento CDC)</Label>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Document Preview */}
          <div className="flex-1 flex flex-col">
            <div className="border-b p-4 flex justify-between items-center">
              <h3 className="font-semibold">Pre-visualizacao do Contrato</h3>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <Textarea
                value={contractContent}
                onChange={(e) => setContractContent(e.target.value)}
                className="min-h-[calc(95vh-180px)] font-mono text-sm resize-none"
              />
            </div>

            <div className="border-t p-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Fechar</Button>
              <Button variant="outline" onClick={() => handleSave("rascunho")} disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Salvar Rascunho"}
              </Button>
              <Button onClick={() => handleSave("finalizado")} disabled={loading || !canEmit}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Emitindo...</> : "Emitir Contrato"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
