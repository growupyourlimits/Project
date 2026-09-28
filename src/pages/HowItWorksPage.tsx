import React from 'react';
import {
  Compass,
  CalendarCheck,
  ShieldCheck,
  UserCheck,
  Award,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export const HowItWorksPage: React.FC = () => {
  const { navigate, openQuestionnaire } = useNavigation();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#8EF5DC]/30 bg-[#8EF5DC]/10 px-3.5 py-1 text-xs font-semibold text-[#8EF5DC] mb-4">
          <HelpCircle className="h-3.5 w-3.5" />
          GUIDA ALLA PIATTAFORMA
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F4F5F6] tracking-tight">
          Come funziona GROW UP
        </h1>
        <p className="mt-4 text-sm sm:text-base text-[#9EABA7] leading-relaxed">
          Tutto quello che c'è da sapere su come trovare il tuo coach, prenotare sessioni e come
          funziona la verifica dei professionisti.
        </p>
      </div>

      {/* For Athletes */}
      <div className="mt-14 space-y-6">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-[#8EF5DC]" />
          <h2 className="text-xl font-bold text-[#F4F5F6]">Per chi si allena (Atleti e Appassionati)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-[#8EF5DC]/10 text-[#8EF5DC] flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-base text-[#F4F5F6]">Ricerca libera o matching</h3>
            <p className="text-xs text-[#9EABA7] leading-relaxed">
              Puoi sfogliare il catalogo con filtri avanzati (disciplina, obiettivo, livello,
              modalità) oppure rispondere alle 5 domande del questionario per visualizzare i profili
              più compatibili.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-[#8EF5DC]/10 text-[#8EF5DC] flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-base text-[#F4F5F6]">Scegli servizio e orario</h3>
            <p className="text-xs text-[#9EABA7] leading-relaxed">
              Ogni coach pubblica le proprie tariffe informative e gli slot orari disponibili.
              Seleziona la data più comoda per te.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-[#8EF5DC]/10 text-[#8EF5DC] flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-base text-[#F4F5F6]">Prenotazione diretta</h3>
            <p className="text-xs text-[#9EABA7] leading-relaxed">
              Lo slot viene riservato istantaneamente. Trovi le tue prenotazioni nella Dashboard
              personale per gestire promemoria e contatto diretto con il coach.
            </p>
          </div>
        </div>
      </div>

      {/* For Coaches */}
      <div className="mt-14 space-y-6">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-[#8EF5DC]" />
          <h2 className="text-xl font-bold text-[#F4F5F6]">Per i Coach e Professionisti</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-[#8EF5DC]/10 text-[#8EF5DC] flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-base text-[#F4F5F6]">Invia la candidatura</h3>
            <p className="text-xs text-[#9EABA7] leading-relaxed">
              Compila il modulo online con la tua esperienza, specializzazioni e titoli professionali
              riconosciuti.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-[#8EF5DC]/10 text-[#8EF5DC] flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-base text-[#F4F5F6]">Revisione del profilo</h3>
            <p className="text-xs text-[#9EABA7] leading-relaxed">
              Il team di verifica GROW UP valuta i requisiti. Appena approvato, il tuo account viene
              promosso a Coach con badge verificato.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-[#8EF5DC]/10 text-[#8EF5DC] flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-base text-[#F4F5F6]">Configura e ricevi allievi</h3>
            <p className="text-xs text-[#9EABA7] leading-relaxed">
              Accedi alla Dashboard Coach per definire i tuoi pacchetti, aggiungere slot di
              disponibilità oraria e visualizzare le prenotazioni in arrivo.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="mt-14 rounded-3xl border border-white/10 bg-[#111A1A] p-8 text-center">
        <h2 className="text-2xl font-bold text-[#F4F5F6]">Inizia subito</h2>
        <p className="mt-2 text-xs sm:text-sm text-[#9EABA7]">
          Esplora la nostra directory o mettiti in contatto con il team per qualsiasi domanda.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/coaches')}
            className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#8EF5DC] px-6 py-2.5 text-xs font-semibold text-[#080A0A]"
          >
            Esplora i Coach
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate('/for-coaches')}
            className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 px-6 py-2.5 text-xs font-semibold text-[#F4F5F6]"
          >
            Diventa un Coach
          </button>
        </div>
      </div>
    </div>
  );
};
