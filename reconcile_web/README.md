# Reconcile Web Application

A responsive, offline-first web version of **Reconcile** built with React, Vite, TypeScript, and Tailwind CSS.

Faithfully implements the exact 4-screen design system, theme tokens, and domain logic from the mobile reference design (`reconcile_ui_reference.jpg`) without guessing UI/UX or making external AI calls.

---

## Key Features

1. **True Responsive Web Layout**:
   - **Desktop (>= 1024px)**: Left sidebar navigation (`Overview`, `Subscriptions`, `Agenda`, `Settings`), top quick-search bar, multi-column dashboard grid.
   - **Tablet (768px – 1023px)**: Responsive 2-column layout.
   - **Mobile (< 768px)**: Bottom navigation bar matching the mobile app reference (`Home`, `Subscriptions`, `Saved`, `Profile`).

2. **Core Screens from Reference Design**:
   - **Screen 1 (Onboarding / Privacy Modal)**: Honest, consent-based explanation of OAuth requirements with zero raw email retention.
   - **Screen 2 (Overview / Home)**: Dynamic normalized monthly spend in Nigerian Naira (`₦`), "Next up" renewal card with live countdown, cadence ratio meter, and subscription list.
   - **Screen 3 (Subscriptions / Explore)**: Real-time search query filtering, status pills (*"Active"*, *"Needs review"*, *"Paused"*, *"Cancelled"*), and full CRUD creation.
   - **Screen 4 (Subscription Details & Handoff)**: Price & renewal banner, interactive reminder toggle switch, and verified HTTPS cancellation instructions with return confirmation.

3. **Gregorian Calendar Renewal Engine**:
   - Month-end anchor clamping (e.g., Jan 31 → Feb 28 in non-leap year → Mar 31).
   - Leap day retention policy (Feb 29 → Feb 28 → Feb 29).

4. **100% Offline & Isolated**:
   - Persists automatically to browser `localStorage`.
   - Complete JSON backup export.
   - Resides strictly in `reconcile_web/` and does not alter or affect `reconcile_app/` or `Reconcile.apk`.

---

## How to Run Locally

### 1. Development Mode (with Live Reload)
```bash
cd reconcile_web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Production Build
```bash
cd reconcile_web
npm run build
```
Generates production-optimized static HTML, CSS, and JS in `reconcile_web/dist/`.

### 3. Preview Production Build
```bash
cd reconcile_web
npm run preview
```
