import React from 'react';
import { Shield } from 'lucide-react';
import { MascotLogo } from '../components/common/MascotLogo';

interface Screen1OnboardingProps {
  onAddManually: () => void;
}

export const Screen1Onboarding: React.FC<Screen1OnboardingProps> = ({
  onAddManually,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-4 text-center bg-[#FAF8F5]">
      {/* Top Header Logo */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <MascotLogo size={28} className="shadow-xs" />
        <span className="font-extrabold tracking-[0.2em] text-xs text-[#171717]">
          RECONCILE
        </span>
      </div>

      {/* Hero Content */}
      <div className="space-y-3 my-auto pt-2">
        <h1 className="text-[28px] sm:text-[32px] font-black text-[#171717] tracking-tight leading-[1.15]">
          Know what<br />renews next.
        </h1>

        <p className="text-xs sm:text-[13px] text-[#737373] leading-relaxed max-w-[260px] mx-auto font-medium">
          Track your subscriptions, get timely reminders, and never pay for what you don't use.
        </p>

        {/* Handcrafted Graphic Matching Reference Image */}
        <div className="py-4 flex justify-center">
          <div className="relative w-36 h-36">
            {/* Burst rays behind circle badge */}
            <svg className="absolute -right-3 -top-1 w-16 h-16 pointer-events-none text-[#737373]/40" viewBox="0 0 40 40">
              <line x1="20" y1="6" x2="20" y2="0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="28" y1="10" x2="34" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="32" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>

            {/* Calendar card */}
            <div className="w-28 h-28 mx-auto mt-2 bg-white rounded-2xl border-2 border-[#E5E0D8] shadow-sm flex flex-col overflow-hidden relative">
              {/* Spiral rings top */}
              <div className="h-6 bg-[#EFECE4] border-b border-[#E5E0D8] flex items-center justify-around px-2">
                <div className="w-2 h-3 rounded-full bg-[#3D5438]/80 -mt-2" />
                <div className="w-2 h-3 rounded-full bg-[#3D5438]/80 -mt-2" />
                <div className="w-2 h-3 rounded-full bg-[#3D5438]/80 -mt-2" />
                <div className="w-2 h-3 rounded-full bg-[#3D5438]/80 -mt-2" />
              </div>
              {/* Grid dots */}
              <div className="p-2.5 grid grid-cols-4 gap-1.5 opacity-40">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-sm bg-[#3D5438]" />
                ))}
              </div>
            </div>

            {/* Overlapping Olive Clock/L Badge */}
            <div className="absolute right-3 bottom-2 w-12 h-12 rounded-full bg-[#3D5438] text-white flex items-center justify-center font-black text-lg shadow-md border-2 border-[#FAF8F5]">
              <span className="font-serif">L</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons & Microcopy */}
      <div className="space-y-3 pb-2">
        {/* Get Started Primary Button */}
        <button
          onClick={onAddManually}
          className="w-full py-3.5 px-4 rounded-full bg-[#3D5438] hover:bg-[#32462E] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.98] transition-all"
        >
          <span>Get Started — Add Subscriptions</span>
        </button>

        {/* Privacy Shield Disclaimer */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#737373] max-w-[260px] mx-auto pt-1">
          <Shield className="w-3.5 h-3.5 shrink-0 text-[#737373]" />
          <span>Your financial commitments remain strictly private and encrypted.</span>
        </div>

        {/* Carousel Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <div className="w-2 h-2 rounded-full bg-[#3D5438]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#D8D2C6]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#D8D2C6]" />
        </div>
      </div>
    </div>
  );
};
