import React from 'react';
import { LayoutDashboard, CreditCard, CalendarDays, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'subscriptions' | 'agenda' | 'settings';
  onSelectTab: (tab: 'home' | 'subscriptions' | 'agenda' | 'settings') => void;
  subscriptionCount: number;
}

interface TabItem {
  id: 'home' | 'subscriptions' | 'agenda' | 'settings';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  subscriptionCount,
}) => {
  const tabs: TabItem[] = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: subscriptionCount },
    { id: 'agenda', label: 'Saved', icon: CalendarDays },
    { id: 'settings', label: 'Profile', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E1511]/95 backdrop-blur-md border-t border-[#1E2A23] px-2 py-2">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative ${
                isActive ? 'text-[#78E08F]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#78E08F] text-[#0B0F0D] text-[9px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 font-semibold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
