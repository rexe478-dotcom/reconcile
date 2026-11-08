# API contract (illustrative)
- GET/POST `/api/v1/subscriptions`
- GET/PATCH/DELETE `/api/v1/subscriptions/{id}`
- GET `/api/v1/calendar?from=...&to=...`
- GET `/api/v1/providers`
- POST `/api/v1/subscriptions/{id}/cancellation-attempts`
- POST `/api/v1/subscriptions/{id}/cancellation-report`
- GET/PATCH `/api/v1/settings`
Require authentication for user data. Never trust client-supplied user_id. Return structured validation errors. Adapt naming to repository conventions.
