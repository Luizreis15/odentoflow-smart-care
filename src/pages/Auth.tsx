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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

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
    
    const validation = signupSchema.safeParse({ email, password, fullName });
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: validation.error.errors[0].message,
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: validation.data.fullName,
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
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signinSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Validation Error",
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
            <div className="text-center">
              <h1 className="text-3xl font-bold text-[hsl(var(--flowdent-blue))] mb-2">
                Bem-vindo de volta
              </h1>
              <p className="text-[hsl(var(--slate-gray))]">
                Gerencie sua clínica com eficiência
              </p>
            </div>

            {/* Tabs for Login/Signup */}
            <div className="space-y-6">
              <div className="flex gap-2 p-1 bg-[hsl(var(--cloud-white))] rounded-lg">
                <button
                  onClick={() => {
                    setEmail("");
                    setPassword("");
                    setFullName("");
                  }}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    fullName === ""
                      ? "bg-white text-[hsl(var(--flowdent-blue))] shadow-sm"
                      : "text-[hsl(var(--slate-gray))] hover:text-[hsl(var(--flowdent-blue))]"
                  }`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => {
                    setEmail("");
                    setPassword("");
                    setFullName(" ");
                  }}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                    fullName !== ""
                      ? "bg-white text-[hsl(var(--flowdent-blue))] shadow-sm"
                      : "text-[hsl(var(--slate-gray))] hover:text-[hsl(var(--flowdent-blue))]"
                  }`}
                >
                  Cadastrar
                </button>
              </div>

              {fullName === "" ? (
                // Login Form
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
              ) : (
                // Signup Form
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={fullName.trim()}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="h-12"
                    />
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
              )}
            </div>

            <p className="text-center text-sm text-[hsl(var(--slate-gray))]">
              Ao continuar, você concorda com nossos{" "}
              <Link to="/" className="text-[hsl(var(--flowdent-blue))] hover:underline">
                Termos de Uso
              </Link>{" "}
              e{" "}
              <Link to="/" className="text-[hsl(var(--flowdent-blue))] hover:underline">
                Política de Privacidade
              </Link>
            </p>
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