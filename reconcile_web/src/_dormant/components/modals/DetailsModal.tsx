import React from 'react';
import { X, Bell, Shield, Mail, Edit3, ExternalLink, Calendar, AlertCircle } from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { InsightsCalculator } from '../../services/insightsCalculator';

interface DetailsModalProps {
  subscription: Subscription | null;
  onClose: () => void;
  onEdit: (sub: Subscription) => void;
  onOpenCancellation: (sub: Subscription) => void;
  onToggleReminder: (subId: string) => void;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  subscription,
  onClose,
  onEdit,
  onOpenCancellation,
  onToggleReminder,
}) => {
  if (!subscription) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#141C18] border border-[#23332A] shadow-2xl p-6 lg:p-7 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header with Close */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E2A23]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1B2720] border border-[#2E4236] flex items-center justify-center font-black text-xl text-white">
              {subscription.providerName.charAt(0)}
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white">{subscription.providerName}</h3>
              <p className="text-xs text-gray-400">{subscription.planName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1B2720] hover:bg-[#23332A] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Price & Renewal Banner (Screen 4 reference) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#17241E] to-[#121A15] border border-[#23332A] flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 font-medium">Price & Frequency</div>
            <div className="text-xl font-black text-white mt-0.5">
              {InsightsCalculator.formatCurrency(subscription.amount, subscription.currency)}
              <span className="text-xs font-normal text-gray-400 ml-1">/{subscription.interval}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 font-medium">Next Payment</div>
            <div className="text-sm font-bold text-[#78E08F] mt-0.5 flex items-center justify-end gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{subscription.nextRenewalDate}</span>
            </div>
          </div>
        </div>

        {/* Provenance & Status */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#18231D] border border-[#23332A]">
            <div className="text-gray-400 mb-1">Source Provenance</div>
            <div className="font-semibold text-white flex items-center gap-1.5">
              {subscription.provenance === 'gmail' ? (
                <>
                  <Mail className="w-3.5 h-3.5 text-[#78E08F]" />
                  <span>Found in Gmail</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-gray-400" />
                  <span>Manual Entry</span>
                </>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#18231D] border border-[#23332A]">
            <div className="text-gray-400 mb-1">Status</div>
            <div className="font-bold text-white capitalize flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${subscription.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{subscription.status.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Interactive Reminder Toggle */}
        <div className="p-4 rounded-2xl bg-[#18231D] border border-[#23332A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#141C18] flex items-center justify-center text-[#78E08F]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Renewal Notifications</div>
              <div className="text-xs text-gray-400">Alert 1-3 days before charge</div>
            </div>
          </div>

          <button
            onClick={() => onToggleReminder(subscription.id)}
            className={`w-12 h-6 rounded-full p-1 transition-colors relative ${
              subscription.remindersEnabled ? 'bg-[#78E08F]' : 'bg-[#28362F]'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-[#0B0F0D] transition-transform ${
                subscription.remindersEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Notes */}
        {subscription.notes && (
          <div className="p-3.5 rounded-xl bg-[#18231D] border border-[#23332A] text-xs">
            <div className="text-gray-400 mb-1 font-medium">Notes & Terms</div>
            <div className="text-gray-200">{subscription.notes}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Cancellation Handoff Button (Screen 4 card) */}
          <button
            onClick={() => onOpenCancellation(subscription)}
            className="w-full py-3 px-4 rounded-xl bg-[#1A2620] hover:bg-[#203028] border border-[#28362F] hover:border-[#78E08F]/50 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <ExternalLink className="w-4 h-4 text-[#78E08F]" />
            <span>Cancellation Instructions</span>
          </button>

          {/* Edit Details */}
          <button
            onClick={() => onEdit(subscription)}
            className="w-full py-3 px-4 rounded-xl bg-[#78E08F] hover:bg-[#66D17E] text-[#0B0F0D] font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Subscription Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
