import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthProfile {
  id: string;
  full_name: string;
  email: string;
  clinic_id: string | null;
  avatar_url?: string | null;
  [key: string]: any;
}

interface ImpersonationState {
  clinicId: string;
  clinicName: string;
  startedAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: AuthProfile | null;
  clinicId: string | null;
  isSuperAdmin: boolean;
  isImpersonating: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const loadUserData = useCallback(async (sessionUser: User) => {
    try {
      // Run profile and role queries in parallel
      const [profileResult, roleResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", sessionUser.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", sessionUser.id).eq("role", "super_admin").maybeSingle(),
      ]);

      const profileData = profileResult.data as AuthProfile | null;
      const isAdmin = !!roleResult.data;

      setUser(sessionUser);
      setProfile(profileData);
      setIsSuperAdmin(isAdmin);

      // Check impersonation
      const storedImpersonation = localStorage.getItem("admin_impersonation");
      if (storedImpersonation && isAdmin) {
        const impersonation: ImpersonationState = JSON.parse(storedImpersonation);
        setClinicId(impersonation.clinicId);
        setIsImpersonating(true);
      } else {
        setClinicId(profileData?.clinic_id || null);
        setIsImpersonating(false);
      }

      // Validate onboarding for non-admins
      if (!isAdmin && profileData) {
        if (!profileData.clinic_id) {
          navigate("/onboarding/welcome");
          return;
        }

        const { data: clinicData } = await supabase
          .from("clinicas")
          .select("onboarding_status")
          .eq("id", profileData.clinic_id)
          .single();

        if (clinicData?.onboarding_status !== "completed") {
          navigate("/onboarding/welcome");
          return;
        }
      }
    } catch (error) {
      console.error("[AuthContext] Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) {
      setProfile(data as AuthProfile);
      setClinicId(data.clinic_id || null);
    }
  }, [user]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        setProfile(null);
        setClinicId(null);
        setIsSuperAdmin(false);
        setIsImpersonating(false);
        setIsLoading(false);
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Defer to avoid Supabase auth deadlock
        setTimeout(() => loadUserData(session.user), 0);
      }
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserData(session.user);
      } else {
        setIsLoading(false);
      }
      setInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  // Handle impersonation from URL params (cross-domain transfer)
  useEffect(() => {
    if (!user || !initialized) return;
    
    const searchParams = new URLSearchParams(window.location.search);
    const impersonateParam = searchParams.get("impersonate");
    
    if (impersonateParam && isSuperAdmin) {
      try {
        const impersonationData: ImpersonationState = JSON.parse(decodeURIComponent(impersonateParam));
        localStorage.setItem("admin_impersonation", JSON.stringify(impersonationData));
        setClinicId(impersonationData.clinicId);
        setIsImpersonating(true);
        window.history.replaceState({}, "", "/dashboard");
      } catch (e) {
        console.error("[AuthContext] Error parsing impersonation:", e);
        window.history.replaceState({}, "", "/dashboard");
      }
    }
  }, [user, initialized, isSuperAdmin]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        clinicId,
        isSuperAdmin,
        isImpersonating,
        isLoading,
        isAuthenticated: !!user,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
