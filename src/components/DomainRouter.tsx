import { Routes, Route, Navigate } from "react-router-dom";
import { isAppDomain } from "@/config/domains";

// Site Pages (flowdent.com.br)
import Landing from "@/pages/Landing";
import Precos from "@/pages/Precos";
import AgendaRecurso from "@/pages/recursos/Agenda";
import ProntuarioRecurso from "@/pages/recursos/Prontuario";
import DocumentosRecurso from "@/pages/recursos/Documentos";
import FinanceiroRecurso from "@/pages/recursos/Financeiro";
import AdminAuth from "@/pages/admin/AdminAuth";
import AdminLayout from "@/components/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminClinics from "@/pages/admin/Clinics";
import AdminLeads from "@/pages/admin/Leads";
import AdminMarketing from "@/pages/admin/Marketing";
import AdminSubscriptions from "@/pages/admin/Subscriptions";
import AdminModules from "@/pages/admin/Modules";
import AdminAudit from "@/pages/admin/Audit";

// App Pages (app.flowdent.com.br)
import Auth from "@/pages/Auth";
import Cadastro from "@/pages/Cadastro";
import Index from "@/pages/Index";
import Onboarding from "@/pages/Onboarding";
import Welcome from "@/pages/onboarding/Welcome";
import Tipo from "@/pages/onboarding/Tipo";
import Clinica from "@/pages/onboarding/Clinica";
import Profissional from "@/pages/onboarding/Profissional";
import Dashboard from "@/pages/Dashboard";
import AgendaWrapper from "@/pages/dashboard/AgendaWrapper";
import ProntuarioWrapper from "@/pages/dashboard/ProntuarioWrapper";
import PatientDetails from "@/pages/dashboard/PatientDetails";
import FinanceiroWrapper from "@/pages/dashboard/FinanceiroWrapper";
import CRMWrapper from "@/pages/dashboard/CRMWrapper";
import CRMAtendimentoWrapper from "@/pages/dashboard/CRMAtendimentoWrapper";
import PortalPacienteWrapper from "@/pages/dashboard/PortalPacienteWrapper";
import PortalAuth from "@/pages/portal/PortalAuth";
import PortalDashboard from "@/pages/portal/PortalDashboard";
import IAAssistenteWrapper from "@/pages/dashboard/IAAssistenteWrapper";
import ProtesesWrapper from "@/pages/dashboard/ProtesesWrapper";
import EstoqueWrapper from "@/pages/dashboard/EstoqueWrapper";
import ProdutosWrapper from "@/pages/dashboard/ProdutosWrapper";
import MovimentacoesWrapper from "@/pages/dashboard/MovimentacoesWrapper";
import PerfilWrapper from "@/pages/dashboard/PerfilWrapper";
import ConfiguracoesWrapper from "@/pages/dashboard/ConfiguracoesWrapper";
import AssinaturaWrapper from "@/pages/dashboard/AssinaturaWrapper";
import SuperAdminDashboardWrapper from "@/pages/superadmin/DashboardWrapper";
import GlobalAnamneseWrapper from "@/pages/superadmin/GlobalAnamneseWrapper";
import PlanosWrapper from "@/pages/superadmin/PlanosWrapper";
import ModulosWrapper from "@/pages/superadmin/ModulosWrapper";
import LocatariosWrapper from "@/pages/superadmin/LocatariosWrapper";
import AuditoriaWrapper from "@/pages/superadmin/AuditoriaWrapper";
import NotFound from "@/pages/NotFound";

// Rotas do Site (flowdent.com.br)
function SiteRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/precos" element={<Precos />} />
      <Route path="/recursos/agenda" element={<AgendaRecurso />} />
      <Route path="/recursos/prontuario" element={<ProntuarioRecurso />} />
      <Route path="/recursos/documentos" element={<DocumentosRecurso />} />
      <Route path="/recursos/financeiro" element={<FinanceiroRecurso />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminAuth />} />
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/clinics" element={<AdminClinics />} />
        <Route path="/admin/leads" element={<AdminLeads />} />
        <Route path="/admin/marketing" element={<AdminMarketing />} />
        <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        <Route path="/admin/modules" element={<AdminModules />} />
        <Route path="/admin/audit" element={<AdminAudit />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Rotas do App (app.flowdent.com.br)
function AppRoutes() {
  return (
    <Routes>
      {/* Redireciona / para /auth no domínio do app */}
      <Route path="/" element={<Navigate to="/auth" replace />} />
      
      <Route path="/old-dashboard" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/cadastro" element={<Cadastro />} />
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
      <Route path="/dashboard/crm/atendimento" element={<CRMAtendimentoWrapper />} />
      <Route path="/dashboard/portal-paciente" element={<PortalPacienteWrapper />} />
      <Route path="/dashboard/ia-assistente" element={<IAAssistenteWrapper />} />
      <Route path="/dashboard/proteses" element={<ProtesesWrapper />} />
      <Route path="/dashboard/estoque" element={<EstoqueWrapper />} />
      <Route path="/dashboard/produtos" element={<ProdutosWrapper />} />
      <Route path="/dashboard/movimentacoes" element={<MovimentacoesWrapper />} />
      <Route path="/dashboard/profile" element={<PerfilWrapper />} />
      <Route path="/dashboard/assinatura" element={<AssinaturaWrapper />} />
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
  );
}

export default function DomainRouter() {
  // Em desenvolvimento ou no domínio do app, mostra rotas do app
  // No domínio do site, mostra rotas do site
  if (isAppDomain()) {
    return <AppRoutes />;
  }
  
  return <SiteRoutes />;
}
