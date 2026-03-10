UPDATE public.clinicas 
SET 
  current_period_end = NOW() + INTERVAL '30 days',
  status_assinatura = 'trialing'
WHERE status_assinatura IN ('trialing', 'expired') 
  OR status_assinatura IS NULL;