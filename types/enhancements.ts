export interface TutorFilters {
  subjects: string[];
  maxDistance: number;
  priceRange: [number, number];
  availability: TimeSlot[];
  minRating: number;
  teachingStyle: string[];
  verified: boolean;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface MatchPreferences {
  preferredSubjects: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  sessionType: 'video' | 'in_person' | 'both';
  maxDistance: number;
  budgetRange: [number, number];
  availability: TimeSlot[];
}

export interface PerformanceAnalysis {
  overallProgress: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendedStudyTime: number;
  nextMilestones: string[];
}

export interface StudyResource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'exercise' | 'quiz';
  url: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
}

export interface CallSession {
  id: string;
  conversationId: string;
  participants: string[];
  status: 'connecting' | 'active' | 'ended';
  startTime: Date;
  duration?: number;
  recordingUrl?: string;
}

export interface UserLevel {
  level: number;
  xp: number;
  xpToNextLevel: number;
  title: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  iconUrl: string;
  unlockedAt?: Date;
}

export interface ProgressMetrics {
  sessionDuration: number;
  topicsCompleted: string[];
  exercisesCompleted: number;
  comprehensionScore: number;
  engagementLevel: number;
}