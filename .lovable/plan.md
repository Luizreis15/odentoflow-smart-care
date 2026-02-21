
# Correcao: Indicador de Agendamento na Ortodontia

## Problema Identificado

O codigo atual consulta a tabela `appointments` (agenda geral) para verificar agendamentos futuros dos pacientes de orto. Porem, os agendamentos ortodonticos ficam na tabela `ortho_appointments`, no campo `proxima_consulta_prevista`. Por isso, a query retorna vazio e todos aparecem como "Sem agendamento".

## Dados confirmados no banco

A consulta direta ao banco mostrou que existem 3 pacientes com `proxima_consulta_prevista` futura (21/03/2026), confirmando que o dado existe mas nao esta sendo lido.

## Solucao

Alterar a query de agendamentos em `src/pages/dashboard/Ortodontia.tsx` para consultar **ambas** as fontes:

1. **`ortho_appointments`** -- buscar o `proxima_consulta_prevista` mais recente por `case_id` (fonte principal para orto)
2. **`appointments`** -- manter como fallback (paciente pode ter agendamento na agenda geral)
3. Cruzar por `patient_id` e usar a data mais proxima entre as duas fontes

### Arquivo modificado: `src/pages/dashboard/Ortodontia.tsx`

Substituir a query atual que consulta apenas `appointments` por uma que:
- Busca de `ortho_appointments` agrupando por case_id/patient_id, filtrando `proxima_consulta_prevista >= hoje`
- Busca de `appointments` como esta hoje (fallback)
- Combina os resultados pegando a data mais proxima por paciente

### Sem alteracao no banco de dados
