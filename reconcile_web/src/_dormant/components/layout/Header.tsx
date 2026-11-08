import React, { useState } from 'react';
import { Bell, Plus, ShieldCheck, Mail } from 'lucide-react';
import { RenewalOccurrence } from '../../types/subscription';
import { InsightsCalculator } from '../../services/insightsCalculator';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenGmailModal: () => void;
  upcomingOccurrences: RenewalOccurrence[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenGmailModal,
  upcomingOccurrences,
  searchQuery,
  onSearchChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#0B0F0D]/90 backdrop-blur-md border-b border-[#1E2A23] px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile Brand & Desktop Search */}
        <div className="flex items-center gap-4 flex-1">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#78E08F] flex items-center justify-center font-black text-[#0B0F0D] text-sm">
              R
            </div>
            <span className="font-extrabold tracking-wider text-base text-white">RECONCILE</span>
          </div>

          <div className="hidden sm:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search subscriptions, plans, or tags..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#141C18] border border-[#28362F] focus:border-[#78E08F] focus:outline-none rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions & Notifications */}
        <div className="flex items-center gap-3">
          {/* Gmail Connect Button */}
          <button
            onClick={onOpenGmailModal}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141C18] border border-[#28362F] hover:border-[#78E08F]/50 text-xs font-medium text-gray-300 hover:text-white transition-all"
          >
            <Mail className="w-3.5 h-3.5 text-[#78E08F]" />
            <span>Connect Gmail</span>
            <ShieldCheck className="w-3 h-3 text-[#78E08F]" />
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-[#141C18] border border-[#28362F] hover:border-[#78E08F]/50 text-gray-300 hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {upcomingOccurrences.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#78E08F] text-[#0B0F0D] text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {upcomingOccurrences.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#141C18] border border-[#28362F] rounded-2xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-[#28362F]">
                  <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#78E08F]" />
                    Renewal Alerts ({upcomingOccurrences.length})
                  </h4>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <div className="divide-y divide-[#1E2A23] max-h-72 overflow-y-auto mt-2">
                  {upcomingOccurrences.slice(0, 5).map((occ) => (
                    <div key={occ.subscriptionId} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">{occ.providerName}</div>
                        <div className="text-xs text-gray-400">
                          Due {occ.date} • {occ.daysRemaining === 0 ? 'Today' : occ.daysRemaining === 1 ? 'Tomorrow' : `In ${occ.daysRemaining} days`}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-[#78E08F]">
                        {InsightsCalculator.formatCurrency(occ.amount, occ.currency)}
                      </div>
                    </div>
                  ))}
                  {upcomingOccurrences.length === 0 && (
                    <div className="py-6 text-center text-xs text-gray-400">
                      No renewals due this week. You are all set!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Primary "+ New Subscription" Action */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#78E08F] hover:bg-[#66D17E] text-[#0B0F0D] font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Subscription</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
