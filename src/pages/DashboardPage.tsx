import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarCheck,
  ShieldCheck,
  User,
  Plus,
  Trash2,
  Check,
  Ban,
  Clock,
  ExternalLink,
  Loader2,
  Calendar,
  Sparkles,
  Euro,
  Settings,
  ChevronRight,
  Menu,
  X,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import {
  listAllCoachApplications,
  listPendingCoachApplications,
  reviewCoachApplication,
  listAllCoachProfiles,
  listAllUsers,
  listAllBookings,
  listMyBookings,
  getCoachProfile,
  saveCoachProfile,
  listAllCoachServicesForCoach,
  createCoachService,
  deleteCoachService,
  updateCoachService,
  listAllSlotsForCoach,
  createAvailabilitySlot,
  deleteAvailabilitySlot,
  updateBookingStatus,
  updateUserProfile,
  listApprovedCoaches,
} from '../firebase';
import {
  CoachApplicationEntity,
  CoachProfileEntity,
  CoachServiceEntity,
  CoachAvailabilityEntity,
  BookingEntity,
  DISCIPLINES,
  GOALS,
  LEVELS,
  MODALITIES,
} from '../types';
import { AdminDashboardView } from '../components/AdminDashboardView';

export const DashboardPage: React.FC = () => {
  const { currentUser, profile, isAdmin, isCoach, effectiveRole } = useAuth();
  const { params, navigate, openLoginModal } = useNavigation();

  // Active tab state
  const defaultTab = params.tab || 'overview';
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Synchronize when route param changes
  useEffect(() => {
    if (params.tab) {
      setActiveTab(params.tab);
    }
  }, [params.tab]);

  // If not logged in
  if (!currentUser) {
    if (params.view === 'admin') {
      return (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8EF5DC]/10 text-[#8EF5DC] mb-4">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-[#F4F5F6]">GROW UP Admin - Accesso Riservato</h1>
          <p className="mt-2 text-sm text-[#9EABA7]">
            Il pannello amministrativo è riservato all'account di gestione <strong>growupyourlimits@gmail.com</strong>.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={openLoginModal}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#8EF5DC] px-6 py-2.5 text-xs font-bold text-[#080A0A] hover:bg-[#7cebcfe8]"
            >
              Accedi come Admin
            </button>
            <button
              onClick={() => navigate('/dashboard?view=admin&preview=true')}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-white/10 bg-[#111A1A] px-5 py-2.5 text-xs font-semibold text-[#F4F5F6] hover:bg-white/5"
            >
              Anteprima interfaccia Admin
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8EF5DC]/10 text-[#8EF5DC] mb-4">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-[#F4F5F6]">Accesso all'Area Riservata</h1>
        <p className="mt-2 text-sm text-[#9EABA7]">
          Per visualizzare la tua dashboard, le prenotazioni o il pannello di gestione è necessario
          accedere con Google.
        </p>
        <button
          onClick={openLoginModal}
          className="mt-6 inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#8EF5DC] px-6 py-2.5 text-xs font-bold text-[#080A0A] hover:bg-[#7cebcfe8]"
        >
          Accedi con Google
        </button>
      </div>
    );
  }

  // Dedicated layout for Admin
  if (effectiveRole === 'admin' || isAdmin || params.view === 'admin') {
    return (
      <div className="min-h-[calc(100vh-80px)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdminDashboardView initialTab={params.tab || 'overview'} />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner with Role */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#8EF5DC]">
              AREA RISERVATA
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#8EF5DC]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#8EF5DC] border border-[#8EF5DC]/30">
              {effectiveRole === 'admin'
                ? 'Amministratore'
                : effectiveRole === 'coach'
                ? 'Coach Verificato'
                : 'Atleta'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F5F6] mt-1">
            {effectiveRole === 'admin'
              ? 'GROW UP Admin'
              : effectiveRole === 'coach'
              ? 'Dashboard Coach'
              : 'Dashboard Atleta'}
          </h1>
          <p className="text-xs sm:text-sm text-[#9EABA7] mt-0.5">{currentUser.email}</p>
        </div>

        {/* Mobile sidebar toggle button */}
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="lg:hidden inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/10 bg-[#111A1A] px-4 py-2 text-xs font-semibold text-[#F4F5F6] self-start"
        >
          <Menu className="h-4 w-4 text-[#8EF5DC]" />
          <span>Menu Dashboard</span>
        </button>
      </div>

      {/* Application Layout: Sidebar + Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ============================================================ */}
        {/* SIDEBAR NAVIGATION                                           */}
        {/* ============================================================ */}
        <div
          className={`lg:block ${
            mobileSidebarOpen ? 'block' : 'hidden'
          } rounded-3xl border border-white/10 bg-[#111A1A] p-4 lg:p-5 h-fit space-y-1.5`}
        >
          {effectiveRole === 'admin' && (
            <>
              <SidebarItem
                icon={<LayoutDashboard className="h-4 w-4" />}
                label="Panoramica"
                active={activeTab === 'overview'}
                onClick={() => {
                  setActiveTab('overview');
                  setMobileSidebarOpen(false);
                }}
              />
              <SidebarItem
                icon={<FileText className="h-4 w-4" />}
                label="Candidature Coach"
                active={activeTab === 'applications'}
                onClick={() => {
                  setActiveTab('applications');
                  setMobileSidebarOpen(false);
                }}
              />
              <SidebarItem
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Coach"
                active={activeTab === 'coaches'}
                onClick={() => {
                  setActiveTab('coaches');
                  setMobileSidebarOpen(false);
                }}
              />
              <SidebarItem
                icon={<Users className="h-4 w-4" />}
                label="Utenti"
                active={activeTab === 'users'}
                onClick={() => {
                  setActiveTab('users');
                  setMobileSidebarOpen(false);
                }}
              />
              <SidebarItem
                icon={<CalendarCheck className="h-4 w-4" />}
                label="Prenotazioni"
                active={activeTab === 'bookings'}
                onClick={() => {
                  setActiveTab('bookings');
                  setMobileSidebarOpen(false);
                }}
              />
            </>
          )}

          {effectiveRole === 'coach' && (
            <>
              <SidebarItem
                icon={<LayoutDashboard className="h-4 w-4" />}
                label="Panoramica"
                active={activeTab === 'overview'}
                onClick={() => {
                  setActiveTab('overview');
                  setMobileSidebarOpen(false);
                }}
              />
              <SidebarItem
                icon={<User className="h-4 w-4" />}
                label="Profilo Pubblico"
                active={activeTab === 'profile'}
                onClick={() => {
                  setActiveTab('profile');
                  setMobileSidebarOpen(false);
                }}
              />
              <SidebarItem
                icon={<Euro className="h-4 w-4" />}
                label="Servizi & Tariffe"
                active={activeTab === 'services'}
                onClick={() => {
                  setActiveTab('services');
                  setMobileSidebarOpen(false);
                }}
              />
              <SidebarItem
                icon={<Calendar className="h-4 w-4" />}
                label="Disponibilità & Slot"
                active={activeTab === 'availability'}
                onClick={() => {
                  setActiveTab('availability');
                  setMobileSidebarOpen(false);
                }}
              />
              <SidebarItem
                icon={<CalendarCheck className="h-4 w-4" />}
                label="Prenotazioni"
                active={activeTab === 'bookings'}
                onClick={() => {
                  setActiveTab('bookings');
                  setMobileSidebarOpen(false);
                }}
              />
            </>
          )}

          {effectiveRole === 'athlete' && (
            <>
              <SidebarItem
                icon={<LayoutDashboard className="h-4 w-4" />}
                label="Panoramica"
                active={activeTab === 'overview'}
                onClick={() => {
                  setActiveTab('overview');
                  setMobileSidebarOpen(false);
                }}
              />
              <SidebarItem
                icon={<CalendarCheck className="h-4 w-4" />}
                label="Le mie Prenotazioni"
                active={activeTab === 'bookings'}
                onClick={() => {
                  setActiveTab('bookings');
                  setMobileSidebarOpen(false);
                }}
              />
              <SidebarItem
                icon={<Sparkles className="h-4 w-4" />}
                label="Coach Consigliati"
                active={activeTab === 'recommended'}
                onClick={() => {
                  setActiveTab('recommended');
                  setMobileSidebarOpen(false);
                }}
              />
              <SidebarItem
                icon={<Settings className="h-4 w-4" />}
                label="Preferenze & Profilo"
                active={activeTab === 'profile'}
                onClick={() => {
                  setActiveTab('profile');
                  setMobileSidebarOpen(false);
                }}
              />
            </>
          )}
        </div>

        {/* ============================================================ */}
        {/* CONTENT AREA                                                 */}
        {/* ============================================================ */}
        <div className="lg:col-span-3">
          {effectiveRole === 'admin' && <AdminDashboardContent activeTab={activeTab} />}
          {effectiveRole === 'coach' && <CoachDashboardContent activeTab={activeTab} />}
          {effectiveRole === 'athlete' && <AthleteDashboardContent activeTab={activeTab} />}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SIDEBAR ITEM HELPER
// ============================================================================
const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between min-h-[44px] px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
        active
          ? 'bg-[#8EF5DC] text-[#080A0A]'
          : 'text-[#9EABA7] hover:text-[#F4F5F6] hover:bg-white/5'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {icon}
        <span>{label}</span>
      </div>
      <ChevronRight className={`h-3.5 w-3.5 ${active ? 'text-[#080A0A]' : 'opacity-30'}`} />
    </button>
  );
};

// ============================================================================
// 1. ADMIN DASHBOARD CONTENT
// ============================================================================
const AdminDashboardContent: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { navigate } = useNavigation();
  const [applications, setApplications] = useState<CoachApplicationEntity[]>([]);
  const [coaches, setCoaches] = useState<CoachProfileEntity[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<BookingEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsData, coachesData, usersData, bookingsData] = await Promise.all([
        listAllCoachApplications(),
        listAllCoachProfiles(),
        listAllUsers(),
        listAllBookings(),
      ]);
      setApplications(appsData);
      setCoaches(coachesData);
      setUsers(usersData);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (appId: string, applicantId: string, approve: boolean) => {
    try {
      await reviewCoachApplication(appId, applicantId, approve);
      setActionMsg(
        approve ? 'Candidatura approvata! Coach abilitato.' : 'Candidatura rifiutata.'
      );
      await loadData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Errore durante la revisione');
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-12 text-center text-sm text-[#9EABA7]">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#8EF5DC] mb-2" />
        Caricamento dati amministrativi da Firestore...
      </div>
    );
  }

  const pendingApps = applications.filter((a) => a.status === 'submitted');

  return (
    <div className="space-y-6">
      {actionMsg && (
        <div className="rounded-2xl border border-[#8EF5DC]/40 bg-[#8EF5DC]/10 p-4 text-xs font-semibold text-[#8EF5DC] flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-[#8EF5DC] hover:underline">
            Chiudi
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Candidature in attesa"
              value={pendingApps.length}
              highlight={pendingApps.length > 0}
            />
            <StatCard label="Coach approvati" value={coaches.length} />
            <StatCard label="Utenti registrati" value={users.length} />
            <StatCard label="Prenotazioni totali" value={bookings.length} />
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#F4F5F6]">
                Candidature recenti da verificare
              </h3>
              <span className="text-xs text-[#9EABA7]">{pendingApps.length} in attesa</span>
            </div>

            {pendingApps.length > 0 ? (
              <div className="space-y-3">
                {pendingApps.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="rounded-2xl border border-white/10 bg-[#080A0A] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-bold text-sm text-[#F4F5F6]">{app.fullName}</div>
                      <div className="text-xs text-[#9EABA7]">
                        {app.email} • {app.discipline} • {app.experienceYears || 0} anni exp
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReview(app.id, app.applicantId, true)}
                        className="inline-flex min-h-[38px] items-center gap-1 rounded-xl bg-[#8EF5DC] px-3.5 py-1.5 text-xs font-bold text-[#080A0A]"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approva
                      </button>
                      <button
                        onClick={() => handleReview(app.id, app.applicantId, false)}
                        className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-xs font-bold text-red-300"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        Rifiuta
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#9EABA7] py-4 text-center">
                Nessuna candidatura in attesa.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CANDIDATURE */}
      {activeTab === 'applications' && (
        <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#F4F5F6]">Candidature Coach</h3>
            <span className="text-xs text-[#9EABA7]">{applications.length} totali</span>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-2xl border border-white/10 bg-[#080A0A] p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-[#F4F5F6]">{app.fullName}</h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            app.status === 'approved'
                              ? 'bg-[#8EF5DC]/20 text-[#8EF5DC]'
                              : app.status === 'rejected'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-amber-400/20 text-amber-300'
                          }`}
                        >
                          {app.status === 'approved'
                            ? 'Approvato'
                            : app.status === 'rejected'
                            ? 'Rifiutato'
                            : 'In attesa'}
                        </span>
                      </div>
                      <div className="text-xs text-[#9EABA7] mt-0.5">
                        {app.email} • {app.discipline} • {app.experienceYears || 0} anni exp
                      </div>
                    </div>

                    {app.status === 'submitted' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleReview(app.id, app.applicantId, true)}
                          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#8EF5DC] px-4 py-2 text-xs font-bold text-[#080A0A]"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approva Coach
                        </button>
                        <button
                          onClick={() => handleReview(app.id, app.applicantId, false)}
                          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-300"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Rifiuta
                        </button>
                      </div>
                    )}
                  </div>

                  {app.bio && (
                    <p className="text-xs text-[#E1E8E6] bg-[#111A1A] p-3 rounded-xl">
                      {app.bio}
                    </p>
                  )}

                  {app.profileLink && (
                    <div className="text-xs">
                      <a
                        href={app.profileLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#8EF5DC] hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Vedi profilo professionale / link esterno
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-[#9EABA7]">
              Nessuna candidatura presente in archivio.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COACH LIST */}
      {activeTab === 'coaches' && (
        <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#F4F5F6]">Elenco Coach Ufficiali</h3>
            <span className="text-xs text-[#9EABA7]">{coaches.length} coach abilitati</span>
          </div>

          {coaches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coaches.map((c) => (
                <div
                  key={c.coachId}
                  className="rounded-2xl border border-white/10 bg-[#080A0A] p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-sm text-[#F4F5F6]">{c.displayName}</div>
                    <div className="text-xs text-[#8EF5DC]">{c.discipline}</div>
                    <div className="text-[11px] text-[#9EABA7] mt-1">
                      Stato: {c.active ? 'Attivo nel catalogo' : 'Disattivato'}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/coaches/${c.coachId}`)}
                    className="inline-flex min-h-[36px] items-center gap-1 text-xs text-[#8EF5DC] hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Vedi profilo
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-[#9EABA7]">
              Nessun coach ancora approvato. Le candidature approvate compariranno qui.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: USERS LIST */}
      {activeTab === 'users' && (
        <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#F4F5F6]">Utenti Registrati</h3>
            <span className="text-xs text-[#9EABA7]">{users.length} account</span>
          </div>

          <div className="divide-y divide-white/5">
            {users.map((u) => (
              <div key={u.id || u.userId} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-[#F4F5F6]">
                    {u.displayName || 'Utente senza nome'}
                  </div>
                  <div className="text-[#9EABA7]">{u.email}</div>
                </div>
                <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-bold uppercase text-[10px] text-[#8EF5DC] border border-white/10">
                  {u.role || 'athlete'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BOOKINGS LIST */}
      {activeTab === 'bookings' && (
        <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#F4F5F6]">Tutte le Prenotazioni</h3>
            <span className="text-xs text-[#9EABA7]">{bookings.length} prenotazioni</span>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl border border-white/10 bg-[#080A0A] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-sm text-[#F4F5F6]">
                      Prenotazione #{b.id.slice(-6)}
                    </div>
                    <div className="text-[#9EABA7] mt-0.5">
                      Atleta: <span className="text-[#F4F5F6]">{b.athleteId}</span> • Coach:{' '}
                      <span className="text-[#F4F5F6]">{b.coachId}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#8EF5DC]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#8EF5DC]">
                      {b.status}
                    </span>
                    <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                      {b.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-[#9EABA7]">
              Nessuna prenotazione effettuata finora.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. COACH DASHBOARD CONTENT
// ============================================================================
const CoachDashboardContent: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState<CoachProfileEntity | null>(null);
  const [services, setServices] = useState<CoachServiceEntity[]>([]);
  const [slots, setSlots] = useState<CoachAvailabilityEntity[]>([]);
  const [bookings, setBookings] = useState<BookingEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Profile form state
  const [headline, setHeadline] = useState('');
  const [discipline, setDiscipline] = useState(DISCIPLINES[0]);
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState(2);
  const [tagsStr, setTagsStr] = useState('');

  // Service form state
  const [svcTitle, setSvcTitle] = useState('');
  const [svcDesc, setSvcDesc] = useState('');
  const [svcDuration, setSvcDuration] = useState(60);
  const [svcPrice, setSvcPrice] = useState(50);
  const [svcType, setSvcType] = useState<'single_session' | 'package' | 'subscription'>(
    'single_session'
  );

  // Slot form state
  const [slotStart, setSlotStart] = useState('');
  const [slotEnd, setSlotEnd] = useState('');

  const loadCoachData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [p, s, a, b] = await Promise.all([
        getCoachProfile(currentUser.uid),
        listAllCoachServicesForCoach(currentUser.uid),
        listAllSlotsForCoach(currentUser.uid),
        listMyBookings(currentUser.uid, 'coach'),
      ]);

      if (p) {
        setProfileData(p);
        setHeadline(p.headline || '');
        setDiscipline(p.discipline || DISCIPLINES[0]);
        setBio(p.bio || '');
        setExperienceYears(p.experienceYears || 2);
        setTagsStr((p.tags || []).join(', '));
      }

      setServices(s);
      setSlots(a);
      setBookings(b);
    } catch (err) {
      console.error('Error loading coach dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoachData();
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const tags = tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await saveCoachProfile({
        displayName: profileData?.displayName || currentUser.displayName || 'Coach GROW UP',
        headline,
        discipline,
        bio,
        experienceYears,
        tags,
        specialties: tags,
      });
      setMessage('Profilo pubblico aggiornato con successo.');
      await loadCoachData();
    } catch (err: any) {
      alert(err.message || 'Errore salvataggio profilo');
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCoachService({
        title: svcTitle,
        description: svcDesc,
        durationMinutes: svcDuration,
        priceCents: Math.round(svcPrice * 100),
        type: svcType,
      });
      setSvcTitle('');
      setSvcDesc('');
      setMessage('Servizio aggiunto.');
      await loadCoachData();
    } catch (err: any) {
      alert(err.message || 'Errore creazione servizio');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Eliminare questo servizio?')) return;
    try {
      await deleteCoachService(serviceId);
      setMessage('Servizio eliminato.');
      await loadCoachData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotStart || !slotEnd) return;
    try {
      const start = new Date(slotStart);
      const end = new Date(slotEnd);
      await createAvailabilitySlot(start, end);
      setSlotStart('');
      setSlotEnd('');
      setMessage('Disponibilità oraria aggiunta.');
      await loadCoachData();
    } catch (err: any) {
      alert(err.message || 'Errore creazione disponibilità');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await deleteAvailabilitySlot(slotId);
      setMessage('Slot eliminato.');
      await loadCoachData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-12 text-center text-sm text-[#9EABA7]">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#8EF5DC] mb-2" />
        Caricamento dati Coach da Firestore...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-2xl border border-[#8EF5DC]/40 bg-[#8EF5DC]/10 p-4 text-xs font-semibold text-[#8EF5DC] flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-[#8EF5DC] hover:underline">
            Chiudi
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Servizi attivi" value={services.length} />
            <StatCard label="Slot disponibili" value={slots.filter((s) => s.status === 'available').length} />
            <StatCard label="Prenotazioni ricevute" value={bookings.length} />
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4">
            <h3 className="font-bold text-base text-[#F4F5F6]">Stato del tuo profilo</h3>
            <div className="text-xs text-[#9EABA7] space-y-1">
              <div>
                Nome pubblico:{' '}
                <strong className="text-[#F4F5F6]">
                  {profileData?.displayName || currentUser?.displayName}
                </strong>
              </div>
              <div>
                Disciplina principale:{' '}
                <strong className="text-[#8EF5DC]">{profileData?.discipline}</strong>
              </div>
              <div>
                Badge:{' '}
                <span className="text-[#8EF5DC] font-semibold">Verificato GROW UP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFILO PUBBLICO */}
      {activeTab === 'profile' && (
        <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#F4F5F6]">Modifica Profilo Pubblico</h3>
            <p className="text-xs text-[#9EABA7] mt-0.5">
              Aggiorna la tua bio, headline e discipline visibili agli atleti nel marketplace.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#9EABA7] mb-1.5">
                Headline / Sottotitolo
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="es. Specialista running e mezze maratone"
                className="w-full rounded-xl border border-white/10 bg-[#080A0A] p-3 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#9EABA7] mb-1.5">
                  Disciplina Principale
                </label>
                <select
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080A0A] p-3 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
                >
                  {DISCIPLINES.map((d) => (
                    <option key={d} value={d} className="bg-[#111A1A]">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#9EABA7] mb-1.5">
                  Anni di esperienza
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#080A0A] p-3 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#9EABA7] mb-1.5">
                Tag e specializzazioni (separati da virgola)
              </label>
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="es. Corsa, Mobilità, Principianti, Maratona"
                className="w-full rounded-xl border border-white/10 bg-[#080A0A] p-3 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#9EABA7] mb-1.5">Bio Professionale</label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Racconta la tua storia sportiva, il tuo approccio metodologico e a chi ti rivolgi."
                className="w-full rounded-xl border border-white/10 bg-[#080A0A] p-3 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#8EF5DC] px-6 py-2.5 text-xs font-bold text-[#080A0A] hover:bg-[#7cebcfe8]"
            >
              Salva modifiche profilo
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: SERVIZI */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          {/* Create Service */}
          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4">
            <h3 className="font-bold text-base text-[#F4F5F6]">Crea un nuovo servizio</h3>
            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  type="text"
                  value={svcTitle}
                  onChange={(e) => setSvcTitle(e.target.value)}
                  placeholder="Titolo servizio (es. Sessione 1-to-1 Corsa)"
                  className="rounded-xl border border-white/10 bg-[#080A0A] p-3 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
                />
                <input
                  type="text"
                  value={svcDesc}
                  onChange={(e) => setSvcDesc(e.target.value)}
                  placeholder="Descrizione breve"
                  className="rounded-xl border border-white/10 bg-[#080A0A] p-3 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <select
                  value={svcType}
                  onChange={(e: any) => setSvcType(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#080A0A] p-3 text-xs text-[#F4F5F6]"
                >
                  <option value="single_session">Sessione singola</option>
                  <option value="package">Pacchetto</option>
                  <option value="subscription">Abbonamento</option>
                </select>

                <input
                  type="number"
                  min={15}
                  max={240}
                  value={svcDuration}
                  onChange={(e) => setSvcDuration(Number(e.target.value))}
                  placeholder="Minuti (es. 60)"
                  className="rounded-xl border border-white/10 bg-[#080A0A] p-3 text-xs text-[#F4F5F6]"
                />

                <input
                  type="number"
                  min={0}
                  value={svcPrice}
                  onChange={(e) => setSvcPrice(Number(e.target.value))}
                  placeholder="Prezzo indicativo (€)"
                  className="rounded-xl border border-white/10 bg-[#080A0A] p-3 text-xs text-[#F4F5F6]"
                />
              </div>

              <button
                type="submit"
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#8EF5DC] px-5 py-2 text-xs font-bold text-[#080A0A]"
              >
                <Plus className="h-4 w-4" />
                Aggiungi servizio
              </button>
            </form>
          </div>

          {/* Services List */}
          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4">
            <h3 className="font-bold text-base text-[#F4F5F6]">I tuoi servizi pubblicati</h3>
            {services.length > 0 ? (
              <div className="space-y-3">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="rounded-2xl border border-white/10 bg-[#080A0A] p-4 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-sm text-[#F4F5F6]">{svc.title}</div>
                      <div className="text-[#9EABA7]">
                        {svc.durationMinutes} min • €{(svc.priceCents / 100).toFixed(0)} •{' '}
                        {svc.description || 'Nessuna descrizione'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteService(svc.id)}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#9EABA7]">
                Non hai ancora creato servizi. Aggiungine uno sopra.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DISPONIBILITÀ */}
      {activeTab === 'availability' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4">
            <h3 className="font-bold text-base text-[#F4F5F6]">Aggiungi disponibilità oraria</h3>
            <form onSubmit={handleCreateSlot} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#9EABA7] mb-1">Inizio slot</label>
                  <input
                    required
                    type="datetime-local"
                    value={slotStart}
                    onChange={(e) => setSlotStart(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#080A0A] p-3 text-xs text-[#F4F5F6]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#9EABA7] mb-1">Fine slot</label>
                  <input
                    required
                    type="datetime-local"
                    value={slotEnd}
                    onChange={(e) => setSlotEnd(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#080A0A] p-3 text-xs text-[#F4F5F6]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#8EF5DC] px-5 py-2 text-xs font-bold text-[#080A0A]"
              >
                <Plus className="h-4 w-4" />
                Crea slot orario
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4">
            <h3 className="font-bold text-base text-[#F4F5F6]">I tuoi slot</h3>
            {slots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {slots.map((s: any) => {
                  const d = s.startAt?.toDate ? s.startAt.toDate() : new Date(s.startAt);
                  return (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-white/10 bg-[#080A0A] p-3.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#F4F5F6]">
                          {d.toLocaleDateString('it-IT', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div
                          className={`text-[10px] font-semibold mt-0.5 ${
                            s.status === 'available' ? 'text-[#8EF5DC]' : 'text-amber-400'
                          }`}
                        >
                          {s.status === 'available' ? 'Disponibile' : 'Riservato'}
                        </div>
                      </div>
                      {s.status === 'available' && (
                        <button
                          onClick={() => handleDeleteSlot(s.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#9EABA7]">
                Nessuno slot configurato.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: PRENOTAZIONI */}
      {activeTab === 'bookings' && (
        <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4">
          <h3 className="font-bold text-base text-[#F4F5F6]">Prenotazioni ricevute</h3>
          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl border border-white/10 bg-[#080A0A] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-sm text-[#F4F5F6]">
                      Prenotazione #{b.id.slice(-6)}
                    </div>
                    <div className="text-[#9EABA7] mt-0.5">
                      Atleta: {b.athleteId} • Stato: {b.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#8EF5DC]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#8EF5DC]">
                      {b.status}
                    </span>
                    <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                      {b.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-[#9EABA7]">
              Non hai ancora ricevuto prenotazioni.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. ATHLETE DASHBOARD CONTENT
// ============================================================================
const AthleteDashboardContent: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { currentUser, profile } = useAuth();
  const { navigate, openQuestionnaire } = useNavigation();
  const [bookings, setBookings] = useState<BookingEntity[]>([]);
  const [recommendedCoaches, setRecommendedCoaches] = useState<CoachProfileEntity[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile preferences
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [prefDiscipline, setPrefDiscipline] = useState('');
  const [prefGoal, setPrefGoal] = useState('');
  const [prefLevel, setPrefLevel] = useState('');
  const [prefModality, setPrefModality] = useState('');
  const [prefMsg, setPrefMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    Promise.all([
      listMyBookings(currentUser.uid, 'athlete'),
      listApprovedCoaches(),
    ])
      .then(([b, c]) => {
        setBookings(b);
        setRecommendedCoaches(c.slice(0, 3));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [currentUser]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await updateUserProfile(currentUser.uid, {
        displayName,
        preferences: {
          discipline: prefDiscipline,
          goal: prefGoal,
          level: prefLevel,
          modality: prefModality,
        },
      });
      setPrefMsg('Preferenze aggiornate.');
    } catch (err: any) {
      alert(err.message || 'Errore');
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-12 text-center text-sm text-[#9EABA7]">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#8EF5DC] mb-2" />
        Caricamento prenotazioni da Firestore...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Welcome Card */}
          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#F4F5F6]">
              Benvenuto, {currentUser.displayName || 'Atleta'}!
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#9EABA7]">
              Qui puoi consultare lo stato delle tue sessioni prenotate e scoprire nuovi coach in
              linea con i tuoi obiettivi.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/coaches')}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[#8EF5DC] px-5 py-2 text-xs font-bold text-[#080A0A]"
              >
                Esplora Coach
              </button>
              <button
                onClick={openQuestionnaire}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-white/10 px-5 py-2 text-xs font-semibold text-[#F4F5F6]"
              >
                Rifai il Questionario
              </button>
            </div>
          </div>

          {/* Bookings preview */}
          <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4">
            <h3 className="font-bold text-base text-[#F4F5F6]">Le tue sessioni in programma</h3>
            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-white/10 bg-[#080A0A] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-sm text-[#F4F5F6]">
                        Prenotazione #{b.id.slice(-6)}
                      </div>
                      <div className="text-[#9EABA7] mt-0.5">
                        Coach ID: {b.coachId} • Slot: {b.slotId}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#8EF5DC]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#8EF5DC]">
                        {b.status}
                      </span>
                      <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                        {b.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#9EABA7]">
                Non hai ancora effettuato prenotazioni.{' '}
                <button onClick={() => navigate('/coaches')} className="text-[#8EF5DC] hover:underline">
                  Trova un coach e prenota una sessione.
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRENOTAZIONI */}
      {activeTab === 'bookings' && (
        <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#F4F5F6]">Tutte le mie Prenotazioni</h3>
            <span className="text-xs text-[#9EABA7]">{bookings.length} prenotazioni</span>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl border border-white/10 bg-[#080A0A] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="font-bold text-base text-[#F4F5F6]">
                      Sessione #{b.id.slice(-6)}
                    </div>
                    <div className="text-[#9EABA7] mt-1">
                      Identificativo Coach: {b.coachId}
                    </div>
                    <div className="text-[#65716f] mt-0.5">
                      Stato pagamento: <strong className="text-amber-300">{b.paymentStatus}</strong> (pagamento diretto con il coach)
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#8EF5DC]/10 px-3 py-1 text-xs font-bold text-[#8EF5DC] border border-[#8EF5DC]/20">
                      Stato: {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-[#9EABA7]">
              Non hai ancora prenotazioni attive.{' '}
              <button onClick={() => navigate('/coaches')} className="text-[#8EF5DC] hover:underline">
                Esplora il catalogo coach
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COACH CONSIGLIATI */}
      {activeTab === 'recommended' && (
        <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 space-y-4">
          <h3 className="font-bold text-lg text-[#F4F5F6]">Coach Verificati Suggeriti</h3>
          {recommendedCoaches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedCoaches.map((c) => (
                <div
                  key={c.coachId}
                  className="rounded-2xl border border-white/10 bg-[#080A0A] p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="font-bold text-sm text-[#F4F5F6]">{c.displayName}</div>
                    <div className="text-xs text-[#8EF5DC] mt-0.5">{c.discipline}</div>
                    <p className="text-xs text-[#9EABA7] mt-2 line-clamp-2">{c.bio}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => navigate(`/coaches/${c.coachId}`)}
                      className="text-xs font-bold text-[#8EF5DC] hover:underline"
                    >
                      Visualizza profilo →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[#9EABA7]">
              Nessun coach trovato.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PREFERENZE & PROFILO */}
      {activeTab === 'profile' && (
        <div className="rounded-3xl border border-white/10 bg-[#111A1A] p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#F4F5F6]">Il tuo Profilo Atleta</h3>
            <p className="text-xs text-[#9EABA7] mt-0.5">
              Imposta le tue preferenze per ricevere match sempre più accurati.
            </p>
          </div>

          {prefMsg && (
            <div className="rounded-xl border border-[#8EF5DC]/40 bg-[#8EF5DC]/10 p-3 text-xs text-[#8EF5DC]">
              {prefMsg}
            </div>
          )}

          <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#9EABA7] mb-1.5">
                Nome visualizzato
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#080A0A] p-3 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#9EABA7] mb-1.5">
                  Disciplina preferita
                </label>
                <select
                  value={prefDiscipline}
                  onChange={(e) => setPrefDiscipline(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080A0A] p-3 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
                >
                  <option value="" className="bg-[#111A1A]">Seleziona disciplina</option>
                  {DISCIPLINES.map((d) => (
                    <option key={d} value={d} className="bg-[#111A1A]">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#9EABA7] mb-1.5">
                  Obiettivo primario
                </label>
                <select
                  value={prefGoal}
                  onChange={(e) => setPrefGoal(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080A0A] p-3 text-sm text-[#F4F5F6] focus:border-[#8EF5DC] focus:outline-none"
                >
                  <option value="" className="bg-[#111A1A]">Seleziona obiettivo</option>
                  {GOALS.map((g) => (
                    <option key={g} value={g} className="bg-[#111A1A]">
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#8EF5DC] px-6 py-2.5 text-xs font-bold text-[#080A0A] hover:bg-[#7cebcfe8]"
            >
              Salva preferenze
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// Simple StatCard
const StatCard: React.FC<{ label: string; value: number | string; highlight?: boolean }> = ({
  label,
  value,
  highlight,
}) => (
  <div
    className={`rounded-2xl border p-4 ${
      highlight
        ? 'border-[#8EF5DC] bg-[#8EF5DC]/10'
        : 'border-white/10 bg-[#080A0A]'
    }`}
  >
    <div className="text-[11px] text-[#9EABA7]">{label}</div>
    <div className={`text-2xl font-extrabold mt-1 ${highlight ? 'text-[#8EF5DC]' : 'text-[#F4F5F6]'}`}>
      {value}
    </div>
  </div>
);
