import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  email: string;
  isAdmin?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Reset Password Function Started ===");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { email, isAdmin }: ResetPasswordRequest = await req.json();
    console.log("Reset password request for email:", email, "isAdmin:", isAdmin);

    // Verificar se o usuário existe
    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingAuthUsers?.users.find(u => u.email === email.toLowerCase());

    if (!userExists) {
      console.log("User not found, but returning success for security");
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Se o email existir, você receberá instruções de recuperação" 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verificar se é super_admin
    const { data: userRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userExists.id)
      .eq("role", "super_admin")
      .maybeSingle();

    const isSuperAdmin = !!userRole;

    // Buscar dados do usuário
    const { data: usuario } = await supabaseAdmin
      .from("usuarios")
      .select("nome, clinica_id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    // Buscar dados do profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", userExists.id)
      .maybeSingle();

    const userName = usuario?.nome || profile?.full_name || "Usuário";

    let clinicName = "";
    if (usuario?.clinica_id) {
      const { data: clinic } = await supabaseAdmin
        .from("clinicas")
        .select("nome")
        .eq("id", usuario.clinica_id)
        .maybeSingle();
      
      if (clinic?.nome) {
        clinicName = clinic.nome;
      }
    }

    // Determinar URL de redirect baseado no tipo de usuário
    const redirectUrl = Deno.env.get("APP_URL") || "https://flowdent.com.br";
    const redirectPath = (isAdmin || isSuperAdmin) ? "/admin?reset=true" : "/auth?reset=true";
    
    console.log("Generating password reset link with redirect:", `${redirectUrl}${redirectPath}`);

    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email.toLowerCase(),
      options: {
        redirectTo: `${redirectUrl}${redirectPath}`
      }
    });

    if (resetError) {
      console.error("Erro ao gerar link de reset:", resetError);
      throw new Error("Erro ao gerar link de recuperação");
    }

    console.log("Password reset link generated successfully");

    // Enviar email de recuperação
    console.log("Sending password reset email via Resend...");
    
    const emailResponse = await resend.emails.send({
      from: "Flowdent <noreply@flowdent.com.br>",
      to: [email.toLowerCase()],
      subject: "Recuperação de Senha - Flowdent",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recuperação de Senha</title>
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
                        <h2 style="color: #18181b; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">Recuperação de Senha</h2>
                        
                        <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                          Olá${userName ? ` <strong>${userName}</strong>` : ''},
                        </p>
                        
                        <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                          Recebemos uma solicitação para redefinir a senha da sua conta${clinicName ? ` na <strong>${clinicName}</strong>` : ' no Flowdent'}.
                        </p>
                        
                        <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                          Para definir uma nova senha, clique no botão abaixo:
                        </p>
                        
                        <!-- Button -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="center" style="padding: 0 0 30px 0;">
                              <a href="${resetData?.properties?.action_link || '#'}" 
                                 style="display: inline-block; background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4);">
                                Redefinir Minha Senha
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Fallback Link -->
                        <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                          Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
                        </p>
                        <p style="color: #0EA5E9; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0; word-break: break-all;">
                          <a href="${resetData?.properties?.action_link || '#'}" style="color: #0EA5E9; text-decoration: underline;">
                            ${resetData?.properties?.action_link || '#'}
                          </a>
                        </p>
                        
                        <!-- Expiration Notice -->
                        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0; margin: 0 0 30px 0;">
                          <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
                            ⏰ Este link expira em 1 hora.
                          </p>
                        </div>
                        
                        <!-- Security Notice -->
                        <div style="border-top: 1px solid #e4e4e7; padding-top: 20px;">
                          <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 0;">
                            Se você não solicitou esta recuperação de senha, pode ignorar este email com segurança. Sua senha não será alterada.
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

    console.log("Email sent successfully:", emailResponse);

    console.log("=== Reset Password Function Completed Successfully ===");
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Email de recuperação enviado com sucesso" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("=== ERROR in reset-password function ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro ao processar recuperação de senha" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);