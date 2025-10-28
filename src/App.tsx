import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Welcome from "./pages/onboarding/Welcome";
import Tipo from "./pages/onboarding/Tipo";
import Clinica from "./pages/onboarding/Clinica";
import Profissional from "./pages/onboarding/Profissional";
import Dashboard from "./pages/Dashboard";
import AgendaWrapper from "./pages/dashboard/AgendaWrapper";
import ProntuarioWrapper from "./pages/dashboard/ProntuarioWrapper";
import PatientDetails from "./pages/dashboard/PatientDetails";
import FinanceiroWrapper from "./pages/dashboard/FinanceiroWrapper";
import CRMWrapper from "./pages/dashboard/CRMWrapper";
import PortalPacienteWrapper from "./pages/dashboard/PortalPacienteWrapper";
import IAAssistenteWrapper from "./pages/dashboard/IAAssistenteWrapper";
import NotFound from "./pages/NotFound";
import Configuracoes from "./pages/Configuracoes";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";

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
      <SubscriptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/onboarding/welcome" element={<Welcome />} />
              <Route path="/onboarding/tipo" element={<Tipo />} />
              <Route path="/onboarding/clinica" element={<Clinica />} />
              <Route path="/onboarding/profissional" element={<Profissional />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/agenda" element={<AgendaWrapper />} />
              <Route path="/dashboard/prontuario" element={<ProntuarioWrapper />} />
              <Route path="/dashboard/prontuario/:id" element={<PatientDetails />} />
              <Route path="/dashboard/financeiro" element={<FinanceiroWrapper />} />
              <Route path="/dashboard/crm" element={<CRMWrapper />} />
              <Route path="/dashboard/portal-paciente" element={<PortalPacienteWrapper />} />
              <Route path="/dashboard/ia-assistente" element={<IAAssistenteWrapper />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </QueryClientProvider>
  );
}

export default App;