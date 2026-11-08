import React from 'react';
import { Mail, Shield, ChevronRight } from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { InsightsCalculator } from '../../services/insightsCalculator';

interface SubscriptionCardProps {
  subscription: Subscription;
  onSelect: (sub: Subscription) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onSelect }) => {
  const statusStyles = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    needs_review: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    paused: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  const getProviderBrandColor = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('netflix')) return 'border-red-500/40 text-red-400';
    if (n.includes('spotify')) return 'border-green-500/40 text-green-400';
    if (n.includes('apple') || n.includes('icloud')) return 'border-gray-400/40 text-gray-200';
    if (n.includes('adobe') || n.includes('youtube')) return 'border-red-600/40 text-red-500';
    if (n.includes('chatgpt')) return 'border-teal-500/40 text-teal-400';
    return 'border-[#28362F] text-white';
  };

  return (
    <div
      onClick={() => onSelect(subscription)}
      className="group cursor-pointer rounded-2xl bg-[#141C18] border border-[#23332A] hover:border-[#78E08F]/50 p-4 transition-all duration-200 hover:shadow-lg hover:bg-[#16211C] active:scale-[0.99] flex items-center justify-between gap-4"
    >
      {/* Left: Avatar & Details */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-11 h-11 rounded-xl bg-[#1B2720] border ${getProviderBrandColor(
            subscription.providerName
          )} flex items-center justify-center font-black text-base shrink-0 group-hover:scale-105 transition-transform`}
        >
          {subscription.providerName.charAt(0)}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white text-sm sm:text-base truncate group-hover:text-[#78E08F] transition-colors">
              {subscription.providerName}
            </h4>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                statusStyles[subscription.status]
              }`}
            >
              {subscription.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
            <span className="truncate">{subscription.planName}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[11px] shrink-0">
              {subscription.provenance === 'gmail' ? (
                <>
                  <Mail className="w-3 h-3 text-[#78E08F]" />
                  <span>Gmail</span>
                </>
              ) : (
                <>
                  <Shield className="w-3 h-3 text-gray-400" />
                  <span>Manual</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Amount & Renewal Date */}
      <div className="text-right shrink-0 flex items-center gap-2 sm:gap-3">
        <div>
          <div className="text-sm sm:text-base font-extrabold text-white">
            {InsightsCalculator.formatCurrency(subscription.amount, subscription.currency)}
            <span className="text-xs font-normal text-gray-400">/{subscription.interval}</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            Renews {subscription.nextRenewalDate}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#78E08F] transition-colors" />
      </div>
    </div>
  );
};
