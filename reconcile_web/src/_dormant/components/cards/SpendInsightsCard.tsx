import React from 'react';
import { PieChart, DollarSign, CalendarCheck } from 'lucide-react';
import { SpendInsights } from '../../types/subscription';
import { InsightsCalculator } from '../../services/insightsCalculator';

interface SpendInsightsCardProps {
  insights: SpendInsights;
}

export const SpendInsightsCard: React.FC<SpendInsightsCardProps> = ({ insights }) => {
  return (
    <div className="rounded-3xl bg-[#141C18] border border-[#23332A] p-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E2A23]">
        <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
          <PieChart className="w-4 h-4 text-[#78E08F]" />
          <span>Commitment Breakdown</span>
        </div>
        <span className="text-xs text-gray-400">Gregorian Normalized</span>
      </div>

      {/* Cadence Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#18231D] border border-[#23332A]">
          <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
            <CalendarCheck className="w-3.5 h-3.5 text-[#78E08F]" />
            Monthly Plans
          </div>
          <div className="text-xl font-black text-white">{insights.monthlyCommitmentCount}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">{insights.monthlyPercentage}% of total</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#18231D] border border-[#23332A]">
          <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-[#60A5FA]" />
            Annual Plans
          </div>
          <div className="text-xl font-black text-white">{insights.annualCommitmentCount}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">{insights.annualPercentage}% of total</div>
        </div>
      </div>

      {/* Visual Cadence Bar */}
      <div>
        <div className="w-full h-2.5 rounded-full bg-[#1B2720] overflow-hidden flex">
          <div
            style={{ width: `${insights.monthlyPercentage}%` }}
            className="bg-[#78E08F] h-full transition-all"
            title={`Monthly: ${insights.monthlyPercentage}%`}
          />
          <div
            style={{ width: `${insights.annualPercentage}%` }}
            className="bg-[#60A5FA] h-full transition-all"
            title={`Annual: ${insights.annualPercentage}%`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#78E08F]" />
            Monthly recurring ({insights.monthlyPercentage}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#60A5FA]" />
            Annual recurring ({insights.annualPercentage}%)
          </span>
        </div>
      </div>

      {/* Top commitment spotlight */}
      {insights.topCommitment && (
        <div className="p-3.5 rounded-2xl bg-[#18231D] border border-[#23332A] flex items-center justify-between text-xs">
          <div>
            <div className="text-gray-400 text-[11px]">Largest Single Subscription</div>
            <div className="font-bold text-white text-sm mt-0.5">{insights.topCommitment.providerName}</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-[#78E08F] text-sm">
              {InsightsCalculator.formatCurrency(insights.topCommitment.amount, insights.topCommitment.currency)}
            </div>
            <div className="text-[10px] text-gray-400">/{insights.topCommitment.interval}</div>
          </div>
        </div>
      )}
    </div>
  );
};
