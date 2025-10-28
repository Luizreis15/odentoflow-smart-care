import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

interface PlanoCobrancaTabProps {
  userId: string;
}

const PlanoCobrancaTab = ({ userId }: PlanoCobrancaTabProps) => {
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
              <p className="text-2xl font-bold">Starter</p>
            </div>
            <Badge>Ativo</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Funcionalidade completa de gerenciamento de planos e cobrança em desenvolvimento.
          </p>
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
          <p className="text-sm text-muted-foreground">
            Funcionalidade de gestão de pagamentos em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanoCobrancaTab;
