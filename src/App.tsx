import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AgendaWrapper from "./pages/dashboard/AgendaWrapper";
import ProntuarioWrapper from "./pages/dashboard/ProntuarioWrapper";
import FinanceiroWrapper from "./pages/dashboard/FinanceiroWrapper";
import CRMWrapper from "./pages/dashboard/CRMWrapper";
import PortalPacienteWrapper from "./pages/dashboard/PortalPacienteWrapper";
import IAAssistenteWrapper from "./pages/dashboard/IAAssistenteWrapper";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/agenda" element={<AgendaWrapper />} />
          <Route path="/dashboard/prontuario" element={<ProntuarioWrapper />} />
          <Route path="/dashboard/financeiro" element={<FinanceiroWrapper />} />
          <Route path="/dashboard/crm" element={<CRMWrapper />} />
          <Route path="/dashboard/portal-paciente" element={<PortalPacienteWrapper />} />
          <Route path="/dashboard/ia-assistente" element={<IAAssistenteWrapper />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;