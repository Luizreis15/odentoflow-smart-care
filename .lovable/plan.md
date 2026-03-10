

# Plano Padrão de Procedimentos para Novas Clínicas

## Contexto
Existem 334 procedimentos na tabela base `procedimentos`, mas nenhum plano padrão é criado automaticamente para novas clínicas. Isso significa que ao tentar criar orçamentos, o cliente não tem plano disponível para selecionar procedimentos.

## Solução

### 1. Criar plano padrão automaticamente no onboarding
Quando uma clínica é criada (em `Clinica.tsx` e `Profissional.tsx`), após inserir a clínica no banco, criar automaticamente um plano chamado **"Tabela Padrão"** em `planos_procedimentos` com `is_padrao = true`, e popular `planos_procedimentos_itens` com todos os 334 procedimentos da tabela base usando os valores originais (ajuste 0%).

### 2. Adicionar botão "Habilitar Tabela Padrão" na aba de Procedimentos
No `ProcedimentosTab.tsx`, quando a clínica não tem nenhum plano cadastrado, exibir um card/banner com a opção de **"Habilitar Tabela Padrão"** que cria o plano com os 334 procedimentos base. Isso cobre clínicas existentes que ainda não têm plano.

### 3. Atualizar a clínica atual via banco
Inserir o plano padrão para a clínica `Momento Sorriso` (do teste atual) diretamente no banco.

## Arquivos a modificar

- **`src/pages/onboarding/Clinica.tsx`** — Após criar a clínica, chamar função para criar plano padrão
- **`src/pages/onboarding/Profissional.tsx`** — Mesmo ajuste para fluxo liberal
- **`src/components/configuracoes/ProcedimentosTab.tsx`** — Adicionar botão "Habilitar Tabela Padrão" quando não há planos, e função `criarPlanoPadrao(clinicaId)`
- **Banco de dados** — Inserir plano padrão para clínica existente

## Fluxo do usuário

1. **Novo cliente**: Onboarding cria clínica + plano padrão automaticamente
2. **Cliente existente sem plano**: Vê banner "Habilitar Tabela Padrão" na aba Procedimentos
3. **Personalização**: Cliente pode criar planos adicionais ou editar o padrão a qualquer momento

