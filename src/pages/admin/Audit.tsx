import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Eye, Shield, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AuditLog {
  id: string;
  user_id: string;
  user_name?: string;
  acao: string;
  modulo: string | null;
  resultado: string | null;
  ip_address: string | null;
  created_at: string;
}

interface ImpersonationLog {
  id: string;
  admin_user_id: string;
  admin_name?: string;
  impersonated_clinic_id: string;
  clinic_name?: string;
  started_at: string;
  ended_at: string | null;
  reason: string | null;
}

const AdminAudit = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [impersonationLogs, setImpersonationLogs] = useState<ImpersonationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [logType, setLogType] = useState<"audit" | "impersonation">("audit");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      // Load audit logs
      const { data: audits } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      // Get user names for audit logs
      const userIds = [...new Set((audits || []).map((a) => a.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map((profiles || []).map((p) => [p.id, p.full_name]));

      const logsWithNames = (audits || []).map((log) => ({
        ...log,
        user_name: profileMap.get(log.user_id) || "Usuário desconhecido",
      }));

      setAuditLogs(logsWithNames);

      // Load impersonation logs
      const { data: impersonations } = await supabase
        .from("admin_impersonation_logs")
        .select(`
          *,
          profiles!admin_impersonation_logs_admin_user_id_fkey(full_name),
          clinicas(nome)
        `)
        .order("started_at", { ascending: false })
        .limit(50);

      const impersonationData: ImpersonationLog[] = (impersonations || []).map((log: any) => ({
        id: log.id,
        admin_user_id: log.admin_user_id,
        admin_name: log.profiles?.full_name || "Admin",
        impersonated_clinic_id: log.impersonated_clinic_id,
        clinic_name: log.clinicas?.nome || "Clínica",
        started_at: log.started_at,
        ended_at: log.ended_at,
        reason: log.reason,
      }));

      setImpersonationLogs(impersonationData);
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (acao: string) => {
    const colors: Record<string, string> = {
      login: "bg-green-500/20 text-green-400",
      logout: "bg-slate-500/20 text-slate-400",
      create: "bg-blue-500/20 text-blue-400",
      update: "bg-amber-500/20 text-amber-400",
      delete: "bg-red-500/20 text-red-400",
    };
    const actionKey = Object.keys(colors).find((key) => acao.toLowerCase().includes(key)) || "update";
    return (
      <Badge className={colors[actionKey]}>
        {acao}
      </Badge>
    );
  };

  const filteredAuditLogs = auditLogs.filter(
    (log) =>
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.modulo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredImpersonationLogs = impersonationLogs.filter(
    (log) =>
      log.admin_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.clinic_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Auditoria</h1>
        <p className="text-slate-400">Logs de atividades do sistema</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar nos logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-700 border-slate-600 text-white"
          />
        </div>
        <Select value={logType} onValueChange={(v: any) => setLogType(v)}>
          <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600">
            <SelectItem value="audit">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Logs Gerais
              </div>
            </SelectItem>
            <SelectItem value="impersonation">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Impersonação
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : logType === "audit" ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Logs de Auditoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Data/Hora</TableHead>
                  <TableHead className="text-slate-400">Usuário</TableHead>
                  <TableHead className="text-slate-400">Ação</TableHead>
                  <TableHead className="text-slate-400">Módulo</TableHead>
                  <TableHead className="text-slate-400">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuditLogs.map((log) => (
                  <TableRow key={log.id} className="border-slate-700">
                    <TableCell className="text-slate-300">
                      {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-white">{log.user_name}</TableCell>
                    <TableCell>{getActionBadge(log.acao)}</TableCell>
                    <TableCell className="text-slate-300">{log.modulo || "-"}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{log.ip_address || "-"}</TableCell>
                  </TableRow>
                ))}
                {filteredAuditLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                      Nenhum log encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Logs de Impersonação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Início</TableHead>
                  <TableHead className="text-slate-400">Fim</TableHead>
                  <TableHead className="text-slate-400">Admin</TableHead>
                  <TableHead className="text-slate-400">Clínica</TableHead>
                  <TableHead className="text-slate-400">Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredImpersonationLogs.map((log) => (
                  <TableRow key={log.id} className="border-slate-700">
                    <TableCell className="text-slate-300">
                      {format(new Date(log.started_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {log.ended_at
                        ? format(new Date(log.ended_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : <Badge className="bg-amber-500/20 text-amber-400">Ativo</Badge>
                      }
                    </TableCell>
                    <TableCell className="text-white">{log.admin_name}</TableCell>
                    <TableCell className="text-slate-300">{log.clinic_name}</TableCell>
                    <TableCell className="text-slate-500 text-sm max-w-xs truncate">
                      {log.reason || "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredImpersonationLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                      Nenhum log de impersonação encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminAudit;
