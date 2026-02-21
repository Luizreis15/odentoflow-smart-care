
# Integração Ortodontia + Financeiro com Reajuste Anual

## Problema Atual
O módulo de Ortodontia armazena dados financeiros (`valor_mensalidade`, `dia_vencimento`, `total_meses`) na tabela `ortho_cases`, mas **nao gera automaticamente as parcelas** na tabela `receivable_titles`. A aba Financeiro do caso depende de um `budget_id` que geralmente nao existe para casos de ortodontia.

## Solucao em 4 Partes

### Parte 1 - Schema: Adicionar coluna `ortho_case_id` em `receivable_titles`
- Criar migration adicionando `ortho_case_id UUID REFERENCES ortho_cases(id)` na tabela `receivable_titles`
- Isso permite vincular parcelas diretamente ao caso ortodontico, sem depender de um orcamento intermediario
- RLS policies existentes ja cobrem a tabela

### Parte 2 - Edge Function: `generate-ortho-installments`
Nova Edge Function que recebe `ortho_case_id` e:
1. Busca os dados do caso (`valor_total`, `valor_entrada`, `valor_mensalidade`, `dia_vencimento`, `total_meses`, `clinic_id`, `patient_id`)
2. Verifica se ja existem titulos gerados para este caso (evitar duplicacao)
3. Gera o titulo de entrada (se `valor_entrada > 0`) com vencimento imediato
4. Gera N titulos mensais (um por mes), usando `dia_vencimento` como dia fixo e `valor_mensalidade` como valor de cada parcela
5. Retorna os titulos criados

Sera chamada automaticamente ao criar um novo caso ortodontico (no `handleSubmit` do `NovoCasoModal`) e tambem disponivel como botao "Gerar Parcelas" na aba financeira do caso.

### Parte 3 - Edge Function: `ortho-price-adjustment` (Reajuste)
Nova Edge Function que implementa reajuste de mensalidades:

**Parametros:**
- `mode`: `"individual"` ou `"bulk"`
- `ortho_case_id`: (para modo individual)
- `clinic_id`: (para modo bulk - aplica a todos os casos ativos da clinica)
- `percentual_reajuste`: ex: 10 (para 10%)
- `valor_fixo_novo`: alternativa ao percentual, define novo valor absoluto (apenas modo individual)

**Logica:**
1. Busca as parcelas pendentes (status != 'paid') com `due_date` futuro
2. Calcula o novo valor aplicando o percentual ou usando o valor fixo
3. Atualiza `amount` e `balance` das parcelas pendentes
4. Atualiza `valor_mensalidade` na tabela `ortho_cases`
5. Registra o reajuste em `audit_logs` para rastreabilidade

### Parte 4 - Atualizacoes no Frontend

**4a. `NovoCasoModal.tsx`**
- Apos criar o caso com sucesso, chamar automaticamente `generate-ortho-installments` para gerar as parcelas
- Feedback via toast informando quantas parcelas foram geradas

**4b. `OrthoFinanceiroTab.tsx`**
- Alterar a query para buscar titulos por `ortho_case_id` em vez de (ou alem de) `budget_id`
- Adicionar botao "Gerar Parcelas" caso nenhum titulo exista
- Adicionar botao "Aplicar Reajuste" com dialog que pede percentual ou valor fixo
- Exibir historico de reajustes (via audit_logs)

**4c. Nova UI de Reajuste em Massa**
- Adicionar na pagina Ortodontia (`Ortodontia.tsx`) um botao "Reajuste Anual" no header
- Modal `ReajusteAnualModal.tsx` com:
  - Campo de percentual de reajuste
  - Preview mostrando: lista de pacientes ativos, valor atual, novo valor calculado
  - Botao de confirmacao que chama a Edge Function em modo bulk
  - Resumo pos-execucao (X pacientes reajustados, Y parcelas atualizadas)

**4d. Aba Financeiro do Paciente (`FinanceiroTab.tsx`)**
- Os titulos gerados pelo ortho ja aparecerao automaticamente pois sao `receivable_titles` do mesmo paciente
- Nenhuma alteracao necessaria neste componente

---

## Detalhes Tecnicos

### Migration SQL
```sql
ALTER TABLE public.receivable_titles 
  ADD COLUMN ortho_case_id UUID REFERENCES public.ortho_cases(id);

CREATE INDEX idx_receivable_titles_ortho_case 
  ON public.receivable_titles(ortho_case_id);
```

### Fluxo de Dados

```text
Novo Caso Ortho (24 meses, R$350/mes, dia 10)
    |
    v
generate-ortho-installments
    |
    v
24 receivable_titles (ortho_case_id = X, status = 'open')
    |
    v
Aparecem na aba Financeiro do paciente + aba Financeiro do caso ortho
    |
    v  (1 ano depois)
ortho-price-adjustment (percentual = 8%)
    |
    v
Parcelas restantes: R$350 -> R$378
ortho_cases.valor_mensalidade -> R$378
```

### Arquivos Novos
- `supabase/functions/generate-ortho-installments/index.ts`
- `supabase/functions/ortho-price-adjustment/index.ts`
- `src/components/ortodontia/ReajusteAnualModal.tsx`
- `src/components/ortodontia/ReajusteIndividualModal.tsx`

### Arquivos Modificados
- `src/components/ortodontia/NovoCasoModal.tsx` - chamar geracao de parcelas apos criar caso
- `src/components/ortodontia/OrthoFinanceiroTab.tsx` - buscar por ortho_case_id, botoes de reajuste e geracao
- `src/pages/dashboard/Ortodontia.tsx` - botao de reajuste anual no header
- `supabase/config.toml` - registrar novas edge functions com verify_jwt = false
