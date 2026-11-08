# Build order
0. Audit repository and propose file-level plan; no destructive edits.
1. Foundation: app structure, theme, routing, components, lint, tests; confirm launch.
2. Core UI: onboarding, home, subscriptions, add/edit, details, calendar, settings using labelled demo data.
3. Renewal engine: independent schedules and calendar-aware recurrence; unit tests first.
4. Persistence/API: local storage and FastAPI/PostgreSQL as appropriate; migrations, validation, ownership.
5. Calendar/notifications: per-subscription occurrences and stable reminder IDs.
6. Cancellation handoff: verified provider registry, URL validation, return follow-up.
7. Gmail: official OAuth only after configuration; candidate review and privacy controls.
8. Insights and polish: accessibility, responsive layouts, honest renewal language.
9. QA/release: full tests, privacy review, build verification.
Stop and document missing OAuth credentials, provider URLs, signing credentials, or deployment secrets. Never guess.
