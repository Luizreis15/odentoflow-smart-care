import { useAuth } from "@/contexts/AuthContext";

/**
 * @deprecated Use useAuth() from AuthContext directly.
 * This hook is kept for backward compatibility only.
 */
export const usePermissions = () => {
  const { perfil, isSuperAdmin, isAdmin, isLoading, hasPermission } = useAuth();

  return {
    perfil,
    permissions: [],
    hasPermission,
    isAdmin,
    isSuperAdmin,
    loading: isLoading,
  };
};
