

# Correção: Geração de Contrato no Orçamento + PDF Premium para Contratos

## Problemas Identificados

### Problema 1: Contrato não é gerado ao aprovar orçamento
O `AprovarOrcamentoModal` não tem nenhuma lógica para criar um documento de contrato automaticamente após aprovação. O fluxo atual só cria tratamentos, parcelas e comissões.

### Problema 2: PDF de contrato renderiza como "Receituário"
O `generateDocumentoPDF` só aceita `tipo: "atestado" | "receituario"`. Quando um contrato é impresso pelo histórico, o código usa a lógica `isAtestado ? "atestado" : "receituario"` — ou seja, qualquer documento que não seja atestado vira receituário no PDF. O título renderizado fica "RECEITUÁRIO" em vez do título do contrato.

## Plano de Correções

### 1. Expandir `generateDocumentoPDF` para suportar contratos
- Adicionar `"contrato"` ao tipo em `DocumentoPDFData`
- No `drawDocumentTitle`, quando `tipo === "contrato"`, usar o título do documento (`data.title`) em vez de "RECEITUÁRIO"
- No `drawBody`, ajustar a lógica de filtragem para não remover seções do contrato (cláusulas, assinaturas)
- Adicionar área de assinatura dupla (contratante + contratado) no `drawSignature` quando for contrato
- No footer, usar ID com prefixo `CT` para contratos

### 2. Corrigir `HistoricoDocumentosModal` para detectar contratos
- Verificar `doc.document_type === "contrato"` para definir `tipo: "contrato"` no `pdfData`, em vez de só verificar se é atestado

### 3. Auto-gerar contrato ao aprovar orçamento
- Após o sucesso do `handleApprove` no `AprovarOrcamentoModal`, inserir automaticamente um registro em `patient_documents` com `document_type: "contrato"` usando o template de contrato já existente em `NovoContratoModal`
- Extrair a função `generateContractTemplate` para um utilitário reutilizável
- Buscar dados do paciente, clínica e profissional para preencher o template

### Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `src/utils/generateDocumentoPDF.ts` | Adicionar suporte a `tipo: "contrato"` com layout específico |
| `src/components/documentos/HistoricoDocumentosModal.tsx` | Detectar `document_type === "contrato"` e passar `tipo: "contrato"` |
| `src/components/orcamentos/AprovarOrcamentoModal.tsx` | Auto-gerar contrato após aprovação bem-sucedida |
| `src/utils/generateContractTemplate.ts` (novo) | Extrair template de contrato para reutilização |

