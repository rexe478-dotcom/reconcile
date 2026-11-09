import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Bell, 
  Mail, 
  Download, 
  Trash2, 
  LogOut,
  User as UserIcon,
  Sparkles,
  Globe
} from 'lucide-react';
import { UserProfile } from '../services/authService';
import { Subscription } from '../types/subscription';
import { downloadCalendarIcs } from '../services/calendarExportService';
import { MascotLogo } from '../components/common/MascotLogo';

interface SettingsTabProps {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  subscriptions: Subscription[];
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenGmail: () => void;
  onOpenNotifications: () => void;
  onResetDemo: () => void;
  onOpenOnboarding: () => void;
  showToast: (msg: string) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  currentUser,
  isAuthenticated,
  subscriptions,
  onOpenAuth,
  onLogout,
  onOpenGmail,
  onOpenNotifications,
  onResetDemo,
  onOpenOnboarding,
  showToast,
}) => {
  // Selected default currency preference
  const [defaultCurrency, setDefaultCurrency] = useState<string>(() => {
    return localStorage.getItem('reconcile_pref_currency') || 'NGN';
  });

  // Selected reminder lead time preference
  const [alertDays, setAlertDays] = useState<number>(() => {
    return parseInt(localStorage.getItem('reconcile_pref_alert_days') || '3', 10);
  });

  const handleSelectCurrency = (curr: string) => {
    setDefaultCurrency(curr);
    localStorage.setItem('reconcile_pref_currency', curr);
    showToast(`Default currency set to ${curr}.`);
  };

  const handleSelectAlertDays = (days: number) => {
    setAlertDays(days);
    localStorage.setItem('reconcile_pref_alert_days', days.toString());
    showToast(`Alerts set to ${days} day(s) before renewal.`);
  };

  const handleExportCSV = () => {
    if (subscriptions.length === 0) {
      showToast('No subscriptions to export.');
      return;
    }
    const headers = ['Provider', 'Plan', 'Amount', 'Currency', 'Interval', 'Next Renewal Date', 'Status', 'Notes'];
    const rows = subscriptions.map((s) => [
      `"${s.providerName}"`,
      `"${s.planName}"`,
      s.amount,
      s.currency,
      s.interval,
      s.nextRenewalDate,
      s.status,
      `"${s.notes || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reconcile_subscriptions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV file.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pt-2">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-1">
          Customize your alerts, mascot character, currency preferences, and connected accounts.
        </p>
      </div>

      {/* Account Section */}
      <div className="p-6 bg-white rounded-3xl border border-[#E5E0D8] space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-[#3D5438]" />
          <span>User Account</span>
        </h2>

        {isAuthenticated && currentUser ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#3D5438] text-white flex items-center justify-center text-lg font-black shadow-xs">
                {currentUser.email ? currentUser.email[0].toUpperCase() : 'U'}
              </div>
              <div>
                <div className="font-bold text-sm text-[#171717]">{currentUser.email}</div>
                <div className="text-xs text-[#3D5438] font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cloud Account Synced</span>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors self-start sm:self-auto active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-[#F5F2EA] border border-[#E5E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <MascotLogo size={46} interactive={true} />
              <div>
                <div className="text-sm font-bold text-[#171717]">Guest / Offline Mode</div>
                <div className="text-xs text-[#737373] mt-0.5 max-w-md">
                  Your subscriptions are stored safely in this browser. Sign in or register to sync across devices to your secure cloud database.
                </div>
              </div>
            </div>

            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 rounded-xl bg-[#3D5438] hover:bg-[#32462E] active:scale-95 text-white text-xs font-bold shadow-xs transition-all self-start sm:self-auto whitespace-nowrap cursor-pointer"
            >
              Sign In / Create Account
            </button>
          </div>
        )}
      </div>

      {/* Brand Mascot & Interactive Onboarding Tour */}
      <div className="p-6 bg-white rounded-3xl border border-[#E5E0D5] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#89AC50]" />
            <span>Reconcile Brand Identity</span>
          </h2>
          <span className="text-xs font-bold text-[#1A1A1A] bg-[#EBF3DF] px-2.5 py-0.5 rounded-full border border-[#E5E0D5]">
            Official Mascot
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#F5F3ED] border border-[#E5E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <MascotLogo pose="standing" size={58} interactive={true} />
            <div>
              <div className="font-bold text-sm text-[#1A1A1A]">Reconcile Mascot Character</div>
              <p className="text-xs text-[#858477] mt-0.5 max-w-md">
                Watching over your renewal cycles, notice dates, and recurring charges so you stay in 100% control of your budget.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenOnboarding}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-white hover:bg-[#F5F3ED] border border-[#E5E0D5] text-xs font-bold text-[#1A1A1A] shadow-2xs transition-all flex items-center gap-2 whitespace-nowrap self-start sm:self-auto active:scale-95 cursor-pointer"
          >
            <span>Replay Onboarding Tour</span>
          </button>
        </div>
      </div>

      {/* Preferences: Currency & Alerts */}
      <div className="p-6 bg-white rounded-3xl border border-[#E5E0D8] space-y-5 shadow-xs">
        <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#3D5438]" />
          <span>Regional & Reminder Preferences</span>
        </h2>

        {/* Currency Selection */}
        <div>
          <label className="text-xs font-bold text-[#171717] block mb-2">
            Default Display Currency
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { code: 'NGN', symbol: '\u20A6', name: 'Naira (NGN)' },
              { code: 'USD', symbol: '$', name: 'US Dollar (USD)' },
              { code: 'EUR', symbol: '\u20AC', name: 'Euro (EUR)' },
              { code: 'GBP', symbol: '\u00A3', name: 'Pound (GBP)' },
            ].map((c) => (
              <button
                key={c.code}
                onClick={() => handleSelectCurrency(c.code)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  defaultCurrency === c.code
                    ? 'border-[#3D5438] bg-[#FAF8F5] text-[#3D5438] shadow-2xs'
                    : 'border-[#E5E0D8] text-[#737373] hover:text-[#171717] hover:border-[#D1C9BE]'
                }`}
              >
                <span className="text-sm">{c.symbol}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Alert Lead Time */}
        <div>
          <label className="text-xs font-bold text-[#171717] block mb-2">
            Renewal Notification Timing
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { days: 3, label: '3 Days Before (Recommended)' },
              { days: 1, label: '1 Day Before' },
              { days: 0, label: 'On Renewal Day' },
            ].map((a) => (
              <button
                key={a.days}
                onClick={() => handleSelectAlertDays(a.days)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  alertDays === a.days
                    ? 'border-[#3D5438] bg-[#FAF8F5] text-[#3D5438] shadow-2xs'
                    : 'border-[#E5E0D8] text-[#737373] hover:text-[#171717] hover:border-[#D1C9BE]'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Connected Services: Push Alerts & Gmail Discovery */}
      <div className="p-6 bg-white rounded-3xl border border-[#E5E0D8] space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#3D5438]" />
          <span>Connected Services & Inbox Discovery</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div 
            onClick={onOpenNotifications}
            className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] hover:border-[#3D5438] transition-all cursor-pointer space-y-2 card-lift"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#171717]">Browser Push Alerts</span>
              <Bell className="w-4 h-4 text-[#3D5438]" />
            </div>
            <p className="text-[#737373]">
              Receive native device notifications before your subscriptions renew.
            </p>
            <span className="text-[11px] font-bold text-[#3D5438] block pt-1">
              Open Notification Center &rarr;
            </span>
          </div>

          <div 
            onClick={onOpenGmail}
            className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] hover:border-[#3D5438] transition-all cursor-pointer space-y-2 card-lift"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#171717]">Gmail Receipt Discovery</span>
                <span className="text-[10px] font-bold text-[#858477] bg-white px-2 py-0.5 rounded-full border border-[#E5E0D5]">
                  Testing Mode
                </span>
              </div>
              <Mail className="w-4 h-4 text-[#EA4335]" />
            </div>
            <p className="text-[#737373]">
              Optionally connect your Google account to scan invoices with read-only permission. Credentials are kept securely on the backend.
            </p>
            <span className="text-[11px] font-bold text-[#3D5438] block pt-1">
              Open Gmail Scanner &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="p-6 bg-white rounded-3xl border border-[#E5E0D8] space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
          <Download className="w-4 h-4 text-[#3D5438]" />
          <span>Data Portability & Backup</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => {
              downloadCalendarIcs(subscriptions);
              showToast('Exported .ICS Calendar file.');
            }}
            className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] hover:border-[#3D5438] transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer btn-tactile"
          >
            <Download className="w-4 h-4 text-[#3D5438]" />
            <span className="text-xs font-bold text-[#171717]">Export Calendar (.ICS)</span>
            <span className="text-[10px] text-[#737373]">Sync with Google, Apple, or Outlook</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] hover:border-[#3D5438] transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer btn-tactile"
          >
            <Download className="w-4 h-4 text-[#3D5438]" />
            <span className="text-xs font-bold text-[#171717]">Export Data (.CSV)</span>
            <span className="text-[10px] text-[#737373]">Full spreadsheet backup</span>
          </button>

          <button
            onClick={onResetDemo}
            className="p-3.5 rounded-2xl bg-red-50/50 border border-red-200 hover:border-red-400 transition-all flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer btn-tactile"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-red-600">Reset Demo Data</span>
            <span className="text-[10px] text-[#737373]">Restore default starter sample</span>
          </button>
        </div>
      </div>
    </div>
  );
};