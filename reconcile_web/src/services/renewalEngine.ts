import { Subscription, RenewalOccurrence } from '../types/subscription';

export class RenewalEngine {
  /**
   * Helper to determine if a year is a leap year in the Gregorian calendar.
   */
  public static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Returns the exact number of days in a given year and month (1-12).
   */
  public static getDaysInMonth(year: number, month: number): number {
    if (month === 2) {
      return this.isLeapYear(year) ? 29 : 28;
    }
    if ([4, 6, 9, 11].includes(month)) {
      return 30;
    }
    return 31;
  }

  /**
   * Calculates the next renewal date adhering to Gregorian month-end clamping
   * and anchor-day retention policies.
   */
  public static calculateNextRenewal(subscription: Subscription): string {
    const current = new Date(subscription.nextRenewalDate + 'T00:00:00Z');
    let year = current.getUTCFullYear();
    let month = current.getUTCMonth() + 1; // 1-12
    let day = current.getUTCDate();
    const anchor = subscription.anchorDay ?? day;

    switch (subscription.interval) {
      case 'day': {
        current.setUTCDate(day + subscription.intervalCount);
        return current.toISOString().split('T')[0];
      }
      case 'week': {
        current.setUTCDate(day + subscription.intervalCount * 7);
        return current.toISOString().split('T')[0];
      }
      case 'month': {
        const totalMonths = month + subscription.intervalCount;
        year += Math.floor((totalMonths - 1) / 12);
        month = ((totalMonths - 1) % 12) + 1;
        const maxDay = this.getDaysInMonth(year, month);
        day = Math.min(anchor, maxDay);
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
      case 'year': {
        year += subscription.intervalCount;
        const maxDay = this.getDaysInMonth(year, month);
        day = Math.min(anchor, maxDay);
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
  }

  /**
   * Computes the number of days remaining until a given date string (YYYY-MM-DD).
   */
  public static getDaysRemaining(targetDateStr: string, fromDate = new Date()): number {
    const target = new Date(targetDateStr + 'T00:00:00Z');
    const today = new Date(
      Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
    );
    const diffMs = target.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Generates upcoming occurrence timeline for active subscriptions within a specified horizon.
   */
  public static projectOccurrences(
    subscriptions: Subscription[],
    horizonDays = 60
  ): RenewalOccurrence[] {
    const occurrences: RenewalOccurrence[] = [];
    const today = new Date();

    for (const sub of subscriptions) {
      if (sub.status === 'cancelled') continue;

      let nextDate = sub.nextRenewalDate;
      let days = this.getDaysRemaining(nextDate, today);

      // If already past, advance it
      let tempSub = { ...sub };
      while (days < 0) {
        nextDate = this.calculateNextRenewal(tempSub);
        tempSub = { ...tempSub, nextRenewalDate: nextDate };
        days = this.getDaysRemaining(nextDate, today);
      }

      if (days <= horizonDays) {
        occurrences.push({
          subscriptionId: sub.id,
          providerName: sub.providerName,
          planName: sub.planName,
          amount: sub.amount,
          currency: sub.currency,
          date: nextDate,
          daysRemaining: days,
        });
      }
    }

    return occurrences.sort((a, b) => a.date.localeCompare(b.date));
  }
}
