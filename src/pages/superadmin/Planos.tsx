import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthly_price: number | null;
  yearly_price: number | null;
  trial_days: number;
  limits: any;
  included_modules: any;
  is_active: boolean;
  display_order: number;
}

export default function Planos() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("system_plans")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const togglePlanStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("system_plans")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Plano ${!currentStatus ? "ativado" : "desativado"} com sucesso`,
      });

      loadPlans();
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o plano",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Planos & Assinaturas</h1>
          <p className="text-muted-foreground">
            Gerencie os planos e recursos disponíveis no sistema
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Cards de Preview dos Planos */}
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={!plan.is_active ? "opacity-50" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{plan.name}</CardTitle>
                  <Badge variant={plan.is_active ? "default" : "secondary"}>
                    {plan.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold">
                      {formatCurrency(plan.monthly_price)}
                      <span className="text-base font-normal text-muted-foreground">
                        /mês
                      </span>
                    </div>
                    {plan.yearly_price && (
                      <div className="text-sm text-muted-foreground">
                        ou {formatCurrency(plan.yearly_price)}/ano
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Recursos:</div>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(plan.included_modules) && plan.included_modules.slice(0, 3).map((module, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {module}
                        </Badge>
                      ))}
                      {Array.isArray(plan.included_modules) && plan.included_modules.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{plan.included_modules.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {plan.trial_days} dias de trial
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="mr-1 h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={plan.is_active ? "ghost" : "default"}
                      onClick={() => togglePlanStatus(plan.id, plan.is_active)}
                    >
                      {plan.is_active ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabela Detalhada */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes dos Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Mensal</TableHead>
                  <TableHead>Anual</TableHead>
                  <TableHead>Trial</TableHead>
                  <TableHead>Limites</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{formatCurrency(plan.monthly_price)}</TableCell>
                    <TableCell>{formatCurrency(plan.yearly_price)}</TableCell>
                    <TableCell>{plan.trial_days} dias</TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        {plan.limits.usuarios && (
                          <div>Usuários: {plan.limits.usuarios === -1 ? "Ilimitado" : plan.limits.usuarios}</div>
                        )}
                        {plan.limits.pacientes && (
                          <div>Pacientes: {plan.limits.pacientes === -1 ? "Ilimitado" : plan.limits.pacientes}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.is_active ? "default" : "secondary"}>
                        {plan.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
