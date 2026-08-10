# Cinematic Public Redesign Design

**Status:** Approved by the user on 2026-08-10; implementation plan drafted for execution review.

**Project:** Stan na Dan Nis

**Design direction:** 2.5D Director's Cut

## Objective

Replace the current template-like public experience with a cinematic, scroll-directed hospitality site that feels closer to an interactive film title sequence than a conventional hotel brochure. The redesign must make the apartments and Nis feel desirable before it asks the visitor to book.

This is the first production phase. It changes the public visual system, storytelling, navigation, layout, copy, and motion. It preserves the existing booking, authentication, reservation, admin, and API behavior until their later production phases.

## Scope Boundaries

### Included

- Public home page and its complete scroll narrative.
- Public header, fullscreen navigation, footer, and persistent booking entry points.
- Apartments listing and apartment detail visual redesign.
- Availability and contact visual redesign without changing their underlying data behavior.
- Account and sign-in visual alignment, while preserving current authentication behavior.
- Responsive layouts for mobile, tablet, laptop, and large desktop.
- Reduced-motion alternatives and keyboard-visible interaction states.
- Guest-facing copy rewrite that removes implementation and channel-management language.
- Removal of public-facing Bootstrap/template visual patterns from the redesigned surface.

### Excluded

- Booking workflow changes, payments, transactional email, and availability logic changes.
- Google OAuth configuration or authorization changes.
- Admin information architecture and operational feature changes.
- Database, API, Booking.com synchronization, and production-security work.
- Full 3D apartment tours, continuous WebGL worlds, autoplay sound, or cursor-follow effects.
- Deployment, domain, analytics, SEO, and production environment work.

These excluded items remain required later. The only urgent exception is a separate, minimal privacy hotfix if publicly exposed guest data must be removed before the redesign is complete.

## Experience Principles

1. **Scroll is the director.** Vertical scroll advances scenes, framing, transitions, and narrative. It must never feel like a slideshow attached to a page.
2. **Photography is the interface.** Large imagery, controlled crops, depth, and light replace repeated cards and icon grids.
3. **Cinematic does not mean slow.** No forced splash duration, no blocked navigation, and no decorative animation on form controls.
4. **No hover choreography.** The site uses scroll progress, press states, focus states, tap, and direct navigation. Essential information never depends on hover.
5. **Mobile is an authored version.** Mobile keeps the atmosphere and narrative but removes desktop-only scroll pinning and GPU-heavy layers that create jank.
6. **The UI stays quiet.** Booking controls, navigation, and readable content remain stable while the surrounding scenes move.
7. **Real property, not AI fantasy.** Current real apartment photography is used for the first pass. New property photography can replace it later without changing the layouts.

## Visual Language

### Palette

- **Ink:** near-black background for transitions, menus, and cinematic framing.
- **Bone:** warm off-white for display typography and quiet surfaces.
- **Smoke:** cool gray for secondary text and inactive states.
- **Electric cobalt:** the single high-energy accent, derived from the existing blue interior light.
- **Warm amber:** restricted to interior-light highlights and status emphasis, never used as a generic luxury-gold theme.

No purple gradients, translucent glass cards, ornamental glow orbs, heavy shadows, or repeated rounded containers.

### Typography

- Instrument Serif is the display face for large statements, apartment names, and narrative lines.
- Geist remains the interface face for navigation, prices, metadata, fields, and buttons.
- Display text may crop against the viewport or image edges on desktop, but body copy must retain a readable line length.
- Mobile headlines are recomposed into shorter lines rather than mechanically scaled desktop headings.

### Images and Texture

- Images use consistent color grading: deeper blacks, restrained saturation, warm interiors, and clean skin-neutral whites.
- Crops prioritize architectural lines and depth rather than showing every room at once.
- Film grain and light-leak effects must use real raster/video assets, not CSS noise or fabricated vector decoration.
- Every above-the-fold image has an explicit responsive size and focal point.

## Motion System

### Technology Direction

- GSAP and ScrollTrigger orchestrate pinned scenes, scroll progress, masks, and coordinated timelines through package imports.
- Lenis provides smooth scrolling only on desktop viewports of 1024px and above when reduced motion is not requested. Tablet and mobile use native scrolling.
- Mobile uses native scrolling and lighter progress-driven transforms.
- A small, isolated WebGL transition layer may be used only for the Scene 02 hero-to-interior transition on capable desktop devices. Apartment-to-apartment transitions use GSAP image masks and crossfades.
- Every WebGL effect has a CSS/image fallback. WebGL is enhancement, never navigation or content infrastructure.

### Motion Vocabulary

- Image scale from 1.08 to 1.0 during scene arrival.
- Clip-path or mask reveals that expose the next scene from architectural edges.
- Controlled 6-12% parallax travel between foreground, subject, and background layers.
- Typography entering from behind images or viewport masks.
- Crossfades and displacement only between related photographic scenes.
- Vertical scroll temporarily driving a horizontal gallery inside one clearly bounded pinned section.
- Scene progress indicator instead of scroll-jacking or invisible navigation.

### Motion Constraints

- Transform and opacity are preferred over layout-affecting animation.
- There is no looping decorative motion while the user is reading or completing a form.
- `prefers-reduced-motion` disables pinning, parallax, displacement, and animated text masks, leaving an ordered static page.
- A slow device, data-saver mode, or WebGL failure receives the static fallback automatically.
- Loading animation reflects real asset readiness and has no artificial minimum duration.

## Landing Storyboard

### Scene 01: Arrival

A near-black opening frame resolves into a full-viewport sequence made from the current real property stills. The component is structured to accept a short muted property video later, but no generated or stock footage is required for the first pass. The wordmark and one concise guest-facing statement appear through a restrained mask reveal. The only instruction is `Scroll to enter`. A discreet menu control and `Proveri dostupnost` action remain fixed near the viewport edges.

The existing copy about Google login, Booking.com sync, the number of reservations, and the technology stack is removed from the public home page.

### Scene 02: Enter the Space

The first 160-200vh scroll sequence slowly advances into the apartment. Background, subject, and foreground move at different depths. The display line passes behind an architectural edge before resolving into the first apartment name.

This is the first signature transition and the only place where an optional WebGL displacement effect is required on capable desktop devices.

### Scene 03: Three Stays, Three Moods

A 300-360vh pinned sequence introduces the three apartments. Scroll progress changes the active apartment, large image, color temperature, name, price, capacity, and location note. The transition feels like moving between film chapters rather than changing cards.

Each chapter has a visible tap/click target leading to the existing apartment detail route. No information appears only on hover.

Desktop uses layered horizontal movement controlled by vertical scroll. Mobile renders the same chapters as full-width vertical scenes with short crossfades and no long pin.

### Scene 04: Material Details

Close crops of fabric, light, kitchen, workspace, and exterior details alternate with large typographic facts such as `32 m2`, `self check-in`, and `300 m od centra`. Amenities are editorial annotations, not an icon-card grid.

### Scene 05: Nis After Dark

The site shifts from the apartment to its city context. A restrained map or location line appears alongside real local imagery and travel times. The sequence communicates the fortress, city center, river, food, and practical arrival context without becoming a tourist-directory grid.

### Scene 06: Guest Proof

One review at a time appears as large editorial typography while slow photographic transitions continue behind it. Rating and review count remain visible as compact trust metadata. There is no generic testimonial carousel.

### Scene 07: Booking Portal

The story visually closes around a stable booking entry panel with arrival, departure, guests, and the `Proveri dostupnost` action. In this phase the control links to the existing booking or apartment route; it does not change reservation behavior.

On mobile, the persistent bottom booking bar appears only after the opening scene so it does not compete with the arrival moment.

## Global Navigation

- Desktop starts with a compact transparent header that becomes a solid high-contrast bar only when content underneath requires it.
- Mobile uses a clear menu button and a fullscreen menu sheet with large destinations and a persistent booking action.
- The menu does not animate on pointer hover. Open, close, focus, and route-change transitions are the only navigation motion.
- The current logo is used until the owner supplies a replacement brand asset; logo redesign is outside this phase. It is displayed without the current oversized banner-like treatment.
- Active route, keyboard focus, and pressed states are explicit.

## Public Page System

### Apartments Listing

- Large editorial index rather than a two-column card grid.
- Each apartment receives a distinct full-width photographic row or scene.
- Price, capacity, location, and a direct detail action stay immediately readable.
- On mobile, scenes become stacked visual chapters with no lateral overflow.

### Apartment Detail

- Full-bleed opening image and compact facts above the fold.
- Gallery becomes a scroll-directed sequence on desktop and swipe/tap gallery on mobile.
- Description, amenities, rules, and guest proof use the same editorial rhythm as the landing page.
- The existing booking form remains functionally unchanged and becomes a visually calm, stable panel. The form itself receives no cinematic animation.

### Availability

- The page receives the new typography, spacing, navigation, imagery, and interaction states.
- Its current data behavior is unchanged in this design phase except for any separately approved privacy hotfix.

### Contact

- Location imagery, direct phone/email actions, address, and neighborhood facts are composed as one editorial contact scene.
- Map and external-location actions are visibly distinct and keyboard accessible.

### Account and Sign-In

- These pages adopt the palette, typography, logo scale, fields, and navigation language.
- Cinematic motion stops before credentials or account information appears.
- Existing authentication behavior is preserved for the later auth phase.

## Component Boundaries

- `CinematicHeader`: navigation state, menu sheet, and booking entry.
- `ScrollProgress`: scene progress and reduced-motion fallback.
- `HeroSequence`: arrival and enter-the-space sequence.
- `ApartmentChapters`: apartment scene data and scroll/tap navigation.
- `EditorialGallery`: reusable detail and listing gallery behavior.
- `LocationStory`: Nis imagery, distances, and map treatment.
- `ReviewSequence`: one-review-at-a-time narrative presentation.
- `BookingEntry`: stable route entry that does not own booking business logic.
- `MotionProvider`: GSAP/Lenis lifecycle, capability detection, and cleanup.
- `ReducedMotionLayout`: static ordered presentation of the same content.

Each component owns one visual responsibility. Apartment and property data continue to come from the existing stay store and types; motion components receive normalized presentation props and do not fetch or mutate data.

## Data Flow

1. Server components read property and apartment data through the existing store.
2. Server-rendered semantic content is passed into focused client motion components.
3. Motion components enhance existing HTML after hydration; content and navigation remain usable before enhancement.
4. Booking actions continue to navigate to existing routes or forms.
5. Reduced-motion and capability checks select the appropriate presentation without altering route or content data.

## Error and Fallback Behavior

- Missing image: use another real image from the same apartment gallery; never show a generic decorative placeholder.
- Failed video: fall back to its poster image.
- Failed WebGL initialization: use a CSS crossfade and mask reveal.
- JavaScript disabled or hydration delayed: show complete server-rendered content in normal document order.
- Motion timeline cleanup: all observers, RAF loops, ScrollTriggers, and Lenis instances are destroyed on route change.
- Empty featured-apartment set: show all active apartments in their stored order.
- Slow connection: prioritize the first visual and load later scene assets progressively.

## Responsive Rules

### Mobile: 320-767px

- Native vertical scrolling.
- No section pinned longer than one viewport.
- No continuous WebGL canvas.
- Shorter copy and fewer simultaneous layers.
- Fullscreen menu and bottom booking action use safe-area insets.
- Tap targets are at least 44px.

### Tablet: 768-1023px

- Selective short pinning is allowed.
- Horizontal gallery movement is reduced.
- WebGL remains disabled by default.

### Desktop: 1024px and above

- Complete pinned narrative, layered depth, horizontal gallery section, and enhanced image transitions.
- Content width and display-type crops adapt up to ultrawide screens without stretching photography.

## Accessibility

- Document language changes to Serbian Latin when the public copy is Serbian.
- Semantic heading order is preserved through every animated scene.
- All controls work by keyboard and show a visible focus state.
- Animation never changes the DOM reading order.
- Text remains readable over images through deliberate scrims or alternate placement, not dynamic contrast guesses.
- Reduced-motion mode provides the same content and calls to action.
- Auto-playing visual media is muted, non-essential, and pausable when longer than a brief transition.

## Performance Budget

- Public landing initial JavaScript target: no more than 180KB gzipped beyond framework-shared code.
- Initial above-the-fold media target: no more than 1.5MB on desktop and 800KB on mobile.
- Only the hero media is eager; later scene media loads near its scene.
- WebGL and smooth-scroll code load only on supported desktop devices.
- Target LCP is 2.5 seconds or better on a representative mid-range mobile profile.
- Target CLS is below 0.1.
- Animation must sustain visually smooth scrolling without long main-thread tasks during ordinary use.

## Copy Direction

Guest-facing copy speaks about place, atmosphere, sleep, arrival, location, and confidence. It does not mention the framework, Google authentication, admin tooling, Booking.com synchronization, operational dashboards, or channel management.

Headlines are short and cinematic. Body copy is factual and specific. Claims about ratings, distances, and amenities must come from stored property data or verified source material.

## Verification Strategy

### Visual

- Compare implementation screenshots against the approved visual storyboard at 390x844, 768x1024, 1440x1000, and 1920x1080.
- Inspect every scene at its start, midpoint, and end scroll progress.
- Check the mobile design independently instead of treating it as a scaled desktop page.

### Interaction

- Verify menu open/close, route navigation, scroll progress, apartment chapter selection, gallery navigation, and booking entry.
- Verify back/forward navigation and restoration do not leave pinned or transformed content in a broken state.
- Verify no essential interaction depends on hover.

### Motion and Fallbacks

- Test reduced-motion mode.
- Test with WebGL disabled.
- Test slow media, missing media, and JavaScript-disabled server rendering.
- Confirm route changes clean up all animation resources.

### Accessibility and Performance

- Keyboard-only pass for all public routes.
- Automated accessibility scan plus manual heading, focus, and contrast review.
- Lighthouse and browser performance trace on desktop and mobile before visual handoff.

## Acceptance Criteria

- The landing reads as one continuous cinematic scroll narrative with seven distinct scenes.
- The current template/card aesthetic is absent from redesigned public routes.
- Desktop includes one signature hero/interior transition and one vertical-to-horizontal apartment sequence.
- Mobile retains the same art direction without long scroll locks, overflow, or header breakage.
- There are no hover-dependent effects or controls.
- All current public routes and booking entry points continue to work.
- Reduced-motion and WebGL-failure presentations remain complete and attractive.
- Public copy contains no implementation, admin, or channel-management marketing language.
- The performance budget and responsive verification targets are met before the redesign is accepted.

## Subsequent Design-First Work

After this public redesign is accepted, the next visual subproject is the admin and booking-interface redesign. Production auth, booking logic, database, privacy, synchronization, and release engineering follow only after the complete visual redesign phase, except for a separately authorized emergency privacy fix.
