import React from 'react';
import { UserCheck, Sliders, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface HowItWorksProps {
  onOpenQuestionnaire: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenQuestionnaire }) => {
  const steps = [
    {
      number: '01',
      title: 'Parlaci di te',
      description: 'Obiettivi, disciplina, disponibilità e livello di partenza. Bastano 4 risposte essenziali per inquadrare le tue esigenze.',
      icon: Sliders,
    },
    {
      number: '02',
      title: 'Creiamo il match',
      description: 'Confrontiamo il tuo profilo con coach selezionati e certificati per trovare la massima sintonia di metodo e stile di vita.',
      icon: UserCheck,
    },
    {
      number: '03',
      title: 'Inizia insieme',
      description: 'Scegli il professionista, fai una prima video-consulenza conoscitiva gratuita e avvia il tuo percorso personalizzato.',
      icon: PlayCircle,
    },
  ];

  return (
    <section id="come-funziona" className="relative py-20 sm:py-28 lg:py-36 border-t border-white/5 bg-[#080A0A]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 xl:px-12">
        
        {/* Section Header with generous breathing space */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#8EF5DC]/30 bg-[#8EF5DC]/10 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-[#8EF5DC] uppercase">
            IL PROCESSO
          </div>
          <h2 className="mt-5 text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F4F5F6] leading-[1.08] text-balance">
            Un match che parte da te.
          </h2>
          <p className="mt-5 text-base sm:text-lg lg:text-xl text-[#9EABA7] leading-relaxed">
            Nessun algoritmo opaco né schede standardizzate: un percorso limpido pensato per metterti in contatto con il coach giusto.
          </p>
        </motion.div>

        {/* Numbered Cards: 1 col on mobile (<768px), 2 cols on tablet (768px), 3 cols on desktop (1024px+) */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isThirdOnTablet = index === 2;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                className={`group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#111A1A] p-7 sm:p-8 transition-all duration-300 hover:border-white/20 hover:bg-[#142020] ${
                  isThirdOnTablet ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div>
                  {/* Top Row: Clean numbered step & subtle tool icon */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F4F5F6]">
                      {step.number}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#080A0A] border border-white/10 text-[#9EABA7] group-hover:text-[#F4F5F6] transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="mt-8 text-xl font-bold text-[#F4F5F6]">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-sm sm:text-base text-[#9EABA7] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Subtle bottom indicator */}
                <div className="mt-8 pt-4 border-t border-white/5 flex items-center text-xs text-[#8E9B98]">
                  <span>Passo {step.number} di 03</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Supporting Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 rounded-2xl border border-white/5 bg-[#0D1414] p-6 sm:p-7"
        >
          <p className="text-sm sm:text-base text-[#9EABA7] leading-relaxed max-w-xl">
            Non sai quale disciplina o frequenza scegliere? Ti guidiamo noi passo dopo passo.
          </p>
          <button
            onClick={onOpenQuestionnaire}
            id="how-it-works-quick-cta"
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#8EF5DC] px-5 py-2.5 text-sm font-semibold text-[#080A0A] hover:bg-[#7cebcfe8] active:scale-[0.98] transition-all whitespace-nowrap"
          >
            Fai il test in 2 minuti →
          </button>
        </motion.div>

      </div>
    </section>
  );
};
