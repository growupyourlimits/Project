import React from 'react';
import { ArrowUp, Instagram, Mail, Shield, FileText } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenContact: () => void;
  onOpenInstagram: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenTerms,
  onOpenContact,
  onOpenInstagram,
}) => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/10 bg-[#060808] text-[#9EABA7]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          {/* Brand & Mission */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-2xl text-[#F4F5F6]">
                GROW UP
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#8EF5DC]" aria-hidden="true" />
            </div>
            <p className="mt-2 text-sm text-[#8E9B98] max-w-sm">
              La piattaforma che connette chi desidera migliorarsi con i migliori professionisti dello sport.
            </p>
          </div>

          {/* Links: Instagram, Privacy, Termini, Contatti */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-6 text-sm">
            <button
              onClick={onOpenInstagram}
              id="footer-link-instagram"
              className="inline-flex min-h-[44px] items-center gap-2 text-[#9EABA7] hover:text-[#8EF5DC] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded-lg px-3 py-2"
            >
              <Instagram className="h-4 w-4" />
              <span>Instagram</span>
            </button>

            <button
              onClick={onOpenPrivacy}
              id="footer-link-privacy"
              className="inline-flex min-h-[44px] items-center gap-2 text-[#9EABA7] hover:text-[#F4F5F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded-lg px-3 py-2"
            >
              <Shield className="h-4 w-4" />
              <span>Privacy</span>
            </button>

            <button
              onClick={onOpenTerms}
              id="footer-link-termini"
              className="inline-flex min-h-[44px] items-center gap-2 text-[#9EABA7] hover:text-[#F4F5F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded-lg px-3 py-2"
            >
              <FileText className="h-4 w-4" />
              <span>Termini</span>
            </button>

            <button
              onClick={onOpenContact}
              id="footer-link-contatti"
              className="inline-flex min-h-[44px] items-center gap-2 text-[#9EABA7] hover:text-[#8EF5DC] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC] rounded-lg px-3 py-2"
            >
              <Mail className="h-4 w-4" />
              <span>Contatti</span>
            </button>
          </div>

          {/* Scroll to top - Min 44x44px touch target */}
          <button
            onClick={scrollToTop}
            id="footer-scroll-top"
            aria-label="Torna all'inizio della pagina"
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/10 text-[#F4F5F6] hover:bg-[#111A1A] hover:border-white/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EF5DC]"
          >
            <ArrowUp className="h-4 w-4" />
          </button>

        </div>

        {/* Bottom bar with dynamic copyright */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6C7775]">
          <p>© {currentYear} GROW UP. Tutti i diritti riservati.</p>
          <p>Creato per atleti e persone in cerca del proprio potenziale.</p>
        </div>
      </div>
    </footer>
  );
};
