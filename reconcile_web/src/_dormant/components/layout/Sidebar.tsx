import React from 'react';
import { LayoutDashboard, CreditCard, CalendarDays, Settings, ShieldAlert, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeTab: 'home' | 'subscriptions' | 'agenda' | 'settings';
  onSelectTab: (tab: 'home' | 'subscriptions' | 'agenda' | 'settings') => void;
  activeCount: number;
  totalMonthlyFormatted: string;
}

interface NavItem {
  id: 'home' | 'subscriptions' | 'agenda' | 'settings';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeCount,
  totalMonthlyFormatted,
}) => {
  const navItems: NavItem[] = [
    { id: 'home', label: 'Overview', icon: LayoutDashboard },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, badge: activeCount },
    { id: 'agenda', label: 'Agenda & Renewals', icon: CalendarDays },
    { id: 'settings', label: 'Settings & Data', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0E1511] border-r border-[#1E2A23] min-h-screen p-5 justify-between">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#78E08F] flex items-center justify-center font-black text-[#0B0F0D] text-lg shadow-lg shadow-[#78E08F]/20">
            R
          </div>
          <div>
            <span className="font-black tracking-wider text-lg text-white block">RECONCILE</span>
            <span className="text-[11px] text-[#78E08F] font-semibold tracking-wide">KNOW WHAT RENEWS</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#18231C] text-[#78E08F] border border-[#78E08F]/30 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#141C18]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#78E08F]' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-[#78E08F] text-[#0B0F0D]' : 'bg-[#1E2A23] text-gray-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Summary Widget */}
      <div className="p-4 rounded-2xl bg-[#141C18] border border-[#28362F] space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>Active Commitment</span>
          <Sparkles className="w-3.5 h-3.5 text-[#78E08F]" />
        </div>
        <div className="text-xl font-extrabold text-white">{totalMonthlyFormatted}</div>
        <div className="text-[11px] text-gray-400 leading-relaxed flex items-start gap-1.5 pt-1 border-t border-[#1E2A23]">
          <ShieldAlert className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
          <span>Local Gregorian engine with strict month-end preservation.</span>
        </div>
      </div>
    </aside>
  );
};
