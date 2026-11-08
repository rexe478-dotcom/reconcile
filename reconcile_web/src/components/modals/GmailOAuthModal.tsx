import React, { useState } from 'react';
import { X, ShieldCheck, Mail, AlertCircle, CheckCircle2, Lock, Key, ExternalLink } from 'lucide-react';
import { Subscription } from '../../types/subscription';

interface GmailOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCandidate: (sub: Subscription) => void;
}

export const GmailOAuthModal: React.FC<GmailOAuthModalProps> = ({
  isOpen,
  onClose,
  onImportCandidate,
}) => {
  const [imported, setImported] = useState(false);
  const [clientId, setClientId] = useState(() => {
    return localStorage.getItem('reconcile_google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  });
  const [savedClientId, setSavedClientId] = useState(false);

  if (!isOpen) return null;

  const sampleCandidate: Subscription = {
    id: `sub-canva-${Date.now()}`,
    providerName: 'Canva Pro',
    planName: 'Annual Design Suite',
    amount: 11000,
    currency: 'NGN',
    interval: 'year',
    intervalCount: 1,
    nextRenewalDate: '2026-12-15',
    anchorDay: 15,
    category: 'Productivity',
    provenance: 'gmail',
    status: 'needs_review',
    remindersEnabled: true,
    reminderDaysBefore: [7, 3, 1],
    cancellationUrl: 'https://www.canva.com/account-settings/billing-and-teams',
    notes: 'Detected from invoice receipt. Review renewal terms before approval.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleSimulateCandidate = () => {
    onImportCandidate(sampleCandidate);
    setImported(true);
    setTimeout(() => {
      onClose();
      setImported(false);
    }, 1200);
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientId.trim()) {
      localStorage.setItem('reconcile_google_client_id', clientId.trim());
      setSavedClientId(true);
      setTimeout(() => setSavedClientId(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF8F5] border border-[#E5E0D8] shadow-2xl p-6 lg:p-7 space-y-4 max-h-[90vh] overflow-y-auto text-[#171717]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E2EBD8] flex items-center justify-center text-[#3D5438]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#171717]">Gmail Subscription Discovery</h3>
              <p className="text-xs text-[#737373]">Consent & Privacy Overview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-[#EFECE4] text-[#737373] hover:text-[#171717] border border-[#E5E0D8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Honest Architecture & Security Commitment */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E0D8] space-y-2.5 text-xs text-[#171717]">
          <div className="flex items-center gap-2 text-[#171717] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#3D5438]" />
            <span>Honest & Privacy-First Architecture</span>
          </div>
          <p className="leading-relaxed text-[#737373]">
            Reconcile uses Google OAuth 2.0 with minimal read-only metadata scopes. We never request your Google account password and never store full email bodies.
          </p>
          <ul className="space-y-1.5 pt-1 text-[#171717]">
            <li className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#3D5438]" />
              <span>Zero raw email retention — only parsed renewal receipt dates and amounts.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3D5438]" />
              <span>Candidate Isolation: Subscriptions are never auto-charged or added without your explicit review.</span>
            </li>
          </ul>
        </div>

        {/* Google Cloud OAuth Configuration */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E0D8] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#3D5438]" />
              <span>Google OAuth 2.0 Client ID</span>
            </span>
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-[#3D5438] hover:underline font-semibold flex items-center gap-0.5"
            >
              <span>Google Cloud Console</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <form onSubmit={handleSaveClientId} className="space-y-2">
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] focus:bg-white focus:border-[#3D5438] outline-none font-mono"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#737373]">
                {savedClientId ? '✓ Client ID saved to browser' : 'Optional. Used for direct PKCE login.'}
              </span>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#EFECE4] border border-[#E5E0D8] text-[11px] font-bold text-[#171717]"
              >
                Save
              </button>
            </div>
          </form>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          {imported ? (
            <div className="w-full py-3 rounded-full bg-[#E2EBD8] text-[#3D5438] font-bold text-center text-xs flex items-center justify-center gap-2 border border-[#3D5438]/30">
              <CheckCircle2 className="w-4 h-4 text-[#3D5438]" />
              <span>Imported Canva Pro Candidate for Review!</span>
            </div>
          ) : (
            <button
              onClick={handleSimulateCandidate}
              className="w-full py-3.5 px-4 rounded-full bg-[#3D5438] hover:bg-[#32462E] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <Mail className="w-4 h-4" />
              <span>Test Receipt Discovery (Sample Canva Pro)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
