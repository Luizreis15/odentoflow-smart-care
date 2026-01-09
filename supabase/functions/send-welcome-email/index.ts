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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, role, clinicName, isOwner }: WelcomeEmailRequest = await req.json();

    console.log(`[SEND-WELCOME] Sending email to ${email}, isOwner: ${isOwner}`);

    const roleNames: Record<string, string> = {
      admin: "Administrador",
      dentista: "Dentista",
      assistente: "Assistente",
      recepcao: "Recepcionista",
    };

    const roleName = role ? (roleNames[role] || role) : "";
    const appUrl = Deno.env.get("APP_URL") || "https://flowdent.com.br";

    // Email diferenciado para dono de clínica vs membro convidado
    const subject = isOwner 
      ? "Bem-vindo ao Flowdent! Sua conta foi criada" 
      : `Bem-vindo ao Flowdent - ${clinicName}`;

    const contentIntro = isOwner
      ? `
        <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
          Parabéns! Sua conta no <strong>Flowdent</strong> foi criada com sucesso${clinicName ? ` para a clínica <strong>${clinicName}</strong>` : ''}.
        </p>
        <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
          Você está pronto para revolucionar a gestão da sua clínica odontológica!
        </p>
      `
      : `
        <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
          Você foi adicionado ${clinicName ? `à clínica <strong>${clinicName}</strong>` : 'ao sistema'} como <strong>${roleName}</strong>.
        </p>
      `;

    const { error } = await resend.emails.send({
      from: "Flowdent <noreply@flowdent.com.br>",
      to: [email],
      subject,
      html: `
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
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Flowdent</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Sistema de Gestão Odontológica</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="color: #18181b; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">Bem-vindo(a) ao Flowdent! 🎉</h2>
                        
                        <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                          Olá <strong>${name}</strong>,
                        </p>
                        
                        ${contentIntro}
                        
                        <!-- Info Box -->
                        <div style="background-color: #f0f9ff; border-left: 4px solid #0EA5E9; padding: 16px; border-radius: 0 8px 8px 0; margin: 0 0 24px 0;">
                          <p style="color: #0369a1; font-size: 14px; margin: 0;">
                            <strong>Seu email de acesso:</strong><br>
                            ${email}
                          </p>
                        </div>
                        
                        ${isOwner ? `
                        <!-- Features Box -->
                        <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; margin: 0 0 24px 0;">
                          <p style="color: #18181b; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Com o Flowdent você pode:</p>
                          <ul style="color: #3f3f46; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                            <li>Gerenciar sua agenda de forma inteligente</li>
                            <li>Prontuário eletrônico completo</li>
                            <li>Controle financeiro detalhado</li>
                            <li>Comunicação automatizada com pacientes</li>
                          </ul>
                        </div>
                        ` : ''}
                        
                        <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                          Para acessar o sistema, clique no botão abaixo:
                        </p>
                        
                        <!-- Button -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="center" style="padding: 0 0 30px 0;">
                              <a href="${appUrl}/auth" 
                                 style="display: inline-block; background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4);">
                                Acessar Flowdent
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Security Notice -->
                        <div style="border-top: 1px solid #e4e4e7; padding-top: 20px;">
                          <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 0;">
                            Se você não solicitou este acesso, por favor ignore este email.
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f4f4f5; padding: 24px 30px; border-radius: 0 0 12px 12px; text-align: center;">
                        <p style="color: #71717a; font-size: 14px; margin: 0 0 8px 0;">
                          © ${new Date().getFullYear()} Flowdent. Todos os direitos reservados.
                        </p>
                        <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                          <a href="https://flowdent.com.br" style="color: #0EA5E9; text-decoration: none;">flowdent.com.br</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
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