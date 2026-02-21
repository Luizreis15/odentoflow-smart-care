import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrthoFinanceiroTabProps {
  casoId: string;
  budgetId: string | null;
  valorTotal: number;
  valorEntrada: number | null;
  valorMensalidade: number | null;
  diaVencimento: number | null;
  totalMeses: number | null;
}

export function OrthoFinanceiroTab({
  casoId,
  budgetId,
  valorTotal,
  valorEntrada,
  valorMensalidade,
  diaVencimento,
  totalMeses,
}: OrthoFinanceiroTabProps) {
  // Fetch receivable titles linked to the budget
  const { data: titulos } = useQuery({
    queryKey: ["ortho-receivables", budgetId],
    queryFn: async () => {
      if (!budgetId) return [];
      const { data, error } = await supabase
        .from("receivable_titles")
        .select("*")
        .eq("budget_id", budgetId)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!budgetId,
  });

  const totalPago = titulos?.filter((t: any) => t.status === "paid").reduce((acc: number, t: any) => acc + Number(t.amount), 0) || 0;
  const totalPendente = titulos?.filter((t: any) => t.status === "pending" || t.status === "partial").reduce((acc: number, t: any) => acc + Number(t.balance ?? t.amount), 0) || 0;
  const totalVencido = titulos?.filter((t: any) => {
    if (t.status === "paid") return false;
    return new Date(t.due_date) < new Date();
  }).length || 0;

  const getStatusBadge = (status: string, dueDate: string) => {
    if (status === "paid") {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-[10px]">Pago</Badge>;
    }
    if (new Date(dueDate) < new Date()) {
      return <Badge variant="destructive" className="text-[10px]">Vencido</Badge>;
    }
    return <Badge variant="outline" className="text-[10px]">Pendente</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Valor Total</p>
            <p className="text-lg font-bold">R$ {Number(valorTotal).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-5 h-5 mx-auto text-green-500 mb-1" />
            <p className="text-xs text-muted-foreground">Pago</p>
            <p className="text-lg font-bold text-green-600">R$ {totalPago.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 mx-auto text-amber-500 mb-1" />
            <p className="text-xs text-muted-foreground">Pendente</p>
            <p className="text-lg font-bold text-amber-600">R$ {totalPendente.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-5 h-5 mx-auto text-destructive mb-1" />
            <p className="text-xs text-muted-foreground">Vencidos</p>
            <p className="text-lg font-bold text-destructive">{totalVencido}</p>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      {(valorMensalidade || valorEntrada) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 text-sm">
              {valorEntrada != null && (
                <div>
                  <span className="text-muted-foreground">Entrada:</span>{" "}
                  <span className="font-medium">R$ {Number(valorEntrada).toFixed(2)}</span>
                </div>
              )}
              {valorMensalidade != null && (
                <div>
                  <span className="text-muted-foreground">Mensalidade:</span>{" "}
                  <span className="font-medium">R$ {Number(valorMensalidade).toFixed(2)}</span>
                </div>
              )}
              {diaVencimento != null && (
                <div>
                  <span className="text-muted-foreground">Vencimento:</span>{" "}
                  <span className="font-medium">Dia {diaVencimento}</span>
                </div>
              )}
              {totalMeses != null && (
                <div>
                  <span className="text-muted-foreground">Duração:</span>{" "}
                  <span className="font-medium">{totalMeses} meses</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Titles list */}
      {!budgetId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <DollarSign className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum orçamento vinculado a este caso</p>
            <p className="text-muted-foreground text-xs mt-1">Vincule um orçamento no cadastro do caso para gerar títulos financeiros.</p>
          </CardContent>
        </Card>
      ) : titulos && titulos.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Parcelas / Títulos</h4>
          <div className="rounded-md border">
            <div className="divide-y">
              {titulos.map((titulo: any) => (
                <div key={titulo.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    {getStatusBadge(titulo.status, titulo.due_date)}
                    <span className="truncate">{titulo.description || "Parcela"}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-muted-foreground text-xs">
                      {format(parseISO(titulo.due_date), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    <span className="font-medium">R$ {Number(titulo.amount).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <DollarSign className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum título financeiro gerado</p>
            <p className="text-muted-foreground text-xs mt-1">Aprove o orçamento vinculado para gerar os títulos a receber.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
