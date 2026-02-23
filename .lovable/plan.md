
# Modulo de Edicao de Documentos Antes da Impressao

## Contexto

Atualmente, ao visualizar um documento no historico (`HistoricoDocumentosModal`), o conteudo e exibido apenas em modo leitura (read-only). O usuario nao consegue corrigir erros de cadastro, ajustar espaçamento, alterar nome do dentista ou mudar a data antes de imprimir.

## Solucao

Adicionar um modo de edicao no `HistoricoDocumentosModal` que permite ao usuario editar o conteudo completo do documento antes de imprimir ou assinar.

## Alteracoes

### Arquivo: `src/components/documentos/HistoricoDocumentosModal.tsx`

**1. Adicionar botao "Editar" na visualizacao do documento**

Na view mode (quando `selectedDoc` esta ativo), adicionar um botao "Editar" ao lado dos botoes "Voltar" e "Imprimir". Ao clicar, o sistema entra em modo de edicao.

**2. Novo estado `editMode` e `editedContent` / `editedTitle`**

Adicionar estados:
- `editMode: boolean` -- controla se o documento esta em modo edicao
- `editedContent: string` -- conteudo editavel
- `editedTitle: string` -- titulo editavel

Quando o usuario clica em "Editar":
- `editMode = true`
- `editedContent = selectedDoc.content`
- `editedTitle = selectedDoc.title`

**3. Substituir a area de conteudo por campos editaveis**

Quando `editMode === true`:
- O titulo (`DialogTitle`) vira um `<Input>` editavel com o titulo do documento
- O bloco `<div className="whitespace-pre-wrap">` vira um `<Textarea>` grande e editavel, permitindo ao usuario:
  - Ajustar espaçamento entre linhas
  - Corrigir erros de texto
  - Alterar nome do dentista
  - Mudar datas
  - Qualquer outro ajuste textual

**4. Botoes de acao no modo edicao**

Quando em modo edicao, os botoes serao:
- **Cancelar** -- volta ao modo visualizacao sem salvar
- **Salvar** -- salva as alteracoes no banco de dados (UPDATE na tabela `patient_documents`) e volta ao modo visualizacao
- **Salvar e Imprimir** -- salva e abre a janela de impressao em seguida

**5. Adicionar botao "Editar" tambem na listagem**

Na lista de documentos (cards), adicionar um botao com icone de edicao (`Pencil`) ao lado dos botoes existentes (Visualizar, Imprimir, Assinar, Excluir). Ao clicar, abre diretamente no modo de edicao.

### Detalhes Tecnicos

**Novos imports necessarios:**
- `Pencil` do `lucide-react`
- `Textarea` de `@/components/ui/textarea`
- `Input` de `@/components/ui/input` (ja importado na pagina)

**Funcao de salvar edicao:**
```text
const handleSaveEdit = async () => {
  // UPDATE patient_documents SET content = editedContent, title = editedTitle WHERE id = selectedDoc.id
  // Atualizar selectedDoc local com novos valores
  // Recarregar lista de documentos
  // Sair do modo edicao
}
```

**Funcao de salvar e imprimir:**
```text
const handleSaveAndPrint = async () => {
  await handleSaveEdit();
  handlePrintDoc({ ...selectedDoc, content: editedContent, title: editedTitle });
}
```

**Textarea configurado para edicao confortavel:**
- `rows={20}` para area grande de edicao
- `className="font-mono text-sm"` para visualizacao de texto formatado
- `style={{ lineHeight: '1.8' }}` para espaçamento confortavel

### Fluxo do Usuario

```text
Historico -> Clica "Editar" (ou "Visualizar" + "Editar")
  -> Documento abre em modo edicao
  -> Usuario ajusta titulo, conteudo, datas, nomes
  -> Clica "Salvar" (salva no banco)
  -> Ou clica "Salvar e Imprimir" (salva e imprime)
  -> Ou clica "Cancelar" (descarta alteracoes)
```

### Resumo de Alteracoes

| Alteracao | Detalhes |
|---|---|
| Novos estados | `editMode`, `editedContent`, `editedTitle` |
| Botao Editar na listagem | Icone `Pencil`, abre doc em modo edicao |
| Botao Editar na visualizacao | Ao lado de Imprimir e Assinar |
| Modo edicao | Titulo em Input, conteudo em Textarea |
| Salvar edicao | UPDATE no banco, recarrega lista |
| Salvar e Imprimir | Salva + abre impressao |
