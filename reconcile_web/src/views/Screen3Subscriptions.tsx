import React, { useState } from 'react';
import { ArrowLeft, Search, ChevronRight } from 'lucide-react';
import { Subscription } from '../types/subscription';
import { BrandIcon } from '../components/common/BrandIcon';

interface Screen3SubscriptionsProps {
  subscriptions: Subscription[];
  onSelectSubscription: (sub: Subscription) => void;
  onBack: () => void;
}

export const Screen3Subscriptions: React.FC<Screen3SubscriptionsProps> = ({
  subscriptions,
  onSelectSubscription,
  onBack,
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'needs_review'>('all');
  const [search, setSearch] = useState('');

  const filtered = subscriptions.filter((sub) => {
    // Category filter
    if (filter === 'needs_review' && sub.status !== 'needs_review') return false;
    if (filter === 'upcoming') {
      // Upcoming in next 30 days
      const days = Math.ceil(
        (new Date(sub.nextRenewalDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
      );
      if (days < 0 || days > 30) return false;
    }

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        sub.providerName.toLowerCase().includes(q) ||
        sub.planName.toLowerCase().includes(q) ||
        (sub.notes && sub.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col justify-between bg-[#FAF8F5] text-[#171717]">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-4 space-y-3.5">
        {/* Top App Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-1 rounded-full hover:bg-[#EFECE4] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#171717]" />
          </button>
          <h2 className="text-base font-bold text-[#171717]">Subscriptions</h2>
          <button
            onClick={() => {
              const el = document.getElementById('screen3SearchInput');
              el?.focus();
            }}
            className="p-1 rounded-full hover:bg-[#EFECE4] transition-colors"
          >
            <Search className="w-5 h-5 text-[#171717]" />
          </button>
        </div>

        {/* Filter Chips Row */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-[#3D5438] text-white shadow-xs'
                : 'bg-[#F0ECE4] text-[#171717] hover:bg-[#E5E0D8]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === 'upcoming'
                ? 'bg-[#3D5438] text-white shadow-xs'
                : 'bg-[#F0ECE4] text-[#171717] hover:bg-[#E5E0D8]'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('needs_review')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === 'needs_review'
                ? 'bg-[#3D5438] text-white shadow-xs'
                : 'bg-[#F0ECE4] text-[#171717] hover:bg-[#E5E0D8]'
            }`}
          >
            Needs review
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
          <input
            id="screen3SearchInput"
            type="text"
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F5F2EA] focus:bg-white border border-[#E5E0D8] focus:border-[#3D5438] rounded-full pl-9 pr-4 py-2 text-xs text-[#171717] placeholder-[#737373] outline-none transition-colors"
          />
        </div>

        {/* Subscriptions List */}
        <div className="space-y-1.5 pt-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#737373]">
              No subscriptions match your filter or search.
            </div>
          ) : (
            filtered.map((sub) => {
              const isAnnual = sub.interval === 'year';
              const recurrenceLabel = isAnnual ? 'Annual' : 'Monthly';
              const isReview = sub.status === 'needs_review';

              return (
                <div
                  key={sub.id}
                  onClick={() => onSelectSubscription(sub)}
                  className="cursor-pointer bg-white hover:bg-[#FAF8F5] p-3 rounded-2xl border border-[#E5E0D8]/70 flex items-center justify-between shadow-xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BrandIcon providerName={sub.providerName} size={36} />
                    <div>
                      <h4 className="text-sm font-bold text-[#171717]">
                        {sub.providerName}
                      </h4>
                      <div className="text-xs text-[#737373]">
                        {recurrenceLabel} · {sub.nextRenewalDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isReview ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FDEEE2] text-[#C2671A]">
                        Needs review
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E2EBD8] text-[#3D5438]">
                        Active
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-[#737373]" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
