import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Check, X, Bell, Calendar, Sparkles } from 'lucide-react';
import { ReconcileLogo } from '../common/ReconcileLogo';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleFinish = useCallback(() => {
    localStorage.setItem('reconcile_onboarding_completed', 'true');
    onClose();
  }, [onClose]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        e.preventDefault();
        setCurrentStep((prev) => prev - 1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Reconcile Onboarding Tour"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleSkip}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-[#F5F3ED] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E5E0D5] flex flex-col justify-between overflow-hidden min-h-[580px] sm:min-h-[620px] spring-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header / Skip Button */}
        <div className="flex items-center justify-between w-full h-8">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="text-xs font-semibold text-[#858477] hover:text-[#1A1A1A] transition-colors cursor-pointer py-1 px-2 -ml-2 rounded-lg"
              aria-label="Previous step"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-bold text-[#858477] hover:text-[#1A1A1A] transition-colors cursor-pointer py-1 px-2.5 rounded-full hover:bg-[#E5E0D5]/50"
          >
            Skip
          </button>
        </div>

        {/* Dynamic Screen Content with Horizontal Animation */}
        <div className="flex-1 flex flex-col justify-center my-3 text-center">
          {/* SCREEN 1: WELCOME */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-250 flex flex-col items-center">
              {/* Official Reconcile Logo Lockup */}
              <div className="flex flex-col items-center space-y-1">
                <ReconcileLogo variant="mark" size={64} className="mx-auto" />
                <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight mt-2">
                  Reconcile
                </h1>
                <p className="text-sm font-semibold text-[#858477]">
                  Never miss a subscription again.
                </p>
              </div>

              {/* Character Illustration with Soft Green Halo */}
              <div className="relative w-44 h-48 sm:w-48 sm:h-52 my-2 flex items-center justify-center">
                {/* Soft accent halo background */}
                <div className="absolute w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-[#A5C96B]/25 filter blur-xs -z-0" />
                <div className="absolute -top-1 -right-1 text-[#A5C96B] font-bold text-lg select-none">
                  ✦
                </div>
                <img
                  src="./assets/mascot/mascot-holding-phone.png"
                  alt="Reconcile Mascot holding phone"
                  className="relative z-10 w-full h-full object-contain select-none pointer-events-none drop-shadow-xs"
                />
              </div>

              {/* Supporting Value Proposition */}
              <p className="text-xs sm:text-sm text-[#858477] max-w-xs mx-auto leading-relaxed">
                Keep your recurring subscriptions organized and stay safely ahead of every renewal notice deadline.
              </p>
            </div>
          )}

          {/* SCREEN 2: TRACK YOUR SUBSCRIPTIONS */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-250 flex flex-col items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">
                  Stay on top of your{' '}
                  <span className="text-[#89AC50]">subscriptions</span>.
                </h2>
                <p className="text-xs sm:text-sm text-[#858477] mt-1.5 max-w-xs mx-auto">
                  Keep all your recurring subscriptions organized in one clean, privacy-first ledger.
                </p>
              </div>

              {/* Visual: Working Mascot with floating service pills */}
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 my-1 flex items-center justify-center">
                <div className="absolute w-44 h-44 rounded-full bg-[#EBF3DF] -z-0" />
                <img
                  src="./assets/mascot/mascot-working.png"
                  alt="Reconcile Mascot working on subscription tracking"
                  className="relative z-10 w-full h-full object-contain select-none pointer-events-none drop-shadow-xs"
                />

                {/* Floating Service Badges */}
                <div className="absolute -top-1 -left-2 bg-white px-2.5 py-1 rounded-xl shadow-xs border border-[#E5E0D5] flex items-center gap-1.5 z-20 animate-bounce duration-1000">
                  <span className="w-2 h-2 rounded-full bg-[#1DB954]" />
                  <span className="text-[10px] font-bold text-[#1A1A1A]">Spotify</span>
                </div>
                <div className="absolute top-8 -right-2 bg-white px-2.5 py-1 rounded-xl shadow-xs border border-[#E5E0D5] flex items-center gap-1.5 z-20">
                  <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                  <span className="text-[10px] font-bold text-[#1A1A1A]">Netflix</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white px-2.5 py-1 rounded-xl shadow-xs border border-[#E5E0D5] flex items-center gap-1.5 z-20">
                  <span className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                  <span className="text-[10px] font-bold text-[#1A1A1A]">Apple</span>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-2xl border border-[#E5E0D5] max-w-xs w-full text-left flex items-center gap-2.5 shadow-2xs">
                <img src="./assets/illustrations/checklist.png" alt="List" className="w-8 h-8 object-contain" />
                <div className="text-[11px] text-[#1A1A1A]">
                  <strong className="block font-bold">Streaming, Cloud & Utilities</strong>
                  <span className="text-[#858477]">Monthly, yearly, and custom billing intervals</span>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 3: RENEWAL REMINDERS */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-250 flex flex-col items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">
                  Get notified before{' '}
                  <span className="text-[#89AC50]">renewal</span>.
                </h2>
                <p className="text-xs sm:text-sm text-[#858477] mt-1.5 max-w-xs mx-auto">
                  Receive timely alerts before charges hit your bank, so you are always prepared.
                </p>
              </div>

              {/* Visual: Green Bell Illustration with Glowing Soft Aura */}
              <div className="relative w-44 h-40 my-1 flex items-center justify-center">
                <div className="absolute w-36 h-36 rounded-full bg-[#A5C96B]/25 filter blur-xs -z-0" />
                <img
                  src="./assets/illustrations/notification.png"
                  alt="Renewal Bell Notification"
                  className="relative z-10 w-28 h-28 object-contain select-none pointer-events-none drop-shadow-xs"
                />
              </div>

              {/* Real Notification Preview Card */}
              <div className="w-full max-w-xs bg-white rounded-2xl p-3.5 border border-[#E5E0D5] shadow-xs text-left space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold text-[#1A1A1A]">
                    <ReconcileLogo variant="mark" size={14} />
                    <span>Reconcile Alert</span>
                  </div>
                  <span className="text-[10px] text-[#858477]">Tomorrow</span>
                </div>
                <div className="text-xs font-bold text-[#1A1A1A]">
                  Spotify Duo renews in 24 hours
                </div>
                <div className="text-[11px] text-[#858477] flex items-center justify-between pt-1">
                  <span>Upcoming charge: ₦1,300</span>
                  <span className="text-[#3D5438] bg-[#EBF3DF] font-bold text-[10px] px-2 py-0.5 rounded-full">
                    Reminder Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 4: GET STARTED */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-250 flex flex-col items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">
                  Ready to{' '}
                  <span className="text-[#89AC50]">Reconcile?</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#858477] mt-1.5 max-w-xs mx-auto">
                  Take control of your recurring subscriptions today.
                </p>
              </div>

              {/* Visual: Mascot winking with thumbs up and smartphone */}
              <div className="relative w-48 h-52 my-1 flex items-center justify-center">
                <div className="absolute w-44 h-44 rounded-full bg-[#A5C96B]/25 filter blur-xs -z-0" />
                <img
                  src="./assets/mascot/mascot-excited.png"
                  alt="Reconcile Mascot Ready"
                  className="relative z-10 w-full h-full object-contain select-none pointer-events-none drop-shadow-xs"
                />
              </div>

              <p className="text-xs text-[#858477] max-w-xs mx-auto">
                Offline by default. Sync to cloud database anytime with Google or Email.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Navigation: 4-Dot Progress Indicators & Primary Button */}
        <div className="space-y-4 pt-2">
          {/* Progress Indicators (4 Dots / Pills) */}
          <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Onboarding Progress">
            {[0, 1, 2, 3].map((stepIndex) => (
              <button
                key={stepIndex}
                type="button"
                onClick={() => setCurrentStep(stepIndex)}
                className={`transition-all duration-200 cursor-pointer rounded-full ${
                  currentStep === stepIndex
                    ? 'w-7 h-2.5 bg-[#89AC50]'
                    : 'w-2.5 h-2.5 bg-[#E5E0D5] hover:bg-[#DAD8D0]'
                }`}
                aria-label={`Go to step ${stepIndex + 1}`}
                aria-selected={currentStep === stepIndex}
              />
            ))}
          </div>

          {/* Primary Action Button */}
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-[#1A1A1A] hover:bg-[#2C2C2C] active:scale-[0.98] text-white text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer btn-tactile"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-[#89AC50] hover:bg-[#7B9D45] active:scale-[0.98] text-[#1A1A1A] text-sm font-black shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer btn-tactile"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <p className="text-[11px] text-[#858477] text-center">
            {currentStep === 3
              ? 'You can always access this tour again in Settings.'
              : 'Press Enter or Arrow Right to advance.'}
          </p>
        </div>
      </div>
    </div>
  );
};
