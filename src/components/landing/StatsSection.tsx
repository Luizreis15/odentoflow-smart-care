import { motion } from 'framer-motion';
import { useState } from 'react';
import CountUp from 'react-countup';

interface StatItemProps {
  value: number;
  suffix?: string;
  label: string;
  index: number;
}

function StatItem({ value, suffix = '', label, index }: StatItemProps) {
  const [startCount, setStartCount] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      onViewportEnter={() => setStartCount(true)}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="text-5xl font-bold text-[hsl(var(--flowdent-blue))] mb-2">
        {startCount && (
          <>
            {value >= 1000 ? '+' : ''}
            <CountUp end={value} duration={2.5} separator="." />
            {suffix}
          </>
        )}
      </div>
      <p className="text-lg text-[hsl(var(--silver-cloud))]">{label}</p>
    </motion.div>
  );
}

export default function StatsSection() {
  return (
    <section className="py-8 bg-gradient-to-br from-[hsl(var(--cloud-white))] to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold text-[hsl(var(--slate-gray))] mb-4">
            Números que Comprovam Nossa Eficiência
          </h2>
          <p className="text-lg text-[hsl(var(--silver-cloud))] max-w-2xl mx-auto">
            Mais de 500 clínicas já transformaram sua gestão com o Flowdent
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <StatItem value={500} suffix="+" label="Clínicas Ativas" index={0} />
          <StatItem value={50000} suffix="+" label="Consultas Agendadas/Mês" index={1} />
          <StatItem value={98} suffix="%" label="Satisfação dos Clientes" index={2} />
        </div>
      </div>
    </section>
  );
}
