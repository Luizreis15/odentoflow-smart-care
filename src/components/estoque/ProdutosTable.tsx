import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface ProdutosTableProps {
  products: any[];
  isLoading: boolean;
}

export function ProdutosTable({ products, isLoading }: ProdutosTableProps) {
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}