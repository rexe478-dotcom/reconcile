import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  Loader2, 
  RefreshCw, 
  LogOut,
  Info,
  Sparkles
} from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { 
  GmailIntegrationService, 
  GmailStatus, 
  GmailCandidate 
} from '../../services/gmailIntegrationService';
import { BrandIcon } from '../common/BrandIcon';

interface GmailOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCandidate: (sub: Subscription) => void;
  showToast?: (msg: string) => void;
}

export const GmailOAuthModal: React.FC<GmailOAuthModalProps> = ({
  isOpen,
  onClose,
  onImportCandidate,
  showToast,
}) => {
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<GmailCandidate[]>([]);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  // Fetch status whenever modal is opened
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setIsLoadingStatus(true);
    setError(null);

    GmailIntegrationService.getStatus()
      .then((res) => {
        if (isMounted) setStatus(res);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to check Gmail connection status.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingStatus(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Initiate backend-driven Google OAuth 2.0 Authorization Code flow
  const handleConnect = async () => {
    setError(null);
    setIsAuthorizing(true);
    try {
      const response = await GmailIntegrationService.getAuthUrl();
      if (!response.auth_url) {
        throw new Error('No authorization URL returned from backend server.');
      }
      // Redirect user to Google OAuth consent screen
      window.location.href = response.auth_url;
    } catch (err: any) {
      console.error('Failed to initiate Gmail OAuth:', err);
      setError(err.message || 'Could not connect to Google OAuth service. Please check your network or try again.');
      setIsAuthorizing(false);
    }
  };

  // Scan inbox receipts using backend-held credentials
  const handleScanReceipts = async () => {
    setError(null);
    setIsScanning(true);
    try {
      const res = await GmailIntegrationService.syncReceipts();
      setCandidates(res.candidates);
      if (res.candidates.length === 0) {
        setError('No subscription receipts or renewal notices found in recent messages.');
      } else if (showToast) {
        showToast(`Found ${res.candidates.length} subscription receipt(s) in your inbox!`);
      }
      // Refresh status to update last_sync_at
      const updatedStatus = await GmailIntegrationService.getStatus();
      setStatus(updatedStatus);
    } catch (err: any) {
      console.error('Gmail sync failed:', err);
      setError(err.message || 'Failed to scan inbox receipts. Please reconnect your account.');
    } finally {
      setIsScanning(false);
    }
  };

  // Disconnect Gmail integration and revoke Google OAuth tokens
  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect your Gmail account? Reconcile will revoke access and delete stored credentials. Your manual subscriptions remain intact.')) {
      return;
    }
    setError(null);
    setIsDisconnecting(true);
    try {
      await GmailIntegrationService.disconnect();
      setStatus({
        connected: false,
        email: null,
        last_sync_at: null,
        testing_mode: true,
        notice: 'Gmail disconnected successfully.',
      });
      setCandidates([]);
      if (showToast) {
        showToast('Gmail account disconnected and Google token revoked.');
      }
    } catch (err: any) {
      console.error('Failed to disconnect Gmail:', err);
      setError(err.message || 'Failed to disconnect Gmail.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleImport = (cand: GmailCandidate) => {
    const sub = GmailIntegrationService.candidateToSubscription(cand);
    onImportCandidate(sub);
    setImportedIds((prev) => new Set(prev).add(cand.id));
    if (showToast) {
      showToast(`Imported "${cand.provider_name}" to your subscriptions!`);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E5E0D5] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] spring-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Sheet Drag Handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#FAF8F5]">
          <div className="w-12 h-1.5 bg-[#D5CEBF] rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="p-6 bg-[#FAF8F5] border-b border-[#E5E0D5] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#E5E0D5] flex items-center justify-center text-[#EA4335] shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight">Gmail Receipt Discovery</h3>
                <span className="text-[10px] font-bold text-[#858477] bg-white px-2 py-0.5 rounded-full border border-[#E5E0D5]">
                  Optional
                </span>
              </div>
              <p className="text-xs text-[#858477] mt-0.5">
                Automatically detect subscription invoices and recurring renewals with zero manual typing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E5E0D5] flex items-center justify-center text-[#858477] hover:text-[#1A1A1A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#1A1A1A]">
          {/* Developer Testing Mode Notice */}
          <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-[#F0E6B8] flex items-start gap-3">
            <Info className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-xs text-[#7A5B00]">Google OAuth Developer Testing Status</div>
              <p className="text-[11px] text-[#8C6D08] leading-relaxed">
                Per Google OAuth 2.0 policy for sensitive scopes (<code className="bg-white/80 px-1 py-0.5 rounded text-[10px]">gmail.readonly</code>), this integration is currently in <strong>Developer Testing Mode</strong> pending official verification. Authorized test accounts configured in Google Cloud Console can connect and scan receipts.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div className="text-xs leading-relaxed">{error}</div>
            </div>
          )}

          {isLoadingStatus ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#858477]">
              <Loader2 className="w-6 h-6 animate-spin text-[#3D5438]" />
              <span className="text-xs font-semibold">Checking connection status...</span>
            </div>
          ) : status?.connected ? (
            /* Connected State */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#EBF3DF] border border-[#D5E6BE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#D5E6BE] flex items-center justify-center text-[#3D5438]">
                    <CheckCircle2 className="w-5 h-5 text-[#3D5438]" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#263723]">Connected Google Account</div>
                    <div className="text-sm font-black text-[#1A1A1A]">{status.email || 'Google Account Connected'}</div>
                    {status.last_sync_at && (
                      <div className="text-[10px] text-[#4A6444] mt-0.5">
                        Last scanned: {new Date(status.last_sync_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-white hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  {isDisconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                  <span>Disconnect</span>
                </button>
              </div>

              {/* Scan Trigger */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h4 className="font-bold text-sm text-[#1A1A1A]">Inbox Receipt Scanner</h4>
                  <p className="text-[11px] text-[#858477]">Search your recent messages for subscriptions and bills.</p>
                </div>
                <button
                  type="button"
                  onClick={handleScanReceipts}
                  disabled={isScanning}
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-[#3D5438] hover:bg-[#32462E] active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Scanning Messages...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Scan Receipts Now</span>
                    </>
                  )}
                </button>
              </div>

              {/* Discovered Candidates */}
              {candidates.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="font-bold text-xs text-[#1A1A1A] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#89AC50]" />
                    <span>Discovered Subscriptions ({candidates.length})</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {candidates.map((cand) => {
                      const isImported = importedIds.has(cand.id);
                      return (
                        <div
                          key={cand.id}
                          className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D5] flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <BrandIcon providerName={cand.provider_name} size={36} />
                            <div>
                              <div className="font-bold text-xs text-[#1A1A1A]">{cand.provider_name}</div>
                              <div className="text-[11px] text-[#858477]">
                                {cand.currency}{cand.amount.toLocaleString()} / {cand.interval_unit}
                              </div>
                              {cand.snippet && (
                                <div className="text-[10px] text-[#858477] truncate max-w-xs mt-0.5 italic">
                                  "{cand.snippet}"
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleImport(cand)}
                            disabled={isImported}
                            className={`min-h-[36px] px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              isImported
                                ? 'bg-[#EBF3DF] text-[#3D5438] border border-[#D5E6BE]'
                                : 'bg-white hover:bg-[#FAF8F5] text-[#1A1A1A] border border-[#E5E0D5] active:scale-95 shadow-2xs'
                            }`}
                          >
                            {isImported ? 'Imported ✓' : 'Import'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Disconnected / Opt-In State */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D5] space-y-3">
                <div className="font-bold text-xs text-[#1A1A1A]">How Reconcile connects to your Gmail:</div>
                <ul className="space-y-2 text-[11px] text-[#858477]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#3D5438] font-bold">1.</span>
                    <span><strong>Read-Only Permission:</strong> We request <code className="bg-white px-1 py-0.5 rounded border border-[#E5E0D5]">gmail.readonly</code> solely to find subscription invoices from services like Netflix, Spotify, Apple, etc.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#3D5438] font-bold">2.</span>
                    <span><strong>Server-Side Security:</strong> Refresh tokens and client secrets are encrypted with AES Fernet on the backend and are <em>never</em> sent to your browser.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#3D5438] font-bold">3.</span>
                    <span><strong>100% User Control:</strong> You can disconnect your Google account and revoke access at any time. Manual subscription tracking is always available.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-[#858477]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3D5438]" />
                  <span>Secured via Google OAuth 2.0 Authorization Code Flow</span>
                </div>

                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isAuthorizing}
                  className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-[#3D5438] hover:bg-[#32462E] active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAuthorizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Redirecting to Google...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Authorize with Google</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#E5E0D5] flex items-center justify-between text-[11px] text-[#858477]">
          <span>Reconcile Privacy & Security Guarantee</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[#1A1A1A] hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
