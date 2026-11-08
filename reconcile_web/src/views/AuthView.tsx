import React, { useState } from 'react';
import { SignIn, SignUp } from '@clerk/react';
import { Eye, EyeOff, Loader2, AlertCircle, Mail, Lock, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { AuthService } from '../services/authService';
import { MascotLogo } from '../components/common/MascotLogo';
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

  const [showLegacyForm, setShowLegacyForm] = useState(false);

  // Sync authMode when Clerk triggers internal hash changes (#signup / #signin)
  React.useEffect(() => {
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

  // Legacy Direct API Auth State
  const [legacyMode, setLegacyMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLegacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = legacyMode === 'login'
        ? await AuthService.login(email, password)
        : await AuthService.register(email, password);

      onAuthenticated(response.access_token);
    } catch (err: any) {
      if (err?.message?.includes('fetch') || err?.message?.includes('network')) {
        setError('Cannot reach backend server. Please try again in a few moments.');
      } else if (err?.status === 409 || err?.message?.toLowerCase().includes('already')) {
        setError('An account with this email already exists. Try signing in.');
      } else if (err?.status === 401) {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError(err?.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isLegacyValid = email.includes('@') && password.length >= 6;

  // Clerk appearance customized to Reconcile's Warm Linen & Forest Olive brand tokens
  const clerkAppearance = {
    elements: {
      rootBox: 'w-full flex justify-center',
      card: 'w-full shadow-none border-0 p-0 bg-transparent text-[#171717]',
      headerTitle: 'text-xl font-black text-[#171717] tracking-tight',
      headerSubtitle: 'text-xs text-[#737373]',
      socialButtonsBlockButton: 'min-h-[44px] border border-[#E5E0D8] bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#171717] rounded-xl shadow-2xs py-2.5 transition-all flex items-center justify-center gap-2',
      socialButtonsBlockButtonText: 'text-xs font-bold text-[#171717]',
      formButtonPrimary: 'min-h-[44px] bg-[#3D5438] hover:bg-[#32462E] active:scale-[0.98] text-white font-black text-xs rounded-xl py-3 shadow-xs transition-all cursor-pointer',
      formFieldInput: 'min-h-[42px] rounded-xl border border-[#E5E0D8] bg-white text-xs text-[#171717] px-3.5 focus:ring-2 focus:ring-[#3D5438]/20 focus:border-[#3D5438] transition-all',
      formFieldLabel: 'text-xs font-bold text-[#171717] mb-1 block',
      footerActionLink: 'text-[#3D5438] hover:underline font-bold text-xs',
      dividerLine: 'bg-[#E5E0D8]',
      dividerText: 'text-[11px] text-[#737373] uppercase font-semibold tracking-wide',
      footer: 'pt-2 text-center text-xs text-[#737373]'
    },
    variables: {
      colorPrimary: '#3D5438',
      colorText: '#171717',
      colorBackground: '#FFFFFF',
      colorInputBackground: '#FFFFFF',
      colorInputText: '#171717',
      borderRadius: '0.75rem',
      fontFamily: 'Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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

      {/* Primary Auth: Clerk Seamless Google & Email Authentication */}
      <div className="w-full flex justify-center min-h-[320px]">
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

      {/* Optional Accordion: Legacy Backend Password Authentication */}
      <div className="pt-2 border-t border-[#E5E0D8]">
        <button
          type="button"
          onClick={() => setShowLegacyForm(!showLegacyForm)}
          className="w-full py-1.5 text-[11px] font-semibold text-[#737373] hover:text-[#171717] flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>Use direct database login (optional)</span>
          {showLegacyForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showLegacyForm && (
          <div className="mt-3 space-y-3 p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8] animate-in fade-in duration-150">
            <div className="flex bg-white p-1 rounded-xl border border-[#E5E0D8] text-xs font-bold">
              <button
                type="button"
                onClick={() => { setLegacyMode('login'); setError(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  legacyMode === 'login'
                    ? 'bg-[#3D5438] text-white shadow-xs'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                Direct Login
              </button>
              <button
                type="button"
                onClick={() => { setLegacyMode('register'); setError(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  legacyMode === 'register'
                    ? 'bg-[#3D5438] text-white shadow-xs'
                    : 'text-[#737373] hover:text-[#171717]'
                }`}
              >
                Direct Register
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLegacySubmit} className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#171717] block">Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E5E0D8] text-xs text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#3D5438]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#171717] block">Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="w-full pl-9 pr-9 py-2 rounded-xl bg-white border border-[#E5E0D8] text-xs text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#3D5438]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isLegacyValid}
                className="w-full py-2.5 rounded-xl bg-[#3D5438] hover:bg-[#32462E] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{legacyMode === 'login' ? 'Sign In to Backend' : 'Register to Backend'}</span>
                )}
              </button>
            </form>
          </div>
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
