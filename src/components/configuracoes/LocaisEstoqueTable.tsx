import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Location {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: string | null;
  ativo: boolean;
}

interface LocaisEstoqueTableProps {
  locations: Location[];
}

export function LocaisEstoqueTable({ locations }: LocaisEstoqueTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("stock_locations")
        .update({ ativo: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "Status do local atualizado com sucesso",
      });

      queryClient.invalidateQueries({ queryKey: ["stock-locations"] });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este local?")) return;

    try {
      const { error } = await supabase
        .from("stock_locations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Local excluído",
        description: "Local de estoque excluído com sucesso",
      });

      queryClient.invalidateQueries({ queryKey: ["stock-locations"] });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir local",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!locations || locations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum local cadastrado. Clique em "Novo Local" para começar.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {locations.map((location) => (
          <TableRow key={location.id}>
            <TableCell className="font-medium">{location.nome}</TableCell>
            <TableCell>
              <Badge variant="outline">{location.tipo || "deposito"}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">{location.descricao || "-"}</TableCell>
            <TableCell>
              <Badge variant={location.ativo ? "default" : "secondary"}>
                {location.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleStatus(location.id, location.ativo)}
                  title={location.ativo ? "Desativar" : "Ativar"}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(location.id)}
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
