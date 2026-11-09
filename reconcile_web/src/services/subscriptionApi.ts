import {
  Subscription,
  RecurrenceInterval,
  SubscriptionProvenance,
  SubscriptionStatus,
} from '../types/subscription';
import { apiClient } from './apiClient';

export interface ApiSubscription {
  id: string;
  user_id: string;
  provider_name: string;
  plan_name: string | null;
  category?: string | null;
  amount: number;
  currency: string;
  interval_unit: string;
  interval_count: number;
  next_renewal_date: string;
  status: string;
  source: string;
  reminder_enabled: boolean;
  notes?: string | null;
  last_payment_date?: string | null;
  last_payment_amount?: number | null;
  cancellation_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SpendInsightsResponse {
  total_monthly_normalized: number;
  total_annual_normalized: number;
  total_active_subscriptions: number;
  monthly_commitment_count: number;
  annual_commitment_count: number;
  highest_commitment_provider: string | null;
  highest_commitment_amount: number | null;
}

export function mapApiToSubscription(api: ApiSubscription): Subscription {
  const dayPart = api.next_renewal_date
    ? parseInt(api.next_renewal_date.split('-')[2], 10)
    : NaN;

  return {
    id: api.id,
    providerName: api.provider_name,
    planName: api.plan_name || '',
    amount: Number(api.amount),
    currency: api.currency || '₦',
    interval: (api.interval_unit as RecurrenceInterval) || 'month',
    intervalCount: api.interval_count ?? 1,
    nextRenewalDate: api.next_renewal_date,
    anchorDay: isNaN(dayPart) ? undefined : dayPart,
    category: api.category || 'General',
    provenance: (api.source as SubscriptionProvenance) || 'manual',
    status: (api.status as SubscriptionStatus) || 'active',
    remindersEnabled: api.reminder_enabled ?? true,
    reminderDaysBefore: [1, 3],
    cancellationUrl: api.cancellation_url || undefined,
    notes: api.notes || undefined,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}

export function mapSubscriptionToApi(sub: Partial<Subscription>): Record<string, any> {
  const payload: Record<string, any> = {};

  if (sub.providerName !== undefined) payload.provider_name = sub.providerName;
  if (sub.planName !== undefined) payload.plan_name = sub.planName;
  if (sub.category !== undefined) payload.category = sub.category;
  if (sub.amount !== undefined) payload.amount = Number(sub.amount);
  if (sub.currency !== undefined) payload.currency = sub.currency;
  if (sub.interval !== undefined) payload.interval_unit = sub.interval;
  if (sub.intervalCount !== undefined) payload.interval_count = sub.intervalCount;
  if (sub.nextRenewalDate !== undefined) payload.next_renewal_date = sub.nextRenewalDate;
  if (sub.status !== undefined) payload.status = sub.status;
  if (sub.provenance !== undefined) payload.source = sub.provenance;
  if (sub.remindersEnabled !== undefined) payload.reminder_enabled = sub.remindersEnabled;
  if (sub.notes !== undefined) payload.notes = sub.notes;
  if (sub.cancellationUrl !== undefined) payload.cancellation_url = sub.cancellationUrl;

  return payload;
}

export const SubscriptionApi = {
  async list(status?: string, search?: string): Promise<Subscription[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';

    const response = await apiClient.get<ApiSubscription[]>(`/api/v1/subscriptions${query}`);
    return response.map(mapApiToSubscription);
  },

  async create(sub: Partial<Subscription>): Promise<Subscription> {
    const payload = mapSubscriptionToApi(sub);
    const response = await apiClient.post<ApiSubscription>('/api/v1/subscriptions', payload);
    return mapApiToSubscription(response);
  },

  async get(id: string): Promise<Subscription> {
    const response = await apiClient.get<ApiSubscription>(`/api/v1/subscriptions/${id}`);
    return mapApiToSubscription(response);
  },

  async update(id: string, data: Partial<Subscription>): Promise<Subscription> {
    const payload = mapSubscriptionToApi(data);
    const response = await apiClient.patch<ApiSubscription>(`/api/v1/subscriptions/${id}`, payload);
    return mapApiToSubscription(response);
  },

  async remove(id: string): Promise<void> {
    return apiClient.del<void>(`/api/v1/subscriptions/${id}`);
  },

  async getInsights(): Promise<SpendInsightsResponse> {
    return apiClient.get<SpendInsightsResponse>('/api/v1/subscriptions/insights/summary');
  },

  async getCalendar(from: string, to: string): Promise<any[]> {
    const query = new URLSearchParams({ from, to }).toString();
    const response = await apiClient.get<any>(`/api/v1/calendar?${query}`);
    if (Array.isArray(response)) {
      return response;
    }
    return response?.occurrences || [];
  },
};
