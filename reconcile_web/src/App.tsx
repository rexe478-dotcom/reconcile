import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Smartphone, Grid, Monitor, RefreshCw, Bell, Search, ShieldCheck, Sparkles, Download, Cloud, CloudOff, LogOut, User as UserIcon, Calendar } from 'lucide-react';
import { Subscription } from './types/subscription';
import { StorageService } from './services/storageService';
import { InsightsCalculator } from './services/insightsCalculator';
import { AuthService, UserProfile } from './services/authService';
import { SubscriptionApi } from './services/subscriptionApi';
import { PhoneFrame } from './components/common/PhoneFrame';
import { PhoneBottomNav } from './components/common/PhoneBottomNav';
import { Screen1Onboarding } from './views/Screen1Onboarding';
import { Screen2Home } from './views/Screen2Home';
import { Screen3Subscriptions } from './views/Screen3Subscriptions';
import { Screen4Details } from './views/Screen4Details';
import { LandingPageView } from './views/LandingPageView';
import { AuthView } from './views/AuthView';
import { AddEditModal } from './components/modals/AddEditModal';
import { CancellationModal } from './components/modals/CancellationModal';
import { GmailOAuthModal } from './components/modals/GmailOAuthModal';
import { NotificationCenterModal } from './components/modals/NotificationCenterModal';
import { downloadCalendarIcs } from './services/calendarExportService';
import { NotificationService } from './services/notificationService';
import { BrandIcon } from './components/common/BrandIcon';

type ViewMode = 'landing' | 'phone' | 'all4' | 'desktop';
type MobileScreen = 'onboarding' | 'home' | 'subscriptions' | 'details' | 'saved' | 'profile';

export const App: React.FC = () => {
  // Authentication & Cloud Sync State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => AuthService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Notifications Modal State
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // State loaded dynamically from localStorage or cloud API
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    StorageService.loadSubscriptions()
  );

  // View presentation mode: 'landing' (PWA install landing), 'phone' (interactive simulator), 'all4' (exact 4-screens replica), 'desktop'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // If standalone or explicit app source query, go straight to phone app
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      window.location.search.includes('source=pwa') ||
      window.location.search.includes('mode=app');
    return isStandalone ? 'phone' : 'landing';
  });

  // Active screen in interactive phone mode
  const [currentScreen, setCurrentScreen] = useState<MobileScreen>('home');
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'explore' | 'saved' | 'profile'>('home');

  // Selected subscription for details view
  const [selectedSub, setSelectedSub] = useState<Subscription>(() => {
    return (
      subscriptions.find((s) => s.providerName.toLowerCase().includes('spotify')) ||
      subscriptions[0]
    );
  });

  // Modals state
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [cancellingSub, setCancellingSub] = useState<Subscription | null>(null);
  const [isGmailOpen, setIsGmailOpen] = useState(false);

  // Toast feedback banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Persist to localStorage as offline cache on any state modification
  useEffect(() => {
    StorageService.saveSubscriptions(subscriptions);
  }, [subscriptions]);

  // Fetch profile and remote subscriptions when authenticated
  const loadRemoteData = useCallback(async () => {
    if (!AuthService.isAuthenticated()) return;
    setIsSyncing(true);
    try {
      const profile = await AuthService.getProfile();
      setCurrentUser(profile);
      const remote = await SubscriptionApi.list();
      if (remote && remote.length > 0) {
        setSubscriptions(remote);
        const spotify = remote.find((s) => s.providerName.toLowerCase().includes('spotify')) || remote[0];
        setSelectedSub(spotify);
      }
      showToast(`Synced with cloud database as ${profile.email}`);
    } catch (err) {
      console.warn('Could not sync with backend API, using local storage', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadRemoteData();
    }
  }, [isAuthenticated, loadRemoteData]);

  // Proactive check to dispatch browser push alerts if permission granted
  useEffect(() => {
    NotificationService.checkAndNotifyRenewals(subscriptions);
  }, [subscriptions]);

  const upcomingAlertsCount = useMemo(() => {
    return NotificationService.getUpcomingAlerts(subscriptions).length;
  }, [subscriptions]);

  // Derived Calculations
  const insights = useMemo(() => {
    return InsightsCalculator.computeInsights(subscriptions);
  }, [subscriptions]);

  const totalSpendFormatted = useMemo(() => {
    return InsightsCalculator.formatCurrency(insights.totalMonthlyNormalized);
  }, [insights]);

  const nextUpSub = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === 'active');
    if (active.length === 0) return undefined;
    return [...active].sort((a, b) => a.nextRenewalDate.localeCompare(b.nextRenewalDate))[0];
  }, [subscriptions]);

  // Synchronize bottom tab with screen
  const handleSelectBottomTab = (tab: 'home' | 'explore' | 'saved' | 'profile') => {
    setActiveBottomTab(tab);
    if (tab === 'home') setCurrentScreen('home');
    else if (tab === 'explore') setCurrentScreen('subscriptions');
    else if (tab === 'saved') setCurrentScreen('saved');
    else if (tab === 'profile') setCurrentScreen('profile');
  };

  // Subscription CRUD Handlers (Connected to Cloud API + Local cache)
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
        console.warn('API save failed, fallback to local', err);
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

    if (selectedSub.id === sub.id || selectedSub.id === savedSub.id) {
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
    if (selectedSub.id === id) {
      setSelectedSub(subscriptions.find((s) => s.id !== id) || subscriptions[0]);
    }
    if (currentScreen === 'details') {
      setCurrentScreen('subscriptions');
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
    setSelectedSub((prev) => (prev.id === id ? { ...prev, remindersEnabled: newEnabled } : prev));
    showToast('Reminder toggled.');
  };

  const handleConfirmCancelled = async (id: string) => {
    if (isAuthenticated && id.startsWith('sub_')) {
      try {
        await SubscriptionApi.update(id, { status: 'cancelled', remindersEnabled: false });
      } catch (err) {
        console.warn('API cancellation status update failed', err);
      }
    }
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'cancelled', remindersEnabled: false } : s))
    );
    setSelectedSub((prev) => (prev.id === id ? { ...prev, status: 'cancelled', remindersEnabled: false } : prev));
    showToast('Subscription marked as cancelled.');
  };

  const handleResetDemo = () => {
    const demo = StorageService.resetToDemo();
    setSubscriptions(demo);
    const spotify = demo.find((s) => s.providerName.toLowerCase().includes('spotify')) || demo[0];
    setSelectedSub(spotify);
    showToast('Reset to demo subscriptions.');
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    const demo = StorageService.resetToDemo();
    setSubscriptions(demo);
    setSelectedSub(demo[0]);
    showToast('Logged out. Returned to demo mode.');
  };

  const handleSelectSubForDetails = (sub: Subscription) => {
    setSelectedSub(sub);
    setCurrentScreen('details');
  };

  if (viewMode === 'landing') {
    return (
      <>
        <div className="bg-[#3D5438] text-white text-[11px] font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <span>Reconcile Cross-Platform PWA</span>
          <span className="opacity-60">·</span>
          <button
            onClick={() => setViewMode('phone')}
            className="underline hover:opacity-90 font-bold flex items-center gap-1"
          >
            <span>Launch Interactive Simulator</span>
            <span>→</span>
          </button>
        </div>
        <LandingPageView onLaunchApp={() => setViewMode('phone')} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#171717] flex flex-col font-sans selection:bg-[#E2EBD8] selection:text-[#3D5438]">
      {/* Top Application Control Toolbar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E5E0D8] px-4 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3D5438] flex items-center justify-center text-white font-black text-sm shadow-sm">
              R
            </div>
            <div>
              <span className="font-extrabold tracking-[0.18em] text-sm text-[#171717] block leading-none">
                RECONCILE
              </span>
              <span className="text-[10px] text-[#737373] font-medium hidden sm:inline">
                Know What Renews Next
              </span>
            </div>
          </div>

          {/* View Mode Switcher Pills (Landing vs Interactive Phone vs 4-Screens Preview vs Desktop) */}
          <div className="flex items-center bg-[#F0ECE4] p-1 rounded-full border border-[#E5E0D8] text-xs font-bold">
            <button
              onClick={() => setViewMode('landing')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#737373] hover:text-[#171717] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Landing Page</span>
            </button>

            <button
              onClick={() => setViewMode('phone')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                viewMode === 'phone'
                  ? 'bg-white text-[#3D5438] shadow-xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Interactive Phone</span>
            </button>

            <button
              onClick={() => setViewMode('all4')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                viewMode === 'all4'
                  ? 'bg-white text-[#3D5438] shadow-xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>All 4 Screens View</span>
            </button>

            <button
              onClick={() => setViewMode('desktop')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                viewMode === 'desktop'
                  ? 'bg-white text-[#3D5438] shadow-xs'
                  : 'text-[#737373] hover:text-[#171717]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop Dashboard</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E0D8] text-xs font-semibold text-[#3D5438]">
                <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-pulse text-amber-500' : 'text-[#3D5438]'}`} />
                <span className="hidden sm:inline text-[#171717]">{currentUser?.email || 'Cloud Synced'}</span>
                <button
                  onClick={handleLogout}
                  title="Log Out"
                  className="ml-1 p-0.5 rounded text-[#737373] hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F0ECE4] border border-[#E5E0D8] text-xs font-semibold text-[#171717] transition-colors"
              >
                <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Sign In / Sync</span>
              </button>
            )}

            <button
              onClick={() => setIsNotificationOpen(true)}
              title="Notifications & Upcoming Renewals"
              className="relative p-2 rounded-full bg-white hover:bg-[#F0ECE4] border border-[#E5E0D8] text-[#737373] hover:text-[#171717] transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              {upcomingAlertsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#EA4335] ring-2 ring-white" />
              )}
            </button>

            <button
              onClick={handleResetDemo}
              title="Reset Demo Data"
              className="p-2 rounded-full bg-white hover:bg-[#F0ECE4] border border-[#E5E0D8] text-[#737373] hover:text-[#171717] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setEditingSub(null);
                setIsAddEditOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#3D5438] hover:bg-[#32462E] text-white font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Subscription</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area based on View Mode */}
      <main className="flex-1 flex flex-col justify-center py-6 px-4">
        {/* ======================================================== */}
        {/* MODE 1: Interactive Phone Simulator                      */}
        {/* ======================================================== */}
        {viewMode === 'phone' && (
          <div className="flex flex-col items-center justify-center my-auto">
            {/* Quick Screen Switcher Tabs for Simulator */}
            <div className="flex items-center gap-1.5 mb-4 bg-white px-3 py-1.5 rounded-full border border-[#E5E0D8] shadow-xs text-xs font-semibold overflow-x-auto max-w-full">
              <span className="text-[11px] text-[#737373] mr-1 hidden sm:inline">Quick Jump:</span>
              <button
                onClick={() => setCurrentScreen('onboarding')}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  currentScreen === 'onboarding'
                    ? 'bg-[#3D5438] text-white'
                    : 'text-[#737373] hover:bg-[#F0ECE4]'
                }`}
              >
                1. Onboarding
              </button>
              <button
                onClick={() => {
                  setCurrentScreen('home');
                  setActiveBottomTab('home');
                }}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  currentScreen === 'home'
                    ? 'bg-[#3D5438] text-white'
                    : 'text-[#737373] hover:bg-[#F0ECE4]'
                }`}
              >
                2. Home
              </button>
              <button
                onClick={() => {
                  setCurrentScreen('subscriptions');
                  setActiveBottomTab('explore');
                }}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  currentScreen === 'subscriptions'
                    ? 'bg-[#3D5438] text-white'
                    : 'text-[#737373] hover:bg-[#F0ECE4]'
                }`}
              >
                3. Subscriptions
              </button>
              <button
                onClick={() => setCurrentScreen('details')}
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  currentScreen === 'details'
                    ? 'bg-[#3D5438] text-white'
                    : 'text-[#737373] hover:bg-[#F0ECE4]'
                }`}
              >
                4. Details ({selectedSub.providerName})
              </button>
            </div>

            {/* Interactive Phone Frame */}
            <PhoneFrame>
              {/* Screen 1: Onboarding */}
              {currentScreen === 'onboarding' && (
                <Screen1Onboarding
                  onConnectGmail={() => setIsGmailOpen(true)}
                  onAddManually={() => {
                    setCurrentScreen('home');
                    setActiveBottomTab('home');
                  }}
                />
              )}

              {/* Screen 2: Home */}
              {currentScreen === 'home' && (
                <>
                  <Screen2Home
                    subscriptions={subscriptions}
                    totalSpendFormatted={totalSpendFormatted}
                    nextUpSub={nextUpSub}
                    onSelectSubscription={handleSelectSubForDetails}
                    onNavigateTab={handleSelectBottomTab}
                    onOpenNotifications={() => setIsNotificationOpen(true)}
                  />
                  <PhoneBottomNav
                    activeTab={activeBottomTab}
                    onSelectTab={handleSelectBottomTab}
                  />
                </>
              )}

              {/* Screen 3: Subscriptions / Explore */}
              {currentScreen === 'subscriptions' && (
                <>
                  <Screen3Subscriptions
                    subscriptions={subscriptions}
                    onSelectSubscription={handleSelectSubForDetails}
                    onBack={() => {
                      setCurrentScreen('home');
                      setActiveBottomTab('home');
                    }}
                  />
                  <PhoneBottomNav
                    activeTab={activeBottomTab}
                    onSelectTab={handleSelectBottomTab}
                  />
                </>
              )}

              {/* Screen 4: Details */}
              {currentScreen === 'details' && (
                <Screen4Details
                  subscription={selectedSub}
                  onBack={() => setCurrentScreen('subscriptions')}
                  onEdit={(sub) => {
                    setEditingSub(sub);
                    setIsAddEditOpen(true);
                  }}
                  onOpenCancellation={(sub) => setCancellingSub(sub)}
                  onToggleReminder={handleToggleReminder}
                />
              )}

              {/* Saved / Agenda View */}
              {currentScreen === 'saved' && (
                <>
                  <div className="flex-1 p-5 overflow-y-auto space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-[#171717]">Saved Agenda</h2>
                        <span className="text-xs text-[#737373]">{subscriptions.length} Tracked</span>
                      </div>
                      <button
                        onClick={() => {
                          downloadCalendarIcs(subscriptions);
                          showToast('Exported .ics calendar file.');
                        }}
                        className="px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF8F5] border border-[#E5E0D8] text-[11px] font-bold text-[#3D5438] flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Export .ICS</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {subscriptions.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => handleSelectSubForDetails(sub)}
                          className="p-3 bg-white rounded-2xl border border-[#E5E0D8] flex items-center justify-between cursor-pointer hover:bg-[#FAF8F5]"
                        >
                          <div className="flex items-center gap-3">
                            <BrandIcon providerName={sub.providerName} size={32} />
                            <div>
                              <div className="text-xs font-bold text-[#171717]">{sub.providerName}</div>
                              <div className="text-[11px] text-[#737373]">{sub.nextRenewalDate}</div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#171717]">₦{sub.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <PhoneBottomNav activeTab={activeBottomTab} onSelectTab={handleSelectBottomTab} />
                </>
              )}

              {/* Profile / Settings View */}
              {currentScreen === 'profile' && (
                <>
                  <div className="flex-1 p-5 overflow-y-auto space-y-4">
                    <h2 className="text-lg font-bold text-[#171717]">Profile & Settings</h2>
                    <div className="p-4 bg-white rounded-2xl border border-[#E5E0D8] space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#3D5438] text-white flex items-center justify-center font-bold">
                          {currentUser?.email ? currentUser.email[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#171717]">
                            {currentUser?.email ? currentUser.email.split('@')[0] : 'Reconcile User'}
                          </div>
                          <div className="text-xs text-[#737373]">
                            {currentUser?.email || 'Local Offline Mode'}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E5E0D8] space-y-2 text-xs">
                        {isAuthenticated ? (
                          <div className="p-2.5 rounded-xl bg-[#E2EBD8]/50 border border-[#E2EBD8] text-xs flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Cloud className="w-4 h-4 text-[#3D5438]" />
                              <div>
                                <div className="font-bold text-[#3D5438]">Cloud Database Connected</div>
                                <div className="text-[10px] text-[#737373]">PostgreSQL on Neon Free Tier</div>
                              </div>
                            </div>
                            <button
                              onClick={handleLogout}
                              className="px-2 py-1 rounded-md bg-white border border-[#E5E0D8] text-[11px] font-bold text-red-600 hover:bg-red-50"
                            >
                              Log Out
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowAuthModal(true)}
                            className="w-full py-2.5 px-3 rounded-xl bg-[#3D5438] hover:bg-[#32462E] text-white font-bold flex items-center justify-between shadow-xs transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <Cloud className="w-3.5 h-3.5" />
                              <span>Sign In / Create Account</span>
                            </span>
                            <span>→</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            downloadCalendarIcs(subscriptions);
                            showToast('Exported .ics calendar file.');
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#F5F2EA] hover:bg-[#EFECE4] text-left font-semibold flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#3D5438]" />
                            <span>Export Calendar (.ICS)</span>
                          </span>
                          <span>Download</span>
                        </button>
                        <button
                          onClick={() => setIsGmailOpen(true)}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#F5F2EA] hover:bg-[#EFECE4] text-left font-semibold flex items-center justify-between"
                        >
                          <span>Gmail Integration</span>
                          <span className="text-[#3D5438]">Review</span>
                        </button>
                        <button
                          onClick={() => StorageService.exportJSON(subscriptions)}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#F5F2EA] hover:bg-[#EFECE4] text-left font-semibold flex items-center justify-between"
                        >
                          <span>Export Subscriptions (JSON)</span>
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <PhoneBottomNav activeTab={activeBottomTab} onSelectTab={handleSelectBottomTab} />
                </>
              )}
            </PhoneFrame>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 2: All 4 Screens Side-by-Side (Exact Reference Match)*/}
        {/* ======================================================== */}
        {viewMode === 'all4' && (
          <div className="max-w-[1600px] mx-auto w-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-[#171717] tracking-tight">
                All 4 Screens Preview (1:1 Reference Match)
              </h2>
              <p className="text-xs sm:text-sm text-[#737373] mt-1 max-w-lg mx-auto">
                Recreated with pixel precision to match your design image. All screens share live dynamic state.
              </p>
            </div>

            {/* Side-by-Side Grid matching the 4-phone photograph */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 justify-items-center">
              {/* Screen 1: Onboarding */}
              <PhoneFrame title="Screen 1 · Welcome">
                <Screen1Onboarding
                  onConnectGmail={() => setIsGmailOpen(true)}
                  onAddManually={() => setViewMode('phone')}
                />
              </PhoneFrame>

              {/* Screen 2: Home */}
              <PhoneFrame title="Screen 2 · Your subscriptions">
                <Screen2Home
                  subscriptions={subscriptions}
                  totalSpendFormatted={totalSpendFormatted}
                  nextUpSub={nextUpSub}
                  onSelectSubscription={handleSelectSubForDetails}
                  onNavigateTab={handleSelectBottomTab}
                  onOpenNotifications={() => setIsNotificationOpen(true)}
                />
                <PhoneBottomNav
                  activeTab="home"
                  onSelectTab={handleSelectBottomTab}
                />
              </PhoneFrame>

              {/* Screen 3: Subscriptions / Explore */}
              <PhoneFrame title="Screen 3 · Subscriptions">
                <Screen3Subscriptions
                  subscriptions={subscriptions}
                  onSelectSubscription={handleSelectSubForDetails}
                  onBack={() => setViewMode('phone')}
                />
                <PhoneBottomNav
                  activeTab="explore"
                  onSelectTab={handleSelectBottomTab}
                />
              </PhoneFrame>

              {/* Screen 4: Subscription Details */}
              <PhoneFrame title={`Screen 4 · Details (${selectedSub.providerName})`}>
                <Screen4Details
                  subscription={selectedSub}
                  onBack={() => setViewMode('phone')}
                  onEdit={(sub) => {
                    setEditingSub(sub);
                    setIsAddEditOpen(true);
                  }}
                  onOpenCancellation={(sub) => setCancellingSub(sub)}
                  onToggleReminder={handleToggleReminder}
                />
              </PhoneFrame>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 3: Responsive Desktop Dashboard Layout             */}
        {/* ======================================================== */}
        {viewMode === 'desktop' && (
          <div className="max-w-6xl mx-auto w-full space-y-6">
            {/* Desktop Hero Spend Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-[#F0ECE4] rounded-3xl p-6 border border-[#E5E0D8] shadow-xs">
                <span className="text-xs text-[#737373] font-bold block mb-1">Total Monthly Spend</span>
                <span className="text-3xl font-black text-[#171717]">{totalSpendFormatted}</span>
                <span className="text-xs text-[#3D5438] font-semibold block mt-2">
                  {subscriptions.filter((s) => s.status === 'active').length} Active Subscriptions
                </span>
              </div>

              {nextUpSub && (
                <div
                  onClick={() => handleSelectSubForDetails(nextUpSub)}
                  className="cursor-pointer bg-white hover:bg-[#FAF8F5] rounded-3xl p-6 border border-[#E5E0D8] shadow-xs transition-colors"
                >
                  <span className="text-xs text-[#737373] font-bold block mb-1">Next Up Renewal</span>
                  <div className="flex items-center gap-3">
                    <BrandIcon providerName={nextUpSub.providerName} size={40} />
                    <div>
                      <div className="text-lg font-bold text-[#171717]">{nextUpSub.providerName}</div>
                      <div className="text-xs text-[#737373]">{nextUpSub.nextRenewalDate} · ₦{nextUpSub.amount.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-3xl p-6 border border-[#E5E0D8] shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs text-[#737373] font-bold block mb-1">Gmail Detection</span>
                  <span className="text-sm font-bold text-[#171717] block">Scan for Subscription Receipts</span>
                </div>
                <button
                  onClick={() => setIsGmailOpen(true)}
                  className="w-full mt-3 py-2.5 px-3 rounded-full bg-[#3D5438] hover:bg-[#32462E] text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Connect Gmail</span>
                </button>
              </div>
            </div>

            {/* Desktop Subscriptions Table */}
            <div className="bg-white rounded-3xl border border-[#E5E0D8] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#171717]">All Subscriptions</h3>
                <span className="text-xs text-[#737373]">{subscriptions.length} total entries</span>
              </div>

              <div className="divide-y divide-[#E5E0D8]">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => handleSelectSubForDetails(sub)}
                    className="py-3.5 flex items-center justify-between hover:bg-[#FAF8F5] px-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <BrandIcon providerName={sub.providerName} size={40} />
                      <div>
                        <div className="text-sm font-bold text-[#171717]">{sub.providerName}</div>
                        <div className="text-xs text-[#737373]">{sub.notes || sub.planName} · Renews {sub.nextRenewalDate}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-[#171717]">₦{sub.amount.toLocaleString()}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          sub.status === 'needs_review'
                            ? 'bg-[#FDEEE2] text-[#C2671A]'
                            : 'bg-[#E2EBD8] text-[#3D5438]'
                        }`}
                      >
                        {sub.status === 'needs_review' ? 'Needs Review' : 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Shared Modals */}
      <AddEditModal
        subscription={editingSub}
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingSub(null);
        }}
        onSave={handleSaveSubscription}
        onDelete={handleDeleteSubscription}
      />

      <CancellationModal
        subscription={cancellingSub}
        onClose={() => setCancellingSub(null)}
        onConfirmCancelled={handleConfirmCancelled}
      />

      <GmailOAuthModal
        isOpen={isGmailOpen}
        onClose={() => setIsGmailOpen(false)}
        onImportCandidate={(candidate) => {
          handleSaveSubscription(candidate);
          setCurrentScreen('subscriptions');
        }}
      />

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white hover:bg-[#EFECE4] text-[#737373] hover:text-[#171717] border border-[#E5E0D8] transition-colors"
            >
              ✕
            </button>
            <AuthView
              onAuthenticated={async () => {
                setIsAuthenticated(true);
                setShowAuthModal(false);
                await loadRemoteData();
                showToast('Signed in successfully!');
              }}
            />
          </div>
        </div>
      )}

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        subscriptions={subscriptions}
        onSelectSubscription={handleSelectSubForDetails}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-full bg-[#3D5438] text-white font-bold text-xs shadow-xl animate-in slide-in-from-bottom duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default App;
