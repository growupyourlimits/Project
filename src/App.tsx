import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { QuestionnaireModal } from './components/QuestionnaireModal';
import { InfoModals } from './components/InfoModals';

// Pages
import { HomePage } from './pages/HomePage';
import { CoachesPage } from './pages/CoachesPage';
import { CoachDetailPage } from './pages/CoachDetailPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ForCoachesPage } from './pages/ForCoachesPage';
import { DashboardPage } from './pages/DashboardPage';

const AppContent: React.FC = () => {
  const { route, isQuestionnaireOpen, closeQuestionnaire, isLoginModalOpen, closeLoginModal } =
    useNavigation();
  const [activeInfoModal, setActiveInfoModal] = useState<
    'coaches' | 'login' | 'method' | 'contact' | 'privacy' | 'terms' | 'instagram' | null
  >(null);

  // Determine current main view
  const renderCurrentView = () => {
    switch (route) {
      case 'home':
        return <HomePage />;
      case 'coaches':
        return <CoachesPage />;
      case 'coach-detail':
        return <CoachDetailPage />;
      case 'how-it-works':
        return <HowItWorksPage />;
      case 'for-coaches':
        return <ForCoachesPage />;
      case 'dashboard':
        return <DashboardPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0A] text-[#F4F5F6] flex flex-col selection:bg-[#8EF5DC] selection:text-[#080A0A] overflow-x-hidden w-full max-w-full">
      {/* Global Marketplace Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {renderCurrentView()}
      </main>

      {/* Global Footer */}
      <Footer
        onOpenPrivacy={() => setActiveInfoModal('privacy')}
        onOpenTerms={() => setActiveInfoModal('terms')}
        onOpenContact={() => setActiveInfoModal('contact')}
        onOpenInstagram={() => setActiveInfoModal('instagram')}
      />

      {/* Interactive 5-Question Matching Modal */}
      <QuestionnaireModal
        isOpen={isQuestionnaireOpen}
        onClose={closeQuestionnaire}
      />

      {/* Login Modal */}
      {isLoginModalOpen && (
        <InfoModals
          type="login"
          onClose={closeLoginModal}
        />
      )}

      {/* Supporting Information Modals */}
      <InfoModals
        type={activeInfoModal}
        onClose={() => setActiveInfoModal(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </AuthProvider>
  );
}
