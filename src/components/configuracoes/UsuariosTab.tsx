import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { UsuariosTable } from "./UsuariosTable";
import { InviteUserModal } from "./InviteUserModal";
import { EditUserModal } from "./EditUserModal";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
  profissional_id: string | null;
  last_login_at: string | null;
  created_at: string;
  clinica_id?: string;
  updated_at?: string;
}

interface UsuariosTabProps {
  clinicaId: string;
}

export const UsuariosTab = ({ clinicaId }: UsuariosTabProps) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    loadUsuarios();
  }, [clinicaId]);

  useEffect(() => {
    filterUsuarios();
  }, [searchTerm, usuarios]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("clinica_id", clinicaId)
        .order("nome");

      if (error) throw error;
      
      const mapped = (data || []).map((u: any) => ({
        id: u.id,
        nome: u.nome || "",
        email: u.email || "",
        perfil: u.perfil || "recepcionista",
        ativo: u.ativo ?? true,
        profissional_id: u.profissional_id || null,
        last_login_at: u.last_login_at || null,
        created_at: u.created_at || "",
        clinica_id: u.clinica_id,
        updated_at: u.updated_at
      }));
      
      setUsuarios(mapped);
    } catch (error: any) {
      toast.error("Erro ao carregar usuários: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterUsuarios = () => {
    if (!searchTerm.trim()) {
      setFilteredUsuarios(usuarios);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = usuarios.filter(
      u =>
        u.nome.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.perfil.toLowerCase().includes(term)
    );
    setFilteredUsuarios(filtered);
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setEditModalOpen(true);
  };

  const handleToggleStatus = async (usuario: Usuario) => {
    try {
      const { error } = await supabase
        .from("usuarios" as any)
        .update({ ativo: !usuario.ativo })
        .eq("id", usuario.id);

      if (error) throw error;

      // Registrar auditoria
      await supabase
        .from("audit_log" as any)
        .insert({
          entidade: "usuarios",
          entidade_id: usuario.id,
          acao: usuario.ativo ? "deactivate" : "reactivate",
          dif: { ativo: !usuario.ativo }
        });

      toast.success(
        usuario.ativo ? "Usuário desativado" : "Usuário reativado"
      );
      loadUsuarios();
    } catch (error: any) {
      toast.error("Erro ao atualizar status: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail, perfil..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setInviteModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <UsuariosTable
        usuarios={filteredUsuarios}
        loading={loading}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
      />

      <InviteUserModal
        open={inviteModalOpen}
        onClose={() => {
          setInviteModalOpen(false);
          loadUsuarios();
        }}
        clinicaId={clinicaId}
      />

      <EditUserModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingUsuario(null);
          loadUsuarios();
        }}
        usuario={editingUsuario}
        clinicaId={clinicaId}
      />
    </div>
  );
};
