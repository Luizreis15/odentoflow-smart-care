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
import { PayablesTab } from "@/components/financeiro/PayablesTab";
import { RecorrenciasTab } from "@/components/financeiro/RecorrenciasTab";
import { CalendarioFinanceiro } from "@/components/financeiro/CalendarioFinanceiro";
import { RelatoriosFinanceiroTab } from "@/components/financeiro/RelatoriosFinanceiroTab";
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
    <div className="space-y-4 md:space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-primary text-primary-foreground px-4 md:px-6 py-3 md:py-4 rounded-t-lg shadow-lg">
          <div className="flex items-center justify-between">
            <h1 className="text-lg md:text-2xl font-bold">Financeiro</h1>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-none h-9 w-9 p-0">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tabs - Scroll horizontal no mobile */}
          <div className="mt-3 md:mt-4 -mx-4 md:mx-0 px-4 md:px-0 overflow-x-auto scrollbar-hide">
            <TabsList className="bg-primary-foreground/10 border-none w-max md:w-auto">
              <TabsTrigger value="fluxo" className="text-primary-foreground data-[state=active]:bg-primary-foreground data-[state=active]:text-primary text-xs md:text-sm px-3 md:px-4">
                FLUXO
              </TabsTrigger>
              <TabsTrigger value="calendario" className="text-primary-foreground data-[state=active]:bg-primary-foreground data-[state=active]:text-primary text-xs md:text-sm px-3 md:px-4">
                CALENDÁRIO
              </TabsTrigger>
              <TabsTrigger value="receber" className="text-primary-foreground data-[state=active]:bg-primary-foreground data-[state=active]:text-primary text-xs md:text-sm px-3 md:px-4">
                RECEBER
              </TabsTrigger>
              <TabsTrigger value="pagar" className="text-primary-foreground data-[state=active]:bg-primary-foreground data-[state=active]:text-primary text-xs md:text-sm px-3 md:px-4">
                PAGAR
              </TabsTrigger>
              <TabsTrigger value="recorrencias" className="text-primary-foreground data-[state=active]:bg-primary-foreground data-[state=active]:text-primary text-xs md:text-sm px-3 md:px-4">
                RECORRÊNCIAS
              </TabsTrigger>
              <TabsTrigger value="comissoes" className="text-primary-foreground data-[state=active]:bg-primary-foreground data-[state=active]:text-primary text-xs md:text-sm px-3 md:px-4">
                COMISSÕES
              </TabsTrigger>
              <TabsTrigger value="relatorios" className="text-primary-foreground data-[state=active]:bg-primary-foreground data-[state=active]:text-primary text-xs md:text-sm px-3 md:px-4">
                RELATÓRIOS
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="bg-card rounded-b-lg shadow">
          <TabsContent value="fluxo" className="m-0 p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Filtros - Stack no mobile */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Período</label>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
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

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                  <Filter className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">FILTRAR</span>
                </Button>

                <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                  <Download className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">EXPORTAR</span>
                </Button>

                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none"
                  onClick={() => setShowNovaTransacao(true)}
                >
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">ADICIONAR</span>
                </Button>
              </div>
            </div>

            {/* Cards de resumo - Scroll no mobile */}
            <div className="flex lg:grid lg:grid-cols-3 gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <Card className="border-l-4 border-l-[hsl(var(--success-green))] bg-gradient-to-br from-[hsl(145,63%,97%)] to-[hsl(145,63%,94%)] flex-shrink-0 w-[200px] lg:w-auto border-none shadow-md">
                <CardContent className="p-4 lg:pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs lg:text-sm font-medium text-foreground/70">RECEITAS</span>
                    <div className="p-1.5 rounded-lg bg-[hsl(var(--success-green))]/10">
                      <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-[hsl(var(--success-green))]" />
                    </div>
                  </div>
                  <div className="text-xl lg:text-2xl font-bold text-[hsl(var(--success-green))]">
                    R$ {receitas.toFixed(2)}
                  </div>
                  <p className="text-xs text-foreground/60 mt-1">
                    A receber R$ 0,00
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[hsl(var(--error-red))] bg-gradient-to-br from-red-50 to-red-100/50 flex-shrink-0 w-[200px] lg:w-auto border-none shadow-md">
                <CardContent className="p-4 lg:pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs lg:text-sm font-medium text-foreground/70">DESPESAS</span>
                    <div className="p-1.5 rounded-lg bg-[hsl(var(--error-red))]/10">
                      <TrendingDown className="h-4 w-4 lg:h-5 lg:w-5 text-[hsl(var(--error-red))]" />
                    </div>
                  </div>
                  <div className="text-xl lg:text-2xl font-bold text-[hsl(var(--error-red))]">
                    R$ {despesas.toFixed(2)}
                  </div>
                  <p className="text-xs text-foreground/60 mt-1">
                    A pagar R$ 0,00
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[hsl(var(--flowdent-blue))] bg-gradient-to-br from-[hsl(205,84%,97%)] to-[hsl(205,84%,94%)] flex-shrink-0 w-[200px] lg:w-auto border-none shadow-md">
                <CardContent className="p-4 lg:pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs lg:text-sm font-medium text-foreground/70">SALDO</span>
                    <div className="p-1.5 rounded-lg bg-[hsl(var(--flowdent-blue))]/10">
                      <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-[hsl(var(--flowdent-blue))]" />
                    </div>
                  </div>
                  <div className={`text-xl lg:text-2xl font-bold ${saldo >= 0 ? 'text-[hsl(var(--flowdent-blue))]' : 'text-[hsl(var(--error-red))]'}`}>
                    R$ {saldo.toFixed(2)}
                  </div>
                  <div className="mt-1 text-xs text-foreground/60">
                    Total previsto
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de transações */}
            <div className="border rounded-lg overflow-hidden">
              {loading ? (
                <div className="p-8 md:p-12 text-center">
                  <p className="text-muted-foreground">Carregando...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-8 md:p-12 text-center">
                  <div className="inline-block p-4 bg-muted rounded-lg mb-4">
                    <Download className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />
                  </div>
                  <p className="text-base md:text-lg font-medium">Sem resultados</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tente alterar os filtros
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile: Cards */}
                  <div className="lg:hidden divide-y">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="p-4 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{transaction.reference || "-"}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString("pt-BR")} • {transaction.category}
                          </p>
                        </div>
                        <span className={`font-bold whitespace-nowrap ${transaction.type === "receita" ? "text-green-600" : "text-red-600"}`}>
                          {transaction.type === "receita" ? "+" : "-"}R$ {transaction.value.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Desktop: Table */}
                  <Table className="hidden lg:table">
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
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="receber" className="m-0 p-4 md:p-6">
            {clinicId && <ReceivablesTab clinicId={clinicId} />}
          </TabsContent>

          <TabsContent value="pagar" className="m-0 p-4 md:p-6">
            {clinicId && <PayablesTab clinicId={clinicId} />}
          </TabsContent>

          <TabsContent value="calendario" className="m-0 p-4 md:p-6">
            {clinicId && <CalendarioFinanceiro clinicId={clinicId} />}
          </TabsContent>

          <TabsContent value="recorrencias" className="m-0 p-4 md:p-6">
            {clinicId && <RecorrenciasTab clinicId={clinicId} />}
          </TabsContent>

          <TabsContent value="comissoes" className="m-0 p-4 md:p-6">
            {clinicId && <ComissoesTab clinicId={clinicId} />}
          </TabsContent>

          <TabsContent value="relatorios" className="m-0 p-4 md:p-6">
            {clinicId && <RelatoriosFinanceiroTab clinicId={clinicId} />}
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