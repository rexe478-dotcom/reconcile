# Testing strategy
Unit: monthly/month-end recurrence, leap-year policy, other intervals, DST/time-zone conversion, reminder offsets/IDs, subscription isolation, cancellation state distinctions.
Integration: CRUD, calendar event ownership, editing A leaves B unchanged, reminder rescheduling does not affect B, API ownership/validation, provider allowlist.
UI: onboarding, empty states, forms, calendar, details, cancellation, Gmail consent/review, permission denial.
Manual: small/large phones, tablet, large text, screen reader, offline, app restart, timezone change.
