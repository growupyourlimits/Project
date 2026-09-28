import React, { useState } from 'react';
import { X, Check, ShieldCheck, Mail, Send, Award, Clock, ArrowRight, UserCheck, LogOut, Loader2 } from 'lucide-react';
import { submitCoachApplication, submitContactMessage } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface InfoModalProps {
  type: 'coaches' | 'login' | 'method' | 'contact' | 'privacy' | 'terms' | 'instagram' | null;
  onClose: () => void;
  onOpenQuestionnaire?: () => void;
}

export const InfoModals: React.FC<InfoModalProps> = ({
  type,
  onClose,
  onOpenQuestionnaire,
}) => {
  const { currentUser, profile, signInWithGoogle, signOut } = useAuth();

  // Coach form state
  const [coachFullName, setCoachFullName] = useState('');
  const [coachEmail, setCoachEmail] = useState('');
  const [coachDiscipline, setCoachDiscipline] = useState('');
  const [coachProfileLink, setCoachProfileLink] = useState('');
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachSubmitted, setCoachSubmitted] = useState(false);

  // Login form state
  const [loginRole, setLoginRole] = useState<'athlete' | 'coach'>('athlete');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  if (!type) return null;

  const handleCoachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCoachLoading(true);
    try {
      await submitCoachApplication({
        fullName: coachFullName,
        email: coachEmail,
        discipline: coachDiscipline,
        profileLink: coachProfileLink,
      });
      setCoachSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Impossibile inviare la candidatura. Riprova più tardi.');
    } finally {
      setCoachLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle(loginRole);
    } catch (err) {
      console.error(err);
      setAuthError('Accesso non riuscito. Verifica la connessione e riprova.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      await submitContactMessage({
        name: contactName,
        email: contactEmail,
        message: contactMessage,
      });
      setContactSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Impossibile inviare il messaggio. Riprova più tardi.');
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#0C1212] p-6 sm:p-8 shadow-2xl text-[#F4F5F6] my-auto">
        {/* Close Button - Min 44x44px touch target */}
        <button
          onClick={onClose}
          aria-label="Chiudi"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/10 bg-[#111A1A] text-[#9EABA7] hover:border-white/20 hover:text-[#F4F5F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC]"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ============================================================ */}
        {/* 1. PER I COACH                                               */}
        {/* ============================================================ */}
        {type === 'coaches' && (
          <div>
            {!coachSubmitted ? (
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#8EF5DC]/30 bg-[#8EF5DC]/10 px-3 py-1 text-xs font-semibold text-[#8EF5DC]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  PER I PROFESSIONISTI DELLO SPORT
                </div>
                <h3 className="mt-3 text-2xl font-extrabold text-[#F4F5F6]">
                  Diventa un Coach GROW UP
                </h3>
                <p className="mt-2 text-sm text-[#9EABA7] leading-relaxed">
                  Connettiti con allievi motivati e in target con la tua specializzazione. Gestisci programmazioni, pagamenti e video feedback da un'unica interfaccia.
                </p>

                <div className="mt-5 space-y-2.5 text-xs text-[#E1E8E6]">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#8EF5DC]" />
                    <span>Requisito: Laurea in Scienze Motorie o brevetto federale riconosciuto CONI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#8EF5DC]" />
                    <span>Nessun costo fisso o quota di ingresso</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#8EF5DC]" />
                    <span>Tu decidi le tue tariffe e la tua disponibilità oraria</span>
                  </div>
                </div>

                <form
                  onSubmit={handleCoachSubmit}
                  className="mt-6 space-y-3.5"
                >
                  <div>
                    <label className="block text-xs font-medium text-[#9EABA7] mb-1">
                      Nome e Cognome
                    </label>
                    <input
                      type="text"
                      required
                      value={coachFullName}
                      onChange={(e) => setCoachFullName(e.target.value)}
                      placeholder="es. Marco Bianchi"
                      className="w-full rounded-xl border border-white/10 bg-[#111A1A] px-3.5 py-2 text-sm text-[#F4F5F6] placeholder:text-[#525E5C] focus:border-[#8EF5DC] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#9EABA7] mb-1">
                        Email professionale
                      </label>
                      <input
                        type="email"
                        required
                        value={coachEmail}
                        onChange={(e) => setCoachEmail(e.target.value)}
                        placeholder="coach@example.com"
                        className="w-full rounded-xl border border-white/10 bg-[#111A1A] px-3.5 py-2 text-sm text-[#F4F5F6] placeholder:text-[#525E5C] focus:border-[#8EF5DC] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#9EABA7] mb-1">
                        Disciplina principale
                      </label>
                      <input
                        type="text"
                        required
                        value={coachDiscipline}
                        onChange={(e) => setCoachDiscipline(e.target.value)}
                        placeholder="es. Running, Calisthenics..."
                        className="w-full rounded-xl border border-white/10 bg-[#111A1A] px-3.5 py-2 text-sm text-[#F4F5F6] placeholder:text-[#525E5C] focus:border-[#8EF5DC] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9EABA7] mb-1">
                      Link profilo LinkedIn / Instagram / Certificazioni
                    </label>
                    <input
                      type="text"
                      value={coachProfileLink}
                      onChange={(e) => setCoachProfileLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-white/10 bg-[#111A1A] px-3.5 py-2 text-sm text-[#F4F5F6] placeholder:text-[#525E5C] focus:border-[#8EF5DC] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={coachLoading}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#8EF5DC] py-2.5 text-sm font-semibold text-[#080A0A] hover:bg-[#77eecf] disabled:opacity-50 transition-all min-h-[44px]"
                  >
                    {coachLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Salvataggio su Firebase...
                      </>
                    ) : (
                      'Invia candidatura coach'
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8EF5DC]/20 text-[#8EF5DC]">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="mt-4 text-xl font-bold text-[#F4F5F6]">
                  Candidatura salvata con successo!
                </h4>
                <p className="mt-2 text-xs text-[#9EABA7]">
                  I tuoi dati sono stati registrati su Firebase Firestore. Il team di GROW UP verificherà i titoli e le credenziali entro 48 ore lavorative.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 rounded-xl bg-[#8EF5DC] px-5 py-2.5 text-xs font-semibold text-[#080A0A] min-h-[44px]"
                >
                  Ho capito
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. ACCEDI (Firebase Authentication)                          */}
        {/* ============================================================ */}
        {type === 'login' && (
          <div>
            {currentUser ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8EF5DC]/15 text-[#8EF5DC] overflow-hidden border border-[#8EF5DC]/30">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Avatar'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserCheck className="h-8 w-8" />
                  )}
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#8EF5DC]/30 bg-[#8EF5DC]/10 px-3 py-1 text-xs font-semibold text-[#8EF5DC]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Autenticato su Firebase • {profile?.role === 'coach' ? 'Coach' : 'Atleta'}
                </div>
                <h4 className="mt-3 text-xl font-bold text-[#F4F5F6]">
                  {currentUser.displayName || 'Utente GROW UP'}
                </h4>
                <p className="mt-1 text-xs text-[#9EABA7]">
                  {currentUser.email}
                </p>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenQuestionnaire) onOpenQuestionnaire();
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#8EF5DC] px-5 py-2.5 text-xs font-semibold text-[#080A0A] hover:bg-[#77eecf] min-h-[44px]"
                  >
                    Trova un nuovo coach
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={async () => {
                      await signOut();
                      onClose();
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#111A1A] px-5 py-2.5 text-xs font-semibold text-[#F4F5F6] hover:bg-white/5 min-h-[44px]"
                  >
                    <LogOut className="h-3.5 w-3.5 text-red-400" />
                    Disconnetti
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-extrabold text-[#F4F5F6]">
                  Accedi a GROW UP
                </h3>
                <p className="mt-1 text-xs text-[#9EABA7]">
                  Entra con il tuo account Firebase per gestire allenamenti, abbinamenti e consulenze.
                </p>

                {authError && (
                  <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                    {authError}
                  </div>
                )}

                {/* Role Switcher */}
                <div className="mt-5">
                  <label className="block text-xs font-medium text-[#9EABA7] mb-1.5">
                    Seleziona il tuo profilo
                  </label>
                  <div className="grid grid-cols-2 rounded-xl border border-white/10 bg-[#111A1A] p-1">
                    <button
                      type="button"
                      onClick={() => setLoginRole('athlete')}
                      className={`min-h-[40px] py-2 text-xs font-semibold rounded-lg transition-all ${
                        loginRole === 'athlete'
                          ? 'bg-[#8EF5DC] text-[#080A0A]'
                          : 'text-[#9EABA7] hover:text-[#F4F5F6]'
                      }`}
                    >
                      Sono un Atleta
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginRole('coach')}
                      className={`min-h-[40px] py-2 text-xs font-semibold rounded-lg transition-all ${
                        loginRole === 'coach'
                          ? 'bg-[#8EF5DC] text-[#080A0A]'
                          : 'text-[#9EABA7] hover:text-[#F4F5F6]'
                      }`}
                    >
                      Sono un Coach
                    </button>
                  </div>
                </div>

                {/* Google Sign In with Firebase */}
                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    className="w-full flex min-h-[46px] items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-[#F4F5F6] hover:bg-white/10 transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {authLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-[#8EF5DC]" />
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Continua con Google ({loginRole === 'athlete' ? 'Atleta' : 'Coach'})</span>
                  </button>

                  <div className="pt-2 text-center text-xs text-[#8E9B98]">
                    L'autenticazione è gestita in modo sicuro tramite Firebase Auth.
                  </div>
                </div>

                <div className="mt-6 text-center text-xs text-[#8E9B98]">
                  Non hai ancora un account?{' '}
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenQuestionnaire) onOpenQuestionnaire();
                    }}
                    className="text-[#8EF5DC] font-semibold hover:underline"
                  >
                    Trova il tuo coach e registrati
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. SCOPRI IL METODO                                          */}
        {/* ============================================================ */}
        {type === 'method' && (
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8EF5DC]/30 bg-[#8EF5DC]/10 px-3 py-1 text-xs font-semibold text-[#8EF5DC]">
              <Award className="h-3.5 w-3.5" />
              IL METODO GROW UP
            </div>
            <h3 className="mt-3 text-2xl font-extrabold text-[#F4F5F6]">
              Come trasformiamo la tua costanza in risultati
            </h3>
            
            <div className="mt-6 space-y-4 text-sm text-[#9EABA7] leading-relaxed">
              <div className="rounded-xl border border-white/5 bg-[#111A1A] p-4">
                <h4 className="font-bold text-[#F4F5F6] flex items-center gap-2">
                  <span className="text-[#8EF5DC]">1.</span> Analisi di partenza completa
                </h4>
                <p className="mt-1 text-xs text-[#9EABA7]">
                  Prima di assegnare un solo esercizio, il coach valuta mobilità, postura, abitudini di sonno e ore a sedere per scongiurare infortuni.
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#111A1A] p-4">
                <h4 className="font-bold text-[#F4F5F6] flex items-center gap-2">
                  <span className="text-[#8EF5DC]">2.</span> Micro-obiettivi settimanali
                </h4>
                <p className="mt-1 text-xs text-[#9EABA7]">
                  Nessun sovraccarico irrealistico: la programmazione cresce progressivamente al ritmo del tuo reale adattamento biologico.
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#111A1A] p-4">
                <h4 className="font-bold text-[#F4F5F6] flex items-center gap-2">
                  <span className="text-[#8EF5DC]">3.</span> Feedback visivo e correzione tecnica
                </h4>
                <p className="mt-1 text-xs text-[#9EABA7]">
                  Invia brevi video delle tue esecuzioni direttamente tramite chat protetta e ricevi note vocali e disegni tecnici sulle traiettorie.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenQuestionnaire) onOpenQuestionnaire();
                }}
                className="rounded-xl bg-[#8EF5DC] px-5 py-2.5 text-xs font-semibold text-[#080A0A] hover:bg-[#77eecf]"
              >
                Trova il coach per il tuo percorso
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. CONTATTI                                                  */}
        {/* ============================================================ */}
        {type === 'contact' && (
          <div>
            {!contactSubmitted ? (
              <div>
                <h3 className="text-2xl font-extrabold text-[#F4F5F6]">
                  Contatta il Team GROW UP
                </h3>
                <p className="mt-1 text-xs text-[#9EABA7]">
                  Hai una domanda specifica o vuoi assistenza nella scelta del coach? Scrivici.
                </p>

                <form
                  onSubmit={handleContactSubmit}
                  className="mt-5 space-y-3.5"
                >
                  <div>
                    <label className="block text-xs font-medium text-[#9EABA7] mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Il tuo nome"
                      className="w-full rounded-xl border border-white/10 bg-[#111A1A] px-3.5 py-2 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9EABA7] mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="tua@email.com"
                      className="w-full rounded-xl border border-white/10 bg-[#111A1A] px-3.5 py-2 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9EABA7] mb-1">
                      Messaggio
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Come possiamo aiutarti?"
                      className="w-full rounded-xl border border-white/10 bg-[#111A1A] px-3.5 py-2 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="w-full rounded-xl bg-[#8EF5DC] py-2.5 text-sm font-semibold text-[#080A0A] hover:bg-[#77eecf] disabled:opacity-50 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    {contactLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Invio su Firebase in corso...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Invia messaggio
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8EF5DC]/20 text-[#8EF5DC]">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="mt-4 text-xl font-bold text-[#F4F5F6]">
                  Messaggio registrato!
                </h4>
                <p className="mt-2 text-xs text-[#9EABA7]">
                  Il tuo messaggio è stato memorizzato su Firestore. Ti risponderemo all'indirizzo indicato entro poche ore.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 rounded-xl bg-[#8EF5DC] px-5 py-2 text-xs font-semibold text-[#080A0A] min-h-[44px]"
                >
                  Chiudi
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 5. PRIVACY POLICY                                            */}
        {/* ============================================================ */}
        {type === 'privacy' && (
          <div>
            <h3 className="text-2xl font-extrabold text-[#F4F5F6]">
              Informativa sulla Privacy
            </h3>
            <div className="mt-4 max-h-[50vh] overflow-y-auto pr-2 space-y-3 text-xs text-[#9EABA7] leading-relaxed">
              <p>
                La presente Privacy Policy descrive le modalità con cui GROW UP raccoglie, utilizza e protegge i dati personali degli utenti ai sensi del Regolamento Europeo GDPR (UE 2016/679).
              </p>
              <h5 className="font-bold text-[#F4F5F6]">1. Dati trattati</h5>
              <p>
                Trattiamo unicamente i dati necessari a finalizzare il match con il coach: sport praticato, obiettivi fitness dichiarati, livello di preparazione e contatti (nome, email).
              </p>
              <h5 className="font-bold text-[#F4F5F6]">2. Finalità del trattamento</h5>
              <p>
                I dati non vengono ceduti a terze parti commerciali. Vengono condivisi esclusivamente con il coach da te espressamente selezionato per condurre la prima sessione conoscitiva.
              </p>
              <h5 className="font-bold text-[#F4F5F6]">3. Sicurezza e conservazione</h5>
              <p>
                Adottiamo crittografia avanzata e standard rigorosi per proteggere tutte le comunicazioni.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={onClose}
                className="rounded-xl bg-[#8EF5DC] px-5 py-2 text-xs font-semibold text-[#080A0A]"
              >
                Ho compreso
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 6. TERMINI E CONDIZIONI                                      */}
        {/* ============================================================ */}
        {type === 'terms' && (
          <div>
            <h3 className="text-2xl font-extrabold text-[#F4F5F6]">
              Termini e Condizioni di Servizio
            </h3>
            <div className="mt-4 max-h-[50vh] overflow-y-auto pr-2 space-y-3 text-xs text-[#9EABA7] leading-relaxed">
              <p>
                Benvenuto su GROW UP. Utilizzando la nostra piattaforma, accetti i seguenti termini:
              </p>
              <h5 className="font-bold text-[#F4F5F6]">1. Idoneità fisica e certificati medici</h5>
              <p>
                Prima di iniziare qualsiasi attività sportiva è obbligatorio disporre di certificato medico sportivo in corso di validità (agonistico o non agonistico).
              </p>
              <h5 className="font-bold text-[#F4F5F6]">2. Rapporto con il Coach</h5>
              <p>
                GROW UP verifica le certificazioni iniziali dei coach. Il percorso viene concordato direttamente tra atleta e professionista.
              </p>
              <h5 className="font-bold text-[#F4F5F6]">3. Trasparenza dei prezzi</h5>
              <p>
                La prima chiamata di orientamento da 15 minuti è sempre gratuita e senza alcun obbligo di rinnovo.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={onClose}
                className="rounded-xl bg-[#8EF5DC] px-5 py-2 text-xs font-semibold text-[#080A0A]"
              >
                Accetta e chiudi
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 7. INSTAGRAM POPUP                                           */}
        {type === 'instagram' && (
          <div className="text-center py-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8EF5DC]/20 text-[#8EF5DC]">
              <span className="font-bold text-xl">@</span>
            </div>
            <h4 className="mt-4 text-xl font-bold text-[#F4F5F6]">
              Segui GROW UP su Instagram
            </h4>
            <p className="mt-2 text-xs text-[#9EABA7] max-w-sm mx-auto">
              Tips di allenamento, storie di successo e approfondimenti quotidiani con i nostri coach: <strong className="text-[#8EF5DC]">@growup.fit</strong>
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="rounded-xl bg-[#8EF5DC] px-5 py-2 text-xs font-semibold text-[#080A0A]"
              >
                Chiudi
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
