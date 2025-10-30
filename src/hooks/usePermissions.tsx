import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type PerfilUsuario = "super_admin" | "admin" | "dentista" | "assistente" | "recepcao";

interface Permission {
  recurso: string;
  acao: string;
  permitido: boolean;
}

export const usePermissions = () => {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPermissions();
  }, []);

  const loadUserPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("perfil")
        .eq("id", user.id)
        .single();

      if (usuario) {
        setPerfil(usuario.perfil as PerfilUsuario);

        // Carregar permissões do perfil (tabela customizada)
        setPermissions([]);
      }
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (recurso: string, acao: string): boolean => {
    if (perfil === "super_admin" || perfil === "admin") return true;
    
    const perm = permissions.find(
      p => p.recurso === recurso && p.acao === acao
    );
    
    return perm?.permitido ?? false;
  };

  const isAdmin = perfil === "admin";
  const isSuperAdmin = perfil === "super_admin";

  return { perfil, permissions, hasPermission, isAdmin, isSuperAdmin, loading };
};
