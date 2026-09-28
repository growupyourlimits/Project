import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDocFromServer,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with the exact firestoreDatabaseId from configuration
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling Infrastructure adhering to Firebase Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// CRITICAL CONSTRAINT: Test connection on initialization
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Check connection or project settings.');
    }
  }
}
testConnection();

// --- Auth Utilities ---
export async function loginWithGoogle(preferredRole: 'athlete' | 'coach' = 'athlete') {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check or create user profile
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) {
        const newProfile = {
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Utente GROW UP',
          role: preferredRole,
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProfile);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
    return user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

// --- Data Submission Helpers ---

export interface ConsultationSubmission {
  athleteName: string;
  athleteEmail: string;
  coachId: string;
  coachName: string;
  sport?: string;
  goal?: string;
  level?: string;
  modality?: string;
  preferredSlot: string;
}

export async function submitConsultationRequest(data: ConsultationSubmission) {
  const currentUid = auth.currentUser?.uid;
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const payload = {
    id: requestId,
    athleteId: currentUid || 'guest',
    athleteName: data.athleteName.trim().slice(0, 100),
    athleteEmail: data.athleteEmail.trim().toLowerCase().slice(0, 128),
    coachId: data.coachId.slice(0, 64),
    coachName: data.coachName.trim().slice(0, 100),
    sport: data.sport ? data.sport.slice(0, 64) : 'Generale',
    goal: data.goal ? data.goal.slice(0, 100) : 'Benessere',
    level: data.level ? data.level.slice(0, 100) : 'Principiante',
    modality: data.modality ? data.modality.slice(0, 100) : 'Online',
    preferredSlot: data.preferredSlot.slice(0, 100),
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, 'consultationRequests', requestId);
    await setDoc(docRef, payload);
    return requestId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `consultationRequests/${requestId}`);
  }
}

export interface CoachApplicationSubmission {
  fullName: string;
  email: string;
  discipline: string;
  profileLink?: string;
}

export async function submitCoachApplication(data: CoachApplicationSubmission) {
  const appId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const payload = {
    id: appId,
    fullName: data.fullName.trim().slice(0, 100),
    email: data.email.trim().toLowerCase().slice(0, 128),
    discipline: data.discipline.trim().slice(0, 100),
    profileLink: data.profileLink ? data.profileLink.trim().slice(0, 300) : '',
    status: 'submitted' as const,
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, 'coachApplications', appId);
    await setDoc(docRef, payload);
    return appId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `coachApplications/${appId}`);
  }
}

export interface ContactMessageSubmission {
  name: string;
  email: string;
  message: string;
}

export async function submitContactMessage(data: ContactMessageSubmission) {
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const payload = {
    id: msgId,
    name: data.name.trim().slice(0, 100),
    email: data.email.trim().toLowerCase().slice(0, 128),
    message: data.message.trim().slice(0, 2000),
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, 'contactMessages', msgId);
    await setDoc(docRef, payload);
    return msgId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `contactMessages/${msgId}`);
  }
}

export { onAuthStateChanged };
export type { User };
