import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import FeatureSection from '@/components/landing/FeatureSection';
import StatsSection from '@/components/landing/StatsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import DiferenciaisSection from '@/components/landing/DiferenciaisSection';
import CTASection from '@/components/landing/CTASection';
import LandingFooter from '@/components/landing/LandingFooter';
import WhatsAppButton from '@/components/landing/WhatsAppButton';
import agendaMockup from '@/assets/agenda-mockup.jpg';
import prontuarioMockup from '@/assets/prontuario-mockup.jpg';
import documentosMockup from '@/assets/documentos-mockup.jpg';
import financeiroMockup from '@/assets/financeiro-mockup.jpg';

export default function Landing() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main>
        <HeroSection />
        
        {/* Agenda Inteligente */}
        <FeatureSection
          id="agenda"
          badge="AGENDA INTELIGENTE"
          title="Nunca Mais Perca uma Consulta"
          description="Agende, reagende e gerencie consultas em segundos. Confirme automaticamente via WhatsApp e reduza faltas em até 80%."
          benefits={[
            "Confirmação automática via WhatsApp",
            "Visualização de sala de espera em tempo real",
            "Bloqueio inteligente de horários",
            "Lembretes personalizados para pacientes"
          ]}
          ctaText="Comece Grátis Agora"
          imageSrc={agendaMockup}
          imageAlt="Interface de Agenda do Flowdent"
          imagePosition="right"
        />

        {/* Prontuário Eletrônico */}
        <FeatureSection
          id="prontuario"
          badge="PRONTUÁRIO ELETRÔNICO"
          title="Todo Histórico do Paciente em um Clique"
          description="Acesse instantaneamente todo histórico clínico, exames, fotos e tratamentos realizados. Conforme a LGPD e totalmente digital."
          benefits={[
            "Odontograma digital interativo",
            "Upload ilimitado de fotos e exames",
            "Histórico completo de tratamentos",
            "Conformidade total com LGPD"
          ]}
          ctaText="Experimente Sem Compromisso"
          imageSrc={prontuarioMockup}
          imageAlt="Prontuário Eletrônico Digital"
          imagePosition="left"
        />

        {/* Documentos Digitais */}
        <FeatureSection
          id="documentos"
          badge="DOCUMENTOS DIGITAIS"
          title="Receitas e Atestados em Segundos"
          description="Crie receitas, atestados e orçamentos profissionais em minutos. Todos os documentos ficam salvos e organizados no sistema."
          benefits={[
            "Modelos de receituário personalizáveis",
            "Atestados e declarações profissionais",
            "Assinatura digital integrada",
            "Envio direto por WhatsApp ou e-mail"
          ]}
          ctaText="Teste Grátis por 7 Dias"
          imageSrc={documentosMockup}
          imageAlt="Sistema de Documentos Digitais"
          imagePosition="right"
        />

        {/* Gestão Financeira */}
        <FeatureSection
          id="financeiro"
          badge="GESTÃO FINANCEIRA"
          title="Controle Total das Suas Finanças"
          description="Acompanhe receitas, despesas e lucros em tempo real. Gere relatórios completos e tome decisões baseadas em dados."
          benefits={[
            "Dashboard financeiro completo",
            "Controle de contas a pagar e receber",
            "Relatórios gerenciais detalhados",
            "Integração com meios de pagamento"
          ]}
          ctaText="Comece Sua Transformação"
          imageSrc={financeiroMockup}
          imageAlt="Dashboard Financeiro"
          imagePosition="left"
        />

        <StatsSection />
        <TestimonialsSection />
        <DiferenciaisSection />
        <CTASection />
      </main>
      <LandingFooter />
      <WhatsAppButton />
    </div>
  );
}
