# Financial Analytics Dashboard — Specification

## Problem

The existing Financial Analytics Dashboard has two areas of work:

1. **Functional Bug**: User profile images are not displaying correctly on the Transactions page and Dashboard Recent Transactions. The transaction data contains a `user_profile` field with URLs stored in MongoDB, but the frontend is not reliably rendering them.
2. **UI Enhancement**: The current application uses a light theme and needs to be visually upgraded to a modern, professional dark fintech dashboard aesthetic matching the reference design direction.

## Users

- Internal financial analysts using the dashboard to review and export transaction records.

## Goals

### Part 1 — Profile Image Fix (Highest Priority)
- Render the exact `user_profile` URL returned by `/api/transactions` and the Recent Transactions API.
- Each user must use their own unique database-stored profile image URL (no hard-coded mapping, no common image, no fake URLs).
- If an image URL fails to load (returns HTML, 404, CORS, etc.), show a clean text-based fallback avatar with the user identifier visible — never silently replace with another image.

### Part 2 — UI Enhancement
- Transform the entire application shell (Sidebar, Header, Dashboard, Transactions, Login) into a cohesive dark fintech theme inspired by the reference screenshot.
- Keep all existing functionality intact: JWT auth, dashboard metrics, charts, filters, sorting, pagination, CSV export.

## Non-Goals

- Do not modify MongoDB data or `transactions.json`.
- Do not add new features (CRUD, registration, wallet, messaging, fake users/notifications).
- Do not rewrite or change CSV export behavior (only button/dialog styling).
- Do not replace real API data with fake chart/metric values from the reference.
- Do not remove any existing filter, route, or navigation item.

## Functional Requirements

### FR1 — Profile Image Data Integrity
- `rule`: Frontend Avatar `src` must be set to the exact `user_profile` string value from the API response for every transaction row.
- `rule`: No file shall contain hard-coded image URLs mapped to `user_id` values.
- `rule`: The value of `user_profile` shall flow unmodified from MongoDB → Transaction Model → Controller/Service → API JSON → Frontend Transaction type → Avatar src.

### FR2 — Profile Image Fallback Behavior
- `rule`: When an avatar image fails to load (via `onError`), the Avatar must render the fallback text content (user identifier) without showing a broken image icon.
- `rule`: The fallback avatar must remain visible with the `user_id` label next to it; never hide the user identifier.

### FR3 — Existing Functionality Preservation
- `rule`: Login, logout, and protected routes continue to work with the existing JWT flow.
- `rule`: All four dashboard metrics (Balance, Total Revenue, Total Expenses, Savings) continue to use real API values.
- `rule`: INR currency formatting via `formatCurrencyINR` continues to be used everywhere amounts are displayed.
- `rule`: Every existing Transactions filter (search, category, status, user, startDate, endDate, minAmount, maxAmount), sort, pagination, and CSV export feature works exactly as before.
- `rule`: CSV export produces the same columns and data as before for both full and filtered exports.

## Non-Functional Requirements

### NFR1 — Dark Fintech Theme
- `rubric`: The overall aesthetic (0-2) looks like a professional financial analytics product:
  - `2`: Consistent dark navy/charcoal backgrounds, lighter dark cards, clean white/light-gray typography, restrained use of green for positive and red for negative, subtle blue accents, rounded cards, subtle borders, minimal gradients.
  - `1`: Mostly dark but inconsistent across components or one section remains light.
  - `0`: Still light theme or clashing/garish colors.
  - Pass threshold: ≥ 1.

### NFR2 — Layout Hierarchy & Spacing
- `rubric`: Layout quality (0-2):
  - `2`: Clear visual hierarchy between Sidebar / Top Bar / Content. Metric cards are evenly spaced with consistent padding. Charts and tables breathe. No awkward gaps or cramped components.
  - `1`: Functional but some spacing irregularities.
  - `0`: Overlapping, broken, or clearly misaligned sections.
  - Pass threshold: ≥ 1.

### NFR3 — Sidebar & Navigation
- `rubric`: Navigation polish (0-2):
  - `2`: Clear active state (colored bar/text + background change), proper icons, hover feedback, logo/branding, consistent typography, mobile drawer works.
  - `1`: Active state works but styling underwhelming.
  - `0`: No visual active state or navigation feels broken.
  - Pass threshold: ≥ 1.

### NFR4 — Top Header
- `rubric`: Header polish (0-2):
  - `2`: Clear page title, user info with avatar, logout access via menu, mobile-friendly, matches dark theme.
  - `1`: Basic header present but lacks polish.
  - `0`: Missing user info, broken menu, or light-themed header mismatch.
  - Pass threshold: ≥ 1.

### NFR5 — Metric Cards
- `rubric`: Metric card quality (0-2):
  - `2`: Four cards (Balance/Revenue/Expenses/Savings) look consistent, each has distinct icon + visual accent color matching its variant, INR formatting, loading skeletons still work.
  - `1`: Cards work but one or more variants look inconsistent.
  - `0`: Cards broken, illegible, or still light-themed.
  - Pass threshold: ≥ 1.

### NFR6 — Charts
- `rubric`: Chart visual cohesion (0-2):
  - `2`: Revenue/Expense area chart and Category Breakdown pie chart use dark-grid lines, readable labels, proper tooltip/legend styling, colors aligned with green=Revenue red=Expense theme, containers match card style.
  - `1`: Charts render but grid/labels clash with dark background.
  - `0`: Charts unreadable or still light-only.
  - Pass threshold: ≥ 1.

### NFR7 — Transaction Table
- `rubric`: Table polish (0-2):
  - `2`: Dark table container, clear sticky headers, row hover state, properly styled status/category chips, green/red amount distinction, avatar visible, pagination styled, horizontal scroll on small screens works.
  - `1`: Table readable but minimal styling.
  - `0`: Table text unreadable or filters/table overflow broken.
  - Pass threshold: ≥ 1.

### NFR8 — Filter Area
- `rubric`: Filter UX (0-2):
  - `2`: Filters visually organized in a compact card, MUI inputs match dark theme, Apply/Reset buttons clearly visible, "Active" indicator when filters are applied, responsive grid does not break on tablet/mobile.
  - `1`: Filters work but layout is awkward on one breakpoint.
  - `0`: Filters overflow, inputs unreadable, or Apply/Reset missing.
  - Pass threshold: ≥ 1.

### NFR9 — Responsive Design
- `rule`: The application renders without horizontal overflow on desktop (≥1280px), laptop (1024px), tablet (768px), and mobile (375px) widths. Transaction table uses a scrollable container so rows do not force body overflow.
- `rubric`: Responsive quality (0-2):
  - `2`: All four breakpoints look clean; sidebar drawer toggles on mobile; filter grid wraps; charts reflow; pagination centers on small screens.
  - `1`: One breakpoint has minor layout issues but nothing is broken.
  - `0`: Two or more breakpoints have broken layout.
  - Pass threshold: ≥ 1.

### NFR10 — Accessibility Basics
- `rule`: Avatar images have meaningful `alt` attributes (e.g., "{user_id} profile").
- `rule`: Buttons and IconButtons have `aria-label` where text is not visible.
- `rule`: MUI Dialog and Menu components remain keyboard-dismissible.

### NFR11 — Build Quality
- `rule`: Frontend `npm run build` (tsc + vite build) completes with zero errors.
- `rule`: Backend TypeScript build succeeds if backend code is modified.
- `rule`: No new browser console errors appear on normal navigation (login → dashboard → transactions → logout).

## Constraints, Dependencies, Assumptions

### Constraints
- Do not modify `backend/sample-data/transactions.json` or any MongoDB document directly.
- Do not modify the CSV export service logic; only style the Export CSV dialog button.
- Continue using MUI for interactive controls (buttons, inputs, tables, dialogs, pagination, chips, avatars) and Tailwind for layout/spacing.

### Dependencies
- Existing stack: React 19, React Router 7, MUI 9, Recharts 3, Tailwind 3, TypeScript, Node/Express backend with Mongoose.

### Assumptions
- The sample data URL `https://thispersondoesnotexist.com/` is understood to be an HTML page, not a direct image. Per requirements we still pass it through as `src` and rely on the fallback avatar when it fails.
- Environment variables (.env) for MongoDB, JWT secrets, and credentials are already configured correctly from prior sessions.

## Open Questions
- None at specification time; data flow inspected and confirmed.
