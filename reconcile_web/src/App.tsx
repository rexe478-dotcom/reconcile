import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Bell, 
  Cloud, 
  CloudOff, 
  Calendar as CalendarIcon, 
  Grid, 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  User as UserIcon, 
  RefreshCw,
  Sparkles,
  X
} from 'lucide-react';
import { Subscription } from './types/subscription';
import { StorageService } from './services/storageService';
import { AuthService, UserProfile } from './services/authService';
import { SubscriptionApi } from './services/subscriptionApi';
import { NotificationService } from './services/notificationService';
import { MascotLogo } from './components/common/MascotLogo';

// Tabs & Modals
import { DashboardTab } from './views/DashboardTab';
import { SubscriptionsTab } from './views/SubscriptionsTab';
import { CalendarTab } from './views/CalendarTab';
import { SettingsTab } from './views/SettingsTab';
import { SubscriptionDetailsModal } from './components/modals/SubscriptionDetailsModal';
import { AddEditModal } from './components/modals/AddEditModal';
import { CancellationModal } from './components/modals/CancellationModal';
import { GmailOAuthModal } from './components/modals/GmailOAuthModal';
import { NotificationCenterModal } from './components/modals/NotificationCenterModal';
import { AuthView } from './views/AuthView';

type AppTab = 'dashboard' | 'subscriptions' | 'calendar' | 'settings';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  // Authentication & Remote State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => AuthService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    StorageService.loadSubscriptions()
  );

  // Selected subscription for details drawer/modal
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  // Modals state
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [cancellingSub, setCancellingSub] = useState<Subscription | null>(null);
  const [isGmailOpen, setIsGmailOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Toast feedback banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Persist to localStorage as offline cache on every state modification
  useEffect(() => {
    StorageService.saveSubscriptions(subscriptions);
  }, [subscriptions]);

  // Load user profile & sync with backend when authenticated
  const loadRemoteData = useCallback(async () => {
    if (!AuthService.isAuthenticated()) return;
    setIsSyncing(true);
    try {
      const profile = await AuthService.getProfile();
      setCurrentUser(profile);
      const remote = await SubscriptionApi.list();
      if (remote && remote.length > 0) {
        setSubscriptions(remote);
      }
      showToast(`Synced with cloud database as ${profile.email}`);
    } catch (err) {
      console.warn('Backend sync failed, falling back to local storage', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadRemoteData();
    }
  }, [isAuthenticated, loadRemoteData]);

  // Push notifications renewal check
  useEffect(() => {
    NotificationService.checkAndNotifyRenewals(subscriptions);
  }, [subscriptions]);

  const upcomingAlertsCount = useMemo(() => {
    return NotificationService.getUpcomingAlerts(subscriptions).length;
  }, [subscriptions]);

  // CRUD Handlers
  const handleSaveSubscription = async (sub: Subscription) => {
    let savedSub = sub;
    if (isAuthenticated) {
      try {
        setIsSyncing(true);
        if (sub.id && sub.id.startsWith('sub_')) {
          savedSub = await SubscriptionApi.update(sub.id, sub);
        } else {
          savedSub = await SubscriptionApi.create(sub);
        }
      } catch (err) {
        console.warn('API save failed, saved to local cache', err);
        showToast('Saved to local storage.');
      } finally {
        setIsSyncing(false);
      }
    }

    setSubscriptions((prev) => {
      const exists = prev.some((s) => s.id === savedSub.id || (sub.id && s.id === sub.id));
      if (exists) {
        return prev.map((s) => (s.id === savedSub.id || s.id === sub.id ? savedSub : s));
      }
      return [savedSub, ...prev];
    });

    if (selectedSub && (selectedSub.id === sub.id || selectedSub.id === savedSub.id)) {
      setSelectedSub(savedSub);
    }
    showToast(`Saved "${savedSub.providerName}".`);
  };

  const handleDeleteSubscription = async (id: string) => {
    if (isAuthenticated && id.startsWith('sub_')) {
      try {
        await SubscriptionApi.remove(id);
      } catch (err) {
        console.warn('API delete failed', err);
      }
    }
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    if (selectedSub && selectedSub.id === id) {
      setSelectedSub(null);
    }
    showToast('Subscription deleted.');
  };

  const handleToggleReminder = async (id: string) => {
    const target = subscriptions.find((s) => s.id === id);
    if (!target) return;
    const newEnabled = !target.remindersEnabled;
    if (isAuthenticated && id.startsWith('sub_')) {
      try {
        await SubscriptionApi.update(id, { remindersEnabled: newEnabled });
      } catch (err) {
        console.warn('API reminder update failed', err);
      }
    }
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, remindersEnabled: newEnabled } : s))
    );
    if (selectedSub && selectedSub.id === id) {
      setSelectedSub((prev) => (prev ? { ...prev, remindersEnabled: newEnabled } : null));
    }
    showToast(`Reminders ${newEnabled ? 'activated' : 'muted'} for ${target.providerName}.`);
  };

  const handleResetDemo = () => {
    const demo = StorageService.resetToDemo();
    setSubscriptions(demo);
    setSelectedSub(null);
    showToast('Reset to demo subscriptions.');
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    const demo = StorageService.resetToDemo();
    setSubscriptions(demo);
    setSelectedSub(null);
    showToast('Signed out. Local demo data restored.');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#171717] flex flex-col font-sans selection:bg-[#E2EBD8] selection:text-[#3D5438]">
      {/* Toast Feedback Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#171717] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-[#E2EBD8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Mark with Vigilant Owl Mascot (NO text inside logo) */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <MascotLogo size={38} className="group-hover:shadow-md" />
            <div>
              <span className="font-extrabold tracking-[0.2em] text-xs text-[#171717] block">
                RECONCILE
              </span>
              <span className="text-[10px] text-[#737373] hidden sm:block">
                Know what renews next
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-2xl border border-[#E5E0D8]">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#3D5438] shadow-2xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'subscriptions'
                  ? 'bg-white text-[#3D5438] shadow-2xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Subscriptions ({subscriptions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-white text-[#3D5438] shadow-2xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-white text-[#3D5438] shadow-2xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cloud Sync Status */}
            {isAuthenticated ? (
              <div 
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E2EBD8]/60 text-[#3D5438] border border-[#E2EBD8] text-[11px] font-bold cursor-pointer"
                title={`Cloud Connected: ${currentUser?.email}`}
              >
                <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
                <span className="hidden sm:inline">PostgreSQL Synced</span>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF8F5] hover:bg-[#F0ECE4] text-[#737373] hover:text-[#171717] border border-[#E5E0D8] text-[11px] font-bold transition-colors"
              >
                <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Sign In / Sync</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="relative p-2 rounded-full bg-[#FAF8F5] hover:bg-[#F0ECE4] border border-[#E5E0D8] text-[#737373] hover:text-[#171717] transition-colors"
              title="Renewal Alerts"
            >
              <Bell className="w-4 h-4 text-[#171717]" />
              {upcomingAlertsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#EA4335] ring-2 ring-white" />
              )}
            </button>

            {/* Add Subscription Button */}
            <button
              onClick={() => {
                setEditingSub(null);
                setIsAddEditOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#3D5438] hover:bg-[#32462E] text-white font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Subscription</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardTab
            subscriptions={subscriptions}
            onSelectSubscription={(sub) => setSelectedSub(sub)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onAddSubscription={() => {
              setEditingSub(null);
              setIsAddEditOpen(true);
            }}
            onOpenNotifications={() => setIsNotificationOpen(true)}
          />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionsTab
            subscriptions={subscriptions}
            onSelectSubscription={(sub) => setSelectedSub(sub)}
            onAddSubscription={() => {
              setEditingSub(null);
              setIsAddEditOpen(true);
            }}
            onOpenCancellation={(sub) => setCancellingSub(sub)}
            onToggleReminder={handleToggleReminder}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarTab
            subscriptions={subscriptions}
            onSelectSubscription={(sub) => setSelectedSub(sub)}
            onOpenCancellation={(sub) => setCancellingSub(sub)}
            showToast={showToast}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            currentUser={currentUser}
            isAuthenticated={isAuthenticated}
            subscriptions={subscriptions}
            onOpenAuth={() => setShowAuthModal(true)}
            onLogout={handleLogout}
            onOpenGmail={() => setIsGmailOpen(true)}
            onOpenNotifications={() => setIsNotificationOpen(true)}
            onResetDemo={handleResetDemo}
            showToast={showToast}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E0D8] px-3 py-2 flex items-center justify-around safe-area-bottom">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'dashboard' ? 'text-[#3D5438]' : 'text-[#737373]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'subscriptions' ? 'text-[#3D5438]' : 'text-[#737373]'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-bold">Subscriptions</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'calendar' ? 'text-[#3D5438]' : 'text-[#737373]'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold">Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
            activeTab === 'settings' ? 'text-[#3D5438]' : 'text-[#737373]'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold">Settings</span>
        </button>
      </nav>

      {/* Modals & Dialogs */}
      {/* 1. Subscription Details Modal */}
      <SubscriptionDetailsModal
        subscription={selectedSub}
        isOpen={Boolean(selectedSub)}
        onClose={() => setSelectedSub(null)}
        onEdit={(sub) => {
          setSelectedSub(null);
          setEditingSub(sub);
          setIsAddEditOpen(true);
        }}
        onDelete={handleDeleteSubscription}
        onOpenCancellation={(sub) => {
          setSelectedSub(null);
          setCancellingSub(sub);
        }}
        onToggleReminder={handleToggleReminder}
      />

      {/* 2. Add / Edit Modal */}
      <AddEditModal
        isOpen={isAddEditOpen}
        subscription={editingSub}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingSub(null);
        }}
        onSave={handleSaveSubscription}
        onDelete={handleDeleteSubscription}
      />

      {/* 3. Verified Cancellation Handoff Modal */}
      <CancellationModal
        subscription={cancellingSub}
        onClose={() => setCancellingSub(null)}
        onConfirmCancelled={async (id) => {
          if (isAuthenticated && id.startsWith('sub_')) {
            try {
              await SubscriptionApi.update(id, { status: 'cancelled', remindersEnabled: false });
            } catch (err) {
              console.warn('API cancellation update failed', err);
            }
          }
          setSubscriptions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status: 'cancelled', remindersEnabled: false } : s))
          );
          showToast('Marked subscription as cancelled.');
          setCancellingSub(null);
        }}
      />

      {/* 4. Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        subscriptions={subscriptions}
        onSelectSubscription={(sub) => {
          setIsNotificationOpen(false);
          setSelectedSub(sub);
        }}
      />

      {/* 5. Gmail OAuth Discovery Modal */}
      <GmailOAuthModal
        isOpen={isGmailOpen}
        onClose={() => setIsGmailOpen(false)}
        onImportCandidate={(cand) => {
          setSubscriptions((prev) => [cand, ...prev]);
          showToast(`Imported ${cand.providerName}.`);
        }}
      />

      {/* 6. Auth Modal (Sign In / Register) */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowAuthModal(false)}
        >
          <div 
            className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#E5E0D8] spring-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#FAF8F5] text-[#737373] hover:text-[#171717] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <AuthView
              onClose={() => setShowAuthModal(false)}
              onAuthenticated={() => {
                setIsAuthenticated(true);
                setShowAuthModal(false);
                loadRemoteData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
