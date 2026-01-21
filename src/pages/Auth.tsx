import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import TestimonialCarousel from "@/components/auth/TestimonialCarousel";
import logoFlowdent from '@/assets/logo-flowdent.png';

const signinSchema = z.object({
  email: z.string().email("Invalid email format").max(255, "Email must be less than 255 characters"),
  password: z.string().min(1, "Password is required").max(128, "Password must be less than 128 characters")
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(searchParams.get('reset') === 'true');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Forgot password field
  const [resetEmail, setResetEmail] = useState("");
  
  // Reset password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (searchParams.get('reset') === 'true') {
      setIsResetPassword(true);
      setIsForgotPassword(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Verificar se é super admin - redireciona para dashboard com acesso total
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'super_admin')
          .maybeSingle();

        if (userRoles) {
          console.log("[AUTH] Super admin detected, redirecting to /super-admin");
          navigate("/super-admin");
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('clinic_id')
          .eq('id', session.user.id)
          .single();
        
        if (!profile?.clinic_id) {
          navigate("/onboarding/welcome");
          return;
        }

        const { data: clinica } = await (supabase as any)
          .from('clinicas')
          .select('onboarding_status')
          .eq('id', profile.clinic_id)
          .single();

        if (clinica?.onboarding_status !== 'completed') {
          navigate("/onboarding/welcome");
          return;
        }

        navigate("/dashboard");
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Use setTimeout to defer Supabase calls and prevent deadlocks
        setTimeout(async () => {
          try {
            // Verificar se é super admin - redireciona para dashboard com acesso total
            const { data: userRoles } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .eq('role', 'super_admin')
              .maybeSingle();

            if (userRoles) {
              console.log("[AUTH] Super admin detected (onAuthChange), redirecting to /super-admin");
              navigate("/super-admin");
              return;
            }

            const { data: profile } = await supabase
              .from('profiles')
              .select('clinic_id')
              .eq('id', session.user.id)
              .single();
            
            if (!profile?.clinic_id) {
              navigate("/onboarding/welcome");
              return;
            }

            const { data: clinica } = await (supabase as any)
              .from('clinicas')
              .select('onboarding_status')
              .eq('id', profile.clinic_id)
              .single();

            if (clinica?.onboarding_status !== 'completed') {
              navigate("/onboarding/welcome");
              return;
            }

            navigate("/dashboard");
          } catch (error) {
            console.error("Error checking user data:", error);
          }
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signinSchema.safeParse({ 
      email: loginEmail, 
      password: loginPassword 
    });
    
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: validation.error.errors[0].message,
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error.message,
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Email obrigatório",
        description: "Por favor, insira seu email",
      });
      return;
    }

    const emailValidation = z.string().email("Email inválido").safeParse(resetEmail);
    if (!emailValidation.success) {
      toast({
        variant: "destructive",
        title: "Email inválido",
        description: "Por favor, insira um email válido",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('reset-password', {
        body: { email: resetEmail }
      });

      setLoading(false);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao enviar email",
          description: error.message,
        });
      } else {
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para redefinir sua senha.",
        });
        setIsForgotPassword(false);
        setResetEmail("");
      }
    } catch (err) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: "Ocorreu um erro ao processar sua solicitação.",
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não coincidem",
        description: "As senhas devem ser iguais",
      });
      return;
    }

    const passwordValidation = z.string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .max(128, "A senha deve ter no máximo 128 caracteres")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "A senha deve conter letra maiúscula, minúscula e número")
      .safeParse(newPassword);
    
    if (!passwordValidation.success) {
      toast({
        variant: "destructive",
        title: "Senha inválida",
        description: passwordValidation.error.errors[0].message,
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: error.message,
      });
    } else {
      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi alterada com sucesso. Você será redirecionado para o login.",
      });
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-gradient-to-b from-white via-white to-[hsl(var(--cloud-white))] lg:bg-white lg:bg-none">
        {/* Header - Com gradiente no mobile */}
        <div className="bg-gradient-to-r from-[hsl(var(--flowdent-blue))] to-[hsl(var(--flow-turquoise))] lg:bg-none lg:bg-white p-6 lg:border-b">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-white/90 rounded-lg px-4 py-2 lg:bg-transparent lg:p-0">
              <img src={logoFlowdent} alt="Flowdent" className="h-14 lg:h-16 w-auto" />
            </div>
          </Link>
        </div>

        {/* Decoração Mobile */}
        <div className="lg:hidden flex justify-center pt-8 pb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(var(--flowdent-blue))]/10 to-[hsl(var(--flow-turquoise))]/10 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--flowdent-blue))]/20 to-[hsl(var(--flow-turquoise))]/20 flex items-center justify-center">
              <span className="text-4xl">🦷</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-start lg:items-center justify-center p-6 lg:p-8 pt-4 lg:pt-8">
          <div className="w-full max-w-md space-y-6 lg:space-y-8">
            {isResetPassword ? (
              // RESET PASSWORD FORM
              <>
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-[hsl(var(--flowdent-blue))] mb-2">
                    Redefinir senha
                  </h1>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Digite sua nova senha
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="h-12"
                    />
                    <p className="text-xs text-[hsl(var(--slate-gray))]">
                      Mínimo 8 caracteres, com letra maiúscula, minúscula e número
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-[hsl(var(--flowdent-blue))] hover:bg-[hsl(var(--flow-turquoise))]" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Redefinir senha
                  </Button>
                </form>
              </>
            ) : isForgotPassword ? (
              // FORGOT PASSWORD FORM
              <>
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-[hsl(var(--flowdent-blue))] mb-2">
                    Recuperar senha
                  </h1>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Digite seu email para receber o link de recuperação
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-[hsl(var(--flowdent-blue))] hover:bg-[hsl(var(--flow-turquoise))]" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar link de recuperação
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-[hsl(var(--slate-gray))]">
                    Lembrou a senha?{" "}
                    <button
                      onClick={() => {
                        setIsForgotPassword(false);
                        setResetEmail("");
                      }}
                      className="text-[hsl(var(--flowdent-blue))] font-semibold hover:underline"
                    >
                      Voltar ao login
                    </button>
                  </p>
                </div>
              </>
            ) : (
              // LOGIN FORM
              <>
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-[hsl(var(--flowdent-blue))] mb-2">
                    Bem-vindo de volta
                  </h1>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Acesse sua conta
                  </p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Senha</Label>
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-sm text-[hsl(var(--flowdent-blue))] hover:underline"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-[hsl(var(--flowdent-blue))] hover:bg-[hsl(var(--flow-turquoise))]" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Testimonials */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[hsl(var(--flowdent-blue))] to-[hsl(var(--flow-turquoise))] relative overflow-hidden">
        <TestimonialCarousel />
      </div>
    </div>
  );
};

export default Auth;
