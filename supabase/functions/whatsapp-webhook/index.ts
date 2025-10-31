import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // GET - Webhook verification
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      console.log('Webhook verification request:', { mode, token, challenge });

      if (mode === 'subscribe' && token) {
        // Verificar se o token existe em alguma configuração
        const { data: config } = await supabase
          .from('whatsapp_configs')
          .select('*')
          .eq('webhook_verify_token', token)
          .eq('is_active', true)
          .maybeSingle();

        if (config) {
          console.log('Webhook verified successfully');
          return new Response(challenge, { status: 200 });
        }
      }

      return new Response('Verification failed', { status: 403 });
    }

    // POST - Receber mensagens
    if (req.method === 'POST') {
      const body = await req.json();
      console.log('Webhook received:', JSON.stringify(body, null, 2));

      // Processar cada entrada do webhook
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            const value = change.value;

            // Processar mensagens recebidas
            for (const message of value.messages || []) {
              await processIncomingMessage(supabase, message, value.metadata);
            }

            // Processar status de mensagens
            for (const status of value.statuses || []) {
              await updateMessageStatus(supabase, status);
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response('Method not allowed', { status: 405 });
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function processIncomingMessage(supabase: any, message: any, metadata: any) {
  try {
    const phone = message.from;
    const phoneNumberId = metadata.phone_number_id;

    // Buscar configuração da clínica
    const { data: config } = await supabase
      .from('whatsapp_configs')
      .select('clinica_id')
      .eq('phone_number_id', phoneNumberId)
      .eq('is_active', true)
      .maybeSingle();

    if (!config) {
      console.log('No active config found for phone_number_id:', phoneNumberId);
      return;
    }

    // Criar ou buscar contato
    let { data: contact } = await supabase
      .from('crm_contacts')
      .select('*')
      .eq('clinica_id', config.clinica_id)
      .eq('phone', phone)
      .maybeSingle();

    if (!contact) {
      const { data: newContact, error: contactError } = await supabase
        .from('crm_contacts')
        .insert({
          clinica_id: config.clinica_id,
          phone: phone,
          name: message.profile?.name || phone
        })
        .select()
        .single();

      if (contactError) throw contactError;
      contact = newContact;
    }

    // Buscar ou criar conversa
    let { data: conversation } = await supabase
      .from('crm_conversations')
      .select('*')
      .eq('contact_id', contact.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!conversation) {
      const { data: newConv, error: convError } = await supabase
        .from('crm_conversations')
        .insert({
          clinica_id: config.clinica_id,
          contact_id: contact.id,
          status: 'pending',
          last_message_at: new Date().toISOString(),
          unread_count: 1
        })
        .select()
        .single();

      if (convError) throw convError;
      conversation = newConv;
    } else {
      // Atualizar conversa existente
      await supabase
        .from('crm_conversations')
        .update({
          last_message_at: new Date().toISOString(),
          unread_count: conversation.unread_count + 1
        })
        .eq('id', conversation.id);
    }

    // Salvar mensagem
    const messageContent = message.text?.body || 
                          message.image?.caption || 
                          message.document?.caption || 
                          '[Mídia]';

    await supabase
      .from('crm_messages')
      .insert({
        conversation_id: conversation.id,
        whatsapp_message_id: message.id,
        content: messageContent,
        is_from_me: false,
        message_type: message.type || 'text',
        media_url: message.image?.id || message.document?.id || message.audio?.id || null,
        status: 'received'
      });

    console.log('Message processed successfully');
  } catch (error) {
    console.error('Error processing message:', error);
  }
}

async function updateMessageStatus(supabase: any, status: any) {
  try {
    await supabase
      .from('crm_messages')
      .update({ status: status.status })
      .eq('whatsapp_message_id', status.id);
  } catch (error) {
    console.error('Error updating message status:', error);
  }
}
