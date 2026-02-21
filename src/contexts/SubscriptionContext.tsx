import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionContextType {
  subscribed: boolean;
  status: string;
  plan: string;
  subscriptionEnd: string | null;
  trialEnd: string | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [status, setStatus] = useState("no_subscription");
  const [plan, setPlan] = useState("starter");
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [trialEnd, setTrialEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const checkedRef = useRef(false);

  const checkSubscription = useCallback(async () => {
    try {
      // Check if super admin is impersonating a clinic
      const impersonation = localStorage.getItem("admin_impersonation");
      if (impersonation) {
        setSubscribed(true);
        setStatus("admin_impersonation");
        setPlan("enterprise");
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSubscribed(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        console.error("Error checking subscription:", error);
        setSubscribed(false);
        setLoading(false);
        return;
      }

      setSubscribed(data.subscribed || false);
      setStatus(data.status || "no_subscription");
      setPlan(data.plan || "starter");
      setSubscriptionEnd(data.subscription_end || null);
      setTrialEnd(data.trial_end || null);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Lazy check: only run once when mounted (deferred)
    if (!checkedRef.current) {
      checkedRef.current = true;
      // Defer to not block initial render
      const timeout = setTimeout(checkSubscription, 100);
      return () => clearTimeout(timeout);
    }
  }, [checkSubscription]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        checkSubscription();
      } else if (event === "SIGNED_OUT") {
        setSubscribed(false);
        setStatus("no_subscription");
        setPlan("starter");
        setSubscriptionEnd(null);
        setTrialEnd(null);
        checkedRef.current = false;
      }
    });

    // Auto-refresh every 5 minutes instead of 60s
    const interval = setInterval(checkSubscription, 300000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [checkSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscribed,
        status,
        plan,
        subscriptionEnd,
        trialEnd,
        loading,
        checkSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
