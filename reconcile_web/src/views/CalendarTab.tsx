import React, { useMemo } from 'react';
import { Calendar as CalendarIcon, Download, Clock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Subscription } from '../types/subscription';
import { BrandIcon } from '../components/common/BrandIcon';
import { downloadCalendarIcs } from '../services/calendarExportService';
import { InsightsCalculator } from '../services/insightsCalculator';

interface CalendarTabProps {
  subscriptions: Subscription[];
  onSelectSubscription: (sub: Subscription) => void;
  onOpenCancellation: (sub: Subscription) => void;
  showToast: (msg: string) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  subscriptions,
  onSelectSubscription,
  onOpenCancellation,
  showToast,
}) => {
  const activeSubs = useMemo(() => {
    return subscriptions
      .filter((s) => s.status === 'active')
      .sort((a, b) => a.nextRenewalDate.localeCompare(b.nextRenewalDate));
  }, [subscriptions]);

  const getDaysLeft = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const groups = useMemo(() => {
    const thisWeek: Subscription[] = [];
    const nextWeek: Subscription[] = [];
    const thisMonth: Subscription[] = [];
    const future: Subscription[] = [];

    activeSubs.forEach((sub) => {
      const days = getDaysLeft(sub.nextRenewalDate);
      if (days <= 7) {
        thisWeek.push(sub);
      } else if (days <= 14) {
        nextWeek.push(sub);
      } else if (days <= 31) {
        thisMonth.push(sub);
      } else {
        future.push(sub);
      }
    });

    return [
      { title: 'Due This Week (<= 7 Days)', subs: thisWeek, color: 'text-amber-700 bg-amber-50 border-amber-200' },
      { title: 'Due Next Week (8-14 Days)', subs: nextWeek, color: 'text-[#3D5438] bg-[#E2EBD8]/50 border-[#E2EBD8]' },
      { title: 'Later This Month (15-30 Days)', subs: thisMonth, color: 'text-[#171717] bg-[#F5F2EA] border-[#E5E0D8]' },
      { title: 'Future Scheduled Renewals (> 30 Days)', subs: future, color: 'text-[#737373] bg-white border-[#E5E0D8]' },
    ].filter((g) => g.subs.length > 0);
  }, [activeSubs]);

  return (
    <div className="space-y-6">
      {/* Header with Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#E5E0D5] shadow-xs">
        <div className="flex items-center gap-3">
          <img src="./assets/illustrations/calendar.png" alt="Calendar" className="w-11 h-11 object-contain shrink-0" />
          <div>
            <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
              Renewal Calendar & Agenda
            </h1>
            <p className="text-xs text-[#858477] mt-0.5">
              Independent schedule tracking for every subscription. Export to Apple Calendar, Google Calendar, or Outlook.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            downloadCalendarIcs(subscriptions);
            showToast('Downloaded .ICS Calendar file.');
          }}
          className="min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3D5438] hover:bg-[#32462E] text-white text-xs font-bold shadow-xs self-start sm:self-auto btn-tactile"
        >
          <Download className="w-4 h-4" />
          <span>Export .ICS Calendar</span>
        </button>
      </div>

      {/* Chronological Buckets */}
      <div className="space-y-6">
        {groups.map((group, idx) => {
          const totalInGroup = group.subs.reduce((sum, s) => sum + s.amount, 0);

          return (
            <div key={idx} className="space-y-3">
              {/* Group Title Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${group.color}`}>
                    {group.title}
                  </span>
                  <span className="text-xs text-[#737373] font-medium">
                    ({group.subs.length} items)
                  </span>
                </div>

                <div className="text-xs font-bold text-[#171717] tabular-nums">
                  Total: {InsightsCalculator.formatCurrency(totalInGroup)}
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.subs.map((sub) => {
                  const days = getDaysLeft(sub.nextRenewalDate);
                  return (
                    <div
                      key={sub.id}
                      onClick={() => onSelectSubscription(sub)}
                      className="p-4 rounded-2xl bg-white border border-[#E5E0D8] hover:border-[#3D5438]/50 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group card-lift"
                    >
                      <div className="flex items-center gap-3">
                        <BrandIcon providerName={sub.providerName} size={42} />
                        <div>
                          <div className="text-sm font-bold text-[#171717] group-hover:text-[#3D5438] transition-colors">
                            {sub.providerName}
                          </div>
                          <div className="text-xs text-[#737373]">
                            {sub.planName || sub.category}
                          </div>
                          <div className="text-[11px] font-semibold text-[#3D5438] mt-0.5 tabular-nums">
                            {days === 0 ? 'Due Today' : days === 1 ? 'Due Tomorrow' : `In ${days} days`} ({sub.nextRenewalDate})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-black text-[#171717] tabular-nums">
                            {InsightsCalculator.formatCurrency(sub.amount, sub.currency)}
                          </div>
                          <span className="text-[10px] text-[#737373] capitalize">
                            /{sub.interval}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCancellation(sub);
                          }}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-amber-50 active:scale-95 text-amber-800 border border-amber-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500/40"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {groups.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E0D8] space-y-2">
            <AlertCircle className="w-8 h-8 text-[#737373] mx-auto" />
            <h3 className="text-base font-bold text-[#171717]">No upcoming renewals</h3>
            <p className="text-xs text-[#737373]">Add your subscriptions to see renewal projections on this agenda.</p>
          </div>
        )}
      </div>
    </div>
  );
};