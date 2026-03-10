import { Navigate, useLocation } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";

export default function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { subscribed, status, loading } = useSubscription();
  const { isSuperAdmin, isLoading: authLoading } = useAuth();
  const location = useLocation();

  // Don't block while loading
  if (loading || authLoading) return <>{children}</>;

  // Super admins and impersonation bypass
  if (isSuperAdmin || status === "admin_impersonation") return <>{children}</>;

  // Allow subscription/profile pages and exact /dashboard always
  const path = location.pathname;
  if (
    path === "/dashboard" ||
    path.startsWith("/dashboard/assinatura") ||
    path.startsWith("/dashboard/perfil")
  ) {
    return <>{children}</>;
  }

  // Trial is allowed (status includes "trialing" or similar active states)
  if (subscribed) return <>{children}</>;

  // Block: redirect to subscription page
  if (status === "no_subscription" || status === "expired" || status === "canceled") {
    return <Navigate to="/dashboard/assinatura" replace />;
  }

  return <>{children}</>;
}
