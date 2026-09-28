import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface FinalCtaProps {
  onOpenQuestionnaire: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onOpenQuestionnaire }) => {
  return (
    <section className="relative py-20 sm:py-28 lg:py-36 border-t border-white/5 bg-[#080A0A] overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 xl:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="rounded-3xl border border-white/10 bg-[#111A1A] px-6 py-14 sm:px-12 sm:py-20 lg:px-16 lg:py-24 shadow-2xl relative"
        >
          {/* Subtle accent badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#8EF5DC]/30 bg-[#8EF5DC]/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#8EF5DC] uppercase">
            IL TUO PROSSIMO PASSO
          </div>

          {/* Strong, Larger Headline */}
          <h2 className="mt-6 sm:mt-7 text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F4F5F6] max-w-3xl mx-auto leading-[1.08] text-balance">
            Pronto a trovare il tuo punto di partenza?
          </h2>

          <p className="mt-5 text-base sm:text-lg lg:text-xl text-[#9EABA7] max-w-2xl mx-auto leading-relaxed">
            Nessun impegno: compila il questionario, confronta i profili compatibili e fissa la tua prima chiamata orientativa senza costi.
          </p>

          {/* Primary Action Button - full-width on mobile (<480px), min-h >= 44px */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenQuestionnaire}
              id="final-cta-start-quiz"
              className="w-full sm:w-auto min-h-[50px] sm:min-h-[54px] inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#8EF5DC] px-9 py-4 text-base font-semibold text-[#080A0A] hover:bg-[#7cebcfe8] focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98] transition-all"
            >
              Inizia il questionario
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Supporting note */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs sm:text-sm text-[#8E9B98]">
            <Clock className="h-4 w-4 text-[#F4F5F6]" />
            <span>Richiede meno di 2 minuti. Gratuito e senza vincoli.</span>
          </div>

        </motion.div>
      </div>
    </section>
  );
};
