
# Nova Tela de Login Desktop Premium -- Flowdent

## Resumo
Reescrever completamente o `Auth.tsx` removendo o carrossel de depoimentos e implementando um layout Enterprise SaaS de duas colunas: coluna institucional (esquerda, 60%) com identidade do software e coluna de login (direita, 40%) com card centralizado.

## O Que Sera Removido
- Importacao e uso do `TestimonialCarousel`
- Toda a metade direita atual (gradiente + carrossel)
- Decoracao mobile com emoji de dente
- Header com gradiente mobile

## Nova Estrutura Visual

```text
+--------------------------------------------+---------------------------+
|                                            |                           |
|  COLUNA INSTITUCIONAL (60%)                |  COLUNA LOGIN (40%)       |
|  Fundo: gradiente azul -> teal             |  Fundo: #F5F7FA           |
|                                            |                           |
|  [Logo Flowdent - branco, grande]          |  +---------------------+  |
|                                            |  | Card branco         |  |
|  "Gestao Odontologica Inteligente"         |  |                     |  |
|  "Controle clinico, financeiro e           |  | Acessar sua conta   |  |
|   operacional em um unico sistema."        |  | Entre para continuar|  |
|                                            |  |                     |  |
|  * Agenda inteligente                      |  | [Email]             |  |
|  * Gestao financeira integrada             |  | [Senha]             |  |
|  * Controle clinico completo               |  | [Entrar]            |  |
|                                            |  |                     |  |
|  ---                                       |  | Esqueceu a senha?   |  |
|  Ambiente seguro e criptografado           |  +---------------------+  |
|  Disponivel 24h                            |                           |
|                                            |         Flowdent v3.2     |
+--------------------------------------------+---------------------------+
```

## Detalhes Tecnicos

### Arquivo Modificado: `src/pages/Auth.tsx`
Reescrita completa do JSX mantendo toda a logica existente (signin, forgot password, reset password, redirect):

1. **Layout raiz**: `min-h-screen flex` sem scroll
2. **Coluna esquerda (60%)**: `w-[60%]` com gradiente `from-[hsl(var(--flowdent-blue))] to-[hsl(var(--flow-turquoise))]` e overlay escuro 15%. Conteudo centralizado verticalmente:
   - Logo Flowdent (branco, h-16)
   - Headline "Gestao Odontologica Inteligente" (28px, bold, branco)
   - Subheadline descritiva (16px, branco/80%)
   - 3 pilares com icones Lucide minimalistas (Calendar, DollarSign, ClipboardList)
   - Rodape inferior discreto com cadeado + "Ambiente seguro"
3. **Coluna direita (40%)**: Fundo `#F5F7FA`, card branco centralizado max-w-[420px], border-radius 16px, sombra suave, padding 32px
   - Titulo "Acessar sua conta"
   - Subtexto "Entre para continuar"
   - Campos com h-12, border-radius 12px, labels acima
   - Botao primario h-12, w-full, border-radius 12px
   - Link "Esqueceu sua senha?" discreto
4. **Versao**: Badge "Flowdent v3.2" no canto superior direito
5. **Responsividade**:
   - Abaixo de 1024px: coluna esquerda 40%, login 60%
   - Abaixo de 768px: layout vertical, topo institucional compacto + login abaixo

### Arquivo Removido da Importacao
- `TestimonialCarousel` nao sera mais importado (o arquivo pode permanecer caso seja usado em outro lugar)

### Sem Animacoes
- Zero framer-motion na tela de login
- Zero carrossel
- Zero transicoes automaticas
- Layout estatico e estavel

### Cores Utilizadas
- Primaria: `--flowdent-blue` (#0A4D8C)
- Secundaria: `--flow-turquoise` (#00B4D8)
- Fundo card: `#FFFFFF`
- Fundo coluna direita: `#F5F7FA`
- Texto: `--slate-gray`
- Erro: `red-500` com opacidade controlada
