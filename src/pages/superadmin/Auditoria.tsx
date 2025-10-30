import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuditLog {
  id: string;
  actor_id: string | null;
  tenant_id: string | null;
  resource: string;
  action: string;
  payload_diff: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function Auditoria() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("system_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os logs de auditoria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      insert: { variant: "default", label: "Criar" },
      update: { variant: "secondary", label: "Atualizar" },
      delete: { variant: "destructive", label: "Deletar" },
    };

    const config = actionColors[action] || { variant: "secondary" as const, label: action };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const resources = Array.from(new Set(logs.map((log) => log.resource)));
  const actions = Array.from(new Set(logs.map((log) => log.action)));

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesResource =
      resourceFilter === "all" || log.resource === resourceFilter;

    const matchesAction = actionFilter === "all" || log.action === actionFilter;

    return matchesSearch && matchesResource && matchesAction;
  });

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
        <h1 className="text-3xl font-bold">Auditoria</h1>
        <p className="text-muted-foreground">
          Registro completo de todas as ações realizadas no sistema
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por recurso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os recursos</SelectItem>
            {resources.map((resource) => (
              <SelectItem key={resource} value={resource}>
                {resource}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ações</SelectItem>
            {actions.map((action) => (
              <SelectItem key={action} value={action}>
                {action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>
            Logs de Auditoria ({filteredLogs.length} registros)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {new Date(log.created_at).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.resource}</Badge>
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.actor_id?.substring(0, 8) || "Sistema"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.ip_address || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log encontrado com os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
