import { Coach, QuestionnaireAnswers } from '../types';

export const HERO_SAMPLE_COACH: Coach = {
  id: 'martina-r',
  name: 'Martina R.',
  role: 'Running coach',
  badge: 'Match consigliato',
  tags: ['Corsa', 'Principianti', 'Online'],
  rating: 4.9,
  reviewCount: 38,
  matchScore: 98,
  bio: 'Specializzata nell’avviamento alla corsa per principianti e nella preparazione delle prime mezze maratone senza infortuni.',
  avatarInitials: 'MR',
  modality: 'Online & Ibrido',
  availability: 'Mattina / Weekend',
  experience: '6 anni di esperienza',
  specialties: ['Prevenzione infortuni', 'Tecnica di corsa', 'Piani graduali'],
};

export const ALL_COACHES: Coach[] = [
  HERO_SAMPLE_COACH,
  {
    id: 'marco-b',
    name: 'Marco B.',
    role: 'Strength & Conditioning Coach',
    badge: 'Top Rated',
    tags: ['Palestra & Forza', 'Intermedio', 'Ibrido'],
    rating: 5.0,
    reviewCount: 52,
    matchScore: 96,
    bio: 'Dottore in Scienze Motorie, aiuto le persone a costruire forza funzionale e composizione corporea con programmazioni razionali.',
    avatarInitials: 'MB',
    modality: 'In presenza & Ibrido',
    availability: 'Flessibile lun-sab',
    experience: '8 anni di esperienza',
    specialties: ['Ipertrofia', 'Powerlifting', 'Ricostruzione posturale'],
  },
  {
    id: 'elena-v',
    name: 'Elena V.',
    role: 'Calisthenics & Mobilità Specialist',
    badge: 'Match consigliato',
    tags: ['Calisthenics & Fitness', 'Principianti', 'Online'],
    rating: 4.9,
    reviewCount: 41,
    matchScore: 95,
    bio: 'Dalle basi a corpo libero alla padronanza delle prime trazioni e handstand, con enfasi su mobilità articolare e controllo.',
    avatarInitials: 'EV',
    modality: 'Online al 100%',
    availability: 'Pomeriggio e serali',
    experience: '5 anni di esperienza',
    specialties: ['Corpo libero', 'Mobilità spalle e bacino', 'Core stability'],
  },
  {
    id: 'giulia-t',
    name: 'Giulia T.',
    role: 'Yoga & Functional Mobility Coach',
    badge: 'Verificato',
    tags: ['Yoga & Mobilità', 'Principianti', 'Online'],
    rating: 4.95,
    reviewCount: 29,
    matchScore: 94,
    bio: 'Insegno a ritrovare flessibilità, allentare tensioni posturali e respirare correttamente anche con ritmi di vita stressanti.',
    avatarInitials: 'GT',
    modality: 'Online al 100%',
    availability: 'Mattine presto / Sera',
    experience: '7 anni di esperienza',
    specialties: ['Vinyasa dinamico', 'Decompressione lombare', 'Respirazione'],
  },
  {
    id: 'davide-p',
    name: 'Davide P.',
    role: 'Endurance & Ciclismo Coach',
    badge: 'Certificato FCI',
    tags: ['Ciclismo', 'Intermedio', 'Online'],
    rating: 4.88,
    reviewCount: 34,
    matchScore: 93,
    bio: 'Preparazione per granfondo e gravel, gestione potenza/watt e tabelle personalizzate ad alto rendimento orario.',
    avatarInitials: 'DP',
    modality: 'Online al 100%',
    availability: 'Weekend / Piani su TrainingPeaks',
    experience: '9 anni di esperienza',
    specialties: ['Analisi dati potenza', 'Nutrizione gara', 'Periodizzazione'],
  },
];

export function getFilteredCoaches(answers: QuestionnaireAnswers): Coach[] {
  if (!answers.sport) return ALL_COACHES.slice(0, 3);

  // Score coaches based on answers
  const scored = ALL_COACHES.map(coach => {
    let score = 88;
    if (coach.tags.some(t => answers.sport && t.toLowerCase().includes(answers.sport.toLowerCase().split(' ')[0]))) {
      score += 6;
    }
    if (answers.level && coach.tags.some(t => answers.level && answers.level.includes(t))) {
      score += 3;
    }
    if (answers.modality && answers.modality.includes('Online') && coach.modality.includes('Online')) {
      score += 2;
    }
    return {
      ...coach,
      matchScore: Math.min(score, 99),
    };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
}
