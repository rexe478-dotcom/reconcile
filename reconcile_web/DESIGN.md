# Reconcile Design System: The Sharp, Charming Financial Guardian
*Inspired by Duolingo personality, Linear precision, and Apple Human Interface ergonomics.*

---

## 1. Design Philosophy: "Human Craft Over AI Templates"

Most AI-generated websites share telltale flaws:
- Meaningless purple/blue blurred mesh gradients
- Robotic corporate buzzwords ("Elevate your workflow", "Seamless synergy", "Unlock power")
- Cookie-cutter cards with monotonous spacing and no optical weight
- Desktop-first layouts that break or feel clumsy on a phone screen
- Absence of real tactile feedback, micro-physics, or brand personality

**Reconcile is built by human craft**:
- **Tactile Materiality**: Authentic ivory paper surfaces, rich forest pine ink, warm stone borders, and subtle physical drop shadows.
- **Warm & Direct Human Voice**: Honest, conversational, witty copy. We speak plainly about money, surprise debits, and tricky subscription cancellations.
- **Living Mascot**: An iconic, expressive financial guardian owl (both 3D clay-render and 2D vector) with zero brand lettering inside the emblem.
- **Mobile-Native Ergonomics**: Bottom sheets with gesture handles, thumb-zone controls, and minimum 48px touch targets.

---

## 2. Color Palette & Materiality

| Token | Hex | Role | Usage |
|:---|:---|:---|:---|
| **Forest Olive** | `#3D5438` | Primary Brand Color | Primary action buttons, active states, brand badges |
| **Deep Pine** | `#263822` | Dark Accent | Button hover states, bold headings, focus rings |
| **Warm Linen** | `#FAF8F5` | Canvas Surface | Main page background, subtle card fills |
| **Linen Alt** | `#F3EFEA` | Secondary Surface | Inset panels, input fills, tab navigation bars |
| **Pure White** | `#FFFFFF` | Card & Sheet Ground | Foreground cards, modals, sheets |
| **Stone Border** | `#E5E0D8` | Structural Borders | 1px clean crisp outlines between components |
| **Amber Gold** | `#E9A824` / `#D97706` | Warning & Accent | Renewal countdown pills, attention tags, gold coin accents |
| **Soft Red** | `#DC2626` / `#FEF2F2` | Cancellation & Alert | Overdue alerts, delete actions, sign-out actions |
| **Charcoal Ink** | `#171717` | Primary Typography | Headers, financial amounts, active labels |
| **Muted Slate** | `#737373` | Secondary Typography | Billing intervals, notes, timestamps, helper text |

---

## 3. Typography & Optical Hierarchy

- **Primary Font**: `Plus Jakarta Sans` (Geometrical, modern, friendly)
- **Monospace / Digits**: `Inter` / tabular numerals for tabular prices and dates
- **Rule**: Every financial price MUST use bold weight (`font-black`) with the authentic `₦` symbol (or `$`, `€`, `£`) cleanly formatted with commas.

---

## 4. Anti-AI Copy Guidelines

| ❌ Banned Robotic AI Copy | ✅ Reconcile Human Voice |
|:---|:---|
| "Elevate your subscription tracking experience" | "Know what renews next — before your bank account gets hit." |
| "Unlock seamless synergy with our platform" | "Connect once. Track every subscription in one place." |
| "Effortlessly manage your cloud database connection" | "Your subscriptions are saved safely on this device." |
| "Leverage cutting-edge automated algorithms" | "We scan your email receipts so you don't have to type them." |
| "Click here to delve into your cancellation workflow" | "Cancel or manage your plan directly with the provider." |

---

## 5. Mobile Ergonomics & Viewport Rules

1. **Bottom Sheet Modals**: On screens `< 640px` (mobile phones), all modals MUST dock to the bottom of the viewport with `rounded-t-3xl`, a top drag handle pill, and full-width thumb actions.
2. **Thumb Zone Rule**: Key primary actions ("New Subscription", "Cancel", "Save") must sit within natural thumb reach.
3. **Safe Area Insets**: Always include clearance for the iOS home bar and camera notch (`env(safe-area-inset-bottom)`).
4. **No Horizontal Scroll Jitter**: Entire viewport must be constrained with `overflow-x-hidden`.

---

## 6. Emil Kowalski Spring Micro-Interactions

- **Buttons (`.btn-tactile`)**: `active:scale-[0.97] transition-all duration-150 ease-out`
- **Cards (`.card-lift`)**: `hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out`
- **Dialogs (`.spring-dialog`)**: `cubic-bezier(0.16, 1, 0.3, 1)` physics curves.