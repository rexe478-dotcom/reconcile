import { apiClient } from './apiClient';

export interface CancellationAttemptResponse {
  id: string;
  subscription_id: string;
  user_id: string;
  destination_url: string;
  attempted_at: string;
  user_reported_outcome: string;
}

export const CancellationApi = {
  async logAttempt(
    subscriptionId: string,
    destinationUrl: string
  ): Promise<CancellationAttemptResponse> {
    return apiClient.post<CancellationAttemptResponse>(
      `/api/v1/subscriptions/${subscriptionId}/cancellation-attempts`,
      { destination_url: destinationUrl }
    );
  },

  async reportOutcome(
    subscriptionId: string,
    outcome: 'cancelled' | 'kept_active'
  ): Promise<any> {
    return apiClient.post<any>(
      `/api/v1/subscriptions/${subscriptionId}/cancellation-report`,
      { outcome }
    );
  },
};
