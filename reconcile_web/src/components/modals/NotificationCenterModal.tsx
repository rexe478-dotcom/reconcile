import React, { useState } from 'react';
import { X, Bell, BellRing, Check, Calendar, AlertTriangle, ChevronRight } from 'lucide-react';
import { Subscription } from '../../types/subscription';
import { NotificationService } from '../../services/notificationService';
import { BrandIcon } from '../common/BrandIcon';
import { InsightsCalculator } from '../../services/insightsCalculator';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  onSelectSubscription: (sub: Subscription) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  subscriptions,
  onSelectSubscription,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    return NotificationService.getStatus().permission;
  });
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isOpen) return null;

  const alerts = NotificationService.getUpcomingAlerts(subscriptions);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    const newPerm = await NotificationService.requestPermission();
    setPermission(newPerm);
    setIsRequesting(false);
    if (newPerm === 'granted') {
      NotificationService.checkAndNotifyRenewals(subscriptions);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#F5F3ED] border border-[#E5E0D5] shadow-2xl p-6 space-y-4 max-h-[92vh] sm:max-h-[85vh] overflow-y-auto text-[#1A1A1A] spring-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Sheet Drag Handle */}
        <div className="sm:hidden w-12 h-1.5 bg-[#DAD8D0] rounded-full mx-auto -mt-2 mb-2" />
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D5]">
          <div className="flex items-center gap-2.5">
            <img src="./assets/illustrations/notification.png" alt="Bell" className="w-9 h-9 object-contain shrink-0" />
            <div>
              <h3 className="font-extrabold text-base text-[#1A1A1A]">Notifications</h3>
              <p className="text-xs text-[#858477]">Renewal Alerts & Permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl bg-white hover:bg-[#EFECE4] text-[#737373] hover:text-[#171717] border border-[#E5E0D8] btn-tactile-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Browser Permission Banner */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#E5E0D8] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 text-[#3D5438]" />
              <span>Browser Push Notifications</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                permission === 'granted'
                  ? 'bg-[#E2EBD8] text-[#3D5438] border border-[#3D5438]/20'
                  : permission === 'denied'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {permission === 'granted'
                ? 'Active'
                : permission === 'denied'
                ? 'Blocked'
                : 'Not Enabled'}
            </span>
          </div>

          <p className="text-[11px] text-[#737373] leading-relaxed">
            {permission === 'granted'
              ? 'Web push notifications are enabled. You will receive calm alerts 1–3 days before renewals.'
              : permission === 'denied'
              ? 'Notifications are blocked in your browser settings. Unblock in browser permissions to receive alerts.'
              : 'Enable browser notifications to receive alerts before upcoming subscription charges.'}
          </p>

          {permission !== 'granted' && (
            <button
              onClick={handleEnableNotifications}
              disabled={isRequesting}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#3D5438] hover:bg-[#32462E] text-white text-xs font-bold shadow-xs btn-tactile"
            >
              {isRequesting ? 'Requesting...' : 'Enable Browser Notifications'}
            </button>
          )}
        </div>

        {/* Upcoming Renewal Alerts List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#171717]">Upcoming Alerts (Next 14 Days)</h4>
            <span className="text-[11px] text-[#737373]">{alerts.length} Due</span>
          </div>

          {alerts.length === 0 ? (
            <div className="p-4 bg-white rounded-2xl border border-[#E5E0D8] text-center text-xs text-[#737373]">
              No subscription renewals due in the next 14 days.
            </div>
          ) : (
            <div className="space-y-1.5">
              {alerts.map((alert) => {
                const sub = subscriptions.find((s) => s.id === alert.subId);
                return (
                  <div
                    key={alert.id}
                    onClick={() => {
                      if (sub) {
                        onSelectSubscription(sub);
                        onClose();
                      }
                    }}
                    className="p-3 bg-white hover:bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8] flex items-center justify-between cursor-pointer card-lift"
                  >
                    <div className="flex items-center gap-3">
                      <BrandIcon providerName={alert.providerName} size={34} />
                      <div>
                        <div className="text-xs font-bold text-[#171717]">{alert.providerName}</div>
                        <div className="text-[11px] text-[#737373]">
                          {alert.daysRemaining === 0
                            ? 'Renews Today'
                            : alert.daysRemaining === 1
                            ? 'Renews Tomorrow'
                            : `Renews in ${alert.daysRemaining} days (${alert.renewalDate})`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#171717] tabular-nums">
                        {InsightsCalculator.formatCurrency(alert.amount, alert.currency)}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#737373]" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
