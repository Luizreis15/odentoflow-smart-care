import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useLocation } from "react-router-dom";
import { useState } from "react";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { AuthProvider } from "./contexts/AuthContext";
import DomainRouter from "./components/DomainRouter";
import { isAppDomain } from "./config/domains";

function AppContent() {
  // Only wrap with AuthProvider on app domain (dashboard routes need it)
  if (isAppDomain()) {
    return (
      <AuthProvider>
        <SubscriptionProvider>
          <DomainRouter />
        </SubscriptionProvider>
      </AuthProvider>
    );
  }

  return <DomainRouter />;
}

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
