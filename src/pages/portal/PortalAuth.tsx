import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import logoFlowdent from '@/assets/logo-flowdent.png';

const PortalAuth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [inviteToken] = useState(searchParams.get("token") || "");

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Verificar se é paciente do portal
        const { data: portalAccess } = await supabase
          .from("patient_portal_access")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("active", true)
          .single();

        if (portalAccess) {
          navigate("/portal/dashboard");
        }
      }
    } catch (error) {
      console.error("Error checking session:", error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Verificar se tem acesso ao portal
        const { data: portalAccess, error: accessError } = await supabase
          .from("patient_portal_access")
          .select("*")
          .eq("user_id", data.user.id)
          .eq("active", true)
          .single();

        if (accessError || !portalAccess) {
          await supabase.auth.signOut();
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar o portal do paciente.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Login realizado!",
          description: "Bem-vindo ao portal do paciente.",
        });

        navigate("/portal/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteToken) {
      toast({
        title: "Token inválido",
        description: "Você precisa de um convite para criar uma conta.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Verificar se o token é válido
      const { data: invite, error: inviteError } = await supabase
        .from("patient_portal_invites")
        .select("*, patients(*)")
        .eq("token", inviteToken)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (inviteError || !invite) {
        toast({
          title: "Convite inválido",
          description: "Este convite expirou ou já foi usado.",
          variant: "destructive",
        });
        return;
      }

      // Criar conta
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invite.email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/portal/dashboard`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Criar acesso ao portal
        const { error: accessError } = await supabase
          .from("patient_portal_access")
          .insert({
            patient_id: invite.patient_id,
            user_id: authData.user.id,
            active: true,
          });

        if (accessError) throw accessError;

        // Marcar convite como usado
        await supabase
          .from("patient_portal_invites")
          .update({ used_at: new Date().toISOString() })
          .eq("id", invite.id);

        toast({
          title: "Conta criada!",
          description: "Sua conta foi criada com sucesso. Faça login para continuar.",
        });

        // Redirecionar para login
        setEmail(invite.email);
        setPassword("");
      }
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoFlowdent} alt="Flowdent" className="h-14 w-auto" />
          </div>
          <CardTitle className="text-2xl">Portal do Paciente</CardTitle>
          <CardDescription>
            Acesse seus agendamentos, documentos e informações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={inviteToken ? "signup" : "signin"}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup" disabled={!inviteToken}>
                Criar Conta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">E-mail</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Senha</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              {inviteToken ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      "Criar Conta"
                    )}
                  </Button>
                </form>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Você precisa de um convite para criar uma conta.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalAuth;
