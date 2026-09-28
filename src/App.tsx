import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { ValueSection } from './components/ValueSection';
import { FinalCta } from './components/FinalCta';
import { Footer } from './components/Footer';
import { QuestionnaireModal } from './components/QuestionnaireModal';
import { InfoModals } from './components/InfoModals';

export default function App() {
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState<boolean>(false);
  const [activeInfoModal, setActiveInfoModal] = useState<
    'coaches' | 'login' | 'method' | 'contact' | 'privacy' | 'terms' | 'instagram' | null
  >(null);

  const handleOpenQuestionnaire = () => {
    setActiveInfoModal(null);
    setIsQuestionnaireOpen(true);
  };

  const handleScrollToHowItWorks = () => {
    const el = document.getElementById('come-funziona');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#080A0A] text-[#F4F5F6] flex flex-col selection:bg-[#8EF5DC] selection:text-[#080A0A] overflow-x-hidden w-full max-w-full">
        {/* Navbar with mobile drawer and quick actions */}
        <Navbar
          onOpenQuestionnaire={handleOpenQuestionnaire}
          onOpenForCoaches={() => setActiveInfoModal('coaches')}
          onOpenLogin={() => setActiveInfoModal('login')}
        />

        {/* Main Landing Content */}
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          {/* 1. HERO SECTION */}
          <Hero
            onOpenQuestionnaire={handleOpenQuestionnaire}
            onScrollToHowItWorks={handleScrollToHowItWorks}
          />

          {/* 2. COME FUNZIONA SECTION */}
          <HowItWorks onOpenQuestionnaire={handleOpenQuestionnaire} />

          {/* 3. SEZIONE VALORE & STATS */}
          <ValueSection
            onOpenMethodDetails={() => setActiveInfoModal('method')}
            onOpenQuestionnaire={handleOpenQuestionnaire}
          />

          {/* 4. FINAL CALL TO ACTION */}
          <FinalCta onOpenQuestionnaire={handleOpenQuestionnaire} />
        </main>

        {/* 5. FOOTER */}
        <Footer
          onOpenPrivacy={() => setActiveInfoModal('privacy')}
          onOpenTerms={() => setActiveInfoModal('terms')}
          onOpenContact={() => setActiveInfoModal('contact')}
          onOpenInstagram={() => setActiveInfoModal('instagram')}
        />

        {/* Interactive 4-Question Matching Modal */}
        <QuestionnaireModal
          isOpen={isQuestionnaireOpen}
          onClose={() => setIsQuestionnaireOpen(false)}
        />

        {/* Supporting Information & Action Modals */}
        <InfoModals
          type={activeInfoModal}
          onClose={() => setActiveInfoModal(null)}
          onOpenQuestionnaire={handleOpenQuestionnaire}
        />
      </div>
    </AuthProvider>
  );
}
