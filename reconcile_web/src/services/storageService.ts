import { Subscription } from '../types/subscription';

const STORAGE_KEY = 'reconcile_subscriptions_v2';

function getDateRelative(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [];

export class StorageService {
  public static loadSubscriptions(): Subscription[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }
      const list = JSON.parse(data) as Subscription[];

      // Auto-advance any past dates so they are always current and positive
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      return list.map((sub) => {
        if (!sub.nextRenewalDate || sub.nextRenewalDate < todayStr) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + 5);
          return {
            ...sub,
            nextRenewalDate: nextDate.toISOString().split('T')[0],
          };
        }
        return sub;
      });
    } catch (e) {
      console.error('Failed to load subscriptions from localStorage', e);
      return [];
    }
  }

  public static saveSubscriptions(subs: Subscription[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
    } catch (e) {
      console.error('Failed to save subscriptions to localStorage', e);
    }
  }

  public static resetToDemo(): Subscription[] {
    this.saveSubscriptions([]);
    return [];
  }

  public static exportJSON(subs: Subscription[]): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(subs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `reconcile_subscriptions_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}
