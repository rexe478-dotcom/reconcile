import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useUser, useClerk } from '@clerk/react';
import { 
  Plus, 
  Bell, 
  Cloud, 
  CloudOff, 
  Calendar as CalendarIcon, 
  CreditCard, 
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
import { ReconcileLogo } from './components/common/ReconcileLogo';

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
import { OnboardingModal } from './components/modals/OnboardingModal';
import { AuthView } from './views/AuthView';

type AppTab = 'dashboard' | 'subscriptions' | 'calendar' | 'settings';

export const App: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  // Interactive Onboarding Tour (Auto-opens on first visit, or accessible anytime from Settings/Dashboard)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('reconcile_onboarding_completed');
  });

  // Clerk Auth Integration
  const { user: clerkUser, isSignedIn: isClerkSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  // Authentication & Remote State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => AuthService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Synchronize Clerk user session with Reconcile application state & backend database
  useEffect(() => {
    if (isClerkSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || 'User';
      const profile: UserProfile = {
        id: clerkUser.id,
        email: email,
        preferred_timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
        created_at: clerkUser.createdAt ? clerkUser.createdAt.toISOString() : new Date().toISOString()
      };
      setCurrentUser(profile);
      setIsAuthenticated(true);
      setShowAuthModal(false);

      // Sync Clerk user with backend database to obtain valid backend JWT
      AuthService.syncClerkUser(clerkUser.id, email).catch((err) => {
        console.warn('Backend Clerk sync notice:', err);
      });
    }
  }, [isClerkSignedIn, clerkUser]);

  // Handle post-OAuth Gmail redirect callbacks from FastAPI backend (#settings?gmail=connected)
  useEffect(() => {
    const handleLocationCheck = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash;
      if (hash.includes('gmail=connected')) {
        setActiveTab('settings');
        setIsGmailOpen(true);
        showToast('Gmail account connected! You can now scan subscription receipts.');
        window.history.replaceState(null, '', window.location.pathname + '#settings');
      } else if (hash.includes('gmail_error=')) {
        setActiveTab('settings');
        const match = hash.match(/gmail_error=([^&]*)/);
        const errDetail = match ? decodeURIComponent(match[1]) : 'Authentication failed';
        showToast(`Google OAuth notice: ${errDetail}`);
        window.history.replaceState(null, '', window.location.pathname + '#settings');
      }
    };

    handleLocationCheck();
    window.addEventListener('hashchange', handleLocationCheck);
    return () => window.removeEventListener('hashchange', handleLocationCheck);
  }, []);

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

  const handleLogout = async () => {
    try {
      if (isClerkSignedIn) {
        await clerkSignOut();
      }
    } catch (err) {
      console.warn('Clerk signOut warning', err);
    }
    AuthService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    const demo = StorageService.resetToDemo();
    setSubscriptions(demo);
    setSelectedSub(null);
    showToast('Signed out. Local demo data restored.');
  };

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#EBF3DF] selection:text-[#3D5438]">
      {/* Toast Feedback Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#1A1A1A] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-[#A5C96B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Official Reconcile Brand Logo Lockup */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 cursor-pointer select-none group"
            title="Reconcile - Home"
          >
            <ReconcileLogo variant="horizontal" size={34} className="group-hover:opacity-90 transition-opacity" />
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-2xl border border-[#E5E0D8]">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold btn-tactile-sm ${
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold btn-tactile-sm ${
                activeTab === 'subscriptions'
                  ? 'bg-white text-[#3D5438] shadow-2xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Subscriptions ({subscriptions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold btn-tactile-sm ${
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold btn-tactile-sm ${
                activeTab === 'settings'
                  ? 'bg-white text-[#3D5438] shadow-2xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Right Header Action: Only Sign In / User Account at the very end */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <button 
                onClick={() => setActiveTab('settings')}
                className="min-h-[44px] flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E2EBD8]/60 hover:bg-[#E2EBD8] text-[#3D5438] border border-[#E2EBD8] text-xs font-bold shadow-2xs btn-tactile"
                title={`Cloud Connected: ${currentUser?.email}`}
              >
                <div className="w-5 h-5 rounded-full bg-[#3D5438] text-white flex items-center justify-center text-[10px] font-black">
                  {currentUser?.email ? currentUser.email[0].toUpperCase() : 'U'}
                </div>
                <span className="max-w-[130px] truncate">{currentUser?.email || 'Account'}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-full bg-[#3D5438] hover:bg-[#32462E] text-white text-xs font-bold shadow-xs btn-tactile"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
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
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
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
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            showToast={showToast}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E0D8] px-3 py-1 flex items-center justify-around safe-area-bottom">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`min-h-[48px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all active:scale-95 ${
            activeTab === 'dashboard' ? 'text-[#3D5438] font-bold' : 'text-[#737373]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`min-h-[48px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all active:scale-95 ${
            activeTab === 'subscriptions' ? 'text-[#3D5438] font-bold' : 'text-[#737373]'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px] font-bold">Subscriptions</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`min-h-[48px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all active:scale-95 ${
            activeTab === 'calendar' ? 'text-[#3D5438] font-bold' : 'text-[#737373]'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold">Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`min-h-[48px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all active:scale-95 ${
            activeTab === 'settings' ? 'text-[#3D5438] font-bold' : 'text-[#737373]'
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
        }}
        showToast={showToast}
      />

      {/* 6. Auth Modal (Sign In / Register) */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          onClick={() => setShowAuthModal(false)}
        >
          <div 
            className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#E5E0D8] spring-dialog my-auto max-h-[94vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#FAF8F5] text-[#737373] hover:text-[#171717] transition-colors cursor-pointer"
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

      {/* 7. Animated In-App Onboarding Experience */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
};

export default App;
