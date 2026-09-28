import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Check,
  ArrowRight,
  Loader2,
  Clock,
  Award,
  Users,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import {
  submitCoachApplication,
  listMyCoachApplications,
} from '../firebase';
import { DISCIPLINES, CoachApplicationEntity } from '../types';

export const ForCoachesPage: React.FC = () => {
  const { currentUser, isCoach, isAdmin } = useAuth();
  const { openLoginModal, navigate } = useNavigation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [discipline, setDiscipline] = useState<string>(DISCIPLINES[0]);
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [profileLink, setProfileLink] = useState('');
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<CoachApplicationEntity | null>(null);
  const [existingApps, setExistingApps] = useState<CoachApplicationEntity[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-fill user data if signed in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.displayName && !fullName) {
        setFullName(currentUser.displayName);
      }
      if (currentUser.email && !email) {
        setEmail(currentUser.email);
      }
      listMyCoachApplications(currentUser.uid)
        .then((apps) => {
          setExistingApps(apps);
        })
        .catch(console.error);
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openLoginModal();
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await submitCoachApplication({
        fullName,
        email,
        discipline,
        experienceYears,
        profileLink,
        bio,
      });

      // Reload applications
      const apps = await listMyCoachApplications(currentUser.uid);
      setExistingApps(apps);
      setSubmittedApp(apps[0] || null);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Errore durante l’invio della candidatura. Riprova più tardi.'
      );
    } finally {
      setLoading(false);
    }
  };

  const hasPendingApp = existingApps.some((a) => a.status === 'submitted');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#8EF5DC]/30 bg-[#8EF5DC]/10 px-3.5 py-1 text-xs font-semibold text-[#8EF5DC] mb-4">
          <ShieldCheck className="h-3.5 w-3.5" />
          PER I PROFESSIONISTI DELLO SPORT
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#F4F5F6] tracking-tight">
          Candidati come Coach su GROW UP
        </h1>
        <p className="mt-4 text-sm sm:text-base text-[#9EABA7] leading-relaxed">
          Unisciti alla rete di personal trainer, preparatori atletici e coach verificati. Gestisci
          le tue disponibilità e connettiti con allievi motivati.
        </p>
      </div>

      {/* If already an approved coach */}
      {isCoach && (
        <div className="mt-8 rounded-3xl border border-[#8EF5DC]/40 bg-[#8EF5DC]/10 p-6 sm:p-8 text-center max-w-2xl mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8EF5DC] text-[#080A0A] mb-3">
            <Check className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#F4F5F6]">Sei già un Coach Verificato!</h2>
          <p className="mt-2 text-xs sm:text-sm text-[#9EABA7]">
            Il tuo account dispone già delle autorizzazioni per pubblicare servizi, orari e gestire
            sessioni.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#8EF5DC] px-6 py-2.5 text-xs font-bold text-[#080A0A]"
          >
            Vai alla Dashboard Coach
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* If has pending application */}
      {!isCoach && hasPendingApp && (
        <div className="mt-8 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 sm:p-8 text-center max-w-2xl mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-[#080A0A] mb-3">
            <Clock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#F4F5F6]">Candidatura in verifica</h2>
          <p className="mt-2 text-xs sm:text-sm text-[#9EABA7] leading-relaxed">
            Abbiamo ricevuto la tua candidatura! Il team di GROW UP verificherà i titoli e le
            credenziali. Riceverai un aggiornamento via email e il tuo profilo coach sarà attivato
            non appena approvato dall'amministratore.
          </p>
          <div className="mt-4 text-xs text-amber-300 font-medium">
            Stato attuale: In attesa di revisione
          </div>
        </div>
      )}

      {/* Main Form (when not coach and no pending app) */}
      {!isCoach && !hasPendingApp && (
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Info Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4">
              <h3 className="font-bold text-base text-[#F4F5F6]">Requisiti di ammissione</h3>
              <div className="space-y-3 text-xs text-[#9EABA7]">
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#8EF5DC] shrink-0 mt-0.5" />
                  <span>Laurea in Scienze Motorie o brevetto tecnico federale riconosciuto CONI.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#8EF5DC] shrink-0 mt-0.5" />
                  <span>Esperienza pratica documentabile nel settore scelto.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-[#8EF5DC] shrink-0 mt-0.5" />
                  <span>Affidabilità, puntualità e massima professionalità verso gli atleti.</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-3">
              <h3 className="font-bold text-base text-[#F4F5F6]">Come funziona la verifica</h3>
              <p className="text-xs text-[#9EABA7] leading-relaxed">
                Invia le informazioni professionali tramite il modulo. L'amministratore revisiona la
                richiesta e approva l'accesso alla Dashboard Coach per configurare orari e tariffe.
              </p>
              <div className="rounded-xl border border-white/5 bg-[#080A0A] p-3 text-[11px] text-[#8EF5DC]">
                Nota: La documentazione potrà essere richiesta durante la verifica del profilo.
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#F4F5F6] mb-1">Modulo di Candidatura</h2>
              <p className="text-xs text-[#9EABA7] mb-6">
                Compila tutti i campi con le tue informazioni professionali.
              </p>

              {errorMessage && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 mb-6">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9EABA7] mb-1.5">
                      Nome e Cognome *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="es. Mario Rossi"
                      className="w-full rounded-xl border border-white/10 bg-[#080A0A] px-3.5 py-2.5 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#9EABA7] mb-1.5">
                      Email di contatto *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="coach@example.com"
                      className="w-full rounded-xl border border-white/10 bg-[#080A0A] px-3.5 py-2.5 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#9EABA7] mb-1.5">
                      Disciplina principale *
                    </label>
                    <select
                      value={discipline}
                      onChange={(e) => setDiscipline(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080A0A] px-3.5 py-2.5 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
                    >
                      {DISCIPLINES.map((d) => (
                        <option key={d} value={d} className="bg-[#111A1A]">
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#9EABA7] mb-1.5">
                      Anni di esperienza nel coaching *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={50}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/10 bg-[#080A0A] px-3.5 py-2.5 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9EABA7] mb-1.5">
                    LinkedIn / Portfolio / Sito professionale
                  </label>
                  <input
                    type="url"
                    value={profileLink}
                    onChange={(e) => setProfileLink(e.target.value)}
                    placeholder="https://linkedin.com/in/... o sito web"
                    className="w-full rounded-xl border border-white/10 bg-[#080A0A] px-3.5 py-2.5 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9EABA7] mb-1.5">
                    Bio professionale & Titoli di studio *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Descrivi la tua formazione (laurea, federazioni, certificazioni), il tuo approccio all'allenamento e a chi ti rivolgi."
                    className="w-full rounded-xl border border-white/10 bg-[#080A0A] px-3.5 py-2.5 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none resize-none"
                  />
                </div>

                <div className="rounded-xl border border-white/5 bg-[#080A0A] p-3 text-xs text-[#9EABA7]">
                  <p>
                    <strong className="text-[#F4F5F6]">Nota documentazione:</strong> Non è
                    necessario caricare file adesso. La documentazione potrà essere richiesta
                    durante la verifica del profilo.
                  </p>
                </div>

                {currentUser ? (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#8EF5DC] py-3 text-sm font-semibold text-[#080A0A] hover:bg-[#7cebcfe8] disabled:opacity-50 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Invio candidatura...
                      </>
                    ) : (
                      'Invia candidatura coach'
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openLoginModal}
                    className="w-full inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#8EF5DC] py-3 text-sm font-semibold text-[#080A0A] hover:bg-[#7cebcfe8] transition-all"
                  >
                    Accedi con Google per Candidarti
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
