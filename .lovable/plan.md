

# Correcao do Modulo PDF Premium - Dados e Formatacao

## Problemas Identificados

### Problema 1: Profissional nao encontrado (CRO "[Nao cadastrado]")

A busca do profissional usa `user.email.toUpperCase()` para comparar com o campo `email` da tabela `profissionais`. Porem o email esta armazenado em minusculo (`aserecrutamento@gmail.com`), entao a comparacao com `ASERECRUTAMENTO@GMAIL.COM` falha.

O profissional **existe** no banco com todos os dados corretos:
- Nome: Dr Luiz Eduardo Reis
- CRO: CROSP 161836
- Especialidade: CIRURGIAO

Mas nunca e encontrado por causa da comparacao case-sensitive.

### Problema 2: Endereco aparece como JSON cru

O campo `address` da clinica e um objeto JSON (`{rua, numero, bairro, cidade...}`), mas no `NovoReceituarioModal` ele e serializado com `JSON.stringify()` gerando texto ilegivel no documento.

### Problema 3: PDF Premium nao busca profissional correto

O `handleGeneratePDF` no `HistoricoDocumentosModal` tem o **mesmo bug** de case-sensitivity na busca do profissional. Alem disso, nao utiliza o campo `professional_id` do documento (que esta `NULL` porque nao esta sendo salvo).

### Problema 4: `professional_id` nunca e salvo no documento

Ao criar o receituario, o campo `professional_id` do `patient_documents` nao e preenchido, impossibilitando rastreabilidade.

---

## Solucao

### Arquivo 1: `src/components/documentos/NovoReceituarioModal.tsx`

**1. Corrigir busca do profissional (case-insensitive)**

Trocar:
```text
.eq("email", user.email.toUpperCase())
```
Por busca case-insensitive usando `.ilike("email", user.email)`.

**2. Corrigir formatacao do endereco**

Na funcao `gerarConteudoReceituario`, quando `clinicData.address` for um objeto, formatar como texto legivel:
```text
Rua X, 123 - Bairro, Cidade/UF
```

**3. Salvar `professional_id` ao criar documento**

No `handleSalvar`, incluir o campo `professional_id: professionalData?.id` no INSERT do `patient_documents`.

### Arquivo 2: `src/components/documentos/HistoricoDocumentosModal.tsx`

**4. Corrigir busca do profissional no PDF Premium**

Trocar a busca por email uppercase por `.ilike("email", user.email)`.

**5. Usar `professional_id` do documento quando disponivel**

Se o documento tem `professional_id` preenchido, buscar diretamente por ID ao inves de depender do email do usuario logado. Isso garante que o profissional correto aparece mesmo quando outro usuario gera o PDF.

**6. Adicionar `professional_id` ao tipo Document**

Incluir `professional_id: string | null` na interface e no SELECT.

### Arquivo 3: `src/utils/generateDocumentoPDF.ts`

**7. Melhorias de formatacao premium**

- Corrigir o parser de conteudo (`drawBody`) para lidar melhor com o formato do receituario: parar de renderizar dados que ja estao no cabecalho/rodape do PDF (nome da clinica, CNPJ, telefone, endereco)
- Garantir que secoes como "DADOS DO PACIENTE" e "MEDICAMENTOS PRESCRITOS" sao renderizadas com estilo premium (titulo em cor primaria, spacing adequado)
- Nao duplicar informacoes que ja aparecem no header institucional
- Formatar corretamente campos label:valor com bold no label

---

## Resumo das Alteracoes

| Arquivo | Alteracao | Impacto |
|---|---|---|
| NovoReceituarioModal.tsx | Busca profissional case-insensitive | CRO e nome corretos no documento |
| NovoReceituarioModal.tsx | Formatacao endereco como texto | Endereco legivel no conteudo |
| NovoReceituarioModal.tsx | Salvar professional_id | Rastreabilidade do profissional |
| HistoricoDocumentosModal.tsx | Busca profissional case-insensitive | PDF Premium com dados corretos |
| HistoricoDocumentosModal.tsx | Usar professional_id do documento | Profissional correto no PDF |
| generateDocumentoPDF.ts | Parser de conteudo mais robusto | Sem duplicacao de dados no PDF |

## Resultado Esperado

- Nome, CRO e especialidade do dentista aparecem corretamente no PDF
- Endereco formatado como texto legivel
- PDF Premium sem dados duplicados (cabecalho institucional + conteudo nao repetem clinica/endereco)
- Dados do profissional rastreados por ID no documento

