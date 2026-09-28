import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  db,
  loginWithGoogle,
  logoutUser,
  onAuthStateChanged,
  User,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  role: 'athlete' | 'coach' | 'admin';
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  currentUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: (preferredRole?: 'athlete' | 'coach') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch or subscribe to user profile in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        unsubscribeProfile = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setProfile(docSnap.data() as UserProfile);
            } else {
              setProfile({
                userId: user.uid,
                email: user.email || '',
                displayName: user.displayName || 'Utente GROW UP',
                role: 'athlete',
                photoURL: user.photoURL || '',
              });
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching profile:', error);
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
            setLoading(false);
          }
        );
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const handleGoogleSignIn = async (preferredRole: 'athlete' | 'coach' = 'athlete') => {
    await loginWithGoogle(preferredRole);
  };

  const handleSignOut = async () => {
    await logoutUser();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        loading,
        signInWithGoogle: handleGoogleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
