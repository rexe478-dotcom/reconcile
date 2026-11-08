import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, Mail, Lock, ShieldCheck } from 'lucide-react';
import { AuthService } from '../services/authService';
import { MascotLogo } from '../components/common/MascotLogo';
import { RealGmailService } from '../services/realGmailService';

interface AuthViewProps {
  onAuthenticated: (token: string) => void;
  onClose?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthenticated, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = mode === 'login'
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

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const token = await RealGmailService.requestGoogleAccessToken();
      // Use the Google OAuth access token
      if (token) {
        onAuthenticated(token);
      }
    } catch (err: any) {
      if (err.message === 'MISSING_CLIENT_ID') {
        setError('Google Client ID is not configured yet. You can sign in with email and password below.');
      } else {
        setError('Google Sign-In was cancelled or failed. You can sign in with email below.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const isValid = email.includes('@') && password.length >= 6;

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Top Header with Vigilant Owl Mascot */}
      <div className="text-center space-y-2">
        <MascotLogo size={52} className="mx-auto shadow-xs" />
        <h2 className="text-2xl font-black text-[#171717] tracking-tight">
          {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
        </h2>
        <p className="text-xs text-[#737373] max-w-xs mx-auto">
          Sync your subscriptions to Neon PostgreSQL cloud database and manage renewals from any device.
        </p>
      </div>

      {/* Google Sign-In Quick Action */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FAF8F5] active:scale-[0.98] border border-[#E5E0D8] text-xs font-bold text-[#171717] shadow-2xs flex items-center justify-center gap-2.5 transition-all"
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#3D5438]" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
        )}
        <span>Continue with Google</span>
      </button>

      {/* Clean Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E5E0D8]" />
        </div>
        <div className="relative flex justify-center text-[11px] font-semibold">
          <span className="bg-white px-3 text-[#737373]">or with email & password</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-[#FAF8F5] p-1 rounded-2xl border border-[#E5E0D8] text-xs font-bold">
        <button
          type="button"
          onClick={() => { setMode('login'); setError(null); }}
          className={`flex-1 py-2 rounded-xl transition-all ${
            mode === 'login'
              ? 'bg-white text-[#3D5438] shadow-2xs font-extrabold'
              : 'text-[#737373] hover:text-[#171717]'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('register'); setError(null); }}
          className={`flex-1 py-2 rounded-xl transition-all ${
            mode === 'register'
              ? 'bg-white text-[#3D5438] shadow-2xs font-extrabold'
              : 'text-[#737373] hover:text-[#171717]'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Error Message Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#171717] block">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E0D8] text-xs text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#3D5438] focus:ring-1 focus:ring-[#3D5438] transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#171717] block">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
              required
              minLength={6}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#E5E0D8] text-xs text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#3D5438] focus:ring-1 focus:ring-[#3D5438] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#171717]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isValid}
          className="w-full py-3 rounded-xl bg-[#3D5438] hover:bg-[#32462E] disabled:bg-gray-200 disabled:text-gray-400 text-white font-black text-xs shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
            </>
          ) : (
            <span>{mode === 'login' ? 'Sign In to Reconcile' : 'Create Free Account'}</span>
          )}
        </button>
      </form>

      {/* Security Note */}
      <div className="pt-2 border-t border-[#E5E0D8] flex items-center justify-center gap-1.5 text-[11px] text-[#737373]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#3D5438]" />
        <span>Your data is encrypted & stored securely on Neon PostgreSQL.</span>
      </div>
    </div>
  );
};
