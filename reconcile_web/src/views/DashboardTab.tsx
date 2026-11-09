import React, { useMemo } from 'react';
import { 
  BarChart2, 
  Calendar, 
  ArrowUpRight, 
  Bell, 
  Plus, 
  ChevronRight, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  Download,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Subscription } from '../types/subscription';
import { BrandIcon } from '../components/common/BrandIcon';
import { MascotLogo } from '../components/common/MascotLogo';
import { InsightsCalculator } from '../services/insightsCalculator';

interface DashboardTabProps {
  subscriptions: Subscription[];
  onSelectSubscription: (sub: Subscription) => void;
  onNavigateTab: (tab: 'dashboard' | 'subscriptions' | 'calendar' | 'settings') => void;
  onAddSubscription: () => void;
  onOpenNotifications: () => void;
  onOpenOnboarding?: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  subscriptions,
  onSelectSubscription,
  onNavigateTab,
  onAddSubscription,
  onOpenNotifications,
  onOpenOnboarding,
}) => {
  const activeSubs = useMemo(() => {
    return subscriptions.filter((s) => s.status === 'active');
  }, [subscriptions]);

  const insights = useMemo(() => {
    return InsightsCalculator.computeInsights(subscriptions);
  }, [subscriptions]);

  const totalMonthlyFormatted = useMemo(() => {
    return InsightsCalculator.formatCurrency(insights.totalMonthlyNormalized);
  }, [insights]);

  const totalAnnualFormatted = useMemo(() => {
    return InsightsCalculator.formatCurrency(insights.totalAnnualNormalized);
  }, [insights]);

  const nextUpSub = useMemo(() => {
    if (activeSubs.length === 0) return null;
    return [...activeSubs].sort((a, b) => a.nextRenewalDate.localeCompare(b.nextRenewalDate))[0];
  }, [activeSubs]);

  const upcomingSoon = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fourteenDays = new Date(today);
    fourteenDays.setDate(fourteenDays.getDate() + 14);
    const todayStr = today.toISOString().split('T')[0];
    const maxStr = fourteenDays.toISOString().split('T')[0];

    return activeSubs
      .filter((s) => s.nextRenewalDate >= todayStr && s.nextRenewalDate <= maxStr)
      .sort((a, b) => a.nextRenewalDate.localeCompare(b.nextRenewalDate));
  }, [activeSubs]);

  const getDaysLeft = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] mt-0.5">
            Know what renews next, monitor commitments, and eliminate unwanted charges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              className="min-h-[44px] hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-bold text-[#171717] shadow-2xs btn-tactile"
              title="Interactive Feature Guide"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3D5438]" />
              <span>How It Works</span>
            </button>
          )}

          <button
            onClick={onOpenNotifications}
            className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#F0ECE4] border border-[#E5E0D8] text-xs font-bold text-[#171717] shadow-2xs btn-tactile"
          >
            <Bell className="w-3.5 h-3.5 text-[#3D5438]" />
            <span>Alerts</span>
          </button>

          <button
            onClick={onAddSubscription}
            className="min-h-[44px] flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3D5438] hover:bg-[#32462E] text-white text-xs font-bold shadow-xs btn-tactile"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      {/* Content: Empty State vs Active Dashboard */}
      {subscriptions.length === 0 ? (
        <div className="py-12 px-6 sm:px-12 rounded-3xl bg-white border border-[#E5E0D8] shadow-xs text-center flex flex-col items-center justify-center space-y-5 my-4">
          <MascotLogo pose="standing" size={76} interactive={true} className="mx-auto drop-shadow-xs" />
          <div className="max-w-md space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
              Your subscriptions, all in one place.
            </h2>
            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
              You haven't added any subscriptions yet. Start by adding the services you currently pay for, and Reconcile will help you keep track of their renewal dates.
            </p>
          </div>
          <button
            onClick={onAddSubscription}
            className="min-h-[46px] px-6 py-2.5 rounded-full bg-[#3D5438] hover:bg-[#32462E] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm btn-tactile transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add your first subscription</span>
          </button>
        </div>
      ) : (
        <>
          {/* Hero Financial Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Monthly Total */}
            <div className="p-5 rounded-3xl bg-white border border-[#E5E0D8] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#737373] uppercase tracking-wider">Monthly Spend</span>
                <div className="p-2 rounded-xl bg-[#E2EBD8]/60 text-[#3D5438]">
                  <BarChart2 className="w-4 h-4" />
                </div>
              </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-[#171717] tracking-tight">
              {totalMonthlyFormatted}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#737373]">
              <span className="w-2 h-2 rounded-full bg-[#3D5438]" />
              <span>{activeSubs.length} active recurring commitments</span>
            </div>
          </div>
        </div>

        {/* Card 2: Projected Annual */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E0D8] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#737373] uppercase tracking-wider">Projected Annual</span>
            <div className="p-2 rounded-xl bg-[#F0ECE4] text-[#171717]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-[#171717] tracking-tight">
              {totalAnnualFormatted}
            </div>
            <div className="text-xs text-[#737373] mt-1">
              Normalized over 12 billing months
            </div>
          </div>
        </div>

        {/* Card 3: Next Due Commitment */}
        <div className="p-5 rounded-3xl bg-[#F5F2EA] border border-[#E5E0D8] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#737373] uppercase tracking-wider">Next Renewal</span>
            <div className="p-2 rounded-xl bg-white text-[#3D5438] border border-[#E5E0D8]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          {nextUpSub ? (
            <div 
              onClick={() => onSelectSubscription(nextUpSub)}
              className="mt-3 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <BrandIcon providerName={nextUpSub.providerName} size={38} className="shadow-2xs" />
                <div>
                  <div className="text-sm font-black text-[#171717] group-hover:text-[#3D5438] transition-colors">
                    {nextUpSub.providerName}
                  </div>
                  <div className="text-xs text-[#737373]">
                    {InsightsCalculator.formatCurrency(nextUpSub.amount, nextUpSub.currency)} • {nextUpSub.nextRenewalDate}
                  </div>
                </div>
              </div>
              <div className="mt-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E2EBD8] text-[#3D5438]">
                  Renews in {getDaysLeft(nextUpSub.nextRenewalDate)} days
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-xs text-[#737373]">
              No active renewals scheduled.
            </div>
          )}
        </div>
      </div>

      {/* Renewals Due in the Next 14 Days Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-[#171717]">
              Renewing in the Next 14 Days
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#E2EBD8] text-[#3D5438] text-xs font-bold">
              {upcomingSoon.length}
            </span>
          </div>

          <button
            onClick={() => onNavigateTab('calendar')}
            className="text-xs font-bold text-[#3D5438] hover:underline flex items-center gap-1"
          >
            <span>View Full Agenda</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {upcomingSoon.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingSoon.map((sub) => {
              const days = getDaysLeft(sub.nextRenewalDate);
              return (
                <div
                  key={sub.id}
                  onClick={() => onSelectSubscription(sub)}
                  className="p-4 rounded-2xl bg-white border border-[#E5E0D8] hover:border-[#3D5438]/60 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between card-lift group"
                >
                  <div className="flex items-center gap-3">
                    <BrandIcon providerName={sub.providerName} size={40} />
                    <div>
                      <div className="text-sm font-bold text-[#171717]">{sub.providerName}</div>
                      <div className="text-xs text-[#737373]">{sub.planName || sub.category}</div>
                      <div className="text-[11px] font-semibold text-[#3D5438] mt-0.5">
                        {days === 0 ? 'Due Today' : days === 1 ? 'Due Tomorrow' : `Due in ${days} days`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-[#171717]">
                      {InsightsCalculator.formatCurrency(sub.amount, sub.currency)}
                    </div>
                    <span className="text-[10px] text-[#737373] capitalize">
                      /{sub.interval}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white border border-[#E5E0D8] text-center text-xs text-[#737373]">
            No renewals due in the next 14 days. You are safe from immediate surprise debits!
          </div>
        )}
      </div>

      {/* Active Subscriptions Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-[#171717]">
            Active Services ({activeSubs.length})
          </h2>

          <button
            onClick={() => onNavigateTab('subscriptions')}
            className="text-xs font-bold text-[#3D5438] hover:underline flex items-center gap-1"
          >
            <span>See All Subscriptions</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {activeSubs.slice(0, 6).map((sub) => (
            <div
              key={sub.id}
              onClick={() => onSelectSubscription(sub)}
              className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5E0D8] hover:border-[#3D5438]/60 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group card-lift"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <BrandIcon providerName={sub.providerName} size={38} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#171717] group-hover:text-[#3D5438] transition-colors truncate">
                      {sub.providerName}
                    </h3>
                    <span className="text-[10px] font-bold text-[#737373] bg-[#FAF8F5] px-2 py-0.5 rounded-full capitalize shrink-0 border border-[#E5E0D8]">
                      {sub.interval}
                    </span>
                  </div>
                  <p className="text-xs text-[#737373] truncate mt-0.5">{sub.planName || sub.category}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm sm:text-base font-black text-[#171717] block">
                  {InsightsCalculator.formatCurrency(sub.amount, sub.currency)}
                </span>
                <span className="text-[11px] text-[#737373]">
                  Renews {sub.nextRenewalDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
};