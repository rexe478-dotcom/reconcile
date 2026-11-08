# Phase 3 — Renewal engine
Implement recurrence as a domain service independent of UI. Each subscription owns its schedule. Support calendar-aware recurrence, month-end anchoring, leap-year policy, time zones, and reminder offsets. Test that editing one subscription never mutates another. Never use fixed 30/365-day approximations.
