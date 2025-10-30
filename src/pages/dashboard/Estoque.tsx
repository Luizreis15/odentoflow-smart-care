import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, TrendingDown, DollarSign, Plus, Upload, ArrowDown, ArrowUp, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EntradaEstoqueModal } from "@/components/estoque/EntradaEstoqueModal";
import { SaidaEstoqueModal } from "@/components/estoque/SaidaEstoqueModal";
import { UploadXMLModal } from "@/components/estoque/UploadXMLModal";
import { VisaoEstoqueModal } from "@/components/estoque/VisaoEstoqueModal";

export default function Estoque() {
  const [entradaOpen, setEntradaOpen] = useState(false);
  const [saidaOpen, setSaidaOpen] = useState(false);
  const [xmlOpen, setXmlOpen] = useState(false);
  const [visaoOpen, setVisaoOpen] = useState(false);
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

  const { data: stats } = useQuery({
    queryKey: ["stock-dashboard", profile?.clinic_id],
    queryFn: async () => {
      if (!profile?.clinic_id) return null;

      // Get products below minimum
      const { data: productsData } = await supabase
        .from("products")
        .select(`
          id,
          nome,
          estoque_minimo,
          stocks!inner(quantidade)
        `)
        .eq("clinica_id", profile.clinic_id)
        .eq("ativo", true);

      const belowMinimum = productsData?.filter(p => {
        const totalStock = p.stocks?.reduce((sum: number, s: any) => sum + Number(s.quantidade || 0), 0) || 0;
        return totalStock < Number(p.estoque_minimo || 0);
      }).length || 0;

      // Get expiring items (30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const { count: expiringCount } = await supabase
        .from("batches")
        .select("*", { count: "exact", head: true })
        .lte("data_validade", thirtyDaysFromNow.toISOString().split('T')[0])
        .gte("data_validade", new Date().toISOString().split('T')[0]);

      // Get total stock value
      const { data: stocksData } = await supabase
        .from("stocks")
        .select("quantidade, custo_medio, products!inner(clinica_id)")
        .eq("products.clinica_id", profile.clinic_id);

      const totalValue = stocksData?.reduce((sum, s) => 
        sum + (Number(s.quantidade || 0) * Number(s.custo_medio || 0)), 0
      ) || 0;

      // Get recent moves
      const { data: recentMoves } = await supabase
        .from("stock_moves")
        .select(`
          id,
          tipo,
          quantidade,
          created_at,
          products(nome)
        `)
        .eq("clinica_id", profile.clinic_id)
        .order("created_at", { ascending: false })
        .limit(10);

      return {
        belowMinimum,
        expiring: expiringCount || 0,
        totalValue,
        recentMoves: recentMoves || []
      };
    },
    enabled: !!profile?.clinic_id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard - Estoque</h1>
          <p className="text-muted-foreground">Visão geral do controle de estoque</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setVisaoOpen(true)}>
            <List className="mr-2 h-4 w-4" />
            Visão do Estoque
          </Button>
          <Button variant="outline" onClick={() => setSaidaOpen(true)}>
            <ArrowDown className="mr-2 h-4 w-4" />
            Saída
          </Button>
          <Button variant="outline" onClick={() => setEntradaOpen(true)}>
            <ArrowUp className="mr-2 h-4 w-4" />
            Entrada
          </Button>
          <Button onClick={() => setXmlOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload XML NFe
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Abaixo do Mínimo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.belowMinimum || 0}</div>
            <p className="text-xs text-muted-foreground">
              Produtos precisam de reposição
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vencendo (30 dias)
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.expiring || 0}</div>
            <p className="text-xs text-muted-foreground">
              Lotes próximos do vencimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(stats?.totalValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Em estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Movimentações (Hoje)
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.recentMoves?.filter(m => 
                new Date(m.created_at).toDateString() === new Date().toDateString()
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Entradas e saídas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentMoves?.map((move: any) => (
              <div key={move.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{move.products?.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {move.tipo.toUpperCase()} • {move.quantidade} un
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(move.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
            {(!stats?.recentMoves || stats.recentMoves.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma movimentação recente
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <EntradaEstoqueModal open={entradaOpen} onOpenChange={setEntradaOpen} />
      <SaidaEstoqueModal open={saidaOpen} onOpenChange={setSaidaOpen} />
      <UploadXMLModal open={xmlOpen} onOpenChange={setXmlOpen} />
      <VisaoEstoqueModal open={visaoOpen} onOpenChange={setVisaoOpen} />
    </div>
  );
}