/**
 * Fitness and Training Related Types
 */

export interface Challenge {
  id: number;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  difficulty: 'easy' | 'medium' | 'hard';
  pointsReward: number;
  startDate: string;
  endDate: string;
  requirements: string[];
  participantCount?: number;
}

export interface UserChallenge {
  id: number;
  userId: number;
  challengeId: number;
  challenge: Challenge;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  progress: number; // percentage
  startedAt?: string;
  completedAt?: string;
}

export interface TrainingSession {
  id: number;
  name: string;
  trainerId: number;
  trainerName: string;
  type: 'personal' | 'group' | 'class';
  capacity: number;
  enrolled: number;
  startTime: string;
  endTime: string;
  date: string;
  location: string;
  description: string;
}

export interface UserSession {
  id: number;
  userId: number;
  sessionId: number;
  session: TrainingSession;
  status: 'booked' | 'attended' | 'cancelled' | 'no_show';
  bookedAt: string;
  attendedAt?: string;
}

export interface Equipment {
  id: number;
  name: string;
  category: string;
  quantity: number;
  available: number;
  condition: 'excellent' | 'good' | 'fair' | 'maintenance';
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}
