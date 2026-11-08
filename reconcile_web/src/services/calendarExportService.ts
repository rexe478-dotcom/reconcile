import { Subscription } from '../types/subscription';

/**
 * Formats an ISO YYYY-MM-DD date into iCalendar YYYYMMDD string.
 */
function toIcsDate(isoDate: string): string {
  return isoDate.replace(/-/g, '');
}

/**
 * Escapes characters for iCalendar text fields according to RFC 5545.
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Builds an RFC 5545 compliant RRULE recurrence string for a subscription.
 */
function buildRRule(sub: Subscription): string {
  const count = sub.intervalCount || 1;
  switch (sub.interval) {
    case 'day':
      return count === 1 ? 'RRULE:FREQ=DAILY' : `RRULE:FREQ=DAILY;INTERVAL=${count}`;
    case 'week':
      return count === 1 ? 'RRULE:FREQ=WEEKLY' : `RRULE:FREQ=WEEKLY;INTERVAL=${count}`;
    case 'year':
      return count === 1 ? 'RRULE:FREQ=YEARLY' : `RRULE:FREQ=YEARLY;INTERVAL=${count}`;
    case 'month':
    default:
      return count === 1 ? 'RRULE:FREQ=MONTHLY' : `RRULE:FREQ=MONTHLY;INTERVAL=${count}`;
  }
}

/**
 * Generates an RFC 5545 iCalendar (.ics) string containing all active subscriptions.
 */
export function generateIcsCalendar(subscriptions: Subscription[]): string {
  const activeSubs = subscriptions.filter((s) => s.status !== 'cancelled');
  const now = new Date();
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Reconcile//Subscription Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Reconcile Subscriptions',
    'X-WR-TIMEZONE:UTC',
  ];

  for (const sub of activeSubs) {
    const startDate = toIcsDate(sub.nextRenewalDate);
    const summary = escapeIcsText(`${sub.providerName} Renewal (${sub.currency}${sub.amount.toLocaleString()})`);
    const descriptionParts: string[] = [];
    if (sub.planName) descriptionParts.push(`Plan: ${sub.planName}`);
    descriptionParts.push(`Cadence: Every ${sub.intervalCount > 1 ? `${sub.intervalCount} ` : ''}${sub.interval}`);
    descriptionParts.push(`Amount: ${sub.currency}${sub.amount.toLocaleString()}`);
    if (sub.notes) descriptionParts.push(`Notes: ${sub.notes}`);
    if (sub.cancellationUrl) descriptionParts.push(`Cancellation Portal: ${sub.cancellationUrl}`);

    const description = escapeIcsText(descriptionParts.join('\n'));
    const rrule = buildRRule(sub);

    lines.push(
      'BEGIN:VEVENT',
      `UID:reconcile-${sub.id}@reconcile.app`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;VALUE=DATE:${startDate}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      rrule,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcsText(`Reminder: ${sub.providerName} renews tomorrow`)}`,
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

/**
 * Triggers a browser download of the subscriptions as an .ics calendar file.
 */
export function downloadCalendarIcs(subscriptions: Subscription[], filename = 'reconcile-renewals.ics'): void {
  const icsContent = generateIcsCalendar(subscriptions);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
