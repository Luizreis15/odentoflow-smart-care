import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Building2, UserCog, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";

const Welcome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return null;
  }

  const steps = [
    {
      icon: Building2,
      title: "Dados da Clínica",
      description: "Configure informações básicas da sua clínica ou consultório",
    },
    {
      icon: UserCog,
      title: "Dentista Responsável",
      description: "Cadastre o profissional responsável pela clínica",
    },
    {
      icon: CheckCircle2,
      title: "Pronto para Usar",
      description: "Acesse todas as funcionalidades do sistema",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">
                Bem-vindo ao OdontoFlow! 🎉
              </CardTitle>
              <CardDescription className="text-lg">
                Seu teste gratuito de 14 dias começou. Vamos configurar sua clínica em 3 passos simples.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid gap-6 md:grid-cols-3">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center space-y-3 p-4 rounded-lg border bg-card"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                <h4 className="font-semibold text-center">O que você terá acesso:</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Agenda inteligente de consultas",
                    "Prontuário digital completo",
                    "Gestão financeira integrada",
                    "Comunicação com pacientes",
                    "Relatórios e análises",
                    "Suporte ao cliente",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/onboarding/tipo")}
                  className="px-12"
                >
                  Começar Configuração
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
