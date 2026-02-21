import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, UserPlus, CreditCard, TrendingUp, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { format, subDays, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardStats {
  totalClinics: number;
  activeClinics: number;
  trialClinics: number;
  totalUsers: number;
  totalPatients: number;
  totalLeads: number;
  newLeadsToday: number;
  newLeadsWeek: number;
  pendingSubscriptions: number;
  cancelledThisMonth: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClinics: 0,
    activeClinics: 0,
    trialClinics: 0,
    totalUsers: 0,
    totalPatients: 0,
    totalLeads: 0,
    newLeadsToday: 0,
    newLeadsWeek: 0,
    pendingSubscriptions: 0,
    cancelledThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentClinics, setRecentClinics] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const weekAgo = subDays(new Date(), 7).toISOString();
      const monthStart = startOfMonth(new Date()).toISOString();

      const [
        clinicsRes,
        usersRes,
        patientsRes,
        leadsRes,
        leadsWeekRes,
        recentLeadsRes,
        recentClinicsRes,
      ] = await Promise.all([
        supabase.from("clinicas").select("id, status_assinatura", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("patients").select("id", { count: "exact" }),
        supabase.from("leads").select("id, created_at", { count: "exact" }),
        supabase.from("leads").select("id", { count: "exact" }).gte("created_at", weekAgo),
        supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("clinicas").select("id, nome, created_at, status_assinatura").order("created_at", { ascending: false }).limit(5),
      ]);

      const clinics = clinicsRes.data || [];
      const activeClinics = clinics.filter(c => c.status_assinatura === "active").length;
      const trialClinics = clinics.filter(c => c.status_assinatura === "trialing").length;

      const leads = leadsRes.data || [];
      const leadsToday = leads.filter(l => l.created_at?.startsWith(today)).length;

      setStats({
        totalClinics: clinicsRes.count || 0,
        activeClinics,
        trialClinics,
        totalUsers: usersRes.count || 0,
        totalPatients: patientsRes.count || 0,
        totalLeads: leadsRes.count || 0,
        newLeadsToday: leadsToday,
        newLeadsWeek: leadsWeekRes.count || 0,
        pendingSubscriptions: clinics.filter(c => c.status_assinatura === "past_due").length,
        cancelledThisMonth: 0,
      });

      setRecentLeads(recentLeadsRes.data || []);
      setRecentClinics(recentClinicsRes.data || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Clínicas Totais", value: stats.totalClinics, icon: Building2, color: "text-blue-500" },
    { label: "Clínicas Ativas", value: stats.activeClinics, icon: CheckCircle, color: "text-green-500" },
    { label: "Em Teste Grátis", value: stats.trialClinics, icon: Clock, color: "text-amber-500" },
    { label: "Usuários", value: stats.totalUsers, icon: Users, color: "text-purple-500" },
    { label: "Pacientes", value: stats.totalPatients, icon: Users, color: "text-cyan-500" },
    { label: "Leads Total", value: stats.totalLeads, icon: UserPlus, color: "text-indigo-500" },
    { label: "Leads (Semana)", value: stats.newLeadsWeek, icon: TrendingUp, color: "text-emerald-500" },
    { label: "Pagamentos Pendentes", value: stats.pendingSubscriptions, icon: AlertTriangle, color: "text-red-500" },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-500/20 text-green-400",
      trialing: "bg-amber-500/20 text-amber-400",
      past_due: "bg-red-500/20 text-red-400",
      cancelled: "bg-slate-500/20 text-slate-400",
    };
    const labels: Record<string, string> = {
      active: "Ativo",
      trialing: "Teste Grátis",
      past_due: "Pendente",
      cancelled: "Cancelado",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || styles.cancelled}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getLeadStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: "bg-blue-500/20 text-blue-400",
      contacted: "bg-amber-500/20 text-amber-400",
      qualified: "bg-purple-500/20 text-purple-400",
      negotiating: "bg-cyan-500/20 text-cyan-400",
      converted: "bg-green-500/20 text-green-400",
      lost: "bg-red-500/20 text-red-400",
    };
    const labels: Record<string, string> = {
      new: "Novo",
      contacted: "Contatado",
      qualified: "Qualificado",
      negotiating: "Negociando",
      converted: "Convertido",
      lost: "Perdido",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || styles.new}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Administrativo</h1>
        <p className="text-slate-400">Visão geral do sistema Flowdent</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Clinics */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Clínicas Recentes</CardTitle>
            <CardDescription className="text-slate-400">
              Últimas clínicas cadastradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{clinic.nome}</p>
                    <p className="text-slate-400 text-sm">
                      {format(new Date(clinic.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  {getStatusBadge(clinic.status_assinatura || "trialing")}
                </div>
              ))}
              {recentClinics.length === 0 && (
                <p className="text-slate-500 text-center py-4">Nenhuma clínica ainda</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Leads Recentes</CardTitle>
            <CardDescription className="text-slate-400">
              Últimos leads capturados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{lead.name}</p>
                    <p className="text-slate-400 text-sm">{lead.email}</p>
                  </div>
                  {getLeadStatusBadge(lead.status)}
                </div>
              ))}
              {recentLeads.length === 0 && (
                <p className="text-slate-500 text-center py-4">Nenhum lead ainda</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
