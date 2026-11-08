import { Subscription, SpendInsights } from '../types/subscription';

export class InsightsCalculator {
  /**
   * Normalizes any recurrence interval into an equivalent monthly spend.
   */
  public static normalizeToMonthly(amount: number, interval: string, intervalCount: number): number {
    const count = Math.max(1, intervalCount);
    switch (interval) {
      case 'month':
        return amount / count;
      case 'year':
        return amount / (count * 12);
      case 'week':
        return (amount * 52) / (count * 12);
      case 'day':
        return (amount * 365) / (count * 12);
      default:
        return amount;
    }
  }

  /**
   * Computes comprehensive spend insights for a list of active subscriptions.
   */
  public static computeInsights(subscriptions: Subscription[]): SpendInsights {
    const active = subscriptions.filter((s) => s.status !== 'cancelled' && s.status !== 'paused');

    let totalMonthly = 0;
    let monthlyCount = 0;
    let annualCount = 0;
    let weeklyCount = 0;
    let topCommitment: Subscription | undefined = undefined;
    let maxMonthlyEquivalent = -1;

    for (const sub of active) {
      const normalized = this.normalizeToMonthly(sub.amount, sub.interval, sub.intervalCount);
      totalMonthly += normalized;

      if (sub.interval === 'month') monthlyCount++;
      else if (sub.interval === 'year') annualCount++;
      else if (sub.interval === 'week' || sub.interval === 'day') weeklyCount++;

      if (normalized > maxMonthlyEquivalent) {
        maxMonthlyEquivalent = normalized;
        topCommitment = sub;
      }
    }

    const totalCount = active.length || 1;

    return {
      totalMonthlyNormalized: Math.round(totalMonthly),
      totalAnnualNormalized: Math.round(totalMonthly * 12),
      monthlyCommitmentCount: monthlyCount,
      annualCommitmentCount: annualCount,
      weeklyCommitmentCount: weeklyCount,
      monthlyPercentage: Math.round((monthlyCount / totalCount) * 100),
      annualPercentage: Math.round((annualCount / totalCount) * 100),
      weeklyPercentage: Math.round((weeklyCount / totalCount) * 100),
      topCommitment,
    };
  }

  /**
   * Formats currency with commas (defaults to Nigerian Naira ₦).
   */
  public static formatCurrency(amount: number, currency = 'NGN'): string {
    const symbol = currency === 'NGN' ? '\u20A6' : currency === 'USD' ? '$' : currency === 'EUR' ? '\u20AC' : '\u00A3';
    return `${symbol}${amount.toLocaleString('en-US')}`;
  }
}
