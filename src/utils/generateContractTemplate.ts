import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface ContractTemplateData {
  // Clínica
  clinicName: string;
  clinicCnpj: string;
  clinicAddress: string;
  clinicCity?: string;
  clinicUf?: string;
  clinicCep?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  // Profissional executor
  professionalName: string;
  professionalCro: string;
  professionalSpecialty?: string;
  // Paciente
  patientName: string;
  patientRg?: string;
  patientCpf: string;
  patientBirthDate?: string;
  patientAddress: string;
  patientCity?: string;
  patientUf?: string;
  patientCep?: string;
  patientPhone?: string;
  patientEmail?: string;
  // Responsável legal
  responsibleName?: string;
  responsibleCpf?: string;
  responsibleRelation?: string;
  // Tratamento
  mainProcedure: string;
  dentalArea?: string;
  treatmentPlanSummary?: string;
  estimatedDuration?: string;
  expectedStartDate?: string;
  // Financeiro
  totalValue: string;
  downPayment?: string;
  installmentsCount?: string;
  installmentValue?: string;
  dueDay?: string;
  paymentMethod?: string;
  adjustmentIndex?: string;
  lateFee?: string;
  interestRate?: string;
  noShowFee?: string;
  // Fechamento
  signingCity?: string;
  signingDate?: string;
  courtDistrict?: string;
  contractNumber?: string;
  contractVersion?: string;
  // Flags
  isRemoteContract?: boolean;
}

function v(value: string | undefined, fallback: string): string {
  return value && value.trim() ? value.trim() : fallback;
}

function clausula1(d: ContractTemplateData): string {
  const city = v(d.clinicCity, "");
  const uf = v(d.clinicUf, "");
  const cityUf = city && uf ? `${city}/${uf}` : city || uf || "";

  let text = `CLAUSULA PRIMEIRA - QUALIFICACAO DAS PARTES

Pelo presente instrumento particular, de um lado, ${v(d.clinicName, "[Nome da Clinica]")}, inscrita no CNPJ sob o no ${v(d.clinicCnpj, "[CNPJ]")}, com endereco em ${v(d.clinicAddress, "[Endereco]")}${cityUf ? `, ${cityUf}` : ""}, doravante denominada CONTRATADA, neste ato representada pelo(a) cirurgiao(a)-dentista ${v(d.professionalName, "[Profissional]")}, inscrito(a) no CRO sob no ${v(d.professionalCro, "[CRO]")}${d.professionalSpecialty ? `, especialidade: ${d.professionalSpecialty}` : ""}; e, de outro lado, ${v(d.patientName, "[Nome do Paciente]")}, inscrito(a) no CPF sob no ${v(d.patientCpf, "[CPF]")}${d.patientRg ? `, RG no ${d.patientRg}` : ""}, residente em ${v(d.patientAddress, "[Endereco]")}, doravante denominado(a) CONTRATANTE, tem entre si justo e contratado o seguinte.`;

  if (d.responsibleName) {
    text += `\n\nO(A) CONTRATANTE e neste ato representado(a) por ${d.responsibleName}${d.responsibleCpf ? `, CPF no ${d.responsibleCpf}` : ""}${d.responsibleRelation ? `, na qualidade de ${d.responsibleRelation}` : ""}.`;
  }

  return text;
}

function clausula2(d: ContractTemplateData): string {
  let text = `CLAUSULA SEGUNDA - DO OBJETO DO CONTRATO

O presente contrato tem por objeto a prestacao de servicos odontologicos pela CONTRATADA ao CONTRATANTE, consistentes no procedimento principal ${v(d.mainProcedure, "[procedimento]")}${d.dentalArea ? `, inserido na area de ${d.dentalArea}` : ""}, conforme avaliacao clinica, plano de tratamento aprovado e registros constantes no sistema e no prontuario do paciente.

O tratamento sera executado sob responsabilidade profissional de ${v(d.professionalName, "[Profissional]")}, CRO ${v(d.professionalCro, "[CRO]")}.`;

  if (d.treatmentPlanSummary) {
    text += `\n\nResumo do plano de tratamento: ${d.treatmentPlanSummary}`;
  }

  return text;
}

function clausula3(d: ContractTemplateData): string {
  return `CLAUSULA TERCEIRA - DO PRAZO ESTIMADO DO TRATAMENTO

O prazo estimado para a realizacao do tratamento e de ${v(d.estimatedDuration, "a definir")}${d.expectedStartDate ? `, com previsao de inicio em ${d.expectedStartDate}` : ""}, podendo sofrer alteracoes em razao da complexidade clinica do caso, resposta biologica do paciente, necessidade de procedimentos complementares, faltas, atrasos ou descumprimento das orientacoes profissionais.`;
}

function clausula4(): string {
  return `CLAUSULA QUARTA - DA NATUREZA DA OBRIGACAO PROFISSIONAL

O CONTRATANTE declara ciencia de que a Odontologia constitui obrigacao de meios, comprometendo-se a CONTRATADA a empregar tecnica adequada, materiais compativeis e conduta profissional conforme o estado atual da ciencia, sem garantia de resultado absoluto ou estetico especifico, salvo disposicao expressa em instrumento proprio, quando juridicamente cabivel.`;
}

function clausula5(d: ContractTemplateData): string {
  let text = `CLAUSULA QUINTA - DOS HONORARIOS E FORMA DE PAGAMENTO

Pelos servicos contratados, o CONTRATANTE pagara a CONTRATADA o valor total de R$ ${v(d.totalValue, "0,00")}`;

  const parts: string[] = [];
  if (d.downPayment) parts.push(`entrada de R$ ${d.downPayment}`);
  if (d.installmentsCount && d.installmentValue) {
    parts.push(`saldo remanescente em ${d.installmentsCount} parcela(s) de R$ ${d.installmentValue}`);
  }
  if (d.dueDay) parts.push(`com vencimento todo dia ${d.dueDay}`);
  if (d.paymentMethod) parts.push(`por meio de ${d.paymentMethod}`);

  if (parts.length > 0) {
    text += `, nas seguintes condicoes: ${parts.join(", ")}`;
  }

  text += ".";

  if (d.adjustmentIndex) {
    text += `\n\nHavendo parcelas de longa duracao ou manutencao periodica, podera ser aplicado reajuste pelo indice ${d.adjustmentIndex}, quando previamente informado e pactuado.`;
  }

  return text;
}

function clausula6(d: ContractTemplateData): string {
  const multa = v(d.lateFee, "2%");
  const juros = v(d.interestRate, "1% ao mes");

  return `CLAUSULA SEXTA - DA MORA E INADIMPLENCIA

O inadimplemento de qualquer obrigacao financeira no prazo ajustado acarretara incidencia de multa moratoria de ${multa}, juros de mora de ${juros} e atualizacao monetaria na forma legal ou contratualmente prevista.

A inadimplencia podera autorizar a suspensao de atos futuros nao urgentes do tratamento, sem prejuizo da cobranca dos valores devidos pelos meios cabiveis.`;
}

function clausula7(): string {
  return `CLAUSULA SETIMA - DAS OBRIGACOES DA CONTRATADA

Constituem obrigacoes da CONTRATADA:

a) prestar os servicos com observancia da tecnica profissional aplicavel;
b) manter prontuario atualizado do paciente;
c) fornecer informacoes claras sobre diagnostico, plano de tratamento, riscos e alternativas;
d) resguardar o sigilo, a privacidade e os dados pessoais do paciente;
e) comunicar ao CONTRATANTE eventual necessidade de alteracao relevante do plano inicialmente aprovado;
f) manter documentacao clinica compativel com as normas profissionais.`;
}

function clausula8(): string {
  return `CLAUSULA OITAVA - DAS OBRIGACOES DO CONTRATANTE

Constituem obrigacoes do CONTRATANTE:

a) comparecer as consultas e procedimentos agendados;
b) seguir as orientacoes profissionais recebidas;
c) informar corretamente seu historico de saude, medicacoes, alergias e demais condicoes relevantes;
d) comunicar intercorrencias, desconfortos ou alteracoes em seu estado de saude;
e) manter seus dados cadastrais atualizados;
f) cumprir pontualmente as obrigacoes financeiras assumidas.`;
}

function clausula9(d: ContractTemplateData): string {
  return `CLAUSULA NONA - DAS FALTAS, REAGENDAMENTOS E ABANDONO

O CONTRATANTE devera comunicar impossibilidade de comparecimento com antecedencia minima de 24 horas.

${d.noShowFee ? `A ausencia sem aviso previo podera ensejar cobranca de valor correspondente a reserva do tempo clinico, no montante de R$ ${d.noShowFee}.` : "A ausencia sem aviso previo podera ensejar cobranca de valor correspondente a reserva do tempo clinico, quando essa politica estiver ativa na clinica."}

Sera considerado abandono de tratamento o nao comparecimento reiterado ou a interrupcao injustificada da continuidade clinica, hipotese em que a CONTRATADA podera encerrar o acompanhamento, resguardando os registros do prontuario e os valores relativos aos servicos ja prestados.`;
}

function clausula10(): string {
  return `CLAUSULA DECIMA - DA ALTERACAO DO PLANO DE TRATAMENTO

Caso, no curso da execucao, surja necessidade tecnica de alteracao do plano de tratamento inicialmente aprovado, inclusao de procedimentos adicionais, troca de tecnica, modificacao de materiais ou mudanca relevante de escopo, a continuidade do tratamento dependera de ciencia do CONTRATANTE e formalizacao complementar no sistema, inclusive quanto aos impactos financeiros, quando houver.`;
}

function clausula11(): string {
  return `CLAUSULA DECIMA PRIMEIRA - DO CONSENTIMENTO INFORMADO

O CONTRATANTE declara ter recebido explicacoes adequadas sobre o tratamento proposto, seus objetivos, riscos, beneficios, alternativas terapeuticas e possiveis intercorrencias, prestando seu consentimento livre e esclarecido para a execucao do tratamento contratado.`;
}

function clausula12(): string {
  return `CLAUSULA DECIMA SEGUNDA - DA RESCISAO CONTRATUAL

O presente contrato podera ser rescindido por qualquer das partes, mediante comunicacao formal, observando-se o pagamento dos servicos efetivamente realizados, dos materiais individualizados ja confeccionados ou adquiridos para o caso e dos encargos eventualmente incidentes na forma deste instrumento.

Na hipotese de rescisao apos o inicio do tratamento, sera realizado acerto financeiro proporcional entre os valores pagos e os servicos ja executados.

Quando houver devolucao de valores, esta ocorrera conforme apuracao administrativa e meio de pagamento compativel.`;
}

function clausula13(): string {
  return `CLAUSULA DECIMA TERCEIRA - DO DIREITO DE ARREPENDIMENTO

Nas contratacoes realizadas fora do estabelecimento comercial, por meios digitais, telefone ou canais remotos, o CONTRATANTE podera exercer o direito de arrependimento no prazo legal, observadas as regras do Codigo de Defesa do Consumidor.`;
}

function clausula14(): string {
  return `CLAUSULA DECIMA QUARTA - DA PROTECAO DE DADOS PESSOAIS E SIGILO

A CONTRATADA realizara o tratamento dos dados pessoais e dados pessoais sensiveis do CONTRATANTE, inclusive dados de saude, exclusivamente para fins de atendimento odontologico, registro em prontuario, cumprimento de obrigacoes legais e regulatorias, protecao da saude, exercicio regular de direitos e demais hipoteses legalmente admitidas.

A CONTRATADA compromete-se a adotar medidas razoaveis de seguranca, sigilo e controle de acesso, preservando a privacidade do paciente e restringindo o compartilhamento de informacoes ao minimo necessario, na forma da legislacao aplicavel.`;
}

function clausula15(): string {
  return `CLAUSULA DECIMA QUINTA - DO PRONTUARIO E DOCUMENTACAO CLINICA

Os registros clinicos, documentos, exames, imagens, planos e evolucoes do tratamento integrarao o prontuario do paciente, fisico ou digital, mantido pela CONTRATADA nos termos das normas profissionais e legais aplicaveis.

O CONTRATANTE podera solicitar acesso as informacoes e documentos nos limites legais e eticos cabiveis.`;
}

function clausula16(): string {
  return `CLAUSULA DECIMA SEXTA - DA RESPONSABILIDADE CIVIL

A CONTRATADA responde pelos danos comprovadamente decorrentes de conduta culposa na prestacao dos servicos, nos limites da legislacao civil e consumerista aplicavel, nao podendo ser responsabilizada por eventos decorrentes exclusivamente de omissao de informacoes relevantes pelo paciente, descumprimento de orientacoes, abandono do tratamento, caso fortuito, forca maior ou resposta biologica imprevisivel.`;
}

function clausula17(): string {
  return `CLAUSULA DECIMA SETIMA - DAS DISPOSICOES GERAIS

A eventual tolerancia de uma parte para com a outra nao importara novacao ou renuncia de direitos.

Qualquer alteracao relevante deste contrato devera ser formalizada por meio de aditivo, termo complementar ou nova versao emitida pelo sistema.

As comunicacoes entre as partes poderao ocorrer por meio fisico ou eletronico, desde que passiveis de registro.`;
}

function clausula18(d: ContractTemplateData): string {
  const foro = v(d.courtDistrict, v(d.signingCity, v(d.clinicCity, "[Cidade]")));
  return `CLAUSULA DECIMA OITAVA - DO FORO

Fica eleito o foro da Comarca de ${foro}, para dirimir eventuais controversias oriundas deste contrato, com renuncia a qualquer outro, por mais privilegiado que seja, ressalvadas as hipoteses legais de competencia aplicavel.`;
}

function clausula19(d: ContractTemplateData): string {
  const cidade = v(d.signingCity, v(d.clinicCity, "[Cidade]"));
  const dataAssinatura = d.signingDate || format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  let text = `ASSINATURAS

E, por estarem de acordo, as partes assinam o presente instrumento.

${cidade}, ${dataAssinatura}.


________________________________________
${v(d.patientName, "[Nome do Paciente]")}
CONTRATANTE
${d.patientCpf ? `CPF: ${d.patientCpf}` : ""}`;

  if (d.responsibleName) {
    text += `


________________________________________
${d.responsibleName}
RESPONSAVEL LEGAL
${d.responsibleCpf ? `CPF: ${d.responsibleCpf}` : ""}`;
  }

  text += `


________________________________________
${v(d.professionalName, "[Nome do Profissional]")}
CRO no ${v(d.professionalCro, "[CRO]")}
CONTRATADA / PROFISSIONAL EXECUTOR`;

  return text;
}

export function generateContractTemplate(data: ContractTemplateData): string {
  const contractNum = v(data.contractNumber, generateContractNumber());
  const version = v(data.contractVersion, "1");

  const clauses: string[] = [
    `CONTRATO DE PRESTACAO DE SERVICOS ODONTOLOGICOS\nContrato No ${contractNum} - Versao ${version}`,
    clausula1(data),
    clausula2(data),
    clausula3(data),
    clausula4(),
    clausula5(data),
    clausula6(data),
    clausula7(),
    clausula8(),
    clausula9(data),
    clausula10(),
    clausula11(),
    clausula12(),
  ];

  if (data.isRemoteContract) {
    clauses.push(clausula13());
  }

  clauses.push(
    clausula14(),
    clausula15(),
    clausula16(),
    clausula17(),
    clausula18(data),
    clausula19(data),
  );

  return clauses.join("\n\n\n");
}

export function generateContractNumber(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
}
