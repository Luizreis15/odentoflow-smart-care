import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/flowdent-hero.jpg';

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--flow-turquoise)/0.05)] via-white to-[hsl(var(--health-mint)/0.05)] -z-10"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-[hsl(var(--flow-turquoise)/0.2)] to-[hsl(var(--health-mint)/0.2)] rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-[hsl(var(--flowdent-blue)/0.1)] to-[hsl(var(--flow-turquoise)/0.1)] rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-[hsl(var(--flow-turquoise))] text-white px-4 py-2 text-sm font-semibold">
                🎉 Novidade: Integração com WhatsApp Business
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-extrabold text-[hsl(var(--slate-gray))] leading-tight"
            >
              O Software que{' '}
              <span className="text-[hsl(var(--flowdent-blue))]">Liberta</span>{' '}
              seu Tempo
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-[hsl(var(--silver-cloud))] leading-relaxed"
            >
              Sabemos que gerenciar uma clínica vai muito além dos atendimentos. 
              O Flowdent foi criado para ser diferente: uma plataforma intuitiva 
              que organiza sua gestão para que você possa focar no que realmente 
              importa: <span className="font-semibold text-[hsl(var(--flowdent-blue))]">seus pacientes</span>.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button 
                size="lg"
                asChild
                className="bg-[hsl(var(--flowdent-blue))] text-white hover:bg-[hsl(var(--flow-turquoise))] transition-all duration-300 text-lg px-8 py-6 shadow-lg hover:shadow-xl"
              >
                <Link to="/auth">
                  Comece Agora!
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-[hsl(var(--flow-turquoise))] text-[hsl(var(--flow-turquoise))] hover:bg-[hsl(var(--flow-turquoise))] hover:text-white transition-all duration-300 text-lg px-8 py-6"
              >
                <Play className="mr-2 h-5 w-5" />
                Agendar Demonstração
              </Button>
            </motion.div>

            {/* Trust Badge */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-[hsl(var(--silver-cloud))] text-sm"
            >
              Sem contrato de fidelidade. Cancele quando quiser. 💙
            </motion.p>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-4 pt-4"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--flow-turquoise))] to-[hsl(var(--health-mint))] border-2 border-white"
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--slate-gray))]">
                  +500 clínicas confiam no Flowdent
                </p>
                <p className="text-xs text-[hsl(var(--silver-cloud))]">
                  ⭐ 4.9/5 em satisfação
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative">
              <img
                src={heroImage}
                alt="Flowdent Dashboard Interface"
                className="w-full rounded-2xl shadow-2xl"
              />
              {/* Floating Element */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-[hsl(var(--cloud-white))]"
              >
                <p className="text-sm font-semibold text-[hsl(var(--slate-gray))]">
                  📅 Agenda inteligente
                </p>
                <p className="text-xs text-[hsl(var(--silver-cloud))]">
                  Reduz 60% do tempo de gestão
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
