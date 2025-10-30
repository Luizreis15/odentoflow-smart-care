import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";

interface EntradaEstoqueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ItemEntrada {
  product_id: string;
  quantidade: number;
  custo_unitario: number;
}

export function EntradaEstoqueModal({ open, onOpenChange }: EntradaEstoqueModalProps) {
  const { register, handleSubmit, reset, setValue } = useForm();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<ItemEntrada[]>([]);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductBrand, setNewProductBrand] = useState("");

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

  const { data: products } = useQuery({
    queryKey: ["products", profile?.clinic_id],
    queryFn: async () => {
      if (!profile?.clinic_id) return [];
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("clinica_id", profile.clinic_id)
        .eq("ativo", true)
        .order("nome");
      return data || [];
    },
    enabled: !!profile?.clinic_id,
  });

  const addItem = async (data: any) => {
    if (isNewProduct) {
      // Validate new product fields
      if (!newProductName.trim() || !data.quantidade || !data.custo_unitario) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha nome do produto, quantidade e custo",
          variant: "destructive",
        });
        return;
      }

      // Create new product first
      setIsSubmitting(true);
      try {
        const { count } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("clinica_id", profile?.clinic_id);

        const codigoInterno = `PROD-${String((count || 0) + 1).padStart(6, "0")}`;

        const { data: newProduct, error } = await supabase
          .from("products")
          .insert({
            clinica_id: profile?.clinic_id,
            codigo_interno: codigoInterno,
            nome: newProductName,
            marca: newProductBrand || null,
            unidade: "un",
            estoque_minimo: 0,
          })
          .select()
          .single();

        if (error) throw error;

        const newItem: ItemEntrada = {
          product_id: newProduct.id,
          quantidade: Number(data.quantidade),
          custo_unitario: Number(data.custo_unitario),
        };

        setItems([...items, newItem]);
        
        // Reset fields
        setNewProductName("");
        setNewProductBrand("");
        setValue("quantidade", "");
        setValue("custo_unitario", "");
        
        // Invalidate products query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["products"] });

        toast({
          title: "Produto cadastrado",
          description: "Produto adicionado com sucesso",
        });
      } catch (error: any) {
        toast({
          title: "Erro ao cadastrar produto",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Existing product selection
      if (!data.product_id || !data.quantidade || !data.custo_unitario) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }

      const newItem: ItemEntrada = {
        product_id: data.product_id,
        quantidade: Number(data.quantidade),
        custo_unitario: Number(data.custo_unitario),
      };

      setItems([...items, newItem]);
      
      // Reset form fields
      setValue("quantidade", "");
      setValue("custo_unitario", "");
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    if (!profile?.clinic_id || items.length === 0) {
      toast({
        title: "Nenhum item",
        description: "Adicione pelo menos um item antes de salvar",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get or create default location
      const { data: defaultLocation } = await supabase
        .from("stock_locations")
        .select("id")
        .eq("clinica_id", profile.clinic_id)
        .eq("ativo", true)
        .limit(1)
        .maybeSingle();

      let locationId = defaultLocation?.id;

      if (!locationId) {
        const { data: newLocation } = await supabase
          .from("stock_locations")
          .insert({
            clinica_id: profile.clinic_id,
            nome: "Estoque Principal",
            tipo: "deposito",
          })
          .select("id")
          .single();
        locationId = newLocation?.id;
      }

      if (!locationId) throw new Error("Não foi possível criar local de estoque");

      // Process each item
      for (const item of items) {
        const product = products?.find(p => p.id === item.product_id);
        if (!product) continue;

        // Create stock move
        const custoTotal = item.quantidade * item.custo_unitario;
        const { error: moveError } = await supabase.from("stock_moves").insert({
          clinica_id: profile.clinic_id,
          tipo: "entrada",
          product_id: item.product_id,
          quantidade: item.quantidade,
          custo_unitario: item.custo_unitario,
          custo_total: custoTotal,
          location_to_id: locationId,
          batch_id: null,
          doc_tipo: "entrada_manual",
          usuario_id: user.id,
        });

        if (moveError) throw moveError;

        // Update stock
        const { data: existingStock } = await supabase
          .from("stocks")
          .select("*")
          .eq("product_id", item.product_id)
          .eq("location_id", locationId)
          .is("batch_id", null)
          .maybeSingle();

        if (existingStock) {
          // Update existing stock - média ponderada
          const novaQtd = Number(existingStock.quantidade) + item.quantidade;
          const novoCusto = ((Number(existingStock.quantidade) * Number(existingStock.custo_medio)) + custoTotal) / novaQtd;

          await supabase
            .from("stocks")
            .update({
              quantidade: novaQtd,
              custo_medio: novoCusto,
            })
            .eq("id", existingStock.id);
        } else {
          // Create new stock
          await supabase.from("stocks").insert({
            product_id: item.product_id,
            location_id: locationId,
            batch_id: null,
            quantidade: item.quantidade,
            custo_medio: item.custo_unitario,
          });
        }
      }

      toast({
        title: "Entrada registrada",
        description: `${items.length} item(ns) adicionado(s) ao estoque`,
      });

      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["stock-moves"] });
      
      setItems([]);
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao registrar entrada",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductName = (productId: string) => {
    return products?.find(p => p.id === productId)?.nome || "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Entrada Manual de Estoque</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Form to add items */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Adicionar Item</h3>
            
            {/* Toggle between new product and existing product */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                type="button"
                variant={!isNewProduct ? "default" : "outline"}
                onClick={() => setIsNewProduct(false)}
                className="w-full"
              >
                Selecionar Produto
              </Button>
              <Button
                type="button"
                variant={isNewProduct ? "default" : "outline"}
                onClick={() => setIsNewProduct(true)}
                className="w-full"
              >
                Cadastrar Produto
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {isNewProduct ? (
                <>
                  <div className="col-span-2">
                    <Label htmlFor="new_product_name">Nome do Produto *</Label>
                    <Input
                      id="new_product_name"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      placeholder="Digite o nome do produto"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="new_product_brand">Fabricante/Marca</Label>
                    <Input
                      id="new_product_brand"
                      value={newProductBrand}
                      onChange={(e) => setNewProductBrand(e.target.value)}
                      placeholder="Digite o fabricante"
                    />
                  </div>
                </>
              ) : (
                <div className="col-span-2">
                  <Label htmlFor="product_id">Produto *</Label>
                  <Select onValueChange={(value) => setValue("product_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.nome} {product.marca && `- ${product.marca}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="quantidade">Quantidade *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  step="0.01"
                  {...register("quantidade")}
                />
              </div>

              <div>
                <Label htmlFor="custo_unitario">Custo Unitário *</Label>
                <Input
                  id="custo_unitario"
                  type="number"
                  step="0.01"
                  {...register("custo_unitario")}
                />
              </div>
            </div>

            <Button type="button" onClick={handleSubmit(addItem)} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Item
            </Button>
          </div>

          {/* Items list */}
          {items.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Itens da Entrada ({items.length})</h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <p className="font-medium">{getProductName(item.product_id)}</p>
                      <p className="text-sm text-muted-foreground">
                        Qtd: {item.quantidade} • Custo: R$ {item.custo_unitario.toFixed(2)}
                      </p>
                      <p className="text-sm font-semibold">
                        Total: R$ {(item.quantidade * item.custo_unitario).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-lg font-bold">
                  <span>Valor Total da Entrada:</span>
                  <span>
                    R$ {items.reduce((sum, item) => sum + (item.quantidade * item.custo_unitario), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={onSubmit} disabled={isSubmitting || items.length === 0}>
              {isSubmitting ? "Salvando..." : "Confirmar Entrada"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
