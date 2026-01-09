import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteUserRequest {
  name: string;
  email: string;
  role: string;
  clinicaId: string;
  clinicName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Invite User Function Started ===");
    
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

    const { name, email, role, clinicaId, clinicName }: InviteUserRequest = await req.json();
    console.log("Request data:", { name, email, role, clinicaId, clinicName });

    // Verificar se o email já existe no auth E na tabela usuarios
    console.log("Checking if email exists in auth...");
    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
    const authUserExists = existingAuthUsers?.users.some(u => u.email === email.toLowerCase());
    
    console.log("Checking if email exists in usuarios table...");
    const { data: existingUsuario } = await supabaseAdmin
      .from("usuarios")
      .select("id, email")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    console.log("Auth user exists:", authUserExists, "Usuario exists:", !!existingUsuario);

    if (authUserExists || existingUsuario) {
      console.log("Email already exists, returning error");
      return new Response(
        JSON.stringify({ error: "Este email já está cadastrado" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Gerar senha temporária aleatória
    const tempPassword = crypto.randomUUID();
    console.log("Creating user in auth with email:", email.toLowerCase());

    // Criar usuário no Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: name,
      },
    });

    if (authError || !authUser.user) {
      console.error("Erro ao criar usuário no auth:", authError);
      throw new Error("Erro ao criar usuário: " + authError?.message);
    }
    
    console.log("User created in auth successfully:", authUser.user.id);

    // Criar registro na tabela usuarios
    console.log("Creating user in usuarios table...");
    const { error: usuarioError } = await supabaseAdmin
      .from("usuarios")
      .insert({
        id: authUser.user.id,
        clinica_id: clinicaId,
        nome: name,
        email: email.toLowerCase(),
        perfil: role,
      });

    if (usuarioError) {
      console.error("Erro ao criar registro em usuarios:", usuarioError);
      console.log("Rolling back: deleting user from auth");
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new Error("Erro ao criar registro: " + usuarioError.message);
    }
    
    console.log("User created in usuarios table successfully");

    // Criar role
    console.log("Creating user role...");
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: authUser.user.id,
        role: role,
      });

    if (roleError) {
      console.error("Erro ao criar role:", roleError);
    } else {
      console.log("Role created successfully");
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
    } else {
      console.log("Password reset link generated successfully");
    }

    // Mapear perfis para nomes amigáveis
    const roleNames: { [key: string]: string } = {
      admin: "Administrador",
      dentista: "Cirurgião-Dentista",
      recepcao: "Recepcionista",
      assistente: "Assistente",
    };

    const roleName = roleNames[role] || role;

    // Enviar email de boas-vindas
    console.log("Sending welcome email via Resend...");
    
    const emailResponse = await resend.emails.send({
      from: "Flowdent <noreply@flowdent.com.br>",
      to: [email.toLowerCase()],
      subject: `Bem-vindo(a) ao Flowdent - ${clinicName}`,
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
                        
                        <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                          Você foi convidado para fazer parte da equipe da <strong>${clinicName}</strong> como <strong>${roleName}</strong>.
                        </p>
                        
                        <!-- Info Box -->
                        <div style="background-color: #f0f9ff; border-left: 4px solid #0EA5E9; padding: 16px; border-radius: 0 8px 8px 0; margin: 0 0 24px 0;">
                          <p style="color: #0369a1; font-size: 14px; margin: 0;">
                            <strong>Seu email de acesso:</strong><br>
                            ${email.toLowerCase()}
                          </p>
                        </div>
                        
                        <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                          Para acessar sua conta pela primeira vez, clique no botão abaixo para definir sua senha:
                        </p>
                        
                        <!-- Button -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="center" style="padding: 0 0 30px 0;">
                              <a href="${resetData?.properties?.action_link || '#'}" 
                                 style="display: inline-block; background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4);">
                                Definir Minha Senha
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
                        
                        <!-- Security Notice -->
                        <div style="border-top: 1px solid #e4e4e7; padding-top: 20px;">
                          <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 0;">
                            Se você não esperava este convite, pode ignorar este email com segurança.
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

    console.log("Email enviado com sucesso:", emailResponse);

    console.log("=== Invite User Function Completed Successfully ===");
    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: authUser.user.id,
        message: "Usuário criado com sucesso" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("=== ERROR in invite-user function ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ error: error.message || "Erro desconhecido ao criar usuário" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);