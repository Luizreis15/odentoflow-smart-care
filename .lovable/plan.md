

# Corrigir Duracao de Consulta: Botoes Flexiveis + Slots Dinamicos

## Problema Atual

1. O seletor de duracao oferece apenas 30, 60, 90 e 120 minutos (falta 15 e 45)
2. O campo de horario e um `<Input type="time">` livre, permitindo qualquer hora -- deveria mostrar apenas slots disponiveis
3. Quando o dentista tem config de 15 min, o formulario nao reflete isso
4. Agendamentos longos (ex: 1h) nao bloqueiam corretamente os slots subsequentes no formulario

## Solucao

### 1. Novo seletor de duracao com botoes rapidos

Substituir o `<Select>` de duracao por um componente com:
- **Botoes base**: `15min`, `30min`, `45min`, `60min` (clique para selecionar)
- **Botoes incrementais**: `+15`, `+30`, `+60` (somam ao valor atual)
- Display do valor total selecionado
- Auto-default: ao selecionar um dentista, o valor inicial sera o `duracao_consulta_minutos` da config dele

```text
Duracao: [15] [30] [45] [60]   [+15] [+30] [+60]    Total: 45 min
```

### 2. Trocar Input de horario por Select de slots disponiveis

Substituir `<Input type="time">` por `<Select>` que:
- Gera slots baseados na config do dentista selecionado (ou clinica como fallback)
- Filtra horarios ja ocupados naquele dia para aquele dentista
- Filtra horarios passados (se for hoje)
- Considera a duracao selecionada: um slot so aparece se ha espaco suficiente para a duracao completa

Exemplo: se duracao = 60min e intervalo = 15min, o slot 14:00 so aparece se 14:00, 14:15, 14:30 e 14:45 estiverem todos livres.

### 3. Auto-ajuste ao selecionar dentista

No `onValueChange` do Select de dentista:
- Buscar config em `dentistConfigs[dentistId]`
- Se existir, setar `formData.duration` para o `intervalo_padrao` do dentista
- Recalcular os slots disponiveis

## Alteracoes Tecnicas

### Arquivo: `src/pages/dashboard/Agenda.tsx`

**A. Linhas ~1321 (Select de dentista)** -- adicionar logica de auto-ajuste:
```typescript
onValueChange={(value) => {
  const dentistConfig = dentistConfigs[value];
  const defaultDuration = dentistConfig?.intervalo_padrao || 30;
  setFormData({
    ...formData,
    dentistId: value,
    duration: String(defaultDuration),
    time: "", // limpar horario pois slots mudam
  });
}}
```

**B. Linhas ~1363-1372 (Input de horario)** -- substituir por Select com slots calculados:
- Calcular slots usando `generateDynamicTimeSlots` com config do dentista selecionado
- Filtrar slots ocupados usando `isSlotOccupied` para o dentista e data
- Filtrar por espaco suficiente para a duracao escolhida
- Renderizar como `<Select>` com horarios disponiveis

**C. Linhas ~1375-1388 (Select de duracao)** -- substituir por componente de botoes:
- Botoes de selecao base: 15, 30, 45, 60
- Botoes de incremento: +15, +30, +60
- Ao mudar duracao, limpar `formData.time` para recalcular slots disponiveis

**D. Logica de filtragem de slots no formulario:**
Nova funcao `getFormAvailableSlots` que:
1. Pega config do dentista selecionado (ou clinica)
2. Gera todos os slots do dia selecionado
3. Remove slots ocupados
4. Remove slots passados
5. Remove slots onde nao cabe a duracao escolhida (verifica N slots consecutivos livres)

### Impacto na ocupacao existente

A logica `isSlotOccupied` (linhas 502-518) ja funciona corretamente com `duration_minutes`. Ao salvar com duracao de 60min, os 4 slots de 15min serao bloqueados na visualizacao da agenda. Nenhuma alteracao necessaria aqui.

## Resultado Esperado

- Dra Victoria (15min): formulario mostra slots de 15 em 15, default 15min
- Outros dentistas (30min): formulario mostra slots de 30 em 30, default 30min
- Consulta de 1h: bloqueia 4 slots de 15min (ou 2 de 30min) automaticamente
- Botoes +15/+30/+60 permitem duracao customizada (ex: 75min = 60+15)

