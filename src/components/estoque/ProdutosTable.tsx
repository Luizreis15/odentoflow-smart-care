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
import { DataTable, DataTableColumn } from "@/components/desktop/DataTable";

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
      toast({ title: "Produto excluído", description: "Produto inativado com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteId(null);
    } catch (error: any) {
      toast({ title: "Erro ao excluir produto", description: error.message, variant: "destructive" });
    }
  };

  const columns: DataTableColumn<any>[] = [
    { key: "codigo_interno", label: "Código", sortable: true, className: "font-mono text-sm" },
    { key: "nome", label: "Nome", sortable: true, className: "font-medium" },
    { key: "categoria", label: "Categoria", sortable: true },
    {
      key: "estoque",
      label: "Estoque Atual",
      sortable: true,
      render: (product) => {
        const totalStock = product.stocks?.reduce((sum: number, s: any) => sum + Number(s.quantidade || 0), 0) || 0;
        const belowMinimum = totalStock < Number(product.estoque_minimo || 0);
        return (
          <div className="flex items-center gap-2">
            {totalStock} {product.unidade}
            {belowMinimum && <AlertTriangle className="h-4 w-4 text-destructive" />}
          </div>
        );
      },
    },
    {
      key: "estoque_minimo",
      label: "Estoque Mínimo",
      sortable: true,
      render: (product) => <>{product.estoque_minimo || 0} {product.unidade}</>,
    },
    {
      key: "custo",
      label: "Custo Médio",
      sortable: true,
      render: (product) => {
        const avgCost = product.stocks?.reduce((sum: number, s: any) => sum + Number(s.custo_medio || 0), 0) / (product.stocks?.length || 1) || 0;
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(avgCost);
      },
    },
    {
      key: "ativo",
      label: "Status",
      sortable: true,
      render: (product) => (
        <Badge variant={product.ativo ? "default" : "secondary"}>
          {product.ativo ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      key: "acoes",
      label: "Ações",
      headerClassName: "text-right",
      className: "text-right",
      render: (product) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(product.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        searchPlaceholder="Buscar produto..."
        emptyMessage="Nenhum produto cadastrado"
        selectable
      />

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
    </>
  );
}
