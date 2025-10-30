import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "Ideal para pequenas clínicas",
    price: "99",
    yearlyPrice: "990",
    popular: false,
    features: [
      "Até 100 pacientes",
      "5 usuários",
      "1.000 mensagens/mês",
      "Agenda inteligente",
      "Prontuário eletrônico",
      "Suporte por email",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "Para clínicas em crescimento",
    price: "299",
    yearlyPrice: "2.990",
    popular: true,
    features: [
      "Até 500 pacientes",
      "15 usuários",
      "5.000 mensagens/mês",
      "Todos os recursos do Starter",
      "Relatórios avançados",
      "Gestão financeira completa",
      "Controle de estoque",
      "Suporte prioritário",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Solução completa para grandes clínicas",
    price: "799",
    yearlyPrice: "7.990",
    popular: false,
    features: [
      "Pacientes ilimitados",
      "Usuários ilimitados",
      "Mensagens ilimitadas",
      "Todos os recursos do Professional",
      "Multi-clínica",
      "API personalizada",
      "Gerente de conta dedicado",
      "Suporte 24/7",
    ],
  },
];

export default function Precos() {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCheckout = async (planId: string) => {
    setLoading(planId);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Login necessário",
          description: "Faça login para assinar um plano",
        });
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: planId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Erro ao criar checkout:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o checkout. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <LandingHeader />
      
      <main className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            Preços Transparentes
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Escolha o plano ideal para sua clínica
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comece com 14 dias grátis. Cancele quando quiser.
          </p>

          {/* Toggle anual/mensal */}
          <div className="flex items-center justify-center gap-3">
            <span className={!isYearly ? "font-semibold" : "text-muted-foreground"}>
              Mensal
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary"
            >
              <span
                className={`${
                  isYearly ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </button>
            <span className={isYearly ? "font-semibold" : "text-muted-foreground"}>
              Anual
              <Badge variant="secondary" className="ml-2">
                Economize 17%
              </Badge>
            </span>
          </div>
        </div>

        {/* Cards dos planos */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? "border-primary shadow-xl scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="bg-primary text-primary-foreground">
                    Mais Popular
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      R$ {isYearly ? plan.yearlyPrice : plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      /{isYearly ? "ano" : "mês"}
                    </span>
                  </div>
                  {isYearly && (
                    <p className="text-sm text-muted-foreground mt-1">
                      R$ {Math.round(Number(plan.yearlyPrice) / 12)}/mês
                    </p>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading !== null}
                >
                  {loading === plan.id ? "Processando..." : "Assinar agora"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ / Benefícios adicionais */}
        <div className="mt-24 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">
            Todos os planos incluem
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">14 dias grátis</h3>
              <p className="text-sm text-muted-foreground">
                Teste todos os recursos sem compromisso
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Sem fidelidade</h3>
              <p className="text-sm text-muted-foreground">
                Cancele quando quiser, sem multas
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Atualizações gratuitas</h3>
              <p className="text-sm text-muted-foreground">
                Novos recursos incluídos automaticamente
              </p>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
