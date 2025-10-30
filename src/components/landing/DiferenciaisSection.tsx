import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  Headphones, 
  Database, 
  GraduationCap, 
  HandshakeIcon, 
  Shield, 
  TrendingUp 
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Diferencial {
  icon: LucideIcon;
  title: string;
  description: string;
}

const diferenciais: Diferencial[] = [
  {
    icon: Headphones,
    title: "Suporte Humanizado",
    description: "Atendimento em português, com pessoas reais que entendem sua realidade e respondem rapidamente.",
  },
  {
    icon: Database,
    title: "Migração Gratuita",
    description: "Nossa equipe cuida de toda migração dos seus dados. Você não perde nada e não paga nada por isso.",
  },
  {
    icon: GraduationCap,
    title: "Treinamento Completo",
    description: "Onboarding personalizado e materiais de apoio para sua equipe dominar a plataforma rapidamente.",
  },
  {
    icon: HandshakeIcon,
    title: "Sem Fidelidade",
    description: "Sem contrato de permanência. Você fica porque ama, não porque é obrigado.",
  },
  {
    icon: Shield,
    title: "Segurança de Nível Bancário",
    description: "Seus dados protegidos com criptografia de ponta e backup automático diário na nuvem.",
  },
  {
    icon: TrendingUp,
    title: "Evolução Constante",
    description: "Atualizações automáticas e gratuitas. Novos recursos toda semana baseados no seu feedback.",
  },
];

function DiferencialCard({ diferencial, index }: { diferencial: Diferencial; index: number }) {
  const Icon = diferencial.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Card className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-[hsl(var(--cloud-white))] group h-full">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--flow-turquoise))] to-[hsl(var(--health-mint))] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-[hsl(var(--slate-gray))] mb-3">
          {diferencial.title}
        </h3>

        {/* Description */}
        <p className="text-[hsl(var(--silver-cloud))] leading-relaxed">
          {diferencial.description}
        </p>
      </Card>
    </motion.div>
  );
}

export default function DiferenciaisSection() {
  return (
    <section className="py-12 bg-gradient-to-br from-[hsl(var(--cloud-white))] to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-[hsl(var(--slate-gray))] mb-4">
            Por Que Escolher o Flowdent?
          </h2>
          <p className="text-lg text-[hsl(var(--silver-cloud))] max-w-2xl mx-auto">
            Muito além de um software, somos seu parceiro na jornada de crescimento
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {diferenciais.map((diferencial, index) => (
            <DiferencialCard key={index} diferencial={diferencial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
