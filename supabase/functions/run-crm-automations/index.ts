import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[RUN-AUTOMATIONS] Starting daily automations check');

    // 1. Buscar campanhas agendadas prontas para envio
    const { data: scheduledCampaigns } = await supabase
      .from('whatsapp_campaigns')
      .select('id')
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString());

    console.log(`[RUN-AUTOMATIONS] Found ${scheduledCampaigns?.length || 0} scheduled campaigns`);

    for (const campaign of (scheduledCampaigns || [])) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-campaign-messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ campaignId: campaign.id }),
        });
        console.log(`[RUN-AUTOMATIONS] Triggered campaign: ${campaign.id}`);
      } catch (err) {
        console.error(`[RUN-AUTOMATIONS] Error triggering campaign ${campaign.id}:`, err);
      }
    }

    // 2. Buscar automações ativas por clínica
    const { data: automations } = await supabase
      .from('whatsapp_automations')
      .select('*, clinicas:clinic_id(id, google_review_link)')
      .eq('is_active', true)
      .in('trigger_type', ['recall', 'birthday']);

    console.log(`[RUN-AUTOMATIONS] Found ${automations?.length || 0} active automations`);

    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    for (const auto of (automations || [])) {
      try {
        const clinicId = auto.clinic_id;

        if (auto.trigger_type === 'birthday') {
          // Buscar pacientes que fazem aniversário hoje
          const { data: patients } = await supabase
            .from('patients')
            .select('id, nome, telefone, data_nascimento')
            .eq('clinic_id', clinicId)
            .not('telefone', 'is', null)
            .not('data_nascimento', 'is', null);

          const birthdayPatients = (patients || []).filter((p: any) => {
            if (!p.data_nascimento) return false;
            const dob = new Date(p.data_nascimento);
            return dob.getMonth() + 1 === todayMonth && dob.getDate() === todayDay;
          });

          console.log(`[RUN-AUTOMATIONS] Clinic ${clinicId}: ${birthdayPatients.length} birthdays today`);

          for (const patient of birthdayPatients) {
            // Verificar se já enviou hoje
            const todayStr = today.toISOString().split('T')[0];
            const { data: existing } = await supabase
              .from('whatsapp_message_log')
              .select('id')
              .eq('clinic_id', clinicId)
              .eq('phone', (patient as any).telefone)
              .eq('message_type', 'campaign')
              .gte('created_at', todayStr)
              .maybeSingle();

            if (existing) continue;

            let msg = auto.message_template.replace('{paciente}', (patient as any).nome);

            await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({
                clinicId,
                phone: (patient as any).telefone,
                messageType: 'campaign',
                customMessage: msg,
                patientName: (patient as any).nome,
              }),
            });

            // Rate limit
            await new Promise(r => setTimeout(r, 1000));
          }
        }

        if (auto.trigger_type === 'recall') {
          const monthsAfter = auto.trigger_config?.months_after || 6;
          const cutoffDate = new Date();
          cutoffDate.setMonth(cutoffDate.getMonth() - monthsAfter);
          const cutoffStr = cutoffDate.toISOString();

          // Pacientes com última consulta antes do cutoff
          const { data: patients } = await supabase
            .from('patients')
            .select('id, nome, telefone, updated_at')
            .eq('clinic_id', clinicId)
            .not('telefone', 'is', null)
            .lt('updated_at', cutoffStr)
            .limit(50);

          console.log(`[RUN-AUTOMATIONS] Clinic ${clinicId}: ${patients?.length || 0} recall patients`);

          for (const patient of (patients || [])) {
            const todayStr = today.toISOString().split('T')[0];
            const { data: existing } = await supabase
              .from('whatsapp_message_log')
              .select('id')
              .eq('clinic_id', clinicId)
              .eq('phone', (patient as any).telefone)
              .eq('message_type', 'campaign')
              .gte('created_at', todayStr)
              .maybeSingle();

            if (existing) continue;

            let msg = auto.message_template.replace('{paciente}', (patient as any).nome);

            await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({
                clinicId,
                phone: (patient as any).telefone,
                messageType: 'campaign',
                customMessage: msg,
                patientName: (patient as any).nome,
              }),
            });

            await new Promise(r => setTimeout(r, 1000));
          }
        }
      } catch (err) {
        console.error(`[RUN-AUTOMATIONS] Error in automation ${auto.id}:`, err);
      }
    }

    console.log('[RUN-AUTOMATIONS] Done');

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[RUN-AUTOMATIONS] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
