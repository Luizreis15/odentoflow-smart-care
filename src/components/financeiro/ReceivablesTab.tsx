import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, AlertTriangle, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PaymentDrawer } from "./PaymentDrawer";

interface ReceivableTitle {
  id: string;
  title_number: number;
  patient_id: string;
  budget_id: string | null;
  installment_number: number;
  total_installments: number;
  due_date: string;
  amount: number;
  balance: number;
  status: string;
  origin: string;
  payment_method: string | null;
  notes: string | null;
  patient?: {
    full_name: string;
    phone: string;
  };
}

interface AgingSummary {
  aVencer: number;
  vencido1a30: number;
  vencido31a60: number;
  vencido60mais: number;
  total: number;
}

interface ReceivablesTabProps {
  clinicId: string;
}

export const ReceivablesTab = ({ clinicId }: ReceivablesTabProps) => {
  const [titles, setTitles] = useState<ReceivableTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [agingFilter, setAgingFilter] = useState("all");
  const [selectedTitle, setSelectedTitle] = useState<ReceivableTitle | null>(null);
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
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
        .from("receivable_titles")
        .select(`
          *,
          patient:patients(full_name, phone)
        `)
        .eq("clinic_id", clinicId)
        .order("due_date", { ascending: true });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setTitles(data || []);
      calculateAging(data || []);
    } catch (error) {
      console.error("Erro ao carregar títulos:", error);
      toast.error("Erro ao carregar contas a receber");
    } finally {
      setLoading(false);
    }
  };

  const calculateAging = (data: ReceivableTitle[]) => {
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

  const filteredTitles = titles.filter((title) => {
    const matchesSearch = 
      title.patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handlePayment = (title: ReceivableTitle) => {
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
    <div className="space-y-6">
      {/* Cards de Aging */}
      <div className="grid grid-cols-5 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${agingFilter === "all" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setAgingFilter("all")}
        >
          <CardContent className="pt-4">
            <div className="text-sm font-medium text-muted-foreground">Total a Receber</div>
            <div className="text-2xl font-bold">{formatCurrency(aging.total)}</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all border-l-4 border-l-blue-500 ${agingFilter === "aVencer" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setAgingFilter("aVencer")}
        >
          <CardContent className="pt-4">
            <div className="text-sm font-medium text-muted-foreground">A Vencer</div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(aging.aVencer)}</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all border-l-4 border-l-yellow-500 ${agingFilter === "vencido1a30" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setAgingFilter("vencido1a30")}
        >
          <CardContent className="pt-4">
            <div className="text-sm font-medium text-muted-foreground">Vencido 1-30 dias</div>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(aging.vencido1a30)}</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all border-l-4 border-l-orange-500 ${agingFilter === "vencido31a60" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setAgingFilter("vencido31a60")}
        >
          <CardContent className="pt-4">
            <div className="text-sm font-medium text-muted-foreground">Vencido 31-60 dias</div>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(aging.vencido31a60)}</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all border-l-4 border-l-red-500 ${agingFilter === "vencido60mais" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setAgingFilter("vencido60mais")}
        >
          <CardContent className="pt-4">
            <div className="text-sm font-medium text-muted-foreground">Vencido 60+ dias</div>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(aging.vencido60mais)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente ou número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
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
      </div>

      {/* Tabela */}
      <div className="border rounded-lg">
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : filteredTitles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-block p-4 bg-muted rounded-lg mb-4">
              <DollarSign className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">Nenhum título encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              {statusFilter !== "all" || searchTerm ? "Tente alterar os filtros" : "Aprove orçamentos para gerar títulos"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Parcela</TableHead>
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
                      <div>
                        <div className="font-medium">{title.patient?.full_name || "—"}</div>
                        <div className="text-sm text-muted-foreground">{title.patient?.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {title.installment_number}/{title.total_installments}
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
        )}
      </div>

      {/* Payment Drawer */}
      {selectedTitle && (
        <PaymentDrawer
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
