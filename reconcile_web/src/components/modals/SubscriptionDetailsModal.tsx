import React from 'react';
import { X, Calendar, Edit3, Trash2, ShieldAlert, Bell, ExternalLink, CheckCircle2, Clock, DollarSign, Tag, Globe } from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { BrandIcon } from '../common/BrandIcon';
import { InsightsCalculator } from '../../services/insightsCalculator';

interface SubscriptionDetailsModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onOpenCancellation: (sub: Subscription) => void;
  onToggleReminder: (id: string) => void;
}

export const SubscriptionDetailsModal: React.FC<SubscriptionDetailsModalProps> = ({
  subscription,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onOpenCancellation,
  onToggleReminder,
}) => {
  if (!isOpen || !subscription) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewalDate = new Date(subscription.nextRenewalDate + 'T00:00:00');
  const diffTime = renewalDate.getTime() - today.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const getCountdownBadge = () => {
    if (diffDays === 0) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">Renews Today</span>;
    }
    if (diffDays === 1) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Renews Tomorrow</span>;
    }
    if (diffDays <= 7) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">In {diffDays} days</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#E2EBD8] text-[#3D5438]">In {diffDays} days</span>;
  };

  const formattedDate = renewalDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E5E0D8] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] spring-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Sheet Drag Handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#FAF8F5]">
          <div className="w-12 h-1.5 bg-[#D5CEBF] rounded-full" />
        </div>

        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FAF8F5] border-b border-[#E5E0D8] flex items-start justify-between">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <BrandIcon providerName={subscription.providerName} size={50} className="shadow-xs shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-[#171717] tracking-tight">{subscription.providerName}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${
                  subscription.status === 'active' 
                    ? 'bg-[#E2EBD8] text-[#3D5438]' 
                    : subscription.status === 'needs_review'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : subscription.status === 'cancelled'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {subscription.status === 'needs_review' ? 'Needs Review' : subscription.status === 'active' ? 'Active' : subscription.status === 'cancelled' ? 'Cancelled' : subscription.status}
                </span>
              </div>
              <p className="text-xs text-[#737373] font-medium mt-0.5">
                {subscription.planName || 'Standard Subscription Plan'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#EAE6DD] text-[#737373] hover:text-[#171717] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Details Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main Price & Schedule Hero */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F5F2EA] border border-[#E5E0D8]">
            <div>
              <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">Billing Cost</span>
              <div className="text-2xl font-black text-[#171717] mt-0.5">
                {InsightsCalculator.formatCurrency(subscription.amount, subscription.currency)}
              </div>
              <span className="text-xs text-[#737373] capitalize">
                Billed every {subscription.intervalCount > 1 ? `${subscription.intervalCount} ` : ''}{subscription.interval}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">Next Renewal</span>
              <div className="mt-1">
                {getCountdownBadge()}
              </div>
              <span className="text-xs text-[#171717] font-semibold block mt-1.5">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#737373] uppercase tracking-wider">Service Information</h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#E5E0D8]">
                <span className="text-[#737373] block mb-0.5">Category</span>
                <span className="font-bold text-[#171717] capitalize">{subscription.category || 'General'}</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E5E0D8]">
                <span className="text-[#737373] block mb-0.5">Discovery Source</span>
                <span className="font-bold text-[#171717] capitalize">
                  {subscription.provenance === 'gmail' ? 'Gmail Detection' : 'Manual Entry'}
                </span>
              </div>

              {subscription.anchorDay && (
                <div className="p-3 rounded-xl bg-white border border-[#E5E0D8]">
                  <span className="text-[#737373] block mb-0.5">Billing Anchor</span>
                  <span className="font-bold text-[#171717]">Day {subscription.anchorDay} of Month</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-white border border-[#E5E0D8]">
                <span className="text-[#737373] block mb-0.5">Reminder Schedule</span>
                <span className="font-bold text-[#171717]">
                  {subscription.remindersEnabled ? 'Active (1d & 3d prior)' : 'Muted'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {subscription.notes && (
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-xs">
              <span className="font-bold text-[#737373] block mb-1">Notes / Plan Details:</span>
              <p className="text-[#171717]">{subscription.notes}</p>
            </div>
          )}

          {/* Reminder Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#E5E0D8]">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${subscription.remindersEnabled ? 'bg-[#E2EBD8] text-[#3D5438]' : 'bg-gray-100 text-gray-400'}`}>
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#171717]">Renewal Reminders</div>
                <div className="text-[11px] text-[#737373]">Notify me before renewal date</div>
              </div>
            </div>
            <button
              onClick={() => onToggleReminder(subscription.id)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                subscription.remindersEnabled ? 'bg-[#3D5438]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  subscription.remindersEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Verified Cancellation Section */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Cancellation & Subscription Management</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Official verified handoff: To cancel this subscription without hidden traps, manage directly on the provider's official account portal.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenCancellation(subscription);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-amber-100/50 border border-amber-300 text-xs font-bold text-amber-900 flex items-center justify-center gap-2 shadow-2xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-800" />
              <span>Open Official Cancellation Page</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#E5E0D8] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${subscription.providerName}?`)) {
                onDelete(subscription.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#737373] hover:bg-[#EAE6DD] transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(subscription);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3D5438] hover:bg-[#32462E] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};