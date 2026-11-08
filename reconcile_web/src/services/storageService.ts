import { Subscription } from '../types/subscription';

const STORAGE_KEY = 'reconcile_subscriptions_v1';

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-netflix',
    providerName: 'Netflix',
    planName: 'Standard HD Plan',
    amount: 7500,
    currency: 'NGN',
    interval: 'month',
    intervalCount: 1,
    nextRenewalDate: '2025-04-28',
    anchorDay: 28,
    category: 'Entertainment',
    provenance: 'gmail',
    status: 'active',
    remindersEnabled: true,
    reminderDaysBefore: [1, 3],
    cancellationUrl: 'https://www.netflix.com/youraccount',
    notes: 'Family streaming profile.',
    createdAt: '2025-01-28T10:00:00Z',
    updatedAt: '2025-04-01T10:00:00Z',
  },
  {
    id: 'sub-spotify',
    providerName: 'Spotify',
    planName: 'Individual Premium',
    amount: 2500,
    currency: 'NGN',
    interval: 'month',
    intervalCount: 1,
    nextRenewalDate: '2025-04-30',
    anchorDay: 30,
    category: 'Entertainment',
    provenance: 'gmail',
    status: 'active',
    remindersEnabled: true,
    reminderDaysBefore: [1],
    cancellationUrl: 'https://www.spotify.com/account/overview/',
    notes: 'Music. Podcasts. More.',
    createdAt: '2025-01-30T10:00:00Z',
    updatedAt: '2025-04-01T10:00:00Z',
  },
  {
    id: 'sub-adobe',
    providerName: 'Adobe',
    planName: 'Creative Cloud Suite',
    amount: 14000,
    currency: 'NGN',
    interval: 'month',
    intervalCount: 1,
    nextRenewalDate: '2025-05-02',
    anchorDay: 2,
    category: 'Productivity',
    provenance: 'gmail',
    status: 'needs_review',
    remindersEnabled: true,
    reminderDaysBefore: [7, 3, 1],
    cancellationUrl: 'https://account.adobe.com/plans',
    notes: 'Photoshop, Illustrator, Premiere annual subscription.',
    createdAt: '2025-01-02T10:00:00Z',
    updatedAt: '2025-04-01T10:00:00Z',
  },
  {
    id: 'sub-googleone',
    providerName: 'Google One',
    planName: '100 GB Cloud Storage',
    amount: 500,
    currency: 'NGN',
    interval: 'month',
    intervalCount: 1,
    nextRenewalDate: '2025-05-12',
    anchorDay: 12,
    category: 'Cloud',
    provenance: 'manual',
    status: 'active',
    remindersEnabled: true,
    reminderDaysBefore: [1],
    cancellationUrl: 'https://one.google.com/settings',
    notes: 'Drive and Gmail expanded storage.',
    createdAt: '2025-01-12T10:00:00Z',
    updatedAt: '2025-04-01T10:00:00Z',
  },
  {
    id: 'sub-notion',
    providerName: 'Notion',
    planName: 'Team Workspace',
    amount: 4000,
    currency: 'NGN',
    interval: 'month',
    intervalCount: 1,
    nextRenewalDate: '2025-05-05',
    anchorDay: 5,
    category: 'Productivity',
    provenance: 'manual',
    status: 'active',
    remindersEnabled: true,
    reminderDaysBefore: [1],
    cancellationUrl: 'https://www.notion.so/settings',
    notes: 'Notes, docs, and knowledgebase.',
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-04-01T10:00:00Z',
  },
  {
    id: 'sub-youtube',
    providerName: 'YouTube Premium',
    planName: 'Individual Ad-free',
    amount: 1100,
    currency: 'NGN',
    interval: 'month',
    intervalCount: 1,
    nextRenewalDate: '2025-05-10',
    anchorDay: 10,
    category: 'Entertainment',
    provenance: 'manual',
    status: 'active',
    remindersEnabled: true,
    reminderDaysBefore: [1],
    cancellationUrl: 'https://www.youtube.com/paid_memberships',
    notes: 'Ad-free streaming and YouTube Music.',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-04-01T10:00:00Z',
  },
  {
    id: 'sub-chatgpt',
    providerName: 'ChatGPT Plus',
    planName: 'Monthly Plus Tier',
    amount: 20000,
    currency: 'NGN',
    interval: 'month',
    intervalCount: 1,
    nextRenewalDate: '2026-12-05',
    anchorDay: 5,
    category: 'Productivity',
    provenance: 'manual',
    status: 'active',
    remindersEnabled: true,
    reminderDaysBefore: [1, 3],
    cancellationUrl: 'https://chatgpt.com/#settings/Subscription',
    notes: 'GPT-4o and advanced data analysis.',
    createdAt: '2026-06-05T10:00:00Z',
    updatedAt: '2026-11-05T10:00:00Z',
  },
];

export class StorageService {
  public static loadSubscriptions(): Subscription[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.saveSubscriptions(INITIAL_SUBSCRIPTIONS);
        return INITIAL_SUBSCRIPTIONS;
      }
      return JSON.parse(data) as Subscription[];
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
    const jsonStr = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), subscriptions: subs }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reconcile_subscriptions_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
