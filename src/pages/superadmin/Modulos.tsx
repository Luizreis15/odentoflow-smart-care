import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Module {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  is_active: boolean;
}

interface FeatureFlag {
  id: string;
  module_id: string | null;
  key: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
  rollout_percentage: number;
}

export default function Modulos() {
  const [modules, setModules] = useState<Module[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [modulesRes, flagsRes] = await Promise.all([
        supabase.from("system_modules").select("*").order("category, name"),
        supabase.from("feature_flags").select("*").order("name"),
      ]);

      if (modulesRes.error) throw modulesRes.error;
      if (flagsRes.error) throw flagsRes.error;

      setModules(modulesRes.data || []);
      setFeatureFlags(flagsRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("system_modules")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Módulo ${!currentStatus ? "ativado" : "desativado"}`,
      });

      loadData();
    } catch (error) {
      console.error("Erro ao atualizar módulo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o módulo",
        variant: "destructive",
      });
    }
  };

  const toggleFeatureFlag = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("feature_flags")
        .update({ is_enabled: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Feature flag ${!currentStatus ? "ativada" : "desativada"}`,
      });

      loadData();
    } catch (error) {
      console.error("Erro ao atualizar feature flag:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a feature flag",
        variant: "destructive",
      });
    }
  };

  const getCategoryBadge = (category: string | null) => {
    const colors: Record<string, string> = {
      core: "bg-blue-500",
      clinical: "bg-green-500",
      operational: "bg-orange-500",
      documents: "bg-purple-500",
      analytics: "bg-pink-500",
      marketing: "bg-yellow-500",
      engagement: "bg-cyan-500",
    };

    return (
      <Badge
        className={`${colors[category || ""] || "bg-gray-500"} text-white`}
      >
        {category || "other"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Módulos & Feature Flags</h1>
          <p className="text-muted-foreground">
            Configure os módulos disponíveis e feature flags do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Novo Módulo
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Feature Flag
          </Button>
        </div>
      </div>

      {/* Módulos */}
      <Card>
        <CardHeader>
          <CardTitle>Módulos do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell className="font-mono text-sm">
                    {module.code}
                  </TableCell>
                  <TableCell className="font-medium">{module.name}</TableCell>
                  <TableCell>{getCategoryBadge(module.category)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-md">
                    {module.description}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={module.is_active}
                      onCheckedChange={() =>
                        toggleModule(module.id, module.is_active)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
        </CardHeader>
        <CardContent>
          {featureFlags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma feature flag configurada ainda.</p>
              <Button variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Criar primeira feature flag
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Rollout</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureFlags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell className="font-mono text-sm">
                      {flag.key}
                    </TableCell>
                    <TableCell className="font-medium">{flag.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-md">
                      {flag.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {flag.rollout_percentage}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={flag.is_enabled}
                        onCheckedChange={() =>
                          toggleFeatureFlag(flag.id, flag.is_enabled)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
