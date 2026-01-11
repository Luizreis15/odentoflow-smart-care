import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Download,
  Filter,
  Plus,
  Receipt,
  CreditCard,
  Wallet
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FinanceiroTabProps {
  patientId: string;
}

interface Titulo {
  id: string;
  notes: string | null;
  amount: number;
  balance: number;
  status: string;
  due_date: string;
  created_at: string;
  origin: string | null;
  installment_number: number | null;
}

interface Pagamento {
  id: string;
  value: number;
  payment_method: string | null;
  payment_date: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
}

export const FinanceiroTab = ({ patientId }: FinanceiroTabProps) => {
  const [titulos, setTitulos] = useState<Titulo[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("resumo");

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar títulos a receber
      const { data: titulosData, error: titulosError } = await supabase
        .from("receivable_titles")
        .select("*")
        .eq("patient_id", patientId)
        .order("due_date", { ascending: true });

      if (titulosError) throw titulosError;
      setTitulos(titulosData || []);

      // Carregar pagamentos
      const { data: pagamentosData, error: pagamentosError } = await supabase
        .from("payments")
        .select("*")
        .eq("patient_id", patientId)
        .order("payment_date", { ascending: false });

      if (pagamentosError) throw pagamentosError;
      setPagamentos(pagamentosData || []);

    } catch (error: any) {
      console.error("Erro ao carregar dados financeiros:", error);
      toast.error("Erro ao carregar dados financeiros");
    } finally {
      setLoading(false);
    }
  };

  // Calcular totais
  const totalAberto = titulos
    .filter(t => t.status === "open" || t.status === "partial")
    .reduce((acc, t) => acc + t.balance, 0);

  const totalPago = pagamentos
    .filter(p => p.status === "completed")
    .reduce((acc, p) => acc + p.value, 0);

  const totalVencido = titulos
    .filter(t => {
      const isVencido = new Date(t.due_date) < new Date();
      return (t.status === "open" || t.status === "partial") && isVencido;
    })
    .reduce((acc, t) => acc + t.balance, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500 text-white">Pago</Badge>;
      case "partial":
        return <Badge className="bg-yellow-500 text-white">Parcial</Badge>;
      case "open":
        return <Badge className="bg-blue-500 text-white">Em aberto</Badge>;
      case "overdue":
        return <Badge variant="destructive">Vencido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string | null) => {
    const methods: Record<string, string> = {
      dinheiro: "Dinheiro",
      pix: "PIX",
      cartao_credito: "Cartão de Crédito",
      cartao_debito: "Cartão de Débito",
      boleto: "Boleto",
      transferencia: "Transferência"
    };
    return methods[method || ""] || method || "Não informado";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Carregando dados financeiros...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total em Aberto</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalAberto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pago</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vencido</p>
                <p className="text-2xl font-bold text-red-600">
                  {totalVencido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subtabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="titulos">Títulos a Receber</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Próximos Vencimentos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Próximos Vencimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {titulos.filter(t => t.status !== "paid").length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum título em aberto
                  </p>
                ) : (
                  <div className="space-y-3">
                    {titulos
                      .filter(t => t.status !== "paid")
                      .slice(0, 5)
                      .map((titulo) => (
                        <div key={titulo.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">
                              {titulo.origin || `Parcela ${titulo.installment_number || 1}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Vence em {format(new Date(titulo.due_date), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {titulo.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </p>
                            {getStatusBadge(titulo.status)}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Últimos Pagamentos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Últimos Pagamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pagamentos.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum pagamento registrado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pagamentos.slice(0, 5).map((pagamento) => (
                      <div key={pagamento.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{getPaymentMethodLabel(pagamento.payment_method)}</p>
                          <p className="text-xs text-muted-foreground">
                            {pagamento.payment_date 
                              ? format(new Date(pagamento.payment_date), "dd/MM/yyyy", { locale: ptBR })
                              : "Data não informada"}
                          </p>
                        </div>
                        <p className="font-semibold text-green-600">
                          {pagamento.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="titulos" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Títulos a Receber</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {titulos.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum título cadastrado para este paciente
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {titulos.map((titulo) => (
                      <TableRow key={titulo.id}>
                        <TableCell className="font-medium">
                          {titulo.origin || `Parcela ${titulo.installment_number || 1}`}
                        </TableCell>
                        <TableCell>
                          {format(new Date(titulo.due_date), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          {titulo.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {titulo.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell>{getStatusBadge(titulo.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagamentos" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Histórico de Pagamentos</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              {pagamentos.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum pagamento registrado para este paciente
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Forma de Pagamento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagamentos.map((pagamento) => (
                      <TableRow key={pagamento.id}>
                        <TableCell>
                          {pagamento.payment_date 
                            ? format(new Date(pagamento.payment_date), "dd/MM/yyyy", { locale: ptBR })
                            : "-"}
                        </TableCell>
                        <TableCell>{getPaymentMethodLabel(pagamento.payment_method)}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {pagamento.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={pagamento.status === "completed" ? "default" : "secondary"}>
                            {pagamento.status === "completed" ? "Confirmado" : pagamento.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {pagamento.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
