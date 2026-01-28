import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Pencil, Trash2, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PapelTimbradoModal } from "./PapelTimbradoModal";

interface ContratosTabProps {
  clinicaId: string;
}

export function ContratosTab({ clinicaId }: ContratosTabProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showPapelTimbradoModal, setShowPapelTimbradoModal] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [clinicaId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("templates_contratos")
        .select("*")
        .eq("clinica_id", clinicaId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Templates de Contratos</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie modelos de contratos e termos de consentimento
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPapelTimbradoModal(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Papel Timbrado
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Templates Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.nome}</TableCell>
                  <TableCell className="capitalize">{template.tipo.replace('_', ' ')}</TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      template.ativo 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {template.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {templates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum template cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variáveis Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {['{paciente}', '{cpf}', '{data}', '{procedimentos}', '{profissional}', '{cro}', '{clinica}', '{valor}'].map((variavel) => (
              <div key={variavel} className="p-2 bg-muted rounded text-sm font-mono">
                {variavel}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <PapelTimbradoModal
        open={showPapelTimbradoModal}
        onOpenChange={setShowPapelTimbradoModal}
        clinicaId={clinicaId}
      />
    </div>
  );
}