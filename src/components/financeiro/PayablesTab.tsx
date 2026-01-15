import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, AlertTriangle, Clock, CheckCircle, XCircle, DollarSign, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NovaDespesaModal } from "./NovaDespesaModal";
import { PagamentoDespesaDrawer } from "./PagamentoDespesaDrawer";

interface PayableTitle {
  id: string;
  title_number: number;
  description: string;
  supplier_id: string | null;
  category_id: string | null;
  expense_type_id: string | null;
  due_date: string;
  amount: number;
  balance: number;
  status: string;
  document_number: string | null;
  notes: string | null;
  recurrence: string;
  supplier?: {
    razao_social: string;
    nome_fantasia: string | null;
  } | null;
  category?: {
    nome: string;
    cor: string;
  } | null;
  expense_type?: {
    nome: string;
    tipo: string;
  } | null;
}

interface AgingSummary {
  aVencer: number;
  vencido1a30: number;
  vencido31a60: number;
  vencido60mais: number;
  total: number;
}

interface PayablesTabProps {
  clinicId: string;
}

export const PayablesTab = ({ clinicId }: PayablesTabProps) => {
  const [titles, setTitles] = useState<PayableTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [agingFilter, setAgingFilter] = useState("all");
  const [selectedTitle, setSelectedTitle] = useState<PayableTitle | null>(null);
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const [showNovaDespesa, setShowNovaDespesa] = useState(false);
  const [aging, setAging] = useState<AgingSummary>({
    aVencer: 0,
    vencido1a30: 0,
    vencido31a60: 0,
    vencido60mais: 0,
    total: 0,
  });

  useEffect(() => {
    loadTitles();
  }, [clinicId, statusFilter]);

  const loadTitles = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("payable_titles")
        .select(`
          *,
          supplier:suppliers(razao_social, nome_fantasia),
          category:expense_categories(nome, cor),
          expense_type:expense_types(nome, tipo)
        `)
        .eq("clinic_id", clinicId)
        .order("due_date", { ascending: true });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setTitles((data || []) as PayableTitle[]);
      calculateAging((data || []) as PayableTitle[]);
    } catch (error) {
      console.error("Erro ao carregar títulos:", error);
      toast.error("Erro ao carregar contas a pagar");
    } finally {
      setLoading(false);
    }
  };

  const calculateAging = (data: PayableTitle[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const summary: AgingSummary = {
      aVencer: 0,
      vencido1a30: 0,
      vencido31a60: 0,
      vencido60mais: 0,
      total: 0,
    };

    data.forEach((title) => {
      if (title.status === "paid" || title.status === "cancelled") return;

      const dueDate = new Date(title.due_date);
      dueDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      summary.total += title.balance;

      if (diffDays < 0) {
        summary.aVencer += title.balance;
      } else if (diffDays <= 30) {
        summary.vencido1a30 += title.balance;
      } else if (diffDays <= 60) {
        summary.vencido31a60 += title.balance;
      } else {
        summary.vencido60mais += title.balance;
      }
    });

    setAging(summary);
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const isOverdue = due < today && status !== "paid" && status !== "cancelled";

    if (status === "paid") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Pago</Badge>;
    }
    if (status === "cancelled") {
      return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Cancelado</Badge>;
    }
    if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><AlertTriangle className="h-3 w-3 mr-1" />Vencido</Badge>;
    }
    if (status === "partial") {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="h-3 w-3 mr-1" />Parcial</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Clock className="h-3 w-3 mr-1" />Em aberto</Badge>;
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSupplierName = (title: PayableTitle) => {
    if (!title.supplier) return "Sem fornecedor";
    return title.supplier.nome_fantasia || title.supplier.razao_social;
  };

  const filteredTitles = titles.filter((title) => {
    const supplierName = getSupplierName(title);
    const matchesSearch = 
      title.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      title.title_number.toString().includes(searchTerm);

    if (!matchesSearch) return false;

    if (agingFilter === "all") return true;

    const daysOverdue = getDaysOverdue(title.due_date);
    
    switch (agingFilter) {
      case "aVencer":
        return daysOverdue < 0 && title.status !== "paid" && title.status !== "cancelled";
      case "vencido1a30":
        return daysOverdue >= 0 && daysOverdue <= 30 && title.status !== "paid" && title.status !== "cancelled";
      case "vencido31a60":
        return daysOverdue > 30 && daysOverdue <= 60 && title.status !== "paid" && title.status !== "cancelled";
      case "vencido60mais":
        return daysOverdue > 60 && title.status !== "paid" && title.status !== "cancelled";
      default:
        return true;
    }
  });

  const handlePayment = (title: PayableTitle) => {
    setSelectedTitle(title);
    setShowPaymentDrawer(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Cards de Aging */}
      <div className="flex lg:grid lg:grid-cols-5 gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
        <Card 
          className={`cursor-pointer transition-all flex-shrink-0 w-[140px] lg:w-auto ${agingFilter === "all" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setAgingFilter("all")}
        >
          <CardContent className="p-3 lg:pt-4">
            <div className="text-xs font-medium text-muted-foreground">Total a Pagar</div>
            <div className="text-lg lg:text-2xl font-bold">{formatCurrency(aging.total)}</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all border-l-4 border-l-blue-500 flex-shrink-0 w-[140px] lg:w-auto ${agingFilter === "aVencer" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setAgingFilter("aVencer")}
        >
          <CardContent className="p-3 lg:pt-4">
            <div className="text-xs font-medium text-muted-foreground">A Vencer</div>
            <div className="text-lg lg:text-2xl font-bold text-blue-600">{formatCurrency(aging.aVencer)}</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all border-l-4 border-l-yellow-500 flex-shrink-0 w-[140px] lg:w-auto ${agingFilter === "vencido1a30" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setAgingFilter("vencido1a30")}
        >
          <CardContent className="p-3 lg:pt-4">
            <div className="text-xs font-medium text-muted-foreground">1-30 dias</div>
            <div className="text-lg lg:text-2xl font-bold text-yellow-600">{formatCurrency(aging.vencido1a30)}</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all border-l-4 border-l-orange-500 flex-shrink-0 w-[140px] lg:w-auto ${agingFilter === "vencido31a60" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setAgingFilter("vencido31a60")}
        >
          <CardContent className="p-3 lg:pt-4">
            <div className="text-xs font-medium text-muted-foreground">31-60 dias</div>
            <div className="text-lg lg:text-2xl font-bold text-orange-600">{formatCurrency(aging.vencido31a60)}</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all border-l-4 border-l-red-500 flex-shrink-0 w-[140px] lg:w-auto ${agingFilter === "vencido60mais" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setAgingFilter("vencido60mais")}
        >
          <CardContent className="p-3 lg:pt-4">
            <div className="text-xs font-medium text-muted-foreground">60+ dias</div>
            <div className="text-lg lg:text-2xl font-bold text-red-600">{formatCurrency(aging.vencido60mais)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar fornecedor ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="open">Em aberto</SelectItem>
            <SelectItem value="partial">Parcial</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => setShowNovaDespesa(true)} className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      {/* Lista */}
      <div className="border rounded-lg">
        {loading ? (
          <div className="p-8 md:p-12 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : filteredTitles.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <div className="inline-block p-4 bg-muted rounded-lg mb-4">
              <DollarSign className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />
            </div>
            <p className="text-base md:text-lg font-medium">Nenhuma despesa encontrada</p>
            <p className="text-sm text-muted-foreground mt-1">
              {statusFilter !== "all" || searchTerm ? "Tente alterar os filtros" : "Adicione uma nova despesa para começar"}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: Cards */}
            <div className="lg:hidden divide-y">
              {filteredTitles.map((title) => {
                const daysOverdue = getDaysOverdue(title.due_date);
                const isOverdue = daysOverdue > 0 && title.status !== "paid" && title.status !== "cancelled";
                return (
                  <div 
                    key={title.id} 
                    className={`p-4 space-y-3 ${isOverdue ? "bg-red-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{title.description}</p>
                        <p className="text-sm text-muted-foreground">{getSupplierName(title)}</p>
                      </div>
                      {getStatusBadge(title.status, title.due_date)}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-muted-foreground">Venc: </span>
                        {new Date(title.due_date).toLocaleDateString("pt-BR")}
                        {isOverdue && (
                          <span className="text-xs text-red-600 ml-1">({daysOverdue}d)</span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(title.balance)}</div>
                        {title.balance !== title.amount && (
                          <div className="text-xs text-muted-foreground line-through">{formatCurrency(title.amount)}</div>
                        )}
                      </div>
                    </div>

                    {title.category && (
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: title.category.cor }}
                        />
                        <span className="text-xs text-muted-foreground">{title.category.nome}</span>
                        {title.expense_type && (
                          <Badge variant="outline" className="text-xs">
                            {title.expense_type.tipo}
                          </Badge>
                        )}
                      </div>
                    )}

                    {title.status !== "paid" && title.status !== "cancelled" && (
                      <Button
                        size="sm"
                        onClick={() => handlePayment(title)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Baixar Pagamento
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop: Table */}
            <Table className="hidden lg:table">
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTitles.map((title) => {
                  const daysOverdue = getDaysOverdue(title.due_date);
                  return (
                    <TableRow key={title.id} className={daysOverdue > 0 && title.status !== "paid" && title.status !== "cancelled" ? "bg-red-50" : ""}>
                      <TableCell className="font-mono">#{title.title_number}</TableCell>
                      <TableCell>
                        <div className="font-medium">{getSupplierName(title)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">{title.description}</div>
                      </TableCell>
                      <TableCell>
                        {title.category && (
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: title.category.cor }}
                            />
                            <span>{title.category.nome}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{new Date(title.due_date).toLocaleDateString("pt-BR")}</div>
                          {daysOverdue > 0 && title.status !== "paid" && title.status !== "cancelled" && (
                            <div className="text-xs text-red-600">{daysOverdue} dias atrás</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(title.amount)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(title.balance)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(title.status, title.due_date)}
                      </TableCell>
                      <TableCell className="text-right">
                        {title.status !== "paid" && title.status !== "cancelled" && (
                          <Button
                            size="sm"
                            onClick={() => handlePayment(title)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Baixar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}
      </div>

      {/* Nova Despesa Modal */}
      <NovaDespesaModal
        open={showNovaDespesa}
        onOpenChange={setShowNovaDespesa}
        clinicId={clinicId}
        onSuccess={() => {
          loadTitles();
          setShowNovaDespesa(false);
        }}
      />

      {/* Payment Drawer */}
      {selectedTitle && (
        <PagamentoDespesaDrawer
          open={showPaymentDrawer}
          onOpenChange={setShowPaymentDrawer}
          title={selectedTitle}
          clinicId={clinicId}
          onSuccess={() => {
            loadTitles();
            setShowPaymentDrawer(false);
            setSelectedTitle(null);
          }}
        />
      )}
    </div>
  );
};
