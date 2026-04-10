import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContractTemplateData {
  patientName: string;
  patientCpf: string;
  patientAddress: string;
  clinicName: string;
  clinicCnpj: string;
  clinicAddress: string;
  professionalName: string;
  professionalCro: string;
  contractValue: string;
  procedures: string;
  city?: string;
}

export function generateContractTemplate(data: ContractTemplateData): string {
  const today = new Date();
  const contractNumber = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}${String(today.getHours()).padStart(2, '0')}${String(today.getMinutes()).padStart(2, '0')}`;
  const contractDate = format(today, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const contractTime = format(today, "HH:mm", { locale: ptBR });

  const cidade = data.city || data.patientAddress?.split(',').pop()?.trim() || "[Cidade]";

  return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS ODONTOLÓGICOS
Contrato Nº ${contractNumber}


CONTRATANTE: ${data.patientName || "[Nome do Paciente]"}, ${data.patientCpf ? `portador(a) do CPF nº ${data.patientCpf}` : "[CPF não informado]"}, residente e domiciliado(a) em ${data.patientAddress || "[Endereço não informado]"}.

CONTRATADA: ${data.clinicName || "[Nome da Clínica]"}, inscrita sob o CNPJ nº ${data.clinicCnpj || "[CNPJ]"}, estabelecida em ${data.clinicAddress || "[Endereço da Clínica]"}.

RESPONSÁVEL TÉCNICO: ${data.professionalName || "[Profissional]"}, CRO nº ${data.professionalCro || "[CRO]"}


CLÁUSULA PRIMEIRA — DO OBJETO DO CONTRATO

O presente contrato tem por objeto a prestação de serviços odontológicos pela CONTRATADA ao(à) CONTRATANTE, conforme descrito nos procedimentos a seguir:

${data.procedures || "Procedimentos a serem definidos"}

Parágrafo Primeiro: Os serviços odontológicos contratados compreendem a realização dos procedimentos nas datas e horários conforme agendamento prévio.

Parágrafo Segundo: A CONTRATADA poderá realizar procedimentos adicionais não previstos nesta cláusula, desde que, durante o planejamento ou execução, verifique-se sua necessidade técnica, mediante prévia anuência do(a) CONTRATANTE.


CLÁUSULA SEGUNDA — DO VALOR E FORMA DE PAGAMENTO

O valor total dos serviços contratados é de R$ ${data.contractValue || "0,00"}, correspondente aos materiais utilizados, descartáveis e mão de obra especializada, a ser pago conforme condições acordadas entre as partes.


CLÁUSULA TERCEIRA — DAS OBRIGAÇÕES DA CONTRATADA

A CONTRATADA obriga-se a:

a) Realizar todos os procedimentos descritos na Cláusula Primeira com zelo, qualidade técnica e observância das normas éticas da profissão odontológica;

b) Utilizar materiais odontológicos de primeira qualidade e equipamentos adequados e devidamente esterilizados;

c) Fornecer orientações claras ao(à) CONTRATANTE sobre os cuidados pré e pós-tratamento, riscos, benefícios e alternativas disponíveis;

d) Manter sigilo absoluto sobre todas as informações do(a) CONTRATANTE, conforme determina o Código de Ética Odontológica;

e) Garantir os serviços prestados pelo período de 12 (doze) meses, exceto em casos de má higienização, acidentes, trauma ou uso inadequado pelo(a) CONTRATANTE;

f) Executar o tratamento em ambiente seguro, observando os padrões de higiene e normas sanitárias aplicáveis.


CLÁUSULA QUARTA — DAS OBRIGAÇÕES DO(A) CONTRATANTE

O(A) CONTRATANTE obriga-se a:

a) Comparecer pontualmente às consultas agendadas ou comunicar ausências com antecedência mínima de 24 (vinte e quatro) horas;

b) Efetuar o pagamento nas datas e condições acordadas, sob pena de suspensão do tratamento;

c) Seguir rigorosamente as orientações fornecidas pela CONTRATADA quanto aos cuidados com o tratamento, higiene bucal e uso de medicamentos prescritos;

d) Informar imediatamente qualquer desconforto, dor, reação adversa ou intercorrência aos procedimentos realizados;

e) Comunicar alterações em seu estado de saúde, histórico de alergias, uso de medicamentos e tratamentos anteriores que possam interferir no procedimento.

Parágrafo Único: O abandono do tratamento, caracterizado por ausências não justificadas superior a 30 (trinta) dias, isenta a CONTRATADA de responsabilidade quanto aos resultados esperados.


CLÁUSULA QUINTA — DA GARANTIA E REVISÕES

A CONTRATADA garante os serviços realizados pelo prazo de 12 (doze) meses, contados da conclusão de cada procedimento, desde que o(a) CONTRATANTE cumpra as orientações de higiene, manutenção e compareça às revisões periódicas.


CLÁUSULA SEXTA — DO CANCELAMENTO E RESCISÃO

O presente contrato poderá ser rescindido por qualquer das partes mediante comunicação formal com antecedência mínima de 7 (sete) dias.

Em caso de rescisão por parte do(a) CONTRATANTE, serão devidos os valores proporcionais aos serviços já executados, sem devolução de parcelas pagas.


CLÁUSULA SÉTIMA — DAS DISPOSIÇÕES GERAIS

O(A) CONTRATANTE declara ter sido devidamente informado(a) sobre os procedimentos, riscos, benefícios, alternativas e expectativas de resultados.

As partes elegem o foro da comarca de ${cidade} para dirimir quaisquer controvérsias oriundas deste contrato.

Este contrato é emitido em 2 (duas) vias de igual teor e forma, ficando uma com cada parte.


${cidade}, ${contractDate}


________________________________________
${data.patientName || "[Nome do Paciente]"}
CONTRATANTE
${data.patientCpf ? `CPF: ${data.patientCpf}` : ""}


________________________________________
${data.professionalName || "[Nome do Profissional]"}
CRO nº ${data.professionalCro || "[CRO]"}
CONTRATADO(A)`;
}
