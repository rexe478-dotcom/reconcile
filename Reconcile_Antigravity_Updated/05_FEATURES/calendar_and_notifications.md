# Calendar and notifications
Calendar events include subscription_id, occurrence_key, provider, local date/time, and optional amount/currency. Tapping opens the matching subscription.

Request notification permission contextually. Stable IDs derive from subscription ID + occurrence key + reminder offset. Editing one subscription replaces only its reminders. Handle denied permission, reboot/rescheduling, time-zone changes, app updates, duplicate prevention. If server scheduling is added, define a single source of truth and reconciliation strategy.

Example copy: “Your Spotify subscription is expected to renew tomorrow.” Never claim a charge occurred unless verified.
