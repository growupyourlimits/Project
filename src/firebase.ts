import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore, doc, getDoc, setDoc, collection, addDoc, query, where, getDocs,
  onSnapshot, serverTimestamp, writeBatch, orderBy, runTransaction
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const ADMIN_EMAIL = 'growupyourlimits@gmail.com';

export enum OperationType { CREATE='create', UPDATE='update', DELETE='delete', LIST='list', GET='get', WRITE='write' }

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  console.error('Firebase error', { error, operationType, path, uid: auth.currentUser?.uid });
  throw error instanceof Error ? error : new Error(String(error));
}

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      userId: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Utente GROW UP',
      role: 'athlete',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  return user;
}

export const logoutUser = () => signOut(auth);

export interface CoachApplicationSubmission {
  fullName: string;
  email: string;
  discipline: string;
  profileLink?: string;
  bio?: string;
  experienceYears?: number;
  documents?: File[];
}

export async function submitCoachApplication(data: CoachApplicationSubmission) {
  const user = auth.currentUser;
  if (!user) throw new Error('Devi accedere prima di candidarti come coach.');

  const applicationRef = doc(collection(db, 'coachApplications'));
  const documentPaths: string[] = [];

  for (const file of data.documents || []) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `coach-documents/${user.uid}/${applicationRef.id}/${safeName}`;
    await uploadBytes(ref(storage, path), file);
    documentPaths.push(path);
  }

  await setDoc(applicationRef, {
    id: applicationRef.id,
    applicantId: user.uid,
    fullName: data.fullName.trim().slice(0, 100),
    email: data.email.trim().toLowerCase().slice(0, 128),
    discipline: data.discipline.trim().slice(0, 100),
    profileLink: data.profileLink?.trim().slice(0, 300) || '',
    bio: data.bio?.trim().slice(0, 1200) || '',
    experienceYears: Math.max(0, Math.min(60, data.experienceYears || 0)),
    documentPaths,
    status: 'submitted',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return applicationRef.id;
}

export async function listMyCoachApplications(uid: string) {
  const snap = await getDocs(query(collection(db, 'coachApplications'), where('applicantId', '==', uid)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function listPendingCoachApplications() {
  const snap = await getDocs(query(collection(db, 'coachApplications'), where('status', '==', 'submitted')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getCoachDocumentUrl(path: string) {
  return getDownloadURL(ref(storage, path));
}

export async function reviewCoachApplication(applicationId: string, applicantId: string, approved: boolean, reason = '') {
  const admin = auth.currentUser;
  if (!admin || admin.email?.toLowerCase() !== ADMIN_EMAIL || !admin.emailVerified) throw new Error('Operazione riservata all’amministratore.');

  const batch = writeBatch(db);
  batch.update(doc(db, 'coachApplications', applicationId), {
    status: approved ? 'approved' : 'rejected',
    reviewedAt: serverTimestamp(),
    reviewedBy: admin.uid,
    rejectionReason: approved ? '' : reason.slice(0, 500),
    updatedAt: serverTimestamp(),
  });
  if (approved) {
    batch.update(doc(db, 'users', applicantId), { role: 'coach', updatedAt: serverTimestamp() });
    batch.set(doc(db, 'coachProfiles', applicantId), {
      coachId: applicantId,
      verificationStatus: 'approved',
      active: true,
      rating: 0,
      reviewCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
  await batch.commit();
}

export interface CoachProfileInput {
  displayName: string; headline: string; bio: string; discipline: string;
  tags: string[]; modalities: string[]; experienceYears: number; specialties: string[]; photoURL?: string;
}
export async function saveCoachProfile(data: CoachProfileInput) {
  const user = auth.currentUser;
  if (!user) throw new Error('Accesso richiesto.');
  await setDoc(doc(db, 'coachProfiles', user.uid), {
    coachId: user.uid, ...data,
    tags: data.tags.slice(0, 12), modalities: data.modalities.slice(0, 5), specialties: data.specialties.slice(0, 12),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function listApprovedCoaches() {
  const snap = await getDocs(query(collection(db, 'coachProfiles'), where('active', '==', true), where('verificationStatus', '==', 'approved')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createCoachService(data: { title:string; description:string; type:'single_session'|'package'|'subscription'; durationMinutes:number; priceCents:number; currency?:string }) {
  const user = auth.currentUser; if (!user) throw new Error('Accesso richiesto.');
  return addDoc(collection(db, 'coachServices'), { coachId:user.uid, ...data, currency:data.currency || 'EUR', active:true, createdAt:serverTimestamp(), updatedAt:serverTimestamp() });
}

export async function createAvailabilitySlot(startAt: Date, endAt: Date) {
  const user = auth.currentUser; if (!user) throw new Error('Accesso richiesto.');
  if (endAt <= startAt) throw new Error('Orario non valido.');
  return addDoc(collection(db, 'coachAvailability'), { coachId:user.uid, startAt, endAt, status:'available', createdAt:serverTimestamp() });
}

export async function createBooking(data: { coachId:string; serviceId:string; slotId:string }) {
  const user = auth.currentUser; if (!user) throw new Error('Devi accedere per prenotare.');
  const bookingRef = doc(collection(db, 'bookings'));
  const slotRef = doc(db, 'coachAvailability', data.slotId);
  await runTransaction(db, async tx => {
    const slot = await tx.get(slotRef);
    if (!slot.exists() || slot.data().coachId !== data.coachId || slot.data().status !== 'available') {
      throw new Error('Questo orario non è più disponibile.');
    }
    tx.set(bookingRef, {
      id: bookingRef.id, athleteId:user.uid, coachId:data.coachId, serviceId:data.serviceId, slotId:data.slotId,
      status:'pending', paymentStatus:'unpaid', createdAt:serverTimestamp(), updatedAt:serverTimestamp()
    });
    tx.update(slotRef, { status:'reserved', bookingId:bookingRef.id, updatedAt:serverTimestamp() });
  });
  return bookingRef.id;
}

export async function listMyBookings(uid: string, role: 'athlete'|'coach'|'admin') {
  const field = role === 'coach' ? 'coachId' : 'athleteId';
  const snap = await getDocs(query(collection(db, 'bookings'), where(field, '==', uid)));
  return snap.docs.map(d => ({ id:d.id, ...d.data() }));
}

export interface ConsultationSubmission { athleteName:string; athleteEmail:string; coachId:string; coachName:string; sport?:string; goal?:string; level?:string; modality?:string; preferredSlot:string; }
export async function submitConsultationRequest(data: ConsultationSubmission) {
  const requestRef = doc(collection(db, 'consultationRequests'));
  await setDoc(requestRef, {
    id:requestRef.id, athleteId:auth.currentUser?.uid || 'guest', ...data,
    athleteName:data.athleteName.trim().slice(0,100), athleteEmail:data.athleteEmail.trim().toLowerCase().slice(0,128),
    status:'pending', createdAt:serverTimestamp()
  });
  return requestRef.id;
}

export async function submitContactMessage(data:{name:string;email:string;message:string}) {
  const messageRef = doc(collection(db, 'contactMessages'));
  await setDoc(messageRef, { id:messageRef.id, name:data.name.trim().slice(0,100), email:data.email.trim().toLowerCase().slice(0,128), message:data.message.trim().slice(0,2000), createdAt:serverTimestamp() });
  return messageRef.id;
}

export { onAuthStateChanged, onSnapshot, query, where, collection, orderBy };
export type { User };
