# Cinematic Public Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the template-like public experience with a seven-scene, cinematic, scroll-directed hospitality site while preserving the current reservation, authentication, admin, store, and API behavior.

**Architecture:** Keep data loading in existing async server pages and normalize it into small presentation models under `src/lib/site`. Render complete semantic HTML first, then progressively enhance focused client components with GSAP/ScrollTrigger. Load Lenis and the isolated Three.js transition only on capable desktop devices; mobile, reduced-motion, data-saver, and failed-WebGL paths stay native and static. Scope all new styling to the public surface with CSS Modules plus a small token/reset layer so the admin theme remains untouched.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, CSS Modules, GSAP + ScrollTrigger, Lenis, Three.js, Next Image, Vitest + Testing Library, Playwright + axe-core, Sharp media preparation.

---

## Context and non-negotiable boundaries

The approved design is in `docs/superpowers/specs/2026-08-10-cinematic-public-redesign-design.md`. Read it before changing code.

This plan covers only the public visual redesign:

- `/`, `/apartments`, `/apartments/[slug]`, `/availability`, `/contact`, `/account`, and `/sign-in`.
- Shared public header, fullscreen menu, footer, motion runtime, responsive behavior, guest-facing copy, and media optimization.
- Visual and accessibility improvements to the existing booking form without changing its endpoint, payload, pricing calculation, or submission behavior.

This plan does not cover booking logic, Google OAuth configuration, authorization rules, admin features, database work, Booking.com synchronization, payments, email, deployment, domain setup, or production security. Do not edit API routes, admin routes, `src/lib/stay/store.ts`, or `src/@auth/authJs.ts` while executing this plan.

The worktree already contains unrelated user changes. Before every commit, inspect `git status --short` and stage only the paths named by the current task. Never reset or reformat unrelated files.

## Target public file structure

```text
src/
  app/(public)/(site)/
    layout.tsx
    page.tsx
    site-globals.css
    apartments/page.tsx
    apartments/[slug]/page.tsx
    availability/page.tsx
    contact/page.tsx
    account/page.tsx
  app/(public)/(auth)/
    layout.tsx
    auth-public.css
    components/views/SignInPageView.tsx
  components/site/
    booking/BookingEntry.tsx
    booking/BookingRequestForm.tsx
    cinematic/ApartmentChapters.tsx
    cinematic/EditorialApartmentIndex.tsx
    cinematic/EditorialGallery.tsx
    cinematic/HeroSequence.tsx
    cinematic/HeroTransitionCanvas.tsx
    cinematic/LocationStory.tsx
    cinematic/MaterialDetails.tsx
    cinematic/ReviewSequence.tsx
    cinematic/ScrollProgress.tsx
    cinematic/SiteFooter.tsx
    cinematic/CinematicHeader.tsx
    motion/MotionProvider.tsx
    motion/capabilities.ts
    motion/useCinematicScene.ts
    shared/EditorialPageIntro.tsx
  lib/site/
    media.ts
    presentation.ts
    types.ts
scripts/
  prepare-cinematic-media.mjs
  check-cinematic-budget.mjs
tests/e2e/
  public-navigation.spec.ts
  public-responsive.spec.ts
  public-accessibility.spec.ts
  public-visual-checkpoints.spec.ts
```

Each component receives plain serializable props. No cinematic component may call `readStayData`, `fetch`, mutate reservations, or infer authentication state.

## Task 1: Establish the redesign test and motion toolchain

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/environment.test.ts`
- Create: `playwright.config.ts`
- Modify: `.gitignore`

- [ ] Record the baseline without changing it:

  ```powershell
  git status --short
  npm run build
  npm run lint
  ```

  Expected: build succeeds. Lint reports no errors; existing warnings are recorded and are not expanded by this redesign.

- [ ] Install runtime dependencies with package imports rather than legacy files from `public/site-assets/js`:

  ```powershell
  npm install gsap lenis three
  npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test @axe-core/playwright sharp
  ```

- [ ] Add exact scripts to `package.json` while preserving all existing scripts:

  ```json
  {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "media:prepare": "node scripts/prepare-cinematic-media.mjs",
    "media:budget": "node scripts/check-cinematic-budget.mjs"
  }
  ```

- [ ] Create `vitest.config.ts` with the same alias semantics as the app:

  ```ts
  import { fileURLToPath } from 'node:url';
  import react from '@vitejs/plugin-react';
  import { defineConfig } from 'vitest/config';

  export default defineConfig({
    plugins: [react()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: true
    }
  });
  ```

- [ ] Create `src/test/setup.ts` with `@testing-library/jest-dom/vitest`, deterministic `matchMedia`, `ResizeObserver`, and `IntersectionObserver` stubs. Export `setMediaQuery(matches: boolean)` so motion tests can explicitly choose desktop/reduced-motion conditions.

- [ ] Write `src/test/environment.test.ts` first. Assert that `window.matchMedia`, `ResizeObserver`, and `IntersectionObserver` exist and that `setMediaQuery(true)` returns `matches: true`.

- [ ] Run the test and confirm it passes:

  ```powershell
  npm test -- src/test/environment.test.ts
  ```

  Expected: one file and all assertions pass.

- [ ] Create `playwright.config.ts`:

  ```ts
  import { defineConfig, devices } from '@playwright/test';

  export default defineConfig({
    testDir: './tests/e2e',
    outputDir: './test-results/playwright',
    use: {
      baseURL: 'http://127.0.0.1:3100',
      trace: 'retain-on-failure',
      screenshot: 'only-on-failure'
    },
    webServer: {
      command: 'npm run dev -- --hostname 127.0.0.1 --port 3100',
      url: 'http://127.0.0.1:3100',
      reuseExistingServer: !process.env.CI,
      env: { AUTH_SECRET: 'cinematic-redesign-e2e-secret' }
    },
    projects: [
      { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], browserName: 'chromium' } },
      { name: 'chromium-mobile', use: { ...devices['iPhone 13'], browserName: 'chromium' } }
    ]
  });
  ```

- [ ] Add `/test-results/` and `/playwright-report/` to `.gitignore` without changing existing entries.

- [ ] Commit only toolchain paths:

  ```powershell
  git add package.json package-lock.json vitest.config.ts playwright.config.ts src/test/setup.ts src/test/environment.test.ts .gitignore
  git commit -m "test: add public redesign verification harness"
  ```

## Task 2: Prepare real photography for the performance budget

**Files:**

- Create: `scripts/prepare-cinematic-media.mjs`
- Create: `scripts/check-cinematic-budget.mjs`
- Create: `src/lib/site/media.ts`
- Create: `src/lib/site/media.test.ts`
- Create generated files under: `public/site-assets/images/cinematic/`

- [ ] Write `src/lib/site/media.test.ts` first. Assert that every media item has non-empty `mobile`, `desktop`, `alt`, numeric `width`, numeric `height`, and that `hero.mobile` differs from `hero.desktop` so the opening crop is intentionally authored per viewport.

- [ ] Run the new test and see it fail because `src/lib/site/media.ts` does not exist:

  ```powershell
  npm test -- src/lib/site/media.test.ts
  ```

  Expected: module resolution failure.

- [ ] Implement `src/lib/site/media.ts` with a typed immutable manifest:

  ```ts
  export type CinematicMedia = {
    mobile: string;
    desktop: string;
    alt: string;
    width: number;
    height: number;
  };

  export const cinematicMedia = {
    hero: {
      mobile: '/site-assets/images/cinematic/hero-main-720.webp',
      desktop: '/site-assets/images/cinematic/kitchen-tv-1920.webp',
      alt: 'Toplo osvetljen enterijer apartmana u Nišu',
      width: 1920,
      height: 1440
    },
    kitchen: {
      mobile: '/site-assets/images/cinematic/kitchen-tv-960.webp',
      desktop: '/site-assets/images/cinematic/kitchen-tv-1920.webp',
      alt: 'Kuhinja i dnevni prostor apartmana',
      width: 1920,
      height: 1440
    },
    living: {
      mobile: '/site-assets/images/cinematic/living-room-720.webp',
      desktop: '/site-assets/images/cinematic/living-room-1280.webp',
      alt: 'Dnevni boravak sa dubokim plavim svetlom',
      width: 1280,
      height: 1707
    },
    studio: {
      mobile: '/site-assets/images/cinematic/studio-vertical-720.webp',
      desktop: '/site-assets/images/cinematic/studio-vertical-1600.webp',
      alt: 'Studio apartman sa radnim i spavaćim prostorom',
      width: 1600,
      height: 1200
    }
  } as const satisfies Record<string, CinematicMedia>;
  ```

- [ ] Create `scripts/prepare-cinematic-media.mjs`. Use Sharp with `rotate()`, `resize({ width, withoutEnlargement: true })`, and `webp({ quality: 78, effort: 5 })`. Produce exactly these files from the existing four real images:

  ```text
  hero-main-720.webp
  hero-main-1280.webp
  kitchen-tv-960.webp
  kitchen-tv-1920.webp
  living-room-720.webp
  living-room-1280.webp
  studio-vertical-720.webp
  studio-vertical-1600.webp
  ```

  The script must create `public/site-assets/images/cinematic` if missing and overwrite only these generated files.

- [ ] Create `scripts/check-cinematic-budget.mjs`. It must fail when:

  - `hero-main-720.webp` exceeds 800 KB.
  - `kitchen-tv-1920.webp` exceeds 1.5 MB.
  - Any manifest file is missing.
  - The combined first-scene mobile candidates exceed 800 KB.

- [ ] Generate and verify the assets:

  ```powershell
  npm run media:prepare
  npm run media:budget
  npm test -- src/lib/site/media.test.ts
  ```

  Expected: all eight files exist, budget script exits 0, media test passes.

- [ ] Commit only the media pipeline, manifest, test, and generated outputs:

  ```powershell
  git add scripts/prepare-cinematic-media.mjs scripts/check-cinematic-budget.mjs src/lib/site/media.ts src/lib/site/media.test.ts public/site-assets/images/cinematic
  git commit -m "feat: prepare cinematic property media"
  ```

## Task 3: Build a truthful server-side presentation model

**Files:**

- Create: `src/lib/site/types.ts`
- Create: `src/lib/site/presentation.ts`
- Create: `src/lib/site/presentation.test.ts`

- [ ] Write failing tests for `buildLandingPresentation(stayData)` covering:

  - Featured apartments remain in stored order.
  - When no apartment is featured, all apartments are returned in stored order.
  - Chapter values come from `Apartment`: name, slug, price, guests, size, rating, review count, location, cover, and gallery.
  - Public copy contains none of these case-insensitive terms: `Next.js`, `Google prijava`, `admin`, `Booking.com sync`, `kanal menadžment`, `channel management`.
  - Rating copy is derived from stored rating/review count and does not invent a guest quotation.

- [ ] Run the test and confirm the missing-module failure:

  ```powershell
  npm test -- src/lib/site/presentation.test.ts
  ```

- [ ] Define exact presentation types in `src/lib/site/types.ts`:

  ```ts
  export type ApartmentChapter = {
    id: string;
    slug: string;
    name: string;
    statement: string;
    location: string;
    pricePerNight: number;
    guests: number;
    size: number;
    rating: number;
    reviewCount: number;
    mobileImage: string;
    desktopImage: string;
    gallery: string[];
  };

  export type LandingPresentation = {
    city: string;
    propertyName: string;
    arrivalLine: string;
    introduction: string;
    chapters: ApartmentChapter[];
    materialFacts: Array<{ value: string; label: string }>;
    neighborhood: Array<{ label: string; distance: string }>;
    trust: Array<{ rating: number; reviewCount: number; apartmentName: string }>;
  };
  ```

- [ ] Implement `buildLandingPresentation` as a pure function. Use `cinematicMedia` only as an art-directed fallback mapping; never change or write `StayData`. Use Serbian Latin guest-facing copy focused on sleep, light, location, arrival, and space. Do not create testimonial quotes because the current data model stores ratings but no review body.

- [ ] Run focused tests:

  ```powershell
  npm test -- src/lib/site/presentation.test.ts src/lib/site/media.test.ts
  ```

  Expected: all assertions pass.

- [ ] Commit the presentation layer:

  ```powershell
  git add src/lib/site/types.ts src/lib/site/presentation.ts src/lib/site/presentation.test.ts
  git commit -m "feat: add public cinematic presentation model"
  ```

## Task 4: Replace the template styling with a scoped public design system

**Files:**

- Modify: `src/app/(public)/(site)/site-globals.css`
- Modify: `src/app/(public)/(site)/layout.tsx`
- Create: `src/components/site/shared/EditorialPageIntro.tsx`
- Create: `src/components/site/shared/EditorialPageIntro.module.css`
- Create: `src/components/site/shared/EditorialPageIntro.test.tsx`

- [ ] Write `EditorialPageIntro.test.tsx` first. Render kicker, title, description, and optional image; assert one `h1`, readable text, and correct image alt.

- [ ] Replace the six legacy imports in `site-globals.css` with public tokens and base rules. The file must define:

  ```css
  :root {
    --site-ink: #090b0d;
    --site-bone: #f1ede4;
    --site-smoke: #9ca0a5;
    --site-cobalt: #315cff;
    --site-amber: #d8a15b;
    --site-line: rgb(241 237 228 / 18%);
    --site-gutter: clamp(1rem, 4vw, 5rem);
    --site-section: clamp(5rem, 12vw, 12rem);
    --site-radius-small: 0.35rem;
    --site-font-display: var(--font-instrument), Georgia, serif;
    --site-font-ui: Geist, Arial, sans-serif;
  }
  ```

  Add a `.site-app` isolation root, typography, focus-visible rings, button/link resets, safe-area helpers, and `@media (prefers-reduced-motion: reduce)`. Do not import Bootstrap, `main.css`, `extra.css`, or public icon-font styles. Do not define `:hover` selectors.

- [ ] Update the site layout to load `Instrument_Serif` through `next/font/google`, keep Geist as the interface font, and wrap only the site routes in `.site-app`. Do not change `SessionProvider`, root app composition, auth lookup, or role calculation.

- [ ] Implement `EditorialPageIntro` as semantic server-renderable markup with an optional `<Image>`, no client directive, and no animation responsibility.

- [ ] Run tests and a targeted style scan:

  ```powershell
  npm test -- src/components/site/shared/EditorialPageIntro.test.tsx
  rg "bootstrap|min\.css|main\.css|extra\.css|:hover" 'src/app/(public)/(site)/site-globals.css'
  ```

  Expected: test passes and `rg` returns no matches.

- [ ] Commit the base visual system:

  ```powershell
  git add 'src/app/(public)/(site)/site-globals.css' 'src/app/(public)/(site)/layout.tsx' src/components/site/shared
  git commit -m "feat: establish cinematic public design system"
  ```

## Task 5: Add capability-aware motion infrastructure

**Files:**

- Create: `src/components/site/motion/capabilities.ts`
- Create: `src/components/site/motion/capabilities.test.ts`
- Create: `src/components/site/motion/MotionProvider.tsx`
- Create: `src/components/site/motion/MotionProvider.test.tsx`
- Create: `src/components/site/motion/useCinematicScene.ts`
- Modify: `src/app/(public)/(site)/layout.tsx`

- [ ] Write table-driven tests for this exact pure API:

  ```ts
  export type MotionMode = 'static' | 'native' | 'cinematic';

  export function selectMotionMode(input: {
    width: number;
    reducedMotion: boolean;
    saveData: boolean;
    hardwareConcurrency: number;
  }): MotionMode;
  ```

  Expected cases: reduced motion and data saver return `static`; widths below 768 return `native`; 768-1023 returns `native`; desktop with fewer than four logical processors returns `native`; capable width 1024+ returns `cinematic`.

- [ ] Add `canUseWebGL()` tests for missing canvas context and successful `webgl2` context. WebGL must never be allowed unless `MotionMode` is `cinematic`.

- [ ] Implement `capabilities.ts` without touching the DOM at module import time.

- [ ] Write `MotionProvider.test.tsx` first. Assert that children render in every mode, the root receives `data-motion-mode`, and reduced-motion never initializes Lenis.

- [ ] Implement `MotionProvider` as a client component and context. On mount it reads width, `prefers-reduced-motion`, `navigator.connection?.saveData`, and `navigator.hardwareConcurrency`. In `cinematic` mode only, dynamically import `lenis`, connect its RAF to `requestAnimationFrame`, and destroy/cancel on cleanup. Do not use Lenis below 1024px.

- [ ] Implement `useCinematicScene(ref, createTimeline)` so components dynamically import `gsap` and `gsap/ScrollTrigger`, register the plugin once in the browser, scope animation with `gsap.context`, and revert/kills ScrollTriggers on cleanup. Return without importing animation code in `static` mode.

- [ ] Wrap site children with `MotionProvider` inside the `.site-app` root.

- [ ] Verify:

  ```powershell
  npm test -- src/components/site/motion
  ```

  Expected: all capability, provider, and cleanup assertions pass.

- [ ] Commit motion infrastructure:

  ```powershell
  git add src/components/site/motion 'src/app/(public)/(site)/layout.tsx'
  git commit -m "feat: add capability-aware motion runtime"
  ```

## Task 6: Build the cinematic header, fullscreen menu, and stable booking entry

**Files:**

- Create: `src/components/site/booking/BookingEntry.tsx`
- Create: `src/components/site/booking/BookingEntry.module.css`
- Create: `src/components/site/cinematic/CinematicHeader.tsx`
- Create: `src/components/site/cinematic/CinematicHeader.module.css`
- Create: `src/components/site/cinematic/CinematicHeader.test.tsx`
- Modify: `src/app/(public)/(site)/layout.tsx`
- Delete after replacement: `src/components/site/SiteHeader.tsx`

- [ ] Write header tests first with mocked `usePathname`. Cover logo destination, menu open/close, `Escape`, `aria-expanded`, active route, account/admin/sign-in destination derived from existing props, and a visible `Proveri dostupnost` link. Assert that every navigation target is available without pointer hover.

- [ ] Implement `BookingEntry` as a plain link with variants `edge`, `menu`, and `mobile-bar`. It accepts `href` and `label`; it owns no date state and makes no API call.

- [ ] Implement `CinematicHeader` with the existing `PropertyProfile`, `userName`, and `roles` props. Preserve this route selection exactly:

  ```ts
  const isAdmin = roles.includes('admin');
  const accountHref = userName ? (isAdmin ? '/admin' : '/account') : '/sign-in';
  ```

  Use a real button for the menu, a `role="dialog"` fullscreen sheet with `aria-modal="true"`, focus restoration to the trigger, `Escape` close, route-change close, and body scroll locking only while open. The mobile booking bar becomes visible after the hero emits `site:arrival-complete`.

- [ ] Style states with base, `[aria-current="page"]`, `[aria-expanded="true"]`, `:focus-visible`, and `:active`. Do not add hover transforms, magnetic cursor effects, or cursor-follow behavior.

- [ ] Replace `SiteHeader` in the site layout, then remove the old file only after TypeScript confirms no imports remain:

  ```powershell
  rg "SiteHeader" src
  npm test -- src/components/site/cinematic/CinematicHeader.test.tsx
  npx tsc --noEmit
  ```

  Expected: only `CinematicHeader` remains, tests pass, TypeScript exits 0.

- [ ] Commit header and booking entry:

  ```powershell
  git add src/components/site/booking src/components/site/cinematic/CinematicHeader.tsx src/components/site/cinematic/CinematicHeader.module.css src/components/site/cinematic/CinematicHeader.test.tsx 'src/app/(public)/(site)/layout.tsx' src/components/site/SiteHeader.tsx
  git commit -m "feat: add cinematic public navigation"
  ```

## Task 7: Implement Scene 01-02 arrival and signature interior transition

**Files:**

- Create: `src/components/site/cinematic/HeroSequence.tsx`
- Create: `src/components/site/cinematic/HeroSequence.module.css`
- Create: `src/components/site/cinematic/HeroSequence.test.tsx`
- Create: `src/components/site/cinematic/HeroTransitionCanvas.tsx`
- Create: `src/components/site/cinematic/ScrollProgress.tsx`
- Create: `src/components/site/cinematic/ScrollProgress.module.css`

- [ ] Write hero tests first. In static mode, assert that property name, arrival line, `Scroll to enter`, image alt, and apartment link are all in normal DOM order. Assert canvas is absent in static/native mode and that media failure leaves a readable CSS fallback.

- [ ] Implement the server-visible hero structure before animation:

  ```tsx
  <section aria-labelledby="arrival-title" className={styles.sequence}>
    <div className={styles.arrival}>
      <picture>{/* authored mobile and desktop WebP sources */}</picture>
      <div className={styles.scrim} />
      <p className={styles.eyebrow}>{city} · Srbija</p>
      <h1 id="arrival-title">{arrivalLine}</h1>
      <p className={styles.scrollCue}>Scroll to enter</p>
    </div>
    <div className={styles.entry}>{/* first apartment name and route */}</div>
  </section>
  ```

- [ ] Add the GSAP timeline only through `useCinematicScene`: image scale `1.08 -> 1`, 6-12% layered parallax, a restrained clip-path reveal, and text crossing behind one architectural mask. Desktop sequence length is 180vh; tablet/mobile stay in normal flow with no long pin.

- [ ] Implement `HeroTransitionCanvas` as an isolated enhancement. Dynamically import `three` only after `MotionMode === 'cinematic'` and `canUseWebGL()` succeeds. Render two textured planes with a small displacement shader driven from 0 to 1 by the hero timeline. Cap device pixel ratio at 1.5. On texture load, context creation, or shader failure, remove the canvas and keep the CSS crossfade. Dispose textures, geometry, material, renderer, and RAF on cleanup.

- [ ] Implement `ScrollProgress` as an `aria-hidden` visual progress rail plus a screen-reader text label updated at scene boundaries, not on every frame.

- [ ] Dispatch `site:arrival-complete` once progress reaches the end of Scene 01 so the mobile booking bar can appear.

- [ ] Verify focused behavior:

  ```powershell
  npm test -- src/components/site/cinematic/HeroSequence.test.tsx
  npx tsc --noEmit
  ```

- [ ] Commit Scenes 01-02:

  ```powershell
  git add src/components/site/cinematic/HeroSequence* src/components/site/cinematic/HeroTransitionCanvas.tsx src/components/site/cinematic/ScrollProgress*
  git commit -m "feat: build cinematic arrival sequence"
  ```

## Task 8: Implement Scene 03 apartment chapters

**Files:**

- Create: `src/components/site/cinematic/ApartmentChapters.tsx`
- Create: `src/components/site/cinematic/ApartmentChapters.module.css`
- Create: `src/components/site/cinematic/ApartmentChapters.test.tsx`

- [ ] Write tests first. Render three chapters and assert all names, prices, capacities, locations, images, and detail links are present before enhancement. In reduced-motion mode, assert every chapter remains in normal document flow. In cinematic mode, mock the scene hook and assert one scoped timeline is registered and cleaned up.

- [ ] Implement a semantic ordered list with one article per apartment. Make the entire explicit action link at least 44px tall. Do not make hidden image layers the only source of content.

- [ ] Desktop `min-width: 1024px`: one 320vh bounded section, pinned internal stage, vertical progress controlling horizontal chapter movement and image-mask crossfades. Update active `aria-current` only at discrete chapter boundaries.

- [ ] Tablet and mobile: stacked full-width chapters, native scroll, short intersection-triggered opacity/transform entry only, no horizontal overflow and no section pinned longer than one viewport.

- [ ] Use `formatCurrency` for price and stored presentation props for all facts. Do not use hover to reveal metadata.

- [ ] Verify:

  ```powershell
  npm test -- src/components/site/cinematic/ApartmentChapters.test.tsx
  rg "hover:|group-hover|:hover" src/components/site/cinematic/ApartmentChapters*
  ```

  Expected: tests pass and no hover matches.

- [ ] Commit Scene 03:

  ```powershell
  git add src/components/site/cinematic/ApartmentChapters*
  git commit -m "feat: add scroll-directed apartment chapters"
  ```

## Task 9: Complete Scenes 04-07 and compose the landing page

**Files:**

- Create: `src/components/site/cinematic/MaterialDetails.tsx`
- Create: `src/components/site/cinematic/MaterialDetails.module.css`
- Create: `src/components/site/cinematic/LocationStory.tsx`
- Create: `src/components/site/cinematic/LocationStory.module.css`
- Create: `src/components/site/cinematic/ReviewSequence.tsx`
- Create: `src/components/site/cinematic/ReviewSequence.module.css`
- Create: `src/components/site/cinematic/BookingPortal.tsx`
- Create: `src/components/site/cinematic/BookingPortal.module.css`
- Create: `src/components/site/cinematic/LandingSections.test.tsx`
- Create: `src/components/site/cinematic/SiteFooter.tsx`
- Create: `src/components/site/cinematic/SiteFooter.module.css`
- Modify: `src/app/(public)/(site)/page.tsx`
- Modify: `src/app/(public)/(site)/layout.tsx`
- Delete after replacement: `src/components/site/SiteFooter.tsx`
- Delete after replacement: `src/components/site/ApartmentCard.tsx`

- [ ] Write `LandingSections.test.tsx` first. Assert material facts, every neighborhood label/distance, all rating/review-count facts, contact actions, and final booking link render. Assert there is no fabricated quote markup (`blockquote`) because review bodies are not stored.

- [ ] Implement Scene 04 `MaterialDetails` as alternating real close crops and large factual type. Desktop may use a short bounded pin and foreground/background parallax; mobile remains an editorial list.

- [ ] Implement Scene 05 `LocationStory` from `property.neighborhood`, address, and `googleMapsUrl`. Use one deliberate location line and direct external map action with `target="_blank"` plus `rel="noreferrer"`. Do not add an unverified map API or stock city imagery.

- [ ] Implement Scene 06 `ReviewSequence` from ratings and review counts only. Present one apartment trust fact at a time on desktop and all facts in order on reduced motion/mobile. Never manufacture guest names or quotations.

- [ ] Implement Scene 07 `BookingPortal` as stable arrival/departure/guest controls that navigate to the selected apartment route with query parameters. In this phase, they do not call the reservation API and do not claim live availability.

- [ ] Redesign the footer as quiet end credits: property name, city, phone, email, address, apartment routes, account route, and copyright. Remove framework, admin tooling, login implementation, and Booking.com/channel-management marketing copy. Keep `/admin` accessible only through the existing authenticated account/header path, not as public marketing navigation.

- [ ] Rewrite the home page as a server component:

  ```tsx
  export default async function HomePage() {
    const data = await readStayData();
    const presentation = buildLandingPresentation(data);

    return (
      <>
        <HeroSequence presentation={presentation} />
        <ApartmentChapters chapters={presentation.chapters} />
        <MaterialDetails facts={presentation.materialFacts} />
        <LocationStory property={data.property} />
        <ReviewSequence items={presentation.trust} />
        <BookingPortal apartments={presentation.chapters} />
      </>
    );
  }
  ```

- [ ] Replace the footer import in layout. Remove the old footer and card only after confirming no imports remain:

  ```powershell
  rg "SiteFooter|ApartmentCard" src
  npm test -- src/components/site/cinematic/LandingSections.test.tsx
  npx tsc --noEmit
  ```

- [ ] Commit the complete landing narrative:

  ```powershell
  git add src/components/site/cinematic 'src/app/(public)/(site)/page.tsx' 'src/app/(public)/(site)/layout.tsx' src/components/site/SiteFooter.tsx src/components/site/ApartmentCard.tsx
  git commit -m "feat: complete cinematic landing narrative"
  ```

## Task 10: Redesign the apartment index and detail gallery

**Files:**

- Create: `src/components/site/cinematic/EditorialApartmentIndex.tsx`
- Create: `src/components/site/cinematic/EditorialApartmentIndex.module.css`
- Create: `src/components/site/cinematic/EditorialApartmentIndex.test.tsx`
- Create: `src/components/site/cinematic/EditorialGallery.tsx`
- Create: `src/components/site/cinematic/EditorialGallery.module.css`
- Create: `src/components/site/cinematic/EditorialGallery.test.tsx`
- Modify: `src/app/(public)/(site)/apartments/page.tsx`
- Modify: `src/app/(public)/(site)/apartments/[slug]/page.tsx`
- Delete after replacement: `src/components/site/PageHero.tsx`

- [ ] Write index tests first: every apartment is a full-width article with image, name, location, price, capacity, rating, and route. Assert no two-column card class or hover-only content.

- [ ] Implement `EditorialApartmentIndex` with alternating image/text composition on desktop and stacked chapters on mobile. Use short per-row reveals, never a 300vh landing-style pin on this route.

- [ ] Write gallery tests first: all images have alt text and remain in DOM; mobile controls are buttons with names `Prethodna fotografija` and `Sledeća fotografija`; reduced motion disables scroll-directed transforms.

- [ ] Implement `EditorialGallery`. Desktop uses one bounded sticky image stage with a semantic thumbnail/index list; mobile uses scroll snap plus explicit previous/next tap buttons. Do not depend on swipe alone and do not animate the adjacent booking form.

- [ ] Replace `PageHero` with `EditorialPageIntro` on both routes. Apartment detail order must be: full-bleed opening, compact facts, editorial gallery, description, amenities/rules, rating proof, stable booking form.

- [ ] Preserve `notFound`, slug lookup, data loading, `formatCurrency`, and the exact `BookingRequestForm` apartment prop.

- [ ] Verify:

  ```powershell
  npm test -- src/components/site/cinematic/EditorialApartmentIndex.test.tsx src/components/site/cinematic/EditorialGallery.test.tsx
  rg "PageHero|ApartmentCard" 'src/app/(public)/(site)' src/components/site
  npx tsc --noEmit
  ```

  Expected: tests pass and old public primitives have no references.

- [ ] Commit apartment routes:

  ```powershell
  git add src/components/site/cinematic/EditorialApartmentIndex* src/components/site/cinematic/EditorialGallery* 'src/app/(public)/(site)/apartments' src/components/site/PageHero.tsx
  git commit -m "feat: redesign public apartment stories"
  ```

## Task 11: Restyle the booking form without changing booking behavior

**Files:**

- Move: `src/components/site/BookingRequestForm.tsx` to `src/components/site/booking/BookingRequestForm.tsx`
- Create: `src/components/site/booking/BookingRequestForm.module.css`
- Create: `src/components/site/booking/BookingRequestForm.test.tsx`
- Modify: `src/app/(public)/(site)/apartments/[slug]/page.tsx`

- [ ] Before moving the component, write a behavior test around its current contract. Mock `fetch`, fill all fields, submit, and assert exactly:

  ```ts
  expect(fetch).toHaveBeenCalledWith('/api/stay/reservations', expect.objectContaining({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }));
  ```

  Parse the request body and assert `apartmentId`, contact fields, dates, numeric guests, calculated total, `source: 'direct'`, and `status: 'pending'` remain unchanged.

- [ ] Add visible `<label>` elements connected with `htmlFor`/`id` for name, email, phone, guests, check-in, check-out, and notes. Preserve input types, constraints, state, endpoint, payload, success/error strings, and total calculation.

- [ ] Apply a calm, opaque, high-contrast panel with no glass blur, no decorative animation, no hover effect, and no movement while fields are focused. Use `aria-live="polite"` for submission status and `aria-busy` while loading.

- [ ] Move the file, update the detail-page import, and run:

  ```powershell
  npm test -- src/components/site/booking/BookingRequestForm.test.tsx
  npx tsc --noEmit
  ```

  Expected: behavior and accessibility tests pass.

- [ ] Commit only form presentation paths:

  ```powershell
  git add src/components/site/BookingRequestForm.tsx src/components/site/booking/BookingRequestForm* 'src/app/(public)/(site)/apartments/[slug]/page.tsx'
  git commit -m "feat: align booking form with cinematic design"
  ```

## Task 12: Redesign availability, contact, and account pages

**Files:**

- Create: `src/components/site/shared/PublicInformationLayout.tsx`
- Create: `src/components/site/shared/PublicInformationLayout.module.css`
- Create: `src/components/site/shared/PublicInformationLayout.test.tsx`
- Modify: `src/app/(public)/(site)/availability/page.tsx`
- Modify: `src/app/(public)/(site)/contact/page.tsx`
- Modify: `src/app/(public)/(site)/account/page.tsx`

- [ ] Write shared-layout tests first. Cover intro, primary content, aside, actions, semantic heading order, and stacked mobile rendering.

- [ ] Implement `PublicInformationLayout` as an editorial two-zone layout with no motion around private/account data. Use it as a compositional primitive, not a generic rounded card.

- [ ] Availability: replace template classes and technical copy with clear guest-facing availability language while preserving the current store read, reservation sort, filtering, and route targets. Do not change availability logic in this task.

- [ ] Privacy checkpoint: the current page exposes guest names and reservation dates. Because the approved scope excludes data-behavior changes, do not silently redesign that leak into a permanent feature. Record it as a release-blocking follow-up and obtain separate authorization before replacing names with neutral `Zauzeto` periods or changing the public data projection.

- [ ] Contact: compose address, phone, email, external map action, and neighborhood distances as one editorial scene. Preserve existing values and links. Remove copy about future integrations and implementation setup.

- [ ] Account: preserve unauthenticated redirect, email matching, admin-link condition, reservation formatting, and totals. Remove public-facing explanation of auth internals; stop all cinematic transforms before account data begins.

- [ ] Verify:

  ```powershell
  npm test -- src/components/site/shared/PublicInformationLayout.test.tsx
  npx tsc --noEmit
  ```

- [ ] Commit public information routes:

  ```powershell
  git add src/components/site/shared/PublicInformationLayout* 'src/app/(public)/(site)/availability/page.tsx' 'src/app/(public)/(site)/contact/page.tsx' 'src/app/(public)/(site)/account/page.tsx'
  git commit -m "feat: redesign public information pages"
  ```

## Task 13: Visually align sign-in without changing providers or authorization

**Files:**

- Modify: `src/app/(public)/(auth)/layout.tsx`
- Create: `src/app/(public)/(auth)/auth-public.css`
- Modify: `src/app/(public)/(auth)/components/views/SignInPageView.tsx`
- Modify: `src/app/(public)/(auth)/components/ui/SignInPageTitle.tsx`
- Modify: `src/@auth/forms/AuthJsProviderSelect.tsx`
- Create: `src/app/(public)/(auth)/components/views/SignInPageView.test.tsx`

- [ ] Write the sign-in view test first. Assert property-facing Serbian title/copy, logo route to `/`, provider controls, credential form presence when configured, and no technical `AUTH_ADMIN_EMAILS` explanation.

- [ ] Give auth routes an `.auth-public` root with the same ink/bone/cobalt tokens and Instrument Serif/Geist pairing. Use a still interior panel, not an animated credential surface. Keep the form readable at 320px width.

- [ ] Replace the Fuse marketing panel with a single real property image, concise welcome copy, a home link, and the existing `AuthJsForm`. Do not change `AuthGuardRedirect`, `signIn`, provider IDs, callback behavior, credentials behavior, or `authJsProviderMap`.

- [ ] In `AuthJsProviderSelect`, translate visible labels and remove provider-specific hover color transformations. Keep base, focus-visible, disabled, and active states. Do not add a custom OAuth implementation.

- [ ] Run:

  ```powershell
  npm test -- 'src/app/(public)/(auth)/components/views/SignInPageView.test.tsx'
  npx tsc --noEmit
  ```

- [ ] Commit only sign-in presentation files:

  ```powershell
  git add 'src/app/(public)/(auth)/layout.tsx' 'src/app/(public)/(auth)/auth-public.css' 'src/app/(public)/(auth)/components/views/SignInPageView.tsx' 'src/app/(public)/(auth)/components/ui/SignInPageTitle.tsx' src/@auth/forms/AuthJsProviderSelect.tsx 'src/app/(public)/(auth)/components/views/SignInPageView.test.tsx'
  git commit -m "feat: align sign-in with public art direction"
  ```

## Task 14: Correct public language, metadata, and interaction semantics

**Files:**

- Modify: `src/app/layout.tsx`
- Modify: `src/app/(public)/(site)/layout.tsx`
- Create: `src/app/(public)/(site)/loading.tsx`
- Create: `src/app/(public)/(site)/not-found.tsx`
- Create: `src/components/site/shared/PublicShell.test.tsx`

- [ ] Write tests or static assertions for `lang="sr-Latn"`, one main landmark, skip link destination, guest-facing title/description, visible focus states, and no artificial loader timeout.

- [ ] Change the root document language from `en` to `sr-Latn`. Rewrite metadata description to hospitality copy. Keep domain/metadataBase work for the production/domain phase because the domain is not yet known.

- [ ] Add a first-focusable skip link to `#main-content` and give the site `<main>` that id. Ensure the header, main, and footer landmarks are not nested incorrectly.

- [ ] Create a CSS-only loading composition whose visibility reflects actual route loading. It must not use timers, artificial minimum duration, or looping decorative motion under reduced motion.

- [ ] Create a public 404 aligned with the new visual system and direct actions to `/` and `/apartments`; do not change global admin error behavior.

- [ ] Run the copy and hover scans:

  ```powershell
  rg -n -i "next\.js|google prijava|booking\.com sync|channel management|kanal menad|admin panel" 'src/app/(public)' src/components/site
  rg -n "hover:|group-hover|:hover" 'src/app/(public)/(site)' src/components/site
  ```

  Expected: no public marketing copy matches and no hover-only style utilities/selectors remain. Auth provider names such as Google may appear only as the provider's actual sign-in label.

- [ ] Run tests and type checking:

  ```powershell
  npm test -- src/components/site/shared/PublicShell.test.tsx
  npx tsc --noEmit
  ```

- [ ] Commit shell semantics:

  ```powershell
  git add src/app/layout.tsx 'src/app/(public)/(site)/layout.tsx' 'src/app/(public)/(site)/loading.tsx' 'src/app/(public)/(site)/not-found.tsx' src/components/site/shared/PublicShell.test.tsx
  git commit -m "feat: finish public shell semantics"
  ```

## Task 15: Add end-to-end, responsive, accessibility, and fallback coverage

**Files:**

- Create: `tests/e2e/public-navigation.spec.ts`
- Create: `tests/e2e/public-responsive.spec.ts`
- Create: `tests/e2e/public-accessibility.spec.ts`
- Create: `tests/e2e/public-visual-checkpoints.spec.ts`

- [ ] Write `public-navigation.spec.ts` to verify:

  - Home renders all seven labelled scenes.
  - Menu opens, closes with Escape, and navigates to every public route.
  - Each apartment chapter opens its detail route.
  - Browser back/forward does not leave a pinned/transformed shell.
  - Booking entry reaches an existing apartment/booking route.
  - No page depends on hover before its action is visible.

- [ ] Write `public-responsive.spec.ts` using viewports `390x844`, `768x1024`, `1440x1000`, and `1920x1080`. For every public route assert:

  ```ts
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
  ```

  On mobile also assert no canvas exists, no pinned section exceeds one viewport, menu tap targets are at least 44px, and the bottom booking action respects safe-area padding.

- [ ] Write `public-accessibility.spec.ts` with `@axe-core/playwright`. Scan `/`, `/apartments`, one apartment detail, `/availability`, and `/contact`; fail on serious or critical violations. Add manual assertions for heading order, dialog name, keyboard focus return, link names, form labels, and `prefers-reduced-motion`.

- [ ] Write `public-visual-checkpoints.spec.ts`. Capture full-page and scene start/mid/end screenshots at all four target viewports into Playwright attachments. Do not commit platform-specific golden diffs in the first pass; use attachments for design review.

- [ ] Add explicit fallback cases:

  - `page.emulateMedia({ reducedMotion: 'reduce' })` shows all content in order.
  - Canvas context failure keeps hero images and routes visible.
  - Aborted later-scene images do not break navigation or collapse layout.
  - JavaScript-disabled context renders complete server HTML and usable links.

- [ ] Install browser once and run the suite:

  ```powershell
  npx playwright install chromium
  npm run test:e2e
  ```

  Expected: all public E2E tests pass in desktop Chromium and the configured mobile project.

- [ ] Commit E2E coverage:

  ```powershell
  git add tests/e2e
  git commit -m "test: cover cinematic public experience"
  ```

## Task 16: Final performance, visual, and regression gate

**Files:**

- Modify only if a measured failure requires it: public redesign files from Tasks 2-15
- Update: `docs/superpowers/plans/2026-08-10-cinematic-public-redesign.md` checkboxes

- [ ] Run the complete automated gate:

  ```powershell
  npm run media:budget
  npm test
  npm run test:e2e
  npx tsc --noEmit
  npm run lint
  npm run build
  git diff --check
  ```

  Expected: media budget, unit tests, E2E, type checking, build, and diff check pass. Lint has zero errors and does not add warnings beyond the recorded baseline.

- [ ] Inspect the Next build output. Confirm GSAP/Lenis/Three are not part of static public HTML, Three is a separate lazy chunk, and the landing's initial client JavaScript stays within 180 KB gzipped beyond shared framework code. If it exceeds budget, remove initial imports and re-run before proceeding.

- [ ] Record a Chrome performance trace at `390x844` with mid-range mobile throttling and at `1440x1000` desktop. Confirm target LCP `<= 2.5s`, CLS `< 0.1`, no long animation task repeatedly blocks scroll, and later-scene media loads progressively.

- [ ] Complete manual visual review at `390x844`, `768x1024`, `1440x1000`, and `1920x1080`:

  - Seven landing scenes read as one continuous narrative.
  - Desktop has one hero/interior signature transition and one vertical-to-horizontal apartment sequence.
  - Mobile preserves the art direction without long locks or overflow.
  - Typography crops are intentional and body copy stays readable.
  - Booking form and account/auth surfaces stay stable.
  - No action or content appears only on hover.

- [ ] Complete keyboard-only and reduced-motion passes across every public route. Confirm focus is never trapped outside the open menu and is restored on close.

- [ ] Re-run the public copy scan and explicitly list the availability privacy leak, broken/missing production auth configuration, booking-flow gaps, admin gaps, security findings, SEO/domain, analytics, and deployment as the next production phase. Do not claim production readiness from a visual-redesign completion.

- [ ] Mark every completed checkbox in this plan, inspect the final scope, and commit only redesign files:

  ```powershell
  git status --short
  git diff --stat
  git add docs/superpowers/plans/2026-08-10-cinematic-public-redesign.md
  git commit -m "docs: record cinematic redesign verification"
  ```

## Definition of done

- All seven landing scenes exist and preserve semantic, server-rendered content.
- Desktop cinematic motion is progressive enhancement; mobile/reduced-motion/static fallbacks are complete.
- Public template/Bootstrap styling and technical marketing copy are gone from the redesigned routes.
- There are no hover-dependent effects.
- Existing routes, form payload, auth behavior, admin behavior, stay store, and APIs remain unchanged.
- Unit, E2E, accessibility, responsive, fallback, build, and media-budget checks pass.
- Performance targets are measured, not assumed.
- Remaining booking/auth/admin/privacy/security/production work is handed off explicitly as the next phase.
