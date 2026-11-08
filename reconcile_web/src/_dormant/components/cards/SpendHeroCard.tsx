import React from 'react';
import { TrendingUp, ShieldCheck, ChevronRight } from 'lucide-react';
import { SpendInsights } from '../../types/subscription';
import { InsightsCalculator } from '../../services/insightsCalculator';

interface SpendHeroCardProps {
  insights: SpendInsights;
  onViewInsights: () => void;
}

export const SpendHeroCard: React.FC<SpendHeroCardProps> = ({ insights, onViewInsights }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#16231C] via-[#141C18] to-[#111714] border border-[#23332A] p-6 lg:p-7 shadow-xl">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#78E08F]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Top badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#78E08F] flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            Monthly Normalized Spend
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#1F2C24] text-gray-300 border border-[#2B3E33] font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#78E08F]" />
            Verified
          </span>
        </div>

        {/* Hero Amount */}
        <div>
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {InsightsCalculator.formatCurrency(insights.totalMonthlyNormalized)}
            <span className="text-base sm:text-lg font-medium text-gray-400 ml-2">/ month</span>
          </div>
          <div className="text-xs sm:text-sm text-gray-400 mt-1">
            ≈ {InsightsCalculator.formatCurrency(insights.totalAnnualNormalized)} projected yearly commitments
          </div>
        </div>

        {/* Quick Cadence Ratio Bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
            <span>Commitment Cadence</span>
            <span className="text-white font-medium">
              {insights.monthlyCommitmentCount} monthly · {insights.annualCommitmentCount} annual
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#1B2720] overflow-hidden flex">
            <div
              style={{ width: `${insights.monthlyPercentage}%` }}
              className="bg-[#78E08F] h-full transition-all duration-500"
              title={`Monthly: ${insights.monthlyPercentage}%`}
            />
            <div
              style={{ width: `${insights.annualPercentage}%` }}
              className="bg-[#60A5FA] h-full transition-all duration-500"
              title={`Annual: ${insights.annualPercentage}%`}
            />
          </div>
        </div>

        {/* Bottom actionable link */}
        <div className="pt-2 flex items-center justify-between border-t border-[#1F2B23] text-xs">
          <span className="text-gray-400">
            Top commitment: <strong className="text-white font-semibold">{insights.topCommitment?.providerName ?? 'None'}</strong>
          </span>
          <button
            onClick={onViewInsights}
            className="text-[#78E08F] hover:text-[#8EF2A4] font-semibold flex items-center gap-1 transition-colors"
          >
            <span>View Breakdown</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
