import React from 'react';
import { Subscription, SpendInsights, RenewalOccurrence } from '../types/subscription';
import { SpendHeroCard } from '../components/cards/SpendHeroCard';
import { NextUpCard } from '../components/cards/NextUpCard';
import { SubscriptionCard } from '../components/cards/SubscriptionCard';
import { SpendInsightsCard } from '../components/cards/SpendInsightsCard';
import { Sparkles, CalendarDays, ArrowUpRight } from 'lucide-react';
import { InsightsCalculator } from '../services/insightsCalculator';

interface HomeViewProps {
  subscriptions: Subscription[];
  insights: SpendInsights;
  nextUpSub?: Subscription;
  upcomingOccurrences: RenewalOccurrence[];
  onSelectSubscription: (sub: Subscription) => void;
  onNavigateTab: (tab: 'home' | 'subscriptions' | 'agenda' | 'settings') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  subscriptions,
  insights,
  nextUpSub,
  upcomingOccurrences,
  onSelectSubscription,
  onNavigateTab,
}) => {
  const activeSubs = subscriptions.filter((s) => s.status !== 'cancelled');

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Page Title & Reassurance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Your Subscriptions</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Real-time tracking, calendar renewal projections & painless cancellation.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#141C18] border border-[#23332A] text-gray-300 w-fit">
          <span className="w-2 h-2 rounded-full bg-[#78E08F] animate-pulse" />
          <span>{activeSubs.length} Active Services</span>
        </div>
      </div>

      {/* Responsive Grid: 2-column on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Desktop 7 cols / Full Mobile) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Spend Hero Card */}
          <SpendHeroCard
            insights={insights}
            onViewInsights={() => onNavigateTab('subscriptions')}
          />

          {/* Subscriptions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-extrabold text-white">All Subscriptions</h2>
              <button
                onClick={() => onNavigateTab('subscriptions')}
                className="text-xs text-[#78E08F] hover:text-[#8EF2A4] font-semibold flex items-center gap-1 transition-colors"
              >
                <span>View all ({activeSubs.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {activeSubs.slice(0, 5).map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  onSelect={onSelectSubscription}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Desktop 5 cols / Full Mobile) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Next Up Highlight Card */}
          <NextUpCard
            subscription={nextUpSub}
            onSelect={onSelectSubscription}
          />

          {/* Upcoming This Week Carousel / Section */}
          <div className="rounded-3xl bg-[#141C18] border border-[#23332A] p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <CalendarDays className="w-4 h-4 text-[#78E08F]" />
                <span>Upcoming This Month</span>
              </div>
              <button
                onClick={() => onNavigateTab('agenda')}
                className="text-xs text-[#78E08F] hover:underline font-semibold"
              >
                Full Agenda
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {upcomingOccurrences.slice(0, 4).map((occ) => (
                <div
                  key={`${occ.subscriptionId}-${occ.date}`}
                  className="p-3 rounded-2xl bg-[#18231D] border border-[#23332A] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#141C18] border border-[#28362F] flex items-center justify-center font-bold text-white text-xs">
                      {occ.providerName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white">{occ.providerName}</div>
                      <div className="text-[11px] text-gray-400">
                        {occ.daysRemaining === 0 ? 'Due today' : occ.daysRemaining === 1 ? 'Due tomorrow' : `In ${occ.daysRemaining} days`}
                      </div>
                    </div>
                  </div>
                  <div className="font-extrabold text-[#78E08F]">
                    {InsightsCalculator.formatCurrency(occ.amount, occ.currency)}
                  </div>
                </div>
              ))}
              {upcomingOccurrences.length === 0 && (
                <div className="py-4 text-center text-xs text-gray-400">
                  No upcoming renewals within the next 30 days.
                </div>
              )}
            </div>
          </div>

          {/* Spend Insights Breakdown */}
          <SpendInsightsCard insights={insights} />
        </div>
      </div>
    </div>
  );
};
