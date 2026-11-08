import { Subscription } from '../types/subscription';

declare const google: any;

export interface RealGmailInvoice {
  id: string;
  providerName: string;
  planName: string;
  amount: number;
  currency: string;
  date: string;
  subject: string;
  snippet: string;
}

export class RealGmailService {
  private static DEFAULT_CLIENT_ID = '34227622854-asdlfh7bn16nq1p9bbube90f7ic80q0a.apps.googleusercontent.com';

  public static getClientId(): string {
    return (
      (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
      localStorage.getItem('reconcile_google_client_id') ||
      this.DEFAULT_CLIENT_ID
    );
  }

  public static setClientId(id: string): void {
    if (id.trim()) {
      localStorage.setItem('reconcile_google_client_id', id.trim());
    } else {
      localStorage.removeItem('reconcile_google_client_id');
    }
  }

  /**
   * Request Real Google OAuth token
   * Defaults to basic email/profile for frictionless sign-in; pass gmail.readonly for inbox scanning
   */
  public static async requestGoogleAccessToken(
    scope: string = 'email profile openid'
  ): Promise<string> {
    const clientId = this.getClientId();
    if (!clientId) {
      throw new Error('MISSING_CLIENT_ID');
    }

    if (typeof google === 'undefined' || !google.accounts?.oauth2) {
      throw new Error('GOOGLE_GSI_NOT_LOADED');
    }

    return new Promise((resolve, reject) => {
      try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope,
          callback: (response: any) => {
            if (response.error) {
              reject(new Error(response.error_description || response.error));
            } else if (response.access_token) {
              resolve(response.access_token);
            } else {
              reject(new Error('No access token returned from Google'));
            }
          },
        });
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Query real Gmail messages searching for subscription receipts & invoices
   */
  public static async fetchRealSubscriptionReceipts(accessToken: string): Promise<Subscription[]> {
    // 1. Search messages matching subscription receipts
    const searchQuery = encodeURIComponent(
      'subject:(receipt OR invoice OR renewal OR subscription OR "payment confirmation" OR "billing")'
    );
    const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${searchQuery}&maxResults=10`;

    const searchRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!searchRes.ok) {
      const errJson = await searchRes.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Gmail API Error: ${searchRes.statusText}`);
    }

    const searchData = await searchRes.json();
    const messageRefs = searchData.messages || [];

    if (messageRefs.length === 0) {
      return [];
    }

    // 2. Fetch details for each message
    const subscriptions: Subscription[] = [];

    for (const ref of messageRefs.slice(0, 8)) {
      try {
        const msgUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${ref.id}?format=full`;
        const msgRes = await fetch(msgUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        });

        if (!msgRes.ok) continue;
        const msgData = await msgRes.json();

        const headers = msgData.payload?.headers || [];
        const fromHeader = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';
        const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '';
        const dateHeader = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';
        const snippet = msgData.snippet || '';

        // Extract provider name
        const providerName = this.extractProviderName(fromHeader, subjectHeader);
        if (!providerName) continue;

        // Extract price & currency
        const { amount, currency } = this.extractAmount(snippet, subjectHeader);

        // Compute next renewal date (default 1 month forward from receipt date)
        let receiptDate = new Date();
        if (dateHeader) {
          const parsed = new Date(dateHeader);
          if (!isNaN(parsed.getTime())) receiptDate = parsed;
        }

        const nextDate = new Date(receiptDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        const nextRenewalDate = nextDate.toISOString().split('T')[0];

        subscriptions.push({
          id: `sub_gmail_${ref.id}`,
          providerName,
          planName: subjectHeader.slice(0, 40) || 'Monthly Plan',
          amount: amount || 2500,
          currency: currency || 'NGN',
          interval: 'month',
          intervalCount: 1,
          nextRenewalDate,
          anchorDay: nextDate.getDate(),
          category: this.categorizeProvider(providerName),
          provenance: 'gmail',
          status: 'active',
          remindersEnabled: true,
          reminderDaysBefore: [1, 3],
          notes: `Discovered from real Gmail receipt: "${subjectHeader}"`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Failed parsing message', ref.id, e);
      }
    }

    return subscriptions;
  }

  private static extractProviderName(from: string, subject: string): string {
    const text = `${from} ${subject}`.toLowerCase();
    if (text.includes('spotify')) return 'Spotify';
    if (text.includes('netflix')) return 'Netflix';
    if (text.includes('apple') || text.includes('itunes') || text.includes('icloud')) return 'Apple';
    if (text.includes('adobe')) return 'Adobe';
    if (text.includes('youtube') || text.includes('google play') || text.includes('google one')) return 'Google One';
    if (text.includes('chatgpt') || text.includes('openai')) return 'ChatGPT Plus';
    if (text.includes('dstv') || text.includes('multichoice')) return 'DSTV';
    if (text.includes('notion')) return 'Notion';
    if (text.includes('canva')) return 'Canva';
    if (text.includes('prime') || text.includes('amazon')) return 'Amazon Prime';
    if (text.includes('microsoft') || text.includes('office 365')) return 'Microsoft 365';
    if (text.includes('github')) return 'GitHub';
    if (text.includes('figma')) return 'Figma';
    if (text.includes('dropbox')) return 'Dropbox';

    // Fallback: extract domain or sender name
    const match = from.match(/^([^<]+)/);
    if (match && match[1].trim()) {
      return match[1].replace(/["']/g, '').trim().slice(0, 24);
    }
    return 'Subscription Service';
  }

  private static extractAmount(snippet: string, subject: string): { amount: number; currency: string } {
    const text = `${snippet} ${subject}`;

    // Match Nigerian Naira (? or NGN)
    const nairaMatch = text.match(/(?:\u20A6|NGN)\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (nairaMatch) {
      const val = parseFloat(nairaMatch[1].replace(/,/g, ''));
      if (!isNaN(val)) return { amount: val, currency: 'NGN' };
    }

    // Match USD ($ or USD)
    const usdMatch = text.match(/(?:\$|USD)\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (usdMatch) {
      const val = parseFloat(usdMatch[1].replace(/,/g, ''));
      if (!isNaN(val)) return { amount: val, currency: 'USD' };
    }

    // Match Euro (€ or EUR)
    const eurMatch = text.match(/(?:€|EUR)\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (eurMatch) {
      const val = parseFloat(eurMatch[1].replace(/,/g, ''));
      if (!isNaN(val)) return { amount: val, currency: 'EUR' };
    }

    return { amount: 2500, currency: 'NGN' };
  }

  private static categorizeProvider(name: string): string {
    const n = name.toLowerCase();
    if (['netflix', 'spotify', 'dstv', 'youtube', 'prime'].some((s) => n.includes(s))) return 'Entertainment';
    if (['adobe', 'canva', 'figma'].some((s) => n.includes(s))) return 'Creative';
    if (['chatgpt', 'notion', 'github', 'microsoft', 'google'].some((s) => n.includes(s))) return 'Productivity';
    return 'General';
  }
}
