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
        return 'bg-[#E2EBD8] text-[#3D5438]';
      case 'needs_review':
        return 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-700';
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
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#3D5438] hover:bg-[#32462E] active:scale-95 text-white text-xs font-bold shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Subscription</span>
        </button>
      </div>

      {/* Search & Filter Toolbar (No Grid Switcher) */}
      <div className="p-3 bg-white rounded-2xl border border-[#E5E0D8] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
          <input
            type="text"
            placeholder="Search subscriptions, plans, or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-xs text-[#171717] placeholder:text-[#737373] focus:outline-hidden focus:border-[#3D5438]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E5E0D8] overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-[#3D5438] text-white shadow-2xs'
                : 'hover:bg-[#F0ECE4] text-[#171717]'
            }`}
          >
            All ({subscriptions.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-[#3D5438] text-white shadow-2xs'
                : 'hover:bg-[#F0ECE4] text-[#171717]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('soon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              statusFilter === 'soon'
                ? 'bg-[#3D5438] text-white shadow-2xs'
                : 'hover:bg-[#F0ECE4] text-[#171717]'
            }`}
          >
            Due Soon (&le;7d)
          </button>
          <button
            onClick={() => setStatusFilter('needs_review')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              statusFilter === 'needs_review'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'hover:bg-amber-50 text-amber-800'
            }`}
          >
            Needs Review
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              statusFilter === 'cancelled'
                ? 'bg-[#3D5438] text-white shadow-2xs'
                : 'hover:bg-[#F0ECE4] text-[#171717]'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Subscription List Ledger (Replaced Grid with Sleek Modern Rows) */}
      <div className="space-y-3">
        {filteredSubscriptions.map((sub) => {
          const days = getDaysLeft(sub.nextRenewalDate);
          return (
            <div
              key={sub.id}
              onClick={() => onSelectSubscription(sub)}
              className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#E5E0D8] hover:border-[#3D5438]/60 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 card-lift group"
            >
              {/* Left Column: Brand Icon + Name & Plan + Status */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <BrandIcon providerName={sub.providerName} size={46} className="shadow-2xs shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-[#171717] group-hover:text-[#3D5438] transition-colors truncate">
                      {sub.providerName}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${getStatusBadgeClass(sub.status)}`}>
                      {formatStatus(sub.status)}
                    </span>
                  </div>
                  <p className="text-xs text-[#737373] truncate mt-0.5">
                    {sub.planName || sub.category} &middot; <span className="capitalize">{sub.interval}</span>
                  </p>
                </div>
              </div>

              {/* Middle Column: Renewal Timeline & Countdown */}
              <div className="flex items-center gap-4 bg-[#FAF8F5] px-4 py-2.5 rounded-2xl border border-[#E5E0D8]/60 md:shrink-0 justify-between md:justify-start">
                <div>
                  <span className="text-[10px] text-[#737373] uppercase font-bold tracking-wider block">
                    Next Renewal
                  </span>
                  <div className="text-xs font-bold text-[#171717]">
                    {sub.nextRenewalDate}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg block ${
                    days <= 2 ? 'bg-red-50 text-red-600 font-bold' : days <= 7 ? 'bg-amber-50 text-amber-700' : 'bg-[#E2EBD8]/60 text-[#3D5438]'
                  }`}>
                    {days === 0 ? 'Due Today' : days === 1 ? 'Due Tomorrow' : `In ${days} days`}
                  </span>
                </div>
              </div>

              {/* Right Column: Amount + Action Controls */}
              <div className="flex items-center justify-between md:justify-end gap-3.5 pt-2 md:pt-0 border-t md:border-t-0 border-[#E5E0D8]/60">
                {/* Cost */}
                <div className="text-left md:text-right">
                  <div className="text-lg sm:text-xl font-black text-[#171717]">
                    {'\u20A6'}{sub.amount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[#737373] block capitalize">
                    /{sub.interval}
                  </span>
                </div>

                {/* Reminder Bell Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleReminder(sub.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
                    sub.remindersEnabled
                      ? 'bg-[#E2EBD8]/60 text-[#3D5438] border-[#E2EBD8]'
                      : 'bg-[#FAF8F5] text-gray-400 border-[#E5E0D8] hover:text-gray-700'
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
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredSubscriptions.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E0D8] space-y-3">
            <CreditCard className="w-10 h-10 text-[#737373] mx-auto opacity-50" />
            <h3 className="font-bold text-base text-[#171717]">No subscriptions found</h3>
            <p className="text-xs text-[#737373] max-w-sm mx-auto">
              No recurring payments match your search or filter. Try clearing filters or add a new subscription.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};