import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, UserCheck, RefreshCw, Ban, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DetalhesClinicaModal from "@/components/superadmin/DetalhesClinicaModal";
import { Database } from "@/integrations/supabase/types";

type ClinicRow = Database["public"]["Tables"]["clinicas"]["Row"];

export default function Locatarios() {
  const [tenants, setTenants] = useState<ClinicRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Modal states
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [impersonateDialogOpen, setImpersonateDialogOpen] = useState(false);
  const [clinicToImpersonate, setClinicToImpersonate] = useState<ClinicRow | null>(null);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [clinicToChangeStatus, setClinicToChangeStatus] = useState<ClinicRow | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const { data, error } = await supabase
        .from("clinicas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error("Erro ao carregar locatários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os locatários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (clinicId: string) => {
    setSelectedClinicId(clinicId);
    setDetailsModalOpen(true);
  };

  const handleImpersonateClick = (clinic: ClinicRow) => {
    setClinicToImpersonate(clinic);
    setImpersonateDialogOpen(true);
  };

  const handleConfirmImpersonate = async () => {
    if (!clinicToImpersonate) return;
    
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Log impersonation start
      await supabase.from("admin_impersonation_logs").insert({
        admin_user_id: user.id,
        impersonated_clinic_id: clinicToImpersonate.id,
        reason: "Acesso administrativo",
      });

      // Store impersonation state
      localStorage.setItem("admin_impersonation", JSON.stringify({
        clinicId: clinicToImpersonate.id,
        clinicName: clinicToImpersonate.nome,
        startedAt: new Date().toISOString(),
      }));

      toast({
        title: "Impersonação iniciada",
        description: `Acessando como ${clinicToImpersonate.nome}`,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao iniciar impersonação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a impersonação",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
      setImpersonateDialogOpen(false);
    }
  };

  const handleStatusChangeClick = (clinic: ClinicRow, status: string) => {
    setClinicToChangeStatus(clinic);
    setNewStatus(status);
    setStatusChangeDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!clinicToChangeStatus) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("clinicas")
        .update({ status_assinatura: newStatus as Database["public"]["Enums"]["status_assinatura"] })
        .eq("id", clinicToChangeStatus.id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Clínica ${newStatus === "active" ? "reativada" : "suspensa"} com sucesso`,
      });

      loadTenants();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
      setStatusChangeDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      active: { variant: "default", label: "Ativo" },
      trialing: { variant: "secondary", label: "Trial" },
      past_due: { variant: "destructive", label: "Inadimplente" },
      canceled: { variant: "outline", label: "Cancelado" },
      incomplete: { variant: "outline", label: "Incompleto" },
    };

    const config = statusConfig[status || ""] || { variant: "outline" as const, label: status || "Desconhecido" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPlanBadge = (plan: string | null) => {
    const planColors: Record<string, string> = {
      starter: "bg-blue-500",
      pro: "bg-purple-500",
      enterprise: "bg-orange-500",
    };

    return (
      <Badge className={`${planColors[plan || ""] || "bg-gray-500"} text-white`}>
        {plan || "N/A"}
      </Badge>
    );
  };

  const filteredTenants = tenants.filter((tenant) =>
    tenant.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tenant.cnpj && tenant.cnpj.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Locatários (Clínicas)</h1>
        <p className="text-muted-foreground">
          Gerencie todas as clínicas cadastradas no sistema
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Clínicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tenants.filter((t) => t.status_assinatura === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Trial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {tenants.filter((t) => t.status_assinatura === "trialing").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inadimplentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {tenants.filter((t) => t.status_assinatura === "past_due").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.nome}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {tenant.cnpj || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tenant.tipo}</Badge>
                  </TableCell>
                  <TableCell>{getPlanBadge(tenant.plano)}</TableCell>
                  <TableCell>
                    {getStatusBadge(tenant.status_assinatura)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString("pt-BR") : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        title="Ver detalhes"
                        onClick={() => handleViewDetails(tenant.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        title="Impersonar"
                        onClick={() => handleImpersonateClick(tenant)}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      {tenant.status_assinatura === "canceled" || tenant.status_assinatura === "past_due" ? (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          title="Reativar"
                          onClick={() => handleStatusChangeClick(tenant, "active")}
                        >
                          <RefreshCw className="h-4 w-4 text-green-600" />
                        </Button>
                      ) : (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          title="Suspender"
                          onClick={() => handleStatusChangeClick(tenant, "canceled")}
                        >
                          <Ban className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <DetalhesClinicaModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        clinicId={selectedClinicId}
        onUpdate={loadTenants}
      />

      {/* Dialog de Impersonação */}
      <AlertDialog open={impersonateDialogOpen} onOpenChange={setImpersonateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Impersonação</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a acessar o sistema como a clínica{" "}
              <strong>{clinicToImpersonate?.nome}</strong>.
              <br /><br />
              Todas as suas ações serão registradas para fins de auditoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImpersonate} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Alteração de Status */}
      <AlertDialog open={statusChangeDialogOpen} onOpenChange={setStatusChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {newStatus === "active" ? "Reativar Clínica" : "Suspender Clínica"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {newStatus === "active" 
                ? `Você está prestes a reativar a clínica "${clinicToChangeStatus?.nome}". Ela poderá acessar o sistema normalmente.`
                : `Você está prestes a suspender a clínica "${clinicToChangeStatus?.nome}". Ela perderá o acesso ao sistema.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmStatusChange} 
              disabled={actionLoading}
              className={newStatus !== "active" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
