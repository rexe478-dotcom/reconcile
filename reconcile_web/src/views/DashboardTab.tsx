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
  AlertCircle
} from 'lucide-react';
import { Subscription } from '../types/subscription';
import { BrandIcon } from '../components/common/BrandIcon';
import { InsightsCalculator } from '../services/insightsCalculator';

interface DashboardTabProps {
  subscriptions: Subscription[];
  onSelectSubscription: (sub: Subscription) => void;
  onNavigateTab: (tab: 'dashboard' | 'subscriptions' | 'calendar' | 'settings') => void;
  onAddSubscription: () => void;
  onOpenNotifications: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  subscriptions,
  onSelectSubscription,
  onNavigateTab,
  onAddSubscription,
  onOpenNotifications,
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

  // Earliest renewal
  const nextUpSub = useMemo(() => {
    if (activeSubs.length === 0) return null;
    return [...activeSubs].sort((a, b) => a.nextRenewalDate.localeCompare(b.nextRenewalDate))[0];
  }, [activeSubs]);

  // Subscriptions due in the next 14 days
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

  // Compute days left
  const getDaysLeft = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Summary Header */}
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
          <button
            onClick={onOpenNotifications}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F0ECE4] border border-[#E5E0D8] text-xs font-bold text-[#171717] shadow-2xs transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-[#3D5438]" />
            <span>Alerts</span>
          </button>

          <button
            onClick={onAddSubscription}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3D5438] hover:bg-[#32462E] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

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
                    ?{nextUpSub.amount.toLocaleString()} • {nextUpSub.nextRenewalDate}
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
                  className="p-4 rounded-2xl bg-white border border-[#E5E0D8] hover:border-[#3D5438]/50 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
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
                      ?{sub.amount.toLocaleString()}
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

      {/* All Subscriptions Preview */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {activeSubs.slice(0, 8).map((sub) => (
            <div
              key={sub.id}
              onClick={() => onSelectSubscription(sub)}
              className="p-4 rounded-2xl bg-white border border-[#E5E0D8] hover:border-[#3D5438]/60 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <BrandIcon providerName={sub.providerName} size={40} />
                <span className="text-[11px] font-bold text-[#737373] bg-[#F5F2EA] px-2 py-0.5 rounded-full capitalize">
                  {sub.interval}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#171717]">{sub.providerName}</h3>
                <p className="text-xs text-[#737373] truncate">{sub.planName || 'Active subscription'}</p>
              </div>

              <div className="pt-2 border-t border-[#E5E0D8]/60 flex items-center justify-between">
                <span className="text-sm font-black text-[#171717]">
                  ?{sub.amount.toLocaleString()}
                </span>
                <span className="text-[11px] text-[#737373]">
                  {sub.nextRenewalDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
