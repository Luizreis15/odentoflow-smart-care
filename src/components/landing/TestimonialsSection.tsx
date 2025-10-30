import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Testimonial {
  name: string;
  role: string;
  clinic: string;
  testimonial: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Dr. Carlos Mendes",
    role: "Cirurgião Dentista",
    clinic: "Clínica Sorriso Perfeito",
    testimonial: "O Flowdent revolucionou minha clínica. Reduzi em 70% o tempo gasto com gestão administrativa e posso focar totalmente nos meus pacientes. O suporte é excepcional!",
    rating: 5,
  },
  {
    name: "Dra. Marina Silva",
    role: "Ortodontista",
    clinic: "Odonto Excellence",
    testimonial: "Migrar para o Flowdent foi a melhor decisão! A equipe ajudou em todo processo e em 2 dias já estávamos operando 100%. A agenda inteligente é fantástica.",
    rating: 5,
  },
  {
    name: "Dr. Roberto Alves",
    role: "Implantodontista",
    clinic: "Implante Center",
    testimonial: "Testei 4 softwares diferentes antes do Flowdent. Este é o único que realmente entende as necessidades de uma clínica odontológica moderna. Indispensável!",
    rating: 5,
  },
];

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
    >
      <Card className="bg-white rounded-2xl p-8 shadow-lg border border-[hsl(var(--cloud-white))] relative h-full">
        {/* Quote Icon */}
        <div className="absolute top-6 right-6 opacity-10">
          <Quote className="w-16 h-16 text-[hsl(var(--flow-turquoise))]" />
        </div>

        {/* Rating */}
        <div className="flex items-center mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < testimonial.rating
                  ? 'text-[hsl(var(--warning-amber))] fill-current'
                  : 'text-[hsl(var(--silver-cloud))]'
              }`}
            />
          ))}
        </div>

        {/* Testimonial */}
        <p className="text-[hsl(var(--slate-gray))] leading-relaxed mb-6 relative z-10">
          "{testimonial.testimonial}"
        </p>

        {/* Author */}
        <div className="flex items-center border-t border-[hsl(var(--cloud-white))] pt-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(var(--flow-turquoise))] to-[hsl(var(--health-mint))] flex items-center justify-center text-white font-bold text-lg mr-4">
            {testimonial.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-semibold text-[hsl(var(--slate-gray))]">{testimonial.name}</h4>
            <p className="text-sm text-[hsl(var(--silver-cloud))]">{testimonial.role}</p>
            <p className="text-sm text-[hsl(var(--flow-turquoise))] font-medium">{testimonial.clinic}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="depoimentos" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-[hsl(var(--slate-gray))] mb-4">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-lg text-[hsl(var(--silver-cloud))] max-w-2xl mx-auto">
            Histórias reais de profissionais que transformaram suas clínicas
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
