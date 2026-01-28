/**
 * User and Profile Related Types
 */

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  dateOfBirth?: string;
  age?: number;
  height?: number; // in cm
  weight?: number; // in kg
  bmi?: number;
  fitnessGoal?: string;
  avatarUrl?: string;
}

export interface UserStats {
  totalPoints: number;
  level: number;
  levelProgress: number; // percentage
  xpToNextLevel: number;
  totalWorkouts: number;
  totalClasses: number;
  totalChallenges: number;
  achievementsEarned: number;
  memberSince: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  earned: boolean;
  earnedDate?: string;
  iconUrl?: string;
}

export interface Activity {
  id: number;
  userId: number;
  type: 'workout' | 'class' | 'challenge' | 'training';
  name: string;
  points: number;
  date: string;
  duration?: number; // in minutes
}
