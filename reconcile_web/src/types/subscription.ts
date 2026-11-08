export type RecurrenceInterval = 'day' | 'week' | 'month' | 'year';

export type SubscriptionStatus = 'active' | 'needs_review' | 'paused' | 'cancelled';

export type SubscriptionProvenance = 'gmail' | 'manual';

export interface Subscription {
  id: string;
  providerName: string;
  planName: string;
  amount: number;
  currency: string;
  interval: RecurrenceInterval;
  intervalCount: number;
  nextRenewalDate: string; // ISO YYYY-MM-DD
  anchorDay?: number; // 1-31, preserves month-end anchor e.g. Jan 31 -> Mar 31
  category: string;
  provenance: SubscriptionProvenance;
  status: SubscriptionStatus;
  remindersEnabled: boolean;
  reminderDaysBefore: number[];
  cancellationUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RenewalOccurrence {
  subscriptionId: string;
  providerName: string;
  planName: string;
  amount: number;
  currency: string;
  date: string; // ISO YYYY-MM-DD
  daysRemaining: number;
}

export interface SpendInsights {
  totalMonthlyNormalized: number;
  totalAnnualNormalized: number;
  monthlyCommitmentCount: number;
  annualCommitmentCount: number;
  weeklyCommitmentCount: number;
  monthlyPercentage: number;
  annualPercentage: number;
  weeklyPercentage: number;
  topCommitment?: Subscription;
}

export interface CancellationGuide {
  providerName: string;
  targetDomain: string;
  verifiedUrl: string;
  requiresWebLogin: boolean;
  steps: string[];
  caveats: string[];
}
