# Admin and Booking Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a custom responsive admin, a reliable apartment editor, and apartment-specific interactive booking calendars.

**Architecture:** Keep all existing server routes and domain types. Replace only the Fuse presentation shell, split apartment list/editor responsibilities, and introduce one reusable date-range calendar controlled by the booking form and the general availability page.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, CSS Modules, Zod, Auth.js, Vercel Blob, Vitest/Testing Library.

---

### Task 1: Custom admin shell

**Files:**
- Create: `src/components/admin/AdminShell.tsx`
- Create: `src/components/admin/AdminShell.module.css`
- Modify: `src/app/(control-panel)/layout.tsx`
- Modify: admin page/view wrappers under `src/app/(control-panel)/admin`

- [ ] Add route-aware navigation for dashboard, apartments, reservations, calendar, and channel sync.
- [ ] Preserve `AuthGuardRedirect auth={['admin']}` and replace `MainLayout`/Fuse with `AdminShell`.
- [ ] Add desktop sidebar plus compact mobile header/navigation without hover-only actions.
- [ ] Run targeted TypeScript and ESLint checks.

### Task 2: Reliable responsive apartment administration

**Files:**
- Modify: `src/app/(control-panel)/admin/apartments/view.tsx`
- Create: `src/app/(control-panel)/admin/apartments/ApartmentEditor.tsx`
- Create: `src/app/(control-panel)/admin/apartments/admin-apartments.module.css`
- Modify: `src/app/(control-panel)/admin/apartments/ApartmentMediaEditor.tsx`
- Test: `src/app/(control-panel)/admin/apartments/ApartmentEditor.test.tsx`

- [ ] Replace the table/dialog with responsive cards and a full-page create/edit editor.
- [ ] Reuse `apartmentSchema`, normalize comma decimals, validate before fetch, and render inline field errors.
- [ ] Parse the API's flattened Zod error response so a 400 explains the exact invalid field.
- [ ] Preserve Blob upload, cover/gallery ordering, delete confirmation, and refresh the edited card from the API response.
- [ ] Add mobile sticky save/cancel actions and remove the MUI dialog focus path.
- [ ] Run focused tests, TypeScript, and targeted ESLint.

### Task 3: Reusable interactive availability range

**Files:**
- Modify: `src/components/site/availability/calendar.ts`
- Create: `src/components/site/availability/AvailabilityRangeCalendar.tsx`
- Create: `src/components/site/availability/AvailabilityRangeCalendar.module.css`
- Test: `src/components/site/availability/AvailabilityRangeCalendar.test.tsx`

- [ ] Adapt the proven `minhen-smestaj` two-click exclusive-checkout range logic.
- [ ] Disable past/outside/unavailable days and reject any range crossing an unavailable night.
- [ ] Expose controlled `checkIn`/`checkOut` values and an accessible status message.
- [ ] Visually distinguish arrival, departure, selected range, today, unavailable, and outside-month cells.
- [ ] Run focused interaction tests.

### Task 4: Apartment-specific booking flow

**Files:**
- Modify: `src/app/(public)/(site)/apartments/[slug]/page.tsx`
- Modify: `src/components/site/booking/BookingRequestForm.tsx`
- Modify: `src/components/site/booking/BookingRequestForm.module.css`

- [ ] Load only the selected apartment's public reservation/block ranges on its detail page.
- [ ] Place the interactive calendar inside that apartment's booking panel and synchronize its values with accessible date inputs.
- [ ] Preserve `/api/stay/reservations`, direct source, pending status, price calculation, and guest fields.
- [ ] Reject submission when dates are missing, reversed, or conflict with unavailable ranges.
- [ ] Keep the booking area bounded on desktop and stacked without clipping on mobile.

### Task 5: General availability redesign

**Files:**
- Modify: `src/components/site/availability/PublicAvailabilityCalendar.tsx`
- Modify: `src/components/site/availability/PublicAvailabilityCalendar.module.css`
- Modify: `src/app/(public)/(site)/availability/page.tsx`
- Test: `src/components/site/availability/PublicAvailabilityCalendar.test.tsx`

- [ ] Reuse `AvailabilityRangeCalendar` with an apartment selector.
- [ ] Cap desktop width/height and keep touch-friendly mobile sizing.
- [ ] After a valid range, link to `/apartments/{slug}?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD#booking`.
- [ ] Keep public output limited to neutral availability state and dates.

### Task 6: Verification and production

**Files:**
- Modify only files required by verification fixes.

- [ ] Run focused Vitest suites, `npx tsc --noEmit --incremental false`, targeted ESLint, and `git diff --check`.
- [ ] Verify `/admin/apartments`, an apartment detail, and `/availability` at desktop and 390 px with the local server.
- [ ] Confirm edit failure messages, date selection visuals, blocked-range rejection, and absence of horizontal overflow/focus warnings.
- [ ] Commit the completed redesign and push `main`; verify the Vercel production deployment and core production URLs.

