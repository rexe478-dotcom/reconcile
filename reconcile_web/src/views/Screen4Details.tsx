import React from 'react';
import { ArrowLeft, MoreVertical, Calendar, Pencil, AlertCircle, ChevronRight } from 'lucide-react';
import { Subscription } from '../types/subscription';
import { BrandIcon } from '../components/common/BrandIcon';

interface Screen4DetailsProps {
  subscription: Subscription;
  onBack: () => void;
  onEdit: (sub: Subscription) => void;
  onOpenCancellation: (sub: Subscription) => void;
  onToggleReminder: (id: string) => void;
}

export const Screen4Details: React.FC<Screen4DetailsProps> = ({
  subscription,
  onBack,
  onEdit,
  onOpenCancellation,
  onToggleReminder,
}) => {
  const isMonthly = subscription.interval === 'month';
  const frequencyLabel = isMonthly ? 'per month' : 'per year';

  return (
    <div className="flex-1 flex flex-col justify-between bg-[#FAF8F5] text-[#171717]">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-6 space-y-4">
        {/* Top App Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-1 rounded-full hover:bg-[#EFECE4] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#171717]" />
          </button>
          <button
            onClick={() => onEdit(subscription)}
            className="p-1 rounded-full hover:bg-[#EFECE4] transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-[#171717]" />
          </button>
        </div>

        {/* Brand Header */}
        <div className="flex items-center gap-3.5 pt-1">
          <BrandIcon providerName={subscription.providerName} size={48} />
          <div>
            <h2 className="text-xl font-black text-[#171717] tracking-tight">
              {subscription.providerName}
            </h2>
            <div className="text-xs text-[#737373] font-medium">
              {subscription.notes || subscription.planName || 'Music. Podcasts. More.'}
            </div>
          </div>
        </div>

        {/* Split Price & Next Payment Card */}
        <div className="bg-[#F0ECE4] rounded-2xl p-4 flex items-center justify-between border border-[#E5E0D8]/60 shadow-xs">
          {/* Left Column: Price */}
          <div className="flex-1 pr-3 border-r border-[#D8D2C6]/60">
            <div className="text-xl font-black text-[#171717] tracking-tight">
              ₦{subscription.amount.toLocaleString()}
            </div>
            <div className="text-xs text-[#737373] font-medium mt-0.5">
              {frequencyLabel}
            </div>
          </div>

          {/* Right Column: Next Payment */}
          <div className="flex-1 pl-4 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-white border border-[#D8D2C6]/70 text-[#3D5438] shrink-0 mt-0.5">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-[#737373] font-medium">
                Next payment
              </div>
              <div className="text-xs font-bold text-[#171717] mt-0.5">
                {subscription.nextRenewalDate}
              </div>
            </div>
          </div>
        </div>

        {/* Provenance Row */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#E5E0D8]/70 flex items-center gap-2.5 shadow-xs">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.5l8.073-6.007c1.618-1.214 3.927-.059 3.927 1.964z" />
          </svg>
          <span className="text-xs font-bold text-[#171717]">
            Found in Gmail
          </span>
        </div>

        {/* Last Payment Tile */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#E5E0D8]/70 shadow-xs space-y-0.5">
          <div className="text-[11px] text-[#737373] font-medium">
            Last payment
          </div>
          <div className="text-xs font-bold text-[#171717]">
            Mar 30, 2025 · ₦{subscription.amount.toLocaleString()}
          </div>
        </div>

        {/* Reminder Row with Interactive Toggle */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#E5E0D8]/70 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-bold text-[#171717]">Reminder</div>
            <div className="text-[11px] text-[#737373] font-medium mt-0.5">
              Get notified before renewal
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={() => onToggleReminder(subscription.id)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              subscription.remindersEnabled ? 'bg-[#3D5438]' : 'bg-[#D8D2C6]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                subscription.remindersEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* Edit Details Outlined Button */}
          <button
            onClick={() => onEdit(subscription)}
            className="w-full py-3 px-4 rounded-full bg-white hover:bg-[#F5F2EA] border border-[#D8D2C6] text-[#171717] font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xs"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit details</span>
          </button>

          {/* Cancellation Instructions Card */}
          <div
            onClick={() => onOpenCancellation(subscription)}
            className="cursor-pointer bg-[#FDF2F0] hover:bg-[#FBE8E5] border border-[#FECDCA] rounded-2xl p-3.5 flex items-center justify-between text-[#B42318] transition-colors shadow-xs active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#B42318]" />
              <span className="text-xs font-bold">Cancellation instructions</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#B42318]" />
          </div>
        </div>
      </div>
    </div>
  );
};
