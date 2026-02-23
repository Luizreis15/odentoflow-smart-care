

# Reformulacao do Conteudo do Receituario e Layout do PDF Premium

## Problemas Apontados

1. **"RECEITUARIO IMPRESSO"** -- a palavra "Impresso" e redundante e nao deve aparecer no titulo do documento
2. **Dados da clinica no corpo** (nome, CNPJ, telefone, endereco) -- devem compor apenas o cabecalho e rodape (papel timbrado), nao o corpo do texto
3. **"Criado em DD/MM/YYYY as HH:MM"** -- desnecessario; a data deve aparecer apenas na area de assinatura como "Cidade, DD de mes de AAAA"
4. **"Data da Prescricao"** abaixo dos dados do paciente -- tambem desnecessario, ja que a data esta na assinatura

## Solucao

### Arquivo 1: `src/components/documentos/NovoReceituarioModal.tsx`

**Reformular `gerarConteudoReceituario()`** para que o conteudo salvo no banco contenha APENAS:

- Dados do paciente (nome, nascimento, CPF, endereco)
- Medicamentos prescritos (nome, concentracao, posologia, obs)

Remover do conteudo gerado:
- Titulo "RECEITUARIO IMPRESSO/DIGITAL"
- Nome da clinica, CNPJ, telefone, endereco
- Separadores visuais (linhas de caracteres)
- "Data da Prescricao"
- Secao "PROFISSIONAL RESPONSAVEL" (ja tratada pela assinatura do PDF)

**Corrigir titulo salvo no banco**: de `Receituario Impresso - DD/MM/YYYY` para `Receituario - DD/MM/YYYY`

### Arquivo 2: `src/utils/generateDocumentoPDF.ts`

**Adicionar cidade a assinatura**: usar `clinicCity` (extraida do endereco) para formatar como:
```text
Santo Andre, 23 de fevereiro de 2026
```

**Adicionar `clinicCity` ao `DocumentoPDFData`** interface.

**Remover timestamp "Gerado em"** do rodape (desnecessario conforme feedback).

### Arquivo 3: `src/components/documentos/HistoricoDocumentosModal.tsx`

**Passar `clinicCity`** ao gerar PDF: extrair `address.cidade` e enviar no `pdfData`.

**Remover "Criado em"** da impressao simples (`handlePrintDoc`): a data ja aparece na assinatura.

## Estrutura Final do Documento PDF

```text
+------------------------------------------+
|  [LOGO]          NOME DA CLINICA         |
|                  CNPJ: XX.XXX.XXX/XXXX   |
|                  Av Dom Pedro II, 1107    |
|                  Tel: (11) 2866-7666      |
|  ======================================  |
|                                          |
|              RECEITUARIO                 |
|              ___________                 |
|                                          |
|  DADOS DO PACIENTE                       |
|  Nome: Fulano de Tal                     |
|  Data de Nascimento: 01/01/1990          |
|  CPF: 123.456.789-00                     |
|                                          |
|  MEDICAMENTOS PRESCRITOS                 |
|                                          |
|  1. Amoxicilina 500mg                    |
|     Tomar 1 capsula de 8 em 8 horas      |
|     por 7 dias                           |
|                                          |
|  2. Ibuprofeno 600mg                     |
|     Tomar 1 comprimido de 6 em 6 horas   |
|                                          |
|                                          |
|  Santo Andre, 23 de fevereiro de 2026    |
|                                          |
|          ________________________        |
|          Dr. Eduardo Reis                |
|          CRO: CROSP 161836               |
|          Cirurgiao                        |
|                                          |
|  ------                                  |
|  Av Dom Pedro II, 1107 - Santo Andre/SP  |
|  Tel: (11) 2866-7666                     |
|  ID: FLD-RC-2026-XXXXXXXX               |
+------------------------------------------+
```

## Resumo das Alteracoes

| Arquivo | O que muda |
|---|---|
| NovoReceituarioModal.tsx | Conteudo limpo: so paciente + medicamentos. Titulo sem "Impresso" |
| generateDocumentoPDF.ts | Assinatura com cidade + data. Sem "Gerado em" no rodape. Nova prop `clinicCity` |
| HistoricoDocumentosModal.tsx | Passa `clinicCity`. Remove "Criado em" da impressao simples |

