import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Armazenamento temporário de sessões em memória
const activeSessions = new Map();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { clinica_id } = await req.json();

    if (!clinica_id) {
      throw new Error('clinica_id é obrigatório');
    }

    // Verificar se já existe uma configuração
    const { data: existingConfig } = await supabase
      .from('whatsapp_configs')
      .select('*')
      .eq('clinica_id', clinica_id)
      .eq('connection_type', 'web_qrcode')
      .maybeSingle();

    // Se já está conectado, retornar sucesso
    if (existingConfig && (existingConfig as any).connected_at) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Já conectado',
          connected: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gerar QR Code simulado (na produção real, você usaria uma biblioteca como @whiskeysockets/baileys)
    // Por ora, geramos um QR code de demonstração
    const qrData = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=WHATSAPP_CONNECT_${clinica_id}_${Date.now()}`;

    // Criar ou atualizar configuração
    await supabase
      .from('whatsapp_configs')
      .upsert({
        clinica_id: clinica_id,
        connection_type: 'web_qrcode',
        qr_code: qrData,
        is_active: false,
      });

    // Simular conexão após 10 segundos (em produção, isso seria feito pela biblioteca baileys)
    setTimeout(async () => {
      await supabase
        .from('whatsapp_configs')
        .update({
          connected_at: new Date().toISOString(),
          is_active: true,
          qr_code: null,
        })
        .eq('clinica_id', clinica_id);
    }, 10000);

    return new Response(
      JSON.stringify({ 
        success: true, 
        qr_code: qrData,
        message: 'QR Code gerado. Escaneie com seu WhatsApp.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
