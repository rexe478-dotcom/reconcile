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
      cardBox: 'w-full shadow-none border-0 p-0 bg-transparent',
      card: 'w-full shadow-none border-0 p-0 bg-transparent text-[#1A1A1A]',
      main: 'w-full flex flex-col',
      header: 'hidden',
      headerTitle: 'hidden',
      headerSubtitle: 'hidden',
      developmentBadge: 'hidden',
      socialButtonsBlockButton: 'hidden',
      socialButtonsBlockButtonText: 'hidden',
      dividerRow: 'hidden',
      dividerLine: 'hidden',
      dividerText: 'hidden',
      form: 'w-full space-y-3',
      formField: 'w-full space-y-1.5 text-left',
      formFieldLabel: 'text-xs font-bold text-[#1A1A1A] block text-left leading-tight',
      formFieldInput: 'w-full min-h-[42px] px-3.5 rounded-xl border border-[#E5E0D5] bg-white text-xs text-[#1A1A1A] focus:ring-2 focus:ring-[#3D5438]/20 focus:border-[#3D5438] transition-all',
      formButtonPrimary: 'w-full min-h-[44px] bg-[#3D5438] hover:bg-[#32462E] active:scale-[0.98] text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer mt-1',
      footerAction: 'pt-2.5 text-center text-xs text-[#858477]',
      footerActionText: 'text-xs text-[#858477]',
      footerActionLink: 'text-[#3D5438] hover:underline font-bold text-xs ml-1',
      identityPreview: 'text-xs font-bold text-[#1A1A1A]',
      footer: 'pt-1 text-center text-xs text-[#858477]'
    },
    variables: {
      colorPrimary: '#3D5438',
      colorText: '#1A1A1A',
      colorBackground: '#FFFFFF',
      colorInputBackground: '#FFFFFF',
      colorInputText: '#1A1A1A',
      borderRadius: '0.75rem',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
  };

  return (
    <div className="w-full space-y-3 animate-in fade-in duration-200">
      {/* Streamlined Compact Brand Header */}
      <div className="text-center space-y-1 pb-1">
        <div className="flex justify-center mb-1">
          <ReconcileLogo variant="horizontal" size={28} />
        </div>
        <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight">
          {authMode === 'signin' ? 'Sign in to Reconcile' : 'Create your free account'}
        </h2>
        <p className="text-xs text-[#858477]">
          {authMode === 'signin' 
            ? 'Access your subscriptions and renewal alerts.' 
            : 'Track renewals and eliminate surprise charges.'}
        </p>
      </div>

      {/* Primary Auth: Clerk Email & Password Authentication */}
      <div className="w-full flex justify-center">
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
