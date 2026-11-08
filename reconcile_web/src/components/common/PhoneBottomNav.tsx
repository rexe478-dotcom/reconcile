import React from 'react';
import { Home, Compass, Bookmark, User } from 'lucide-react';

interface PhoneBottomNavProps {
  activeTab: 'home' | 'explore' | 'saved' | 'profile';
  onSelectTab: (tab: 'home' | 'explore' | 'saved' | 'profile') => void;
}

export const PhoneBottomNav: React.FC<PhoneBottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'explore' as const, label: 'Explore', icon: Compass },
    { id: 'saved' as const, label: 'Saved', icon: Bookmark },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <div className="bg-white border-t border-[#E5E0D8] px-4 py-1.5 flex items-center justify-around shrink-0 z-10">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
              isActive ? 'text-[#3D5438]' : 'text-[#737373] hover:text-[#171717]'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] font-semibold tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
