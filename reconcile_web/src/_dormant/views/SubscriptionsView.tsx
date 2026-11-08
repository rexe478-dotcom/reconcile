import React, { useState, useMemo } from 'react';
import { Subscription } from '../types/subscription';
import { SubscriptionCard } from '../components/cards/SubscriptionCard';
import { Search, Filter, Plus } from 'lucide-react';

interface SubscriptionsViewProps {
  subscriptions: Subscription[];
  onSelectSubscription: (sub: Subscription) => void;
  onOpenAddModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({
  subscriptions,
  onSelectSubscription,
  onOpenAddModal,
  searchQuery,
  onSearchChange,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = useMemo(() => {
    return subscriptions.filter((sub) => {
      // Status filter
      if (filterStatus !== 'all' && sub.status !== filterStatus) {
        return false;
      }
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesProvider = sub.providerName.toLowerCase().includes(q);
        const matchesPlan = sub.planName.toLowerCase().includes(q);
        const matchesNotes = sub.notes?.toLowerCase().includes(q) ?? false;
        return matchesProvider || matchesPlan || matchesNotes;
      }
      return true;
    });
  }, [subscriptions, filterStatus, searchQuery]);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Manage Subscriptions</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Filter, search, inspect billing cycles, or initiate cancellation handoff.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#78E08F] hover:bg-[#66D17E] text-[#0B0F0D] font-extrabold text-sm shadow-md transition-all active:scale-95 w-fit"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Subscription</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by provider, plan, or note..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#141C18] border border-[#23332A] focus:border-[#78E08F] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-3 text-xs text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Chips (Screen 3 reference) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'needs_review', label: 'Needs Review' },
            { id: 'paused', label: 'Paused' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilterStatus(chip.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === chip.id
                  ? 'bg-[#78E08F] text-[#0B0F0D]'
                  : 'bg-[#141C18] text-gray-400 hover:text-white border border-[#23332A]'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Grid/List */}
      <div className="space-y-3">
        <div className="text-xs text-gray-400 font-medium">
          Showing {filtered.length} of {subscriptions.length} subscriptions
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filtered.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                onSelect={onSelectSubscription}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-[#141C18] border border-[#23332A] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1B2720] text-gray-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">No subscriptions found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              No subscriptions match your current search or filter criteria. Try searching for a different keyword or reset filters.
            </p>
            <button
              onClick={() => {
                onSearchChange('');
                setFilterStatus('all');
              }}
              className="text-xs text-[#78E08F] hover:underline font-semibold pt-1"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
