import React, { useState } from 'react';
import { Menu, X, ArrowRight, ShieldCheck, UserCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenQuestionnaire: () => void;
  onOpenForCoaches: () => void;
  onOpenLogin: () => void;
  onOpenDashboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenQuestionnaire,
  onOpenForCoaches,
  onOpenLogin,
  onOpenDashboard,
}) => {
  const { currentUser, profile, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#080A0A]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 xl:px-12">
        {/* Minimal text logo */}
        <a
          href="#"
          id="brand-logo"
          className="group inline-flex min-h-[44px] items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded-lg"
          aria-label="GROW UP Homepage"
        >
          <span className="font-extrabold tracking-tight text-xl sm:text-2xl text-[#F4F5F6] transition-colors group-hover:text-white">
            GROW UP
          </span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#8EF5DC]" aria-hidden="true" />
        </a>

        {/* Desktop Navigation (>= 768px) */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9" aria-label="Navigazione principale">
          <button
            onClick={() => scrollToSection('come-funziona')}
            id="nav-link-come-funziona"
            className="inline-flex min-h-[44px] items-center text-sm font-medium text-[#9EABA7] hover:text-[#F4F5F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded px-1"
          >
            Come funziona
          </button>
          <button
            onClick={onOpenForCoaches}
            id="nav-link-per-i-coach"
            className="inline-flex min-h-[44px] items-center text-sm font-medium text-[#9EABA7] hover:text-[#F4F5F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded px-1"
          >
            Per i coach
          </button>
          {currentUser ? (
            <button
              onClick={onOpenDashboard}
              id="nav-link-profilo"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/10 bg-[#111A1A] px-3 py-1.5 text-xs font-medium text-[#F4F5F6] hover:border-[#8EF5DC]/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC]"
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || ''}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8EF5DC]/20 text-[#8EF5DC] font-bold text-[10px]">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                </div>
              )}
              <span className="max-w-[120px] truncate">{isAdmin ? 'Dashboard Admin' : (currentUser.displayName || 'Profilo')}</span>
              <span className="rounded-full bg-[#8EF5DC]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#8EF5DC]">
                {isAdmin ? 'Admin' : profile?.role === 'coach' ? 'Coach' : 'Atleta'}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              id="nav-link-accedi"
              className="inline-flex min-h-[44px] items-center text-sm font-medium text-[#9EABA7] hover:text-[#F4F5F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded px-1"
            >
              Accedi
            </button>
          )}
        </nav>

        {/* Action button (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={onOpenQuestionnaire}
            id="nav-btn-inizia-ora"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#8EF5DC] px-5 py-2.5 text-sm font-semibold text-[#080A0A] transition-all hover:bg-[#7cebcfe8] focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]"
          >
            Inizia ora
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile Hamburger toggle (< 768px) - min 44x44px touch target */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          id="mobile-menu-toggle"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Chiudi menu' : 'Apri menu di navigazione'}
          className="md:hidden flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/10 text-[#F4F5F6] hover:bg-[#111A1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC]"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu-drawer"
          className="md:hidden border-b border-white/10 bg-[#0C1212] px-6 py-6 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex flex-col gap-2">
            <button
              onClick={() => scrollToSection('come-funziona')}
              className="flex min-h-[48px] items-center text-left text-base font-medium text-[#9EABA7] hover:text-[#F4F5F6] px-2 border-b border-white/5 transition-colors"
            >
              Come funziona
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenForCoaches();
              }}
              className="flex min-h-[48px] items-center text-left text-base font-medium text-[#9EABA7] hover:text-[#F4F5F6] px-2 border-b border-white/5 transition-colors"
            >
              Per i coach
            </button>
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDashboard();
                }}
                className="flex min-h-[48px] items-center justify-between text-left text-base font-medium text-[#F4F5F6] px-2 border-b border-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || ''}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8EF5DC]/20 text-[#8EF5DC] font-bold text-xs">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="truncate max-w-[180px]">{isAdmin ? 'Dashboard Admin' : (currentUser.displayName || 'Mio Profilo')}</span>
                </div>
                <span className="rounded-full bg-[#8EF5DC]/10 px-2 py-0.5 text-xs font-semibold text-[#8EF5DC]">
                  {isAdmin ? 'Admin' : profile?.role === 'coach' ? 'Coach' : 'Atleta'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="flex min-h-[48px] items-center text-left text-base font-medium text-[#9EABA7] hover:text-[#F4F5F6] px-2 border-b border-white/5 transition-colors"
              >
                Accedi
              </button>
            )}
            <div className="pt-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuestionnaire();
                }}
                className="w-full flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#8EF5DC] px-5 py-3 text-sm font-semibold text-[#080A0A] hover:bg-[#7cebcfe8] active:scale-[0.98] transition-all"
              >
                Inizia ora
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
