import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarCheck,
  ShieldCheck,
  Eye,
  Check,
  Ban,
  Clock,
  ExternalLink,
  Loader2,
  Calendar,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Award,
  Radio,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import {
  subscribeToCoachApplications,
  subscribeToCoachProfiles,
  subscribeToUsers,
  subscribeToBookings,
  reviewCoachApplication,
  toggleCoachActive,
  updateBookingStatus,
  ADMIN_EMAIL,
} from '../firebase';
import {
  CoachApplicationEntity,
  CoachProfileEntity,
  BookingEntity,
} from '../types';

interface AdminDashboardViewProps {
  initialTab?: string;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ initialTab = 'overview' }) => {
  const { currentUser, isAdmin } = useAuth();
  const { navigate } = useNavigation();

  // Active section state
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Live data from Firestore listeners
  const [applications, setApplications] = useState<CoachApplicationEntity[]>([]);
  const [coaches, setCoaches] = useState<CoachProfileEntity[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<BookingEntity[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Rejection modal state
  const [rejectModalApp, setRejectModalApp] = useState<{ id: string; applicantId: string; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<'all' | 'submitted' | 'approved' | 'rejected'>('all');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'athlete' | 'coach' | 'admin'>('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Synchronize when initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Set up live real-time Firestore listeners
  useEffect(() => {
    setLoading(true);
    setSyncError(null);

    let unsubApps: (() => void) | null = null;
    let unsubCoaches: (() => void) | null = null;
    let unsubUsers: (() => void) | null = null;
    let unsubBookings: (() => void) | null = null;

    try {
      unsubApps = subscribeToCoachApplications(
        (data) => {
          setApplications(data);
          setLoading(false);
        },
        (err: any) => {
          console.warn('Apps sync note:', err?.message);
        }
      );

      unsubCoaches = subscribeToCoachProfiles(
        (data) => {
          setCoaches(data);
          setLoading(false);
        },
        (err: any) => {
          console.warn('Coaches sync note:', err?.message);
        }
      );

      unsubUsers = subscribeToUsers(
        (data) => {
          setUsers(data);
          setLoading(false);
        },
        (err: any) => {
          console.warn('Users sync note:', err?.message);
          // If permission denied because user is not yet logged in as growupyourlimits@gmail.com
          if (err?.code === 'permission-denied' || String(err).includes('permission')) {
            setSyncError('growupyourlimits@gmail.com');
          }
        }
      );

      unsubBookings = subscribeToBookings(
        (data) => {
          setBookings(data);
          setLoading(false);
        },
        (err: any) => {
          console.warn('Bookings sync note:', err?.message);
        }
      );
    } catch (e: any) {
      console.error('Firestore listener setup error:', e);
      setLoading(false);
    }

    return () => {
      if (unsubApps) unsubApps();
      if (unsubCoaches) unsubCoaches();
      if (unsubUsers) unsubUsers();
      if (unsubBookings) unsubBookings();
    };
  }, []);

  // Compute live counts directly from Firestore data
  const pendingApps = applications.filter((a) => a.status === 'submitted');
  const approvedCoaches = coaches.filter((c) => c.verificationStatus === 'approved' || c.active === true);
  const pendingCount = pendingApps.length;
  const approvedCoachesCount = approvedCoaches.length;
  const usersCount = users.length;
  const bookingsCount = bookings.length;

  // Handle application approval
  const handleApproveApplication = async (appId: string, applicantId: string, name: string) => {
    setIsProcessingAction(true);
    try {
      await reviewCoachApplication(appId, applicantId, true);
      setActionNotice({
        type: 'success',
        message: `Candidatura di ${name} approvata con successo! Ruolo utente aggiornato a Coach e profilo creato nel catalogo.`,
      });
    } catch (err: any) {
      console.error('Error approving application:', err);
      setActionNotice({
        type: 'error',
        message: err.message || 'Errore durante l’approvazione della candidatura.',
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handle application rejection
  const handleConfirmReject = async () => {
    if (!rejectModalApp) return;
    setIsProcessingAction(true);
    try {
      await reviewCoachApplication(rejectModalApp.id, rejectModalApp.applicantId, false, rejectionReason);
      setActionNotice({
        type: 'success',
        message: `Candidatura di ${rejectModalApp.name} contrassegnata come rifiutata.`,
      });
      setRejectModalApp(null);
      setRejectionReason('');
    } catch (err: any) {
      console.error('Error rejecting application:', err);
      setActionNotice({
        type: 'error',
        message: err.message || 'Errore durante il rifiuto della candidatura.',
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Toggle coach visibility in the marketplace
  const handleToggleCoachActive = async (coach: CoachProfileEntity) => {
    try {
      await toggleCoachActive(coach.coachId, Boolean(coach.active));
      setActionNotice({
        type: 'success',
        message: `Stato coach ${coach.displayName} impostato su: ${!coach.active ? 'Attivo nel marketplace' : 'Disattivato'}.`,
      });
    } catch (err: any) {
      console.error('Error toggling coach active status:', err);
      setActionNotice({
        type: 'error',
        message: err.message || 'Errore durante la modifica dello stato coach.',
      });
    }
  };

  // Update booking status
  const handleUpdateBookingStatus = async (
    bookingId: string,
    newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      setActionNotice({
        type: 'success',
        message: `Prenotazione #${bookingId.slice(-6)} aggiornata a "${newStatus}".`,
      });
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      setActionNotice({
        type: 'error',
        message: err.message || 'Errore durante l’aggiornamento della prenotazione.',
      });
    }
  };

  const isCurrentAdminEmail = currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <div className="space-y-6">
      {/* Top Admin Header Bar */}
      <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#8EF5DC]">
                AREA DI GESTIONE
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8EF5DC]/15 px-3 py-0.5 text-xs font-bold text-[#8EF5DC] border border-[#8EF5DC]/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                GROW UP Admin
              </span>
              {/* Live Firestore Sync Status Indicator */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Firestore Live Sync
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F5F6] tracking-tight">
              GROW UP Admin
            </h1>
            <p className="text-xs sm:text-sm text-[#9EABA7]">
              Pannello di controllo centrale per la supervisione della piattaforma, approvazione candidature coach e monitoraggio prenotazioni.
            </p>
          </div>

          {/* Admin User Badge & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-xs text-[#9EABA7] pr-2 border-r border-white/10">
              <span className="text-[#F4F5F6] font-semibold flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-[#8EF5DC]" />
                {currentUser?.displayName || 'Admin Ufficiale'}
              </span>
              <span className="text-[11px] text-[#8EF5DC]">{currentUser?.email || ADMIN_EMAIL}</span>
            </div>

            {/* Mobile menu drawer trigger */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/10 bg-[#080A0A] px-4 py-2 text-xs font-semibold text-[#F4F5F6]"
            >
              <Menu className="h-4 w-4 text-[#8EF5DC]" />
              <span>Menu Admin</span>
            </button>
          </div>
        </div>

        {/* Warning if logged in with non-admin email */}
        {!isCurrentAdminEmail && (
          <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold">Attenzione permessi:</span> Sei collegato come <code>{currentUser?.email}</code>. Per avere accesso totale in scrittura e approvazione Firestore, l'account autorizzato è <strong>{ADMIN_EMAIL}</strong>.
            </div>
          </div>
        )}
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div
          className={`rounded-2xl border p-4 text-xs font-semibold flex items-center justify-between transition-all ${
            actionNotice.type === 'success'
              ? 'border-[#8EF5DC]/40 bg-[#8EF5DC]/10 text-[#8EF5DC]'
              : 'border-red-500/40 bg-red-500/10 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-[#8EF5DC] shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs opacity-70 hover:opacity-100 hover:underline px-2 py-1"
          >
            Chiudi
          </button>
        </div>
      )}

      {/* Main Admin Workspace: Dedicated Sidebar + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* ============================================================ */}
        {/* SIDEBAR NAVIGATION                                           */}
        {/* ============================================================ */}
        <aside
          className={`lg:block ${
            mobileSidebarOpen ? 'block' : 'hidden'
          } rounded-3xl border border-white/10 bg-[#111A1A] p-4 lg:p-5 h-fit space-y-2`}
        >
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#9EABA7]">
            Navigazione Admin
          </div>

          <AdminSidebarButton
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Overview"
            sublabel="Panoramica live"
            active={activeTab === 'overview'}
            onClick={() => {
              setActiveTab('overview');
              setMobileSidebarOpen(false);
            }}
          />

          <AdminSidebarButton
            icon={<FileText className="h-4 w-4" />}
            label="Candidature Coach"
            sublabel="Verifica profili"
            badge={pendingCount > 0 ? `${pendingCount} in attesa` : undefined}
            badgeHighlight={pendingCount > 0}
            active={activeTab === 'applications'}
            onClick={() => {
              setActiveTab('applications');
              setMobileSidebarOpen(false);
            }}
          />

          <AdminSidebarButton
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Coach"
            sublabel="Catalogo abilitati"
            badge={approvedCoachesCount > 0 ? String(approvedCoachesCount) : undefined}
            active={activeTab === 'coaches'}
            onClick={() => {
              setActiveTab('coaches');
              setMobileSidebarOpen(false);
            }}
          />

          <AdminSidebarButton
            icon={<Users className="h-4 w-4" />}
            label="Utenti"
            sublabel="Account registrati"
            badge={usersCount > 0 ? String(usersCount) : undefined}
            active={activeTab === 'users'}
            onClick={() => {
              setActiveTab('users');
              setMobileSidebarOpen(false);
            }}
          />

          <AdminSidebarButton
            icon={<CalendarCheck className="h-4 w-4" />}
            label="Prenotazioni"
            sublabel="Sessioni marketplace"
            badge={bookingsCount > 0 ? String(bookingsCount) : undefined}
            active={activeTab === 'bookings'}
            onClick={() => {
              setActiveTab('bookings');
              setMobileSidebarOpen(false);
            }}
          />

          {/* Quick External Marketplace Link */}
          <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
            <button
              onClick={() => navigate('/coaches')}
              className="w-full flex items-center justify-between min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold text-[#9EABA7] hover:text-[#8EF5DC] hover:bg-white/5 transition-all"
            >
              <span className="flex items-center gap-2">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Vedi Marketplace Coach
              </span>
            </button>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* MAIN CONTENT AREA                                            */}
        {/* ============================================================ */}
        <section className="lg:col-span-3 space-y-6">
          {/* ========================================================== */}
          {/* 1. OVERVIEW TAB: 4 LIVE CARDS + SUMMARY TABLES             */}
          {/* ========================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* THE 4 REQUIRED CARDS WITH LIVE COUNTS FROM FIRESTORE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* CARD 1: Candidature in attesa */}
                <AdminLiveStatCard
                  label="Candidature in attesa"
                  value={pendingCount}
                  subtitle="In attesa di revisione e approvazione"
                  icon={<FileText className="h-5 w-5" />}
                  highlight={pendingCount > 0}
                  onClick={() => setActiveTab('applications')}
                  actionLabel="Revisiona"
                />

                {/* CARD 2: Coach approvati */}
                <AdminLiveStatCard
                  label="Coach approvati"
                  value={approvedCoachesCount}
                  subtitle="Abilitati nel catalogo GROW UP"
                  icon={<ShieldCheck className="h-5 w-5" />}
                  onClick={() => setActiveTab('coaches')}
                  actionLabel="Vedi elenco"
                />

                {/* CARD 3: Utenti */}
                <AdminLiveStatCard
                  label="Utenti"
                  value={usersCount}
                  subtitle="Account atleti e coach registrati"
                  icon={<Users className="h-5 w-5" />}
                  onClick={() => setActiveTab('users')}
                  actionLabel="Vedi tutti"
                />

                {/* CARD 4: Prenotazioni */}
                <AdminLiveStatCard
                  label="Prenotazioni"
                  value={bookingsCount}
                  subtitle="Sessioni create (paymentStatus: unpaid)"
                  icon={<CalendarCheck className="h-5 w-5" />}
                  onClick={() => setActiveTab('bookings')}
                  actionLabel="Gestisci"
                />
              </div>

              {/* URGENT PENDING APPLICATIONS SECTION */}
              <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-[#8EF5DC]" />
                    <h3 className="font-bold text-base sm:text-lg text-[#F4F5F6]">
                      Candidature recenti da verificare
                    </h3>
                  </div>
                  <span className="text-xs text-[#9EABA7] font-medium">
                    {pendingCount} {pendingCount === 1 ? 'in attesa' : 'in attesa'}
                  </span>
                </div>

                {pendingCount > 0 ? (
                  <div className="space-y-3">
                    {pendingApps.slice(0, 4).map((app) => (
                      <div
                        key={app.id}
                        className="rounded-2xl border border-white/10 bg-[#080A0A] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-white/20"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm sm:text-base text-[#F4F5F6]">
                              {app.fullName}
                            </span>
                            <span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                              In verifica
                            </span>
                          </div>
                          <div className="text-xs text-[#9EABA7] flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="text-[#F4F5F6]">{app.email}</span>
                            <span>•</span>
                            <span className="text-[#8EF5DC] font-semibold">{app.discipline}</span>
                            <span>•</span>
                            <span>{app.experienceYears || 0} anni exp</span>
                          </div>
                          {app.bio && (
                            <p className="text-xs text-[#9EABA7] line-clamp-1 italic mt-0.5">
                              "{app.bio}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApproveApplication(app.id, app.applicantId, app.fullName)}
                            disabled={isProcessingAction}
                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#8EF5DC] px-3.5 py-1.5 text-xs font-bold text-[#080A0A] hover:bg-[#7cebcfe8] active:scale-95 transition-all disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approva Coach
                          </button>
                          <button
                            onClick={() =>
                              setRejectModalApp({
                                id: app.id,
                                applicantId: app.applicantId,
                                name: app.fullName,
                              })
                            }
                            disabled={isProcessingAction}
                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20 active:scale-95 transition-all disabled:opacity-50"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Rifiuta
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-[#080A0A]/50 p-8 text-center text-xs text-[#9EABA7] space-y-1">
                    <CheckCircle2 className="h-7 w-7 text-[#8EF5DC] mx-auto opacity-70 mb-2" />
                    <p className="text-sm font-semibold text-[#F4F5F6]">Tutto in regola!</p>
                    <p>Nessuna candidatura coach in attesa di revisione in questo momento.</p>
                  </div>
                )}
              </div>

              {/* OVERVIEW SECONDARY GRIDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Bookings preview */}
                <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm sm:text-base text-[#F4F5F6]">
                      Ultime Prenotazioni
                    </h4>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="text-xs text-[#8EF5DC] hover:underline"
                    >
                      Vedi tutte ({bookingsCount})
                    </button>
                  </div>

                  {bookings.length > 0 ? (
                    <div className="space-y-2.5">
                      {bookings.slice(0, 4).map((b) => (
                        <div
                          key={b.id}
                          className="rounded-xl border border-white/5 bg-[#080A0A] p-3 text-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-[#F4F5F6]">
                              Prenotazione #{b.id.slice(-6)}
                            </div>
                            <div className="text-[11px] text-[#9EABA7]">
                              Atleta: {b.athleteId.slice(0, 8)}... • Coach: {b.coachId.slice(0, 8)}...
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-full bg-[#8EF5DC]/10 px-2 py-0.5 text-[10px] font-bold text-[#8EF5DC]">
                              {b.status}
                            </span>
                            <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                              {b.paymentStatus || 'unpaid'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-[#9EABA7]">
                      Nessuna prenotazione presente nel database.
                    </div>
                  )}
                </div>

                {/* Approved Coaches catalog preview */}
                <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm sm:text-base text-[#F4F5F6]">
                      Coach nel Catalogo
                    </h4>
                    <button
                      onClick={() => setActiveTab('coaches')}
                      className="text-xs text-[#8EF5DC] hover:underline"
                    >
                      Gestisci ({approvedCoachesCount})
                    </button>
                  </div>

                  {coaches.length > 0 ? (
                    <div className="space-y-2.5">
                      {coaches.slice(0, 4).map((c) => (
                        <div
                          key={c.coachId}
                          className="rounded-xl border border-white/5 bg-[#080A0A] p-3 text-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-[#F4F5F6]">{c.displayName}</div>
                            <div className="text-[11px] text-[#8EF5DC]">{c.discipline}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                c.active
                                  ? 'bg-[#8EF5DC]/15 text-[#8EF5DC]'
                                  : 'bg-white/10 text-[#9EABA7]'
                              }`}
                            >
                              {c.active ? 'Attivo' : 'Sospeso'}
                            </span>
                            <button
                              onClick={() => navigate(`/coaches/${c.coachId}`)}
                              className="text-[#9EABA7] hover:text-[#F4F5F6]"
                              title="Vedi profilo pubblico"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-[#9EABA7]">
                      Nessun coach ancora approvato.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 2. CANDIDATURE COACH TAB                                   */}
          {/* ========================================================== */}
          {activeTab === 'applications' && (
            <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-[#F4F5F6]">Candidature Coach</h3>
                  <p className="text-xs text-[#9EABA7]">
                    Tutte le candidature inviate dagli utenti tramite il flusso "Diventa Coach".
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#9EABA7]">
                    Totale: <strong className="text-[#F4F5F6]">{applications.length}</strong>
                  </span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
                <button
                  onClick={() => setAppStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    appStatusFilter === 'all'
                      ? 'bg-[#8EF5DC] text-[#080A0A]'
                      : 'bg-[#080A0A] text-[#9EABA7] hover:text-[#F4F5F6]'
                  }`}
                >
                  Tutte ({applications.length})
                </button>
                <button
                  onClick={() => setAppStatusFilter('submitted')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    appStatusFilter === 'submitted'
                      ? 'bg-amber-400 text-[#080A0A]'
                      : 'bg-[#080A0A] text-[#9EABA7] hover:text-[#F4F5F6]'
                  }`}
                >
                  In attesa ({pendingApps.length})
                </button>
                <button
                  onClick={() => setAppStatusFilter('approved')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    appStatusFilter === 'approved'
                      ? 'bg-[#8EF5DC] text-[#080A0A]'
                      : 'bg-[#080A0A] text-[#9EABA7] hover:text-[#F4F5F6]'
                  }`}
                >
                  Approvate ({applications.filter((a) => a.status === 'approved').length})
                </button>
                <button
                  onClick={() => setAppStatusFilter('rejected')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    appStatusFilter === 'rejected'
                      ? 'bg-red-400 text-[#080A0A]'
                      : 'bg-[#080A0A] text-[#9EABA7] hover:text-[#F4F5F6]'
                  }`}
                >
                  Rifiutate ({applications.filter((a) => a.status === 'rejected').length})
                </button>
              </div>

              {/* Applications List */}
              {(() => {
                const filtered = applications.filter((app) => {
                  if (appStatusFilter !== 'all' && app.status !== appStatusFilter) return false;
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-xs text-[#9EABA7]">
                      Nessuna candidatura corrispondente al filtro selezionato.
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {filtered.map((app) => (
                      <div
                        key={app.id}
                        className="rounded-2xl border border-white/10 bg-[#080A0A] p-5 space-y-3.5 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <h4 className="font-bold text-base text-[#F4F5F6]">{app.fullName}</h4>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  app.status === 'approved'
                                    ? 'bg-[#8EF5DC]/20 text-[#8EF5DC] border border-[#8EF5DC]/40'
                                    : app.status === 'rejected'
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                    : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                }`}
                              >
                                {app.status === 'approved'
                                  ? 'Approvato'
                                  : app.status === 'rejected'
                                  ? 'Rifiutato'
                                  : 'In attesa'}
                              </span>
                            </div>

                            <div className="text-xs text-[#9EABA7] mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                              <span className="text-[#F4F5F6] font-medium">{app.email}</span>
                              <span>•</span>
                              <span className="text-[#8EF5DC] font-semibold">{app.discipline}</span>
                              <span>•</span>
                              <span>{app.experienceYears || 0} anni di esperienza</span>
                            </div>
                          </div>

                          {/* Quick action buttons for pending applications */}
                          {app.status === 'submitted' && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleApproveApplication(app.id, app.applicantId, app.fullName)}
                                disabled={isProcessingAction}
                                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#8EF5DC] px-4 py-2 text-xs font-bold text-[#080A0A] hover:bg-[#7cebcfe8] active:scale-95 transition-all disabled:opacity-50"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Approva
                              </button>
                              <button
                                onClick={() =>
                                  setRejectModalApp({
                                    id: app.id,
                                    applicantId: app.applicantId,
                                    name: app.fullName,
                                  })
                                }
                                disabled={isProcessingAction}
                                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-300 hover:bg-red-500/20 active:scale-95 transition-all disabled:opacity-50"
                              >
                                <Ban className="h-3.5 w-3.5" />
                                Rifiuta
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Bio snippet */}
                        {app.bio && (
                          <div className="rounded-xl bg-[#111A1A] p-3.5 text-xs text-[#E1E8E6] border border-white/5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9EABA7] block mb-1">
                              Bio / Presentazione
                            </span>
                            <p className="leading-relaxed">{app.bio}</p>
                          </div>
                        )}

                        {/* Professional link */}
                        {app.profileLink && (
                          <div className="text-xs">
                            <a
                              href={app.profileLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-[#8EF5DC] hover:underline font-medium"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Link profilo professionale o certificazioni: {app.profileLink}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ========================================================== */}
          {/* 3. COACH TAB                                               */}
          {/* ========================================================== */}
          {activeTab === 'coaches' && (
            <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-[#F4F5F6]">Elenco Coach Ufficiali</h3>
                  <p className="text-xs text-[#9EABA7]">
                    Profili coach presenti su Firestore (coachProfiles). Puoi verificare, visualizzare e gestire la visibilità nel marketplace.
                  </p>
                </div>
                <div className="text-xs font-semibold text-[#8EF5DC]">
                  {approvedCoachesCount} coach verificati / attivi
                </div>
              </div>

              {coaches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coaches.map((c) => (
                    <div
                      key={c.coachId}
                      className="rounded-2xl border border-white/10 bg-[#080A0A] p-4 flex flex-col justify-between gap-3 transition-all hover:border-white/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm sm:text-base text-[#F4F5F6]">
                              {c.displayName}
                            </span>
                            {c.verificationStatus === 'approved' && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#8EF5DC]/20 px-2 py-0.5 text-[10px] font-bold text-[#8EF5DC]">
                                <Award className="h-3 w-3" />
                                Verificato
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#8EF5DC] font-semibold">{c.discipline}</div>
                          {c.headline && (
                            <div className="text-[11px] text-[#9EABA7] line-clamp-1">{c.headline}</div>
                          )}
                          <div className="text-[11px] text-[#9EABA7] mt-1">
                            Esperienza: <strong className="text-[#F4F5F6]">{c.experienceYears || 0} anni</strong> • Modalità: {(c.modalities || ['Online', 'In presenza']).join(', ')}
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            c.active
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-white/10 text-[#9EABA7] border border-white/10'
                          }`}
                        >
                          {c.active ? 'Attivo' : 'Sospeso'}
                        </span>
                      </div>

                      {/* Card actions: View Public Profile + Toggle Active */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
                        <button
                          onClick={() => handleToggleCoachActive(c)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            c.active
                              ? 'border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'
                              : 'border border-[#8EF5DC]/30 bg-[#8EF5DC]/10 text-[#8EF5DC] hover:bg-[#8EF5DC]/20'
                          }`}
                        >
                          {c.active ? 'Disattiva dal catalogo' : 'Riattiva nel catalogo'}
                        </button>

                        <button
                          onClick={() => navigate(`/coaches/${c.coachId}`)}
                          className="inline-flex min-h-[36px] items-center gap-1 text-xs text-[#8EF5DC] hover:underline font-semibold"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Vedi profilo pubblico
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-[#9EABA7]">
                  Nessun coach ancora presente. Approva una candidatura dalla scheda "Candidature Coach" per aggiungere il primo coach.
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* 4. UTENTI TAB                                              */}
          {/* ========================================================== */}
          {activeTab === 'users' && (
            <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-[#F4F5F6]">Utenti Registrati</h3>
                  <p className="text-xs text-[#9EABA7]">
                    Lista degli account autenticati nella collezione <code>users</code> di Firestore.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#8EF5DC]">
                  {users.length} account registrati
                </span>
              </div>

              {/* Role filter */}
              <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
                <button
                  onClick={() => setUserRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    userRoleFilter === 'all'
                      ? 'bg-[#8EF5DC] text-[#080A0A]'
                      : 'bg-[#080A0A] text-[#9EABA7] hover:text-[#F4F5F6]'
                  }`}
                >
                  Tutti ({users.length})
                </button>
                <button
                  onClick={() => setUserRoleFilter('athlete')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    userRoleFilter === 'athlete'
                      ? 'bg-[#8EF5DC] text-[#080A0A]'
                      : 'bg-[#080A0A] text-[#9EABA7] hover:text-[#F4F5F6]'
                  }`}
                >
                  Atleti ({users.filter((u) => (u.role || 'athlete') === 'athlete').length})
                </button>
                <button
                  onClick={() => setUserRoleFilter('coach')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    userRoleFilter === 'coach'
                      ? 'bg-[#8EF5DC] text-[#080A0A]'
                      : 'bg-[#080A0A] text-[#9EABA7] hover:text-[#F4F5F6]'
                  }`}
                >
                  Coach ({users.filter((u) => u.role === 'coach').length})
                </button>
                <button
                  onClick={() => setUserRoleFilter('admin')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    userRoleFilter === 'admin'
                      ? 'bg-[#8EF5DC] text-[#080A0A]'
                      : 'bg-[#080A0A] text-[#9EABA7] hover:text-[#F4F5F6]'
                  }`}
                >
                  Admin ({users.filter((u) => u.role === 'admin' || u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()).length})
                </button>
              </div>

              {/* Users list */}
              {(() => {
                const filteredUsers = users.filter((u) => {
                  const role = u.role || (u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'athlete');
                  if (userRoleFilter !== 'all' && role !== userRoleFilter) return false;
                  return true;
                });

                if (filteredUsers.length === 0) {
                  return (
                    <div className="py-12 text-center text-xs text-[#9EABA7]">
                      Nessun utente corrispondente al filtro.
                    </div>
                  );
                }

                return (
                  <div className="divide-y divide-white/5">
                    {filteredUsers.map((u) => {
                      const isSpecialAdmin = u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                      const roleDisplay = isSpecialAdmin ? 'admin' : u.role || 'athlete';
                      return (
                        <div
                          key={u.id || u.userId}
                          className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8EF5DC]/15 text-[#8EF5DC] font-bold text-xs uppercase">
                              {(u.displayName || u.email || 'U').slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-[#F4F5F6]">
                                {u.displayName || 'Utente senza nome'}
                              </div>
                              <div className="text-[#9EABA7] text-xs">{u.email}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-start sm:self-center">
                            <span
                              className={`rounded-full px-2.5 py-0.5 font-bold uppercase text-[10px] tracking-wider border ${
                                roleDisplay === 'admin'
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                  : roleDisplay === 'coach'
                                  ? 'bg-[#8EF5DC]/20 text-[#8EF5DC] border-[#8EF5DC]/30'
                                  : 'bg-white/5 text-[#9EABA7] border-white/10'
                              }`}
                            >
                              {roleDisplay}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ========================================================== */}
          {/* 5. PRENOTAZIONI TAB                                        */}
          {/* ========================================================== */}
          {activeTab === 'bookings' && (
            <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-[#F4F5F6]">Tutte le Prenotazioni</h3>
                  <p className="text-xs text-[#9EABA7]">
                    Panoramica globale delle prenotazioni effettuate dagli atleti su GROW UP.
                  </p>
                </div>
                <div className="text-xs font-semibold text-[#8EF5DC]">
                  {bookings.length} prenotazioni totali
                </div>
              </div>

              {/* Status filter */}
              <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
                <button
                  onClick={() => setBookingStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    bookingStatusFilter === 'all'
                      ? 'bg-[#8EF5DC] text-[#080A0A]'
                      : 'bg-[#080A0A] text-[#9EABA7] hover:text-[#F4F5F6]'
                  }`}
                >
                  Tutte ({bookings.length})
                </button>
                <button
                  onClick={() => setBookingStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    bookingStatusFilter === 'pending'
                      ? 'bg-amber-400 text-[#080A0A]'
                      : 'bg-[#080A0A] text-[#9EABA7] hover:text-[#F4F5F6]'
                  }`}
                >
                  In attesa ({bookings.filter((b) => b.status === 'pending').length})
                </button>
                <button
                  onClick={() => setBookingStatusFilter('confirmed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    bookingStatusFilter === 'confirmed'
                      ? 'bg-[#8EF5DC] text-[#080A0A]'
                      : 'bg-[#080A0A] text-[#9EABA7] hover:text-[#F4F5F6]'
                  }`}
                >
                  Confermate ({bookings.filter((b) => b.status === 'confirmed').length})
                </button>
                <button
                  onClick={() => setBookingStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    bookingStatusFilter === 'completed'
                      ? 'bg-emerald-400 text-[#080A0A]'
                      : 'bg-[#080A0A] text-[#9EABA7] hover:text-[#F4F5F6]'
                  }`}
                >
                  Completate ({bookings.filter((b) => b.status === 'completed').length})
                </button>
                <button
                  onClick={() => setBookingStatusFilter('cancelled')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    bookingStatusFilter === 'cancelled'
                      ? 'bg-red-400 text-[#080A0A]'
                      : 'bg-[#080A0A] text-[#9EABA7] hover:text-[#F4F5F6]'
                  }`}
                >
                  Annullate ({bookings.filter((b) => b.status === 'cancelled').length})
                </button>
              </div>

              {/* Bookings list */}
              {(() => {
                const filteredBookings = bookings.filter((b) => {
                  if (bookingStatusFilter !== 'all' && b.status !== bookingStatusFilter) return false;
                  return true;
                });

                if (filteredBookings.length === 0) {
                  return (
                    <div className="py-12 text-center text-xs text-[#9EABA7]">
                      Nessuna prenotazione con questo stato.
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filteredBookings.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-2xl border border-white/10 bg-[#080A0A] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#F4F5F6]">
                              Prenotazione #{b.id.slice(-6)}
                            </span>
                            <span className="rounded-full bg-[#8EF5DC]/15 text-[#8EF5DC] px-2 py-0.5 text-[10px] font-bold">
                              {b.status}
                            </span>
                            <span className="rounded-full bg-amber-400/15 text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                              payment: {b.paymentStatus}
                            </span>
                          </div>
                          <div className="text-[#9EABA7] text-xs">
                            Atleta: <span className="text-[#F4F5F6]">{b.athleteId}</span> • Coach: <span className="text-[#F4F5F6]">{b.coachId}</span>
                          </div>
                          <div className="text-[11px] text-[#9EABA7]">
                            Servizio ID: {b.serviceId} • Slot ID: {b.slotId}
                          </div>
                        </div>

                        {/* Admin actions on booking */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {b.status !== 'confirmed' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                              className="px-2.5 py-1.5 rounded-lg bg-[#8EF5DC]/15 text-[#8EF5DC] hover:bg-[#8EF5DC]/25 font-semibold text-[11px]"
                            >
                              Conferma
                            </button>
                          )}
                          {b.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 font-semibold text-[11px]"
                            >
                              Completa
                            </button>
                          )}
                          {b.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                              className="px-2.5 py-1.5 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25 font-semibold text-[11px]"
                            >
                              Annulla
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </section>
      </div>

      {/* REJECTION REASON MODAL */}
      {rejectModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F4F5F6]">Rifiuta Candidatura</h3>
              <button
                onClick={() => setRejectModalApp(null)}
                className="text-[#9EABA7] hover:text-[#F4F5F6]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[#9EABA7]">
              Stai per rifiutare la candidatura di <strong>{rejectModalApp.name}</strong>. Puoi indicare una motivazione o nota interna opzionale.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Motivazione (es. Documentazione non sufficiente, profilo non allineato...)"
              className="w-full rounded-xl border border-white/10 bg-[#080A0A] p-3 text-xs text-[#F4F5F6] focus:border-red-400 focus:outline-none resize-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalApp(null)}
                disabled={isProcessingAction}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9EABA7] hover:text-[#F4F5F6]"
              >
                Annulla
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isProcessingAction}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isProcessingAction ? 'In corso...' : 'Conferma Rifiuto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

interface AdminSidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeHighlight?: boolean;
  active: boolean;
  onClick: () => void;
}

const AdminSidebarButton: React.FC<AdminSidebarButtonProps> = ({
  icon,
  label,
  sublabel,
  badge,
  badgeHighlight,
  active,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between min-h-[48px] px-3.5 py-2.5 rounded-2xl text-xs transition-all ${
        active
          ? 'bg-[#8EF5DC] text-[#080A0A] font-bold shadow-md shadow-[#8EF5DC]/10'
          : 'text-[#9EABA7] hover:text-[#F4F5F6] hover:bg-white/5 font-semibold'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={active ? 'text-[#080A0A]' : 'text-[#8EF5DC]'}>{icon}</div>
        <div className="text-left">
          <div className="leading-snug">{label}</div>
          {sublabel && (
            <div
              className={`text-[10px] font-normal leading-none mt-0.5 ${
                active ? 'text-[#080A0A]/80' : 'text-[#9EABA7]/80'
              }`}
            >
              {sublabel}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {badge && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
              badgeHighlight
                ? active
                  ? 'bg-[#080A0A] text-[#8EF5DC]'
                  : 'bg-amber-400 text-[#080A0A]'
                : active
                ? 'bg-[#080A0A]/20 text-[#080A0A]'
                : 'bg-white/10 text-[#9EABA7]'
            }`}
          >
            {badge}
          </span>
        )}
        <ChevronRight className={`h-3.5 w-3.5 ${active ? 'text-[#080A0A]' : 'opacity-40'}`} />
      </div>
    </button>
  );
};

interface AdminLiveStatCardProps {
  label: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  highlight?: boolean;
  onClick?: () => void;
  actionLabel?: string;
}

const AdminLiveStatCard: React.FC<AdminLiveStatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  highlight,
  onClick,
  actionLabel,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative rounded-3xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
        highlight
          ? 'border-[#8EF5DC]/60 bg-[#8EF5DC]/10 hover:border-[#8EF5DC] shadow-lg shadow-[#8EF5DC]/5'
          : 'border-white/10 bg-[#080A0A] hover:border-white/20'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xs font-semibold ${
              highlight ? 'text-[#8EF5DC]' : 'text-[#9EABA7]'
            }`}
          >
            {label}
          </span>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              highlight
                ? 'bg-[#8EF5DC]/20 text-[#8EF5DC]'
                : 'bg-white/5 text-[#9EABA7] group-hover:text-[#F4F5F6]'
            }`}
          >
            {icon}
          </div>
        </div>

        <div
          className={`text-3xl font-extrabold tracking-tight ${
            highlight ? 'text-[#8EF5DC]' : 'text-[#F4F5F6]'
          }`}
        >
          {value}
        </div>

        <p className="text-[11px] text-[#9EABA7] mt-1 line-clamp-2 leading-tight">
          {subtitle}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold text-[#8EF5DC]">
        <span>{actionLabel || 'Visualizza'}</span>
        <ChevronRight className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};
