import React, { useState } from 'react';
import { X, ShieldAlert, ExternalLink, CheckCircle, HelpCircle } from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { getCancellationGuide } from '../../services/providerRegistry';
import { CancellationApi } from '../../services/cancellationApi';

interface CancellationModalProps {
  subscription: Subscription | null;
  onClose: () => void;
  onConfirmCancelled: (subId: string) => void;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  subscription,
  onClose,
  onConfirmCancelled,
}) => {
  const [hasLaunched, setHasLaunched] = useState(false);

  if (!subscription) return null;

  const guide = getCancellationGuide(subscription.providerName);
  const targetUrl = guide?.verifiedUrl ?? subscription.cancellationUrl ?? 'https://google.com/search?q=how+to+cancel+' + encodeURIComponent(subscription.providerName);

  const handleLaunchExternal = async () => {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    setHasLaunched(true);
    if (subscription.id && !subscription.id.startsWith('sub-')) {
      try {
        await CancellationApi.logAttempt(subscription.id, targetUrl);
      } catch (err) {
        console.warn('Could not log cancellation attempt to API', err);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#FAF8F5] border border-[#E5E0D8] shadow-2xl p-6 lg:p-7 space-y-5 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto text-[#171717] spring-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Sheet Drag Handle */}
        <div className="sm:hidden w-12 h-1.5 bg-[#D5CEBF] rounded-full mx-auto -mt-2 mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
          <div>
            <h3 className="font-extrabold text-lg text-[#171717]">Cancel {subscription.providerName}</h3>
            <p className="text-xs text-[#737373]">Official Cancellation Handoff</p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl bg-white hover:bg-[#EFECE4] text-[#737373] hover:text-[#171717] border border-[#E5E0D8] btn-tactile-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Caution Banner */}
        <div className="p-4 rounded-2xl bg-[#FFF4E5] border border-[#FDE0B6] flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#C2671A] shrink-0 mt-0.5" />
          <div className="text-xs text-[#7B4109] leading-relaxed">
            <strong className="text-[#C2671A] font-semibold block mb-0.5">Direct Provider Handoff</strong>
            Reconcile provides official steps and links directly to verified provider settings. We never claim background auto-cancellation or require your service passwords.
          </div>
        </div>

        {/* Verified Target Link */}
        <div className="p-3.5 rounded-xl bg-white border border-[#E5E0D8] text-xs">
          <div className="text-[#737373] font-medium mb-1">Destination URL</div>
          <div className="font-mono text-[#3D5438] font-bold break-all select-all">{targetUrl}</div>
        </div>

        {/* Instructions */}
        {guide && guide.steps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#737373]">Cancellation Steps</h4>
            <ol className="space-y-2 text-xs text-[#171717]">
              {guide.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#E2EBD8] text-[#3D5438] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Launch Button */}
        <button
          onClick={handleLaunchExternal}
          className="w-full min-h-[48px] py-3.5 px-4 rounded-full bg-[#3D5438] hover:bg-[#32462E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm btn-tactile"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open {subscription.providerName} Cancellation Page</span>
        </button>

        {/* Post-Handoff Return Confirmation Modal */}
        {hasLaunched && (
          <div className="p-4 rounded-2xl bg-white border border-[#3D5438]/40 space-y-3 pt-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-[#171717] font-bold text-xs sm:text-sm">
              <HelpCircle className="w-4 h-4 text-[#3D5438]" />
              <span>Did you complete cancellation on {subscription.providerName}?</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={async () => {
                  if (subscription.id && !subscription.id.startsWith('sub-')) {
                    try {
                      await CancellationApi.reportOutcome(subscription.id, 'cancelled');
                    } catch (err) {
                      console.warn('Could not report cancellation to API', err);
                    }
                  }
                  onConfirmCancelled(subscription.id);
                  onClose();
                }}
                className="min-h-[44px] py-2.5 px-3 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold flex items-center justify-center gap-1.5 btn-tactile"
              >
                <CheckCircle className="w-3.5 h-3.5 text-red-600" />
                <span>Mark Cancelled</span>
              </button>
              <button
                onClick={async () => {
                  if (subscription.id && !subscription.id.startsWith('sub-')) {
                    try {
                      await CancellationApi.reportOutcome(subscription.id, 'kept_active');
                    } catch (err) {
                      console.warn('Could not report kept_active to API', err);
                    }
                  }
                  onClose();
                }}
                className="min-h-[44px] py-2.5 px-3 rounded-full bg-white hover:bg-[#EFECE4] border border-[#D8D2C6] text-[#171717] font-medium btn-tactile"
              >
                Keep Active
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
