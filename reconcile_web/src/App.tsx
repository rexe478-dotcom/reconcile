import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useUser, useClerk } from '@clerk/react';
import { 
  Plus, 
  Bell, 
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
import { LottiePlayer } from './components/common/LottiePlayer';
import appPreloaderAnim from './assets/animations/app_preloader.json';
import successCelebrationAnim from './assets/animations/success_celebration.json';

// Tabs & Views
import { Screen1Onboarding } from './views/Screen1Onboarding';
import { DashboardTab } from './views/DashboardTab';
import { SubscriptionsTab } from './views/SubscriptionsTab';
import { CalendarTab } from './views/CalendarTab';
import { SettingsTab } from './views/SettingsTab';
import { SubscriptionDetailsModal } from './components/modals/SubscriptionDetailsModal';
import { AddEditModal } from './components/modals/AddEditModal';
import { CancellationModal } from './components/modals/CancellationModal';
import { NotificationCenterModal } from './components/modals/NotificationCenterModal';
import { OnboardingModal } from './components/modals/OnboardingModal';
import { AuthView } from './views/AuthView';

export type AppTab = 'onboarding' | 'dashboard' | 'subscriptions' | 'calendar' | 'settings';

export const App: React.FC = () => {
  // Startup Loading Preloader Splash (Always plays for 1.8s or until user skips)
  const [isPreloading, setIsPreloading] = useState<boolean>(true);
  const [preloadProgress, setPreloadProgress] = useState<number>(15);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1800;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setPreloadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsPreloading(false);
        }, 200);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Navigation tab state: defaults to 'onboarding' for new visitors or users with 0 subscriptions
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('tab') === 'onboarding') return 'onboarding';
      if (!localStorage.getItem('reconcile_onboarding_completed')) {
        return 'onboarding';
      }
    }
    return 'dashboard';
  });

  // Interactive Onboarding Tour Modal
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);

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

      AuthService.syncClerkUser(clerkUser.id, email).catch((err) => {
        console.warn('Backend Clerk sync notice:', err);
      });
    }
  }, [isClerkSignedIn, clerkUser]);

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
      setSubscriptions(remote || []);
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
    setSubscriptions([]);
    StorageService.saveSubscriptions([]);
    setSelectedSub(null);
    showToast('Signed out successfully.');
  };

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#EBF3DF] selection:text-[#3D5438]">
      {/* 1. Full-Screen Lottie Startup Preloader Splash */}
      {isPreloading && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF8F5] transition-opacity duration-300"
          role="status"
          aria-label="Loading Reconcile"
          onClick={() => setIsPreloading(false)}
        >
          <div 
            className="flex flex-col items-center max-w-xs w-full px-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lottie Animated Preloader */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
              <LottiePlayer
                animationData={appPreloaderAnim}
                loop={true}
                autoplay={true}
                className="w-full h-full"
                ariaLabel="Reconcile startup loading animation"
              />
            </div>

            {/* Brand & Loading Status */}
            <div className="space-y-1.5 -mt-2">
              <div className="flex items-center justify-center gap-2">
                <MascotLogo size={26} className="shadow-xs" />
                <span className="font-extrabold tracking-[0.25em] text-sm text-[#171717]">
                  RECONCILE
                </span>
              </div>
              <p className="text-xs font-semibold text-[#737373]">
                {preloadProgress < 50
                  ? 'Securing recurring subscriptions...'
                  : preloadProgress < 90
                  ? 'Preparing offline vault...'
                  : 'Ready!'}
              </p>
            </div>

            {/* Sleek Progress Bar */}
            <div className="w-52 h-1.5 bg-[#E5E0D8] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#3D5438] rounded-full transition-all duration-100 ease-out"
                style={{ width: `${preloadProgress}%` }}
              />
            </div>

            {/* Skip Button */}
            <button
              onClick={() => setIsPreloading(false)}
              className="text-[11px] font-bold text-[#737373] hover:text-[#171717] px-3.5 py-1 rounded-full hover:bg-[#E5E0D8]/60 transition-colors cursor-pointer"
            >
              Tap anywhere or Skip →
            </button>
          </div>
        </div>
      )}

      {/* Toast Feedback Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#1A1A1A] text-white text-xs font-bold py-2.5 px-4 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200 border border-white/10">
          <div className="w-5 h-5 shrink-0 flex items-center justify-center">
            {toastMessage.toLowerCase().includes('saved') ? (
              <LottiePlayer
                animationData={successCelebrationAnim}
                loop={false}
                autoplay={true}
                className="w-5 h-5"
              />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#A5C96B]" />
            )}
          </div>
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
            {/* Onboarding Screen Tab */}
            <button
              onClick={() => setActiveTab('onboarding')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold btn-tactile-sm ${
                activeTab === 'onboarding'
                  ? 'bg-white text-[#3D5438] shadow-2xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Onboarding</span>
            </button>

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

          {/* Right Header Action */}
          <div className="flex items-center gap-2">
            {/* Quick Replay Loading Button */}
            <button
              onClick={() => setIsPreloading(true)}
              className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-[#737373] hover:text-[#3D5438] px-2.5 py-1.5 rounded-full hover:bg-[#FAF8F5] transition-colors"
              title="Replay startup loading animation"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Replay Intro</span>
            </button>

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
        {/* TAB 1: Onboarding View (Faithfully matching Reference Image with Lottie Animation) */}
        {activeTab === 'onboarding' && (
          <div className="py-2 flex items-center justify-center min-h-[calc(100vh-140px)]">
            <Screen1Onboarding
              onAddManually={() => {
                localStorage.setItem('reconcile_onboarding_completed', 'true');
                setActiveTab('subscriptions');
                setIsAddEditOpen(true);
              }}
            />
          </div>
        )}

        {/* TAB 2: Dashboard View */}
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
            onOpenOnboarding={() => setActiveTab('onboarding')}
          />
        )}

        {/* TAB 3: Subscriptions Ledger */}
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

        {/* TAB 4: Calendar Schedule */}
        {activeTab === 'calendar' && (
          <CalendarTab
            subscriptions={subscriptions}
            onSelectSubscription={(sub) => setSelectedSub(sub)}
            onOpenCancellation={(sub) => setCancellingSub(sub)}
            showToast={showToast}
          />
        )}

        {/* TAB 5: Settings & Preferences */}
        {activeTab === 'settings' && (
          <SettingsTab
            currentUser={currentUser}
            isAuthenticated={isAuthenticated}
            subscriptions={subscriptions}
            onOpenAuth={() => setShowAuthModal(true)}
            onLogout={handleLogout}
            onOpenNotifications={() => setIsNotificationOpen(true)}
            onOpenOnboarding={() => setActiveTab('onboarding')}
            showToast={showToast}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E0D8] px-2 py-1 flex items-center justify-around safe-area-bottom">
        <button
          onClick={() => setActiveTab('onboarding')}
          className={`min-h-[48px] min-w-[50px] flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-all active:scale-95 ${
            activeTab === 'onboarding' ? 'text-[#3D5438] font-bold' : 'text-[#737373]'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[9px] font-bold">Onboard</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`min-h-[48px] min-w-[50px] flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-all active:scale-95 ${
            activeTab === 'dashboard' ? 'text-[#3D5438] font-bold' : 'text-[#737373]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] font-bold">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`min-h-[48px] min-w-[50px] flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-all active:scale-95 ${
            activeTab === 'subscriptions' ? 'text-[#3D5438] font-bold' : 'text-[#737373]'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[9px] font-bold">Subs ({subscriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`min-h-[48px] min-w-[50px] flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-all active:scale-95 ${
            activeTab === 'calendar' ? 'text-[#3D5438] font-bold' : 'text-[#737373]'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[9px] font-bold">Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`min-h-[48px] min-w-[50px] flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-all active:scale-95 ${
            activeTab === 'settings' ? 'text-[#3D5438] font-bold' : 'text-[#737373]'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[9px] font-bold">Settings</span>
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

      {/* 5. Auth Modal (Sign In / Register) */}
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

      {/* 6. Guided Tour Modal (Accessible if requested) */}
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
      />
    </div>
  );
};

export default App;
