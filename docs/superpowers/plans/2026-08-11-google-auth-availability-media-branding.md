# Google Auth, Availability, Media and Branding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Google-only authentication, a privacy-safe public calendar, visual apartment media controls, and text-only `Stan na dan` branding.

**Architecture:** Keep Auth.js, existing stay storage, FullCalendar-compatible reservation data, and Vercel Blob. Add focused client components for the public calendar and media editor while preserving the existing API payloads and server-side privacy boundary.

**Tech Stack:** Next.js 15 App Router, Auth.js v5, React 19, TypeScript, MUI, FullCalendar, Vercel Blob, Vitest, Playwright.

---

### Task 1: Google-only role enforcement

**Files:**

- Modify: `src/@auth/authJs.ts`
- Modify: `src/@auth/forms/AuthJsForm.tsx`
- Modify: `src/@auth/forms/AuthJsProviderSelect.tsx`
- Delete: `src/@auth/forms/AuthJsCredentialsSignInForm.tsx`
- Delete: `src/@auth/forms/AuthJsCredentialsSignUpForm.tsx`
- Modify: `.env.example`
- Test: `src/@auth/authJs.test.ts`

- [ ] Add tests asserting that the provider map contains Google only and that only the two fixed allowlisted emails resolve to `admin`.
- [ ] Export a small pure `resolveDefaultRoles(email)` helper and define the immutable allowlist:

```ts
export const ADMIN_EMAILS = new Set([
  "dragana.mlad018@gmail.com",
  "web.wise018@gmail.com",
]);
```

- [ ] Remove the Credentials provider and render a clear Google configuration error when OAuth variables are absent.
- [ ] Run `npx vitest run src/@auth/authJs.test.ts` and expect all auth tests to pass.

### Task 2: Public availability calendar

**Files:**

- Create: `src/components/site/availability/PublicAvailabilityCalendar.tsx`
- Create: `src/components/site/availability/PublicAvailabilityCalendar.module.css`
- Modify: `src/app/(public)/(site)/availability/page.tsx`
- Test: `src/components/site/availability/PublicAvailabilityCalendar.test.tsx`

- [ ] Add tests for apartment switching, unavailable date rendering, month navigation labels, and absence of guest PII.
- [ ] Pass only this public shape from the server page:

```ts
type PublicUnavailableRange = {
  id: string;
  apartmentId: string;
  start: string;
  end: string;
};
```

- [ ] Implement an accessible Monday-first month grid with previous/next month buttons, apartment tabs/select, neutral `Zauzeto` ranges, and mobile-safe cells.
- [ ] Keep the existing textual availability summary below the calendar as a non-JavaScript and screen-reader-friendly fallback.
- [ ] Run the focused Vitest file and verify no guest name, email, phone, notes, source or price reaches component props.

### Task 3: Visual apartment media editor

**Files:**

- Create: `src/app/(control-panel)/admin/apartments/ApartmentMediaEditor.tsx`
- Modify: `src/app/(control-panel)/admin/apartments/view.tsx`
- Test: `src/app/(control-panel)/admin/apartments/ApartmentMediaEditor.test.tsx`

- [ ] Test preview rendering, remove, move earlier/later, set cover, multi-file upload callback, and disabled controls during upload.
- [ ] Replace the gallery CSV input with an array-backed editor whose public contract is:

```ts
type ApartmentMediaEditorProps = {
  coverImage: string;
  gallery: string[];
  uploading: boolean;
  onUpload(files: FileList | null): void;
  onChange(value: { coverImage: string; gallery: string[] }): void;
};
```

- [ ] Preserve API fields by converting the editor array to the existing apartment payload at save time.
- [ ] Add 44px controls with Serbian accessible labels, previews, cover badge, ordering, removal, upload progress/error feedback and empty state.
- [ ] Run the focused component test.

### Task 4: Text-only branding

**Files:**

- Modify: `src/components/theme-layouts/components/Logo.tsx`
- Modify: `src/components/site/cinematic/CinematicHeader.tsx`
- Modify: auth page title components under `src/app/(public)/(auth)/components/ui/`
- Modify: remaining active layout navbar/toolbar components found by the logo asset scan
- Modify: `src/@auth/authJs.ts`

- [ ] Replace visible image elements used as logos with semantic text links/headings reading `Stan na dan`.
- [ ] Remove the Auth.js theme logo and keep document-only favicon/social metadata unchanged.
- [ ] Run `rg -n '/site-assets/images/logo|logo-icon|logo-black|logo-white' src --glob '*.tsx' --glob '*.ts'` and verify only document metadata references remain.

### Task 5: Verification and production delivery

**Files:**

- Modify: tests only if verification exposes a genuine regression.

- [ ] Run `npx tsc --noEmit --incremental false` and expect exit 0.
- [ ] Run `npm test -- --run` and expect the complete suite to pass.
- [ ] Run a production build with temporary non-production OAuth values and expect every route to compile.
- [ ] Verify `/sign-in`, `/availability`, and `/admin/apartments` at 390px and 1440px; assert no overflow, password fields, visible image logos, console errors, or failed first-party requests.
- [ ] Commit implementation changes and push `main` to `origin`, triggering the linked Vercel production deployment.
