import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSubscription } from "@/contexts/SubscriptionContext";

const Assinatura = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState<string | null>(null);
  const { plan: currentPlan, status } = useSubscription();

  const plans: Record<string, {
    name: string;
    monthly: number;
    annual: number;
    popular?: boolean;
    features: string[];
  }> = {
    solo: {
      name: "Plano Solo",
      monthly: 89.90,
      annual: 899.00,
      features: [
        "1 Profissional/Agenda",
        "Agendamento Online",
        "Prontuário Digital",
        "Gestão Financeira Básica"
      ]
    },
    crescimento: {
      name: "Plano Crescimento",
      monthly: 134.90,
      annual: 1349.00,
      popular: true,
      features: [
        "Até 3 Profissionais/Agendas",
        "Confirmação Automática (SMS/WhatsApp)",
        "Assinatura Digital de Documentos",
        "Relatórios Avançados"
      ]
    },
    premium: {
      name: "Plano Premium",
      monthly: 179.90,
      annual: 1799.00,
      features: [
        "Profissionais Ilimitados",
        "Assistente IA para Anamnese",
        "Integração com Laboratórios",
        "Suporte Prioritário 24/7"
      ]
    }
  };

  const handleCheckout = async (planId: string) => {
    setLoading(planId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: planId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error("Erro ao criar checkout:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getDiscountPercentage = () => {
    return "10%";
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Escolha Seu Plano Flowdent e Transforme Sua Clínica
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Planos flexíveis que crescem com você
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
        <Label htmlFor="billing-toggle" className={billingPeriod === "monthly" ? "font-semibold" : ""}>
          Mensal
        </Label>
        <Switch
          id="billing-toggle"
          checked={billingPeriod === "annual"}
          onCheckedChange={(checked) => setBillingPeriod(checked ? "annual" : "monthly")}
        />
        <Label htmlFor="billing-toggle" className={billingPeriod === "annual" ? "font-semibold" : ""}>
          Anual
        </Label>
        {billingPeriod === "annual" && (
          <Badge variant="secondary" className="ml-2">
            Economize {getDiscountPercentage()}
          </Badge>
        )}
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(plans).map(([planId, plan]) => {
          const price = billingPeriod === "monthly" ? plan.monthly : plan.annual;
          const isCurrentPlan = currentPlan === planId;
          const isPopular = plan.popular;

          return (
            <Card 
              key={planId}
              className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
            >
              {isPopular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Mais Popular
                </Badge>
              )}
              {isCurrentPlan && (
                <Badge className="absolute -top-3 right-4 bg-green-500">
                  Plano Atual
                </Badge>
              )}
              
              <CardHeader className="text-center pb-8 pt-6">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-4xl font-bold">
                    {formatPrice(price)}
                  </div>
                  <CardDescription>
                    por {billingPeriod === "monthly" ? "mês" : "ano"}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  size="lg"
                  variant={isCurrentPlan ? "outline" : isPopular ? "default" : "outline"}
                  onClick={() => handleCheckout(planId)}
                  disabled={loading === planId || isCurrentPlan}
                >
                  {loading === planId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : isCurrentPlan ? (
                    "Plano Atual"
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Escolher Plano
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação Rápida</CardTitle>
          <CardDescription>Veja as principais diferenças entre os planos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Recurso</th>
                  <th className="text-center py-3 px-4">Solo</th>
                  <th className="text-center py-3 px-4">Crescimento</th>
                  <th className="text-center py-3 px-4">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Nº de Agendas</td>
                  <td className="text-center py-3 px-4">1</td>
                  <td className="text-center py-3 px-4">3</td>
                  <td className="text-center py-3 px-4">Ilimitado</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Confirmação Automática</td>
                  <td className="text-center py-3 px-4">-</td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Assinatura Digital</td>
                  <td className="text-center py-3 px-4">-</td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Assistente IA</td>
                  <td className="text-center py-3 px-4">-</td>
                  <td className="text-center py-3 px-4">-</td>
                  <td className="text-center py-3 px-4"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      {status === "trialing" && (
        <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-yellow-800 dark:text-yellow-200">
                Você está atualmente em período de teste gratuito
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Escolha um plano acima para continuar usando todos os recursos após o período de teste
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Assinatura;
