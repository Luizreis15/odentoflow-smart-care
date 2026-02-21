import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { campaignId } = await req.json();

    if (!campaignId) {
      return new Response(
        JSON.stringify({ error: 'campaignId é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[SEND-CAMPAIGN] Starting campaign:', campaignId);

    // Buscar campanha
    const { data: campaign, error: campaignError } = await supabase
      .from('whatsapp_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ error: 'Campanha não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Atualizar status para sending
    await supabase
      .from('whatsapp_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaignId);

    // Buscar recipients pendentes
    const { data: recipients, error: recipError } = await supabase
      .from('whatsapp_campaign_recipients')
      .select('*, patients:patient_id(nome)')
      .eq('campaign_id', campaignId)
      .eq('status', 'pending');

    if (recipError) {
      console.error('[SEND-CAMPAIGN] Error fetching recipients:', recipError);
      throw recipError;
    }

    let sentCount = 0;
    let failCount = 0;

    for (const recipient of (recipients || [])) {
      try {
        const patientName = (recipient as any).patients?.nome || 'Paciente';

        // Chamar send-whatsapp
        const response = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            clinicId: campaign.clinic_id,
            phone: recipient.phone,
            messageType: 'campaign',
            customMessage: campaign.message_template,
            patientName,
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          await supabase
            .from('whatsapp_campaign_recipients')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', recipient.id);
          sentCount++;
        } else {
          await supabase
            .from('whatsapp_campaign_recipients')
            .update({ status: 'failed', error_message: result.error || 'Erro desconhecido' })
            .eq('id', recipient.id);
          failCount++;
        }
      } catch (err) {
        await supabase
          .from('whatsapp_campaign_recipients')
          .update({ status: 'failed', error_message: String(err) })
          .eq('id', recipient.id);
        failCount++;
      }

      // Rate limit: 1 msg/segundo
      await sleep(1000);
    }

    // Atualizar campanha
    await supabase
      .from('whatsapp_campaigns')
      .update({
        status: 'completed',
        sent_count: sentCount,
      })
      .eq('id', campaignId);

    console.log(`[SEND-CAMPAIGN] Done. Sent: ${sentCount}, Failed: ${failCount}`);

    return new Response(
      JSON.stringify({ success: true, sentCount, failCount }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[SEND-CAMPAIGN] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
