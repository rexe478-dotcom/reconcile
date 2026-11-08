# MASTER PROMPT — BUILD RECONCILE

Act as lead product engineer and product designer for Reconcile.

## First: inspect before changing
Inspect the complete repository, framework, package files, routes, database, tests, and conventions. Identify what works. Do not overwrite a sound architecture. Read this entire project pack. Produce a short implementation plan before coding. If the repo is empty, use the default stack in `04_TECHNICAL/`.

## Product
Users can add recurring subscriptions, track each service's next expected renewal, set independent reminders, view all renewals in a calendar, and open a verified official provider cancellation/account page.

## Critical invariant: independent schedules
Example: Spotify renews monthly on Jan 28; Apple Music renews monthly on Feb 15. Each has its own schedule, next date, interval, time zone, reminder offsets, and notification identity. A combined calendar displays both, but every event retains its subscription ID. Editing Spotify must never change Apple Music.

Use calendar-aware recurrence, not fixed 30/365-day arithmetic. Preserve month-end intent (Jan 31 → Feb 28/29 → Mar 31), define Feb 29 annual behaviour, and handle time zones/DST.

## Cancellation is only a handoff
Only use verified official HTTPS URLs in a maintained registry. Never guess or invent URLs. Validate exact allowed domains and redirects. Opening a page records an attempt only. On return, ask whether the user cancelled. Store user-reported cancellation separately from provider-verified cancellation. Explain that provider deadlines vary and opening a page does not guarantee cancellation or prevent a charge.

## Gmail
Optional official Google OAuth, minimum necessary scopes, never ask for passwords. Detected services are candidates; user must review, edit, confirm, or dismiss. Secure tokens, provide disconnect/deletion, and show an honest unconfigured state if credentials are missing.

## Design
Premium, calm, minimalist utility interface: white/near-white base, strong typography, whitespace, subtle borders, restrained olive accent. No gradients, neon, glassmorphism, blobs, AI-looking art, emoji icons, excessive shadows, or generic card piles. Follow `03_DESIGN_SYSTEM/`.

## Engineering
Separate UI/domain/data/integrations. Validate client and server. Use migrations. Keep secrets out of source control. Add loading, empty, error, offline, and permission-denied states. Test recurrence, schedule isolation, reminders, cancellation semantics, and API ownership. Do not claim untested features work.

Follow `BUILD_ORDER.md` in small phases. After each phase run formatters, static analysis, and tests; inspect phone/tablet UI; fix defects; report changed files, results, and risks. Begin with audit and plan, not a one-shot full-app generation.
