import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Permission {
  recurso: string;
  acao: string;
  permitido: boolean;
}

export const usePermissions = () => {
  const { perfil, isSuperAdmin, isAdmin, isLoading: authLoading, clinicId, user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !clinicId || !perfil) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    // Admin and super_admin always have full access
    if (isSuperAdmin || isAdmin) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    const loadPermissions = async () => {
      try {
        const { data, error } = await supabase
          .from("clinic_permissions")
          .select("recurso, acao, permitido")
          .eq("clinic_id", clinicId)
          .eq("perfil", perfil as any);

        if (error) throw error;
        setPermissions(data || []);
      } catch (err) {
        console.error("[usePermissions] Error loading permissions:", err);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [user, clinicId, perfil, isSuperAdmin, isAdmin]);

  /**
   * Check if user can perform an action on a resource.
   * Admin/super_admin always return true.
   * If no permission record found, defaults to false (deny by default for non-admins).
   */
  const can = useCallback(
    (recurso: string, acao: string): boolean => {
      if (isSuperAdmin || isAdmin) return true;
      
      const perm = permissions.find(
        (p) => p.recurso === recurso && p.acao === acao
      );
      return perm?.permitido ?? false;
    },
    [permissions, isSuperAdmin, isAdmin]
  );

  /**
   * Check if user can view a specific module (shortcut for can(module, 'visualizar'))
   */
  const canViewModule = useCallback(
    (module: string): boolean => can(module, "visualizar"),
    [can]
  );

  return {
    perfil,
    permissions,
    can,
    canViewModule,
    hasPermission: can,
    isAdmin,
    isSuperAdmin,
    loading: loading || authLoading,
  };
};
