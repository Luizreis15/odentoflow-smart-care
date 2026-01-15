import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Pencil, Trash2, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FornecedoresTabProps {
  clinicaId: string;
}

interface Supplier {
  id: string;
  nome: string;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  responsavel: string | null;
  condicoes_comerciais: string | null;
  ativo: boolean;
}

export const FornecedoresTab = ({ clinicaId }: FornecedoresTabProps) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    responsavel: "",
    condicoes_comerciais: "",
    ativo: true,
  });

  useEffect(() => {
    loadSuppliers();
  }, [clinicaId]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("clinic_id", clinicaId)
        .order("nome");

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
      toast.error("Erro ao carregar fornecedores");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        nome: supplier.nome,
        cnpj: supplier.cnpj || "",
        telefone: supplier.telefone || "",
        email: supplier.email || "",
        responsavel: supplier.responsavel || "",
        condicoes_comerciais: supplier.condicoes_comerciais || "",
        ativo: supplier.ativo,
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        nome: "",
        cnpj: "",
        telefone: "",
        email: "",
        responsavel: "",
        condicoes_comerciais: "",
        ativo: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.nome) {
      toast.error("Nome é obrigatório");
      return;
    }

    try {
      if (editingSupplier) {
        const { error } = await supabase
          .from("suppliers")
          .update({
            nome: formData.nome,
            cnpj: formData.cnpj || null,
            telefone: formData.telefone || null,
            email: formData.email || null,
            responsavel: formData.responsavel || null,
            condicoes_comerciais: formData.condicoes_comerciais || null,
            ativo: formData.ativo,
          })
          .eq("id", editingSupplier.id);

        if (error) throw error;
        toast.success("Fornecedor atualizado!");
      } else {
        const { error } = await supabase.from("suppliers").insert({
          clinic_id: clinicaId,
          nome: formData.nome,
          cnpj: formData.cnpj || null,
          telefone: formData.telefone || null,
          email: formData.email || null,
          responsavel: formData.responsavel || null,
          condicoes_comerciais: formData.condicoes_comerciais || null,
          ativo: formData.ativo,
        });

        if (error) throw error;
        toast.success("Fornecedor criado!");
      }

      setShowModal(false);
      loadSuppliers();
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error);
      toast.error("Erro ao salvar fornecedor");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este fornecedor?")) return;

    try {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
      toast.success("Fornecedor excluído!");
      loadSuppliers();
    } catch (error) {
      console.error("Erro ao excluir fornecedor:", error);
      toast.error("Erro ao excluir fornecedor");
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cnpj?.includes(searchTerm) ||
      s.responsavel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Fornecedores</CardTitle>
            <CardDescription>Gerencie os fornecedores da clínica</CardDescription>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Fornecedor
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "Nenhum fornecedor encontrado" : "Nenhum fornecedor cadastrado"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.nome}</TableCell>
                  <TableCell>{supplier.cnpj || "—"}</TableCell>
                  <TableCell>{supplier.responsavel || "—"}</TableCell>
                  <TableCell>{supplier.telefone || "—"}</TableCell>
                  <TableCell>
                    {supplier.ativo ? (
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(supplier)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(supplier.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSupplier ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome / Razão Social *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do fornecedor"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contato@fornecedor.com"
                  />
                </div>
                <div>
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    placeholder="Nome do contato"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="condicoes">Condições Comerciais</Label>
                <Textarea
                  id="condicoes"
                  value={formData.condicoes_comerciais}
                  onChange={(e) => setFormData({ ...formData, condicoes_comerciais: e.target.value })}
                  placeholder="Ex: 30/60/90 dias, desconto 5%..."
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="ativo">Fornecedor ativo</Label>
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingSupplier ? "Salvar" : "Criar Fornecedor"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
