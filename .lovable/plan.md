

# Contrato Odontológico Institucional — Refatoração Completa

## Resumo

Reescrever do zero o módulo de contratos do sistema com template institucional profissional, 19 cláusulas com textos-base formais, variáveis dinâmicas preenchidas automaticamente, versionamento, regras de negócio e PDF premium multi-página.

## Mudanças no Banco de Dados

Adicionar à tabela `patient_documents`:
- `contract_number` (text) — número sequencial do contrato
- `contract_version` (integer, default 1) — versionamento
- `parent_contract_id` (uuid, FK self-ref) — para aditivos vinculados ao contrato original

## Arquivos a Criar/Modificar

### 1. `src/utils/generateContractTemplate.ts` — Reescrever completamente

Substituir o template atual (7 cláusulas genéricas) pelo novo template institucional com 19 cláusulas conforme o PRD. Interface expandida:

```typescript
interface ContractTemplateData {
  // Clínica
  clinicName, clinicCnpj, clinicAddress, clinicCity, clinicUf, clinicCep, clinicPhone, clinicEmail
  // Profissional executor
  professionalName, professionalCro, professionalSpecialty
  // Paciente
  patientName, patientRg, patientCpf, patientBirthDate, patientAddress, patientCity, patientUf, patientCep, patientPhone, patientEmail
  // Responsável legal
  responsibleName?, responsibleCpf?, responsibleRelation?
  // Tratamento
  mainProcedure, dentalArea, treatmentPlanSummary, estimatedDuration, expectedStartDate
  // Financeiro
  totalValue, downPayment, installmentsCount, installmentValue, dueDay, paymentMethod, adjustmentIndex, lateFee, interestRate, noShowFee
  // Fechamento
  signingCity, signingDate, courtDistrict, contractNumber, contractVersion
  // Flags
  isRemoteContract?: boolean  // controla exibição da cláusula de arrependimento
}
```

Cada cláusula será uma função separada que retorna string, permitindo controle condicional (ex: cláusula 13 só aparece se `isRemoteContract`).

### 2. `src/components/documentos/NovoContratoModal.tsx` — Refatorar

- Expandir formulário lateral com todos os campos do PRD organizados em seções colapsáveis
- Preencher automaticamente dados do paciente, clínica e profissional via queries existentes
- Adicionar seleção de orçamento que puxa dados financeiros (valor, parcelas, forma de pagamento)
- Adicionar campos de responsável legal (condicional)
- Adicionar campo de procedimento principal e área odontológica
- Pré-visualização em tempo real do contrato no painel direito
- Validações: não emitir sem paciente, sem profissional executor, sem procedimento, sem valor
- Ao finalizar, gerar `contract_number` e `contract_version = 1`
- Botão "Salvar como Rascunho" e "Emitir Contrato" (congela versão)

### 3. `src/components/orcamentos/AprovarOrcamentoModal.tsx` — Atualizar

- Atualizar a chamada a `generateContractTemplate` para usar a nova interface expandida
- Preencher todos os campos disponíveis (financeiros do orçamento, profissional, paciente)
- Gerar `contract_number` automaticamente

### 4. `src/utils/generateDocumentoPDF.ts` — Ajustar renderização

- Melhorar formatação de cláusulas numeradas (CLÁUSULA PRIMEIRA, SEGUNDA, etc.)
- Suportar itens com travessão/bullet (obrigações da contratada/contratante)
- Garantir que parágrafos únicos e sub-itens letrados renderizam corretamente
- Área de assinatura tripla: CONTRATANTE + RESPONSÁVEL LEGAL (condicional) + CONTRATADA
- Adicionar número do contrato e versão no cabeçalho do PDF

### 5. `src/components/documentos/HistoricoDocumentosModal.tsx` — Sem mudanças estruturais

Já detecta contratos corretamente. Apenas garantir que o botão "Gerar PDF" funciona com o novo formato.

## Regras de Negócio Implementadas

1. Validação obrigatória: paciente, profissional executor, procedimento principal, valor
2. Responsável legal exigido quando paciente for menor
3. Contrato finalizado fica congelado (sem edição)
4. Alterações geram aditivo (novo documento com `parent_contract_id` apontando para o original)
5. Número de contrato sequencial por clínica
6. Cláusula 13 (arrependimento) só aparece quando contrato tem origem remota/digital

## Conteúdo Jurídico

As 19 cláusulas do PRD serão implementadas literalmente com os textos-base fornecidos, substituindo variáveis dinâmicas. Cláusulas: Qualificação das partes, Objeto, Prazo estimado, Natureza da obrigação, Honorários, Mora, Obrigações contratada, Obrigações contratante, Faltas/abandono, Alteração do plano, Consentimento informado, Rescisão, Arrependimento (condicional), LGPD, Prontuário, Responsabilidade civil, Disposições gerais, Foro, Assinaturas.

