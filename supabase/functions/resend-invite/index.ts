import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResendInviteRequest {
  userId: string;
  clinicaId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { userId, clinicaId }: ResendInviteRequest = await req.json();

    if (!userId || !clinicaId) {
      return new Response(
        JSON.stringify({ error: "userId e clinicaId são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar dados do usuário
    const { data: usuario, error: userError } = await supabaseAdmin
      .from("usuarios")
      .select("nome, email, perfil")
      .eq("id", userId)
      .eq("clinica_id", clinicaId)
      .single();

    if (userError || !usuario) {
      console.error("Erro ao buscar usuário:", userError);
      return new Response(
        JSON.stringify({ error: "Usuário não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar nome da clínica
    const { data: clinica } = await supabaseAdmin
      .from("clinicas")
      .select("nome")
      .eq("id", clinicaId)
      .single();

    const clinicName = clinica?.nome || "Flowdent";

    // Gerar link de recuperação de senha
    const origin = Deno.env.get("APP_URL") || "https://odentoflow-smart-care.lovable.app";
    
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: usuario.email,
      options: {
        redirectTo: `${origin}/auth?reset=true`
      }
    });

    if (linkError || !linkData) {
      console.error("Erro ao gerar link:", linkError);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar link de acesso" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resetLink = linkData.properties?.action_link;

    // Mapeamento de perfis para português
    const roleLabels: Record<string, string> = {
      admin: "Administrador",
      recepcionista: "Recepcionista",
      asb: "ASB",
      cirurgiao_dentista: "Cirurgião-Dentista",
      dentista: "Dentista",
      recepcao: "Recepção",
      assistente: "Assistente"
    };

    const roleLabel = roleLabels[usuario.perfil] || usuario.perfil;

    // Email HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Flowdent</h1>
                    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Sistema de Gestão Odontológica</p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 22px;">Olá, ${usuario.nome}!</h2>
                    
                    <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Você foi convidado(a) para fazer parte da equipe da clínica <strong>${clinicName}</strong> no Flowdent.
                    </p>
                    
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9fafb; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">Seu perfil de acesso:</p>
                          <p style="margin: 0; color: #0D9488; font-size: 18px; font-weight: 600;">${roleLabel}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Para começar a usar o sistema, clique no botão abaixo e crie sua senha de acesso:
                    </p>
                    
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center">
                          <a href="${resetLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(13, 148, 136, 0.3);">
                            Definir Minha Senha
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                      Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                      <a href="${resetLink}" style="color: #0D9488; word-break: break-all;">${resetLink}</a>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      Este é um email automático do Flowdent. Por favor, não responda.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Enviar email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Flowdent <noreply@flowdent.com.br>",
        to: [usuario.email],
        subject: `Bem-vindo(a) ao Flowdent - ${clinicName}`,
        html: htmlContent,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Erro ao enviar email:", emailResult);
      return new Response(
        JSON.stringify({ error: "Erro ao enviar email: " + (emailResult.message || "Falha no envio") }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email de convite reenviado com sucesso:", emailResult);

    return new Response(
      JSON.stringify({ success: true, message: "Convite reenviado com sucesso" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Erro ao reenviar convite:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
