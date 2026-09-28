import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Sparkles,
  Users,
  Search,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { listApprovedCoaches } from '../firebase';
import { CoachProfileEntity } from '../types';

const POPULAR_DISCIPLINES = [
  'Fitness / Palestra',
  'Running',
  'Calisthenics',
  'CrossFit / Functional',
  'Ciclismo',
  'Nuoto',
  'Tennis',
  'Padel',
  'Yoga',
  'Pilates',
  'Preparazione Atletica',
  'Mobilità',
  'Postura',
];

export const HomePage: React.FC = () => {
  const { navigate, openQuestionnaire } = useNavigation();
  const [featuredCoaches, setFeaturedCoaches] = useState<CoachProfileEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    listApprovedCoaches()
      .then((coaches) => {
        if (mounted) {
          setFeaturedCoaches(coaches.slice(0, 3));
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching featured coaches', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectDiscipline = (disc: string) => {
    navigate(`/coaches?discipline=${encodeURIComponent(disc)}`);
  };

  return (
    <div className="w-full">
      {/* ============================================================ */}
      {/* 1. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          {/* Label in menta */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#8EF5DC]/30 bg-[#8EF5DC]/10 px-3.5 py-1 text-xs font-semibold text-[#8EF5DC] mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            MARKETPLACE DELLO SPORT E DEL FITNESS
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#F4F5F6] leading-[1.15]">
            Trova il coach <span className="text-[#8EF5DC]">giusto</span> per il tuo obiettivo.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[#9EABA7] leading-relaxed max-w-2xl mx-auto">
            La piattaforma dedicata che connette atleti e appassionati con personal trainer, preparatori
            e professionisti verificati. Sessioni online o in presenza, costruite su misura per te.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={openQuestionnaire}
              id="hero-btn-trova-coach"
              className="w-full sm:w-auto inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#8EF5DC] px-7 py-3 text-sm font-semibold text-[#080A0A] hover:bg-[#7cebcfe8] active:scale-[0.98] transition-all"
            >
              Trova il tuo Coach
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => navigate('/coaches')}
              id="hero-btn-esplora-coach"
              className="w-full sm:w-auto inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#111A1A] px-6 py-3 text-sm font-medium text-[#F4F5F6] hover:bg-white/5 hover:border-white/25 transition-all"
            >
              <Compass className="h-4 w-4 text-[#8EF5DC]" />
              Esplora i Coach
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* QUICK SEARCH: COSA VUOI ALLENARE?                            */}
        {/* ============================================================ */}
        <div className="mt-14 max-w-4xl mx-auto rounded-3xl border border-white/10 bg-[#111A1A] p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#8EF5DC] font-bold">
                RICERCA RAPIDA
              </span>
              <h2 className="text-lg font-bold text-[#F4F5F6]">Cosa vuoi allenare?</h2>
            </div>
            <button
              onClick={() => navigate('/coaches')}
              className="text-xs text-[#8EF5DC] hover:underline font-medium text-left"
            >
              Tutte le 19 discipline →
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {POPULAR_DISCIPLINES.map((disc) => (
              <button
                key={disc}
                onClick={() => handleSelectDiscipline(disc)}
                className="inline-flex min-h-[40px] items-center rounded-xl border border-white/10 bg-[#0C1212] px-3.5 py-1.5 text-xs font-medium text-[#F4F5F6] hover:border-[#8EF5DC]/60 hover:text-[#8EF5DC] transition-all"
              >
                {disc}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. COACH DISPONIBILI (DATI REALI FIRESTORE)                   */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-[#8EF5DC] uppercase tracking-wider">
              PROFESSIONISTI VERIFICATI
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F4F5F6] mt-1">
              Coach disponibili sulla piattaforma
            </h2>
            <p className="text-sm text-[#9EABA7] mt-1">
              Ogni profilo viene accuratamente verificato dal team GROW UP prima della pubblicazione.
            </p>
          </div>
          <button
            onClick={() => navigate('/coaches')}
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-[#8EF5DC] hover:underline"
          >
            Vedi tutti i coach
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-[#9EABA7]">
            Caricamento coach verificati in corso...
          </div>
        ) : featuredCoaches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCoaches.map((coach) => (
              <div
                key={coach.coachId}
                className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 flex flex-col justify-between hover:border-[#8EF5DC]/40 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {coach.photoURL ? (
                        <img
                          src={coach.photoURL}
                          alt={coach.displayName}
                          className="h-14 w-14 rounded-2xl object-cover border border-white/10"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-2xl bg-[#080A0A] border border-white/10 flex items-center justify-center font-bold text-lg text-[#8EF5DC]">
                          {coach.displayName
                            .split(' ')
                            .slice(0, 2)
                            .map((p) => p[0])
                            .join('')
                            .toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-base text-[#F4F5F6] group-hover:text-white">
                          {coach.displayName}
                        </h3>
                        <p className="text-xs text-[#8EF5DC] font-medium">{coach.discipline}</p>
                      </div>
                    </div>

                    {coach.verificationStatus === 'approved' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#8EF5DC]/10 px-2 py-0.5 text-[10px] font-bold text-[#8EF5DC] border border-[#8EF5DC]/30">
                        <ShieldCheck className="h-3 w-3" />
                        Verificato
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-xs text-[#9EABA7] line-clamp-3 leading-relaxed">
                    {coach.bio || 'Coach sportivo qualificato su GROW UP.'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(coach.tags || [coach.discipline]).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-[#080A0A] px-2 py-0.5 text-[10px] text-[#9EABA7] border border-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                    {coach.experienceYears ? (
                      <span className="rounded-lg bg-[#080A0A] px-2 py-0.5 text-[10px] text-[#9EABA7] border border-white/5">
                        {coach.experienceYears} anni exp
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="text-xs text-[#9EABA7]">
                    Modalità:{' '}
                    <span className="text-[#F4F5F6] font-medium">
                      {(coach.modalities || ['Online', 'In presenza']).join(', ')}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/coaches/${coach.coachId}`)}
                    className="inline-flex min-h-[40px] items-center gap-1 rounded-xl bg-[#8EF5DC] px-3.5 py-1.5 text-xs font-semibold text-[#080A0A] hover:bg-[#7cebcfe8] transition-all"
                  >
                    Vedi profilo
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-8 sm:p-10 text-center max-w-2xl mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8EF5DC]/10 text-[#8EF5DC] mb-4">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-[#F4F5F6]">
              I primi coach sono in fase di verifica
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#9EABA7] leading-relaxed">
              Il marketplace GROW UP accoglie candidature continue da professionisti laureati in
              Scienze Motorie o con brevetti federali CONI.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/for-coaches')}
                className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#8EF5DC] px-5 py-2 text-xs font-semibold text-[#080A0A]"
              >
                Diventa un Coach GROW UP
              </button>
              <button
                onClick={() => navigate('/coaches')}
                className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 px-5 py-2 text-xs font-semibold text-[#F4F5F6]"
              >
                Esplora il catalogo
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 3. COME FUNZIONA                                              */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#8EF5DC] uppercase tracking-wider">
            IL METODO GROW UP
          </span>
          <h2 className="text-3xl font-extrabold text-[#F4F5F6] mt-1">Come funziona la piattaforma</h2>
          <p className="text-sm text-[#9EABA7] mt-2">
            Tre passaggi trasparenti per trovare il coach ideale e iniziare il tuo percorso.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 flex flex-col justify-between">
            <div>
              <div className="text-3xl font-black text-[#8EF5DC]">01</div>
              <h3 className="text-lg font-bold text-[#F4F5F6] mt-3">Esplora o rispondi al quiz</h3>
              <p className="text-xs sm:text-sm text-[#9EABA7] mt-2 leading-relaxed">
                Filtra il catalogo per disciplina, obiettivo, modalità o rispondi alle 5 domande
                guidate per visualizzare i coach più affini.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 flex flex-col justify-between">
            <div>
              <div className="text-3xl font-black text-[#8EF5DC]">02</div>
              <h3 className="text-lg font-bold text-[#F4F5F6] mt-3">Confronta profili e disponibilità</h3>
              <p className="text-xs sm:text-sm text-[#9EABA7] mt-2 leading-relaxed">
                Leggi l'esperienza, le specializzazioni, i servizi offerti e consulta gli orari
                aggiornati in tempo reale dal professionista.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 flex flex-col justify-between">
            <div>
              <div className="text-3xl font-black text-[#8EF5DC]">03</div>
              <h3 className="text-lg font-bold text-[#F4F5F6] mt-3">Prenota e gestisci online</h3>
              <p className="text-xs sm:text-sm text-[#9EABA7] mt-2 leading-relaxed">
                Riserva lo slot direttamente dal sito. Accedi alla tua Dashboard atleta per
                monitorare le tue sessioni programmate.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => navigate('/how-it-works')}
            className="text-xs text-[#8EF5DC] hover:underline font-semibold"
          >
            Scopri tutti i dettagli del metodo e delle tutele →
          </button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. CALL TO ACTION FINALE                                      */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#F4F5F6]">
              Pronto a trovare il tuo punto di partenza?
            </h2>
            <p className="mt-3 text-sm text-[#9EABA7]">
              Fai il matching guidato in 2 minuti o sfoglia liberamente tutti i profili verificati.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={openQuestionnaire}
                className="w-full sm:w-auto inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#8EF5DC] px-7 py-3 text-sm font-semibold text-[#080A0A] hover:bg-[#7cebcfe8]"
              >
                Inizia il questionario
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/coaches')}
                className="w-full sm:w-auto inline-flex min-h-[46px] items-center justify-center rounded-xl border border-white/15 px-6 py-3 text-sm font-medium text-[#F4F5F6] hover:bg-white/5"
              >
                Sfoglia catalogo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
