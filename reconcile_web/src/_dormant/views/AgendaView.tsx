import React from 'react';
import { RenewalOccurrence, Subscription } from '../types/subscription';
import { CalendarDays, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { InsightsCalculator } from '../services/insightsCalculator';

interface AgendaViewProps {
  occurrences: RenewalOccurrence[];
  subscriptions: Subscription[];
  onSelectSubscriptionById: (id: string) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  occurrences,
  subscriptions,
  onSelectSubscriptionById,
}) => {
  const totalUpcomingAmount = occurrences.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Renewal Agenda</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Chronological calendar projection of upcoming renewals based on Gregorian rules.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-[#141C18] border border-[#23332A] text-right">
          <div className="text-[11px] text-gray-400">Total Upcoming Horizon</div>
          <div className="text-base sm:text-lg font-black text-[#78E08F]">
            {InsightsCalculator.formatCurrency(totalUpcomingAmount)}
          </div>
        </div>
      </div>

      {/* Timeline items */}
      <div className="space-y-3">
        {occurrences.map((occ, idx) => {
          const isUrgent = occ.daysRemaining <= 3;
          const sub = subscriptions.find((s) => s.id === occ.subscriptionId);

          return (
            <div
              key={`${occ.subscriptionId}-${occ.date}-${idx}`}
              onClick={() => onSelectSubscriptionById(occ.subscriptionId)}
              className="group cursor-pointer p-4 rounded-2xl bg-[#141C18] border border-[#23332A] hover:border-[#78E08F]/50 transition-all flex items-center justify-between gap-4"
            >
              {/* Date & Indicator */}
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black shrink-0 border ${
                    isUrgent
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-[#18231D] text-gray-300 border-[#28362F]'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    {new Date(occ.date).toLocaleString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-sm font-black">
                    {new Date(occ.date).getDate()}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm sm:text-base group-hover:text-[#78E08F] transition-colors">
                      {occ.providerName}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        occ.daysRemaining === 0
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : occ.daysRemaining === 1
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-[#1B2720] text-gray-300 border-[#28362F]'
                      }`}
                    >
                      {occ.daysRemaining === 0
                        ? 'Today'
                        : occ.daysRemaining === 1
                        ? 'Tomorrow'
                        : `In ${occ.daysRemaining} days`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{occ.planName}</div>
                </div>
              </div>

              {/* Amount & Arrow */}
              <div className="text-right flex items-center gap-3">
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-white">
                    {InsightsCalculator.formatCurrency(occ.amount, occ.currency)}
                  </div>
                  <div className="text-[11px] text-gray-400">{occ.date}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#78E08F] transition-colors" />
              </div>
            </div>
          );
        })}

        {occurrences.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-[#141C18] border border-[#23332A] text-gray-400 space-y-2">
            <CalendarDays className="w-8 h-8 mx-auto text-gray-500" />
            <h4 className="font-bold text-white text-sm">No scheduled renewals</h4>
            <p className="text-xs">Add subscriptions with upcoming renewal dates to populate your agenda.</p>
          </div>
        )}
      </div>
    </div>
  );
};
