import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Check, FileText, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface Budget {
  id: string;
  title: string;
  description?: string;
  total_value: number;
  discount_value: number;
  final_value: number;
  status: string;
  valid_until?: string;
  created_at: string;
  approved_at?: string;
}

interface OrcamentosTabProps {
  budgets: Budget[];
  onRefresh: () => void;
  onNewBudget: () => void;
}

export const OrcamentosTab = ({ budgets, onRefresh, onNewBudget }: OrcamentosTabProps) => {
  const [approving, setApproving] = useState<string | null>(null);

  const handleApproveBudget = async (budgetId: string) => {
    try {
      setApproving(budgetId);
      
      const { error } = await supabase
        .from("budgets")
        .update({ 
          status: "approved",
          approved_at: new Date().toISOString()
        })
        .eq("id", budgetId);

      if (error) throw error;
      
      toast.success("Orçamento aprovado com sucesso!");
      onRefresh();
    } catch (error: any) {
      console.error("Erro ao aprovar orçamento:", error);
      toast.error("Erro ao aprovar orçamento");
    } finally {
      setApproving(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Rascunho", variant: "secondary" as const },
      pending: { label: "Pendente", variant: "outline" as const },
      approved: { label: "Aprovado", variant: "default" as const },
      rejected: { label: "Rejeitado", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };


  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  if (budgets.length === 0) {
    return (
      <div className="space-y-6">
        <Button 
          className="bg-[#4ade80] hover:bg-[#4ade80]/90"
          onClick={onNewBudget}
        >
          <Plus className="h-4 w-4 mr-2" />
          NOVO ORÇAMENTO
        </Button>

        <Card className="border-none shadow-none">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative w-48 h-48 mb-4">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <rect x="50" y="30" width="100" height="140" fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="2" rx="4"/>
                <rect x="60" y="50" width="80" height="8" fill="#3b82f6" rx="2"/>
                <rect x="60" y="70" width="60" height="6" fill="#d0d0d0" rx="2"/>
                <rect x="60" y="85" width="70" height="6" fill="#d0d0d0" rx="2"/>
                <rect x="60" y="100" width="50" height="6" fill="#d0d0d0" rx="2"/>
                <circle cx="90" cy="130" r="15" fill="#3b82f6" opacity="0.2"/>
                <path d="M 85 130 L 88 133 L 95 125" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#3b82f6] mb-2">
                Crie o primeiro orçamento
              </h3>
              <p className="text-lg font-semibold text-[#3b82f6]">
                para este paciente
              </p>
            </div>

            <div className="max-w-2xl space-y-3 text-left">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-[#4ade80] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Transforme o orçamento em <span className="font-semibold text-foreground">tratamentos e débitos</span>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-[#4ade80] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Orçamento especializado para <span className="font-semibold text-foreground">planejamento de HOF</span>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-[#4ade80] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Fácil e completo, com <span className="font-semibold text-foreground">odontograma</span> e <span className="font-semibold text-foreground">aprovação parcial</span>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-[#4ade80] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Orçamentos em aberto viram automaticamente <span className="font-semibold text-foreground">oportunidades</span> no menu <span className="text-[#3b82f6]">Vendas</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Orçamentos</h2>
        <Button 
          className="bg-[#4ade80] hover:bg-[#4ade80]/90"
          onClick={onNewBudget}
        >
          <Plus className="h-4 w-4 mr-2" />
          NOVO ORÇAMENTO
        </Button>
      </div>

      <div className="grid gap-4">
        {budgets.map((budget) => (
          <Card key={budget.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{budget.title}</CardTitle>
                  {budget.description && (
                    <p className="text-sm text-muted-foreground">{budget.description}</p>
                  )}
                </div>
                {getStatusBadge(budget.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Valor Total</p>
                    <p className="font-semibold">{formatCurrency(budget.final_value)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Criado em</p>
                    <p className="font-semibold">{formatDate(budget.created_at)}</p>
                  </div>
                </div>

                {budget.valid_until && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Válido até</p>
                      <p className="font-semibold">{formatDate(budget.valid_until)}</p>
                    </div>
                  </div>
                )}
              </div>

              {budget.discount_value > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Desconto:</span>
                  <span className="font-medium text-destructive">
                    -{formatCurrency(budget.discount_value)}
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                {budget.status === "draft" || budget.status === "pending" ? (
                  <Button
                    size="sm"
                    onClick={() => handleApproveBudget(budget.id)}
                    disabled={approving === budget.id}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {approving === budget.id ? "Aprovando..." : "Aprovar Orçamento"}
                  </Button>
                ) : null}
                
                {budget.approved_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Aprovado em {formatDate(budget.approved_at)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
