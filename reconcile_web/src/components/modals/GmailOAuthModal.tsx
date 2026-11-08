import React, { useState } from 'react';
import { X, ShieldCheck, Mail, AlertCircle, CheckCircle2, Lock, Key, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { RealGmailService } from '../../services/realGmailService';
import { BrandIcon } from '../common/BrandIcon';

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
  const [clientId, setClientId] = useState(() => RealGmailService.getClientId());
  const [savedClientId, setSavedClientId] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discovered, setDiscovered] = useState<Subscription[]>([]);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    RealGmailService.setClientId(clientId);
    setSavedClientId(true);
    setTimeout(() => setSavedClientId(false), 2000);
  };

  const handleConnectAndScan = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (!clientId.trim()) {
        setError('Please enter your Google Cloud OAuth Client ID below first to connect your Google account.');
        setIsLoading(false);
        return;
      }

      // 1. Request real Google OAuth consent & access token with Gmail read scope
      const token = await RealGmailService.requestGoogleAccessToken(
        'https://www.googleapis.com/auth/gmail.readonly email'
      );

      // 2. Fetch real subscription receipts from Gmail API
      const realSubs = await RealGmailService.fetchRealSubscriptionReceipts(token);
      setDiscovered(realSubs);

      if (realSubs.length === 0) {
        setError('No subscription invoices or receipts found in your recent Gmail messages.');
      }
    } catch (err: any) {
      console.error('Google Sign-In / Gmail error:', err);
      if (err.message === 'MISSING_CLIENT_ID') {
        setError('Please configure your Google Cloud OAuth Client ID below to connect.');
      } else if (err.message === 'GOOGLE_GSI_NOT_LOADED') {
        setError('Google Identity Services library is still loading. Please try again in a moment.');
      } else {
        setError(err.message || 'Google Sign-In failed. Please check your OAuth Client ID.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = (sub: Subscription) => {
    onImportCandidate(sub);
    setImportedIds((prev) => new Set(prev).add(sub.id));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E5E0D8] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] spring-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Sheet Drag Handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#FAF8F5]">
          <div className="w-12 h-1.5 bg-[#D5CEBF] rounded-full" />
        </div>
        {/* Header */}
        <div className="p-6 bg-[#FAF8F5] border-b border-[#E5E0D8] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#E5E0D8] flex items-center justify-center text-[#EA4335] shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#171717] tracking-tight">Real Gmail Subscription Sync</h3>
              <p className="text-xs text-[#737373]">
                Connect your Google Account to scan for real receipts from Netflix, Spotify, Apple, Google, etc.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full hover:bg-[#EAE6DD] text-[#737373] hover:text-[#171717] transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#3D5438]/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Privacy Guarantee */}
          <div className="p-3.5 rounded-2xl bg-[#E2EBD8]/50 border border-[#E2EBD8] flex items-start gap-2.5 text-xs">
            <ShieldCheck className="w-4 h-4 text-[#3D5438] shrink-0 mt-0.5" />
            <div className="text-[#3D5438] leading-relaxed">
              <span className="font-bold">Zero Password Sharing:</span> Authenticates directly through official Google OAuth 2.0 with read-only access to invoice and receipt emails.
            </div>
          </div>

          {/* Connect Action Button */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] text-center space-y-3">
            <button
              onClick={handleConnectAndScan}
              disabled={isLoading}
              className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-[#3D5438] hover:bg-[#32462E] active:scale-95 disabled:bg-gray-300 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#3D5438]/30 focus-visible:ring-offset-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Google & Scanning Receipts...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Google & Scan Real Inbox</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Discovered Real Subscriptions List */}
          {discovered.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#171717] uppercase tracking-wider">
                Discovered Subscriptions ({discovered.length})
              </h4>
              <div className="space-y-2">
                {discovered.map((sub) => {
                  const isImported = importedIds.has(sub.id);
                  return (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-2xl bg-white border border-[#E5E0D8] flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <BrandIcon providerName={sub.providerName} size={36} />
                        <div>
                          <div className="text-sm font-bold text-[#171717]">{sub.providerName}</div>
                          <div className="text-xs text-[#737373]">
                            {'\u20A6'}{sub.amount.toLocaleString()} &middot; Next renewal: {sub.nextRenewalDate}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleImport(sub)}
                        disabled={isImported}
                        className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                          isImported
                            ? 'bg-gray-100 text-gray-500 cursor-default'
                            : 'bg-[#3D5438] hover:bg-[#32462E] active:scale-95 text-white shadow-2xs cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#3D5438]/30'
                        }`}
                      >
                        {isImported ? 'Imported \u2713' : 'Add to Tracker +'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Security & Verification Trust Badge */}
          <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between text-xs text-[#737373]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3D5438]" />
              <span className="font-bold text-[#171717]">Google OAuth 2.0 Connected</span>
            </div>
            <span className="text-[11px] text-[#737373] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#E5E0D8]">
              Read-Only Receipt Scope
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#E5E0D8] flex items-center justify-end">
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold text-[#737373] hover:bg-[#EAE6DD] active:scale-95 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
