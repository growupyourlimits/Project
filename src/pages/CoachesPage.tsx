import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  ArrowRight,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  Euro,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { listApprovedCoaches, listCoachAvailability, listCoachServices } from '../firebase';
import {
  CoachProfileEntity,
  DISCIPLINES,
  GOALS,
  LEVELS,
  MODALITIES,
} from '../types';

interface ExtendedCoachCard extends CoachProfileEntity {
  firstSlotLabel?: string;
  minPriceCents?: number;
}

export const CoachesPage: React.FC = () => {
  const { navigate, params, openQuestionnaire } = useNavigation();
  const [coaches, setCoaches] = useState<ExtendedCoachCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>(
    params.discipline || ''
  );
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedModality, setSelectedModality] = useState<string>('');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(150);

  // Load approved coaches and their availability
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    listApprovedCoaches()
      .then(async (profiles) => {
        if (!mounted) return;

        // Fetch availability and price previews
        const extended: ExtendedCoachCard[] = await Promise.all(
          profiles.map(async (coach) => {
            let firstSlotLabel: string | undefined;
            let minPriceCents: number | undefined;

            try {
              const [slots, services] = await Promise.all([
                listCoachAvailability(coach.coachId),
                listCoachServices(coach.coachId),
              ]);

              const now = Date.now();
              const validSlots = slots
                .map((s: any) => {
                  const d = s.startAt?.toDate ? s.startAt.toDate() : new Date(s.startAt);
                  return { date: d, time: d.getTime() };
                })
                .filter((s: any) => !isNaN(s.time) && s.time > now)
                .sort((a: any, b: any) => a.time - b.time);

              if (validSlots.length > 0) {
                firstSlotLabel = validSlots[0].date.toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });
              }

              if (services.length > 0) {
                const prices = services.map((s) => s.priceCents).filter((p) => p > 0);
                if (prices.length > 0) {
                  minPriceCents = Math.min(...prices);
                }
              }
            } catch {
              // Gracefully handle if availability/services fetch fails
            }

            return {
              ...coach,
              firstSlotLabel,
              minPriceCents,
            };
          })
        );

        if (mounted) {
          setCoaches(extended);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching coaches', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Update filter if route param changed
  useEffect(() => {
    if (params.discipline) {
      setSelectedDiscipline(params.discipline);
    }
  }, [params.discipline]);

  // Filtered coaches
  const filteredCoaches = useMemo(() => {
    return coaches.filter((coach) => {
      // Search text
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const searchable = [
          coach.displayName,
          coach.headline || '',
          coach.discipline,
          coach.bio || '',
          ...(coach.specialties || []),
          ...(coach.tags || []),
          coach.location || '',
        ]
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(query)) return false;
      }

      // Discipline
      if (selectedDiscipline) {
        const matchesDiscipline =
          coach.discipline.toLowerCase() === selectedDiscipline.toLowerCase() ||
          coach.specialties?.some(
            (s) => s.toLowerCase() === selectedDiscipline.toLowerCase()
          ) ||
          coach.tags?.some((t) => t.toLowerCase() === selectedDiscipline.toLowerCase());
        if (!matchesDiscipline) return false;
      }

      // Goal
      if (selectedGoal) {
        const matchesGoal = coach.goals?.some(
          (g) => g.toLowerCase() === selectedGoal.toLowerCase()
        );
        if (!matchesGoal && coach.goals && coach.goals.length > 0) return false;
      }

      // Level
      if (selectedLevel) {
        const matchesLevel = coach.levels?.some(
          (l) => l.toLowerCase() === selectedLevel.toLowerCase()
        );
        if (!matchesLevel && coach.levels && coach.levels.length > 0) return false;
      }

      // Modality
      if (selectedModality) {
        const matchesMod = coach.modalities?.some((m) =>
          m.toLowerCase().includes(selectedModality.toLowerCase())
        );
        if (!matchesMod) return false;
      }

      // Availability check
      if (onlyAvailable && !coach.firstSlotLabel) {
        return false;
      }

      // Indicative max price check
      if (coach.minPriceCents && coach.minPriceCents / 100 > maxPrice) {
        return false;
      }

      return true;
    });
  }, [
    coaches,
    searchTerm,
    selectedDiscipline,
    selectedGoal,
    selectedLevel,
    selectedModality,
    onlyAvailable,
    maxPrice,
  ]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDiscipline('');
    setSelectedGoal('');
    setSelectedLevel('');
    setSelectedModality('');
    setOnlyAvailable(false);
    setMaxPrice(150);
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(selectedDiscipline) ||
    Boolean(selectedGoal) ||
    Boolean(selectedLevel) ||
    Boolean(selectedModality) ||
    onlyAvailable ||
    maxPrice < 150;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-white/10">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#8EF5DC]">
            CATALOGO UFFICIALE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F4F5F6] mt-1">
            Trova il tuo Coach
          </h1>
          <p className="mt-1 text-sm text-[#9EABA7]">
            Cerca e confronta profili certificati. Verifica i servizi e riserva la tua sessione.
          </p>
        </div>

        <button
          onClick={openQuestionnaire}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#8EF5DC] px-5 py-2.5 text-xs font-semibold text-[#080A0A] hover:bg-[#7cebcfe8] transition-all self-start md:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          Questionario Matching Guidato
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111A1A] p-5 sm:p-6 space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9EABA7]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca per nome, disciplina o specializzazione..."
            className="w-full rounded-2xl border border-white/10 bg-[#080A0A] pl-12 pr-4 py-3 text-sm text-[#F4F5F6] placeholder:text-[#525E5C] focus:border-[#8EF5DC] focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#9EABA7] hover:text-[#F4F5F6]"
            >
              Cancella
            </button>
          )}
        </div>

        {/* Filter selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Disciplina */}
          <div>
            <label className="block text-xs font-semibold text-[#9EABA7] mb-1.5">
              Disciplina
            </label>
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#080A0A] px-3.5 py-2.5 text-xs text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
            >
              <option value="" className="bg-[#111A1A]">Tutte le discipline</option>
              {DISCIPLINES.map((d) => (
                <option key={d} value={d} className="bg-[#111A1A]">
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Obiettivo */}
          <div>
            <label className="block text-xs font-semibold text-[#9EABA7] mb-1.5">
              Obiettivo
            </label>
            <select
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#080A0A] px-3.5 py-2.5 text-xs text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
            >
              <option value="" className="bg-[#111A1A]">Tutti gli obiettivi</option>
              {GOALS.map((g) => (
                <option key={g} value={g} className="bg-[#111A1A]">
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Livello */}
          <div>
            <label className="block text-xs font-semibold text-[#9EABA7] mb-1.5">Livello</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#080A0A] px-3.5 py-2.5 text-xs text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
            >
              <option value="" className="bg-[#111A1A]">Tutti i livelli</option>
              {LEVELS.map((l) => (
                <option key={l} value={l} className="bg-[#111A1A]">
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Modalità */}
          <div>
            <label className="block text-xs font-semibold text-[#9EABA7] mb-1.5">Modalità</label>
            <select
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#080A0A] px-3.5 py-2.5 text-xs text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
            >
              <option value="" className="bg-[#111A1A]">Tutte le modalità</option>
              {MODALITIES.map((m) => (
                <option key={m} value={m} className="bg-[#111A1A]">
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary filters row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-white/5 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="h-4 w-4 rounded accent-[#8EF5DC]"
              />
              <span className="text-[#F4F5F6]">Solo coach con disponibilità immediata</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-[#9EABA7]">Prezzo max:</span>
              <span className="font-bold text-[#8EF5DC]">€{maxPrice}/sessione</span>
              <input
                type="range"
                min="20"
                max="150"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-[#8EF5DC]"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs text-[#9EABA7] hover:text-[#8EF5DC] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reimposta filtri
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between text-xs text-[#9EABA7] mb-6">
          <span>
            {loading
              ? 'Ricerca coach in corso...'
              : `${filteredCoaches.length} coach ${
                  filteredCoaches.length === 1 ? 'trovato' : 'trovati'
                }`}
          </span>
          {hasActiveFilters && (
            <span className="text-[#8EF5DC]">Filtri attivi applicati</span>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-[#9EABA7]">
            Caricamento catalogo coach da Firestore...
          </div>
        ) : filteredCoaches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoaches.map((coach) => (
              <div
                key={coach.coachId}
                className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 flex flex-col justify-between hover:border-[#8EF5DC]/40 transition-all group"
              >
                <div>
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {coach.photoURL ? (
                        <img
                          src={coach.photoURL}
                          alt={coach.displayName}
                          className="h-16 w-16 rounded-2xl object-cover border border-white/10"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-2xl bg-[#080A0A] border border-white/10 flex items-center justify-center font-bold text-lg text-[#8EF5DC]">
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
                        <p className="text-xs text-[#8EF5DC] font-medium mt-0.5">
                          {coach.discipline}
                        </p>
                        {coach.experienceYears ? (
                          <p className="text-[11px] text-[#9EABA7]">
                            {coach.experienceYears} anni di esperienza
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {coach.verificationStatus === 'approved' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#8EF5DC]/10 px-2 py-0.5 text-[10px] font-bold text-[#8EF5DC] border border-[#8EF5DC]/30 shrink-0">
                        <ShieldCheck className="h-3 w-3" />
                        Verificato
                      </span>
                    )}
                  </div>

                  {/* Headline & Bio */}
                  {coach.headline && (
                    <div className="mt-3 text-xs font-semibold text-[#E1E8E6]">
                      {coach.headline}
                    </div>
                  )}

                  <p className="mt-2 text-xs text-[#9EABA7] line-clamp-3 leading-relaxed">
                    {coach.bio || 'Coach sportivo qualificato su GROW UP.'}
                  </p>

                  {/* Badges / Specialties */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(coach.specialties && coach.specialties.length > 0
                      ? coach.specialties
                      : coach.tags || [coach.discipline]
                    )
                      .slice(0, 4)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-lg bg-[#080A0A] px-2 py-0.5 text-[10px] text-[#9EABA7] border border-white/5"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>

                  {/* Availability chip if available */}
                  {coach.firstSlotLabel && (
                    <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#8EF5DC]/10 border border-[#8EF5DC]/20 px-2.5 py-1 text-[11px] text-[#8EF5DC]">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Prossima disponibilità: {coach.firstSlotLabel}</span>
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-[#9EABA7]">
                      Modalità:{' '}
                      <span className="text-[#F4F5F6] font-medium">
                        {(coach.modalities || ['Online', 'In presenza']).join(' • ')}
                      </span>
                    </div>
                    {coach.minPriceCents ? (
                      <div className="text-[11px] text-[#9EABA7] mt-0.5">
                        A partire da:{' '}
                        <span className="text-[#8EF5DC] font-semibold">
                          €{(coach.minPriceCents / 100).toFixed(0)}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <button
                    onClick={() => navigate(`/coaches/${coach.coachId}`)}
                    className="inline-flex min-h-[42px] items-center gap-1 rounded-xl bg-[#8EF5DC] px-4 py-2 text-xs font-semibold text-[#080A0A] hover:bg-[#7cebcfe8] transition-all"
                  >
                    Vedi profilo
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-10 sm:p-14 text-center max-w-2xl mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-[#9EABA7] mb-4">
              <Filter className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-[#F4F5F6]">
              Nessun coach disponibile con questi filtri.
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#9EABA7] leading-relaxed">
              Prova a rimuovere alcuni filtri di ricerca oppure seleziona un'altra disciplina per
              visualizzare i professionisti disponibili.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={resetFilters}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#8EF5DC] px-5 py-2 text-xs font-semibold text-[#080A0A]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Azzera filtri
              </button>
              <button
                onClick={() => navigate('/for-coaches')}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 px-5 py-2 text-xs font-semibold text-[#F4F5F6]"
              >
                Sei un coach? Candidati qui
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
