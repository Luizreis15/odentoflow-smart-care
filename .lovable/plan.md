

# Modulo de Emissao de Recibo de Pagamento

## Objetivo

Criar um sistema de emissao de recibo PDF apos a baixa de pagamentos, permitindo que a clinica gere um comprovante profissional para entregar ao paciente.

## Estrategia

Criar um componente utilitario que gera o recibo em PDF usando a biblioteca `jsPDF` (ja instalada no projeto). O recibo sera oferecido automaticamente apos a confirmacao do pagamento, e tambem disponivel como botao nos titulos ja pagos.

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/utils/generateRecibo.ts` | Funcao utilitaria que gera o PDF do recibo |

## Arquivos a Modificar

| Arquivo | Descricao |
|---------|-----------|
| `src/components/financeiro/PaymentDrawer.tsx` | Apos confirmar pagamento, perguntar se deseja emitir recibo |
| `src/components/financeiro/ReceivablesTab.tsx` | Adicionar botao "Recibo" nos titulos com status "paid" |

---

## Detalhes Tecnicos

### 1. generateRecibo.ts - Gerador de PDF

Funcao que recebe os dados do pagamento e da clinica e gera um recibo profissional em PDF com:

- Cabecalho com dados da clinica (nome, CNPJ, endereco, telefone)
- Numero do recibo (baseado no title_number)
- Data de emissao
- Dados do paciente (nome, CPF se disponivel)
- Descricao do servico (referencia ao orcamento/parcela)
- Valor pago (por extenso e numerico), forma de pagamento
- Linha de assinatura
- Rodape com informacoes legais

A funcao buscara os dados da clinica na tabela `clinicas` e os dados do paciente na tabela `patients`.

```typescript
interface ReciboData {
  titleNumber: number;
  installmentNumber: number;
  totalInstallments: number;
  patientName: string;
  patientCpf?: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  clinicName: string;
  clinicCnpj?: string;
  clinicPhone?: string;
  clinicAddress?: string;
}

export async function generateRecibo(data: ReciboData): Promise<void> {
  // Gera PDF usando jsPDF com layout profissional
  // Abre em nova aba ou faz download
}
```

### 2. PaymentDrawer.tsx - Oferecer recibo apos baixa

Apos o `toast.success` de pagamento confirmado, exibir um dialog perguntando se deseja emitir o recibo. Se sim, chama `generateRecibo` com os dados do pagamento recem-registrado.

Fluxo:
1. Usuario confirma pagamento
2. Toast de sucesso aparece
3. Dialog simples: "Deseja emitir o recibo de pagamento?" com botoes "Sim, emitir" e "Nao"
4. Se "Sim", gera o PDF e faz download

### 3. ReceivablesTab.tsx - Botao de recibo em titulos pagos

Na tabela desktop e nos cards mobile, para titulos com `status === "paid"`, adicionar um botao/icone "Recibo" (icone FileText) que permite gerar o recibo a qualquer momento.

```
Desktop (coluna Acoes):
- Titulo em aberto: [Baixar]
- Titulo pago: [Recibo]

Mobile (cards):
- Titulo pago: Botao "Emitir Recibo"
```

---

## Layout do Recibo PDF

```text
┌─────────────────────────────────────┐
│         NOME DA CLINICA             │
│   CNPJ: XX.XXX.XXX/XXXX-XX         │
│   Endereco | Telefone               │
├─────────────────────────────────────┤
│                                     │
│     RECIBO DE PAGAMENTO             │
│     No 0001                         │
│                                     │
│  Recebi de: [Nome do Paciente]      │
│  CPF: XXX.XXX.XXX-XX               │
│                                     │
│  A quantia de: R$ 500,00            │
│  (quinhentos reais)                 │
│                                     │
│  Referente a: Tratamento odonto...  │
│  Parcela 1/6 - Titulo #42          │
│                                     │
│  Forma de pagamento: PIX            │
│  Data: 09/02/2026                   │
│                                     │
│                                     │
│  _________________________________  │
│          Assinatura                  │
│                                     │
├─────────────────────────────────────┤
│  Gerado em DD/MM/AAAA HH:MM        │
│  Documento sem valor fiscal         │
└─────────────────────────────────────┘
```

## Dados Necessarios

Os dados serao obtidos de:
- **Clinica**: tabela `clinicas` (nome, cnpj, phone, endereco)
- **Paciente**: ja disponivel no titulo (`patient.full_name`) + busca CPF na tabela `patients`
- **Pagamento**: dados do proprio titulo e do formulario de baixa

## Dependencias

Nenhuma nova dependencia necessaria - `jsPDF` ja esta instalada no projeto.

