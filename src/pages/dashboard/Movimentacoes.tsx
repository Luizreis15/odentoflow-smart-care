import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUp, ArrowDown, ArrowLeftRight, Settings } from "lucide-react";

export default function Movimentacoes() {
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");

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

  const { data: moves, isLoading } = useQuery({
    queryKey: ["stock-moves", profile?.clinic_id, tipoFilter],
    queryFn: async () => {
      if (!profile?.clinic_id) return [];
      
      let query = supabase
        .from("stock_moves")
        .select(`
          *,
          products(nome, unidade),
          stock_locations!stock_moves_location_from_id_fkey(nome),
          location_to:stock_locations!stock_moves_location_to_id_fkey(nome),
          batches(codigo, data_validade),
          usuarios(nome)
        `)
        .eq("clinica_id", profile.clinic_id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (tipoFilter !== "todos") {
        query = query.eq("tipo", tipoFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.clinic_id,
  });

  const filteredMoves = moves?.filter(move => 
    !search || 
    move.products?.nome.toLowerCase().includes(search.toLowerCase()) ||
    move.batches?.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "entrada": return <ArrowUp className="h-4 w-4 text-green-600" />;
      case "saida": return <ArrowDown className="h-4 w-4 text-red-600" />;
      case "transferencia": return <ArrowLeftRight className="h-4 w-4 text-blue-600" />;
      case "ajuste": return <Settings className="h-4 w-4 text-yellow-600" />;
      default: return null;
    }
  };

  const getTipoBadge = (tipo: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      entrada: "default",
      saida: "destructive",
      transferencia: "secondary",
      ajuste: "secondary",
      devolucao: "secondary",
    };
    return <Badge variant={variants[tipo] || "secondary"}>{tipo.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Movimentações de Estoque</h1>
        <p className="text-muted-foreground">Histórico completo de entradas e saídas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Buscar por produto ou lote..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
                <SelectItem value="ajuste">Ajuste</SelectItem>
                <SelectItem value="devolucao">Devolução</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8">Carregando movimentações...</div>
          ) : filteredMoves && filteredMoves.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Local Origem</TableHead>
                  <TableHead>Local Destino</TableHead>
                  <TableHead>Usuário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMoves.map((move: any) => (
                  <TableRow key={move.id}>
                    <TableCell>
                      {new Date(move.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTipoIcon(move.tipo)}
                        {getTipoBadge(move.tipo)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {move.products?.nome}
                    </TableCell>
                    <TableCell>
                      <span className={move.quantidade > 0 ? "text-green-600" : "text-red-600"}>
                        {move.quantidade > 0 ? "+" : ""}{move.quantidade} {move.products?.unidade}
                      </span>
                    </TableCell>
                    <TableCell>
                      {move.batches?.codigo || "-"}
                    </TableCell>
                    <TableCell>
                      {move.stock_locations?.nome || "-"}
                    </TableCell>
                    <TableCell>
                      {move.location_to?.nome || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {move.usuarios?.nome || "Sistema"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma movimentação encontrada
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}