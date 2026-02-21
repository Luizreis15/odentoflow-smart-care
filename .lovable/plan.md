

# Corrigir 404 em "Meu Perfil"

## Causa Raiz

O erro 404 acontece por um **conflito de rota**:

- A sidebar, o header e o menu mobile navegam para `/dashboard/perfil`
- Mas a rota registrada no `DomainRouter.tsx` (linha 128) aponta para `/dashboard/profile` (em ingles)

Ou seja, a pagina ja existe e esta completa -- ela so nao esta acessivel porque a URL esta diferente.

## O que ja existe

A pagina "Meu Perfil" (`Perfil.tsx` + `PerfilWrapper.tsx`) ja esta **100% implementada** com 10 abas:

1. **Dados da Conta** -- nome, CPF, telefone, endereco com busca CEP, avatar
2. **E-mail e Notificacoes** -- preferencias de notificacao
3. **Seguranca** -- troca de senha, 2FA (placeholder), sessoes ativas
4. **Plano e Cobranca** -- informacoes do plano
5. **Contratos** -- contratos e assinaturas
6. **Preferencias** -- preferencias gerais
7. **Privacidade (LGPD)** -- configuracoes de privacidade
8. **Integracoes** -- conexoes com servicos externos
9. **Logs** -- logs de auditoria
10. **Encerramento** -- portabilidade e encerramento de conta

## Correcao Necessaria

Uma unica alteracao em **1 arquivo**:

### `src/components/DomainRouter.tsx`

Alterar a linha 128:

```
// DE:
<Route path="/dashboard/profile" element={<PerfilWrapper />} />

// PARA:
<Route path="/dashboard/perfil" element={<PerfilWrapper />} />
```

Isso alinha a rota com todas as navegacoes ja existentes no sistema (`DesktopSidebar`, `DesktopHeader`, `MobileDrawerMenu`).

## Validacao

Apos a correcao, clicar em "Meu Perfil" na sidebar, no header dropdown ou no menu mobile levara corretamente a pagina de perfil com todas as 10 abas funcionais.

