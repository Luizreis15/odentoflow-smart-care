

# Configurar STRIPE_WEBHOOK_SECRET

O signing secret do webhook foi recebido. Preciso salvá-lo como secret no backend para que a Edge Function `stripe-webhook` possa validar as assinaturas dos eventos.

## Ação

1. Salvar o secret `STRIPE_WEBHOOK_SECRET` com o valor `whsec_vrakukxzQ9cUx63xcs0RcvMJomSYz6fN` no backend
2. A Edge Function `stripe-webhook` já está preparada para ler esse secret via `Deno.env.get("STRIPE_WEBHOOK_SECRET")` — nenhuma mudança de código necessária

Isso completa a configuração do webhook Stripe. Após salvar, eventos de assinatura (criação, atualização, cancelamento, falha de pagamento) serão validados e processados automaticamente.

