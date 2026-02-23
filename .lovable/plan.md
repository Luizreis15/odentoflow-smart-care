

# Corrigir Selecao de Medicamentos no Receituario

## Problema

O componente `Command` (cmdk v0.2.1) tem um bug conhecido no evento `onSelect` que impede a selecao correta de itens. O medicamento fica "travado" no primeiro da lista (paracetamol) e o scroll dentro do `CommandList` tambem nao funciona corretamente dentro do Dialog.

Este mesmo problema ja foi resolvido em outros modulos (Agenda, Orcamentos) usando um padrao customizado sem cmdk.

## Solucao

Substituir o `Popover` + `Command` por um padrao customizado com:
- `Input` para busca
- Container `div` com scroll nativo e `onClick` nos itens
- Deteccao de clique fora para fechar

## Alteracoes

### Arquivo: `src/components/documentos/NovoReceituarioModal.tsx`

**1. Remover imports do cmdk (linha 6)**

Remover:
```typescript
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
```

**2. Adicionar estado e ref para o combobox customizado**

Adicionar:
- `useRef` no import do React
- Ref para o container do dropdown (`dropdownRef`)
- Efeito para detectar clique fora e fechar o dropdown

**3. Substituir bloco Popover+Command (linhas 396-469) por combobox customizado**

Substituir todo o bloco `<Popover>...</Popover>` por:

- Botao trigger que abre/fecha o dropdown (mesmo visual atual)
- Container absoluto (`position: absolute`, `z-[9999]`) com:
  - Input de busca
  - Badges de filtro por categoria (mesmo layout atual)
  - Div scrollavel (`max-h-[300px] overflow-y-auto`) com os medicamentos filtrados
  - Cada medicamento como um `div` com `onClick={() => atualizarMedicamento(medSel.id, med)}`

**4. Remover import do Popover (linha 7)**

Remover:
```typescript
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
```

## Estrutura do Combobox Customizado

```text
<div className="relative">
  <Button onClick={toggle}>
    {medicamento selecionado}
  </Button>

  {searchOpen === medSel.id && (
    <div ref={dropdownRef} className="absolute z-[9999] w-[600px] bg-popover border rounded-md shadow-lg">
      <Input placeholder="Buscar medicamento..." />
      <div className="flex gap-2 p-2 border-b flex-wrap">
        {badges de categoria}
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {medicamentosFiltrados.map(med => (
          <div onClick={() => atualizarMedicamento(medSel.id, med)} className="cursor-pointer p-2 hover:bg-accent">
            {nome} {concentracao} - {indicacao}
          </div>
        ))}
        {medicamentosFiltrados.length === 0 && <p>Nenhum encontrado</p>}
      </div>
    </div>
  )}
</div>
```

## Resultado Esperado

- Selecao de medicamento funciona ao clicar em qualquer item da lista
- Scroll funciona normalmente dentro do dropdown
- Filtro por categoria e busca por texto continuam funcionando
- Visual praticamente identico ao atual
