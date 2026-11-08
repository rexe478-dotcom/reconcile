import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Laptop, 
  Bell, 
  Calendar, 
  BarChart2, 
  ChevronRight, 
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface LandingPageViewProps {
  onLaunchApp: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onLaunchApp }) => {
  // PWA beforeinstallprompt event capture
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  
  // Platform detection
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // 1. Detect if running inside installed standalone PWA
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsInstalled(isStandaloneMode);
    };
    checkStandalone();

    // 2. Detect OS
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isAndroidDevice = /android/i.test(ua);
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // 3. Capture beforeinstallprompt on Android / Chromium
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // 4. Track app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallSuccess(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle Android / Chrome Install Button Click
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstallSuccess(true);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Fallback instructions for desktop or unsupported browsers
      alert(
        'To install Reconcile:\n\n• On Chrome/Edge: Click the install icon (⊕) in the browser address bar.\n• On Mobile: Tap browser menu (⋮) and select "Install app" or "Add to Home screen".'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#171717] flex flex-col font-sans selection:bg-[#E2EBD8] selection:text-[#3D5438]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E5E0D8]/60 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3D5438] flex items-center justify-center text-white font-black text-sm shadow-sm">
              R
            </div>
            <span className="font-extrabold tracking-[0.2em] text-sm text-[#171717]">
              RECONCILE
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onLaunchApp}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#3D5438] hover:bg-[#EFECE4] transition-colors border border-[#D8D2C6]"
            >
              Launch in Browser
            </button>
            <button
              onClick={() => {
                if (isIOS) setShowIOSModal(true);
                else handleInstallClick();
              }}
              className="px-4 py-2 rounded-full text-xs font-bold bg-[#3D5438] hover:bg-[#32462E] text-white shadow-xs transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isInstalled ? 'Installed' : 'Install PWA'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left Column: Value Proposition & Install CTAs */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E2EBD8] text-[#3D5438] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cross-Platform Progressive Web App</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#171717] tracking-tight leading-[1.12]">
            Know what<br />renews next.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[#737373] max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
            Track subscriptions, get timely reminders, and never pay for what you don't use. Install instantly on Android, iPhone, iPad, or desktop — no app store download required.
          </p>

          {/* Platform Smart Install Box */}
          <div className="bg-[#F0ECE4] rounded-3xl p-5 sm:p-6 border border-[#E5E0D8] shadow-xs max-w-md mx-auto lg:mx-0 space-y-4">
            {isInstalled ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-[#3D5438]">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-bold">Reconcile is installed on this device!</span>
                </div>
                <button
                  onClick={onLaunchApp}
                  className="w-full py-3.5 px-6 rounded-full bg-[#3D5438] hover:bg-[#32462E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Open Application</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : isIOS ? (
              // iOS Flow
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#737373] font-medium">
                  <span>Detected Platform</span>
                  <span className="font-bold text-[#171717] flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" /> iPhone / iPad (Safari)
                  </span>
                </div>
                <button
                  onClick={() => setShowIOSModal(true)}
                  className="w-full py-3.5 px-6 rounded-full bg-[#3D5438] hover:bg-[#32462E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Install on iPhone / iPad</span>
                </button>
                <p className="text-[11px] text-[#737373] text-center">
                  Installs directly to your home screen using Safari's "Add to Home Screen".
                </p>
              </div>
            ) : (
              // Android / Desktop Flow
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#737373] font-medium">
                  <span>Detected Platform</span>
                  <span className="font-bold text-[#171717] flex items-center gap-1">
                    {isAndroid ? <Smartphone className="w-3.5 h-3.5" /> : <Laptop className="w-3.5 h-3.5" />}
                    {isAndroid ? 'Android Device' : 'Desktop / Laptop Browser'}
                  </span>
                </div>
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-6 rounded-full bg-[#3D5438] hover:bg-[#32462E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>{isInstallable ? 'Install Reconcile App' : 'Add to Home Screen'}</span>
                </button>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={onLaunchApp}
                    className="text-xs text-[#3D5438] font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Or continue using in browser</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {installSuccess && (
              <div className="p-3 rounded-xl bg-[#E2EBD8] text-[#3D5438] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Installation initiated! Check your home screen or app launcher.</span>
              </div>
            )}
          </div>

          {/* Privacy & Reassurance */}
          <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-[#737373] pt-2">
            <ShieldCheck className="w-4 h-4 text-[#3D5438] shrink-0" />
            <span>Zero monthly subscription fee · Works offline · HTTPS Encrypted</span>
          </div>
        </div>

        {/* Right Column: Visual App Showcase Frame */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-[300px] sm:w-[320px] rounded-[44px] bg-[#1E1E1E] p-3 shadow-2xl border-4 border-[#2C2C2C]">
            {/* Phone Screen Mockup */}
            <div className="w-full h-[580px] bg-[#FAF8F5] rounded-[34px] overflow-hidden flex flex-col border border-[#E5E0D8]/40 shadow-inner">
              {/* Phone Header */}
              <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-[#E5E0D8]/40">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-[#3D5438] flex items-center justify-center text-white font-black text-[10px]">
                    R
                  </div>
                  <span className="font-extrabold tracking-[0.18em] text-[10px] text-[#171717]">
                    RECONCILE
                  </span>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#EA4335]" />
              </div>

              {/* Mock Home Content */}
              <div className="p-4 space-y-3 flex-1 overflow-hidden">
                <h3 className="text-sm font-black text-[#171717]">Your subscriptions</h3>

                {/* Spend Card */}
                <div className="bg-[#F0ECE4] rounded-2xl p-3.5 border border-[#E5E0D8]/70 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-black text-[#171717]">₦24,500</div>
                    <div className="text-[10px] text-[#737373]">Total monthly spend</div>
                  </div>
                  <BarChart2 className="w-5 h-5 text-[#3D5438]" />
                </div>

                {/* Next Up */}
                <div className="bg-[#F5F2EA] rounded-2xl p-3 border border-[#E5E0D8]/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white border border-[#D8D2C6] flex items-center justify-center text-[#3D5438]">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[9px] text-[#737373] block">Next up</span>
                      <span className="text-xs font-bold text-[#171717] block">Netflix</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#171717]">₦7,500</span>
                </div>

                {/* Upcoming List */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-[#171717] block">Upcoming this week</span>
                  <div className="bg-white p-2.5 rounded-xl border border-[#E5E0D8] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#171717]">Spotify</span>
                    <span className="font-bold text-[#171717]">₦2,500</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#E5E0D8] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#171717]">Adobe</span>
                    <span className="font-bold text-[#171717]">₦14,000</span>
                  </div>
                </div>
              </div>

              {/* Bottom Nav Mock */}
              <div className="p-3 bg-white border-t border-[#E5E0D8] flex justify-around">
                <button
                  onClick={onLaunchApp}
                  className="w-full py-2 rounded-full bg-[#3D5438] text-white font-bold text-xs shadow-xs"
                >
                  Test Live App →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Highlights Grid */}
      <section className="bg-white border-t border-[#E5E0D8]/80 py-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-black text-[#171717] tracking-tight">
              Built for Complete Subscription Clarity
            </h2>
            <p className="text-xs sm:text-sm text-[#737373]">
              Every feature designed to prevent unwanted recurring charges with authentic calendar arithmetic.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E5E0D8] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E2EBD8] text-[#3D5438] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#171717]">Independent Engine</h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                Leap-year aware Gregorian calendar recurrence. Month-end anchoring handles Feb 28/29, Apr 30, and year-end dates flawlessly.
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E5E0D8] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E2EBD8] text-[#3D5438] flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#171717]">Timely Reminders</h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                Honest alerts at 3 days, 1 day, and day-of renewal. Never claims unverified charges or guesses subscription renewals.
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E5E0D8] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E2EBD8] text-[#3D5438] flex items-center justify-center">
                <ExternalLink className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#171717]">Cancellation Handoff</h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                Direct verified links to official provider cancellation pages. No fake automated cancellation promises or third-party credential sniffing.
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E5E0D8] space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E2EBD8] text-[#3D5438] flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[#171717]">Install Anywhere</h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                Runs standalone on iOS, Android, and desktop. Offline fallback screen caches your data when network connectivity drops.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E0D8] py-6 px-4 text-center text-xs text-[#737373]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 Reconcile. All rights reserved. Free & Open Source PWA.</span>
          <button
            onClick={onLaunchApp}
            className="font-bold text-[#3D5438] hover:underline flex items-center gap-1"
          >
            <span>Open Application</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>

      {/* iOS Installation Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl border border-[#E5E0D8] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#3D5438] flex items-center justify-center text-white font-black text-xs">
                  R
                </div>
                <h3 className="font-bold text-sm text-[#171717]">Install on iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F5F2EA] transition-colors"
              >
                <X className="w-4 h-4 text-[#737373]" />
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 bg-[#FAF8F5] p-3 rounded-2xl border border-[#E5E0D8]">
                <div className="w-6 h-6 rounded-full bg-[#3D5438] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-[#171717]">Open in Safari</p>
                  <p className="text-[#737373] mt-0.5">
                    Make sure this page is open in Apple Safari on your iPhone or iPad.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#FAF8F5] p-3 rounded-2xl border border-[#E5E0D8]">
                <div className="w-6 h-6 rounded-full bg-[#3D5438] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-[#171717] flex items-center gap-1.5">
                    <span>Tap Share</span>
                    <Share className="w-3.5 h-3.5 text-[#007AFF]" />
                  </p>
                  <p className="text-[#737373] mt-0.5">
                    Tap the Share button in the Safari bottom toolbar (square with upward arrow).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#FAF8F5] p-3 rounded-2xl border border-[#E5E0D8]">
                <div className="w-6 h-6 rounded-full bg-[#3D5438] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div>
                  <p className="font-bold text-[#171717] flex items-center gap-1.5">
                    <span>Select "Add to Home Screen"</span>
                    <PlusSquare className="w-3.5 h-3.5 text-[#3D5438]" />
                  </p>
                  <p className="text-[#737373] mt-0.5">
                    Scroll down through the share sheet and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#FAF8F5] p-3 rounded-2xl border border-[#E5E0D8]">
                <div className="w-6 h-6 rounded-full bg-[#3D5438] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  4
                </div>
                <div>
                  <p className="font-bold text-[#171717]">Tap "Add" in Top Right</p>
                  <p className="text-[#737373] mt-0.5">
                    Confirm by tapping <strong>Add</strong>. Reconcile will appear as a standalone app on your home screen!
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-3 rounded-full bg-[#3D5438] hover:bg-[#32462E] text-white font-bold text-xs shadow-xs transition-colors"
              >
                Got It
              </button>
              <button
                onClick={() => {
                  setShowIOSModal(false);
                  onLaunchApp();
                }}
                className="w-full py-2 text-center text-xs font-bold text-[#737373] hover:text-[#171717]"
              >
                Continue in Browser Instead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
