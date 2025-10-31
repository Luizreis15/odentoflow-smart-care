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

    const { email }: ResetPasswordRequest = await req.json();
    console.log("Reset password request for email:", email);

    // Verificar se o usuário existe
    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingAuthUsers?.users.find(u => u.email === email.toLowerCase());

    if (!userExists) {
      console.log("User not found, but returning success for security");
      // Por segurança, não revelamos se o email existe ou não
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

    // Buscar dados do usuário
    const { data: usuario } = await supabaseAdmin
      .from("usuarios")
      .select("nome, clinica_id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    let clinicName = "Flowdent";
    if (usuario?.clinica_id) {
      const { data: clinic } = await supabaseAdmin
        .from("clinics")
        .select("name")
        .eq("id", usuario.clinica_id)
        .maybeSingle();
      
      if (clinic?.name) {
        clinicName = clinic.name;
      }
    }

    // Gerar link de redefinição de senha
    console.log("Generating password reset link...");
    
    const redirectUrl = Deno.env.get("APP_URL") || "https://flowdent.com.br";
    
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email.toLowerCase(),
      options: {
        redirectTo: `${redirectUrl}/auth?reset=true`
      }
    });

    if (resetError) {
      console.error("Erro ao gerar link de reset:", resetError);
      throw new Error("Erro ao gerar link de recuperação");
    }

    console.log("Password reset link generated successfully");

    // Enviar email de recuperação
    console.log("Sending password reset email...");
    try {
      const emailResponse = await resend.emails.send({
        from: "Flowdent <noreply@flowdent.com.br>",
        to: [email.toLowerCase()],
        subject: "Recuperação de Senha - Flowdent",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0EA5E9;">Recuperação de Senha</h1>
            <p>Olá${usuario?.nome ? ` <strong>${usuario.nome}</strong>` : ''},</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta ${clinicName ? `na <strong>${clinicName}</strong>` : 'no Flowdent'}.</p>
            <p>Para definir uma nova senha, clique no botão abaixo:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetData?.properties?.action_link || '#'}" 
                 style="background-color: #0EA5E9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Redefinir Senha
              </a>
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Este link expira em 1 hora. Se o botão não funcionar, 
              <a href="${resetData?.properties?.action_link || '#'}" style="color: #0EA5E9; text-decoration: underline;">
                clique aqui
              </a>.
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #666; font-size: 14px;">
              Se você não solicitou esta recuperação de senha, pode ignorar este email com segurança. Sua senha não será alterada.
            </p>
          </div>
        `,
      });

      console.log("Email sent successfully:", emailResponse);
    } catch (emailError: any) {
      console.error("Error sending email:", emailError);
      throw new Error("Erro ao enviar email de recuperação");
    }

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
