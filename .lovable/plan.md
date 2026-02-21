
# Corrigir Filtros da Agenda e Visibilidade de Agendamentos Orto

## Diagnostico

### Problema 1: Filtro "Somente Agendados" nao funciona

Quando o usuario seleciona um filtro de status (ex: "scheduled"), a funcao `getFilteredAppointments()` filtra corretamente os agendamentos. Porem, a view `DayTimeSlotsView` continua iterando sobre **todos os TIME_SLOTS** e exibe "Horario Disponivel" para slots sem agendamento correspondente. O usuario espera ver apenas os horarios que tem agendamentos com aquele status.

**Causa**: Na linha 693 do `Agenda.tsx`, o loop `TIME_SLOTS.map(...)` sempre renderiza todos os slots. Quando um slot nao tem agendamento (porque foi filtrado), ele cai no bloco "Available slot" (linha 774) mostrando o botao verde "Horario Disponivel".

### Problema 2: Agendamentos via Orto existem mas parecem nao aparecer

Os agendamentos criados via Ortodontia **estao no banco de dados** (confirmado com 10+ registros de hoje). A sincronizacao funciona. O problema provavel e que:

- O usuario esta com um filtro de dentista ativo que nao inclui o profissional selecionado na Orto
- A pagina da agenda nao recarregou automaticamente apos voltar do modulo de Ortodontia (os dados ficam em cache)

## Solucao

### Arquivo: `src/pages/dashboard/Agenda.tsx`

**1. Corrigir o DayTimeSlotsView quando filtro de status esta ativo**

Quando `filters.status !== "all"`, o loop de TIME_SLOTS deve:
- Mostrar apenas os slots que tem um agendamento correspondente ao filtro
- Esconder slots vazios, passados e "Em consulta" que nao possuem agendamento com o status selecionado
- Manter o comportamento atual (mostrar todos os slots) quando o filtro e "all"

Logica: adicionar uma condicao no inicio do map que, se houver filtro de status ativo e o slot nao tiver um agendamento filtrado, retorna `null` (nao renderiza).

**2. Corrigir o WeekViewSlots da mesma forma**

Aplicar a mesma logica de filtragem na view semanal para manter consistencia.

**3. Invalidar cache ao retornar da Ortodontia**

No componente da Agenda, adicionar um listener de foco (window focus ou route change) para re-buscar os agendamentos quando o usuario volta de outra pagina, garantindo que agendamentos criados em outros modulos aparecam imediatamente.

**4. Atualizar contadores de ocupacao**

Quando o filtro de status esta ativo, os contadores "disponivel/ocupado" e a taxa de ocupacao devem refletir apenas os dados filtrados, ou exibir uma mensagem indicando que ha um filtro ativo.

### Resumo das alteracoes

| O que muda | Onde |
|---|---|
| Ocultar slots vazios quando filtro de status esta ativo | `DayTimeSlotsView` (linhas ~693-800) |
| Mesma logica para view semanal | `WeekViewSlots` (linhas ~880+) |
| Re-fetch ao voltar para a pagina | `useEffect` com `visibilitychange` |
| Indicador de filtro ativo nos contadores | `DayTimeSlotsView` header |
