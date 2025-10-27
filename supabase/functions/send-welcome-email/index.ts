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
  role: string;
  clinicName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, role, clinicName }: WelcomeEmailRequest = await req.json();

    console.log(`[SEND-WELCOME] Sending email to ${email}`);

    const roleNames: Record<string, string> = {
      admin: "Administrador",
      dentista: "Dentista",
      assistente: "Assistente",
      recepcao: "Recepcionista",
    };

    const roleName = roleNames[role] || role;

    const { error } = await resend.emails.send({
      from: "Flowdent <noreply@flowdent.com.br>",
      to: [email],
      subject: "Bem-vindo ao Flowdent!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bem-vindo ao Flowdent</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Flowdent</h1>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #667eea; margin-top: 0;">Olá, ${name}! 👋</h2>
              
              <p style="font-size: 16px;">Bem-vindo ao <strong>Flowdent</strong>!</p>
              
              <p style="font-size: 16px;">Você foi adicionado ${clinicName ? `à clínica <strong>${clinicName}</strong>` : 'ao sistema'} com o perfil de <strong>${roleName}</strong>.</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  <strong>Seu email de acesso:</strong><br>
                  ${email}
                </p>
              </div>
              
              <p style="font-size: 16px;">Para acessar o sistema, clique no botão abaixo:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://flowdent.com.br/auth" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                  Acessar Flowdent
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Se você não solicitou este acesso, por favor ignore este email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>© 2025 Flowdent. Todos os direitos reservados.</p>
              <p>
                <a href="https://flowdent.com.br" style="color: #667eea; text-decoration: none;">flowdent.com.br</a>
              </p>
            </div>
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
