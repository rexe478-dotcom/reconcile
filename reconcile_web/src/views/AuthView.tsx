import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { AuthService } from '../services/authService';

interface AuthViewProps {
  onAuthenticated: (token: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wakingUp, setWakingUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Show waking indicator after 3 seconds (Render cold start)
    const wakingTimer = setTimeout(() => setWakingUp(true), 3000);

    try {
      const response = mode === 'login'
        ? await AuthService.login(email, password)
        : await AuthService.register(email, password);

      onAuthenticated(response.access_token);
    } catch (err: any) {
      if (err?.message?.includes('fetch') || err?.message?.includes('network')) {
        setError('Cannot reach the server. Please try again in a moment.');
      } else if (err?.status === 409 || err?.message?.toLowerCase().includes('already')) {
        setError('An account with this email already exists. Try logging in.');
      } else if (err?.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError(err?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      clearTimeout(wakingTimer);
      setWakingUp(false);
      setLoading(false);
    }
  };

  const isValid = email.includes('@') && password.length >= 6;

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-4 font-sans">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#3D5438] flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-md">
          R
        </div>
        <h1 className="font-extrabold tracking-[0.25em] text-lg text-[#171717]">
          RECONCILE
        </h1>
        <p className="text-sm text-[#737373] mt-1">Know What Renews Next</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl border border-[#E5E0D8] shadow-sm p-6 space-y-5">
          {/* Mode Toggle */}
          <div className="flex bg-[#F0ECE4] p-1 rounded-full text-xs font-bold">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 rounded-full transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#3D5438] shadow-xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 rounded-full transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#3D5438] shadow-xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#171717] block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] focus:bg-white focus:border-[#3D5438] focus:ring-1 focus:ring-[#3D5438]/20 outline-none transition-all placeholder:text-[#A3A3A3]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#171717] block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] focus:bg-white focus:border-[#3D5438] focus:ring-1 focus:ring-[#3D5438]/20 outline-none transition-all placeholder:text-[#A3A3A3]"
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

            {/* Error Display */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#B42318] text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || loading}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                isValid && !loading
                  ? 'bg-[#3D5438] hover:bg-[#32462E] text-white shadow-sm active:scale-[0.98]'
                  : 'bg-[#E5E0D8] text-[#A3A3A3] cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{wakingUp ? 'Waking up server...' : 'Please wait...'}</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>
        </div>

        {/* Waking Up Notice */}
        {wakingUp && (
          <p className="text-center text-[11px] text-[#737373] mt-3 px-4">
            The server is waking up from sleep (free tier). This usually takes 15–30 seconds.
          </p>
        )}

        {/* Privacy Notice */}
        <p className="text-center text-[11px] text-[#737373] mt-4 px-4">
          Your data is encrypted and stored securely. No bank logins or invasive permissions required.
        </p>
      </div>
    </div>
  );
};
