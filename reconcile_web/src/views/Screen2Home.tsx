import React, { useMemo } from 'react';
import { Bell, ChevronRight, BarChart2, Calendar, ArrowRight } from 'lucide-react';
import { Subscription } from '../types/subscription';
import { BrandIcon } from '../components/common/BrandIcon';
import { MascotLogo } from '../components/common/MascotLogo';

interface Screen2HomeProps {
  subscriptions: Subscription[];
  totalSpendFormatted: string;
  nextUpSub?: Subscription;
  onSelectSubscription: (sub: Subscription) => void;
  onNavigateTab: (tab: 'home' | 'explore' | 'saved' | 'profile') => void;
  onOpenNotifications?: () => void;
}

export const Screen2Home: React.FC<Screen2HomeProps> = ({
  subscriptions,
  totalSpendFormatted,
  nextUpSub,
  onSelectSubscription,
  onNavigateTab,
  onOpenNotifications,
}) => {
  // Dynamically compute "upcoming this week" from actual subscription data
  const upcomingThisWeek = useMemo(() => {
    const today = new Date();
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const todayStr = today.toISOString().split('T')[0];
    const weekStr = weekFromNow.toISOString().split('T')[0];

    return subscriptions
      .filter((s) => s.status === 'active' && s.nextRenewalDate >= todayStr && s.nextRenewalDate <= weekStr)
      .sort((a, b) => a.nextRenewalDate.localeCompare(b.nextRenewalDate))
      .slice(0, 3);
  }, [subscriptions]);

  // All active subscriptions sorted by renewal date
  const allActive = useMemo(() => {
    return subscriptions
      .filter((s) => s.status === 'active')
      .sort((a, b) => a.nextRenewalDate.localeCompare(b.nextRenewalDate));
  }, [subscriptions]);

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-[#FAF8F5] text-[#171717]">
      {/* Scrollable Main Area */}
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4 space-y-4">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MascotLogo size={24} className="shadow-xs" />
            <span className="font-extrabold tracking-[0.2em] text-xs text-[#171717]">
              RECONCILE
            </span>
          </div>

          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 rounded-full hover:bg-[#EFECE4] transition-colors"
          >
            <Bell className="w-5 h-5 text-[#171717]" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EA4335]" />
          </button>
        </div>

        {/* Page Title */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#171717]">
            Your subscriptions
          </h2>
        </div>

        {/* Total Spend Hero Card */}
        <div className="bg-[#F0ECE4] rounded-2xl p-4 flex items-center justify-between border border-[#E5E0D8]/60 shadow-xs">
          <div>
            <div className="text-2xl font-black text-[#171717] tracking-tight">
              {totalSpendFormatted || '₦0'}
            </div>
            <div className="text-xs text-[#737373] font-medium mt-0.5">
              Total monthly spend
            </div>
          </div>
          <div className="text-[#3D5438] p-1.5">
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>

        {/* Next Up Highlight Card */}
        {nextUpSub && (
          <div
            onClick={() => onSelectSubscription(nextUpSub)}
            className="cursor-pointer bg-[#F5F2EA] hover:bg-[#EFECE4] active:scale-[0.99] transition-all rounded-2xl p-3.5 flex items-center justify-between border border-[#E5E0D8]/60"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#D8D2C6] flex items-center justify-center text-[#3D5438]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-[#737373] block font-medium">Next up</span>
                <span className="text-sm font-bold text-[#171717] block leading-snug">
                  {nextUpSub.providerName}
                </span>
                <span className="text-xs text-[#737373]">
                  {formatDate(nextUpSub.nextRenewalDate)} · ₦{nextUpSub.amount.toLocaleString()}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#737373]" />
          </div>
        )}

        {/* Upcoming This Week Section */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#171717]">Upcoming this week</h3>
            <button
              onClick={() => onNavigateTab('explore')}
              className="text-xs text-[#737373] hover:text-[#3D5438] font-medium flex items-center gap-0.5"
            >
              <span>See all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1.5">
            {upcomingThisWeek.length === 0 && (
              <div className="text-xs text-[#737373] py-3 text-center bg-white rounded-2xl border border-[#E5E0D8]/70">
                No renewals due this week
              </div>
            )}
            {upcomingThisWeek.map((sub) => (
              <div
                key={sub.id}
                onClick={() => onSelectSubscription(sub)}
                className="cursor-pointer bg-white hover:bg-[#FAF8F5] p-3 rounded-2xl border border-[#E5E0D8]/70 flex items-center justify-between shadow-xs transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BrandIcon providerName={sub.providerName} size={36} />
                  <div>
                    <h4 className="text-sm font-bold text-[#171717]">{sub.providerName}</h4>
                    <span className="text-xs text-[#737373]">{formatDate(sub.nextRenewalDate)}</span>
                  </div>
                </div>
                <div className="text-sm font-bold text-[#171717]">
                  ₦{sub.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Subscriptions Section */}
        <div className="space-y-2 pt-1">
          <h3 className="text-sm font-bold text-[#171717]">All subscriptions</h3>

          <div className="space-y-1.5">
            {allActive.length === 0 && (
              <div className="text-xs text-[#737373] py-3 text-center bg-white rounded-2xl border border-[#E5E0D8]/70">
                No active subscriptions yet
              </div>
            )}
            {allActive.slice(0, 4).map((sub) => (
              <div
                key={sub.id}
                onClick={() => onSelectSubscription(sub)}
                className="cursor-pointer bg-white hover:bg-[#FAF8F5] p-3 rounded-2xl border border-[#E5E0D8]/70 flex items-center justify-between shadow-xs transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BrandIcon providerName={sub.providerName} size={36} />
                  <div>
                    <h4 className="text-sm font-bold text-[#171717]">{sub.providerName}</h4>
                    <span className="text-xs text-[#737373]">{formatDate(sub.nextRenewalDate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#171717]">
                    ₦{sub.amount.toLocaleString()}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    sub.status === 'needs_review'
                      ? 'bg-[#FDEEE2] text-[#C2671A]'
                      : sub.status === 'cancelled'
                        ? 'bg-[#F5E5E5] text-[#B42318]'
                        : 'bg-[#E2EBD8] text-[#3D5438]'
                  }`}>
                    {sub.status === 'needs_review' ? 'Needs Review'
                      : sub.status === 'cancelled' ? 'Cancelled'
                      : 'Active'}
                  </span>
                </div>
              </div>
            ))}
            {allActive.length > 4 && (
              <button
                onClick={() => onNavigateTab('explore')}
                className="w-full text-xs text-[#3D5438] font-semibold py-2 text-center hover:underline"
              >
                View all {allActive.length} subscriptions →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
