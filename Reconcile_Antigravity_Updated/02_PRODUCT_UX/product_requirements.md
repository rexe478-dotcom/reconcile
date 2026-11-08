# Product requirements
Purpose: help people track recurring subscriptions and avoid renewal surprises.

Core jobs: add/edit subscriptions; see expected renewal dates; set reminders; view a combined calendar; find official provider cancellation/account pages.

Subscription fields: provider/service, optional plan, optional amount/currency, interval unit/count, next expected renewal date/time, time zone, reminder offsets, optional category/notes, status, optional verified provider destination.

MVP: CRUD, independent schedules, upcoming list, calendar, local notifications, safe cancellation handoff, optional consent-based Gmail discovery, clear distinction between expected renewal and confirmed payment.

Out of scope: automatic cancellation, provider account control, guaranteed avoidance of charges, Gmail access without OAuth consent, bank/payment access.

Success: two subscriptions with different schedules can coexist; editing one cannot mutate the other; calendar displays both; reminders are deterministic; opening a cancellation page never marks a service cancelled.
