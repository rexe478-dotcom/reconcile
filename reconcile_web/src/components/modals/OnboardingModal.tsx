import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ShieldCheck, 
  Bell, 
  CreditCard, 
  ExternalLink, 
  Sparkles,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { MascotLogo } from '../common/MascotLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      id: 'welcome',
      tag: 'Financial Guardian',
      title: 'Never Get Billed by Surprise Again',
      subtitle: 'Reconcile tracks your subscription renewal cycles, notice deadlines, and price increases so your bank account stays in your control.',
      visual: (
        <div className="flex flex-col items-center justify-center p-6 bg-[#FAF8F5] rounded-3xl border border-[#E5E0D8] space-y-3">
          <MascotLogo size={96} className="shadow-md" interactive={false} />
          <div className="text-center">
            <span className="text-xs font-bold text-[#3D5438] bg-[#E2EBD8] px-3 py-1 rounded-full inline-block">
              Vigilant Owl Guardian
            </span>
            <p className="text-[11px] text-[#737373] mt-2 max-w-xs">
              Watching your recurring payments so you never wake up to an unexpected auto-debit.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'renewal-radar',
      tag: 'Renewal Radar',
      title: 'Smart Advance Renewal Alerts',
      subtitle: 'Know what renews tomorrow, next week, or next month. Set custom reminder windows and export renewals to Google or Apple Calendar.',
      visual: (
        <div className="p-4 bg-[#FAF8F5] rounded-3xl border border-[#E5E0D8] space-y-3">
          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E0D8] shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E50914]/10 text-[#E50914] font-black flex items-center justify-center text-sm">
                N
              </div>
              <div>
                <div className="font-bold text-xs text-[#171717]">Netflix Premium</div>
                <div className="text-[11px] text-[#737373]">Renews in 2 days • Monthly</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-black text-xs text-[#171717]">?5,000</div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Bell className="w-2.5 h-2.5" /> Due Soon
              </span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E5E0D8] shadow-2xs flex items-center justify-between opacity-80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1DB954]/10 text-[#1DB954] font-black flex items-center justify-center text-sm">
                S
              </div>
              <div>
                <div className="font-bold text-xs text-[#171717]">Spotify Duo</div>
                <div className="text-[11px] text-[#737373]">Renews in 18 days</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-black text-xs text-[#171717]">?1,300</div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#3D5438] bg-[#E2EBD8]/60 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'cancellation',
      tag: 'Zero Dark Patterns',
      title: '1-Click Cancellation Handoff',
      subtitle: 'Tired of labyrinth subscription cancellation traps? Reconcile provides verified direct links that take you straight to provider billing portals.',
      visual: (
        <div className="p-5 bg-[#FAF8F5] rounded-3xl border border-[#E5E0D8] space-y-3">
          <div className="bg-white p-4 rounded-2xl border border-[#E5E0D8] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#171717]">Verified Handoff Available</span>
              <span className="text-[10px] font-bold text-[#3D5438] bg-[#E2EBD8] px-2 py-0.5 rounded-full">
                Direct Route
              </span>
            </div>
            <p className="text-xs text-[#737373]">
              Skip 5 hidden menus. Tap once to open the exact cancellation or plan downgrade settings page.
            </p>
            <div className="p-2.5 rounded-xl bg-[#F5F2EA] border border-[#E5E0D8] text-xs font-bold text-[#3D5438] flex items-center justify-between">
              <span>Open Spotify Account Settings</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'sync',
      tag: 'Privacy First',
      title: 'Offline First or Cloud Synced',
      subtitle: 'Your financial data is saved on this device. Sign in with Google via Clerk anytime to sync securely across all your phones, tablets, and computers.',
      visual: (
        <div className="p-5 bg-[#FAF8F5] rounded-3xl border border-[#E5E0D8] space-y-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#E2EBD8] text-[#3D5438] flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#171717]">Private & Encrypted</h4>
            <p className="text-xs text-[#737373] mt-1 max-w-xs mx-auto">
              Backed by Clerk authentication and Neon PostgreSQL serverless database. No advertising trackers, no spam emails.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-semibold text-[#3D5438]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>1-Click Google Sign-In Available</span>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('reconcile_onboarding_completed', 'true');
    }
    onClose();
  };

  const current = steps[currentStep];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleComplete}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E5E0D8] overflow-hidden spring-dialog flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Progress and Close */}
        <div className="p-5 sm:p-6 pb-2 flex items-center justify-between border-b border-[#E5E0D8]/60">
          {/* Progress Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep 
                    ? 'w-7 bg-[#3D5438]' 
                    : idx < currentStep 
                    ? 'w-2 bg-[#3D5438]/50' 
                    : 'w-2 bg-[#E5E0D8]'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleComplete}
            className="p-1.5 rounded-full hover:bg-[#FAF8F5] text-[#737373] hover:text-[#171717] transition-colors cursor-pointer"
            title="Close tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Tag Pill */}
          <span className="text-[11px] font-black uppercase tracking-wider text-[#3D5438] bg-[#E2EBD8] px-3 py-1 rounded-full inline-block">
            {current.tag}
          </span>

          {/* Heading and Subtitle */}
          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
              {current.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
              {current.subtitle}
            </p>
          </div>

          {/* Interactive Feature Visual */}
          <div className="pt-1">
            {current.visual}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-5 sm:p-6 pt-3 bg-[#FAF8F5] border-t border-[#E5E0D8] flex items-center justify-between gap-3">
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleComplete}
              className="text-xs font-bold text-[#737373] hover:text-[#171717] py-2 px-3 rounded-xl hover:bg-white transition-colors cursor-pointer"
            >
              Skip tour
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#3D5438] hover:bg-[#32462E] active:scale-[0.98] text-white font-black text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer ml-auto"
          >
            <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
            {currentStep === steps.length - 1 ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
