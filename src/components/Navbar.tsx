import React, { useState } from 'react';
import {
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  User as UserIcon,
  Compass,
  CalendarCheck,
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';

export const Navbar: React.FC = () => {
  const { currentUser, profile, isAdmin, isCoach, effectiveRole, signOut } = useAuth();
  const { route, navigate, openQuestionnaire, openLoginModal } = useNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#080A0A]/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Minimal text logo */}
        <button
          onClick={() => handleNav('/')}
          id="brand-logo"
          className="group inline-flex min-h-[44px] items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded-lg text-left"
          aria-label="GROW UP Homepage"
        >
          <span className="font-extrabold tracking-tight text-xl sm:text-2xl text-[#F4F5F6] transition-colors group-hover:text-white">
            GROW UP
          </span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#8EF5DC]" aria-hidden="true" />
        </button>

        {/* Desktop Navigation (>= 1024px) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Navigazione principale">
          {/* Visitor Navigation */}
          {!currentUser && (
            <>
              <button
                onClick={() => handleNav('/coaches')}
                className={`inline-flex min-h-[44px] items-center text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded px-1 ${
                  route === 'coaches' ? 'text-[#8EF5DC]' : 'text-[#9EABA7] hover:text-[#F4F5F6]'
                }`}
              >
                Esplora Coach
              </button>
              <button
                onClick={() => handleNav('/how-it-works')}
                className={`inline-flex min-h-[44px] items-center text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded px-1 ${
                  route === 'how-it-works' ? 'text-[#8EF5DC]' : 'text-[#9EABA7] hover:text-[#F4F5F6]'
                }`}
              >
                Come funziona
              </button>
              <button
                onClick={() => handleNav('/for-coaches')}
                className={`inline-flex min-h-[44px] items-center text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded px-1 ${
                  route === 'for-coaches' ? 'text-[#8EF5DC]' : 'text-[#9EABA7] hover:text-[#F4F5F6]'
                }`}
              >
                Per i Coach
              </button>
            </>
          )}

          {/* Authenticated as Athlete */}
          {currentUser && effectiveRole === 'athlete' && (
            <>
              <button
                onClick={() => handleNav('/coaches')}
                className={`inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded px-1 ${
                  route === 'coaches' ? 'text-[#8EF5DC]' : 'text-[#9EABA7] hover:text-[#F4F5F6]'
                }`}
              >
                <Compass className="h-4 w-4" />
                Esplora Coach
              </button>
              <button
                onClick={() => handleNav('/dashboard?tab=bookings')}
                className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-[#9EABA7] hover:text-[#F4F5F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded px-1"
              >
                <CalendarCheck className="h-4 w-4" />
                Le mie prenotazioni
              </button>
              <button
                onClick={() => handleNav('/dashboard')}
                className={`inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded px-1 ${
                  route === 'dashboard' ? 'text-[#8EF5DC]' : 'text-[#9EABA7] hover:text-[#F4F5F6]'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>
            </>
          )}

          {/* Authenticated as Coach */}
          {currentUser && effectiveRole === 'coach' && (
            <>
              <button
                onClick={() => handleNav('/dashboard')}
                className={`inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded px-1 ${
                  route === 'dashboard' ? 'text-[#8EF5DC]' : 'text-[#9EABA7] hover:text-[#F4F5F6]'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard Coach
              </button>
              <button
                onClick={() => handleNav('/dashboard?tab=profile')}
                className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-[#9EABA7] hover:text-[#F4F5F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded px-1"
              >
                <UserIcon className="h-4 w-4" />
                Profilo pubblico
              </button>
              <button
                onClick={() => handleNav('/dashboard?tab=bookings')}
                className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-[#9EABA7] hover:text-[#F4F5F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded px-1"
              >
                <CalendarCheck className="h-4 w-4" />
                Prenotazioni
              </button>
            </>
          )}

          {/* Authenticated as Administrator */}
          {currentUser && effectiveRole === 'admin' && (
            <>
              <button
                onClick={() => handleNav('/dashboard')}
                className={`inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded px-1 ${
                  route === 'dashboard' ? 'text-[#8EF5DC]' : 'text-[#9EABA7] hover:text-[#F4F5F6]'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard Admin
              </button>
              <button
                onClick={() => handleNav('/dashboard?tab=coaches')}
                className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-[#9EABA7] hover:text-[#F4F5F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded px-1"
              >
                <Users className="h-4 w-4" />
                Coach
              </button>
              <button
                onClick={() => handleNav('/dashboard?tab=applications')}
                className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-[#9EABA7] hover:text-[#F4F5F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded px-1"
              >
                <FileText className="h-4 w-4" />
                Candidature
              </button>
              <button
                onClick={() => handleNav('/dashboard?tab=bookings')}
                className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-[#9EABA7] hover:text-[#F4F5F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded px-1"
              >
                <CalendarCheck className="h-4 w-4" />
                Prenotazioni
              </button>
            </>
          )}
        </nav>

        {/* Right Action buttons (Desktop) */}
        <div className="hidden lg:flex items-center gap-4">
          {!currentUser ? (
            <>
              <button
                onClick={openLoginModal}
                id="nav-btn-accedi"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 bg-[#111A1A] px-4 py-2 text-sm font-medium text-[#F4F5F6] hover:bg-white/5 hover:border-white/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC]"
              >
                Accedi
              </button>
              <button
                onClick={openQuestionnaire}
                id="nav-btn-trova-coach"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#8EF5DC] px-5 py-2 text-sm font-semibold text-[#080A0A] transition-all hover:bg-[#7cebcfe8] focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]"
              >
                Trova il tuo Coach
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNav('/dashboard')}
                id="nav-user-chip"
                className="inline-flex min-h-[44px] items-center gap-2.5 rounded-xl border border-white/10 bg-[#111A1A] px-3.5 py-1.5 text-xs font-medium text-[#F4F5F6] hover:border-[#8EF5DC]/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC]"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ''}
                    className="h-7 w-7 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8EF5DC]/20 text-[#8EF5DC] font-bold text-xs">
                    {getInitials(currentUser.displayName || profile?.displayName)}
                  </div>
                )}
                <div className="text-left">
                  <div className="font-semibold max-w-[130px] truncate leading-tight">
                    {currentUser.displayName || 'Utente'}
                  </div>
                  <div className="text-[10px] text-[#8EF5DC] uppercase font-bold tracking-wider">
                    {effectiveRole === 'admin'
                      ? 'Admin'
                      : effectiveRole === 'coach'
                      ? 'Coach'
                      : 'Atleta'}
                  </div>
                </div>
              </button>

              <button
                onClick={signOut}
                title="Disconnetti"
                aria-label="Disconnetti"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/10 bg-[#111A1A] text-[#9EABA7] hover:text-red-400 hover:border-red-400/30 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger toggle (< 1024px) - min 44x44px touch target */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          id="mobile-menu-toggle"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Chiudi menu' : 'Apri menu di navigazione'}
          className="lg:hidden flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/10 text-[#F4F5F6] hover:bg-[#111A1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC]"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu-drawer"
          className="lg:hidden border-b border-white/10 bg-[#0C1212] px-5 py-5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {currentUser && (
            <div className="mb-4 pb-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8EF5DC]/20 text-[#8EF5DC] font-bold text-sm">
                    {getInitials(currentUser.displayName || profile?.displayName)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm text-[#F4F5F6]">
                    {currentUser.displayName || 'Utente GROW UP'}
                  </div>
                  <div className="text-xs text-[#8EF5DC] font-semibold">
                    {effectiveRole === 'admin'
                      ? 'Amministratore'
                      : effectiveRole === 'coach'
                      ? 'Coach Verificato'
                      : 'Atleta'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="flex min-h-[44px] items-center gap-1.5 text-xs text-red-400 px-2 py-1 rounded-lg border border-red-400/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                Esci
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1 text-sm font-medium">
            <button
              onClick={() => handleNav('/')}
              className="flex min-h-[44px] items-center px-3 rounded-xl hover:bg-white/5 text-[#F4F5F6]"
            >
              Home
            </button>

            <button
              onClick={() => handleNav('/coaches')}
              className="flex min-h-[44px] items-center px-3 rounded-xl hover:bg-white/5 text-[#F4F5F6]"
            >
              Esplora Coach
            </button>

            <button
              onClick={() => handleNav('/how-it-works')}
              className="flex min-h-[44px] items-center px-3 rounded-xl hover:bg-white/5 text-[#9EABA7] hover:text-[#F4F5F6]"
            >
              Come funziona
            </button>

            <button
              onClick={() => handleNav('/for-coaches')}
              className="flex min-h-[44px] items-center px-3 rounded-xl hover:bg-white/5 text-[#9EABA7] hover:text-[#F4F5F6]"
            >
              Per i Coach
            </button>

            {currentUser && (
              <button
                onClick={() => handleNav('/dashboard')}
                className="flex min-h-[44px] items-center px-3 rounded-xl bg-[#8EF5DC]/10 text-[#8EF5DC] font-semibold mt-2"
              >
                Vai alla Dashboard ({effectiveRole === 'admin' ? 'Admin' : effectiveRole === 'coach' ? 'Coach' : 'Atleta'})
              </button>
            )}

            {!currentUser && (
              <div className="pt-3 mt-2 border-t border-white/5 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openLoginModal();
                  }}
                  className="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-white/10 bg-[#111A1A] py-2.5 text-sm font-medium text-[#F4F5F6]"
                >
                  Accedi
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openQuestionnaire();
                  }}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#8EF5DC] py-2.5 text-sm font-semibold text-[#080A0A]"
                >
                  <Sparkles className="h-4 w-4" />
                  Trova il tuo Coach
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
