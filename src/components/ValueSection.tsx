import React from 'react';
import { Award, Target, MessageCircle, ArrowUpRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ValueSectionProps {
  onOpenMethodDetails: () => void;
  onOpenQuestionnaire: () => void;
}

export const ValueSection: React.FC<ValueSectionProps> = ({
  onOpenMethodDetails,
  onOpenQuestionnaire,
}) => {
  return (
    <section id="metodo" className="relative py-20 sm:py-28 lg:py-36 border-t border-white/5 bg-[#080A0A]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 xl:px-12">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
          
          {/* Left Column: Copy (Desktop 1024px+: left col-span-6) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="lg:col-span-6"
          >
            {/* Mint Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8EF5DC]/30 bg-[#8EF5DC]/10 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-[#8EF5DC] uppercase">
              IL TUO METODO
            </div>

            {/* Large Bold Title */}
            <h2 className="mt-5 text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#F4F5F6] leading-[1.08] text-balance">
              Non seguire un profilo. Scegli un percorso.
            </h2>

            {/* Text communicating personalizzazione, coach verificati e continuità */}
            <div className="mt-6 sm:mt-8 space-y-4 text-base sm:text-lg text-[#9EABA7] leading-relaxed">
              <p>
                Il web è pieno di programmi generici che ignorano i tuoi impegni, il tuo livello di stress e i tuoi punti di partenza. Il risultato? Calo di motivazione, sovraccarichi e abbandono dopo poche settimane.
              </p>
              <p>
                Con <strong className="text-[#8EF5DC] font-semibold">GROW UP</strong> trovi esclusivamente professionisti certificati che costruiscono una programmazione su misura per te, calibrando il carico reale e offrendoti un supporto continuo per farti raggiungere risultati duraturi nel tempo.
              </p>
            </div>

            {/* Core pillars checklist */}
            <ul className="mt-8 sm:mt-10 space-y-4 text-sm sm:text-base text-[#F4F5F6]">
              <li className="flex items-start gap-3.5">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-[#F4F5F6]">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>Valutazione posturale e anamnesi iniziale approfondita</span>
              </li>
              <li className="flex items-start gap-3.5">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-[#F4F5F6]">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>Adattamento settimanale dei carichi in base al tuo recupero</span>
              </li>
              <li className="flex items-start gap-3.5">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-[#F4F5F6]">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>Filo diretto via chat e correzione video delle esecuzioni</span>
              </li>
            </ul>

            {/* CTA Button - Min 44px height */}
            <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onOpenMethodDetails}
                id="value-cta-discover-method"
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-transparent px-6 py-3 text-sm font-semibold text-[#F4F5F6] hover:border-[#8EF5DC] hover:text-[#8EF5DC] active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC]"
              >
                Scopri il metodo
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>

          {/* Right Column: Large Dark Stats Card (Desktop 1024px+: right col-span-6) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="lg:col-span-6 w-full flex justify-center lg:justify-end"
          >
            <div
              id="value-stats-card"
              className="w-full max-w-full sm:max-w-xl rounded-2xl border border-white/10 bg-[#111A1A] p-6 sm:p-9 shadow-2xl transition-all hover:border-white/20"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                  <span className="text-xs font-semibold tracking-wider text-[#8E9B98] uppercase">
                    GLI STANDARD GROW UP
                  </span>
                  <h3 className="mt-1 text-xl sm:text-2xl font-bold text-[#F4F5F6]">
                    Qualità senza compromessi
                  </h3>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#080A0A] border border-white/10 text-[#F4F5F6]">
                  <Award className="h-5 w-5" />
                </div>
              </div>

              {/* Three Stat Rows */}
              <div className="mt-7 space-y-4 sm:space-y-5">
                {/* Stat 1: Coach verificati */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-white/5 bg-[#0D1414] p-5 transition-colors hover:border-white/10">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#080A0A] border border-white/10 text-[#F4F5F6]">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-base font-bold text-[#F4F5F6]">
                        Coach verificati
                      </h4>
                      <span className="font-mono text-lg font-black text-[#8EF5DC]">
                        100%
                      </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-[#9EABA7] leading-relaxed">
                      Selezioniamo solo professionisti con lauree in Scienze Motorie, certificazioni federali riconosciute e comprovata esperienza sul campo.
                    </p>
                  </div>
                </div>

                {/* Stat 2: Percorsi personalizzati */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-white/5 bg-[#0D1414] p-5 transition-colors hover:border-white/10">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#080A0A] border border-white/10 text-[#F4F5F6]">
                    <Target className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-base font-bold text-[#F4F5F6]">
                        Percorsi personalizzati
                      </h4>
                      <span className="font-mono text-lg font-black text-[#8EF5DC]">
                        1-on-1
                      </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-[#9EABA7] leading-relaxed">
                      Zero schede riciclate: il piano tiene conto di tempo disponibile, attrezzatura a disposizione e storico infortuni.
                    </p>
                  </div>
                </div>

                {/* Stat 3: Supporto online */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-white/5 bg-[#0D1414] p-5 transition-colors hover:border-white/10">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#080A0A] border border-white/10 text-[#F4F5F6]">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-base font-bold text-[#F4F5F6]">
                        Supporto online
                      </h4>
                      <span className="font-mono text-lg font-black text-[#8EF5DC]">
                        Costante
                      </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-[#9EABA7] leading-relaxed">
                      Sessioni video 1:1, analisi dell'esecuzione tecnica e check periodici per non farti mai sentire lasciato a te stesso.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Card Action with min-44px touch target */}
              <div className="mt-7 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-[#8E9B98]">
                <span>Nessun vincolo a lungo termine</span>
                <button
                  onClick={onOpenQuestionnaire}
                  className="inline-flex min-h-[44px] items-center font-semibold text-[#8EF5DC] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded px-1"
                >
                  Inizia ora →
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
