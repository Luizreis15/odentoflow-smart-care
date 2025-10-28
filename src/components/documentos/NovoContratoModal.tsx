import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NovoContratoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
}

export const NovoContratoModal = ({ open, onOpenChange, patientId }: NovoContratoModalProps) => {
  const [loading, setLoading] = useState(false);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  
  // Dados do paciente
  const [patientName, setPatientName] = useState("");
  const [patientBirthDate, setPatientBirthDate] = useState("");
  const [patientCpf, setPatientCpf] = useState("");
  const [patientAddress, setPatientAddress] = useState("");
  
  // Tipo de contrato: "clinica" ou "profissional"
  const [contractType, setContractType] = useState<"clinica" | "profissional">("clinica");
  
  // Dados da clínica
  const [clinicName, setClinicName] = useState("");
  const [clinicCnpj, setClinicCnpj] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  
  // Dados do profissional
  const [selectedProfessional, setSelectedProfessional] = useState("");
  const [professionalCpf, setProfessionalCpf] = useState("");
  const [professionalName, setProfessionalName] = useState("");
  const [professionalAddress, setProfessionalAddress] = useState("");
  
  // Dados do contrato
  const [contractValue, setContractValue] = useState("");
  const [procedures, setProcedures] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  
  // Conteúdo do contrato
  const [contractContent, setContractContent] = useState("");

  useEffect(() => {
    if (open) {
      console.log("Modal aberto - carregando dados...");
      loadPatientData();
      loadClinicData();
      loadProfissionais();
      loadOrcamentos();
    } else {
      // Reset ao fechar
      setSelectedProfessional("");
      setProfessionalName("");
      setProfessionalCpf("");
      setSelectedBudget("");
    }
  }, [open, patientId]);

  const loadClinicData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      if (!profile?.clinic_id) return;

      const { data: clinic, error } = await supabase
        .from("clinicas")
        .select("nome, cnpj, address")
        .eq("id", profile.clinic_id)
        .single();

      if (error) throw error;

      if (clinic) {
        setClinicName(clinic.nome || "");
        setClinicCnpj(clinic.cnpj || "");
        
        // Formatar endereço se for JSON
        if (clinic.address && typeof clinic.address === 'object') {
          const addr = clinic.address as any;
          const fullAddress = `${addr.street || ""}, ${addr.number || ""}, ${addr.neighborhood || ""}, ${addr.city || ""} - ${addr.state || ""}, CEP: ${addr.zipCode || ""}`;
          setClinicAddress(fullAddress.trim());
        } else if (typeof clinic.address === 'string') {
          setClinicAddress(clinic.address);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados da clínica:", error);
    }
  };

  const loadPatientData = async () => {
    try {
      const { data: patient, error } = await supabase
        .from("patients")
        .select("full_name, birth_date, cpf, address")
        .eq("id", patientId)
        .single();

      if (error) throw error;

      if (patient) {
        setPatientName(patient.full_name || "");
        setPatientBirthDate(patient.birth_date || "");
        setPatientCpf(patient.cpf || "");
        setPatientAddress(patient.address || "");
      }
    } catch (error) {
      console.error("Erro ao carregar dados do paciente:", error);
    }
  };

  const loadProfissionais = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();

      if (!profile?.clinic_id) return;

      const { data, error } = await supabase
        .from("profissionais")
        .select("id, nome, cro, email")
        .eq("clinica_id", profile.clinic_id)
        .eq("ativo", true)
        .order("nome");

      if (error) throw error;
      
      console.log("Profissionais carregados:", data);
      setProfissionais(data || []);
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
      toast.error("Erro ao carregar profissionais");
    }
  };

  const loadOrcamentos = async () => {
    try {
      const { data, error } = await supabase
        .from("budgets")
        .select(`
          id,
          title,
          total_value,
          budget_items(
            id,
            procedure_name,
            tooth_region,
            unit_price,
            status
          )
        `)
        .eq("patient_id", patientId)
        .eq("status", "approved");

      if (error) throw error;
      setOrcamentos(data || []);
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error);
    }
  };

  const handleProfessionalChange = (professionalId: string) => {
    setSelectedProfessional(professionalId);
    const prof = profissionais.find(p => p.id === professionalId);
    if (prof) {
      setProfessionalCpf(prof.cro || "");
      setProfessionalName(prof.nome || "");
      // Se for contrato em nome do profissional, usar endereço da clínica como padrão
      if (contractType === "profissional") {
        setProfessionalAddress(clinicAddress);
      }
    }
  };

  const handleBudgetChange = (budgetId: string) => {
    setSelectedBudget(budgetId);
    const budget = orcamentos.find(o => o.id === budgetId);
    if (budget) {
      setContractValue(budget.total_value?.toString() || "0");
      
      // Montar lista de procedimentos
      const proceduresList = budget.budget_items
        ?.filter((item: any) => item.status !== "cancelled")
        .map((item: any) => `${item.procedure_name} (${item.tooth_region || "região não especificada"})`)
        .join(", ");
      
      setProcedures(proceduresList || "");
    }
  };

  useEffect(() => {
    // Atualizar template do contrato em tempo real
    const template = generateContractTemplate();
    setContractContent(template);
  }, [patientName, patientBirthDate, patientCpf, patientAddress, professionalName, professionalCpf, contractValue, procedures, contractType, clinicName, clinicCnpj, clinicAddress, professionalAddress]);

  const generateContractTemplate = () => {
    const today = new Date();
    const contractNumber = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}${String(today.getHours()).padStart(2, '0')}${String(today.getMinutes()).padStart(2, '0')}`;
    const contractDate = format(today, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const contractTime = format(today, "HH:mm", { locale: ptBR });
    const simpleDate = format(today, "dd/MM/yyyy");
    
    const contratadoNome = contractType === "clinica" 
      ? (clinicName || "[Nome da Clínica]")
      : (professionalName || "[Nome do Profissional]");
    
    const contratadoDoc = contractType === "clinica"
      ? `CNPJ nº ${clinicCnpj || "[CNPJ]"}`
      : `CRO nº ${professionalCpf || "[CRO]"}`;
    
    const contratadoEndereco = contractType === "clinica"
      ? (clinicAddress || "[Endereço da Clínica]")
      : (professionalAddress || "[Endereço do Profissional]");

    const responsavelTecnico = contractType === "clinica" && professionalName
      ? `\n\nRESPONSÁVEL TÉCNICO: ${professionalName}, CRO nº ${professionalCpf || "[CRO]"}`
      : "";

    const cidade = patientAddress?.split(',').pop()?.trim() || "[Cidade]";

    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 CONTRATO Nº ${contractNumber}
Paciente: ${patientName || "[Nome do Paciente]"}
Gerado em: ${contractDate} às ${contractTime}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


CONTRATO DE PRESTAÇÃO DE SERVIÇOS ODONTOLÓGICOS


CONTRATANTE: ${patientName || "[Nome do Paciente]"}, ${patientCpf ? `portador(a) do CPF nº ${patientCpf}` : "[CPF não informado]"}, residente e domiciliado(a) em ${patientAddress || "[Endereço não informado]"}.

CONTRATADA: ${contratadoNome}, inscrita sob o ${contratadoDoc}, estabelecida em ${contratadoEndereco}.${responsavelTecnico}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLÁUSULA PRIMEIRA — DO OBJETO DO CONTRATO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    O presente contrato tem por objeto a prestação de serviços odontológicos pela CONTRATADA ao(à) CONTRATANTE, conforme descrito nos procedimentos a seguir:

${procedures || "Procedimentos a serem definidos"}

    Parágrafo Primeiro: Os serviços odontológicos contratados compreendem a realização dos procedimentos nas datas e horários conforme agendamento prévio.

    Parágrafo Segundo: A CONTRATADA poderá realizar procedimentos adicionais não previstos nesta cláusula, desde que, durante o planejamento ou execução, verifique-se sua necessidade técnica, mediante prévia anuência do(a) CONTRATANTE.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLÁUSULA SEGUNDA — DO VALOR E FORMA DE PAGAMENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    O valor total dos serviços contratados é de R$ ${contractValue || "0,00"}, correspondente aos materiais utilizados, descartáveis e mão de obra especializada, a ser pago conforme condições acordadas entre as partes.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLÁUSULA TERCEIRA — DAS OBRIGAÇÕES DA CONTRATADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    A CONTRATADA obriga-se a:

    a) Realizar todos os procedimentos descritos na Cláusula Primeira com zelo, qualidade técnica e observância das normas éticas da profissão odontológica;
    
    b) Utilizar materiais odontológicos de primeira qualidade e equipamentos adequados e devidamente esterilizados;
    
    c) Fornecer orientações claras ao(à) CONTRATANTE sobre os cuidados pré e pós-tratamento, riscos, benefícios e alternativas disponíveis;
    
    d) Manter sigilo absoluto sobre todas as informações do(a) CONTRATANTE, conforme determina o Código de Ética Odontológica;
    
    e) Garantir os serviços prestados pelo período de 12 (doze) meses, exceto em casos de má higienização, acidentes, trauma ou uso inadequado pelo(a) CONTRATANTE;
    
    f) Executar o tratamento em ambiente seguro, observando os padrões de higiene e normas sanitárias aplicáveis;
    
    g) Tomar todas as providências necessárias ao atendimento, incluindo encaminhamento a outros profissionais quando tecnicamente necessário.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLÁUSULA QUARTA — DAS OBRIGAÇÕES DO(A) CONTRATANTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    O(A) CONTRATANTE obriga-se a:

    a) Comparecer pontualmente às consultas agendadas ou comunicar ausências com antecedência mínima de 24 (vinte e quatro) horas;
    
    b) Efetuar o pagamento nas datas e condições acordadas, sob pena de suspensão do tratamento;
    
    c) Seguir rigorosamente as orientações fornecidas pela CONTRATADA quanto aos cuidados com o tratamento, higiene bucal e uso de medicamentos prescritos;
    
    d) Informar imediatamente qualquer desconforto, dor, reação adversa ou intercorrência aos procedimentos realizados;
    
    e) Comunicar alterações em seu estado de saúde, histórico de alergias, uso de medicamentos e tratamentos anteriores que possam interferir no procedimento;
    
    f) Realizar todos os exames complementares solicitados pela CONTRATADA para subsidiar o diagnóstico e tratamento adequado;
    
    g) Manter atualizado seu cadastro junto à CONTRATADA para eficiência na comunicação e agendamentos;
    
    h) Reconhecer sua posição de corresponsável no tratamento, seguindo as instruções profissionais em âmbito pré e pós-procedimental.

    Parágrafo Único: O abandono do tratamento, caracterizado por ausências não justificadas superior a 30 (trinta) dias, isenta a CONTRATADA de responsabilidade quanto aos resultados esperados, restando rescindido o presente contrato, sendo devidos os valores integrais contratados.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLÁUSULA QUINTA — DA GARANTIA E REVISÕES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    A CONTRATADA garante os serviços realizados pelo prazo de 12 (doze) meses, contados da conclusão de cada procedimento, desde que o(a) CONTRATANTE cumpra as orientações de higiene, manutenção e compareça às revisões periódicas.

    As revisões são gratuitas e devem ser agendadas conforme orientação profissional, sendo essenciais para o sucesso e durabilidade do tratamento.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLÁUSULA SEXTA — DO CANCELAMENTO E RESCISÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    O presente contrato poderá ser rescindido por qualquer das partes mediante comunicação formal com antecedência mínima de 7 (sete) dias.

    Em caso de rescisão por parte do(a) CONTRATANTE, serão devidos os valores proporcionais aos serviços já executados, sem devolução de parcelas pagas.

    A inadimplência superior a 30 (trinta) dias autoriza a CONTRATADA a suspender o tratamento e considerar o contrato rescindido de pleno direito, sendo devidos os valores remanescentes.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLÁUSULA SÉTIMA — DAS DISPOSIÇÕES GERAIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    O(A) CONTRATANTE declara ter sido devidamente informado(a) sobre os procedimentos, riscos, benefícios, alternativas e expectativas de resultados, firmando o presente de boa-fé e plena autonomia.

    O presente contrato é celebrado em caráter irrevogável e irretratável, obrigando as partes, seus herdeiros e sucessores.

    Qualquer alteração do presente contrato deverá ser feita por escrito e assinada por ambas as partes.

    As partes elegem o foro da comarca de ${cidade} para dirimir quaisquer controvérsias oriundas deste contrato.

    Este contrato é emitido em 2 (duas) vias de igual teor e forma, ficando uma com cada parte.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÁREA DE ASSINATURAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${cidade}, ${contractDate}


________________________________________
${patientName || "[Nome do Paciente]"}
CONTRATANTE
${patientCpf ? `CPF: ${patientCpf}` : ""}


________________________________________
${professionalName || "[Nome do Profissional]"}
CRO nº ${professionalCpf || "[CRO]"}
CONTRATADO(A)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Documento gerado eletronicamente via Sistema Veramo
Sem necessidade de reconhecimento de firma
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  };

  const handleSave = async (status: "rascunho" | "finalizado") => {
    if (!patientName || !patientCpf || !selectedProfessional || !contractValue) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!patientAddress) {
      toast.error("Complete o cadastro do paciente com o endereço para prosseguir");
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
        .single();

      if (!profile?.clinic_id) throw new Error("Clínica não encontrada");

      const { error } = await supabase
        .from("patient_documents")
        .insert({
          patient_id: patientId,
          clinic_id: profile.clinic_id,
          document_type: "contrato",
          title: `Contrato de Prestação de Serviços - ${patientName}`,
          content: contractContent,
          created_by: user.id,
          status,
          patient_birth_date: patientBirthDate || null,
          patient_cpf: patientCpf,
          patient_address: patientAddress,
          professional_id: selectedProfessional,
          professional_cpf: professionalCpf,
          contract_value: parseFloat(contractValue) || 0,
          procedures_list: procedures,
          budget_id: selectedBudget || null,
        });

      if (error) throw error;

      toast.success(
        status === "rascunho"
          ? "Contrato salvo como rascunho"
          : "Contrato finalizado com sucesso"
      );

      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao salvar contrato:", error);
      toast.error("Erro ao salvar contrato");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
        <div className="flex h-[95vh]">
          {/* Coluna lateral - Formulário */}
          <div className="w-[400px] border-r bg-muted/30 p-6 overflow-y-auto">
            <DialogHeader className="mb-6">
              <DialogTitle>Novo Contrato</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Tipo de Contrato</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="contract-type">O contrato será em nome de:*</Label>
                    <Select value={contractType} onValueChange={(value: "clinica" | "profissional") => setContractType(value)}>
                      <SelectTrigger id="contract-type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clinica">Clínica (Pessoa Jurídica)</SelectItem>
                        <SelectItem value="profissional">Profissional (Pessoa Física)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {contractType === "clinica" && (
                <div>
                  <h3 className="font-semibold mb-3">Dados da Clínica</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Nome da Clínica</Label>
                      <Input value={clinicName} disabled className="bg-muted" />
                    </div>
                    <div>
                      <Label>CNPJ</Label>
                      <Input value={clinicCnpj} disabled className="bg-muted" />
                    </div>
                    <div>
                      <Label>Endereço</Label>
                      <Textarea 
                        value={clinicAddress} 
                        disabled 
                        className="bg-muted min-h-[60px]" 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3">Dados do Paciente</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Nome do Paciente*</Label>
                    <Input
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label>Data de Nascimento*</Label>
                    <Input
                      type="date"
                      value={patientBirthDate}
                      onChange={(e) => setPatientBirthDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>CPF*</Label>
                    <Input
                      value={patientCpf}
                      onChange={(e) => setPatientCpf(e.target.value)}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <Label>Endereço Completo*</Label>
                    <Textarea
                      value={patientAddress}
                      onChange={(e) => setPatientAddress(e.target.value)}
                      placeholder="Rua, número, bairro, cidade, estado, CEP"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">
                  {contractType === "clinica" ? "Responsável Técnico" : "Profissional"}
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="dentista-select">Dentista Responsável*</Label>
                    <Select value={selectedProfessional} onValueChange={handleProfessionalChange}>
                      <SelectTrigger id="dentista-select" className="w-full">
                        <SelectValue placeholder={profissionais.length > 0 ? "Selecione o dentista" : "Carregando..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {profissionais.length === 0 ? (
                          <SelectItem value="none" disabled>
                            Nenhum dentista cadastrado
                          </SelectItem>
                        ) : (
                          profissionais.map((prof) => (
                            <SelectItem key={prof.id} value={prof.id}>
                              {prof.nome} {prof.cro ? `- CRO: ${prof.cro}` : ""}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>CRO</Label>
                    <Input value={professionalCpf} disabled className="bg-muted" />
                  </div>
                  {contractType === "profissional" && (
                    <div>
                      <Label>Endereço do Profissional</Label>
                      <Textarea
                        value={professionalAddress}
                        onChange={(e) => setProfessionalAddress(e.target.value)}
                        placeholder="Endereço completo do consultório"
                        className="min-h-[60px]"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Orçamento</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="budget-select">Orçamento Aprovado</Label>
                    <Select value={selectedBudget} onValueChange={handleBudgetChange}>
                      <SelectTrigger id="budget-select" className="w-full">
                        <SelectValue placeholder={orcamentos.length > 0 ? "Selecione um orçamento" : "Nenhum orçamento aprovado"} />
                      </SelectTrigger>
                      <SelectContent>
                        {orcamentos.length === 0 ? (
                          <SelectItem value="none" disabled>
                            Nenhum orçamento aprovado disponível
                          </SelectItem>
                        ) : (
                          orcamentos.map((orc) => (
                            <SelectItem key={orc.id} value={orc.id}>
                              {orc.title} - R$ {orc.total_value?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Valor Total do Contrato*</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={contractValue}
                      onChange={(e) => setContractValue(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Procedimentos Contratados*</Label>
                    <Textarea
                      value={procedures}
                      onChange={(e) => setProcedures(e.target.value)}
                      placeholder="Liste os procedimentos"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna principal - Documento */}
          <div className="flex-1 flex flex-col">
            <div className="border-b p-4 flex justify-between items-center">
              <h3 className="font-semibold">Documento do Contrato</h3>
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
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Fechar
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave("rascunho")}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Rascunho"
                )}
              </Button>
              <Button onClick={() => handleSave("finalizado")} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  "Emitir Contrato"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};