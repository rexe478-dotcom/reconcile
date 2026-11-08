import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Calendar, 
  Bell, 
  ExternalLink, 
  CreditCard,
  CheckCircle2, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Subscription, SubscriptionStatus } from '../types/subscription';
import { BrandIcon } from '../components/common/BrandIcon';
import { InsightsCalculator } from '../services/insightsCalculator';
import { MascotLogo } from '../components/common/MascotLogo';

interface SubscriptionsTabProps {
  subscriptions: Subscription[];
  onSelectSubscription: (sub: Subscription) => void;
  onAddSubscription: () => void;
  onOpenCancellation: (sub: Subscription) => void;
  onToggleReminder: (id: string) => void;
}

export const SubscriptionsTab: React.FC<SubscriptionsTabProps> = ({
  subscriptions,
  onSelectSubscription,
  onAddSubscription,
  onOpenCancellation,
  onToggleReminder,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'soon' | 'needs_review' | 'cancelled'>('all');

  const getDaysLeft = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const formatStatus = (status: SubscriptionStatus | string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'needs_review':
        return 'Needs Review';
      case 'cancelled':
        return 'Cancelled';
      case 'paused':
        return 'Paused';
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status: SubscriptionStatus | string) => {
    switch (status) {
      case 'active':
        return 'bg-[#E2EBD8] text-[#3D5438] border border-[#3D5438]/20';
      case 'needs_review':
        return 'bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-[#E5E0D8]';
    }
  };

  const filteredSubscriptions = useMemo(() => {
    let result = [...subscriptions];

    if (statusFilter === 'active') {
      result = result.filter((s) => s.status === 'active');
    } else if (statusFilter === 'needs_review') {
      result = result.filter((s) => s.status === 'needs_review');
    } else if (statusFilter === 'cancelled') {
      result = result.filter((s) => s.status === 'cancelled');
    } else if (statusFilter === 'soon') {
      result = result.filter((s) => {
        const days = getDaysLeft(s.nextRenewalDate);
        return s.status === 'active' && days >= 0 && days <= 7;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => 
        s.providerName.toLowerCase().includes(q) ||
        s.planName.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => a.nextRenewalDate.localeCompare(b.nextRenewalDate));
    return result;
  }, [subscriptions, statusFilter, search]);

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
            Subscriptions Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] mt-1">
            {subscriptions.length} active recurring commitments &middot; Automated renewals tracked
          </p>
        </div>

        <button
          onClick={onAddSubscription}
          className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-[#3D5438] hover:bg-[#32462E] text-white text-xs font-bold shadow-xs self-start sm:self-auto flex items-center justify-center gap-2 btn-tactile"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Subscription</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-3 bg-white rounded-2xl border border-[#E5E0D8] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
          <input
            type="text"
            placeholder="Search subscriptions, plans, or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 min-h-[44px] bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-xs sm:text-sm text-[#171717] placeholder:text-[#737373] focus:outline-none focus:border-[#3D5438] focus:ring-2 focus:ring-[#3D5438]/20 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#E5E0D8] overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center justify-center btn-tactile-sm ${
              statusFilter === 'all'
                ? 'bg-[#3D5438] text-white shadow-2xs'
                : 'hover:bg-[#F0ECE4] text-[#171717]'
            }`}
          >
            All ({subscriptions.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center justify-center btn-tactile-sm ${
              statusFilter === 'active'
                ? 'bg-[#3D5438] text-white shadow-2xs'
                : 'hover:bg-[#F0ECE4] text-[#171717]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('soon')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center justify-center btn-tactile-sm ${
              statusFilter === 'soon'
                ? 'bg-[#3D5438] text-white shadow-2xs'
                : 'hover:bg-[#F0ECE4] text-[#171717]'
            }`}
          >
            Due Soon (&le;7d)
          </button>
          <button
            onClick={() => setStatusFilter('needs_review')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center justify-center btn-tactile-sm ${
              statusFilter === 'needs_review'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'hover:bg-amber-50 text-amber-800'
            }`}
          >
            Needs Review
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center justify-center btn-tactile-sm ${
              statusFilter === 'cancelled'
                ? 'bg-[#3D5438] text-white shadow-2xs'
                : 'hover:bg-[#F0ECE4] text-[#171717]'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Subscription List Ledger (Linear Financial Ledger Architecture) */}
      <div className="space-y-3">
        {filteredSubscriptions.map((sub) => {
          const days = getDaysLeft(sub.nextRenewalDate);
          return (
            <div
              key={sub.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectSubscription(sub);
                }
              }}
              onClick={() => onSelectSubscription(sub)}
              className="p-4 sm:p-5 md:py-4.5 md:px-6 rounded-2xl sm:rounded-3xl bg-white border border-[#E5E0D8] hover:border-[#3D5438]/60 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 card-lift group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#3D5438]/30 focus-visible:border-[#3D5438]"
            >
              {/* Col 1: Identity (Brand Icon + Title & Plan + Status) */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <BrandIcon providerName={sub.providerName} size={46} className="shadow-2xs shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-black text-[#171717] leading-tight group-hover:text-[#3D5438] transition-colors truncate">
                      {sub.providerName}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider shrink-0 ${getStatusBadgeClass(sub.status)}`}>
                      {formatStatus(sub.status)}
                    </span>
                  </div>
                  <p className="text-xs text-[#737373] truncate mt-1">
                    {sub.planName || sub.category} &middot; <span className="capitalize">{sub.interval}</span>
                  </p>
                </div>
              </div>

              {/* Col 2: Schedule & Countdown (Linear Structured Pill) */}
              <div className="flex items-center gap-4 bg-[#FAF8F5] px-4 py-2.5 rounded-2xl border border-[#E5E0D8] md:w-56 md:shrink-0 justify-between">
                <div>
                  <span className="text-[10px] text-[#737373] uppercase font-bold tracking-wider block">
                    Next Renewal
                  </span>
                  <div className="text-xs font-bold text-[#171717] tabular-nums font-mono">
                    {sub.nextRenewalDate}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg block border tabular-nums ${
                    days <= 2 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : days <= 7 
                      ? 'bg-amber-50 text-amber-800 border-amber-200' 
                      : 'bg-[#E2EBD8]/60 text-[#3D5438] border-[#3D5438]/20'
                  }`}>
                    {days === 0 ? 'Due Today' : days === 1 ? 'Due Tomorrow' : `In ${days} days`}
                  </span>
                </div>
              </div>

              {/* Col 3 & 4: Cost Amount + Interactive Actions */}
              <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-[#E5E0D8]/70">
                {/* Cost with Tabular Numerals */}
                <div className="text-left md:text-right md:w-28 md:shrink-0">
                  <div className="text-lg sm:text-xl font-black text-[#171717] tabular-nums tracking-tight">
                    {InsightsCalculator.formatCurrency(sub.amount, sub.currency)}
                  </div>
                  <span className="text-[10px] font-semibold text-[#737373] block uppercase tracking-wider">
                    /{sub.interval}
                  </span>
                </div>

                {/* Action Controls with Full 44px Touch Ergonomics */}
                <div className="flex items-center gap-2">
                  {/* Reminder Bell Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleReminder(sub.id);
                    }}
                    className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl border transition-all text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#3D5438]/30 ${
                      sub.remindersEnabled
                        ? 'bg-[#E2EBD8]/60 text-[#3D5438] border-[#3D5438]/20 hover:bg-[#E2EBD8]'
                        : 'bg-[#FAF8F5] text-gray-400 border-[#E5E0D8] hover:text-gray-700 hover:border-gray-300'
                    }`}
                    title={sub.remindersEnabled ? 'Reminders Active' : 'Reminders Muted'}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{sub.remindersEnabled ? 'Active' : 'Muted'}</span>
                  </button>

                  {/* Cancel / Manage Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCancellation(sub);
                    }}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-white hover:bg-amber-50 active:scale-95 text-amber-900 border border-amber-200 hover:border-amber-300 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500/40"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredSubscriptions.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E0D5] space-y-3">
            <MascotLogo pose="thinking" size={68} className="mx-auto" />
            <h3 className="font-bold text-base text-[#1A1A1A]">No subscriptions found</h3>
            <p className="text-xs text-[#858477] max-w-sm mx-auto">
              No recurring payments match your search or filter. Try clearing filters or add a new subscription.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};