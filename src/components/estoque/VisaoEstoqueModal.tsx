import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Minus, Search } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import {
  Dialog as AjusteDialog,
  DialogContent as AjusteDialogContent,
  DialogHeader as AjusteDialogHeader,
  DialogTitle as AjusteDialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditProdutoModal } from "./EditProdutoModal";

interface VisaoEstoqueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VisaoEstoqueModal({ open, onOpenChange }: VisaoEstoqueModalProps) {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [editProduct, setEditProduct] = useState<any>(null);
  const [ajusteProduct, setAjusteProduct] = useState<any>(null);
  const [ajusteQuantidade, setAjusteQuantidade] = useState("");
  const [ajusteTipo, setAjusteTipo] = useState<"entrada" | "saida">("entrada");
  const [ajusteMotivo, setAjusteMotivo] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data } = await supabase
        .from("profiles")
        .select("clinic_id")
        .eq("id", user.id)
        .single();
      return data;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["estoque-produtos", profile?.clinic_id, search],
    queryFn: async () => {
      if (!profile?.clinic_id) return [];
      
      let query = supabase
        .from("products")
        .select(`
          *,
          stocks(quantidade, custo_medio, stock_locations(nome))
        `)
        .eq("clinica_id", profile.clinic_id)
        .eq("ativo", true)
        .order("nome");

      if (search) {
        query = query.or(`nome.ilike.%${search}%,marca.ilike.%${search}%,codigo_interno.ilike.%${search}%`);
      }

      const { data } = await query;
      return data || [];
    },
    enabled: !!profile?.clinic_id && open,
  });

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

      queryClient.invalidateQueries({ queryKey: ["estoque-produtos"] });
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

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === products?.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products?.map(p => p.id) || []));
    }
  };

  const handleAjusteEstoque = async () => {
    if (!ajusteProduct || !ajusteQuantidade || !profile?.clinic_id) return;

    try {
      // Get default location
      const { data: locations } = await supabase
        .from("stock_locations")
        .select("id")
        .eq("clinica_id", profile.clinic_id)
        .eq("ativo", true)
        .limit(1);

      if (!locations || locations.length === 0) {
        throw new Error("Nenhum local de estoque ativo encontrado");
      }

      const locationId = locations[0].id;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create stock move
      const quantidade = parseFloat(ajusteQuantidade);
      const custoUnitario = ajusteProduct.stocks?.[0]?.custo_medio || 0;
      const custoTotal = (ajusteTipo === "entrada" ? quantidade : -quantidade) * custoUnitario;
      
      const moveData: any = {
        clinica_id: profile.clinic_id,
        product_id: ajusteProduct.id,
        tipo: ajusteTipo,
        quantidade: ajusteTipo === "entrada" ? quantidade : -quantidade,
        custo_unitario: custoUnitario,
        custo_total: custoTotal,
        usuario_id: user.id,
        doc_tipo: "ajuste_manual",
        observacoes: ajusteMotivo || `Ajuste manual - ${ajusteTipo}`,
      };

      if (ajusteTipo === "entrada") {
        moveData.location_to_id = locationId;
      } else {
        moveData.location_from_id = locationId;
      }
      
      const { error: moveError } = await supabase.from("stock_moves").insert(moveData);

      if (moveError) throw moveError;

      // Update stock
      const currentStock = ajusteProduct.stocks?.[0];
      const currentQty = currentStock?.quantidade || 0;
      const adjustment = parseFloat(ajusteQuantidade);
      const newQty = ajusteTipo === "entrada" ? currentQty + adjustment : currentQty - adjustment;

      if (currentStock) {
        const { error: stockError } = await supabase
          .from("stocks")
          .update({ quantidade: newQty })
          .eq("product_id", ajusteProduct.id)
          .eq("location_id", locationId);

        if (stockError) throw stockError;
      } else {
        const { error: stockError } = await supabase.from("stocks").insert({
          product_id: ajusteProduct.id,
          location_id: locationId,
          quantidade: newQty,
          custo_medio: 0,
        });

        if (stockError) throw stockError;
      }

      toast({
        title: "Estoque ajustado",
        description: `${ajusteTipo === "entrada" ? "Entrada" : "Saída"} de ${ajusteQuantidade} ${ajusteProduct.unidade} realizada`,
      });

      queryClient.invalidateQueries({ queryKey: ["estoque-produtos"] });
      queryClient.invalidateQueries({ queryKey: ["stock-dashboard"] });
      setAjusteProduct(null);
      setAjusteQuantidade("");
      setAjusteMotivo("");
    } catch (error: any) {
      toast({
        title: "Erro ao ajustar estoque",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTotalStock = (product: any) => {
    return product.stocks?.reduce((sum: number, s: any) => sum + Number(s.quantidade || 0), 0) || 0;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Visão do Estoque</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, marca ou código..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" onClick={handleSelectAll}>
                {selectedProducts.size === products?.length ? "Desmarcar Todos" : "Selecionar Todos"}
              </Button>
              <Badge variant="secondary">
                {selectedProducts.size} selecionado(s)
              </Badge>
            </div>

            <div className="border rounded-lg flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedProducts.size === products?.length && products?.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Mín/Máx</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : !products || products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Nenhum produto encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => {
                      const totalStock = getTotalStock(product);
                      const belowMin = totalStock < (product.estoque_minimo || 0);
                      
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedProducts.has(product.id)}
                              onChange={() => handleToggleSelect(product.id)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {product.codigo_interno}
                          </TableCell>
                          <TableCell className="font-medium">{product.nome}</TableCell>
                          <TableCell>{product.marca || "-"}</TableCell>
                          <TableCell>{product.categoria || "-"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={belowMin ? "text-destructive font-semibold" : ""}>
                                {totalStock} {product.unidade}
                              </span>
                              {belowMin && <Badge variant="destructive" className="text-xs">Baixo</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {product.estoque_minimo || 0} / {product.estoque_maximo || "-"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {product.stocks?.[0]?.stock_locations?.nome || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setAjusteProduct(product)}
                                title="Ajustar estoque"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditProduct(product)}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(product.id)}
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para Delete */}
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

      {/* Modal de Ajuste de Estoque */}
      <AjusteDialog open={!!ajusteProduct} onOpenChange={() => setAjusteProduct(null)}>
        <AjusteDialogContent>
          <AjusteDialogHeader>
            <AjusteDialogTitle>Ajustar Estoque - {ajusteProduct?.nome}</AjusteDialogTitle>
          </AjusteDialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Estoque Atual</Label>
              <div className="text-2xl font-bold">
                {getTotalStock(ajusteProduct)} {ajusteProduct?.unidade}
              </div>
            </div>

            <div>
              <Label htmlFor="tipo">Tipo de Ajuste</Label>
              <Select value={ajusteTipo} onValueChange={(value: any) => setAjusteTipo(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-green-600" />
                      Entrada (Adicionar)
                    </div>
                  </SelectItem>
                  <SelectItem value="saida">
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-red-600" />
                      Saída (Remover)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                step="0.01"
                value={ajusteQuantidade}
                onChange={(e) => setAjusteQuantidade(e.target.value)}
                placeholder="Digite a quantidade"
              />
            </div>

            <div>
              <Label htmlFor="motivo">Motivo (opcional)</Label>
              <Input
                id="motivo"
                value={ajusteMotivo}
                onChange={(e) => setAjusteMotivo(e.target.value)}
                placeholder="Ex: Correção de inventário, quebra, etc."
              />
            </div>

            {ajusteQuantidade && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Novo Estoque:</p>
                <p className="text-2xl font-bold">
                  {ajusteTipo === "entrada"
                    ? getTotalStock(ajusteProduct) + parseFloat(ajusteQuantidade)
                    : getTotalStock(ajusteProduct) - parseFloat(ajusteQuantidade)
                  } {ajusteProduct?.unidade}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAjusteProduct(null)}>
                Cancelar
              </Button>
              <Button onClick={handleAjusteEstoque} disabled={!ajusteQuantidade}>
                Confirmar Ajuste
              </Button>
            </div>
          </div>
        </AjusteDialogContent>
      </AjusteDialog>

      {/* Modal de Edição */}
      {editProduct && (
        <EditProdutoModal
          open={!!editProduct}
          onOpenChange={() => setEditProduct(null)}
          product={editProduct}
        />
      )}
    </>
  );
}
