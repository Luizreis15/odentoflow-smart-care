
# Plano: Corrigir Layout Mobile do Dashboard

## Problema Identificado

Analisando a screenshot (IMG_8096.png), identifico os seguintes problemas:

1. **Header Branco Redundante**: O `Navbar.tsx` esta sendo renderizado no mobile mostrando logo + icone de usuario
2. **Espaco em Branco**: Gap visivel entre o header branco e a area gradiente azul
3. **Saudacao Cortada**: O texto "Bom dia, X!" esta sendo cortado/oculto pelo hack de `-mt-16`
4. **Visual Amador**: Dois cabecalhos empilhados, sem integracao visual

## Causa Raiz

No `DashboardLayout.tsx` (linhas 213-215):
```typescript
<div className="lg:hidden">
  <Navbar user={user} />  // <-- Exibe header branco no mobile
</div>
```

E no `MobileHome.tsx` (linha 89):
```typescript
className="... -mt-16 ..."  // <-- Tenta compensar mas corta o conteudo
```

## Solucao Proposta

### Estrategia: Ocultar Navbar na Home Mobile

O `MobileHome` ja possui seu proprio header hero com gradiente, saudacao, e botoes de acao. O Navbar branco eh redundante e quebra o visual nativo.

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/DashboardLayout.tsx` | Condicional para ocultar Navbar na rota "/dashboard" mobile |
| `src/pages/mobile/MobileHome.tsx` | Remover hack de `-mt-16` e ajustar layout |

---

## Detalhes Tecnicos

### 1. DashboardLayout.tsx - Ocultar Navbar na Home

```typescript
const DashboardLayout = ({ children, user }: DashboardLayoutProps) => {
  const location = useLocation();
  // ...
  
  // Verificar se estamos na home do dashboard
  const isHomePage = location.pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-background">
      {/* ... impersonation banner ... */}

      {/* Navbar mobile - ocultar na home pois MobileHome tem proprio header */}
      {!isHomePage && (
        <div className="lg:hidden">
          <Navbar user={user} />
        </div>
      )}
      
      {/* Ajustar padding baseado se mostra Navbar ou nao */}
      <div className={cn(
        "flex", 
        impersonation ? "lg:pt-[44px]" : "lg:pt-0",
        // No mobile: sem padding-top na home (hero fullscreen), com padding nas outras paginas
        isHomePage ? "pt-0" : "pt-16"
      )}>
        {/* ... resto do layout ... */}
      </div>
      
      <MobileBottomNav user={user} />
    </div>
  );
};
```

### 2. MobileHome.tsx - Remover Hack e Ajustar Layout

```typescript
return (
  <div
    className="min-h-screen pb-24 overflow-y-auto overflow-x-hidden touch-pan-y"
    style={{ 
      width: '100vw', 
      maxWidth: '100vw', 
      touchAction: 'pan-y'
    }}
    onTouchStart={handleTouchStart}
    onTouchEnd={handleTouchEnd}
  >
    {/* Pull-to-refresh indicator */}
    {isRefreshing && (
      <div className="flex justify-center py-2 bg-[hsl(var(--flowdent-blue))]">
        <RefreshCw className="h-5 w-5 animate-spin text-white" />
      </div>
    )}

    {/* Hero Header with Gradient - agora ocupa topo da tela */}
    <div className="bg-gradient-to-br from-[hsl(var(--flowdent-blue))] via-[hsl(var(--flow-turquoise))] to-[hsl(var(--health-mint))] text-white pt-safe">
      {/* Safe area top para notch de iPhones */}
      <div className="px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm capitalize">{todayFormatted}</p>
            <h1 className="text-2xl font-bold mt-1">
              {getGreeting()}, {firstName}!
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* ... botoes ... */}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-3 mt-2">
          {/* ... pills de estatisticas ... */}
        </div>
      </div>
    </div>

    {/* Content com cantos arredondados */}
    <div className="w-full max-w-full space-y-6 bg-background rounded-t-3xl -mt-4 pt-6 relative z-10">
      <MobileQuickActions clinicId={clinicId} />
      <MobileAgendaList clinicId={clinicId} />
    </div>
  </div>
);
```

---

## Resultado Visual Esperado

### Antes (Atual)
```
┌────────────────────────┐
│ [Logo Flowdent]    [👤]│ ← Header branco (Navbar)
├────────────────────────┤
│                        │ ← Espaco em branco
├────────────────────────┤
│ ████████████████████████│
│ ██ [Hero cortado] ██████│ ← Saudacao invisivel
│ ██ 7 consultas hoje ████│
├────────────────────────┤
│ ACOES RAPIDAS          │
└────────────────────────┘
```

### Depois (Corrigido)
```
┌────────────────────────┐
│ ████████████████████████│
│ ██ Sexta, 31 janeiro ███│ ← Sem header branco
│ ██ Boa noite, Fulano! ██│ ← Saudacao visivel
│ ██ [🔄] [🔔]         ███│
│ ██ [7 consultas hoje] ██│
├────────────────────────┤
│ ACOES RAPIDAS          │
│ [Agendar] [Buscar]     │
│ [Receber] [Confirmar]  │
├────────────────────────┤
│ PROXIMOS ATENDIMENTOS  │
└────────────────────────┘
```

---

## Impacto em Outras Paginas

- **Agenda, Prontuario, Financeiro, etc**: Continuam mostrando o Navbar branco normalmente
- **Apenas a Home ("/dashboard")**: Usa o header hero integrado do MobileHome

## Beneficios

1. **Visual Nativo**: Hero fullscreen como apps modernos (Instagram, Uber, etc)
2. **Saudacao Visivel**: Texto "Bom dia, X!" aparece corretamente
3. **Sem Duplicacao**: Um unico cabecalho integrado
4. **Consistencia**: Usa os padroes de gradiente da marca Flowdent
5. **Safe Area**: Respeita notch de iPhones com `pt-safe` ou `pt-12`
