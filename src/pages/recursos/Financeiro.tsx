import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, CreditCard, CheckCircle } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';
import financeiroMockup from '@/assets/financeiro-mockup.jpg';

export default function FinanceiroRecurso() {
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
                  Controle Financeiro Completo
                </h1>
                <p className="text-xl text-[hsl(var(--slate-gray))] mb-8">
                  Gerencie pagamentos, comissões e faturamento em um só lugar. Tenha visão clara da saúde financeira da sua clínica.
                </p>
                <Button 
                  asChild
                  size="lg"
                  className="bg-[hsl(var(--flowdent-blue))] text-white hover:bg-[hsl(var(--flow-turquoise))]"
                >
                  <Link to="/auth">Começar Agora</Link>
                </Button>
              </div>
              <div>
                <img 
                  src={financeiroMockup} 
                  alt="Interface do Controle Financeiro Flowdent" 
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
              Finanças sob controle
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[hsl(var(--flowdent-blue))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-[hsl(var(--flowdent-blue))]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Fluxo de Caixa</h3>
                <p className="text-[hsl(var(--slate-gray))]">
                  Visualize todas as entradas e saídas em tempo real
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[hsl(var(--flow-turquoise))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-[hsl(var(--flow-turquoise))]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Relatórios Inteligentes</h3>
                <p className="text-[hsl(var(--slate-gray))]">
                  Gráficos e análises para decisões estratégicas
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[hsl(var(--flowdent-blue))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-[hsl(var(--flowdent-blue))]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Múltiplas Formas de Pagamento</h3>
                <p className="text-[hsl(var(--slate-gray))]">
                  Dinheiro, cartão, PIX e parcelamento integrados
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[hsl(var(--flow-turquoise))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[hsl(var(--flow-turquoise))]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Comissões Automáticas</h3>
                <p className="text-[hsl(var(--slate-gray))]">
                  Calcule e pague comissões sem erros
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Funcionalidades Detalhadas */}
        <section className="py-16 bg-[hsl(var(--cloud-white))]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-[hsl(var(--flowdent-blue))] mb-12">
              Recursos financeiros avançados
            </h2>
            <div className="space-y-8 max-w-3xl mx-auto">
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--flow-turquoise))] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Contas a Receber e Pagar</h3>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Controle de parcelas, vencimentos e cobranças automáticas
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--flow-turquoise))] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Gestão de Comissões</h3>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Configure percentuais por profissional e procedimento automaticamente
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--flow-turquoise))] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Fechamento de Caixa</h3>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Conciliação diária com conferência de valores por forma de pagamento
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--flow-turquoise))] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Planos de Tratamento</h3>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Crie orçamentos com parcelamento e acompanhe o pagamento por etapa
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--flow-turquoise))] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Notas Fiscais</h3>
                  <p className="text-[hsl(var(--slate-gray))]">
                    Emissão integrada de NF-e e NFS-e diretamente do sistema
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
              Organize suas finanças hoje
            </h2>
            <p className="text-xl text-[hsl(var(--slate-gray))] mb-8 max-w-2xl mx-auto">
              Tenha clareza total sobre seus números e tome decisões mais inteligentes
            </p>
            <Button 
              asChild
              size="lg"
              className="bg-[hsl(var(--flowdent-blue))] text-white hover:bg-[hsl(var(--flow-turquoise))]"
            >
              <Link to="/auth">Experimentar Grátis por 7 Dias</Link>
            </Button>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
