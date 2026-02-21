
# Ortodontia: Lista Compacta com Indicador de Agendamento

## O que muda

Trocar o layout atual de **cards grandes em grid** por uma **lista compacta em tabela/linhas**, ordenada alfabeticamente pelo nome do paciente. Cada linha mostra as informacoes essenciais de forma condensada e inclui um indicador visual claro de "agendado" ou "sem agendamento futuro".

## Layout proposto (uma linha por caso)

```text
| Nome Paciente     | Tipo         | Profissional   | Status  | Progresso | Agendamento        |
|-------------------|-------------|----------------|---------|-----------|---------------------|
| Ana Silva         | Ap. Fixo    | Dr. Carlos     | Ativo   | 8/24m     | 15/03 - 14:00  (verde) |
| Bruno Costa       | Alinhadores | Dra. Maria     | Ativo   | 3/18m     | Sem agendamento (vermelho) |
```

- Indicador verde com data do proximo agendamento quando existe
- Indicador vermelho "Sem agendamento" quando nao ha consulta futura
- Ordem alfabetica por nome do paciente

## Novo filtro: Agendamento

Adicionar um Select ao lado dos filtros existentes:
- **Todos**
- **Com agendamento** (tem consulta futura)
- **Sem agendamento** (alerta para recepcionista agendar)

## Implementacao tecnica

### Arquivo modificado: `src/pages/dashboard/Ortodontia.tsx`

1. **Nova query**: buscar o proximo agendamento futuro de cada paciente de orto
   - Query na tabela `appointments` onde `patient_id` esta nos pacientes dos casos e `appointment_date > now()` e `status` nao e cancelado
   - Agrupar por `patient_id` pegando o `MIN(appointment_date)` mais proximo

2. **Ordenacao**: trocar `order("created_at")` para ordenar no frontend por `patient.full_name` alfabeticamente

3. **Layout**: substituir o grid de cards por uma lista compacta usando `Card` com linhas horizontais (cada linha = 1 caso, informacoes lado a lado em flex row)

4. **Filtro de agendamento**: novo state `filtroAgendamento` com opcoes "todos", "com_agendamento", "sem_agendamento"

5. **Indicador visual**: Badge verde "dd/MM HH:mm" ou Badge vermelha "Sem agendamento" na extremidade direita de cada linha

### Dados

A query de agendamentos futuros sera feita em paralelo com a query de casos via `useQuery` separado, cruzando `patient_id` no frontend para determinar quem tem ou nao agendamento.

### Sem alteracao no banco de dados
Tudo usa tabelas existentes (`ortho_cases`, `appointments`, `patients`, `profissionais`).
