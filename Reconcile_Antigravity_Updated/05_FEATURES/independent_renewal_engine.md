# Independent renewal engine
Invariant: every subscription is its own recurrence stream; calendar is only a combined projection.

Inputs: subscription ID, local next renewal date, interval unit/count, time zone, optional local time, reminder offsets.

Use calendar arithmetic, not 30-day/365-day approximations. Monthly month-end example: Jan 31 → Feb 28/29 → Mar 31. Define annual Feb 29 policy. Convert local recurrence to UTC notification instants only after resolving local time/time zone.

Editing A recalculates A only, cancels/replaces A reminders only, and leaves B dates/occurrences/notifications untouched. Refresh the combined calendar projection.

Use “expected renewal”, not proof of payment. Test different dates/intervals/offsets, edit isolation, month-end, leap year, DST/time-zone changes, duplicate scheduling, pause/delete.
