# Data model
User: id, email if applicable, created_at, preferred_time_zone, locale.
Subscription: id, user_id, provider_name, plan_name?, amount?, currency?, interval_unit/count, next_renewal_local_date, renewal_local_time?, time_zone, reminder_offsets, status, notes?, provider_destination_id?, timestamps.
Renewal occurrence: id, subscription_id, expected_renewal_at, time_zone, occurrence_key.
Reminder: id, subscription_id, occurrence_key, reminder_offset, scheduled_at_utc, notification_id, status. Unique identity includes subscription + occurrence + offset.
Provider destination: provider key/name, URL, destination type, official source URL, verification status/date, allowed domains, region/plan notes.
Cancellation attempt: subscription_id, destination_id, attempted_at, user_reported_outcome, reported_at, provider_verified_at?.
Gmail candidate: user_id, provider guess, minimal evidence, detected_at, status, protected minimal message reference.
Add foreign keys, indexes, ownership checks. Preserve local date/time and time zone alongside instants.
