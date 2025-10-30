import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section id="contato" className="py-20 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--flowdent-blue))] via-[hsl(var(--flow-turquoise))] to-[hsl(var(--health-mint))] -z-10"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto text-white"
        >
          {/* Headline */}
          <h2 className="text-5xl font-bold mb-6">
            Pronto para Transformar sua Clínica?
          </h2>

          {/* Subheadline */}
          <p className="text-xl mb-8 opacity-90">
            Junte-se a centenas de dentistas que já descobriram como é simples 
            gerenciar uma clínica quando você tem as ferramentas certas.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>7 dias grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Cancele quando quiser</span>
            </div>
          </div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg"
                asChild
                className="bg-white text-[hsl(var(--flowdent-blue))] hover:bg-white/90 transition-all duration-300 text-lg px-8 py-6 shadow-xl"
              >
                <Link to="/auth">
                  Mude Já Sua Gestão!
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg"
                variant="outline"
                asChild
                className="border-2 border-white bg-white text-[hsl(var(--flow-turquoise))] hover:bg-white/10 hover:text-white transition-all duration-300 text-lg px-8 py-6"
              >
                <Link to="/auth">
                  <Play className="mr-2 h-5 w-5" />
                  Inicie de Graça
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Text */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-8 text-sm opacity-80"
          >
            💙 Mais de 500 clínicas já confiaram no Flowdent para transformar sua gestão
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
