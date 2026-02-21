import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  clinicId: string;
  phone: string;
  messageType: 'confirmation' | 'reminder' | 'review' | 'campaign' | 'custom';
  appointmentData?: {
    patientName: string;
    date: string;
    time: string;
    procedure?: string;
    dentistName?: string;
  };
  customMessage?: string;
  googleReviewLink?: string;
  patientName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { clinicId, phone, messageType, appointmentData, customMessage, googleReviewLink, patientName }: WhatsAppRequest = await req.json();

    console.log('[SEND-WHATSAPP] Request received:', { clinicId, phone, messageType });

    // Buscar configuração do WhatsApp da clínica
    const { data: config, error: configError } = await supabase
      .from('whatsapp_config')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('ativo', true)
      .maybeSingle();

    if (configError || !config) {
      console.error('[SEND-WHATSAPP] Config not found:', configError);
      return new Response(
        JSON.stringify({ error: 'WhatsApp não configurado para esta clínica' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Formatar número de telefone
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length === 11 || formattedPhone.length === 10) {
      formattedPhone = '55' + formattedPhone;
    }

    // Montar mensagem baseada no tipo
    let message = '';
    
    if (messageType === 'confirmation' && appointmentData) {
      message = config.template_confirmacao || 
        `Olá ${appointmentData.patientName}! 🦷\n\nSua consulta está confirmada:\n📅 Data: ${appointmentData.date}\n⏰ Horário: ${appointmentData.time}\n${appointmentData.procedure ? `📋 Procedimento: ${appointmentData.procedure}\n` : ''}${appointmentData.dentistName ? `👨‍⚕️ Profissional: ${appointmentData.dentistName}\n` : ''}\nPor favor, chegue com 10 minutos de antecedência.\n\nResponda SIM para confirmar ou NÃO para reagendar.`;
      
      message = message
        .replace('{paciente}', appointmentData.patientName)
        .replace('{data}', appointmentData.date)
        .replace('{hora}', appointmentData.time)
        .replace('{procedimento}', appointmentData.procedure || '')
        .replace('{profissional}', appointmentData.dentistName || '');
        
    } else if (messageType === 'reminder' && appointmentData) {
      message = config.template_lembrete || 
        `Olá ${appointmentData.patientName}! 🦷\n\nLembramos que você tem uma consulta amanhã:\n📅 Data: ${appointmentData.date}\n⏰ Horário: ${appointmentData.time}\n\nConfirme sua presença respondendo SIM.\n\nCaso precise reagendar, entre em contato conosco.`;
      
      message = message
        .replace('{paciente}', appointmentData.patientName)
        .replace('{data}', appointmentData.date)
        .replace('{hora}', appointmentData.time)
        .replace('{procedimento}', appointmentData.procedure || '')
        .replace('{profissional}', appointmentData.dentistName || '');

    } else if (messageType === 'review') {
      const name = patientName || appointmentData?.patientName || 'Paciente';
      const link = googleReviewLink || '';
      message = `Olá ${name}! 😊\n\nObrigado por confiar em nós! Seu feedback é muito importante.\n\n⭐ Avalie nossa clínica no Google:\n${link}\n\nSua opinião nos ajuda a melhorar cada vez mais! 🙏`;
      
      message = message
        .replace('{paciente}', name)
        .replace('{link_review}', link);

    } else if (messageType === 'campaign' && customMessage) {
      message = customMessage;
      if (patientName) {
        message = message.replace('{paciente}', patientName);
      }
      if (googleReviewLink) {
        message = message.replace('{link_review}', googleReviewLink);
      }

    } else if (messageType === 'custom' && customMessage) {
      message = customMessage;
    } else {
      return new Response(
        JSON.stringify({ error: 'Tipo de mensagem inválido ou dados insuficientes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enviar mensagem via Z-API
    const zapiUrl = `https://api.z-api.io/instances/${config.instance_id}/token/${config.instance_token}/send-text`;
    
    console.log('[SEND-WHATSAPP] Sending to Z-API:', { phone: formattedPhone, messageType });

    const zapiResponse = await fetch(zapiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: formattedPhone, message }),
    });

    const zapiResult = await zapiResponse.json();
    console.log('[SEND-WHATSAPP] Z-API response:', zapiResult);

    if (!zapiResponse.ok) {
      console.error('[SEND-WHATSAPP] Z-API error:', zapiResult);

      // Log failure
      await supabase.from('whatsapp_message_log').insert({
        clinic_id: clinicId,
        phone: formattedPhone,
        message_type: messageType,
        status: 'failed',
        error_message: JSON.stringify(zapiResult),
      }).then(() => {});

      return new Response(
        JSON.stringify({ error: 'Erro ao enviar mensagem', details: zapiResult }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log success
    await supabase.from('whatsapp_message_log').insert({
      clinic_id: clinicId,
      phone: formattedPhone,
      message_type: messageType,
      status: 'sent',
      zapi_message_id: zapiResult.messageId,
    }).then(() => {});

    console.log('[SEND-WHATSAPP] Message sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: zapiResult.messageId,
        phone: formattedPhone 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[SEND-WHATSAPP] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
