import React, { useState, useEffect } from 'react';
import { SignIn, SignUp } from '@clerk/react';
import { ShieldCheck } from 'lucide-react';
import { ReconcileLogo } from '../components/common/ReconcileLogo';

interface AuthViewProps {
  onAuthenticated: (token: string) => void;
  onClose?: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthView: React.FC<AuthViewProps> = ({ 
  onAuthenticated, 
  onClose,
  initialMode = 'signin'
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('signup')) {
      return 'signup';
    }
    return initialMode;
  });

  // Sync authMode when Clerk triggers internal hash changes (#signup / #signin)
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window === 'undefined') return;
      if (window.location.hash.includes('signup')) {
        setAuthMode('signup');
      } else if (window.location.hash.includes('signin')) {
        setAuthMode('signin');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSwitchMode = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    if (typeof window !== 'undefined') {
      window.location.hash = mode === 'signup' ? '#signup' : '#signin';
    }
  };

  // Clerk appearance customized to Reconcile's Warm Linen & Forest Olive brand tokens
  const clerkAppearance = {
    elements: {
      rootBox: 'w-full flex justify-center',
      card: 'w-full shadow-none border-0 p-0 bg-transparent text-[#171717]',
      header: 'hidden',
      headerTitle: 'hidden',
      headerSubtitle: 'hidden',
      footerAction: 'hidden',
      socialButtonsBlockButton: 'min-h-[44px] border border-[#E5E0D8] bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#171717] rounded-xl shadow-2xs py-2.5 transition-all flex items-center justify-center gap-2 cursor-pointer',
      socialButtonsBlockButtonText: 'text-xs font-bold text-[#171717]',
      formButtonPrimary: 'min-h-[44px] bg-[#3D5438] hover:bg-[#32462E] active:scale-[0.98] text-white font-black text-xs rounded-xl py-3 shadow-xs transition-all cursor-pointer',
      formFieldInput: 'min-h-[42px] rounded-xl border border-[#E5E0D8] bg-white text-xs text-[#171717] px-3.5 focus:ring-2 focus:ring-[#3D5438]/20 focus:border-[#3D5438] transition-all',
      formFieldLabel: 'text-xs font-bold text-[#171717] mb-1 block',
      footerActionLink: 'text-[#3D5438] hover:underline font-bold text-xs',
      dividerLine: 'bg-[#E5E0D8]',
      dividerText: 'text-[11px] text-[#737373] uppercase font-semibold tracking-wide',
      footer: 'pt-1 text-center text-xs text-[#737373]'
    },
    variables: {
      colorPrimary: '#3D5438',
      colorText: '#171717',
      colorBackground: '#FFFFFF',
      colorInputBackground: '#FFFFFF',
      colorInputText: '#171717',
      borderRadius: '0.75rem',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Official Brand Logo Mark */}
      <div className="text-center space-y-1 pb-1">
        <ReconcileLogo variant="mark" size={52} className="mx-auto" />
        <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight mt-1">
          {authMode === 'signin' ? 'Welcome Back' : 'Create Free Account'}
        </h2>
        <p className="text-xs text-[#858477] max-w-xs mx-auto">
          {authMode === 'signin' 
            ? 'Sign in to sync your subscriptions and renewal alerts.' 
            : 'Join Reconcile to track renewals and eliminate surprise charges.'}
        </p>
      </div>

      {/* Top Segmented Mode Switcher */}
      <div className="flex bg-[#F5F3ED] p-1 rounded-2xl border border-[#E5E0D5] text-xs font-bold">
        <button
          type="button"
          onClick={() => handleSwitchMode('signin')}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
            authMode === 'signin'
              ? 'bg-white text-[#1A1A1A] shadow-2xs font-black'
              : 'text-[#858477] hover:text-[#1A1A1A]'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => handleSwitchMode('signup')}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
            authMode === 'signup'
              ? 'bg-white text-[#1A1A1A] shadow-2xs font-black'
              : 'text-[#858477] hover:text-[#1A1A1A]'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Primary Auth: Clerk Google & Email Authentication */}
      <div className="w-full flex justify-center min-h-[300px]">
        {authMode === 'signin' ? (
          <SignIn
            routing="hash"
            appearance={clerkAppearance}
            signUpUrl="#signup"
          />
        ) : (
          <SignUp
            routing="hash"
            appearance={clerkAppearance}
            signInUrl="#signin"
          />
        )}
      </div>

      {/* Security Trust Note */}
      <div className="pt-2 border-t border-[#E5E0D8] flex items-center justify-center gap-1.5 text-[11px] text-[#737373]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#3D5438]" />
        <span>Enterprise-grade security powered by Clerk & Neon PostgreSQL</span>
      </div>
    </div>
  );
};
