
# Reorganizar Sidebar Desktop e Mobile em Grupos Visuais

## Resumo
Reorganizar os itens de navegacao da sidebar desktop (`DesktopSidebar.tsx`) e do menu mobile (`MobileDrawerMenu.tsx`) em grupos tematicos com labels visuais e separadores, seguindo uma hierarquia logica: Operacional > Controle > Gestao > Sistema.

## Nova Organizacao dos Grupos

```text
OPERACIONAL
  Dashboard
  Agenda
  Pacientes

CONTROLE CLINICO
  Ortodontia
  Proteses
  Estoque (com sub-itens)

GESTAO E RELATORIOS
  Financeiro
  CRM
  Relatorios

FERRAMENTAS
  Portal Paciente
  IA Assistente

--- separador ---
  Configuracoes
  Meu Perfil
```

Cada grupo tera:
- Label em texto pequeno, uppercase, cor discreta (ex: `text-xs font-semibold text-sidebar-foreground/40 tracking-wider`)
- Separador visual (linha fina) entre os grupos
- Espacamento generoso entre secoes

## Detalhes Tecnicos

### Arquivo: `src/components/desktop/DesktopSidebar.tsx`
- Substituir o array flat `mainNavigation` por um array de grupos `navGroups[]`, cada um com `title` e `items`
- Renderizar cada grupo com label + itens + separador
- Manter toda a logica existente de sub-itens (Estoque) e active state
- Os itens de `bottomNavigation` (Configuracoes, Perfil) continuam fixos no rodape

### Arquivo: `src/components/mobile/MobileDrawerMenu.tsx`
- Atualizar `menuCategories` para refletir exatamente a mesma organizacao de grupos
- Adicionar Ortodontia (atualmente ausente no mobile)
- Manter a mesma estrutura visual que ja existe (labels + separadores)

### Nenhum arquivo novo sera criado
### Nenhuma rota sera alterada
