import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  name: string;
  email: string;
  role?: string;
  clinicName?: string;
  isOwner?: boolean;
}

// Template HTML premium para boas-vindas
const generateWelcomeEmailHtml = (
  name: string,
  email: string,
  roleName: string,
  clinicName: string,
  isOwner: boolean,
  appUrl: string
) => `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao Flowdent</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
      <tr>
        <td align="center" style="padding: 40px 20px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);">
            <!-- Header Premium -->
            <tr>
              <td style="background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
                <div style="font-size: 40px; margin-bottom: 8px;">🦷</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">FLOWDENT</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Sistema de Gestão Odontológica</p>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #18181b; margin: 0 0 24px 0; font-size: 24px; font-weight: 700;">Bem-vindo(a) ao Flowdent! 🎉</h2>
                
                <p style="color: #3f3f46; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                  Olá <strong style="color: #0D9488;">${name}</strong>,
                </p>
                
                ${isOwner ? `
                <p style="color: #3f3f46; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                  Parabéns! Sua conta no <strong>Flowdent</strong> foi criada com sucesso${clinicName ? ` para a clínica <strong>${clinicName}</strong>` : ''}.
                </p>
                <p style="color: #3f3f46; font-size: 16px; line-height: 1.7; margin: 0 0 28px 0;">
                  Você está pronto para revolucionar a gestão da sua clínica odontológica!
                </p>
                ` : `
                <p style="color: #3f3f46; font-size: 16px; line-height: 1.7; margin: 0 0 28px 0;">
                  Você foi adicionado ${clinicName ? `à clínica <strong>${clinicName}</strong>` : 'ao sistema'} como <strong>${roleName}</strong>.
                </p>
                `}
                
                <!-- Card de Informações -->
                <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border-radius: 12px; padding: 24px; margin: 0 0 28px 0; border: 1px solid #99f6e4;">
                  <div style="display: flex; align-items: center;">
                    <span style="font-size: 20px; margin-right: 12px;">📧</span>
                    <div>
                      <p style="color: #0F766E; font-size: 12px; font-weight: 600; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">SEU EMAIL DE ACESSO</p>
                      <p style="color: #0D9488; font-size: 16px; font-weight: 600; margin: 0;">${email}</p>
                    </div>
                  </div>
                </div>
                
                ${isOwner ? `
                <!-- Features Box -->
                <div style="background-color: #f4f4f5; padding: 24px; border-radius: 12px; margin: 0 0 28px 0;">
                  <p style="color: #18181b; font-size: 15px; font-weight: 700; margin: 0 0 16px 0;">✨ Com o Flowdent você pode:</p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="padding: 8px 0;">
                        <span style="color: #0D9488; font-size: 16px; margin-right: 8px;">📅</span>
                        <span style="color: #3f3f46; font-size: 14px;">Gerenciar sua agenda de forma inteligente</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;">
                        <span style="color: #0D9488; font-size: 16px; margin-right: 8px;">📋</span>
                        <span style="color: #3f3f46; font-size: 14px;">Prontuário eletrônico completo</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;">
                        <span style="color: #0D9488; font-size: 16px; margin-right: 8px;">💰</span>
                        <span style="color: #3f3f46; font-size: 14px;">Controle financeiro detalhado</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;">
                        <span style="color: #0D9488; font-size: 16px; margin-right: 8px;">📱</span>
                        <span style="color: #3f3f46; font-size: 14px;">Comunicação automatizada com pacientes</span>
                      </td>
                    </tr>
                  </table>
                </div>
                ` : ''}
                
                <p style="color: #3f3f46; font-size: 16px; line-height: 1.7; margin: 0 0 32px 0;">
                  Para acessar o sistema, clique no botão abaixo:
                </p>
                
                <!-- CTA Button Premium -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="padding: 0 0 24px 0;">
                      <a href="${appUrl}/auth" 
                         style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); color: #ffffff; padding: 18px 48px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 8px 24px rgba(13, 148, 136, 0.4); transition: all 0.2s;">
                        Acessar Flowdent
                      </a>
                    </td>
                  </tr>
                </table>
                
                <!-- Aviso de Segurança -->
                <div style="border-top: 1px solid #e4e4e7; padding-top: 24px;">
                  <p style="color: #71717a; font-size: 13px; line-height: 1.6; margin: 0;">
                    🔒 Se você não solicitou este acesso, por favor ignore este email.
                  </p>
                </div>
              </td>
            </tr>
            
            <!-- Footer Premium -->
            <tr>
              <td style="background: linear-gradient(135deg, #f4f4f5 0%, #e4e4e7 100%); padding: 28px 30px; border-radius: 0 0 16px 16px; text-align: center;">
                <p style="color: #71717a; font-size: 14px; margin: 0 0 8px 0; font-weight: 500;">
                  © ${new Date().getFullYear()} Flowdent. Todos os direitos reservados.
                </p>
                <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                  <a href="https://flowdent.com.br" style="color: #0D9488; text-decoration: none; font-weight: 500;">flowdent.com.br</a>
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, role, clinicName, isOwner }: WelcomeEmailRequest = await req.json();

    console.log(`[SEND-WELCOME] Sending email to ${email}, isOwner: ${isOwner}`);

    const roleNames: Record<string, string> = {
      admin: "Administrador",
      dentista: "Cirurgião-Dentista",
      assistente: "Assistente",
      recepcao: "Recepcionista",
    };

    const roleName = role ? (roleNames[role] || role) : "";
    const appUrl = Deno.env.get("APP_URL") || "https://flowdent.com.br";

    // Email diferenciado para dono de clínica vs membro convidado
    const subject = isOwner 
      ? "🎉 Bem-vindo ao Flowdent! Sua conta foi criada" 
      : `🦷 Bem-vindo ao Flowdent - ${clinicName}`;

    const { error } = await resend.emails.send({
      from: "Flowdent <noreply@flowdent.com.br>",
      to: [email],
      subject,
      html: generateWelcomeEmailHtml(
        name,
        email,
        roleName,
        clinicName || "",
        isOwner || false,
        appUrl
      ),
    });

    if (error) {
      console.error("[SEND-WELCOME] Error sending email:", error);
      throw error;
    }

    console.log("[SEND-WELCOME] Email sent successfully");

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[SEND-WELCOME] ERROR:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
