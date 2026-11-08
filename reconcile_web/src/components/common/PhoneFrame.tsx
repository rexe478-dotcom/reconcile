import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, title, className = '' }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {title && (
        <span className="text-xs font-bold text-[#737373] uppercase tracking-wider mb-2">
          {title}
        </span>
      )}
      <div className="relative w-[340px] sm:w-[360px] h-[720px] bg-[#FAF8F5] text-[#171717] rounded-[48px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border-[8px] border-[#1C1F1E] flex flex-col overflow-hidden ring-1 ring-black/5">
        {/* Top Status Bar with Camera Punch-Hole */}
        <div className="pt-3 px-6 pb-1 flex items-center justify-between text-xs font-semibold text-[#171717] select-none shrink-0 z-20">
          <span className="font-semibold text-[13px] tracking-tight">9:41</span>
          {/* Camera Notch / Hole */}
          <div className="w-4 h-4 rounded-full bg-[#1C1F1E] mx-auto shadow-inner" />
          <div className="flex items-center gap-1.5 text-[#171717]">
            <Signal className="w-3.5 h-3.5 fill-current" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4" />
          </div>
        </div>

        {/* Screen Dynamic Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative select-text">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="py-2 flex justify-center shrink-0 bg-transparent z-20">
          <div className="w-32 h-1 bg-[#171717]/40 rounded-full" />
        </div>
      </div>
    </div>
  );
};
