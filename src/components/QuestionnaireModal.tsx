import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
  Calendar,
  RotateCcw,
  Loader2,
  Users,
} from 'lucide-react';
import {
  DISCIPLINES,
  GOALS,
  LEVELS,
  MODALITIES,
  QuestionnaireAnswers,
  CoachProfileEntity,
} from '../types';
import { listApprovedCoaches } from '../firebase';
import { useNavigation } from '../context/NavigationContext';

interface QuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({ isOpen, onClose }) => {
  const { navigate } = useNavigation();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [matchedCoaches, setMatchedCoaches] = useState<
    { coach: CoachProfileEntity; matchScore: number }[]
  >([]);

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
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Calculate matching against REAL coaches in Firestore
      setIsAnalyzing(true);
      listApprovedCoaches()
        .then((coaches) => {
          const scored = coaches.map((coach) => {
            let score = 65;
            const searchStr = [
              coach.discipline,
              ...(coach.specialties || []),
              ...(coach.tags || []),
              ...(coach.goals || []),
              ...(coach.modalities || []),
            ]
              .join(' ')
              .toLowerCase();

            if (answers.discipline && searchStr.includes(answers.discipline.toLowerCase())) {
              score += 20;
            }
            if (answers.goal && searchStr.includes(answers.goal.toLowerCase())) {
              score += 10;
            }
            if (answers.modality && searchStr.includes(answers.modality.toLowerCase())) {
              score += 5;
            }
            return {
              coach,
              matchScore: Math.min(score, 98),
            };
          });

          // Sort by match score descending
          scored.sort((a, b) => b.matchScore - a.matchScore);
          setMatchedCoaches(scored);
          setIsAnalyzing(false);
          setShowResults(true);
        })
        .catch((err) => {
          console.error(err);
          setIsAnalyzing(false);
          setShowResults(true);
          setMatchedCoaches([]);
        });
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
    setMatchedCoaches([]);
  };

  const progressPercentage = (currentStep / 5) * 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0C1212] p-6 sm:p-8 shadow-2xl text-[#F4F5F6] my-auto">
        {/* Close Button */}
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
        {isAnalyzing ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8EF5DC]/10 text-[#8EF5DC] mb-4">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#F4F5F6]">
              Confronto con i coach verificati...
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#9EABA7] max-w-md mx-auto">
              Stiamo analizzando la disponibilità e le specializzazioni dei professionisti approvati su
              GROW UP per trovare le migliori corrispondenze.
            </p>
          </div>
        ) : showResults ? (
          /* ============================================================ */
          /* STATE 2: RESULTS VIEW                                        */
          /* ============================================================ */
          <div className="py-2">
            <div className="text-center max-w-md mx-auto mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#8EF5DC]/30 bg-[#8EF5DC]/10 px-3 py-1 text-xs font-semibold text-[#8EF5DC]">
                <Sparkles className="h-3.5 w-3.5" />
                MATCH COMPLETATO
              </span>
              <h3 className="mt-2 text-2xl font-extrabold text-[#F4F5F6]">
                Abbiamo trovato {matchedCoaches.length} coach compatibili
              </h3>
              <p className="mt-1 text-xs text-[#9EABA7]">
                Profili verificati e filtrati in base alle tue risposte.
              </p>
            </div>

            {matchedCoaches.length > 0 ? (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {matchedCoaches.map(({ coach, matchScore }) => (
                  <div
                    key={coach.coachId}
                    className="rounded-2xl border border-white/10 bg-[#111A1A] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {coach.photoURL ? (
                        <img
                          src={coach.photoURL}
                          alt={coach.displayName}
                          className="h-14 w-14 rounded-2xl object-cover border border-white/10"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-2xl bg-[#080A0A] border border-white/10 flex items-center justify-center font-bold text-base text-[#8EF5DC]">
                          {coach.displayName
                            .split(' ')
                            .slice(0, 2)
                            .map((p) => p[0])
                            .join('')
                            .toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-[#F4F5F6]">
                            {coach.displayName}
                          </h4>
                          <span className="rounded-full bg-[#8EF5DC]/15 px-2 py-0.5 text-[10px] font-bold text-[#8EF5DC]">
                            {matchScore}% match
                          </span>
                        </div>
                        <p className="text-xs text-[#8EF5DC] mt-0.5">{coach.discipline}</p>
                        <p className="text-xs text-[#9EABA7] line-clamp-1 mt-1">
                          {coach.bio || 'Coach sportivo qualificato su GROW UP.'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/coaches/${coach.coachId}`);
                      }}
                      className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-[#8EF5DC] px-4 py-2 text-xs font-bold text-[#080A0A] hover:bg-[#7cebcfe8] shrink-0"
                    >
                      Vedi profilo & prenota
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#111A1A] p-8 text-center">
                <Users className="h-8 w-8 text-[#9EABA7] mx-auto mb-2" />
                <h4 className="font-bold text-base text-[#F4F5F6]">
                  Nessun coach trovato per questi parametri
                </h4>
                <p className="mt-1 text-xs text-[#9EABA7]">
                  Prova a selezionare una disciplina diversa o consulta il catalogo generale.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/coaches');
                  }}
                  className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-[#8EF5DC] px-4 py-2 text-xs font-bold text-[#080A0A]"
                >
                  Esplora tutti i coach
                </button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={resetQuiz}
                className="inline-flex items-center gap-1.5 text-xs text-[#9EABA7] hover:text-[#F4F5F6]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Rifai il questionario
              </button>
              <button
                onClick={onClose}
                className="inline-flex min-h-[40px] items-center rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-[#F4F5F6]"
              >
                Chiudi
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* STATE 3: STEP-BY-STEP QUESTIONNAIRE (1 TO 5)                 */
          /* ============================================================ */
          <div>
            {/* Step & Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-[#9EABA7] mb-2">
                <span className="font-semibold text-[#8EF5DC]">DOMANDA {currentStep} DI 5</span>
                <span>{Math.round(progressPercentage)}% completato</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#111A1A] overflow-hidden">
                <div
                  className="h-full bg-[#8EF5DC] transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* STEP 1: OBIETTIVO */}
            {currentStep === 1 && (
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#F4F5F6]">
                  Qual è il tuo obiettivo principale?
                </h3>
                <p className="mt-1 text-xs text-[#9EABA7]">
                  Seleziona il traguardo che desideri raggiungere con il tuo coach.
                </p>

                <div className="mt-5 space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                  {GOALS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, goal }))}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all ${
                        answers.goal === goal
                          ? 'border-[#8EF5DC] bg-[#8EF5DC]/10 text-[#F4F5F6]'
                          : 'border-white/10 bg-[#111A1A] text-[#9EABA7] hover:border-white/20 hover:text-[#F4F5F6]'
                      }`}
                    >
                      <span>{goal}</span>
                      {answers.goal === goal && <Check className="h-4 w-4 text-[#8EF5DC]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: DISCIPLINA */}
            {currentStep === 2 && (
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#F4F5F6]">
                  Quale disciplina ti interessa?
                </h3>
                <p className="mt-1 text-xs text-[#9EABA7]">
                  Scegli lo sport o l'attività che vuoi praticare.
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[45vh] overflow-y-auto pr-1">
                  {DISCIPLINES.map((disc) => (
                    <button
                      key={disc}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, discipline: disc }))}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        answers.discipline === disc
                          ? 'border-[#8EF5DC] bg-[#8EF5DC]/10 text-[#F4F5F6]'
                          : 'border-white/10 bg-[#111A1A] text-[#9EABA7] hover:border-white/20 hover:text-[#F4F5F6]'
                      }`}
                    >
                      <span className="truncate">{disc}</span>
                      {answers.discipline === disc && <Check className="h-3.5 w-3.5 text-[#8EF5DC] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: LIVELLO */}
            {currentStep === 3 && (
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#F4F5F6]">
                  Qual è il tuo livello di partenza?
                </h3>
                <p className="mt-1 text-xs text-[#9EABA7]">
                  Questo aiuta il coach a strutturare la corretta progressione dei carichi.
                </p>

                <div className="mt-5 space-y-2.5">
                  {LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, level: lvl }))}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border text-left text-sm font-medium transition-all ${
                        answers.level === lvl
                          ? 'border-[#8EF5DC] bg-[#8EF5DC]/10 text-[#F4F5F6]'
                          : 'border-white/10 bg-[#111A1A] text-[#9EABA7] hover:border-white/20 hover:text-[#F4F5F6]'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-[#F4F5F6]">{lvl}</div>
                        <div className="text-xs text-[#9EABA7] mt-0.5">
                          {lvl === 'Principiante'
                            ? 'Da zero o fermo da molto tempo, cerco guida passo-passo.'
                            : lvl === 'Intermedio'
                            ? 'Mi alleno con costanza e conosco i fondamentali.'
                            : 'Atleta o avanzato, cerco massima performance e dettagli tecnici.'}
                        </div>
                      </div>
                      {answers.level === lvl && <Check className="h-4 w-4 text-[#8EF5DC]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: MODALITÀ */}
            {currentStep === 4 && (
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#F4F5F6]">
                  Come preferisci allenarti?
                </h3>
                <p className="mt-1 text-xs text-[#9EABA7]">
                  Scegli se preferisci il supporto remoto o di persona.
                </p>

                <div className="mt-5 space-y-2.5">
                  {MODALITIES.map((mod) => (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, modality: mod }))}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border text-left text-sm font-medium transition-all ${
                        answers.modality === mod
                          ? 'border-[#8EF5DC] bg-[#8EF5DC]/10 text-[#F4F5F6]'
                          : 'border-white/10 bg-[#111A1A] text-[#9EABA7] hover:border-white/20 hover:text-[#F4F5F6]'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-[#F4F5F6]">{mod}</div>
                        <div className="text-xs text-[#9EABA7] mt-0.5">
                          {mod === 'Online'
                            ? 'Massima flessibilità ovunque tu sia con schede e check periodici.'
                            : mod === 'In presenza'
                            ? 'Affiancamento diretto in palestra, campo o parco.'
                            : 'Mix equilibrato tra programmazione online e check dal vivo.'}
                        </div>
                      </div>
                      {answers.modality === mod && <Check className="h-4 w-4 text-[#8EF5DC]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: FREQUENZA & NOTE */}
            {currentStep === 5 && (
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#F4F5F6]">
                  Quante volte vuoi allenarti a settimana?
                </h3>
                <p className="mt-1 text-xs text-[#9EABA7]">
                  Definisci la frequenza ideale per il tuo calendario.
                </p>

                <div className="mt-5 grid grid-cols-3 gap-2.5">
                  {['1-2 volte', '3-4 volte', '5+ volte'].map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, frequency: freq }))}
                      className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                        answers.frequency === freq
                          ? 'border-[#8EF5DC] bg-[#8EF5DC]/10 text-[#8EF5DC]'
                          : 'border-white/10 bg-[#111A1A] text-[#9EABA7] hover:border-white/20 hover:text-[#F4F5F6]'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <label className="block text-xs font-semibold text-[#9EABA7] mb-1.5">
                    Eventuali preferenze aggiuntive o limitazioni fisiche (opzionale)
                  </label>
                  <textarea
                    rows={3}
                    value={answers.notes || ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="es. Ho un vecchio dolore alla spalla, preferisco orari serali..."
                    className="w-full rounded-xl border border-white/10 bg-[#111A1A] p-3 text-xs text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Bottom Step Navigation */}
            <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-medium text-[#9EABA7] hover:text-[#F4F5F6] transition-colors"
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
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#8EF5DC] px-6 py-2.5 text-xs font-bold text-[#080A0A] hover:bg-[#7cebcfe8] transition-all"
              >
                {currentStep === 5 ? 'Calcola i coach compatibili' : 'Continua'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
