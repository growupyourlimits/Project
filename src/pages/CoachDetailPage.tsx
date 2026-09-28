import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Clock,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  User,
  Award,
  Zap,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import {
  getCoachProfile,
  listCoachServices,
  listCoachAvailability,
  createBooking,
} from '../firebase';
import {
  CoachProfileEntity,
  CoachServiceEntity,
  CoachAvailabilityEntity,
} from '../types';

export const CoachDetailPage: React.FC = () => {
  const { params, navigate, openLoginModal } = useNavigation();
  const { currentUser } = useAuth();
  const coachId = params.coachId;

  const [coach, setCoach] = useState<CoachProfileEntity | null>(null);
  const [services, setServices] = useState<CoachServiceEntity[]>([]);
  const [slots, setSlots] = useState<CoachAvailabilityEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking drawer / panel state
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    if (!coachId) {
      setError('Identificativo coach mancante.');
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    Promise.all([
      getCoachProfile(coachId),
      listCoachServices(coachId),
      listCoachAvailability(coachId),
    ])
      .then(([coachData, servicesData, slotsData]) => {
        if (!mounted) return;
        if (!coachData) {
          setError('Coach non trovato o profilo non attivo.');
          setLoading(false);
          return;
        }

        setCoach(coachData);
        setServices(servicesData);

        // Filter and sort upcoming available slots
        const now = Date.now();
        const validSlots = slotsData
          .map((slot: any) => {
            const date = slot.startAt?.toDate ? slot.startAt.toDate() : new Date(slot.startAt);
            return {
              ...slot,
              parsedDate: date,
            };
          })
          .filter((s) => !isNaN(s.parsedDate.getTime()) && s.parsedDate.getTime() > now)
          .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

        setSlots(validSlots);
        if (servicesData.length > 0) {
          setSelectedServiceId(servicesData[0].id);
        }
        if (validSlots.length > 0) {
          setSelectedSlotId(validSlots[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching coach details', err);
        if (mounted) {
          setError('Impossibile caricare il profilo del coach.');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [coachId]);

  const handleConfirmBooking = async () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    if (!coachId || !selectedServiceId || !selectedSlotId) {
      setBookingError('Seleziona un servizio e uno slot orario disponibile.');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      await createBooking({
        coachId,
        serviceId: selectedServiceId,
        slotId: selectedSlotId,
      });

      setBookingSuccess(true);
      // Remove booked slot locally
      setSlots((prev) => prev.filter((s) => s.id !== selectedSlotId));
    } catch (err: any) {
      console.error('Booking error', err);
      setBookingError(
        err.message || 'Errore durante la prenotazione. Lo slot potrebbe non essere più disponibile.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-sm text-[#9EABA7]">
        Caricamento profilo coach...
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-red-400 mb-4">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-[#F4F5F6]">{error || 'Coach non trovato'}</h2>
        <p className="mt-2 text-xs sm:text-sm text-[#9EABA7]">
          Il coach selezionato potrebbe essere temporaneamente non disponibile o non ancora
          verificato.
        </p>
        <button
          onClick={() => navigate('/coaches')}
          className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#8EF5DC] px-5 py-2.5 text-xs font-semibold text-[#080A0A]"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna all'elenco coach
        </button>
      </div>
    );
  }

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <button
        onClick={() => navigate('/coaches')}
        className="inline-flex items-center gap-1.5 text-xs text-[#9EABA7] hover:text-[#8EF5DC] transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna al catalogo coach
      </button>

      {/* Main Grid: Left Profile Details, Right Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {coach.photoURL ? (
                <img
                  src={coach.photoURL}
                  alt={coach.displayName}
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl object-cover border border-white/10 shrink-0"
                />
              ) : (
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-[#080A0A] border border-white/10 flex items-center justify-center font-bold text-2xl text-[#8EF5DC] shrink-0">
                  {coach.displayName
                    .split(' ')
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join('')
                    .toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F5F6]">
                    {coach.displayName}
                  </h1>
                  {coach.verificationStatus === 'approved' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#8EF5DC]/10 px-2.5 py-0.5 text-xs font-bold text-[#8EF5DC] border border-[#8EF5DC]/30">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Coach Verificato
                    </span>
                  )}
                </div>

                <div className="mt-1 text-sm font-semibold text-[#8EF5DC]">
                  {coach.discipline}
                  {coach.headline ? ` • ${coach.headline}` : ''}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#9EABA7]">
                  {coach.experienceYears ? (
                    <span className="flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-[#8EF5DC]" />
                      {coach.experienceYears} anni di esperienza
                    </span>
                  ) : null}
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-[#8EF5DC]" />
                    Modalità: {(coach.modalities || ['Online', 'In presenza']).join(' • ')}
                  </span>
                  {coach.location && (
                    <span className="flex items-center gap-1.5">
                      <span>📍</span> {coach.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chi sono & Bio */}
          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-[#F4F5F6] mb-3">Chi sono</h2>
            <p className="text-sm text-[#9EABA7] leading-relaxed whitespace-pre-line">
              {coach.bio || 'Nessuna biografia aggiuntiva fornita dal coach.'}
            </p>
          </div>

          {/* Specializzazioni e Discipline */}
          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-[#F4F5F6] mb-3">Specializzazioni</h2>
            <div className="flex flex-wrap gap-2">
              {(coach.specialties && coach.specialties.length > 0
                ? coach.specialties
                : coach.tags || [coach.discipline]
              ).map((spec) => (
                <span
                  key={spec}
                  className="rounded-xl border border-white/10 bg-[#080A0A] px-3 py-1 text-xs font-medium text-[#F4F5F6]"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Obiettivi seguiti & Livelli */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6">
              <h2 className="text-base font-bold text-[#F4F5F6] mb-3">Obiettivi seguiti</h2>
              <div className="space-y-2">
                {(coach.goals || [
                  'Dimagrimento',
                  'Forza e Massa',
                  'Preparazione gara',
                  'Benessere generale',
                ]).map((goal) => (
                  <div key={goal} className="flex items-center gap-2 text-xs text-[#9EABA7]">
                    <Check className="h-3.5 w-3.5 text-[#8EF5DC]" />
                    <span>{goal}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6">
              <h2 className="text-base font-bold text-[#F4F5F6] mb-3">Livelli supportati</h2>
              <div className="space-y-2">
                {(coach.levels || ['Principiante', 'Intermedio', 'Avanzato']).map((lvl) => (
                  <div key={lvl} className="flex items-center gap-2 text-xs text-[#9EABA7]">
                    <Check className="h-3.5 w-3.5 text-[#8EF5DC]" />
                    <span>{lvl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Servizi del Coach */}
          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-[#F4F5F6] mb-2">Servizi e tariffe indicative</h2>
            <p className="text-xs text-[#9EABA7] mb-5">
              I prezzi sono puramente informativi. Il pagamento non avviene sul sito; la prenotazione
              viene confermata direttamente con il coach.
            </p>

            {services.length > 0 ? (
              <div className="space-y-3">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    onClick={() => setSelectedServiceId(svc.id)}
                    className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                      selectedServiceId === svc.id
                        ? 'border-[#8EF5DC] bg-[#8EF5DC]/5'
                        : 'border-white/10 bg-[#080A0A] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-bold text-sm text-[#F4F5F6] flex items-center gap-2">
                          <span>{svc.title}</span>
                          {selectedServiceId === svc.id && (
                            <span className="rounded-full bg-[#8EF5DC] text-[#080A0A] p-0.5">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        {svc.description && (
                          <p className="mt-1 text-xs text-[#9EABA7]">{svc.description}</p>
                        )}
                        <div className="mt-2 text-[11px] text-[#65716f]">
                          Durata: {svc.durationMinutes} minuti • Tipologia:{' '}
                          {svc.type === 'single_session'
                            ? 'Sessione singola'
                            : svc.type === 'package'
                            ? 'Pacchetto'
                            : 'Abbonamento'}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-extrabold text-[#8EF5DC]">
                          €{(svc.priceCents / 100).toFixed(0)}
                        </span>
                        <div className="text-[10px] text-[#9EABA7]">prezzo coach</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/5 bg-[#080A0A] p-4 text-xs text-[#9EABA7]">
                Il coach non ha ancora pubblicato tariffe personalizzate per questo profilo.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 rounded-3xl border border-white/10 bg-[#111A1A] p-6 shadow-2xl space-y-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#8EF5DC]">
                PRENOTAZIONE SESSIONE
              </div>
              <h3 className="text-xl font-extrabold text-[#F4F5F6] mt-1">
                Riserva il tuo slot
              </h3>
              <p className="text-xs text-[#9EABA7] mt-1">
                Nessun costo immediato: la richiesta viene registrata come unpaid nella tua
                dashboard.
              </p>
            </div>

            {bookingSuccess ? (
              <div className="rounded-2xl border border-[#8EF5DC]/30 bg-[#8EF5DC]/10 p-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8EF5DC] text-[#080A0A] mb-3">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-[#F4F5F6] text-base">Prenotazione Confermata!</h4>
                <p className="text-xs text-[#9EABA7] mt-1">
                  Lo slot con {coach.displayName} è stato riservato. Trovi tutti i dettagli nella tua
                  Dashboard Atleta.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => navigate('/dashboard?tab=bookings')}
                    className="w-full inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#8EF5DC] py-2 text-xs font-bold text-[#080A0A]"
                  >
                    Vai alle mie prenotazioni
                  </button>
                  <button
                    onClick={() => setBookingSuccess(false)}
                    className="w-full inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 py-2 text-xs text-[#F4F5F6]"
                  >
                    Effettua un'altra prenotazione
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                    {bookingError}
                  </div>
                )}

                {/* Service Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#9EABA7] mb-1.5">
                    1. Seleziona Servizio
                  </label>
                  {services.length > 0 ? (
                    <select
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080A0A] px-3.5 py-2.5 text-xs text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
                    >
                      {services.map((svc) => (
                        <option key={svc.id} value={svc.id} className="bg-[#111A1A]">
                          {svc.title} — €{(svc.priceCents / 100).toFixed(0)} ({svc.durationMinutes} min)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-[#080A0A] p-3 text-xs text-[#9EABA7]">
                      Nessun servizio attivo al momento.
                    </div>
                  )}
                </div>

                {/* Slot Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#9EABA7] mb-1.5">
                    2. Seleziona Data e Orario
                  </label>
                  {slots.length > 0 ? (
                    <select
                      value={selectedSlotId}
                      onChange={(e) => setSelectedSlotId(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080A0A] px-3.5 py-2.5 text-xs text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
                    >
                      {slots.map((slot: any) => (
                        <option key={slot.id} value={slot.id} className="bg-[#111A1A]">
                          {slot.parsedDate.toLocaleDateString('it-IT', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-[#080A0A] p-3 text-xs text-[#9EABA7]">
                      Nessuno slot disponibile in questo momento.
                    </div>
                  )}
                </div>

                {/* Booking summary box */}
                <div className="rounded-2xl border border-white/5 bg-[#080A0A] p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-[#9EABA7]">
                    <span>Coach:</span>
                    <span className="font-semibold text-[#F4F5F6]">{coach.displayName}</span>
                  </div>
                  {selectedService && (
                    <div className="flex justify-between text-[#9EABA7]">
                      <span>Tariffa sessione:</span>
                      <span className="font-bold text-[#8EF5DC]">
                        €{(selectedService.priceCents / 100).toFixed(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#9EABA7]">
                    <span>Stato pagamento:</span>
                    <span className="text-amber-400 font-medium">Non addebitato (unpaid)</span>
                  </div>
                </div>

                {/* CTA Button */}
                {currentUser ? (
                  <button
                    onClick={handleConfirmBooking}
                    disabled={
                      bookingLoading ||
                      services.length === 0 ||
                      slots.length === 0 ||
                      !selectedServiceId ||
                      !selectedSlotId
                    }
                    className="w-full inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#8EF5DC] py-3 text-xs font-bold text-[#080A0A] hover:bg-[#7cebcfe8] disabled:opacity-40 transition-all"
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Riservando lo slot...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4" />
                        Conferma Prenotazione
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={openLoginModal}
                    className="w-full inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#8EF5DC] py-3 text-xs font-bold text-[#080A0A] hover:bg-[#7cebcfe8] transition-all"
                  >
                    Accedi per Prenotare
                  </button>
                )}

                <p className="text-[11px] text-[#65716f] text-center">
                  La transazione atomica blocca immediatamente l'orario scelto. Nessuna commissione
                  anticipata.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
