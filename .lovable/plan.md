

# Recibo Imediato na Aprovação do Orçamento

## Problema Atual
Ao aprovar um orçamento com cartão de crédito 10x, o sistema cria 10 parcelas individuais. O usuário precisa ir à aba "Parcelas", dar baixa em cada uma manualmente e gerar recibos individuais. Isso não faz sentido para pagamentos em cartão — o valor total já foi pago no ato.

## Regra de Negócio
- **Pagamento imediato** (cartão crédito/débito, PIX, dinheiro, transferência): O recibo sai **na hora**, com o **valor total** e descritivo do tratamento. As parcelas são apenas o parcelamento da operadora — a clínica recebeu o pagamento integral.
- **Carnê / boleto / convênio**: As parcelas continuam abertas para baixa individual conforme o paciente paga.

## Solução

### 1. Modificar `AprovarOrcamentoModal.tsx`
Após a aprovação bem-sucedida (step 4), quando o método de pagamento for imediato (cartão, PIX, dinheiro, transferência):
- Chamar automaticamente `record-payment` para **todas as parcelas** de uma vez
- Gerar **um único recibo** com o valor total e descrição do orçamento (tratamento)
- Exibir o diálogo de confirmação com opção de imprimir o recibo

Métodos considerados "imediatos": `pix`, `dinheiro`, `cartao_credito`, `cartao_debito`, `transferencia`, `carteira_digital`.
Métodos de "carnê" (baixa manual): `boleto`, `cheque`, `convenio`.

### 2. Ajustar o recibo consolidado
O recibo gerado na aprovação terá:
- Valor total do orçamento (não da parcela individual)
- Descrição: nome do tratamento/orçamento + lista de procedimentos
- Forma de pagamento com indicação de parcelamento (ex: "Cartão de Crédito 10x")

### 3. Fluxo final
```text
Aprovar Orçamento
  → Cria parcelas (títulos)
  → Se método imediato:
      → Baixa automática de TODAS as parcelas
      → Gera 1 recibo com valor total + descritivo
      → Exibe PDF do recibo
  → Se carnê:
      → Parcelas ficam abertas para baixa manual
```

### Arquivos a modificar
- **`src/components/orcamentos/AprovarOrcamentoModal.tsx`** — Adicionar lógica pós-aprovação para pagamento imediato + geração de recibo consolidado

