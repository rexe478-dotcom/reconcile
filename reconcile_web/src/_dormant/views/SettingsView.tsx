import React from 'react';
import { Download, RotateCcw, ShieldCheck, Mail, Database, BellRing, Smartphone } from 'lucide-react';
import { Subscription } from '../types/subscription';
import { StorageService } from '../services/storageService';

interface SettingsViewProps {
  subscriptions: Subscription[];
  onResetDemo: () => void;
  onOpenGmailModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  subscriptions,
  onResetDemo,
  onOpenGmailModal,
}) => {
  const activeReminders = subscriptions.filter((s) => s.remindersEnabled).length;

  return (
    <div className="space-y-6 pb-20 lg:pb-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Settings & Data Integrity</h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
          Privacy configuration, backup exports, and subscription preferences.
        </p>
      </div>

      {/* Account & Profile Summary */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#141C18] border border-[#23332A] flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#78E08F] flex items-center justify-center font-black text-xl text-[#0B0F0D]">
            U
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">Reconcile User</h3>
            <p className="text-xs text-gray-400">Offline-first & Local Storage Profile</p>
            <span className="inline-block text-[10px] font-semibold text-[#78E08F] bg-[#1E2A23] px-2.5 py-0.5 rounded-full mt-1 border border-[#78E08F]/20">
              Zero Cloud Leakage
            </span>
          </div>
        </div>
      </div>

      {/* Preferences Group */}
      <div className="rounded-3xl bg-[#141C18] border border-[#23332A] divide-y divide-[#1E2A23] text-xs">
        {/* Notifications */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <BellRing className="w-5 h-5 text-[#78E08F] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">Renewal Reminders</div>
              <div className="text-gray-400 mt-0.5">
                Active on {activeReminders} of {subscriptions.length} subscriptions. Alerts trigger 1–3 days before payment.
              </div>
            </div>
          </div>
          <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
            Active
          </span>
        </div>

        {/* Gmail Discovery */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-[#78E08F] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">Gmail Discovery (Consent-based)</div>
              <div className="text-gray-400 mt-0.5">
                Inspect OAuth requirements, read-only scope boundaries, and test sample candidate detection.
              </div>
            </div>
          </div>
          <button
            onClick={onOpenGmailModal}
            className="px-3.5 py-1.5 rounded-xl bg-[#1E2A23] hover:bg-[#28362F] text-[#78E08F] font-bold border border-[#78E08F]/30 transition-colors"
          >
            Review Setup
          </button>
        </div>

        {/* Android Companion APK */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-[#78E08F] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">Android App (APK)</div>
              <div className="text-gray-400 mt-0.5">
                The native Android release APK is compiled and ready at <code className="text-gray-200">Reconcile.apk</code> in your Downloads.
              </div>
            </div>
          </div>
          <span className="font-semibold text-white bg-[#1E2A23] px-3 py-1 rounded-xl border border-[#28362F]">
            v1.0.0 Ready
          </span>
        </div>
      </div>

      {/* Data Management & Export */}
      <div className="rounded-3xl bg-[#141C18] border border-[#23332A] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Database className="w-4 h-4 text-[#78E08F]" />
          <span>Data Storage & Portability</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          All subscription records are saved to your browser's persistent LocalStorage. You can export a full JSON snapshot anytime or reset to initial demo subscriptions.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={() => StorageService.exportJSON(subscriptions)}
            className="px-4 py-2.5 rounded-xl bg-[#1E2A23] hover:bg-[#28362F] border border-[#28362F] hover:border-[#78E08F]/40 text-white font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-[#78E08F]" />
            <span>Export Subscriptions (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Reset subscriptions back to initial demo data (Netflix, Spotify, iCloud, Adobe, YouTube, ChatGPT)?')) {
                onResetDemo();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-semibold text-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-red-400" />
            <span>Reset to Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
