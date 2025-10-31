import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Users, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const DashboardMetrics = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-3 pb-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">Consultas do Dia</CardTitle>
            <Calendar className="h-3.5 w-3.5 text-[hsl(var(--flowdent-blue))]" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1 space-y-1">
          <div className="text-xl font-bold">12</div>
          <Progress value={66} className="h-1" />
          <p className="text-xs text-muted-foreground">8 confirmadas</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-3 pb-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">Faturamento</CardTitle>
            <DollarSign className="h-3.5 w-3.5 text-[hsl(var(--flow-turquoise))]" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1 space-y-1">
          <div className="text-xl font-bold">R$ 3,2k</div>
          <p className="text-xs text-muted-foreground">R$ 1,8k recebido</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-3 pb-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">Novos Pacientes</CardTitle>
            <Users className="h-3.5 w-3.5 text-[hsl(var(--flowdent-blue))]" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          <div className="text-xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">+15% vs média</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-3 pb-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">Ocupação</CardTitle>
            <PieChart className="h-3.5 w-3.5 text-[hsl(var(--flowdent-blue))]" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1 space-y-1">
          <div className="text-xl font-bold">78%</div>
          <Progress value={78} className="h-1" />
        </CardContent>
      </Card>
    </div>
  );
};
