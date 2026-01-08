import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Search, CreditCard, AlertTriangle, CheckCircle, Clock, XCircle, Loader2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Subscription {
  id: string;
  clinic_name: string;
  clinic_id: string;
  status: string | null;
  plano: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_end: string | null;
  created_at: string;
}

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("clinicas")
        .select("id, nome, status_assinatura, plano, stripe_subscription_id, stripe_customer_id, current_period_end, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const subs: Subscription[] = (data || []).map((clinic) => ({
        id: clinic.id,
        clinic_name: clinic.nome,
        clinic_id: clinic.id,
        status: clinic.status_assinatura,
        plano: clinic.plano,
        stripe_subscription_id: clinic.stripe_subscription_id,
        stripe_customer_id: clinic.stripe_customer_id,
        current_period_end: clinic.current_period_end,
        created_at: clinic.created_at,
      }));

      setSubscriptions(subs);
    } catch (error) {
      console.error("Error loading subscriptions:", error);
      toast.error("Erro ao carregar assinaturas");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
      active: { icon: CheckCircle, color: "bg-green-500/20 text-green-400", label: "Ativo" },
      trialing: { icon: Clock, color: "bg-amber-500/20 text-amber-400", label: "Trial" },
      past_due: { icon: AlertTriangle, color: "bg-red-500/20 text-red-400", label: "Pendente" },
      cancelled: { icon: XCircle, color: "bg-slate-500/20 text-slate-400", label: "Cancelado" },
      incomplete: { icon: AlertTriangle, color: "bg-orange-500/20 text-orange-400", label: "Incompleto" },
    };
    
    const config = statusConfig[status || "trialing"] || statusConfig.trialing;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const handleOpenStripe = (customerId: string | null) => {
    if (!customerId) {
      toast.error("Cliente não possui ID Stripe");
      return;
    }
    window.open(`https://dashboard.stripe.com/customers/${customerId}`, "_blank");
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.clinic_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === "active").length,
    trial: subscriptions.filter((s) => s.status === "trialing").length,
    pastDue: subscriptions.filter((s) => s.status === "past_due").length,
    cancelled: subscriptions.filter((s) => s.status === "cancelled").length,
  };

  const statusButtons = [
    { value: "all", label: "Todas", count: stats.total },
    { value: "active", label: "Ativas", count: stats.active },
    { value: "trialing", label: "Trial", count: stats.trial },
    { value: "past_due", label: "Pendentes", count: stats.pastDue },
    { value: "cancelled", label: "Canceladas", count: stats.cancelled },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Assinaturas</h1>
        <p className="text-slate-400">Gerenciar assinaturas e pagamentos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-green-400 text-sm">Ativas</p>
            <p className="text-2xl font-bold text-white">{stats.active}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-amber-400 text-sm">Trial</p>
            <p className="text-2xl font-bold text-white">{stats.trial}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-red-400 text-sm">Pendentes</p>
            <p className="text-2xl font-bold text-white">{stats.pastDue}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm">Canceladas</p>
            <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusButtons.map((btn) => (
          <Button
            key={btn.value}
            variant={statusFilter === btn.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(btn.value)}
            className="shrink-0"
          >
            {btn.label} ({btn.count})
          </Button>
        ))}
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome da clínica..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Clínica</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Plano</TableHead>
                  <TableHead className="text-slate-400">Vencimento</TableHead>
                  <TableHead className="text-slate-400">Criado em</TableHead>
                  <TableHead className="text-slate-400">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id} className="border-slate-700">
                    <TableCell className="text-white font-medium">
                      {sub.clinic_name}
                    </TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell className="text-slate-300">
                      {sub.plano || "Free"}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {sub.current_period_end
                        ? format(new Date(sub.current_period_end), "dd/MM/yyyy", { locale: ptBR })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {format(new Date(sub.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {sub.stripe_customer_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenStripe(sub.stripe_customer_id)}
                          className="text-slate-400 hover:text-white"
                          title="Ver no Stripe"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSubscriptions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                      Nenhuma assinatura encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptions;
