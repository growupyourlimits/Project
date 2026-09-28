import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppRoute =
  | 'home'
  | 'coaches'
  | 'coach-detail'
  | 'how-it-works'
  | 'for-coaches'
  | 'dashboard';

interface NavigationContextType {
  route: AppRoute;
  path: string;
  params: {
    coachId?: string;
    discipline?: string;
    tab?: string;
    view?: string;
  };
  navigate: (path: string) => void;
  openQuestionnaire: () => void;
  isQuestionnaireOpen: boolean;
  closeQuestionnaire: () => void;
  openLoginModal: () => void;
  isLoginModalOpen: boolean;
  closeLoginModal: () => void;
}

const NavigationContext = createContext<NavigationContextType>({
  route: 'home',
  path: '/',
  params: {},
  navigate: () => {},
  openQuestionnaire: () => {},
  isQuestionnaireOpen: false,
  closeQuestionnaire: () => {},
  openLoginModal: () => {},
  isLoginModalOpen: false,
  closeLoginModal: () => {},
});

function parseLocation(pathname: string, search: string): { route: AppRoute; params: Record<string, string> } {
  // Support both hash routing and clean path routing
  const rawPath = pathname.startsWith('#') ? pathname.slice(1) : pathname;
  const cleanPath = rawPath || '/';
  const urlParams = new URLSearchParams(search);

  if (cleanPath === '/' || cleanPath === '') {
    return { route: 'home', params: {} };
  }
  if (cleanPath.startsWith('/coaches/')) {
    const coachId = cleanPath.replace('/coaches/', '').split('/')[0].split('?')[0];
    return { route: 'coach-detail', params: { coachId } };
  }
  if (cleanPath === '/coaches') {
    const discipline = urlParams.get('discipline') || undefined;
    return { route: 'coaches', params: { discipline } };
  }
  if (cleanPath === '/how-it-works') {
    return { route: 'how-it-works', params: {} };
  }
  if (cleanPath === '/for-coaches') {
    return { route: 'for-coaches', params: {} };
  }
  if (cleanPath === '/dashboard') {
    const tab = urlParams.get('tab') || undefined;
    const view = urlParams.get('view') || undefined;
    return { route: 'dashboard', params: { tab, view } };
  }
  if (cleanPath === '/admin' || cleanPath.startsWith('/admin')) {
    const tab = urlParams.get('tab') || undefined;
    return { route: 'dashboard', params: { tab, view: 'admin' } };
  }
  return { route: 'home', params: {} };
}

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.hash ? window.location.hash.slice(1) : window.location.pathname || '/'
  );
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.hash
        ? window.location.hash.slice(1)
        : window.location.pathname || '/';
      setCurrentPath(path);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (to: string) => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update history
    try {
      window.history.pushState({}, '', to);
    } catch {
      // In strict iframes, fallback to hash
      window.location.hash = to;
    }
    setCurrentPath(to);
  };

  const parsed = parseLocation(currentPath, window.location.search);

  return (
    <NavigationContext.Provider
      value={{
        route: parsed.route,
        path: currentPath,
        params: parsed.params,
        navigate,
        openQuestionnaire: () => setIsQuestionnaireOpen(true),
        isQuestionnaireOpen,
        closeQuestionnaire: () => setIsQuestionnaireOpen(false),
        openLoginModal: () => setIsLoginModalOpen(true),
        isLoginModalOpen,
        closeLoginModal: () => setIsLoginModalOpen(false),
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);
