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
  getDocFromServer,
  setDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  CoachProfileEntity,
  CoachServiceEntity,
  CoachAvailabilityEntity,
  BookingEntity,
  CoachApplicationEntity,
} from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const ADMIN_EMAIL = 'growupyourlimits@gmail.com';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ---------------------------------------------------------------------------
// AUTHENTICATION
// ---------------------------------------------------------------------------
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const isSpecialAdmin = user.email?.toLowerCase() === ADMIN_EMAIL;
    await setDoc(userRef, {
      userId: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Utente GROW UP',
      role: isSpecialAdmin ? 'admin' : 'athlete',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  return user;
}

export const logoutUser = () => signOut(auth);

export async function updateUserProfile(
  uid: string,
  data: { displayName?: string; photoURL?: string; preferences?: Record<string, any> }
) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// COACH APPLICATIONS (NO STORAGE REQUIRED)
// ---------------------------------------------------------------------------
export interface CoachApplicationSubmission {
  fullName: string;
  email: string;
  discipline: string;
  profileLink?: string;
  bio?: string;
  experienceYears?: number;
}

export async function submitCoachApplication(data: CoachApplicationSubmission) {
  const user = auth.currentUser;
  if (!user) throw new Error('Devi accedere prima di candidarti come coach.');

  const applicationRef = doc(collection(db, 'coachApplications'));
  await setDoc(applicationRef, {
    id: applicationRef.id,
    applicantId: user.uid,
    fullName: data.fullName.trim().slice(0, 100),
    email: data.email.trim().toLowerCase().slice(0, 128),
    discipline: data.discipline.trim().slice(0, 100),
    profileLink: data.profileLink?.trim().slice(0, 300) || '',
    bio: data.bio?.trim().slice(0, 1200) || '',
    experienceYears: Math.max(0, Math.min(60, data.experienceYears || 0)),
    status: 'submitted',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return applicationRef.id;
}

export async function listMyCoachApplications(uid: string) {
  const snap = await getDocs(
    query(collection(db, 'coachApplications'), where('applicantId', '==', uid))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as CoachApplicationEntity[];
}

export async function listPendingCoachApplications() {
  const snap = await getDocs(
    query(collection(db, 'coachApplications'), where('status', '==', 'submitted'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as CoachApplicationEntity[];
}

export async function listAllCoachApplications() {
  const snap = await getDocs(collection(db, 'coachApplications'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as CoachApplicationEntity[];
}

export async function reviewCoachApplication(
  applicationId: string,
  applicantId: string,
  approved: boolean,
  reason = ''
) {
  const admin = auth.currentUser;
  if (!admin || admin.email?.toLowerCase() !== ADMIN_EMAIL || !admin.emailVerified) {
    throw new Error('Operazione riservata all’amministratore.');
  }

  // Get application data first to populate profile if approved
  const appSnap = await getDoc(doc(db, 'coachApplications', applicationId));
  const appData = appSnap.exists() ? appSnap.data() : null;

  const batch = writeBatch(db);
  batch.update(doc(db, 'coachApplications', applicationId), {
    status: approved ? 'approved' : 'rejected',
    reviewedAt: serverTimestamp(),
    reviewedBy: admin.uid,
    reviewNote: approved ? 'Candidatura approvata.' : reason.slice(0, 500),
    updatedAt: serverTimestamp(),
  });

  if (approved) {
    batch.update(doc(db, 'users', applicantId), {
      role: 'coach',
      updatedAt: serverTimestamp(),
    });

    batch.set(
      doc(db, 'coachProfiles', applicantId),
      {
        coachId: applicantId,
        displayName: appData?.fullName || 'Coach GROW UP',
        headline: appData?.discipline ? `Coach specializzato in ${appData.discipline}` : 'Coach Certificato',
        discipline: appData?.discipline || 'Fitness / Palestra',
        bio: appData?.bio || 'Coach sportivo certificato su GROW UP.',
        experienceYears: Number(appData?.experienceYears || 2),
        specialties: appData?.discipline ? [appData.discipline] : [],
        goals: ['Benessere generale', 'Forza', 'Dimagrimento'],
        levels: ['Principiante', 'Intermedio'],
        modalities: ['Online', 'In presenza'],
        tags: appData?.discipline ? [appData.discipline, 'Verificato'] : ['Verificato'],
        verificationStatus: 'approved',
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  await batch.commit();
}

// ---------------------------------------------------------------------------
// COACH PROFILES
// ---------------------------------------------------------------------------
export async function getCoachProfile(coachId: string): Promise<CoachProfileEntity | null> {
  const snap = await getDoc(doc(db, 'coachProfiles', coachId));
  if (!snap.exists()) return null;
  return { coachId: snap.id, ...(snap.data() as any) } as CoachProfileEntity;
}

export async function saveCoachProfile(data: Partial<CoachProfileEntity> & { coachId?: string }) {
  const user = auth.currentUser;
  if (!user) throw new Error('Accesso richiesto.');
  const coachId = user.uid;

  const sanitized: Record<string, any> = {
    coachId,
    updatedAt: serverTimestamp(),
  };

  if (data.displayName !== undefined) sanitized.displayName = data.displayName.slice(0, 100);
  if (data.headline !== undefined) sanitized.headline = data.headline.slice(0, 150);
  if (data.bio !== undefined) sanitized.bio = data.bio.slice(0, 2000);
  if (data.discipline !== undefined) sanitized.discipline = data.discipline.slice(0, 100);
  if (data.tags !== undefined) sanitized.tags = data.tags.slice(0, 12);
  if (data.modalities !== undefined) sanitized.modalities = data.modalities.slice(0, 5);
  if (data.specialties !== undefined) sanitized.specialties = data.specialties.slice(0, 12);
  if (data.experienceYears !== undefined) sanitized.experienceYears = Number(data.experienceYears || 0);
  if (data.photoURL !== undefined) sanitized.photoURL = data.photoURL;

  await setDoc(doc(db, 'coachProfiles', coachId), sanitized, { merge: true });
}

export async function listApprovedCoaches(): Promise<CoachProfileEntity[]> {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'coachProfiles'),
        where('active', '==', true),
        where('verificationStatus', '==', 'approved')
      )
    );
    return snap.docs.map((d) => ({ coachId: d.id, ...(d.data() as any) }));
  } catch (err) {
    console.error('listApprovedCoaches error:', err);
    return [];
  }
}

export async function listAllCoachProfiles(): Promise<CoachProfileEntity[]> {
  const snap = await getDocs(collection(db, 'coachProfiles'));
  return snap.docs.map((d) => ({ coachId: d.id, ...(d.data() as any) }));
}

// ---------------------------------------------------------------------------
// COACH SERVICES
// ---------------------------------------------------------------------------
export async function listCoachServices(coachId: string): Promise<CoachServiceEntity[]> {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'coachServices'),
        where('coachId', '==', coachId),
        where('active', '==', true)
      )
    );
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch (err) {
    console.error('listCoachServices error:', err);
    return [];
  }
}

export async function listAllCoachServicesForCoach(coachId: string): Promise<CoachServiceEntity[]> {
  const snap = await getDocs(
    query(collection(db, 'coachServices'), where('coachId', '==', coachId))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function createCoachService(data: {
  title: string;
  description: string;
  type: 'single_session' | 'package' | 'subscription';
  durationMinutes: number;
  priceCents: number;
  currency?: string;
}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Accesso richiesto.');
  return addDoc(collection(db, 'coachServices'), {
    coachId: user.uid,
    title: data.title.slice(0, 100),
    description: data.description.slice(0, 500),
    type: data.type,
    durationMinutes: Number(data.durationMinutes) || 60,
    priceCents: Math.round(Number(data.priceCents) || 0),
    currency: data.currency || 'EUR',
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCoachService(serviceId: string, data: Partial<CoachServiceEntity>) {
  const user = auth.currentUser;
  if (!user) throw new Error('Accesso richiesto.');
  await updateDoc(doc(db, 'coachServices', serviceId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCoachService(serviceId: string) {
  await deleteDoc(doc(db, 'coachServices', serviceId));
}

// ---------------------------------------------------------------------------
// COACH AVAILABILITY SLOTS
// ---------------------------------------------------------------------------
export async function listCoachAvailability(coachId: string): Promise<CoachAvailabilityEntity[]> {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'coachAvailability'),
        where('coachId', '==', coachId),
        where('status', '==', 'available')
      )
    );
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch (err) {
    console.error('listCoachAvailability error:', err);
    return [];
  }
}

export async function listAllSlotsForCoach(coachId: string): Promise<CoachAvailabilityEntity[]> {
  const snap = await getDocs(
    query(collection(db, 'coachAvailability'), where('coachId', '==', coachId))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function createAvailabilitySlot(startAt: Date, endAt: Date) {
  const user = auth.currentUser;
  if (!user) throw new Error('Accesso richiesto.');
  if (endAt <= startAt) throw new Error('Orario di fine non valido.');

  return addDoc(collection(db, 'coachAvailability'), {
    coachId: user.uid,
    startAt,
    endAt,
    status: 'available',
    createdAt: serverTimestamp(),
  });
}

export async function deleteAvailabilitySlot(slotId: string) {
  await deleteDoc(doc(db, 'coachAvailability', slotId));
}

// ---------------------------------------------------------------------------
// BOOKINGS (ATOMIC TRANSACTION)
// ---------------------------------------------------------------------------
export async function createBooking(data: {
  coachId: string;
  serviceId: string;
  slotId: string;
}) {
  const user = auth.currentUser;
  if (!user) throw new Error('Devi accedere per completare la prenotazione.');

  const bookingRef = doc(collection(db, 'bookings'));
  const slotRef = doc(db, 'coachAvailability', data.slotId);

  await runTransaction(db, async (tx) => {
    const slot = await tx.get(slotRef);
    if (
      !slot.exists() ||
      slot.data().coachId !== data.coachId ||
      slot.data().status !== 'available'
    ) {
      throw new Error('Questo orario non è più disponibile. Selezionane un altro.');
    }

    tx.set(bookingRef, {
      id: bookingRef.id,
      athleteId: user.uid,
      coachId: data.coachId,
      serviceId: data.serviceId,
      slotId: data.slotId,
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    tx.update(slotRef, {
      status: 'reserved',
      bookingId: bookingRef.id,
      updatedAt: serverTimestamp(),
    });
  });

  return bookingRef.id;
}

export async function listMyBookings(
  uid: string,
  role: 'athlete' | 'coach' | 'admin'
): Promise<BookingEntity[]> {
  const field = role === 'coach' ? 'coachId' : 'athleteId';
  const snap = await getDocs(
    query(collection(db, 'bookings'), where(field, '==', uid))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function listAllBookings(): Promise<BookingEntity[]> {
  const snap = await getDocs(collection(db, 'bookings'));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
) {
  const bookingRef = doc(db, 'bookings', bookingId);
  await updateDoc(bookingRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// ADMIN LIVE SUBSCRIPTIONS & UTILITIES
// ---------------------------------------------------------------------------
export function subscribeToCoachApplications(
  onData: (apps: CoachApplicationEntity[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'coachApplications';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as CoachApplicationEntity[];
      onData(data);
    },
    (err) => {
      console.warn('Subscription to coachApplications error:', err);
      if (onError) onError(err);
      else handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeToCoachProfiles(
  onData: (coaches: CoachProfileEntity[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'coachProfiles';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const data = snap.docs.map((d) => ({ coachId: d.id, ...(d.data() as any) })) as CoachProfileEntity[];
      onData(data);
    },
    (err) => {
      console.warn('Subscription to coachProfiles error:', err);
      if (onError) onError(err);
      else handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeToUsers(
  onData: (users: any[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'users';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      onData(data);
    },
    (err) => {
      console.warn('Subscription to users error:', err);
      if (onError) onError(err);
      else handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeToBookings(
  onData: (bookings: BookingEntity[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'bookings';
  return onSnapshot(
    collection(db, path),
    (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as BookingEntity[];
      onData(data);
    },
    (err) => {
      console.warn('Subscription to bookings error:', err);
      if (onError) onError(err);
      else handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export async function toggleCoachActive(coachId: string, currentActive: boolean) {
  const admin = auth.currentUser;
  if (!admin || admin.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    throw new Error('Operazione riservata all’amministratore.');
  }
  const ref = doc(db, 'coachProfiles', coachId);
  await updateDoc(ref, {
    active: !currentActive,
    updatedAt: serverTimestamp(),
  });
}

export async function listAllUsers() {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// ---------------------------------------------------------------------------
// CONTACT MESSAGES
// ---------------------------------------------------------------------------
export async function submitContactMessage(data: {
  name: string;
  email: string;
  message: string;
}) {
  const messageRef = doc(collection(db, 'contactMessages'));
  await setDoc(messageRef, {
    id: messageRef.id,
    name: data.name.trim().slice(0, 100),
    email: data.email.trim().toLowerCase().slice(0, 128),
    message: data.message.trim().slice(0, 2000),
    createdAt: serverTimestamp(),
  });
  return messageRef.id;
}

export { onAuthStateChanged, onSnapshot, query, where, collection, orderBy };
export type { User };
