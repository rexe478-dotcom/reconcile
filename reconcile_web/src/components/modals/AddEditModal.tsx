import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, AlertCircle } from 'lucide-react';
import { Subscription, RecurrenceInterval, SubscriptionStatus } from '../../types/subscription';

interface AddEditModalProps {
  subscription: Subscription | null; // null if adding new
  isOpen: boolean;
  onClose: () => void;
  onSave: (sub: Subscription) => void;
  onDelete?: (id: string) => void;
}

const QUICK_PROVIDERS = [
  'Netflix',
  'Spotify',
  'Apple iCloud+',
  'Adobe',
  'YouTube Premium',
  'ChatGPT Plus',
  'Amazon Prime',
  'DSTV Stream',
];

export const AddEditModal: React.FC<AddEditModalProps> = ({
  subscription,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [providerName, setProviderName] = useState('');
  const [planName, setPlanName] = useState('');
  const [category, setCategory] = useState('General');
  const [amount, setAmount] = useState<number | ''>(4500);
  const [currency, setCurrency] = useState('NGN');
  const [interval, setInterval] = useState<RecurrenceInterval>('month');
  const [intervalCount, setIntervalCount] = useState<number>(1);
  const [nextRenewalDate, setNextRenewalDate] = useState('');
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [cancellationUrl, setCancellationUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (subscription) {
      setProviderName(subscription.providerName);
      setPlanName(subscription.planName);
      setCategory(subscription.category || 'General');
      setAmount(subscription.amount);
      setCurrency(subscription.currency);
      setInterval(subscription.interval);
      setIntervalCount(subscription.intervalCount);
      setNextRenewalDate(subscription.nextRenewalDate);
      setStatus(subscription.status);
      setRemindersEnabled(subscription.remindersEnabled);
      setCancellationUrl(subscription.cancellationUrl ?? '');
      setNotes(subscription.notes ?? '');
    } else {
      // Default new subscription values
      setProviderName('');
      setPlanName('Standard Subscription');
      setCategory('General');
      setAmount(2500);
      setCurrency('NGN');
      setInterval('month');
      setIntervalCount(1);
      // Set default next renewal date 30 days from now
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setNextRenewalDate(d.toISOString().split('T')[0]);
      setStatus('active');
      setRemindersEnabled(true);
      setCancellationUrl('');
      setNotes('');
    }
  }, [subscription, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerName.trim() || amount === '' || !nextRenewalDate) return;

    const parsedDate = new Date(nextRenewalDate + 'T00:00:00Z');
    const anchor = parsedDate.getUTCDate();

    const newSub: Subscription = {
      id: subscription ? subscription.id : `sub-${Date.now()}`,
      providerName: providerName.trim(),
      planName: planName.trim() || 'Standard Plan',
      amount: Number(amount),
      currency,
      interval,
      intervalCount: Number(intervalCount) || 1,
      nextRenewalDate,
      anchorDay: anchor,
      category: category.trim() || 'General',
      provenance: 'manual',
      status,
      remindersEnabled,
      reminderDaysBefore: [1, 3],
      cancellationUrl: cancellationUrl.trim() || undefined,
      notes: notes.trim(),
      createdAt: subscription ? subscription.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newSub);
    onClose();
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

        <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
          <h3 className="font-extrabold text-lg text-[#171717]">
            {subscription ? 'Edit Subscription' : 'Add New Subscription'}
          </h3>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl bg-white hover:bg-[#EFECE4] text-[#737373] hover:text-[#171717] border border-[#E5E0D8] btn-tactile-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Quick Select Chips */}
          <div>
            <label className="block text-[#737373] mb-1.5 font-medium">Quick Select Provider</label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROVIDERS.map((qp) => (
                <button
                  type="button"
                  key={qp}
                  onClick={() => setProviderName(qp)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold btn-tactile-sm ${
                    providerName === qp
                      ? 'bg-[#3D5438] text-white shadow-2xs'
                      : 'bg-white hover:bg-[#EFECE4] text-[#171717] border border-[#E5E0D8]'
                  }`}
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Provider Name */}
          <div>
            <label className="block text-[#171717] mb-1 font-semibold">Provider / Service Name *</label>
            <input
              type="text"
              required
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="e.g. Netflix, Spotify, Canva"
              className="w-full min-h-[44px] bg-white border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-[#171717] text-sm focus:outline-hidden focus:border-[#3D5438] focus:ring-2 focus:ring-[#3D5438]/20 transition-all"
            />
          </div>

          {/* Category & Plan Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#171717] mb-1 font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[44px] bg-white border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-[#171717] text-sm focus:outline-hidden focus:border-[#3D5438] focus:ring-2 focus:ring-[#3D5438]/20 transition-all"
              >
                <option value="General">General</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Software & Productivity">Software & Productivity</option>
                <option value="Cloud & Utilities">Cloud & Utilities</option>
                <option value="Fitness & Health">Fitness & Health</option>
                <option value="Personal">Personal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[#171717] mb-1 font-semibold">Plan Description</label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g. Premium Family, Pro Tier"
                className="w-full min-h-[44px] bg-white border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-[#171717] text-sm focus:outline-hidden focus:border-[#3D5438] focus:ring-2 focus:ring-[#3D5438]/20 transition-all"
              />
            </div>
          </div>

          {/* Price & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#171717] mb-1 font-semibold">Amount *</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full min-h-[44px] bg-white border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-[#171717] text-sm focus:outline-hidden focus:border-[#3D5438] focus:ring-2 focus:ring-[#3D5438]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[#171717] mb-1 font-semibold">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full min-h-[44px] bg-white border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-[#171717] text-sm focus:outline-hidden focus:border-[#3D5438] focus:ring-2 focus:ring-[#3D5438]/20 transition-all"
              >
                <option value="NGN">NGN (₦ - Naira)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
              </select>
            </div>
          </div>

          {/* Frequency & Next Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#171717] mb-1 font-semibold">Recurrence Interval</label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value as RecurrenceInterval)}
                className="w-full min-h-[44px] bg-white border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-[#171717] text-sm focus:outline-hidden focus:border-[#3D5438] focus:ring-2 focus:ring-[#3D5438]/20 transition-all"
              >
                <option value="month">Monthly</option>
                <option value="quarter">Quarterly (3 Months)</option>
                <option value="year">Annual / Yearly</option>
                <option value="week">Weekly</option>
                <option value="day">Daily</option>
              </select>
            </div>

            <div>
              <label className="block text-[#171717] mb-1 font-semibold">Next Expected Renewal *</label>
              <input
                type="date"
                required
                value={nextRenewalDate}
                onChange={(e) => setNextRenewalDate(e.target.value)}
                className="w-full min-h-[44px] bg-white border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-[#171717] text-sm focus:outline-hidden focus:border-[#3D5438] focus:ring-2 focus:ring-[#3D5438]/20 transition-all"
              />
            </div>
          </div>

          {/* Cancellation Page URL */}
          <div>
            <label className="block text-[#171717] mb-1 font-semibold">Cancellation Page URL (Optional)</label>
            <input
              type="url"
              value={cancellationUrl}
              onChange={(e) => setCancellationUrl(e.target.value)}
              placeholder="https://www.netflix.com/youraccount"
              className="w-full min-h-[44px] bg-white border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-[#171717] text-sm focus:outline-hidden focus:border-[#3D5438] focus:ring-2 focus:ring-[#3D5438]/20 transition-all"
            />
          </div>

          {/* Status & Reminders */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[#171717] mb-1 font-semibold">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                className="w-full min-h-[44px] bg-white border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-[#171717] text-sm focus:outline-hidden focus:border-[#3D5438] focus:ring-2 focus:ring-[#3D5438]/20 transition-all"
              >
                <option value="active">Active</option>
                <option value="needs_review">Needs Review</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center min-h-[44px]">
              <label className="flex items-center gap-2 cursor-pointer text-[#171717] font-medium select-none">
                <input
                  type="checkbox"
                  checked={remindersEnabled}
                  onChange={(e) => setRemindersEnabled(e.target.checked)}
                  className="rounded border-[#D8D2C6] text-[#3D5438] focus:ring-0 w-4 h-4 accent-[#3D5438]"
                />
                <span>Enable Reminders</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[#171717] mb-1 font-semibold">Notes / Description</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Account number, contract terms"
              className="w-full min-h-[44px] bg-white border border-[#E5E0D8] rounded-xl px-3.5 py-2.5 text-[#171717] text-sm focus:outline-hidden focus:border-[#3D5438] focus:ring-2 focus:ring-[#3D5438]/20 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E5E0D8]">
            {subscription && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete ${subscription.providerName} subscription?`)) {
                    onDelete(subscription.id);
                    onClose();
                  }
                }}
                className="min-h-[44px] px-4 py-2.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-bold flex items-center gap-1.5 border border-red-200 btn-tactile"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-5 py-2.5 rounded-full bg-white hover:bg-[#EFECE4] border border-[#D8D2C6] text-[#171717] font-semibold btn-tactile"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#3D5438] hover:bg-[#32462E] text-white font-bold flex items-center gap-1.5 shadow-sm btn-tactile"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
