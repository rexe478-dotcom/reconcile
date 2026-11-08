import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { RenewalEngine } from '../../services/renewalEngine';
import { InsightsCalculator } from '../../services/insightsCalculator';

interface NextUpCardProps {
  subscription?: Subscription;
  onSelect: (sub: Subscription) => void;
}

export const NextUpCard: React.FC<NextUpCardProps> = ({ subscription, onSelect }) => {
  if (!subscription) {
    return (
      <div className="rounded-3xl bg-[#141C18] border border-[#23332A] p-5 text-center text-xs text-gray-400">
        No active renewals scheduled.
      </div>
    );
  }

  const daysRemaining = RenewalEngine.getDaysRemaining(subscription.nextRenewalDate);
  const countdownLabel =
    daysRemaining === 0
      ? 'Due today'
      : daysRemaining === 1
      ? 'Due tomorrow'
      : `Due in ${daysRemaining} days`;

  return (
    <div
      onClick={() => onSelect(subscription)}
      className="group cursor-pointer rounded-3xl bg-gradient-to-r from-[#17241E] to-[#131D18] border border-[#23332A] hover:border-[#78E08F]/50 p-5 transition-all shadow-md active:scale-[0.99]"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#78E08F] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          Next Upcoming Renewal
        </span>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1F2C24] text-[#78E08F] font-bold border border-[#78E08F]/30">
          {countdownLabel}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1F2C25] border border-[#2E4236] flex items-center justify-center text-lg font-black text-white group-hover:scale-105 transition-transform">
            {subscription.providerName.charAt(0)}
          </div>
          <div>
            <h4 className="font-extrabold text-white text-base group-hover:text-[#78E08F] transition-colors">
              {subscription.providerName}
            </h4>
            <p className="text-xs text-gray-400">{subscription.planName}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-base sm:text-lg font-black text-white">
            {InsightsCalculator.formatCurrency(subscription.amount, subscription.currency)}
          </div>
          <div className="text-[11px] text-gray-400 flex items-center justify-end gap-1">
            <span>Renew {subscription.nextRenewalDate}</span>
            <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-[#78E08F] transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};
