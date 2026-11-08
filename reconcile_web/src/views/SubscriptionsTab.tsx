import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Grid, 
  List, 
  Filter, 
  Plus, 
  Calendar, 
  Bell, 
  ExternalLink, 
  MoreVertical, 
  CheckCircle2, 
  AlertCircle 
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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
    <div className="space-y-5">
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
            className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-xs text-[#171717] placeholder:text-[#737373] focus:outline-hidden focus:border-[#3D5438]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E5E0D8]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-[#3D5438] text-white'
                  : 'bg-[#FAF8F5] hover:bg-[#F0ECE4] text-[#171717]'
              }`}
            >
              All ({subscriptions.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'active'
                  ? 'bg-[#3D5438] text-white'
                  : 'bg-[#FAF8F5] hover:bg-[#F0ECE4] text-[#171717]'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('soon')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'soon'
                  ? 'bg-[#3D5438] text-white'
                  : 'bg-[#FAF8F5] hover:bg-[#F0ECE4] text-[#171717]'
              }`}
            >
              Due Soon (&le;7d)
            </button>
            <button
              onClick={() => setStatusFilter('needs_review')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'needs_review'
                  ? 'bg-amber-600 text-white'
                  : 'bg-[#FAF8F5] hover:bg-amber-50 text-amber-800'
              }`}
            >
              Needs Review
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'cancelled'
                  ? 'bg-[#3D5438] text-white'
                  : 'bg-[#FAF8F5] hover:bg-[#F0ECE4] text-[#171717]'
              }`}
            >
              Cancelled
            </button>
          </div>

          <div className="h-6 w-px bg-[#E5E0D8] mx-1 shrink-0" />

          {/* Grid / List toggle */}
          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E5E0D8] shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-[#3D5438] shadow-2xs' : 'text-[#737373] hover:text-[#171717]'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#3D5438] shadow-2xs' : 'text-[#737373] hover:text-[#171717]'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSubscriptions.map((sub) => {
            const days = getDaysLeft(sub.nextRenewalDate);
            return (
              <div
                key={sub.id}
                onClick={() => onSelectSubscription(sub)}
                className="p-5 rounded-3xl bg-white border border-[#E5E0D8] hover:border-[#3D5438]/50 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-4 group overflow-hidden"
              >
                {/* Header with Title and Properly Constrained Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <BrandIcon providerName={sub.providerName} size={44} className="shadow-2xs shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-black text-[#171717] group-hover:text-[#3D5438] transition-colors truncate">
                        {sub.providerName}
                      </h3>
                      <p className="text-xs text-[#737373] truncate">
                        {sub.planName || sub.category}
                      </p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 whitespace-nowrap tracking-normal ${getStatusBadgeClass(sub.status)}`}>
                    {formatStatus(sub.status)}
                  </span>
                </div>

                {/* Amount & Renewal Info */}
                <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8]/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#737373] uppercase font-bold tracking-wider block">Price</span>
                    <div className="text-lg font-black text-[#171717]">
                      {'\u20A6'}{sub.amount.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-[#737373] capitalize">
                      /{sub.interval}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#737373] uppercase font-bold tracking-wider block">Renews</span>
                    <div className="text-xs font-bold text-[#171717]">
                      {sub.nextRenewalDate}
                    </div>
                    <span className={`text-[11px] font-semibold block mt-0.5 ${
                      days <= 2 ? 'text-red-600 font-bold' : days <= 7 ? 'text-amber-700' : 'text-[#3D5438]'
                    }`}>
                      {days === 0 ? 'Due Today' : days === 1 ? 'Due Tomorrow' : `In ${days} days`}
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-[#E5E0D8]/60 flex items-center justify-between text-xs">
                  {/* Reminder Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleReminder(sub.id);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                      sub.remindersEnabled
                        ? 'bg-[#E2EBD8]/60 text-[#3D5438] border-[#E2EBD8]'
                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:text-gray-600'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">
                      {sub.remindersEnabled ? 'Active' : 'Muted'}
                    </span>
                  </button>

                  {/* Cancel / Manage action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCancellation(sub);
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold transition-colors shadow-2xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Cancel / Manage</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-[#E5E0D8] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[11px] font-bold text-[#737373] uppercase tracking-wider">
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Cost</th>
                  <th className="py-3 px-4">Billing</th>
                  <th className="py-3 px-4">Next Renewal</th>
                  <th className="py-3 px-4">Reminders</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8]/60">
                {filteredSubscriptions.map((sub) => {
                  const days = getDaysLeft(sub.nextRenewalDate);
                  return (
                    <tr
                      key={sub.id}
                      onClick={() => onSelectSubscription(sub)}
                      className="hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <BrandIcon providerName={sub.providerName} size={32} />
                          <div>
                            <div className="font-bold text-[#171717]">{sub.providerName}</div>
                            <div className="text-[11px] text-[#737373]">{sub.planName}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#737373] capitalize">
                        {sub.category}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#171717]">
                        {'\u20A6'}{sub.amount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-[#737373] capitalize">
                        {sub.interval}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#171717]">{sub.nextRenewalDate}</div>
                        <div className={`text-[10px] font-bold ${
                          days <= 2 ? 'text-red-600' : days <= 7 ? 'text-amber-700' : 'text-[#3D5438]'
                        }`}>
                          {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days}d`}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleReminder(sub.id);
                          }}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.remindersEnabled ? 'bg-[#E2EBD8] text-[#3D5438]' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {sub.remindersEnabled ? 'Active' : 'Off'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 whitespace-nowrap ${getStatusBadgeClass(sub.status)}`}>
                          {formatStatus(sub.status)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCancellation(sub);
                          }}
                          className="px-3 py-1 rounded-xl bg-[#F5F2EA] hover:bg-[#EAE6DD] text-[11px] font-bold text-[#171717] transition-colors"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};