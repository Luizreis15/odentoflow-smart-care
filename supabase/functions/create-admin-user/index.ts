import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

Deno.serve(async (req) => {
  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get request body
    const { email, password, nome, clinicaId } = await req.json()

    if (!email || !password || !nome) {
      return new Response(
        JSON.stringify({ error: 'Email, password e nome são obrigatórios' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        nome,
        clinic_id: clinicaId
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Try to delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create usuario with super_admin role
    const { error: usuarioError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        id: authUser.user.id,
        nome,
        email,
        perfil: 'super_admin',
        clinica_id: clinicaId,
        ativo: true
      })

    if (usuarioError) {
      console.error('Error creating usuario:', usuarioError)
      return new Response(
        JSON.stringify({ error: usuarioError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create user_role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: 'super_admin'
      })

    if (roleError) {
      console.error('Error creating user role:', roleError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: authUser.user.id,
          email,
          nome
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
