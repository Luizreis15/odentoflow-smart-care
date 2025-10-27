import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, DollarSign, MessageSquare, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-dental.jpg";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: "Agendamento Inteligente",
      description: "Gerencie consultas com calendário integrado e lembretes automáticos.",
    },
    {
      icon: Users,
      title: "Gestão de Pacientes",
      description: "Prontuário digital completo e histórico de tratamentos centralizado.",
    },
    {
      icon: DollarSign,
      title: "Controle Financeiro",
      description: "Acompanhe receitas, despesas e pagamentos em tempo real.",
    },
    {
      icon: MessageSquare,
      title: "Comunicação Automatizada",
      description: "Envie lembretes e mensagens personalizadas aos pacientes.",
    },
    {
      icon: Shield,
      title: "Segurança de Dados",
      description: "Criptografia e proteção total das informações dos pacientes.",
    },
    {
      icon: Zap,
      title: "Sistema Modular",
      description: "Expanda funcionalidades conforme sua clínica cresce.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Flowdent Hero" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Transforme a Gestão da Sua Clínica Odontológica
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-95">
              Flowdent une tecnologia e praticidade para organizar agendamentos, 
              prontuários e relacionamento com pacientes em uma única plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-card text-primary hover:bg-card/90 shadow-xl text-lg px-8"
              >
                Inicie Gratuitamente
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Conhecer Recursos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que sua clínica precisa em um só lugar
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Recursos pensados para otimizar o dia a dia da sua equipe e melhorar 
              a experiência dos seus pacientes.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-2"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Pronto para modernizar sua clínica?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de clínicas que já otimizaram sua gestão com Flowdent.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-card text-primary hover:bg-card/90 shadow-2xl text-lg px-8"
          >
            Inicie Gratuitamente
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                <span className="text-primary-foreground font-bold">F</span>
              </div>
              <span className="font-bold text-lg">Flowdent</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Flowdent. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;