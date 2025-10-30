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
import PortalAuth from "./pages/portal/PortalAuth";
import PortalDashboard from "./pages/portal/PortalDashboard";
import IAAssistenteWrapper from "./pages/dashboard/IAAssistenteWrapper";
import ProtesesWrapper from "./pages/dashboard/ProtesesWrapper";
import EstoqueWrapper from "./pages/dashboard/EstoqueWrapper";
import ProdutosWrapper from "./pages/dashboard/ProdutosWrapper";
import MovimentacoesWrapper from "./pages/dashboard/MovimentacoesWrapper";
import PerfilWrapper from "./pages/dashboard/PerfilWrapper";
import ConfiguracoesWrapper from "./pages/dashboard/ConfiguracoesWrapper";
import SuperAdminDashboardWrapper from "./pages/superadmin/DashboardWrapper";
import GlobalAnamneseWrapper from "./pages/superadmin/GlobalAnamneseWrapper";
import PlanosWrapper from "./pages/superadmin/PlanosWrapper";
import ModulosWrapper from "./pages/superadmin/ModulosWrapper";
import LocatariosWrapper from "./pages/superadmin/LocatariosWrapper";
import AuditoriaWrapper from "./pages/superadmin/AuditoriaWrapper";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import AgendaRecurso from "./pages/recursos/Agenda";
import ProntuarioRecurso from "./pages/recursos/Prontuario";
import DocumentosRecurso from "./pages/recursos/Documentos";
import FinanceiroRecurso from "./pages/recursos/Financeiro";

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
              <Route path="/" element={<Landing />} />
              <Route path="/recursos/agenda" element={<AgendaRecurso />} />
              <Route path="/recursos/prontuario" element={<ProntuarioRecurso />} />
              <Route path="/recursos/documentos" element={<DocumentosRecurso />} />
              <Route path="/recursos/financeiro" element={<FinanceiroRecurso />} />
              <Route path="/old-dashboard" element={<Index />} />
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
              <Route path="/dashboard/proteses" element={<ProtesesWrapper />} />
              <Route path="/dashboard/estoque" element={<EstoqueWrapper />} />
              <Route path="/dashboard/produtos" element={<ProdutosWrapper />} />
              <Route path="/dashboard/movimentacoes" element={<MovimentacoesWrapper />} />
              <Route path="/dashboard/profile" element={<PerfilWrapper />} />
              <Route path="/dashboard/configuracoes" element={<ConfiguracoesWrapper />} />
              
              {/* Super Admin Routes */}
              <Route path="/super-admin" element={<SuperAdminDashboardWrapper />} />
              <Route path="/super-admin/planos" element={<PlanosWrapper />} />
              <Route path="/super-admin/modulos" element={<ModulosWrapper />} />
              <Route path="/super-admin/anamnese" element={<GlobalAnamneseWrapper />} />
              <Route path="/super-admin/locatarios" element={<LocatariosWrapper />} />
              <Route path="/super-admin/auditoria" element={<AuditoriaWrapper />} />
              
              {/* Portal do Paciente - Rotas Públicas */}
              <Route path="/portal/auth" element={<PortalAuth />} />
              <Route path="/portal/dashboard" element={<PortalDashboard />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </QueryClientProvider>
  );
}

export default App;