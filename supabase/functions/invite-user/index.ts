import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { Resend } from "npm:resend@2.0.0";

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

    // Verificar se o email já existe
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser?.users.some(u => u.email === email.toLowerCase());

    if (userExists) {
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

    // Criar usuário no Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: tempPassword,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        full_name: name,
      },
    });

    if (authError || !authUser.user) {
      console.error("Erro ao criar usuário no auth:", authError);
      throw new Error("Erro ao criar usuário: " + authError?.message);
    }

    // Criar registro na tabela usuarios
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
      // Limpar usuário criado no auth
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new Error("Erro ao criar registro: " + usuarioError.message);
    }

    // Criar role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: authUser.user.id,
        role: role,
      });

    if (roleError) {
      console.error("Erro ao criar role:", roleError);
    }

    // Gerar link de redefinição de senha
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email.toLowerCase(),
      options: {
        redirectTo: `${Deno.env.get("SUPABASE_URL")?.replace('supabase.co', 'lovable.app')}/auth?reset=true`
      }
    });

    if (resetError) {
      console.error("Erro ao gerar link de reset:", resetError);
    }

    // Mapear perfis para nomes amigáveis
    const roleNames: { [key: string]: string } = {
      admin: "Administrador",
      dentista: "Cirurgião-Dentista",
      recepcao: "Recepcionista",
      assistente: "Assistente",
    };

    // Enviar email de boas-vindas
    try {
      const emailResponse = await resend.emails.send({
        from: "Flowdent <noreply@flowdent.com.br>",
        to: [email.toLowerCase()],
        subject: `Bem-vindo(a) ao Flowdent - ${clinicName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #0EA5E9;">Bem-vindo(a) ao Flowdent!</h1>
            <p>Olá <strong>${name}</strong>,</p>
            <p>Você foi convidado para fazer parte da equipe da <strong>${clinicName}</strong> como <strong>${roleNames[role] || role}</strong>.</p>
            <p>Para acessar sua conta pela primeira vez, clique no botão abaixo para definir sua senha:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetData?.properties?.action_link || '#'}" 
                 style="background-color: #0EA5E9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Definir Senha
              </a>
            </div>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #666;">${resetData?.properties?.action_link || '#'}</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #666; font-size: 14px;">
              Se você não solicitou este convite, pode ignorar este email com segurança.
            </p>
          </div>
        `,
      });

      console.log("Email enviado com sucesso:", emailResponse);
    } catch (emailError: any) {
      console.error("Erro ao enviar email:", emailError);
      // Não falhar se o email não for enviado
    }

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
    console.error("Error in invite-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
