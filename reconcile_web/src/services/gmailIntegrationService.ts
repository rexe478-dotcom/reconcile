import { apiClient } from './apiClient';
import { Subscription } from '../types/subscription';

export interface GmailStatus {
  connected: boolean;
  email: string | null;
  last_sync_at: string | null;
  testing_mode: boolean;
  notice: string;
}

export interface GmailAuthUrlResponse {
  auth_url: string;
  testing_mode: boolean;
  verification_notice: string;
}

export interface GmailDisconnectResponse {
  success: boolean;
  message: string;
}

export interface GmailCandidate {
  id: string;
  provider_name: string;
  plan_name?: string;
  amount: number;
  currency: string;
  interval_unit: string;
  interval_count: number;
  next_renewal_date: string;
  detected_from: string;
  snippet?: string;
}

export interface GmailSyncResponse {
  synced_at: string;
  found_count: number;
  candidates: GmailCandidate[];
  notice: string;
}

export const GmailIntegrationService = {
  async getStatus(): Promise<GmailStatus> {
    try {
      return await apiClient.get<GmailStatus>('/api/v1/gmail/status');
    } catch {
      return {
        connected: false,
        email: null,
        last_sync_at: null,
        testing_mode: true,
        notice: 'Unable to reach backend Gmail service. Operating in offline mode.',
      };
    }
  },

  async getAuthUrl(): Promise<GmailAuthUrlResponse> {
    return await apiClient.get<GmailAuthUrlResponse>('/api/v1/gmail/auth-url');
  },

  async syncReceipts(): Promise<GmailSyncResponse> {
    return await apiClient.post<GmailSyncResponse>('/api/v1/gmail/sync', {});
  },

  async disconnect(): Promise<GmailDisconnectResponse> {
    return await apiClient.post<GmailDisconnectResponse>('/api/v1/gmail/disconnect', {});
  },

  candidateToSubscription(cand: GmailCandidate): Subscription {
    const now = new Date().toISOString();
    return {
      id: `sub_${cand.id.replace('gmc_cand_', '')}`,
      providerName: cand.provider_name,
      planName: cand.plan_name || 'Standard Plan',
      amount: cand.amount,
      currency: cand.currency || '₦',
      interval: cand.interval_unit === 'year' ? 'year' : 'month',
      intervalCount: cand.interval_count || 1,
      nextRenewalDate: cand.next_renewal_date,
      category: 'General',
      provenance: 'gmail',
      status: 'active',
      remindersEnabled: true,
      reminderDaysBefore: [3, 1],
      notes: `Imported via Gmail Discovery from receipt: "${cand.detected_from}"`,
      createdAt: now,
      updatedAt: now,
    };
  },
};
