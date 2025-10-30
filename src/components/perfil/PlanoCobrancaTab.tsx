import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";

interface PlanoCobrancaTabProps {
  userId: string;
}

const PlanoCobrancaTab = ({ userId }: PlanoCobrancaTabProps) => {
  const { plan, status, subscriptionEnd } = useSubscription();
  const navigate = useNavigate();

  const planNames: Record<string, string> = {
    solo: "Plano Solo",
    crescimento: "Plano Crescimento",
    premium: "Plano Premium",
    starter: "Teste Gratuito"
  };

  const statusNames: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    trialing: { label: "Em Teste", variant: "secondary" },
    active: { label: "Ativo", variant: "default" },
    canceled: { label: "Cancelado", variant: "destructive" },
    no_subscription: { label: "Sem Assinatura", variant: "outline" }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Plano</CardTitle>
          <CardDescription>Informações sobre sua assinatura atual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Plano atual</p>
              <p className="text-2xl font-bold">{planNames[plan] || "Não definido"}</p>
            </div>
            <Badge variant={statusNames[status]?.variant || "outline"}>
              {statusNames[status]?.label || status}
            </Badge>
          </div>
          
          {subscriptionEnd && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Renovação: {new Date(subscriptionEnd).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}

          <Button 
            className="w-full mt-4" 
            onClick={() => navigate("/dashboard/assinatura")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Gerenciar Assinatura
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Forma de Pagamento
          </CardTitle>
          <CardDescription>Método de pagamento cadastrado</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Gerencie seus métodos de pagamento através do portal do Stripe.
          </p>
          <Button variant="outline" className="w-full">
            <CreditCard className="mr-2 h-4 w-4" />
            Acessar Portal de Pagamento
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanoCobrancaTab;
