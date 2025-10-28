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
      loadPatientData();
      loadClinicData();
      loadProfissionais();
      loadOrcamentos();
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
        .select("id, nome, cro, cpf")
        .eq("clinica_id", profile.clinic_id)
        .eq("ativo", true);

      if (error) throw error;
      setProfissionais(data || []);
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
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
      setProfessionalCpf(prof.cpf || prof.cro || "");
      setProfessionalName(prof.nome || "");
      // Se for contrato em nome do profissional, podemos usar o endereço da clínica como padrão
      // mas permitir edição
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
    const today = format(new Date(), "dd/MM/yyyy");
    
    // Determinar contratado baseado no tipo
    const contratadoNome = contractType === "clinica" 
      ? (clinicName || "[Nome da Clínica]")
      : (professionalName || "[Nome do Profissional]");
    
    const contratadoDoc = contractType === "clinica"
      ? `CNPJ nº ${clinicCnpj || "[CNPJ]"}`
      : `CPF/CRO nº ${professionalCpf || "[CPF/CRO]"}`;
    
    const contratadoEndereco = contractType === "clinica"
      ? (clinicAddress || "[Endereço da Clínica]")
      : (professionalAddress || "[Endereço do Profissional]");
    
    const responsavelTecnico = professionalName 
      ? `\n\nResponsável Técnico: ${professionalName} - CRO: ${professionalCpf || "[CRO]"}`
      : "";
    
    return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS ODONTOLÓGICOS

São partes do presente instrumento:

${patientName || "[Nome do Paciente]"}, portador do documento ${patientCpf || "[CPF]"} residente e domiciliado em ${patientAddress || "[Endereço]"}, doravante denominado CONTRATANTE e de outro lado ${contratadoNome}, ${contratadoDoc}, com endereço em ${contratadoEndereco}, doravante denominada CONTRATADA, resolvem de comum acordo celebrar o presente Contrato para Prestação de Serviços Odontológicos, com fulcro no Código Civil, Código de Defesa do Consumidor e no Código de Ética Odontológico o qual se regerá pelas seguintes cláusulas e condições:${contractType === "clinica" ? responsavelTecnico : ""}

DO OBJETO DO CONTRATO:

CLÁUSULA 1ª: O presente instrumento tem por objeto a prestação de serviços pela CONTRATADA(O) apta(o) e habilitada(o) à realização plena e segura dos procedimento(s) abaixo descriminado(s) no(a) paciente ${patientName || "[Nome do Paciente]"}.

Descrição dos tratamentos:
${procedures || "[Procedimentos a serem realizados]"}

Parágrafo Primeiro: Os serviços odontológicos contratados compreendem na realização dos procedimentos contratados nas datas e horários de acordo com agendamento prévio.

Parágrafo Segundo: A CONTRATADA resta também autorizada a realizar procedimentos não referidos na Cláusula Primeira, desde que no decorrer do ato odontológico (planejamento e execução) verifique-se a sua viabilidade para o procedimento ou para qualquer outra situação que seja tecnicamente realizável ao(à) CONTRATANTE, desde que, por óbvio, haja anuência por ele(a).

Parágrafo Terceiro: A CONTRATANTE, a partir deste instrumento se declara ciente do produto e materiais utilizados em todos os seus detalhamentos, bem como tem plena consciência que, apesar de uma previsão industrial de durabilidade, tal prazo tende a sofrer latentes oscilações em razão de todos os vetores imponderáveis que passarão a influenciar no tratamento, especialmente a conduta da(o) CONTRATANTE frente aos serviços prestados e sua postura enquanto paciente.

CLÁUSULA 2ª: O paciente declara, a partir deste contrato travado de boa fé e plena autonomia, que A(O) CONTRATADO(A) foi claro, didático e transparente no que se refere ao procedimento a ser realizado, informando a sua necessidade, conceito, dores, riscos, desconfortos, efeitos colaterais possíveis, alternativas, expectativas em relação ao potencial resultado, entre outras situações que podem gerar modificações no cenário. Além disso, que o(s) procedimento(s) gerará(ão) os resultados alinhados com as condições fisiológicas, anatômicas e orgânicas do paciente.

Parágrafo Único. Declara, ademais, que tem consciência de que não há garantia de satisfação ou felicidade com o procedimento e sim o dever do profissional da saúde de seguir o roteiro técnico mais adequado e fazer o melhor possível dentro das condições e circunstâncias presentes.

DOS CUSTOS:

CLÁUSULA 3ª: As partes ajustam que, o valor cobrado corresponde aos custos dos materiais utilizados, bem como os materiais descartáveis e a mão de obra, totalizando o valor de R$ ${contractValue || "[Valor]"}.

OBRIGAÇÕES DO(A) PACIENTE CONTRATANTE:

CLÁUSULA 4ª: São obrigações do(a) PACIENTE:

a. Compreender sua posição de corresponsável no tratamento e seguir rigorosamente todas as orientações do profissional relacionadas ao tratamento/procedimento(s) efetuado(s), em âmbito pré e pós-procedimental e informar ao profissional qualquer desconforto sentido, de qualquer natureza, sob pena de incorrer em responsabilidade pelo potencial insucesso do tratamento;

b. Manter atualizado o cadastro junto à CONTRATADA, para que se tenha a máxima eficiência na comunicação e também agilidade dos agendamentos das consultas;

c. Honrar com o pagamento dos honorários profissionais do(a) CONTRATADO(A), de acordo com as condições ajustadas, sob pena de suspensão do tratamento, com os devidos cuidados de saúde;

d. Informar ao(à) CONTRATADO(A), sobre seu histórico em relação à sensibilidade e alergias para medicamentos e anestésicos, e ainda a respeito de problemas de sangramento, alergias, infecções recentes, bem como fornecer documentos e informações acerca de seus anteriores tratamentos equivalentes ou assemelhados;

e. Comparecer pontualmente às consultas agendadas, buscando desmarcá-las apenas em casos justificados e com antecedência;

f. Caso a CONTRATANTE não compareça nas datas e horários pré-definidos, abandonando o tratamento, A(O) CONTRATADO(A) exime-se de qualquer responsabilidade no que diz respeito a resultados esperados dos procedimentos, restando rescindido o presente contrato de pleno direito, sem necessidade de qualquer outra formalidade, sendo devido pagamento os valores contratados A(O) CONTRATADO(A) em sua integralidade como forma de compensação por perdas e danos;

g. Acatar todas as recomendações e prescrições efetuadas pelo(a) CONTRATADO(A), seja em relação a medicamentos, controles e cuidados antes, durante e após o tratamento, conforme instruções repassadas por escrito a cada procedimento realizado;

h. Realizar todos os exames solicitados pelo(a) CONTRATADO(A), de modo a propiciar condições para o perfeito diagnóstico e desenrolar do tratamento, ficando o profissional livre para negar-se a efetuar os procedimentos dos quais não tenha os subsídios necessários à realização do tratamento em razão de desídia ou negligência do(a) paciente;

i. Comparecer às consultas agendadas, em especial naquelas marcadas para continuidade de tratamento já iniciado ou que se mostre urgente, sob risco de comprometer o sucesso dos serviços contratados;

j. Nos casos em que os serviços foram integralmente prestados ou, se parcialmente prestados, superarem os honorários já pagos, fica ciente desde já o paciente que deverá arcar com os custos remanescentes dos procedimentos que foram realizados e não adimplidos, sob pena de cobranças extrajudiciais e judiciais, se necessário;

k. Avisar imediatamente qualquer sinal, indício ou fato que denote uma reação adversa, intercorrência ou complicação, devendo a(o) paciente ir diretamente ao encontro da(o) contratante e não de outro profissional sem o devido conhecimento do histórico odontológico.

OBRIGAÇÕES DO(A) CONTRATADO(A):

CLÁUSULA 5ª: São obrigações da(o) CONTRATADO(A):

a. Executar o tratamento indicado em ambiente de trabalho seguro ao paciente, observando os padrões de higiene e sanitários em geral aplicáveis ao caso;

b. Prestar à CONTRATANTE todas as informações necessárias e úteis ao êxito do tratamento;

c. Atuar com toda a diligência, prudência, perícia e zelo profissional que se espera de um profissional da área de saúde, empregando todos os meios técnicos, científicos e tecnológicos disponíveis que sejam adequados e necessários ao eficaz tratamento do paciente, sempre respeitando a sua dignidade;

d. Tomar todas as providências necessárias ao atendimento, inclusive o contato e coordenação para encaminhamento a outros profissionais de saúde, caso não seja possível a prestação de determinado serviço pela(o) CONTRATADA(O), sempre buscando indicar profissionais capacitados e com boa reputação no mercado.

DISPOSIÇÕES GERAIS:

CLÁUSULA 6ª: O presente contrato é celebrado em caráter irrevogável e irretratável, obrigando as partes, seus herdeiros e sucessores.

CLÁUSULA 7ª: Qualquer alteração do presente contrato deverá ser feita por escrito e assinada por ambas as partes.

CLÁUSULA 8ª: Fica eleito o foro da comarca de [Cidade/Estado] para dirimir quaisquer questões oriundas do presente contrato.

E por estarem assim justos e contratados, firmam o presente instrumento em 2 (duas) vias de igual teor e forma.

${patientAddress ? patientAddress.split(',')[patientAddress.split(',').length - 1] : "[Cidade]"}, ${today}

_________________________________
${patientName || "[Nome do Paciente]"}
CONTRATANTE

_________________________________
${professionalName || "[Nome do Profissional]"}
CONTRATADO(A)`;
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
                    <Label>O contrato será em nome de:*</Label>
                    <Select value={contractType} onValueChange={(value: "clinica" | "profissional") => setContractType(value)}>
                      <SelectTrigger>
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
                    <Label>Dentista Responsável*</Label>
                    <Select value={selectedProfessional} onValueChange={handleProfessionalChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o dentista" />
                      </SelectTrigger>
                      <SelectContent>
                        {profissionais.map((prof) => (
                          <SelectItem key={prof.id} value={prof.id}>
                            {prof.nome} - CRO: {prof.cro}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>CPF/CRO</Label>
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
                    <Label>Orçamento Aprovado</Label>
                    <Select value={selectedBudget} onValueChange={handleBudgetChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um orçamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {orcamentos.map((orc) => (
                          <SelectItem key={orc.id} value={orc.id}>
                            {orc.title} - R$ {orc.total_value?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </SelectItem>
                        ))}
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