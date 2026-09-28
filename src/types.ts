export type SportCategory =
  | 'Corsa'
  | 'Calisthenics & Fitness'
  | 'Palestra & Forza'
  | 'Yoga & Mobilità'
  | 'Ciclismo'
  | 'Nuoto'
  | 'Altro';

export type FitnessGoal =
  | 'Rimettersi in forma'
  | 'Perdita peso e definizione'
  | 'Preparare una gara o evento'
  | 'Aumento massa muscolare'
  | 'Salute posturale e longevità';

export type FitnessLevel =
  | 'Principiante (da zero o fermo da molto)'
  | 'Intermedio (mi alleno 1-2 volte a settimana)'
  | 'Avanzato / Atleta (costante, cerco performance)';

export type TrainingModality =
  | 'Online al 100% (videocall e programmazione)'
  | 'In presenza (nella mia zona)'
  | 'Ibrido (programma online + check mensile)';

export interface QuestionnaireAnswers {
  sport?: SportCategory;
  goal?: FitnessGoal;
  level?: FitnessLevel;
  modality?: TrainingModality;
}

export interface Coach {
  id: string;
  name: string;
  role: string;
  badge?: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  matchScore: number;
  bio: string;
  avatarUrl?: string;
  avatarInitials: string;
  modality: string;
  availability: string;
  experience: string;
  specialties: string[];
}
