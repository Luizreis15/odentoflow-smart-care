import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Tenant {
  id: string;
  nome: string;
  cnpj: string | null;
  telefone: string | null;
  tipo: string;
  status_assinatura: string;
  plano: string;
  created_at: string;
  owner_user_id: string | null;
}

export default function Locatarios() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      active: { variant: "default", label: "Ativo" },
      trialing: { variant: "secondary", label: "Trial" },
      past_due: { variant: "destructive", label: "Inadimplente" },
      canceled: { variant: "outline", label: "Cancelado" },
    };

    const config = statusConfig[status] || { variant: "outline" as const, label: status };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    const planColors: Record<string, string> = {
      starter: "bg-blue-500",
      professional: "bg-purple-500",
      enterprise: "bg-orange-500",
    };

    return (
      <Badge className={`${planColors[plan] || "bg-gray-500"} text-white`}>
        {plan}
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
                    {new Date(tenant.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" title="Ver detalhes">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" title="Impersonar">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
