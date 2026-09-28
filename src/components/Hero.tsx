import React from 'react';
import { ArrowRight, Star, ShieldCheck, CheckCircle2, Sparkles, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { HERO_SAMPLE_COACH } from '../data/coaches';

interface HeroProps {
  onOpenQuestionnaire: () => void;
  onScrollToHowItWorks: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenQuestionnaire,
  onScrollToHowItWorks,
}) => {
  const coach = HERO_SAMPLE_COACH;

  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 xl:px-12">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
          
          {/* Left Column: Hero Copy & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="lg:col-span-7"
          >
            {/* Small mint badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8EF5DC]/30 bg-[#8EF5DC]/10 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-[#8EF5DC] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8EF5DC]" />
              ALLENATI CON IL METODO
            </div>

            {/* Main Headline - Bold, large, authoritative sport-tech scaling */}
            <h1 className="mt-7 text-4xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl font-black tracking-tight text-[#F4F5F6] leading-[1.03] text-balance">
              Il coach <span className="text-[#8EF5DC]">giusto</span> cambia tutto.
            </h1>

            {/* Subtext */}
            <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-[#9EABA7] leading-relaxed max-w-2xl">
              Rispondi a poche domande e trova un professionista selezionato in base ai tuoi obiettivi, al tuo livello e al tuo modo di allenarti.
            </p>

            {/* CTA Group: Full-width on mobile (<480px), row on tablet/desktop */}
            <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-5">
              <button
                onClick={onOpenQuestionnaire}
                id="hero-cta-find-coach"
                className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#8EF5DC] px-8 py-3.5 text-base font-semibold text-[#080A0A] transition-all hover:bg-[#7cebcfe8] focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]"
              >
                Trova il mio coach
                <ArrowRight className="h-4.5 w-4.5" />
              </button>

              <button
                onClick={onScrollToHowItWorks}
                id="hero-cta-how-it-works"
                className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3.5 text-base font-medium text-[#F4F5F6] hover:bg-[#111A1A] hover:border-white/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC]"
              >
                Come funziona
                <span className="text-sm">→</span>
              </button>
            </div>

            {/* Credibility proof bullets - clean, neutral icons without excessive decorative mint */}
            <div className="mt-12 sm:mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 sm:gap-x-8 sm:gap-y-3 text-xs sm:text-sm text-[#8E9B98]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-[#F4F5F6]" />
                <span>Coach 100% verificati e certificati</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Star className="h-4 w-4 text-[#F4F5F6]" />
                <span>Valutazione media 4.9 / 5</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Activity className="h-4 w-4 text-[#F4F5F6]" />
                <span>Primo colloquio orientativo gratuito</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Suggested Match Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="lg:col-span-5 w-full flex justify-center lg:justify-end"
          >
            <div
              id="suggested-match-card"
              className="w-full max-w-full sm:max-w-md rounded-2xl border border-white/10 bg-[#111A1A] p-6 sm:p-8 shadow-2xl transition-all hover:border-white/20"
            >
              {/* Card Header with Recommended Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8E9B98]">
                  Match suggerito
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8EF5DC]/30 bg-[#8EF5DC]/10 px-3 py-1 text-xs font-semibold text-[#8EF5DC]">
                  <Sparkles className="h-3 w-3" />
                  {coach.badge}
                </span>
              </div>

              {/* Coach Profile Header */}
              <div className="mt-6 flex items-start gap-4">
                {/* Clean geometric abstract avatar */}
                <div className="relative flex-shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#172323] border border-white/10 text-[#F4F5F6] text-xl font-bold tracking-wider">
                    {coach.avatarInitials}
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#080A0A] border-2 border-[#111A1A]"
                    title="Profilo Verificato"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#8EF5DC]" />
                  </div>
                </div>

                {/* Name, Role & Rating */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-xl font-bold text-[#F4F5F6] truncate">
                      {coach.name}
                    </h2>
                    <div className="flex items-center gap-1 text-xs font-semibold text-[#F4F5F6]">
                      <Star className="h-3.5 w-3.5 fill-current text-[#F4F5F6]" />
                      <span>{coach.rating}</span>
                      <span className="text-[#8E9B98]">({coach.reviewCount})</span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-[#9EABA7] mt-0.5">
                    {coach.role}
                  </p>

                  <p className="text-xs text-[#8E9B98] mt-1">
                    {coach.experience}
                  </p>
                </div>
              </div>

              {/* Coach Tags */}
              <div className="mt-5 flex flex-wrap gap-2">
                {coach.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-lg border border-white/5 bg-[#172323] px-3 py-1 text-xs font-medium text-[#D1D9D7]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Bio snippet */}
              <p className="mt-5 text-sm text-[#9EABA7] leading-relaxed">
                "{coach.bio}"
              </p>

              {/* Match Details Metric Box */}
              <div className="mt-6 rounded-xl border border-white/5 bg-[#0C1414] p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#8E9B98]">
                    Compatibilità con te
                  </div>
                  <div className="text-sm font-semibold text-[#F4F5F6] mt-0.5">
                    Basato su obiettivi & ritmo
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#8EF5DC]">
                    {coach.matchScore}%
                  </span>
                </div>
              </div>

              {/* Card Action - Min 44px height for mobile accessibility */}
              <button
                onClick={onOpenQuestionnaire}
                id="match-card-cta"
                className="mt-6 w-full min-h-[44px] flex items-center justify-center rounded-xl border border-white/10 bg-transparent py-3 px-4 text-sm font-semibold text-[#F4F5F6] transition-all hover:border-[#8EF5DC] hover:text-[#8EF5DC] hover:bg-[#8EF5DC]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC]"
              >
                Vedi i coach compatibili
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
