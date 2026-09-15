# Financial Analytics Dashboard — Implementation Tasks

## Task 1: Fix Profile Image Handling — Create Reusable UserAvatar Utility

**Priority:** high
**Status:** pending
**Acceptance Criteria:** AC-FR1, AC-FR2

### Description
The current code wires `user_profile` into Avatar `src` but lacks explicit `onError` handling. Create a small reusable `<UserAvatar>` component (or enhance `userProfile.ts` utility) that:
- Takes `user_profile`, `user_id`, optional size, and color
- Sets `src={user_profile || undefined}`
- Passes `imgProps={{ onError }}` that clears the failed `src` so MUI falls back to children
- Uses `getAvatarFallback()` for text content
- Applies user-specific background color from a consistent map

### Test Requirements (TR)
- **rule**: `Transactions.tsx` User column renders `<UserAvatar src={row.user_profile} userId={row.user_id} />` — the src value is exactly the API field, no transformations.
- **rule**: `RecentTransactions.tsx` uses the same `<UserAvatar>` component with its row data.
- **rule**: If an invalid URL (e.g., a page returning HTML) is passed, the avatar shows only the fallback text + colored background, no broken-image icon appears.
- **rubric**: Avatar fallback clarity (0-2):
  - 2: Fallback shows initials/number clearly, user_id label remains visible beside it, consistent sizing.
  - 1: Fallback works but sizing/colors are inconsistent.
  - 0: Fallback still shows broken image icon or user_id label is hidden.
  - Pass threshold: ≥ 1.

### Files to Change
- `frontend/src/utils/userProfile.ts` (enhance or add helper hook/component)
- `frontend/src/components/` — create a new small `UserAvatar.tsx` component if appropriate
- `frontend/src/pages/Transactions.tsx` — replace inline Avatar with UserAvatar
- `frontend/src/components/RecentTransactions.tsx` — replace inline Avatar with UserAvatar

---

## Task 2: Dark Theme Foundation — Global CSS, Tailwind, and MUI Theme

**Priority:** high
**Status:** pending
**Acceptance Criteria:** AC-NFR1, AC-NFR11

### Description
Establish the dark fintech foundation:
- Update `index.css`: dark navy/charcoal body background, consistent text color CSS variables
- Update `tailwind.config.js`: extend with dark palette tokens (bg-navy, bg-card, text-primary, text-secondary, accent-green, accent-red, accent-blue, border-subtle)
- Optionally create a light MUI `ThemeProvider` override at the root level to match the dark palette (for inputs, tables, etc.) OR use component-level `sx` + `className` targeting.
- Ensure `body` background and main shell use dark colors instead of `#f5f7fb`.

### Test Requirements (TR)
- **rule**: Body/html background after login is dark (not white/light-blue).
- **rule**: Default text color is light gray/white, not dark slate.
- **rule**: Tailwind build includes the new color tokens and does not error.
- **rubric**: Theme consistency (0-2):
  - 2: All major surfaces (sidebar, header, cards, table, modal) match the shared dark palette. No stray light backgrounds visible after login.
  - 1: One or two surfaces (e.g., modal) still light but readable.
  - 0: Mixed light/dark causing unreadable text.
  - Pass threshold: ≥ 1.

### Files to Change
- `frontend/src/index.css`
- `frontend/tailwind.config.js`
- `frontend/src/App.tsx` (if adding ThemeProvider wrapper)

---

## Task 3: Redesign AppLayout — Sidebar + Top Header

**Priority:** high
**Status:** pending
**Acceptance Criteria:** AC-NFR2, AC-NFR3, AC-NFR4, AC-NFR9

### Description
Transform `AppLayout.tsx`:
- **Sidebar**: Dark background, logo/brand block at top (matching reference "Penta" style but keep our name), active nav item with left accent bar + bold text + subtle colored background, hover state, mobile drawer works.
- **Top Header**: Dark, subtle border-bottom, page title area, live-indicator or equivalent can stay but dark-styled, user avatar or account circle, account menu, logout.
- **Main content area**: Use dark navy background, content padding intact.

### Test Requirements (TR)
- **rule**: Active navigation item visually stands out (background + bold + color accent) for both Dashboard and Transactions.
- **rule**: Clicking a nav item navigates correctly and closes the mobile drawer.
- **rule**: User account menu opens and "Sign Out" triggers logout flow.
- **rule**: On `<768px`, sidebar uses temporary Drawer and hamburger is visible.
- **rubric**: Sidebar/header visual polish (0-2):
  - 2: Brand block, nav icons, spacing, active state, and header user area all look professionally styled and match reference direction.
  - 1: Functional styling present but lacks refinement in one area.
  - 0: Nav state broken or header/sidebar still looks like default light MUI.
  - Pass threshold: ≥ 1.

### Files to Change
- `frontend/src/components/AppLayout.tsx`

---

## Task 4: Redesign Dashboard Page

**Priority:** high
**Status:** pending
**Acceptance Criteria:** AC-NFR1, AC-NFR2, AC-NFR5, AC-FR3

### Description
Upgrade `Dashboard.tsx` presentation:
- Dark filter card matching the new palette
- Metric cards area: keep 2x2 grid but dark-styled MetricCard
- Chart containers: dark Paper/cards
- Recent Transactions section: dark card

Keep all dashboard logic (filters, loadAll, Promise.allSettled, error handling, skeletons) intact.

### Test Requirements (TR)
- **rule**: Apply/Reset filter buttons work exactly as before (state transitions, API calls).
- **rule**: All four metric values + sub-value labels still render from API data.
- **rule**: Refresh button still triggers `loadAll` and shows success/error snackbar.
- **rubric**: Dashboard visual quality (0-2):
  - 2: Filter card, 4 metric cards, two charts, and recent transactions section are all visually consistent with the dark theme and feel cohesive. Card spacing is generous.
  - 1: Dashboard is dark but one section looks inconsistent.
  - 0: Dashboard is still light-themed or components visually clash.
  - Pass threshold: ≥ 1.

### Files to Change
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/components/MetricCard.tsx` (redesign for dark theme, same VARIANT_CONFIG structure but dark backgrounds + accent colors)

---

## Task 5: Redesign Charts (Revenue/Expense + Category Breakdown)

**Priority:** medium
**Status:** pending
**Acceptance Criteria:** AC-NFR6

### Description
Update both chart components to fit the dark theme:
- Chart container title/subtitle text colors
- Grid line colors (subtle dark lines)
- Axis tick colors (light gray)
- Tooltip background/border (dark card style)
- Legend text colors
- Pie chart cell stroke if needed for separation
- Keep Recharts data props untouched — only visual/container props.

### Test Requirements (TR)
- **rule**: Both charts render with real data, no changes to `data={...}` or dataKey values.
- **rule**: Empty-state and loading-skeleton states still appear when appropriate.
- **rubric**: Chart readability on dark (0-2):
  - 2: Grid, axes, tooltips, and legends contrast clearly. Green/red lines remain Revenue=green Expense=red. Empty states visually match cards.
  - 1: Readable but one element (tooltip or grid) blends slightly.
  - 0: Text/lines are illegible against dark background.
  - Pass threshold: ≥ 1.

### Files to Change
- `frontend/src/charts/RevenueExpenseChart.tsx`
- `frontend/src/charts/CategoryBreakdownChart.tsx`

---

## Task 6: Redesign RecentTransactions Component

**Priority:** medium
**Status:** pending
**Acceptance Criteria:** AC-FR1, AC-FR2, AC-NFR7

### Description
Make RecentTransactions match the dark fintech list style:
- Dark list rows, subtle divider color
- Use the new UserAvatar component (from Task 1)
- Keep existing Chip and amount color logic, update container text colors
- Keep loading skeleton and empty state; update their background/text to dark

### Test Requirements (TR)
- **rule**: UserAvatar in RecentTransactions passes through exact `user_profile` value.
- **rule**: All 5 recent rows show user_id, date, category chip, status chip, amount with +/- sign.
- **rubric**: Recent list visual polish (0-2):
  - 2: Avatar + text layout aligned, chips consistent, hover feedback subtle, dividers match reference direction.
  - 1: Works but one visual element is inconsistent.
  - 0: List rows break or text unreadable.
  - Pass threshold: ≥ 1.

### Files to Change
- `frontend/src/components/RecentTransactions.tsx`

---

## Task 7: Redesign Transactions Page

**Priority:** high
**Status:** pending
**Acceptance Criteria:** AC-FR1, AC-FR2, AC-FR3, AC-NFR7, AC-NFR8, AC-NFR9

### Description
Transform the Transactions page:
- **Filters card**: Dark compact card, grid layout intact, all 8 filter fields + Apply/Reset.
- **Alert/Error banners**: Dark-friendly severity colors.
- **Table container**: Dark card, sticky headers or at minimum clearly differentiated header row.
- **Table rows**: Dark row background, hover state, UserAvatar column, status/category chips styled for dark, amount +/- green/red.
- **Pagination**: Dark container, MUI Pagination styled for dark.
- **Top header**: Page title + subtitle dark-colored, Refresh and Export CSV buttons styled consistently.
- Keep all filter/sort/pagination state machine logic untouched.

### Test Requirements (TR)
- **rule**: All 7 filters + search submit via `buildParams` and produce the same API query strings as before.
- **rule**: Column sort toggle order (asc→desc→asc) preserved for all 6 sortable fields.
- **rule**: Pagination page changes and per-page select still call `loadTransactions` correctly.
- **rule**: Clear Filters button on empty state still calls `handleReset`.
- **rule**: UserAvatar in Transactions table passes exact `user_profile` value through.
- **rubric**: Transaction table polish (0-2):
  - 2: Table has clear header, zebra or clear row separation, clean chips, readable amounts, avatar aligned, horizontal scroll works on mobile, pagination centered on small screens.
  - 1: Functional but minimal visual differentiation between header/body rows.
  - 0: Overflow broken or text/chips unreadable.
  - Pass threshold: ≥ 1.
- **rubric**: Filter area organization (0-2):
  - 2: 2-row 4-column grid on desktop collapses gracefully to 2-col on tablet and 1-col on mobile; Apply/Reset clearly visible next to "Active" chip.
  - 1: Works but one breakpoint has awkward wrapping.
  - 0: Filters overflow their container.
  - Pass threshold: ≥ 1.

### Files to Change
- `frontend/src/pages/Transactions.tsx`

---

## Task 8: Style ExportCsvDialog + Login Page

**Priority:** medium
**Status:** pending
**Acceptance Criteria:** AC-NFR1, AC-FR3

### Description
Apply dark theme to remaining UI surfaces:
- **ExportCsvDialog**: Dark dialog container, column checkboxes dark, Cancel/Export buttons styled consistently with theme. DO NOT alter export call logic or column list.
- **Login page**: Dark-styled hero card (matching the fintech dark aesthetic), keep form schema, validation, and auth flow unchanged.

### Test Requirements (TR)
- **rule**: Clicking "Export CSV" from Transactions opens dialog, selecting columns and clicking Export still calls `transactionService.exportCsv` with the same arguments.
- **rule**: Login form validation and submit flow continue to use the existing `loginSchema` and `useAuth().login`.
- **rubric**: Login + export dialog visual match (0-2):
  - 2: Both surfaces feel cohesive with the rest of the dark product, inputs readable, buttons match accent style.
  - 1: One surface looks good, the other is only partially styled.
  - 0: One or both still use the default light MUI look and clash.
  - Pass threshold: ≥ 1.

### Files to Change
- `frontend/src/components/ExportCsvDialog.tsx`
- `frontend/src/pages/Login.tsx`

---

## Task 9: Functional + Build Verification

**Priority:** high
**Status:** pending
**Acceptance Criteria:** AC-FR3, AC-NFR9, AC-NFR10, AC-NFR11

### Description
Run the full verification checklist and record results:

1. Start backend, start frontend.
2. Functional checklist items 1-18 from the user request.
3. UI checklist items 19-29 visually inspected at 4 breakpoints.
4. Build: frontend `npm run build` + backend `tsc` (if backend changed).
5. Record any remaining issues explicitly.

Do not alter code in this task except to fix *new* issues discovered during verification that were not present before this implementation cycle.

### Test Requirements (TR)
- **rule**: Frontend build completes with zero TS errors.
- **rule**: Backend build (if backend files were touched) completes with zero TS errors.
- **rule**: Manual functional run-through: Login → Dashboard metrics load → Navigate to Transactions → Search filter → Category filter → Status filter → User filter → Date range → Amount range → Sort any column → Change page → Change per-page → Click Clear filters → Click Export CSV dialog → Cancel → Export CSV confirm → Logout. Every step must succeed.
- **rule**: Profile image URLs from sample data (`https://thispersondoesnotexist.com/`) are passed to Avatar src; fallback avatars are visible because the URLs fail. No browser console error produced from UserAvatar beyond expected img load failure.
- **rubric**: Responsive verification (0-2):
  - 2: Desktop, laptop, tablet, mobile widths all checked. No horizontal body overflow. Table scrolls horizontally only.
  - 1: One minor breakpoint issue (padding, small component overflow) that does not break usability.
  - 0: Clear layout breakage on two or more widths.
  - Pass threshold: ≥ 1.

### Files to Change
- (read-only verification; add build-result notes to the final summary only)
