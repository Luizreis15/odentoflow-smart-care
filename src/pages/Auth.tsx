import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import TestimonialCarousel from "@/components/auth/TestimonialCarousel";

const signupSchema = z.object({
  email: z.string().email("Invalid email format").max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  fullName: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Name can only contain letters and spaces")
});

const signinSchema = z.object({
  email: z.string().email("Invalid email format").max(255, "Email must be less than 255 characters"),
  password: z.string().min(1, "Password is required").max(128, "Password must be less than 128 characters")
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup fields
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [clinicCNPJ, setClinicCNPJ] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Verificar se é super admin
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'super_admin')
          .maybeSingle();

        if (userRoles) {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Verificar se é super admin
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'super_admin')
          .maybeSingle();

        if (userRoles) {
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
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signupSchema.safeParse({ 
      email: signupEmail, 
      password: signupPassword, 
      fullName 
    });
    
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: validation.error.errors[0].message,
      });
      return;
    }

    if (!clinicName.trim()) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "Nome da clínica é obrigatório",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding/welcome`,
        data: {
          full_name: validation.data.fullName,
          clinic_name: clinicName,
          clinic_cnpj: clinicCNPJ,
          clinic_phone: clinicPhone,
        },
      },
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error.message,
      });
    } else {
      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer login.",
      });
      setIsSignUp(false);
    }
  };

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

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white">
        {/* Header */}
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[hsl(var(--flowdent-blue))]">
              Flowdent
            </span>
          </Link>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            {!isSignUp ? (
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
                    <Label htmlFor="login-password">Senha</Label>
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

                <div className="text-center">
                  <p className="text-sm text-[hsl(var(--slate-gray))]">
                    Não tem uma conta?{" "}
                    <button
                      onClick={() => setIsSignUp(true)}
                      className="text-[hsl(var(--flowdent-blue))] font-semibold hover:underline"
                    >
                      Criar conta
                    </button>
                  </p>
                </div>
              </>
            ) : (
              // SIGNUP FORM
              <>
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-[hsl(var(--flowdent-blue))] mb-2">
                    Criar sua conta
                  </h1>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Preencha os dados para começar
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Dados Pessoais */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-[hsl(var(--slate-gray))] uppercase">
                      Seus dados
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome Completo *</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Dr. João Silva"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email *</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha *</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={8}
                        className="h-12"
                      />
                    </div>
                  </div>

                  {/* Dados da Clínica */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-[hsl(var(--slate-gray))] uppercase">
                      Dados da clínica
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="clinic-name">Nome da Clínica *</Label>
                      <Input
                        id="clinic-name"
                        type="text"
                        placeholder="Clínica Odonto Saúde"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clinic-cnpj">CNPJ</Label>
                      <Input
                        id="clinic-cnpj"
                        type="text"
                        placeholder="00.000.000/0000-00"
                        value={clinicCNPJ}
                        onChange={(e) => setClinicCNPJ(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clinic-phone">Telefone</Label>
                      <Input
                        id="clinic-phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={clinicPhone}
                        onChange={(e) => setClinicPhone(e.target.value)}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-[hsl(var(--flowdent-blue))] hover:bg-[hsl(var(--flow-turquoise))]" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Conta
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-[hsl(var(--slate-gray))]">
                    Já tem uma conta?{" "}
                    <button
                      onClick={() => setIsSignUp(false)}
                      className="text-[hsl(var(--flowdent-blue))] font-semibold hover:underline"
                    >
                      Entrar
                    </button>
                  </p>
                </div>

                <p className="text-center text-xs text-[hsl(var(--slate-gray))]">
                  Ao criar uma conta, você concorda com nossos{" "}
                  <Link to="/" className="text-[hsl(var(--flowdent-blue))] hover:underline">
                    Termos de Uso
                  </Link>{" "}
                  e{" "}
                  <Link to="/" className="text-[hsl(var(--flowdent-blue))] hover:underline">
                    Política de Privacidade
                  </Link>
                </p>
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