import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true');
  const [signupStep, setSignupStep] = useState(1); // 1 = Suas informações, 2 = Dados da clínica
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup fields - Step 1
  const [signupEmail, setSignupEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  
  // Signup fields - Step 2
  const [clinicName, setClinicName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [userRole, setUserRole] = useState("");
  const [howDidYouKnow, setHowDidYouKnow] = useState("");

  useEffect(() => {
    // Atualizar isSignUp quando o parâmetro mudar
    if (searchParams.get('signup') === 'true') {
      setIsSignUp(true);
    }
  }, [searchParams]);

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

  const handleContinueStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate step 1 fields
    if (!signupEmail.trim() || !fullName.trim() || !clinicPhone.trim()) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios",
      });
      return;
    }

    const emailValidation = z.string().email("Email inválido").safeParse(signupEmail);
    if (!emailValidation.success) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "Por favor, insira um email válido",
      });
      return;
    }

    setSignupStep(2);
  };

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

    if (!userRole) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "Por favor, selecione sua função/atuação",
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
          clinic_phone: clinicPhone,
          user_role: userRole,
          how_did_you_know: howDidYouKnow,
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
      setSignupStep(1);
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
                  <h1 className="text-2xl font-bold text-[hsl(var(--flowdent-blue))] mb-2">
                    Flowdent
                  </h1>
                  <p className="text-[hsl(var(--slate-gray))] mb-6">
                    {signupStep === 1 
                      ? "Teste de graça por 7 dias. Não é necessário informar um cartão de crédito para começar, pague somente se gostar."
                      : "Quase lá! Precisamos de mais algumas informações para personalizar sua experiência."
                    }
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    type="button"
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      signupStep === 1
                        ? "bg-[hsl(var(--flowdent-blue)/0.1)] text-[hsl(var(--flowdent-blue))]"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    onClick={() => setSignupStep(1)}
                  >
                    Suas informações
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      signupStep === 2
                        ? "bg-[hsl(var(--flowdent-blue)/0.1)] text-[hsl(var(--flowdent-blue))]"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    disabled={signupStep === 1}
                  >
                    Dados da clínica
                  </button>
                </div>

                {signupStep === 1 ? (
                  // STEP 1 - Suas informações
                  <form onSubmit={handleContinueStep1} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">E-mail</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="email@email.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Seu nome</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Ex: Leandro Martins"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clinic-phone">WhatsApp ou Celular da clínica</Label>
                      <Input
                        id="clinic-phone"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={clinicPhone}
                        onChange={(e) => setClinicPhone(e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-[hsl(var(--flowdent-blue))] hover:bg-[hsl(var(--flow-turquoise))]"
                    >
                      Continuar
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-[hsl(var(--slate-gray))]">
                        Já tem uma conta?{" "}
                        <button
                          type="button"
                          onClick={() => setIsSignUp(false)}
                          className="text-[hsl(var(--flowdent-blue))] font-semibold hover:underline"
                        >
                          Entrar
                        </button>
                      </p>
                    </div>
                  </form>
                ) : (
                  // STEP 2 - Dados da clínica
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="clinic-name">Nome da clínica</Label>
                      <Input
                        id="clinic-name"
                        type="text"
                        placeholder="Ex: Clínica Odonto Sorrir"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Deve conter no mínimo 6 caracteres"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={8}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-role">Selecione sua função/atuação</Label>
                      <Select value={userRole} onValueChange={setUserRole} required>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dentista">Dentista</SelectItem>
                          <SelectItem value="secretaria">Secretária(o)</SelectItem>
                          <SelectItem value="administrador">Administrador</SelectItem>
                          <SelectItem value="paciente">Paciente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="how-did-you-know">Como conheceu o Flowdent?</Label>
                      <Select value={howDidYouKnow} onValueChange={setHowDidYouKnow}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="indicacao">Indicação</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <p className="text-xs text-center text-[hsl(var(--slate-gray))]">
                      Ao clicar em "Iniciar teste" você está concordando com nossos{" "}
                      <Link to="/" className="text-[hsl(var(--flowdent-blue))] hover:underline">
                        termos de uso
                      </Link>
                      .
                    </p>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-[hsl(var(--flowdent-blue))] hover:bg-[hsl(var(--flow-turquoise))]" 
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Iniciar teste
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12"
                      onClick={() => setSignupStep(1)}
                    >
                      Voltar
                    </Button>
                  </form>
                )}
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