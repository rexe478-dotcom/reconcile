import { Subscription } from '../types/subscription';

const STORAGE_KEY = 'reconcile_subscriptions_v2';

function getDateRelative(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-netflix',
    providerName: 'Netflix',
    planName: 'Standard HD Plan',
    amount: 7500,
    currency: 'NGN',
    interval: 'month',
    intervalCount: 1,
    nextRenewalDate: getDateRelative(3),
    anchorDay: new Date(getDateRelative(3)).getDate(),
    category: 'Entertainment',
    provenance: 'gmail',
    status: 'active',
    remindersEnabled: true,
    reminderDaysBefore: [1, 3],
    cancellationUrl: 'https://www.netflix.com/youraccount',
    notes: 'Family streaming profile.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-spotify',
    providerName: 'Spotify',
    planName: 'Individual Premium',
    amount: 2500,
    currency: 'NGN',
    interval: 'month',
    intervalCount: 1,
    nextRenewalDate: getDateRelative(7),
    anchorDay: new Date(getDateRelative(7)).getDate(),
    category: 'Entertainment',
    provenance: 'gmail',
    status: 'active',
    remindersEnabled: true,
    reminderDaysBefore: [1],
    cancellationUrl: 'https://www.spotify.com/account/overview/',
    notes: 'Music. Podcasts. More.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-adobe',
    providerName: 'Adobe',
    planName: 'Creative Cloud Suite',
    amount: 14000,
    currency: 'NGN',
    interval: 'month',
    intervalCount: 1,
    nextRenewalDate: getDateRelative(12),
    anchorDay: new Date(getDateRelative(12)).getDate(),
    category: 'Productivity',
    provenance: 'gmail',
    status: 'needs_review',
    remindersEnabled: true,
    reminderDaysBefore: [7, 3, 1],
    cancellationUrl: 'https://account.adobe.com/plans',
    notes: 'Photoshop, Illustrator, Premiere annual subscription.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-googleone',
    providerName: 'Google One',
    planName: '100 GB Cloud Storage',
    amount: 500,
    currency: 'NGN',
    interval: 'month',
    intervalCount: 1,
    nextRenewalDate: getDateRelative(18),
    anchorDay: new Date(getDateRelative(18)).getDate(),
    category: 'Cloud',
    provenance: 'manual',
    status: 'active',
    remindersEnabled: true,
    reminderDaysBefore: [1],
    cancellationUrl: 'https://one.google.com/settings',
    notes: 'Drive and Gmail expanded storage.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-notion',
    providerName: 'Notion',
    planName: 'Team Workspace',
    amount: 4000,
    currency: 'NGN',
    interval: 'month',
    intervalCount: 1,
    nextRenewalDate: getDateRelative(22),
    anchorDay: new Date(getDateRelative(22)).getDate(),
    category: 'Productivity',
    provenance: 'manual',
    status: 'active',
    remindersEnabled: true,
    reminderDaysBefore: [1],
    cancellationUrl: 'https://www.notion.so/settings',
    notes: 'Notes, docs, and knowledgebase.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-youtube',
    providerName: 'YouTube Premium',
    planName: 'Individual Ad-free',
    amount: 1100,
    currency: 'NGN',
    interval: 'month',
    intervalCount: 1,
    nextRenewalDate: getDateRelative(26),
    anchorDay: new Date(getDateRelative(26)).getDate(),
    category: 'Entertainment',
    provenance: 'manual',
    status: 'active',
    remindersEnabled: true,
    reminderDaysBefore: [1],
    cancellationUrl: 'https://www.youtube.com/paid_memberships',
    notes: 'Ad-free streaming and YouTube Music.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-chatgpt',
    providerName: 'ChatGPT Plus',
    planName: 'Monthly Plus Tier',
    amount: 20000,
    currency: 'NGN',
    interval: 'month',
    intervalCount: 1,
    nextRenewalDate: getDateRelative(31),
    anchorDay: new Date(getDateRelative(31)).getDate(),
    category: 'Productivity',
    provenance: 'manual',
    status: 'active',
    remindersEnabled: true,
    reminderDaysBefore: [1, 3],
    cancellationUrl: 'https://chatgpt.com/#settings/Subscription',
    notes: 'GPT-4o and advanced data analysis.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class StorageService {
  public static loadSubscriptions(): Subscription[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      let list: Subscription[] = [];
      if (!data) {
        list = INITIAL_SUBSCRIPTIONS;
        this.saveSubscriptions(list);
      } else {
        list = JSON.parse(data) as Subscription[];
      }

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
      console.error('Failed to load subscriptions from localStorage, fallback to demo data', e);
      return INITIAL_SUBSCRIPTIONS;
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
    this.saveSubscriptions(INITIAL_SUBSCRIPTIONS);
    return INITIAL_SUBSCRIPTIONS;
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
