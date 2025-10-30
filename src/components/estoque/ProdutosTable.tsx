import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
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

interface ProdutosTableProps {
  products: any[];
  isLoading: boolean;
  onEdit: (product: any) => void;
}

export function ProdutosTable({ products, isLoading, onEdit }: ProdutosTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ ativo: false })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Produto excluído",
        description: "Produto inativado com sucesso",
      });

      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  if (isLoading) {
    return <div className="text-center py-8">Carregando produtos...</div>;
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum produto cadastrado
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Estoque Atual</TableHead>
            <TableHead>Estoque Mínimo</TableHead>
            <TableHead>Custo Médio</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const totalStock = product.stocks?.reduce((sum: number, s: any) => sum + Number(s.quantidade || 0), 0) || 0;
            const avgCost = product.stocks?.reduce((sum: number, s: any) => sum + Number(s.custo_medio || 0), 0) / (product.stocks?.length || 1) || 0;
            const belowMinimum = totalStock < Number(product.estoque_minimo || 0);

            return (
              <TableRow key={product.id}>
                <TableCell className="font-mono text-sm">
                  {product.codigo_interno}
                </TableCell>
                <TableCell className="font-medium">{product.nome}</TableCell>
                <TableCell>{product.categoria || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {totalStock} {product.unidade}
                    {belowMinimum && (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </TableCell>
                <TableCell>{product.estoque_minimo || 0} {product.unidade}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(avgCost)}
                </TableCell>
                <TableCell>
                  {product.ativo ? (
                    <Badge variant="default">Ativo</Badge>
                  ) : (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja inativar este produto? Esta ação pode ser revertida posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}