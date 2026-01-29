
# Plano: Integrar Aprovação de Orçamento com Aba Financeiro do Paciente

## Problema Identificado

Ao clicar em "Aprovar Orçamento" na aba de orçamentos do paciente, o sistema apenas atualiza o status no banco de dados diretamente, **sem chamar a Edge Function `approve-budget`** que é responsável por:
1. Criar os títulos a receber (`receivable_titles`)
2. Criar o tratamento associado
3. Provisionar comissões dos profissionais

Por isso, a aba Financeiro mostra R$ 0,00 mesmo com orçamentos aprovados.

---

## Solução Proposta

### Parte 1: Corrigir o fluxo de aprovação

Modificar `OrcamentosTab.tsx` para chamar a Edge Function em vez de fazer update direto:

```text
ANTES:
supabase.from("budgets").update({ status: "approved" })

DEPOIS:  
supabase.functions.invoke("approve-budget", { 
  body: { budget_id, approved_by } 
})
```

### Parte 2: Adicionar funcionalidade de registro de pagamento na aba Financeiro

Atualizar `FinanceiroTab.tsx` para permitir:
1. Clicar em um título a receber para abrir o Drawer de pagamento
2. Registrar a forma de pagamento do paciente
3. Dar baixa parcial ou total

### Parte 3: Verificar reprocessamento de orçamentos já aprovados

Para orçamentos que já foram aprovados sem gerar títulos, adicionar botão de "Reprocessar" que chama a Edge Function.

---

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/orcamentos/OrcamentosTab.tsx` | Chamar Edge Function `approve-budget` |
| `src/components/pacientes/FinanceiroTab.tsx` | Adicionar PaymentDrawer e interatividade |

---

## Detalhes Técnicos

### 1. OrcamentosTab.tsx - Novo fluxo de aprovação

```typescript
const handleApproveBudget = async (budgetId: string) => {
  try {
    setApproving(budgetId);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");
    
    const { data, error } = await supabase.functions.invoke("approve-budget", {
      body: { 
        budget_id: budgetId, 
        approved_by: user.id 
      },
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);
    
    toast.success(`Orçamento aprovado! ${data.titles?.length || 0} parcelas criadas.`);
    onRefresh();
  } catch (error: any) {
    console.error("Erro ao aprovar orçamento:", error);
    toast.error(error.message || "Erro ao aprovar orçamento");
  } finally {
    setApproving(null);
  }
};
```

### 2. FinanceiroTab.tsx - Adicionar interação com títulos

- Importar `PaymentDrawer` existente
- Adicionar estado para controle do drawer
- Tornar linhas da tabela clicáveis para abrir o drawer
- Passar `clinicId` como prop necessária
- Adicionar botão "Registrar Pagamento" em cada linha
- Atualizar interface para receber `clinicId`

### 3. Fluxo Visual Esperado

```text
1. Usuário aprova orçamento
   ↓
2. Edge Function cria:
   - Tratamento
   - Títulos a receber (parcelas)
   - Comissões provisionadas
   ↓
3. Aba Financeiro exibe:
   - Cards com totais (Em Aberto, Pago, Vencido)
   - Lista de títulos/parcelas
   - Histórico de pagamentos
   ↓
4. Usuário clica em parcela
   ↓
5. PaymentDrawer abre para:
   - Escolher forma de pagamento
   - Registrar valor
   - Dar baixa total ou parcial
```

---

## Resultado Esperado

1. Ao aprovar um orçamento de R$ 11.200,00:
   - O título aparece na aba Financeiro do paciente
   - Os cards mostram "Total em Aberto: R$ 11.200,00"
   - O usuário pode clicar no título para registrar pagamento

2. Ao registrar pagamento:
   - O valor vai para "Total Pago"
   - O saldo é atualizado
   - O histórico de pagamentos é alimentado
   - Os dashboards são atualizados automaticamente
