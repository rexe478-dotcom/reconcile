# Cancellation and provider links
Reconcile provides a shortcut to an official provider cancellation/account page; it does not cancel automatically.

Registry fields: provider key/name, destination URL/type, official source URL, verification status/date, allowed domains, region and billing-route notes.

Only enable destinations verified from the provider’s official website/help pages. Never guess URLs. Require HTTPS, exact allowed host validation, safe redirects, and reject unsafe schemes. If no verified destination exists, instruct user to visit the provider’s official website independently.

Flow: explain external handoff → user confirms → open page → record attempt only → on return ask if cancelled → store user report separately from provider verification.

Caution copy: “Opening the provider page does not cancel your subscription. Follow the provider’s instructions and check for confirmation. Deadlines and billing rules vary, so cancellation may not prevent a charge that is already due.”

Never show “Cancelled” just because a link opened.
