export const DISCIPLINES = [
  'Fitness / Palestra',
  'Bodybuilding',
  'Powerlifting',
  'Running',
  'Trail Running',
  'Calisthenics',
  'CrossFit / Functional',
  'Ciclismo',
  'Nuoto',
  'Triathlon',
  'Tennis',
  'Padel',
  'Boxe',
  'Arti Marziali',
  'Yoga',
  'Pilates',
  'Mobilità',
  'Preparazione Atletica',
  'Postura',
] as const;

export type Discipline = typeof DISCIPLINES[number];

export const GOALS = [
  'Dimagrimento',
  'Massa muscolare',
  'Forza',
  'Resistenza',
  'Preparazione gara',
  'Miglioramento tecnica',
  'Mobilità',
  'Benessere generale',
  "Ritorno all'attività",
  'Performance sportiva',
] as const;

export type Goal = typeof GOALS[number];

export const LEVELS = ['Principiante', 'Intermedio', 'Avanzato'] as const;
export type Level = typeof LEVELS[number];

export const MODALITIES = ['Online', 'In presenza', 'Ibrido'] as const;
export type Modality = typeof MODALITIES[number];

export interface CoachProfileEntity {
  coachId: string;
  displayName: string;
  headline?: string;
  discipline: string;
  bio?: string;
  photoURL?: string;
  experienceYears?: number;
  specialties?: string[];
  goals?: string[];
  levels?: string[];
  modalities?: string[];
  languages?: string[];
  location?: string;
  onlineAvailable?: boolean;
  inPersonAvailable?: boolean;
  tags?: string[];
  verificationStatus: 'approved' | 'pending' | 'rejected';
  active: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CoachServiceEntity {
  id: string;
  coachId: string;
  title: string;
  description?: string;
  type: 'single_session' | 'package' | 'subscription';
  durationMinutes: number;
  priceCents: number;
  currency: string;
  active: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CoachAvailabilityEntity {
  id: string;
  coachId: string;
  startAt: any;
  endAt: any;
  status: 'available' | 'reserved' | 'booked' | 'cancelled';
  bookingId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BookingEntity {
  id: string;
  athleteId: string;
  coachId: string;
  serviceId: string;
  slotId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'pending' | 'paid' | 'refunded';
  createdAt?: any;
  updatedAt?: any;
  // Hydrated helper fields
  coachName?: string;
  athleteName?: string;
  athleteEmail?: string;
  serviceTitle?: string;
  slotStart?: any;
}

export interface CoachApplicationEntity {
  id: string;
  applicantId: string;
  fullName: string;
  email: string;
  discipline: string;
  profileLink?: string;
  bio?: string;
  experienceYears?: number;
  status: 'submitted' | 'reviewed' | 'approved' | 'rejected';
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

export interface QuestionnaireAnswers {
  goal?: Goal | string;
  discipline?: Discipline | string;
  sport?: string;
  level?: Level | string;
  modality?: Modality | string;
  frequency?: string;
  notes?: string;
}

export interface Coach {
  id: string;
  name: string;
  role: string;
  badge?: string;
  tags: string[];
  rating?: number;
  reviewCount?: number;
  matchScore?: number;
  bio: string;
  avatarUrl?: string;
  avatarInitials: string;
  modality: string;
  availability: string;
  experience: string;
  specialties: string[];
  discipline?: string;
  goals?: string[];
  levels?: string[];
  location?: string;
  nextSlot?: string;
}
