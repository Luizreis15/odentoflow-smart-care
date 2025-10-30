import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NovoModeloAnamneseModal from "@/components/anamnese/NovoModeloAnamneseModal";

interface AnamneseModelo {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
}

export default function GlobalAnamnese() {
  const [modelos, setModelos] = useState<AnamneseModelo[]>([]);
  const [filteredModelos, setFilteredModelos] = useState<AnamneseModelo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadModelos();
  }, []);

  useEffect(() => {
    filterModelos();
  }, [searchTerm, modelos]);

  const loadModelos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("anamnese_modelos")
        .select("*")
        .is("clinica_id", null)
        .order("nome");

      if (error) throw error;
      setModelos(data || []);
    } catch (error) {
      console.error("Erro ao carregar modelos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os modelos de anamnese.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterModelos = () => {
    if (!searchTerm) {
      setFilteredModelos(modelos);
      return;
    }

    const filtered = modelos.filter((modelo) =>
      modelo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modelo.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredModelos(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este modelo global?")) return;

    try {
      const { error } = await supabase
        .from("anamnese_modelos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Modelo excluído",
        description: "O modelo foi excluído com sucesso.",
      });
      loadModelos();
    } catch (error) {
      console.error("Erro ao excluir modelo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o modelo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Modelos Globais de Anamnese</h1>
        <p className="text-muted-foreground">
          Gerencie modelos de anamnese que ficarão disponíveis para todas as clínicas
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Modelos</CardTitle>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Modelo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar modelos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredModelos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum modelo global encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {filteredModelos.map((modelo) => (
                <div
                  key={modelo.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{modelo.nome}</h3>
                      <Badge variant={modelo.ativo ? "default" : "secondary"}>
                        {modelo.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    {modelo.descricao && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {modelo.descricao}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(modelo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NovoModeloAnamneseModal
        open={showModal}
        onOpenChange={setShowModal}
        onSuccess={() => {
          loadModelos();
        }}
        clinicaId={null}
      />
    </div>
  );
}
