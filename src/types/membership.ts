/**
 * Membership Related Types
 */

export type MembershipTier = 'basic' | 'premium' | 'vip';
export type MembershipDuration = '1month' | '3months' | '6months' | '12months';
export type MembershipStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface Membership {
  id: number;
  userId: number;
  tier: MembershipTier;
  duration: MembershipDuration;
  status: MembershipStatus;
  startDate: string;
  expirationDate: string;
  price: number;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipPlan {
  id: number;
  name: string;
  tier: MembershipTier;
  duration: MembershipDuration;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface Attendance {
  id: number;
  userId: number;
  checkInTime: string;
  checkOutTime?: string;
  date: string;
  pointsEarned: number;
}
