import React, { useState } from 'react';
import { 
  Cloud, 
  CloudOff, 
  CheckCircle2, 
  RefreshCw, 
  Bell, 
  Mail, 
  Download, 
  Trash2, 
  ShieldCheck, 
  ExternalLink,
  Activity,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { UserProfile, AuthService } from '../services/authService';
import { Subscription } from '../types/subscription';
import { StorageService } from '../services/storageService';
import { downloadCalendarIcs } from '../services/calendarExportService';
import { NotificationService } from '../services/notificationService';
import { getApiBaseUrl, setCustomApiUrl } from '../services/apiClient';

interface SettingsTabProps {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  subscriptions: Subscription[];
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenGmail: () => void;
  onOpenNotifications: () => void;
  onResetDemo: () => void;
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
  showToast,
}) => {
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [backendUrl, setBackendUrl] = useState(getApiBaseUrl());

  const handlePingBackend = async () => {
    setIsPinging(true);
    const start = Date.now();
    try {
      const res = await fetch(`${backendUrl}/health`);
      const data = await res.json();
      const latency = Date.now() - start;
      if (res.ok && data.status === 'healthy') {
        setPingStatus(`Healthy (${latency}ms) • Database: ${data.database || 'connected'}`);
      } else {
        setPingStatus(`Degraded (${latency}ms)`);
      }
    } catch (err) {
      setPingStatus('Offline / Unreachable');
    } finally {
      setIsPinging(false);
    }
  };

  const handleSaveApiUrl = () => {
    setCustomApiUrl(backendUrl);
    showToast(`Updated Backend Server URL.`);
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
          Settings & Cloud Synchronization
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] mt-0.5">
          Manage your cloud database connection, authentication, push alerts, and data exports.
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
                <div className="text-xs text-[#737373]">Cloud account connected • Multi-tenant storage</div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#F5F2EA] border border-[#E5E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-[#171717]">Guest / Offline Mode</div>
              <div className="text-xs text-[#737373] mt-0.5">
                Your data is stored safely in your browser. Sign in or register to sync across devices to Neon PostgreSQL.
              </div>
            </div>

            <button
              onClick={onOpenAuth}
              className="px-4 py-2.5 rounded-xl bg-[#3D5438] hover:bg-[#32462E] text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto whitespace-nowrap"
            >
              Sign In / Create Account
            </button>
          </div>
        )}
      </div>

      {/* Cloud Backend & Neon Database Connection */}
      <div className="p-6 bg-white rounded-3xl border border-[#E5E0D8] space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
          <Cloud className="w-4 h-4 text-[#3D5438]" />
          <span>Cloud PostgreSQL & API Server</span>
        </h2>

        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-[#171717]">Backend API Host</div>
              <div className="text-[11px] text-[#737373]">Live FastAPI service deployed on Render</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePingBackend}
                disabled={isPinging}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-[#E5E0D8] text-[11px] font-bold text-[#171717] hover:bg-[#F0ECE4] transition-colors"
              >
                <Activity className={`w-3 h-3 text-[#3D5438] ${isPinging ? 'animate-spin' : ''}`} />
                <span>{isPinging ? 'Pinging...' : 'Test Connection'}</span>
              </button>
              {pingStatus && (
                <span className="text-[11px] font-bold text-[#3D5438] bg-[#E2EBD8] px-2 py-0.5 rounded-md">
                  {pingStatus}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#E5E0D8] text-xs font-mono text-[#171717] focus:outline-hidden focus:border-[#3D5438]"
            />
            <button
              onClick={handleSaveApiUrl}
              className="px-3.5 py-2 rounded-xl bg-[#3D5438] text-white text-xs font-bold hover:bg-[#32462E] transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#E2EBD8]/40 border border-[#E2EBD8] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#3D5438]" />
            <span className="font-semibold text-[#171717]">Database: Neon Serverless PostgreSQL (Oregon AWS)</span>
          </div>
          <span className="text-[11px] font-bold text-[#3D5438]">Free Tier Connected</span>
        </div>
      </div>

      {/* Notifications & Discovery */}
      <div className="p-6 bg-white rounded-3xl border border-[#E5E0D8] space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-[#171717] flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#3D5438]" />
          <span>Notifications & Email Discovery</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div 
            onClick={onOpenNotifications}
            className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] hover:border-[#3D5438] transition-colors cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#171717]">Browser Push Alerts</span>
              <Bell className="w-4 h-4 text-[#3D5438]" />
            </div>
            <p className="text-[#737373]">
              Receive native notifications before subscriptions renew. Manage permission & lead time.
            </p>
            <span className="text-[11px] font-bold text-[#3D5438] block pt-1">
              Open Notification Center ?
            </span>
          </div>

          <div 
            onClick={onOpenGmail}
            className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] hover:border-[#3D5438] transition-colors cursor-pointer space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#171717]">Gmail Subscription Discovery</span>
              <Mail className="w-4 h-4 text-[#EA4335]" />
            </div>
            <p className="text-[#737373]">
              Configure official Google Cloud OAuth Client ID to discover subscriptions in receipt emails.
            </p>
            <span className="text-[11px] font-bold text-[#3D5438] block pt-1">
              Review Candidate Discovered Subscriptions ?
            </span>
          </div>
        </div>
      </div>

      {/* Data Export & Reset */}
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
            className="p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F0ECE4] border border-[#E5E0D8] text-left transition-colors"
          >
            <span className="text-xs font-bold text-[#171717] block">Export Calendar (.ICS)</span>
            <span className="text-[11px] text-[#737373] mt-0.5 block">Sync to Apple/Google Calendar</span>
          </button>

          <button
            onClick={() => {
              StorageService.exportJSON(subscriptions);
              showToast('Exported JSON backup file.');
            }}
            className="p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F0ECE4] border border-[#E5E0D8] text-left transition-colors"
          >
            <span className="text-xs font-bold text-[#171717] block">Export Full Data (JSON)</span>
            <span className="text-[11px] text-[#737373] mt-0.5 block">Complete raw backup</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F0ECE4] border border-[#E5E0D8] text-left transition-colors"
          >
            <span className="text-xs font-bold text-[#171717] block">Export Spreadsheet (CSV)</span>
            <span className="text-[11px] text-[#737373] mt-0.5 block">Excel and Google Sheets</span>
          </button>
        </div>

        <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#171717]">Reset to Demo Subscriptions</div>
            <div className="text-[11px] text-[#737373]">Restore default sample subscriptions</div>
          </div>
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#737373] hover:text-[#171717] bg-[#FAF8F5] hover:bg-[#F0ECE4] border border-[#E5E0D8] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
