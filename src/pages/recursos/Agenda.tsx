import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';
import agendaMockup from '@/assets/agenda-mockup.jpg';

export default function AgendaRecurso() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-[hsl(var(--flowdent-blue))]/5 to-[hsl(var(--flow-turquoise))]/5">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--flowdent-blue))] mb-6">
                  Agenda Inteligente
                </h1>
                <p className="text-xl text-[hsl(var(--slate-gray))] mb-8">
                  Organize todos os seus atendimentos em um só lugar. Reduza faltas, otimize seu tempo e melhore a experiência dos seus pacientes.
                </p>
                <Button 
                  asChild
                  size="lg"
                  className="bg-[hsl(var(--flowdent-blue))] text-white hover:bg-[hsl(var(--flow-turquoise))]"
                >
                  <Link to="/auth?signup=true">Começar Agora</Link>
                </Button>
              </div>
              <div>
                <img 
                  src={agendaMockup} 
                  alt="Interface da Agenda Flowdent" 
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-[hsl(var(--flowdent-blue))] mb-12">
              Por que usar nossa Agenda?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[hsl(var(--flowdent-blue))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-[hsl(var(--flowdent-blue))]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Visualização Clara</h3>
                <p className="text-[hsl(var(--slate-gray))]">
                  Veja todos os agendamentos em calendário, lista ou linha do tempo
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[hsl(var(--flow-turquoise))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-[hsl(var(--flow-turquoise))]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Lembretes Automáticos</h3>
                <p className="text-[hsl(var(--slate-gray))]">
                  Notificações por WhatsApp e SMS reduzem faltas em até 80%
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[hsl(var(--flowdent-blue))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-[hsl(var(--flowdent-blue))]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Multi-profissional</h3>
                <p className="text-[hsl(var(--slate-gray))]">
                  Gerencie a agenda de toda sua equipe em um só lugar
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[hsl(var(--flow-turquoise))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[hsl(var(--flow-turquoise))]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Confirmação Fácil</h3>
                <p className="text-[hsl(var(--slate-gray))]">
                  Pacientes confirmam presença direto pelo celular
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Funcionalidades Detalhadas */}
        <section className="py-16 bg-[hsl(var(--cloud-white))]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-[hsl(var(--flowdent-blue))] mb-12">
              Funcionalidades que fazem a diferença
            </h2>
            <div className="space-y-8 max-w-3xl mx-auto">
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--flow-turquoise))] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Agendamento Online</h3>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Seus pacientes podem agendar consultas 24/7 pelo site ou WhatsApp
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--flow-turquoise))] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Gestão de Encaixes</h3>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Preencha horários vagos rapidamente com lista de espera inteligente
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--flow-turquoise))] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Bloqueios e Recorrências</h3>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Configure horários de almoço, férias e agendamentos recorrentes
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--flow-turquoise))] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Sincronização em Tempo Real</h3>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Toda equipe vê as atualizações instantaneamente, sem conflitos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-[hsl(var(--flowdent-blue))] mb-6">
              Pronto para otimizar sua agenda?
            </h2>
            <p className="text-xl text-[hsl(var(--slate-gray))] mb-8 max-w-2xl mx-auto">
              Comece gratuitamente e veja como é fácil ter controle total dos seus agendamentos
            </p>
            <Button 
              asChild
              size="lg"
              className="bg-[hsl(var(--flowdent-blue))] text-white hover:bg-[hsl(var(--flow-turquoise))]"
            >
              <Link to="/auth?signup=true">Experimentar Grátis por 7 Dias</Link>
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
