

# Plano: Correções e Melhorias na Aba Prontuário

## 3 problemas identificados

### 1. Botao "+Novo Agendamento" nao funciona (AgendamentosTab)
O botao na linha 213 do `AgendamentosTab.tsx` nao tem `onClick`. Precisa navegar para a agenda com `?new=true` e o `patient_id` pre-selecionado.

### 2. Campo de observacoes + Pop-up de fechamento de atendimento
A tabela `appointments` ja possui o campo `description` (text, nullable). Vou reutiliza-lo para as observacoes da recepcionista.

**Fluxo:** Quando o status do agendamento e "confirmed" ou "scheduled" e a data ja passou (ou e hoje), aparece um botao "Finalizar Atendimento" na listagem. Ao clicar, abre um Dialog obrigatorio com:
- Campo de observacoes (textarea, obrigatorio) — o que foi feito na consulta
- Ao confirmar, atualiza `status = "completed"` e `description = observacoes`

Isso cria o historico de atendimento exigido.

### 3. Botao de Recibo na aba Financeiro (Parcelas pagas)
Na sub-aba "Parcelas", parcelas com status `paid` nao tem nenhuma acao. Vou adicionar um botao de impressora (Recibo) nas parcelas pagas, que busca o `receipt_document` associado e reimprime o PDF. Se nao houver recibo vinculado, gera um avulso.

---

## Alteracoes tecnicas

### Arquivos a modificar

1. **`src/components/pacientes/AgendamentosTab.tsx`**
   - Adicionar `onClick` no botao "Novo Agendamento" → `navigate(/dashboard/agenda?new=true&patient={patientId})`
   - Adicionar coluna "Observacoes" na tabela mostrando `description`
   - Adicionar coluna "Acoes" com botao "Finalizar Atendimento" para agendamentos pendentes (confirmed/scheduled, data passada ou hoje)
   - Criar Dialog inline com textarea obrigatoria para preencher observacoes ao finalizar
   - Ao confirmar: update `status = "completed"`, `description = texto`

2. **`src/components/pacientes/FinanceiroTab.tsx`**
   - Na sub-aba "Parcelas", para titulos com `status === "paid"`, adicionar botao de impressora (Printer icon) que busca o recibo associado via `receipt_documents` (por `payment_id`) e chama `handleReprintRecibo`
   - Reutilizar a logica de reimpressao ja existente no componente

### Sem migracoes necessarias
O campo `description` ja existe na tabela `appointments`. O campo `receipt_documents` ja tem tudo necessario.

