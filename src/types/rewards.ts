/**
 * Rewards and Points Related Types
 */

export interface RewardPoint {
  id: number;
  userId: number;
  points: number;
  source: 'attendance' | 'challenge' | 'referral' | 'purchase' | 'bonus';
  description: string;
  date: string;
  expirationDate?: string;
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  pointsCost: number;
  imageUrl?: string;
  stock: number;
  category: 'merchandise' | 'service' | 'discount' | 'exclusive';
  available: boolean;
}

export interface RewardRedemption {
  id: number;
  userId: number;
  rewardId: number;
  pointsSpent: number;
  status: 'pending' | 'completed' | 'cancelled';
  redeemedAt: string;
  completedAt?: string;
}

export interface Voucher {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  expirationDate: string;
  usageLimit: number;
  usageCount: number;
  active: boolean;
}

export interface UserVoucher {
  id: number;
  userId: number;
  voucherId: number;
  voucher: Voucher;
  used: boolean;
  usedAt?: string;
  obtainedAt: string;
}
