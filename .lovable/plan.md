

## Plano: Corrigir botões de agendamento na versão Mobile

### Problema
Os botões "Novo" e "Novo Agendamento" na MobileAgenda navegam para `/dashboard/agenda?new=true`, mas nenhum código trata o parâmetro `?new=true`. A Agenda desktop só abre o formulário quando recebe `?date=...&time=...`. O resultado é que nada acontece ao clicar.

O mesmo problema existe no CentralFAB (botão "+" central), que navega para `/dashboard/agenda` sem abrir o formulário.

### Solução

**1. Agenda.tsx — Tratar o parâmetro `new=true`** (~linha 184-212)
- No `useEffect` que lê `searchParams`, adicionar tratamento para `new=true`
- Quando `new=true` estiver presente, abrir o Sheet de novo agendamento (`setIsSheetOpen(true)`) e pré-preencher a data com a data atual
- Limpar o parâmetro após processar

**2. MobileAgenda.tsx — Corrigir navegação dos botões**
- Botão "Novo" (linha 200): mudar de `navigate("/dashboard/agenda?new=true")` para abrir o formulário diretamente na Agenda desktop via parâmetro `new=true` (que agora será tratado)
- Botão "Novo Agendamento" no empty state (linha 289): mesmo ajuste — já usa `?new=true`, funcionará após a correção no passo 1

**3. CentralFAB.tsx — Corrigir ação "Novo Agendamento"**
- Linha 24: mudar de `navigate("/dashboard/agenda")` para `navigate("/dashboard/agenda?new=true")` para que o formulário abra automaticamente

### Arquivos alterados
- `src/pages/dashboard/Agenda.tsx` — adicionar handler para `?new=true`
- `src/components/mobile/CentralFAB.tsx` — corrigir URL de navegação

