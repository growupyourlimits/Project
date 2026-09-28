import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db, loginWithGoogle, logoutUser, onAuthStateChanged, User, ADMIN_EMAIL } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: 'athlete' | 'coach' | 'admin';
  photoURL?: string;
  preferences?: Record<string, any>;
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface AuthContextType {
  currentUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isCoach: boolean;
  effectiveRole: 'admin' | 'coach' | 'athlete';
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isCoach: false,
  effectiveRole: 'athlete',
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      unsubProfile = onSnapshot(
        doc(db, 'users', user.uid),
        (snap) => {
          const isSpecialAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setProfile({
              ...data,
              role: isSpecialAdmin ? 'admin' : data.role || 'athlete',
            });
          } else {
            setProfile({
              userId: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Utente GROW UP',
              role: isSpecialAdmin ? 'admin' : 'athlete',
              photoURL: user.photoURL || '',
            });
          }
          setLoading(false);
        },
        (err) => {
          console.error('Profile subscription failed', err);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const isAdmin = useMemo(
    () => Boolean(currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()),
    [currentUser]
  );

  const isCoach = useMemo(() => !isAdmin && profile?.role === 'coach', [isAdmin, profile?.role]);

  const effectiveRole: 'admin' | 'coach' | 'athlete' = useMemo(() => {
    if (isAdmin) return 'admin';
    if (profile?.role === 'coach') return 'coach';
    return 'athlete';
  }, [isAdmin, profile?.role]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        loading,
        isAdmin,
        isCoach,
        effectiveRole,
        signInWithGoogle: async () => {
          await loginWithGoogle();
        },
        signOut: logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
