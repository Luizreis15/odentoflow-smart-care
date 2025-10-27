import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import FinanceiroWrapper from "./pages/dashboard/FinanceiroWrapper";
import CRMWrapper from "./pages/dashboard/CRMWrapper";
import PortalPacienteWrapper from "./pages/dashboard/PortalPacienteWrapper";
import IAAssistenteWrapper from "./pages/dashboard/IAAssistenteWrapper";
import NotFound from "./pages/NotFound";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";

const queryClient = new QueryClient();

const App = () => (
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
            <Route path="/dashboard/financeiro" element={<FinanceiroWrapper />} />
            <Route path="/dashboard/crm" element={<CRMWrapper />} />
            <Route path="/dashboard/portal-paciente" element={<PortalPacienteWrapper />} />
            <Route path="/dashboard/ia-assistente" element={<IAAssistenteWrapper />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SubscriptionProvider>
  </QueryClientProvider>
);

export default App;