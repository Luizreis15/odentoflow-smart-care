import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, Lock, Search, CheckCircle } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';
import prontuarioMockup from '@/assets/prontuario-mockup.jpg';

export default function ProntuarioRecurso() {
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
                  Prontuário Digital Completo
                </h1>
                <p className="text-xl text-[hsl(var(--slate-gray))] mb-8">
                  Todo o histórico clínico dos seus pacientes em um só lugar. Seguro, organizado e sempre acessível quando você precisar.
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
                  src={prontuarioMockup} 
                  alt="Interface do Prontuário Digital Flowdent" 
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
              Por que usar o Prontuário Digital?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[hsl(var(--flowdent-blue))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-[hsl(var(--flowdent-blue))]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Registro Completo</h3>
                <p className="text-[hsl(var(--slate-gray))]">
                  Anamnese, evolução, odontograma e todos os dados clínicos
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[hsl(var(--flow-turquoise))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-[hsl(var(--flow-turquoise))]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">100% Seguro</h3>
                <p className="text-[hsl(var(--slate-gray))]">
                  Dados criptografados e em conformidade com a LGPD
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[hsl(var(--flowdent-blue))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-[hsl(var(--flowdent-blue))]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Busca Rápida</h3>
                <p className="text-[hsl(var(--slate-gray))]">
                  Encontre qualquer informação em segundos com filtros inteligentes
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[hsl(var(--flow-turquoise))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[hsl(var(--flow-turquoise))]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Sem Papel</h3>
                <p className="text-[hsl(var(--slate-gray))]">
                  Esqueça papéis perdidos e letra ilegível
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Funcionalidades Detalhadas */}
        <section className="py-16 bg-[hsl(var(--cloud-white))]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-[hsl(var(--flowdent-blue))] mb-12">
              Tudo que você precisa em um prontuário
            </h2>
            <div className="space-y-8 max-w-3xl mx-auto">
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--flow-turquoise))] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Odontograma Interativo</h3>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Registre procedimentos realizados e planejados visualmente em cada dente
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--flow-turquoise))] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Evolução Clínica</h3>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Documente cada consulta com fotos, arquivos e observações detalhadas
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--flow-turquoise))] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Modelos de Anamnese</h3>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Crie questionários personalizados para diferentes especialidades
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--flow-turquoise))] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Histórico Familiar</h3>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Vincule familiares e tenha visão completa do histórico genético
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--flow-turquoise))] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Anexos Ilimitados</h3>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Armazene radiografias, exames e documentos sem limite de espaço
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
              Digitalize seus prontuários hoje
            </h2>
            <p className="text-xl text-[hsl(var(--slate-gray))] mb-8 max-w-2xl mx-auto">
              Ganhe tempo, segurança e organização com o prontuário digital mais completo do mercado
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
