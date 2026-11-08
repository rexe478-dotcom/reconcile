import { Subscription } from '../types/subscription';

export interface NotificationStatus {
  supported: boolean;
  permission: NotificationPermission;
}

export const NotificationService = {
  getStatus(): NotificationStatus {
    const supported = typeof window !== 'undefined' && 'Notification' in window;
    const permission: NotificationPermission = supported ? Notification.permission : 'denied';
    return { supported, permission };
  },

  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const result = await Notification.requestPermission();
      return result;
    } catch (e) {
      console.warn('Error requesting notification permission', e);
      return 'denied';
    }
  },

  /**
   * Scans active subscriptions and checks if any renew within the given lead days.
   * Dispatches native notifications if permissions are granted and not already notified today.
   */
  checkAndNotifyRenewals(subscriptions: Subscription[], leadDays = 3): number {
    const { supported, permission } = this.getStatus();
    if (!supported || permission !== 'granted') return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let notificationsDispatched = 0;

    for (const sub of subscriptions) {
      if (sub.status !== 'active' || !sub.remindersEnabled) continue;

      const renewalDate = new Date(sub.nextRenewalDate + 'T00:00:00');
      const diffMs = renewalDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Check if renewal is today or within leadDays
      if (diffDays >= 0 && diffDays <= leadDays) {
        const todayStr = today.toISOString().split('T')[0];
        const cacheKey = `reconcile_notif_${sub.id}_${sub.nextRenewalDate}_${todayStr}`;

        // Guard against duplicate notification on the same day
        if (localStorage.getItem(cacheKey)) continue;

        let title = '';
        let body = '';

        if (diffDays === 0) {
          title = `⚡ Renewal Due Today: ${sub.providerName}`;
          body = `${sub.providerName} renews today for ${sub.currency}${sub.amount.toLocaleString()}.`;
        } else if (diffDays === 1) {
          title = `⏰ Renewal Tomorrow: ${sub.providerName}`;
          body = `${sub.providerName} will renew tomorrow for ${sub.currency}${sub.amount.toLocaleString()}.`;
        } else {
          title = `📅 Upcoming Renewal: ${sub.providerName}`;
          body = `${sub.providerName} renews in ${diffDays} days on ${sub.nextRenewalDate}.`;
        }

        try {
          new Notification(title, {
            body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: `sub-renewal-${sub.id}`,
          });

          localStorage.setItem(cacheKey, 'dispatched');
          notificationsDispatched++;
        } catch (e) {
          console.warn('Failed to dispatch notification', e);
        }
      }
    }

    return notificationsDispatched;
  },

  /**
   * Returns a list of in-app renewal alert messages for display in the notification panel.
   */
  getUpcomingAlerts(subscriptions: Subscription[]): Array<{
    id: string;
    subId: string;
    providerName: string;
    amount: number;
    currency: string;
    renewalDate: string;
    daysRemaining: number;
    urgency: 'high' | 'medium' | 'low';
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return subscriptions
      .filter((s) => s.status === 'active')
      .map((sub) => {
        const renewalDate = new Date(sub.nextRenewalDate + 'T00:00:00');
        const diffMs = renewalDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const urgency: 'high' | 'medium' | 'low' =
          daysRemaining <= 1 ? 'high' : daysRemaining <= 5 ? 'medium' : 'low';
        return {
          id: `alert-${sub.id}-${sub.nextRenewalDate}`,
          subId: sub.id,
          providerName: sub.providerName,
          amount: sub.amount,
          currency: sub.currency,
          renewalDate: sub.nextRenewalDate,
          daysRemaining,
          urgency,
        };
      })
      .filter((alert) => alert.daysRemaining >= 0 && alert.daysRemaining <= 14)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  },
};
