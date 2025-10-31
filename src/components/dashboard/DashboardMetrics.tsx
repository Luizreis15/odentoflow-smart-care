import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Users, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const DashboardMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Consultas do Dia */}
      <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consultas do Dia
            </CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground mb-2">12</div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>8 Confirmadas</span>
              <span>2 Aguardando</span>
            </div>
            <div className="flex justify-between">
              <span>2 Concluídas</span>
            </div>
          </div>
          <Progress value={66} className="h-2 mt-3" />
        </CardContent>
      </Card>

      {/* Card 2: Faturamento do Dia */}
      <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-accent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento do Dia
            </CardTitle>
            <DollarSign className="h-5 w-5 text-accent" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground mb-2">R$ 3.240</div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span className="text-accent font-medium">R$ 1.800 Recebido</span>
            </div>
            <div className="flex justify-between">
              <span>R$ 1.440 a Receber</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Novos Pacientes Hoje */}
      <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-secondary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Novos Pacientes Hoje
            </CardTitle>
            <Users className="h-5 w-5 text-secondary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground mb-2">3</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-accent font-medium">+15%</span>
              <span className="text-muted-foreground">vs. média diária</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Taxa de Ocupação */}
      <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Ocupação
            </CardTitle>
            <PieChart className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground mb-2">78%</div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>7h preenchidas de 9h disponíveis</div>
          </div>
          <Progress value={78} className="h-2 mt-3" />
        </CardContent>
      </Card>
    </div>
  );
};
