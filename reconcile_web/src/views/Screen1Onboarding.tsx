import React from 'react';
import { Shield, ArrowRight } from 'lucide-react';
import { MascotLogo } from '../components/common/MascotLogo';
import { LottiePlayer } from '../components/common/LottiePlayer';
import onboardingCalendarAnim from '../assets/animations/onboarding_calendar.json';

interface Screen1OnboardingProps {
  onAddManually: () => void;
}

export const Screen1Onboarding: React.FC<Screen1OnboardingProps> = ({
  onAddManually,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-6 text-center bg-[#FAF8F5] min-h-[580px] max-w-md mx-auto w-full select-none">
      {/* Top Header Logo */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <MascotLogo size={28} className="shadow-xs" />
        <span className="font-extrabold tracking-[0.2em] text-xs text-[#171717]">
          RECONCILE
        </span>
      </div>

      {/* Hero Content & Animated Calendar */}
      <div className="space-y-4 my-auto pt-3">
        <div className="space-y-2">
          <h1 className="text-[30px] sm:text-[34px] font-black text-[#171717] tracking-tight leading-[1.12]">
            Know what<br />
            <span className="text-[#3D5438]">renews next.</span>
          </h1>

          <p className="text-xs sm:text-[13px] text-[#737373] leading-relaxed max-w-[270px] mx-auto font-medium">
            Track your subscriptions, get timely reminders, and never pay for what you don't use.
          </p>
        </div>

        {/* Lottie Animation: Onboarding Calendar with Radiant Burst & Clock Badge */}
        <div className="py-2 flex items-center justify-center">
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
            {/* Subtle ambient warm glow behind animation */}
            <div className="absolute inset-4 rounded-full bg-[#E2EBD8]/40 filter blur-xl -z-0 pointer-events-none" />
            <LottiePlayer
              animationData={onboardingCalendarAnim}
              loop={true}
              autoplay={true}
              className="w-full h-full relative z-10"
              ariaLabel="Interactive animated renewal calendar with notification clock"
            />
          </div>
        </div>
      </div>

      {/* Buttons, Privacy Guarantee & Microcopy */}
      <div className="space-y-3.5 pb-2">
        {/* Get Started Primary Button */}
        <button
          onClick={onAddManually}
          type="button"
          className="w-full py-4 px-6 rounded-full bg-[#3D5438] hover:bg-[#32462E] active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer btn-tactile"
        >
          <span>Get Started — Add Subscriptions</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Privacy Shield Disclaimer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#737373] max-w-[270px] mx-auto pt-0.5">
          <Shield className="w-3.5 h-3.5 shrink-0 text-[#3D5438]" />
          <span>Your financial commitments remain strictly private and encrypted.</span>
        </div>

        {/* Carousel Progress Indicators */}
        <div className="flex items-center justify-center gap-1.5 pt-1.5" aria-hidden="true">
          <div className="w-5 h-1.5 rounded-full bg-[#3D5438] transition-all" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#D8D2C6]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#D8D2C6]" />
        </div>
      </div>
    </div>
  );
};
