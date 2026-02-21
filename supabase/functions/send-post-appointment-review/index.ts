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

    const { appointmentId, clinicId, patientId } = await req.json();

    console.log('[POST-REVIEW] Request:', { appointmentId, clinicId, patientId });

    // Buscar google_review_link da clínica
    const { data: clinic, error: clinicError } = await supabase
      .from('clinicas')
      .select('google_review_link, nome')
      .eq('id', clinicId)
      .single();

    if (clinicError || !clinic?.google_review_link) {
      console.log('[POST-REVIEW] No Google Review link configured');
      return new Response(
        JSON.stringify({ skipped: true, reason: 'Google Review link não configurado' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar dados do paciente
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('nome, telefone')
      .eq('id', patientId)
      .single();

    if (patientError || !patient?.telefone) {
      console.log('[POST-REVIEW] Patient not found or no phone:', patientError);
      return new Response(
        JSON.stringify({ skipped: true, reason: 'Paciente sem telefone' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se a automação de review está ativa
    const { data: automation } = await supabase
      .from('whatsapp_automations')
      .select('is_active')
      .eq('clinic_id', clinicId)
      .eq('trigger_type', 'post_appointment')
      .maybeSingle();

    if (automation && !automation.is_active) {
      console.log('[POST-REVIEW] Automation disabled');
      return new Response(
        JSON.stringify({ skipped: true, reason: 'Automação desativada' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enviar via send-whatsapp
    const response = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        clinicId,
        phone: patient.telefone,
        messageType: 'review',
        patientName: patient.nome,
        googleReviewLink: clinic.google_review_link,
      }),
    });

    const result = await response.json();
    console.log('[POST-REVIEW] Result:', result);

    return new Response(
      JSON.stringify(result),
      { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[POST-REVIEW] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
