import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, DollarSign, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  full_name: string;
  email: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Check if user is super admin
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "super_admin")
        .maybeSingle();

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      // Super admins can access without clinic
      if (userRole) {
        setProfile(profileData);
        setLoading(false);
        return;
      }

      // Check if user has completed onboarding
      if (!profileData?.clinic_id) {
        navigate("/onboarding/welcome");
        return;
      }

      // Check if onboarding is completed
      const { data: clinicData } = await supabase
        .from("clinicas")
        .select("onboarding_status")
        .eq("id", profileData.clinic_id)
        .single();

      if (clinicData?.onboarding_status !== "completed") {
        navigate("/onboarding/welcome");
        return;
      }

      setProfile(profileData);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        // Check if user is super admin
        const { data: userRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "super_admin")
          .maybeSingle();

        // Super admins can access without clinic
        if (userRole) {
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("clinic_id")
          .eq("id", session.user.id)
          .single();

        if (!profileData?.clinic_id) {
          navigate("/onboarding/welcome");
        } else {
          // Check if onboarding is completed
          const { data: clinicData } = await supabase
            .from("clinicas")
            .select("onboarding_status")
            .eq("id", profileData.clinic_id)
            .single();

          if (clinicData?.onboarding_status !== "completed") {
            navigate("/onboarding/welcome");
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <DashboardLayout user={profile}>
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={profile}>
      
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo, {profile?.full_name || "Usuário"}!
          </h1>
          <p className="text-muted-foreground">
            Aqui está um resumo da sua clínica hoje.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Consultas Hoje
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-1">
                +2 desde ontem
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pacientes Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">248</div>
              <p className="text-xs text-muted-foreground mt-1">
                +18 este mês
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita Mensal
              </CardTitle>
              <DollarSign className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 45.230</div>
              <p className="text-xs text-muted-foreground mt-1">
                +12% vs. mês passado
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Próxima Consulta
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14:30</div>
              <p className="text-xs text-muted-foreground mt-1">
                Maria Silva - Limpeza
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos Recentes</CardTitle>
              <CardDescription>
                Últimas consultas agendadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "João Santos", time: "09:00", type: "Consulta" },
                  { name: "Ana Paula", time: "10:30", type: "Limpeza" },
                  { name: "Carlos Mendes", time: "14:00", type: "Canal" },
                ].map((appointment, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{appointment.name}</p>
                      <p className="text-sm text-muted-foreground">{appointment.type}</p>
                    </div>
                    <span className="text-sm font-medium text-primary">{appointment.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesse rapidamente as funcionalidades principais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Novo Agendamento", icon: Calendar },
                  { label: "Cadastrar Paciente", icon: Users },
                  { label: "Ver Financeiro", icon: DollarSign },
                  { label: "Relatórios", icon: Clock },
                ].map((action, i) => (
                  <button
                    key={i}
                    className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-accent/50 transition-all"
                  >
                    <action.icon className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-sm font-medium text-center">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
    </DashboardLayout>
  );
};

export default Dashboard;