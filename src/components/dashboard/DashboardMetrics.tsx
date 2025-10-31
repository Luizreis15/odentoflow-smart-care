import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Users, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const DashboardMetrics = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {/* Card 1: Consultas do Dia */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">
              Consultas do Dia
            </CardTitle>
            <Calendar className="h-4 w-4 text-[hsl(var(--flowdent-blue))]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl lg:text-3xl font-bold">12</div>
          <Progress value={66} className="h-1.5" />
          <p className="text-xs text-muted-foreground">8 confirmadas, 2 aguardando</p>
        </CardContent>
      </Card>

      {/* Card 2: Faturamento do Dia */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">
              Faturamento
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[hsl(var(--flow-turquoise))]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl lg:text-3xl font-bold">R$ 3,2k</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-[hsl(var(--flow-turquoise))] font-medium">R$ 1,8k</span> recebido
          </p>
        </CardContent>
      </Card>

      {/* Card 3: Novos Pacientes Hoje */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">
              Novos Pacientes
            </CardTitle>
            <Users className="h-4 w-4 text-[hsl(var(--flowdent-blue))]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl lg:text-3xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-[hsl(var(--flow-turquoise))] font-medium">+15%</span> vs. média
          </p>
        </CardContent>
      </Card>

      {/* Card 4: Taxa de Ocupação */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">
              Ocupação
            </CardTitle>
            <PieChart className="h-4 w-4 text-[hsl(var(--flowdent-blue))]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl lg:text-3xl font-bold">78%</div>
          <Progress value={78} className="h-1.5" />
          <p className="text-xs text-muted-foreground">7h de 9h disponíveis</p>
        </CardContent>
      </Card>
    </div>
  );
};
