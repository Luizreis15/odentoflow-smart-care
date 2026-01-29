
# Plano: Corrigir Aprovação de Orçamento e Formatação Monetária

## Problemas Identificados

### 1. Erro ao Aprovar Orçamento
A Edge Function `approve-budget` está falhando com o erro:
```
null value in column "professional_id" of relation "treatments" violates not-null constraint
```

**Causa**: A tabela `treatments` exige `professional_id` NOT NULL, mas a Edge Function não envia esse campo ao criar o tratamento.

### 2. Orçamento Aprovado Aparecendo como Rascunho
Quando a aprovação falha, o orçamento permanece com status `draft` e o botão "Aprovar" continua visível, permitindo tentativas repetidas.

### 3. Formatação Monetária Inconsistente
A `FinanceiroTab.tsx` usa `toLocaleString("pt-BR", { style: "currency", currency: "BRL" })` diretamente, enquanto existe uma função centralizada `formatCurrency()` em `src/lib/utils.ts`.

---

## Solução Proposta

### Parte 1: Corrigir Edge Function `approve-budget`

Modificar a lógica para extrair o `professional_id` do primeiro item do orçamento (já que os budget_items têm professional_id):

```typescript
// Extrair professional_id do primeiro item ou do orçamento
const defaultProfessionalId = budget.budget_items[0]?.professional_id || null;

// Permitir treatment sem professional_id (tornar nullable)
// OU usar o professional do primeiro item
const { data: treatment, error: treatmentError } = await supabase
  .from("treatments")
  .insert({
    patient_id: patientId,
    clinic_id: clinicId,
    budget_id: budget_id,
    professional_id: defaultProfessionalId,  // <-- ADICIONAR
    name: budget.title || "Tratamento",
    value: totalValue,
    status: "planned",
    observations: budget.notes,
  })
```

### Parte 2: Opção de Migração do Banco

Alternativamente, tornar a coluna `professional_id` nullable na tabela `treatments`:

```sql
ALTER TABLE public.treatments 
ALTER COLUMN professional_id DROP NOT NULL;
```

**Decisão**: Usar a primeira opção (pegar do budget_items) para manter a integridade dos dados.

### Parte 3: Padronizar Formatação Monetária

Substituir todas as ocorrências de `toLocaleString("pt-BR", { style: "currency", currency: "BRL" })` por `formatCurrency()`:

```typescript
// ANTES:
{titulo.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}

// DEPOIS:
import { formatCurrency } from "@/lib/utils";
{formatCurrency(titulo.amount)}
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/approve-budget/index.ts` | Extrair e usar `professional_id` do primeiro item |
| `src/components/pacientes/FinanceiroTab.tsx` | Substituir `toLocaleString` por `formatCurrency` |

---

## Detalhes Técnicos

### 1. Edge Function - Extração de Professional ID

Na linha 92-103, adicionar a extração do `professional_id`:

```typescript
// 4. Create treatment
// Usar o profissional do primeiro item como responsável principal
const defaultProfessionalId = budget.budget_items.find(
  (item: any) => item.professional_id
)?.professional_id || null;

const { data: treatment, error: treatmentError } = await supabase
  .from("treatments")
  .insert({
    patient_id: patientId,
    clinic_id: clinicId,
    budget_id: budget_id,
    professional_id: defaultProfessionalId,
    name: budget.title || "Tratamento",
    value: totalValue,
    status: "planned",
    observations: budget.notes,
  })
```

### 2. Validação Prévia

Adicionar validação antes de criar o tratamento:

```typescript
// Verificar se há pelo menos um profissional definido
const hasProfessional = budget.budget_items.some(
  (item: any) => item.professional_id
);

if (!hasProfessional) {
  return new Response(
    JSON.stringify({ 
      error: "Pelo menos um item deve ter um profissional responsável" 
    }),
    { status: 400, headers: corsHeaders }
  );
}
```

### 3. Substituições na FinanceiroTab.tsx

Total de **8 ocorrências** a substituir:
- Linha 191: `totalAberto.toLocaleString(...)` → `formatCurrency(totalAberto)`
- Linha 207: `totalPago.toLocaleString(...)` → `formatCurrency(totalPago)`
- Linha 223: `totalVencido.toLocaleString(...)` → `formatCurrency(totalVencido)`
- Linha 274: `titulo.balance.toLocaleString(...)` → `formatCurrency(titulo.balance)`
- Linha 311: `pagamento.value.toLocaleString(...)` → `formatCurrency(pagamento.value)`
- Linha 368: `titulo.amount.toLocaleString(...)` → `formatCurrency(titulo.amount)`
- Linha 371: `titulo.balance.toLocaleString(...)` → `formatCurrency(titulo.balance)`
- Linha 433: `pagamento.value.toLocaleString(...)` → `formatCurrency(pagamento.value)`

---

## Resultado Esperado

1. **Aprovação funciona**: Ao aprovar orçamento com profissionais definidos nos itens, o tratamento é criado corretamente
2. **Erro claro**: Se nenhum item tiver profissional, mensagem de erro clara é exibida
3. **Formatação correta**: Todos os valores monetários exibem no padrão brasileiro (R$ 11.200,00 ao invés de R$11200)
4. **Sem redundância**: Orçamentos aprovados não mostram mais o botão de aprovação (a lógica já filtra por status, basta a aprovação funcionar)
