import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NovoProdutoModal } from "@/components/estoque/NovoProdutoModal";
import { ProdutosTable } from "@/components/estoque/ProdutosTable";

export default function Produtos() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

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
    queryKey: ["products", profile?.clinic_id, search],
    queryFn: async () => {
      if (!profile?.clinic_id) return [];
      
      let query = supabase
        .from("products")
        .select(`
          *,
          stock_locations(nome),
          stocks(quantidade, custo_medio)
        `)
        .eq("clinica_id", profile.clinic_id)
        .order("nome");

      if (search) {
        query = query.or(`nome.ilike.%${search}%,sku.ilike.%${search}%,ean.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.clinic_id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">Cadastro e controle de produtos</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, SKU, EAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ProdutosTable products={products || []} isLoading={isLoading} />

      <NovoProdutoModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}