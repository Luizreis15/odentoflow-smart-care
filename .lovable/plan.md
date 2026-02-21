

# Corrigir Agendamento via Ortodontia: Selecao de Horario Real

## Problema Identificado

O modal de consulta ortodontica (`ConsultaManutencaoModal.tsx`) cria agendamentos com horario fixo `09:00` (linha 97), sem considerar:

1. A agenda real do dentista selecionado (horarios de inicio/fim, almoco)
2. Os horarios ja ocupados naquele dia
3. A duracao do intervalo configurado (15, 30, 45 ou 60 min)

Isso faz com que todos os agendamentos caiam no mesmo horario e potencialmente conflitem entre si ou nao aparecam na visualizacao correta da agenda.

## Solucao

Adicionar um **seletor de horario disponivel** no modal, que carrega dinamicamente os slots livres com base no dentista e na data selecionados.

## Alteracoes Tecnicas

### Arquivo: `src/components/ortodontia/ConsultaManutencaoModal.tsx`

**1. Novo estado para horario selecionado**
- Adicionar `horarioConsulta` (string) e `horarioProximaConsulta` (string)

**2. Buscar config de agenda do profissional**
- Query reativa em `profissional_agenda_config` filtrada por `profissional_id` e dia da semana correspondente a `dataConsulta`
- Fallback para config da clinica (`configuracoes_clinica`) caso o profissional nao tenha config propria

**3. Buscar agendamentos existentes do profissional no dia**
- Query em `appointments` filtrando por `dentist_id` e data selecionada
- Calcular quais slots estao ocupados considerando `duration_minutes` de cada agendamento

**4. Gerar slots disponiveis**
- Reutilizar a mesma logica de `generateDynamicTimeSlots` da Agenda (extrair para utils ou duplicar localmente)
- Filtrar removendo slots ocupados e slots no passado

**5. Substituir campo de data por data + horario**
- O campo "Data da Consulta" continua como `<Input type="date">`
- Adicionar um `<Select>` ao lado com os horarios disponiveis (desabilitado ate selecionar profissional + data)
- Mesmo tratamento para o campo "Proxima Consulta Prevista"

**6. Corrigir `createGeneralAppointment`**
- Substituir `T09:00:00` pelo horario selecionado: `new Date(\`${dateStr}T${selectedTime}:00\`)`

### Fluxo do Usuario

```text
1. Seleciona Profissional
2. Seleciona Data da Consulta
3. Sistema carrega slots disponiveis do profissional naquele dia
4. Seleciona Horario disponivel
5. (Opcional) Seleciona data e horario da proxima consulta
6. Salva -> agendamento criado no horario correto
```

### Validacoes

- Bloquear submit se horario nao foi selecionado
- Exibir mensagem "Nenhum horario disponivel" se todos os slots estiverem ocupados
- Bloquear slots passados (mesmo dia)
- Se o profissional nao tiver config de agenda, usar config da clinica

