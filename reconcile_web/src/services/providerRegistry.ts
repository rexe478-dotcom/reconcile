import { CancellationGuide } from '../types/subscription';

export const PROVIDER_REGISTRY: Record<string, CancellationGuide> = {
  netflix: {
    providerName: 'Netflix',
    targetDomain: 'netflix.com',
    verifiedUrl: 'https://www.netflix.com/youraccount',
    requiresWebLogin: true,
    steps: [
      'Sign in to your Netflix account on the web.',
      'Under the "Membership & Billing" section, select "Cancel Membership".',
      'Select "Finish Cancellation" to confirm.',
      'Your streaming access continues until the end of the current billing cycle.'
    ],
    caveats: [
      'If billed through a 3rd party (Apple or mobile carrier), manage it through that billing provider.',
      'Netflix retains viewing history for 10 months after cancellation.'
    ]
  },
  spotify: {
    providerName: 'Spotify',
    targetDomain: 'spotify.com',
    verifiedUrl: 'https://www.spotify.com/account/overview/',
    requiresWebLogin: true,
    steps: [
      'Log into your Spotify account overview in a web browser.',
      'Scroll down to "Your plan" and select "Change plan".',
      'Scroll to "Cancel Spotify" and select "Cancel Premium".',
      'Continue through to the confirmation screen.'
    ],
    caveats: [
      'Premium cannot be cancelled from within the Spotify mobile app.',
      'You will keep Spotify Free with your playlists intact.'
    ]
  },
  apple: {
    providerName: 'Apple iCloud+',
    targetDomain: 'apple.com',
    verifiedUrl: 'https://support.apple.com/HT202039',
    requiresWebLogin: false,
    steps: [
      'Open Settings on your iPhone, iPad, or Mac.',
      'Tap your Name / Apple ID at the top.',
      'Select "Subscriptions".',
      'Choose the subscription you wish to cancel and tap "Cancel Subscription".'
    ],
    caveats: [
      'Cancelling iCloud+ reduces storage to the free 5 GB tier.',
      'Data exceeding 5 GB will stop syncing after the billing period.'
    ]
  },
  adobe: {
    providerName: 'Adobe Creative Cloud',
    targetDomain: 'adobe.com',
    verifiedUrl: 'https://account.adobe.com/plans',
    requiresWebLogin: true,
    steps: [
      'Sign in at account.adobe.com/plans.',
      'Select "Manage plan" for the plan you want to cancel.',
      'Select "Cancel your plan".',
      'State your reason and confirm cancellation.'
    ],
    caveats: [
      'Early cancellation fees may apply if cancelling an annual contract paid monthly after 14 days.',
      'Cloud storage is reduced to 2 GB upon cancellation.'
    ]
  },
  youtube: {
    providerName: 'YouTube Premium',
    targetDomain: 'youtube.com',
    verifiedUrl: 'https://www.youtube.com/paid_memberships',
    requiresWebLogin: true,
    steps: [
      'Visit youtube.com/paid_memberships.',
      'Click "Manage membership" next to your active plan.',
      'Select "Deactivate".',
      'Click "Continue to cancel" and select your cancellation reason.'
    ],
    caveats: [
      'You can pause your membership for up to 6 months instead of cancelling.',
      'Family plan managers cancel access for all members.'
    ]
  },
  chatgpt: {
    providerName: 'ChatGPT Plus',
    targetDomain: 'chatgpt.com',
    verifiedUrl: 'https://chatgpt.com/#settings/Subscription',
    requiresWebLogin: true,
    steps: [
      'Log into ChatGPT and click your profile at the bottom left.',
      'Select "Settings" and navigate to "Subscription".',
      'Click "Manage my subscription" to open the Stripe portal.',
      'Click "Cancel plan" and confirm.'
    ],
    caveats: [
      'Plus benefits remain active until the end of your prepaid month.',
      'Subscription refunds are not offered except where required by law.'
    ]
  },
  dstv: {
    providerName: 'DSTV Stream',
    targetDomain: 'dstv.com',
    verifiedUrl: 'https://eazy.dstv.com/',
    requiresWebLogin: true,
    steps: [
      'Log into self-service at eazy.dstv.com.',
      'Navigate to "Manage Subscriptions".',
      'Select "Disconnect / Change Package".',
      'Follow prompts to schedule disconnection at the end of the current period.'
    ],
    caveats: [
      'Ensure automatic debit orders are paused with your bank if needed.',
      'Reconnection fees may apply upon re-subscribing.'
    ]
  }
};

export function getCancellationGuide(providerName: string): CancellationGuide | null {
  const normalized = providerName.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [key, guide] of Object.entries(PROVIDER_REGISTRY)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return guide;
    }
  }
  return null;
}
