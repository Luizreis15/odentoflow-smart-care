import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Plus, Download, Search, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NovaTransacaoModal } from "@/components/financeiro/NovaTransacaoModal";
import { ComissoesTab } from "@/components/financeiro/ComissoesTab";
import { ReceivablesTab } from "@/components/financeiro/ReceivablesTab";

interface Transaction {
  id: string;
  type: string;
  date: string;
  value: number;
  category: string;
  reference: string | null;
}

const Financeiro = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string>("");
  const [showNovaTransacao, setShowNovaTransacao] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("de hoje");
  const [activeTab, setActiveTab] = useState("fluxo");

  useEffect(() => {
    loadClinicId();
  }, []);

  useEffect(() => {
    if (clinicId) {
      loadTransactions();
    }
  }, [clinicId, periodFilter]);

  const loadClinicId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("clinic_id")
          .eq("id", user.id)
          .single();

        if (profile) {
          setClinicId(profile.clinic_id);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar clinic_id:", error);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      const { startDate, endDate } = getDateRange(periodFilter);
      
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .eq("clinic_id", clinicId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      toast.error("Erro ao carregar transações");
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (period: string) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (period) {
      case "de hoje":
        startDate = today;
        endDate = today;
        break;
      case "dessa semana":
        const dayOfWeek = today.getDay();
        startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek);
        endDate = new Date(today);
        endDate.setDate(today.getDate() + (6 - dayOfWeek));
        break;
      case "desse mês":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "do mês passado":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "dos últimos 30 dias":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        endDate = today;
        break;
      case "dos próximos 30 dias":
        startDate = today;
        endDate = new Date(today);
        endDate.setDate(today.getDate() + 30);
        break;
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const calculateTotals = () => {
    const receitas = transactions
      .filter((t) => t.type === "receita")
      .reduce((sum, t) => sum + t.value, 0);
    
    const despesas = transactions
      .filter((t) => t.type === "despesa")
      .reduce((sum, t) => sum + t.value, 0);

    const saldo = receitas - despesas;

    return { receitas, despesas, saldo };
  };

  const { receitas, despesas, saldo } = calculateTotals();

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-primary text-primary-foreground px-6 py-4 rounded-t-lg shadow-lg">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Fluxo de Caixa</h1>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-none">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsList className="mt-4 bg-primary-foreground/10 border-none">
            <TabsTrigger value="fluxo" className="text-primary-foreground data-[state=active]:bg-primary-foreground data-[state=active]:text-primary">
              FLUXO DE CAIXA
            </TabsTrigger>
            <TabsTrigger value="receber" className="text-primary-foreground data-[state=active]:bg-primary-foreground data-[state=active]:text-primary">
              CONTAS A RECEBER
            </TabsTrigger>
            <TabsTrigger value="transacoes" className="text-primary-foreground data-[state=active]:bg-primary-foreground data-[state=active]:text-primary">
              TRANSAÇÕES
            </TabsTrigger>
            <TabsTrigger value="nota" className="text-primary-foreground data-[state=active]:bg-primary-foreground data-[state=active]:text-primary">
              NOTA FISCAL
            </TabsTrigger>
            <TabsTrigger value="comissoes" className="text-primary-foreground data-[state=active]:bg-primary-foreground data-[state=active]:text-primary">
              COMISSÕES
            </TabsTrigger>
            <TabsTrigger value="carteira" className="text-primary-foreground data-[state=active]:bg-primary-foreground data-[state=active]:text-primary">
              CARTEIRA DIGITAL
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="bg-white rounded-b-lg shadow">
          <TabsContent value="fluxo" className="m-0 p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Exibindo financeiro</label>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de hoje">de hoje</SelectItem>
                    <SelectItem value="dessa semana">dessa semana</SelectItem>
                    <SelectItem value="desse mês">desse mês</SelectItem>
                    <SelectItem value="do mês passado">do mês passado</SelectItem>
                    <SelectItem value="dos últimos 30 dias">dos últimos 30 dias</SelectItem>
                    <SelectItem value="dos próximos 30 dias">dos próximos 30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                FILTRAR
              </Button>

              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                EXPORTAR
              </Button>

              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowNovaTransacao(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                ADICIONAR
              </Button>
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">RECEITAS</span>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {receitas.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    A receber R$ 0,00
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Total previsto R$ {receitas.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">DESPESAS</span>
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    R$ {despesas.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    A pagar R$ 0,00
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Total previsto R$ {despesas.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">SALDO</span>
                  </div>
                  <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    R$ {saldo.toFixed(2)}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Total previsto R$ {saldo.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de transações */}
            <div className="border rounded-lg">
              {loading ? (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground">Carregando...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-block p-4 bg-muted rounded-lg mb-4">
                    <Download className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium">Sem resultados para o período</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tente alterar os filtros
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>{transaction.reference || "-"}</TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell className="text-right">
                          <span className={transaction.type === "receita" ? "text-green-600" : "text-red-600"}>
                            {transaction.type === "receita" ? "+" : "-"}R$ {transaction.value.toFixed(2)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="receber" className="m-0 p-6">
            {clinicId && <ReceivablesTab clinicId={clinicId} />}
          </TabsContent>

          <TabsContent value="transacoes" className="m-0 p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Módulo de transações em desenvolvimento</p>
            </div>
          </TabsContent>

          <TabsContent value="nota" className="m-0 p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Módulo de notas fiscais em desenvolvimento</p>
            </div>
          </TabsContent>

          <TabsContent value="comissoes" className="m-0 p-6">
            {clinicId && <ComissoesTab clinicId={clinicId} />}
          </TabsContent>

          <TabsContent value="carteira" className="m-0 p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Módulo de carteira digital em desenvolvimento</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {clinicId && (
        <NovaTransacaoModal
          open={showNovaTransacao}
          onOpenChange={setShowNovaTransacao}
          clinicId={clinicId}
          onSuccess={loadTransactions}
        />
      )}
    </div>
  );
};

export default Financeiro;