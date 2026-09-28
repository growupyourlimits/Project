import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Star,
  Activity,
  Calendar,
  RotateCcw,
  ShieldCheck,
  Check,
  Loader2,
} from 'lucide-react';
import {
  QuestionnaireAnswers,
  SportCategory,
  FitnessGoal,
  FitnessLevel,
  TrainingModality,
  Coach,
} from '../types';
import { listApprovedCoaches, submitConsultationRequest } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface QuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPORTS: { label: SportCategory; icon: string; desc: string }[] = [
  { label: 'Corsa', icon: '🏃', desc: 'Dalle prime corse alla mezza maratona' },
  { label: 'Calisthenics & Fitness', icon: '🤸', desc: 'Padronanza del corpo libero e forza' },
  { label: 'Palestra & Forza', icon: '🏋️', desc: 'Pesistica, ipertrofia e ricomposizione' },
  { label: 'Yoga & Mobilità', icon: '🧘', desc: 'Flessibilità, respiro e postura' },
  { label: 'Ciclismo', icon: '🚴', desc: 'Strada, gravel e programmazione watt' },
  { label: 'Nuoto', icon: '🏊', desc: 'Resistenza, tecnica e vasca' },
  { label: 'Altro', icon: '⚡', desc: 'Sport di squadra, arti marziali o misto' },
];

const GOALS: { label: FitnessGoal; desc: string }[] = [
  { label: 'Rimettersi in forma', desc: 'Ritrovare costanza, energia e benessere generale' },
  { label: 'Perdita peso e definizione', desc: 'Definire il fisico senza diete da fame o sovrallenamento' },
  { label: 'Preparare una gara o evento', desc: 'Tabella specifica per raggiungere un obiettivo cronometrico' },
  { label: 'Aumento massa muscolare', desc: 'Programma di forza e progressione dei carichi' },
  { label: 'Salute posturale e longevità', desc: 'Eliminare dolori articolari e migliorare la mobilità' },
];

const LEVELS: { label: FitnessLevel; desc: string }[] = [
  { label: 'Principiante (da zero o fermo da molto)', desc: 'Ho bisogno di una guida passo passo per non sbagliare' },
  { label: 'Intermedio (mi alleno 1-2 volte a settimana)', desc: 'Conosco le basi ma voglio fare un salto di qualità' },
  { label: 'Avanzato / Atleta (costante, cerco performance)', desc: 'Mi alleno con metodo e cerco ottimizzazione massima' },
];

const MODALITIES: { label: TrainingModality; desc: string }[] = [
  { label: 'Online al 100% (videocall e programmazione)', desc: 'Flessibilità totale da casa o dalla tua palestra di fiducia' },
  { label: 'In presenza (nella mia zona)', desc: 'Sedute one-to-one affiancato sul campo' },
  { label: 'Ibrido (programma online + check mensile)', desc: 'Il miglior compromesso tra autonomia e supervisione' },
];

export const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [selectedCoachForBooking, setSelectedCoachForBooking] = useState<Coach | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [approvedCoaches, setApprovedCoaches] = useState<Coach[]>([]);

  // Booking fields
  const [athleteName, setAthleteName] = useState<string>('');
  const [athleteEmail, setAthleteEmail] = useState<string>('');
  const [preferredSlot, setPreferredSlot] = useState<string>('Domani - 10:00 (Mattina)');
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);

  // Pre-fill user if authenticated
  useEffect(() => {
    if (currentUser) {
      if (currentUser.displayName && !athleteName) {
        setAthleteName(currentUser.displayName);
      }
      if (currentUser.email && !athleteEmail) {
        setAthleteEmail(currentUser.email);
      }
    }
  }, [currentUser, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    listApprovedCoaches()
      .then((profiles: any[]) => {
        const coaches: Coach[] = profiles.map((p: any) => {
          const displayName = p.displayName || 'Coach GROW UP';
          const searchable = [p.discipline, ...(p.tags || []), ...(p.specialties || []), ...(p.modalities || [])]
            .join(' ').toLowerCase();
          let score = 70;
          if (answers.sport && searchable.includes(answers.sport.toLowerCase())) score += 12;
          if (answers.goal && searchable.includes(answers.goal.toLowerCase())) score += 8;
          if (answers.modality && searchable.includes(answers.modality.toLowerCase())) score += 6;
          return {
            id: p.coachId || p.id,
            name: displayName,
            role: p.headline || p.discipline || 'Coach verificato',
            badge: 'VERIFICATO',
            tags: p.tags || [],
            rating: Number(p.rating || 0),
            reviewCount: Number(p.reviewCount || 0),
            matchScore: Math.min(score, 96),
            bio: p.bio || '',
            avatarUrl: p.photoURL || '',
            avatarInitials: displayName.split(/\s+/).slice(0, 2).map((x:string) => x[0]).join('').toUpperCase(),
            modality: (p.modalities || []).join(' • ') || 'Da concordare',
            availability: 'Consulta gli orari disponibili',
            experience: p.experienceYears ? `${p.experienceYears} anni di esperienza` : 'Coach verificato',
            specialties: p.specialties || [],
          };
        });
        setApprovedCoaches(coaches.sort((a,b) => b.matchScore - a.matchScore));
      })
      .catch((err) => {
        console.error('Errore caricamento coach approvati', err);
        setApprovedCoaches([]);
      });
  }, [isOpen, answers.sport, answers.goal, answers.modality]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final step completed -> run matching calculation simulation
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setShowResults(true);
      }, 1200);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setCurrentStep(1);
    setShowResults(false);
    setSelectedCoachForBooking(null);
    setBookingSuccess(false);
  };

  const matchedCoaches = approvedCoaches;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="questionnaire-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm"
    >
      <div
        id="questionnaire-modal-card"
        className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0C1212] p-6 sm:p-8 shadow-2xl text-[#F4F5F6] my-auto"
      >
        {/* Close button - Min 44x44px touch target */}
        <button
          onClick={onClose}
          id="close-questionnaire-btn"
          aria-label="Chiudi questionario"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/10 bg-[#111A1A] text-[#9EABA7] hover:border-white/20 hover:text-[#F4F5F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC]"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ============================================================ */}
        {/* STATE 1: ANALYZING SIMULATION                                */}
        {/* ============================================================ */}
        {isAnalyzing && (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8EF5DC]/10 border border-[#8EF5DC]/30 text-[#8EF5DC] animate-pulse">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-[#F4F5F6]">
              Elaborazione del match in corso...
            </h3>
            <p className="mt-2 text-sm text-[#9EABA7]">
              Stiamo analizzando la disponibilità dei coach certificati in base al tuo profilo.
            </p>
            <div className="mt-8 mx-auto max-w-xs h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#8EF5DC] rounded-full animate-[progress_1.2s_ease-in-out_infinite]" />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STATE 2: RESULTS SCREEN                                      */}
        {/* ============================================================ */}
        {!isAnalyzing && showResults && (
          <div>
            {!selectedCoachForBooking ? (
              <div>
                {/* Header */}
                <div className="text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#8EF5DC]/30 bg-[#8EF5DC]/10 px-3 py-1 text-xs font-semibold text-[#8EF5DC]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    MATCH COMPLETATO
                  </div>
                  <h3
                    id="questionnaire-title"
                    className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#F4F5F6]"
                  >
                    Abbiamo trovato alcuni coach compatibili.
                  </h3>
                  <p className="mt-2 text-sm text-[#9EABA7]">
                    Ecco i professionisti selezionati in base alle tue risposte ({answers.sport ?? 'Fitness'}, obiettivo {answers.goal ?? 'Personalizzato'}).
                  </p>
                </div>

                {/* List of matched coaches */}
                <div className="mt-6 space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  {matchedCoaches.map((coach) => (
                    <div
                      key={coach.id}
                      className="rounded-2xl border border-white/10 bg-[#111A1A] p-5 transition-all hover:border-[#8EF5DC]/40 hover:bg-[#142020]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1c2e2e] to-[#0d1616] border border-[#8EF5DC]/30 text-[#8EF5DC] font-bold">
                            {coach.avatarInitials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-[#F4F5F6]">
                                {coach.name}
                              </h4>
                              {coach.badge && (
                                <span className="rounded bg-[#8EF5DC]/15 px-2 py-0.5 text-[10px] font-semibold text-[#8EF5DC]">
                                  {coach.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#8EF5DC] font-medium mt-0.5">
                              {coach.role}
                            </p>
                            <div className="mt-1 flex items-center gap-3 text-xs text-[#8E9B98]">
                              <span className="flex items-center gap-1 text-[#F4F5F6] font-medium">
                                <Star className="h-3 w-3 fill-[#8EF5DC] text-[#8EF5DC]" />
                                {coach.rating}
                              </span>
                              <span>•</span>
                              <span>{coach.experience}</span>
                              <span>•</span>
                              <span>{coach.modality}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-xl font-extrabold text-[#8EF5DC]">
                            {coach.matchScore}%
                          </span>
                          <div className="text-[10px] uppercase text-[#8E9B98]">
                            Affinità
                          </div>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-[#9EABA7] leading-relaxed">
                        {coach.bio}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {coach.specialties.map((spec) => (
                          <span
                            key={spec}
                            className="rounded bg-[#080A0A] border border-white/5 px-2 py-0.5 text-[11px] text-[#A6B4B1]"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs text-[#8E9B98]">
                          Disponibilità: <strong className="text-[#F4F5F6] font-normal">{coach.availability}</strong>
                        </span>
                        <button
                          onClick={() => setSelectedCoachForBooking(coach)}
                          className="rounded-lg bg-[#8EF5DC] px-3.5 py-1.5 text-xs font-semibold text-[#080A0A] hover:bg-[#77eecf] transition-colors"
                        >
                          Prenota call gratuita
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={resetQuiz}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8E9B98] hover:text-[#F4F5F6] transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Rifai il questionario
                  </button>
                  <button
                    onClick={onClose}
                    className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-[#F4F5F6] hover:bg-[#111A1A] transition-colors"
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            ) : (
              /* Sub-screen: Book Call with Selected Coach */
              <div>
                {!bookingSuccess ? (
                  <div>
                    <button
                      onClick={() => setSelectedCoachForBooking(null)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#8EF5DC] hover:underline mb-4"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Torna all'elenco coach
                    </button>

                    <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-[#111A1A] p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1c2e2e] text-[#8EF5DC] font-bold">
                        {selectedCoachForBooking.avatarInitials}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#F4F5F6]">
                          Consulenza con {selectedCoachForBooking.name}
                        </h4>
                        <p className="text-xs text-[#8EF5DC]">
                          {selectedCoachForBooking.role} • 15 minuti via Google Meet
                        </p>
                      </div>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!selectedCoachForBooking) return;
                        setBookingLoading(true);
                        try {
                          await submitConsultationRequest({
                            athleteName,
                            athleteEmail,
                            coachId: selectedCoachForBooking.id,
                            coachName: selectedCoachForBooking.name,
                            sport: answers.sport,
                            goal: answers.goal,
                            level: answers.level,
                            modality: answers.modality,
                            preferredSlot,
                          });
                          setBookingSuccess(true);
                        } catch (err) {
                          console.error(err);
                          alert('Errore durante il salvataggio della richiesta. Riprova più tardi.');
                        } finally {
                          setBookingLoading(false);
                        }
                      }}
                      className="mt-6 space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-medium text-[#9EABA7] mb-1">
                          Il tuo nome e cognome
                        </label>
                        <input
                          type="text"
                          required
                          value={athleteName}
                          onChange={(e) => setAthleteName(e.target.value)}
                          placeholder="es. Giulia Rossi"
                          className="w-full rounded-xl border border-white/10 bg-[#111A1A] px-4 py-2.5 text-sm text-[#F4F5F6] placeholder:text-[#525E5C] focus:border-[#8EF5DC] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#9EABA7] mb-1">
                          La tua email
                        </label>
                        <input
                          type="email"
                          required
                          value={athleteEmail}
                          onChange={(e) => setAthleteEmail(e.target.value)}
                          placeholder="giulia.rossi@email.com"
                          className="w-full rounded-xl border border-white/10 bg-[#111A1A] px-4 py-2.5 text-sm text-[#F4F5F6] placeholder:text-[#525E5C] focus:border-[#8EF5DC] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#9EABA7] mb-1">
                          Giorno e orario preferito per la call
                        </label>
                        <select
                          value={preferredSlot}
                          onChange={(e) => setPreferredSlot(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#111A1A] px-4 py-2.5 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
                        >
                          <option className="bg-[#111A1A]">Domani - 10:00 (Mattina)</option>
                          <option className="bg-[#111A1A]">Domani - 14:30 (Pomeriggio)</option>
                          <option className="bg-[#111A1A]">Dopodomani - 18:30 (Sera)</option>
                          <option className="bg-[#111A1A]">Sabato mattina - 10:30</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={bookingLoading}
                        className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#8EF5DC] py-3 text-sm font-semibold text-[#080A0A] hover:bg-[#77eecf] disabled:opacity-50 transition-all min-h-[44px]"
                      >
                        {bookingLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Salvataggio su Firebase...
                          </>
                        ) : (
                          <>
                            <Calendar className="h-4 w-4" />
                            Conferma richiesta gratuita
                          </>
                        )}
                      </button>

                      <p className="text-center text-[11px] text-[#8E9B98]">
                        Non ti verrà addebitato alcun costo. La tua richiesta viene memorizzata in modo sicuro su Firebase Firestore.
                      </p>
                    </form>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8EF5DC]/15 text-[#8EF5DC]">
                      <Check className="h-7 w-7" />
                    </div>
                    <h4 className="mt-4 text-2xl font-bold text-[#F4F5F6]">
                      Richiesta inviata e registrata!
                    </h4>
                    <p className="mt-2 text-sm text-[#9EABA7] max-w-md mx-auto">
                      Abbiamo registrato la tua richiesta per {selectedCoachForBooking.name} su Firebase. Ti contatterà all'indirizzo email fornito per confermare l'appuntamento.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-6 rounded-xl bg-[#8EF5DC] px-6 py-2.5 text-sm font-semibold text-[#080A0A] hover:bg-[#77eecf] min-h-[44px]"
                    >
                      Torna alla home
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* STATE 3: STEP-BY-STEP QUESTIONNAIRE (1 TO 4)                 */}
        {/* ============================================================ */}
        {!isAnalyzing && !showResults && (
          <div>
            {/* Progress Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-[#8E9B98] mb-2">
                <span className="font-semibold text-[#8EF5DC] uppercase tracking-wider">
                  Domanda {currentStep} di 4
                </span>
                <span>{currentStep * 25}% completato</span>
              </div>
              {/* Progress Bar */}
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#8EF5DC] transition-all duration-300 rounded-full"
                  style={{ width: `${currentStep * 25}%` }}
                />
              </div>
            </div>

            {/* Step 1: Sport / Disciplina */}
            {currentStep === 1 && (
              <div>
                <h3
                  id="questionnaire-title"
                  className="text-2xl font-extrabold text-[#F4F5F6]"
                >
                  Quale disciplina vuoi praticare?
                </h3>
                <p className="mt-1 text-sm text-[#9EABA7]">
                  Seleziona l'attività principale su cui vuoi concentrarti.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[46vh] overflow-y-auto pr-1">
                  {SPORTS.map((sport) => {
                    const isSelected = answers.sport === sport.label;
                    return (
                      <button
                        key={sport.label}
                        type="button"
                        onClick={() => setAnswers({ ...answers, sport: sport.label })}
                        className={`group flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? 'border-[#8EF5DC] bg-[#142624] text-[#F4F5F6]'
                            : 'border-white/10 bg-[#111A1A] hover:border-white/20 hover:bg-[#142020]'
                        }`}
                      >
                        <span className="text-2xl flex-shrink-0">{sport.icon}</span>
                        <div>
                          <div className="text-sm font-semibold text-[#F4F5F6] group-hover:text-[#8EF5DC] transition-colors">
                            {sport.label}
                          </div>
                          <div className="text-xs text-[#8E9B98] mt-0.5">
                            {sport.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Obiettivo principale */}
            {currentStep === 2 && (
              <div>
                <h3
                  id="questionnaire-title"
                  className="text-2xl font-extrabold text-[#F4F5F6]"
                >
                  Qual è il tuo obiettivo primario?
                </h3>
                <p className="mt-1 text-sm text-[#9EABA7]">
                  Ci aiuta a scegliere il coach con la metodologia più efficace.
                </p>

                <div className="mt-6 space-y-3 max-h-[46vh] overflow-y-auto pr-1">
                  {GOALS.map((goal) => {
                    const isSelected = answers.goal === goal.label;
                    return (
                      <button
                        key={goal.label}
                        type="button"
                        onClick={() => setAnswers({ ...answers, goal: goal.label })}
                        className={`w-full flex items-start justify-between rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? 'border-[#8EF5DC] bg-[#142624]'
                            : 'border-white/10 bg-[#111A1A] hover:border-white/20 hover:bg-[#142020]'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-[#F4F5F6]">
                            {goal.label}
                          </div>
                          <div className="text-xs text-[#8E9B98] mt-0.5">
                            {goal.desc}
                          </div>
                        </div>
                        <div
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                            isSelected
                              ? 'border-[#8EF5DC] bg-[#8EF5DC] text-[#080A0A]'
                              : 'border-white/20'
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Livello attuale */}
            {currentStep === 3 && (
              <div>
                <h3
                  id="questionnaire-title"
                  className="text-2xl font-extrabold text-[#F4F5F6]"
                >
                  Qual è il tuo livello di partenza?
                </h3>
                <p className="mt-1 text-sm text-[#9EABA7]">
                  Serve per calibrare i volumi e la complessità iniziale.
                </p>

                <div className="mt-6 space-y-3 max-h-[46vh] overflow-y-auto pr-1">
                  {LEVELS.map((level) => {
                    const isSelected = answers.level === level.label;
                    return (
                      <button
                        key={level.label}
                        type="button"
                        onClick={() => setAnswers({ ...answers, level: level.label })}
                        className={`w-full flex items-start justify-between rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? 'border-[#8EF5DC] bg-[#142624]'
                            : 'border-white/10 bg-[#111A1A] hover:border-white/20 hover:bg-[#142020]'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-[#F4F5F6]">
                            {level.label}
                          </div>
                          <div className="text-xs text-[#8E9B98] mt-0.5">
                            {level.desc}
                          </div>
                        </div>
                        <div
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                            isSelected
                              ? 'border-[#8EF5DC] bg-[#8EF5DC] text-[#080A0A]'
                              : 'border-white/20'
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Modalità preferita */}
            {currentStep === 4 && (
              <div>
                <h3
                  id="questionnaire-title"
                  className="text-2xl font-extrabold text-[#F4F5F6]"
                >
                  Come preferisci allenarti?
                </h3>
                <p className="mt-1 text-sm text-[#9EABA7]">
                  Scegli la modalità che si inserisce meglio nelle tue giornate.
                </p>

                <div className="mt-6 space-y-3 max-h-[46vh] overflow-y-auto pr-1">
                  {MODALITIES.map((modality) => {
                    const isSelected = answers.modality === modality.label;
                    return (
                      <button
                        key={modality.label}
                        type="button"
                        onClick={() => setAnswers({ ...answers, modality: modality.label })}
                        className={`w-full flex items-start justify-between rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? 'border-[#8EF5DC] bg-[#142624]'
                            : 'border-white/10 bg-[#111A1A] hover:border-white/20 hover:bg-[#142020]'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-[#F4F5F6]">
                            {modality.label}
                          </div>
                          <div className="text-xs text-[#8E9B98] mt-0.5">
                            {modality.desc}
                          </div>
                        </div>
                        <div
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                            isSelected
                              ? 'border-[#8EF5DC] bg-[#8EF5DC] text-[#080A0A]'
                              : 'border-white/20'
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#9EABA7] hover:text-[#F4F5F6] hover:bg-[#111A1A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Indietro
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNextStep}
                disabled={
                  (currentStep === 1 && !answers.sport) ||
                  (currentStep === 2 && !answers.goal) ||
                  (currentStep === 3 && !answers.level) ||
                  (currentStep === 4 && !answers.modality)
                }
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#8EF5DC] px-6 py-2.5 text-xs sm:text-sm font-semibold text-[#080A0A] hover:bg-[#7cebcfe8] disabled:opacity-40 disabled:pointer-events-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]"
              >
                {currentStep === 4 ? 'Trova i miei match' : 'Continua'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
